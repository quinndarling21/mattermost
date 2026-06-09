#!/usr/bin/env -S npx tsx
//
// Advisory, non-blocking Cursor rules compliance check (Cursor SDK).
//
// Evaluates the changed files in a PR (or staged changes locally) against the
// repository's Cursor rules (.cursor/rules/*.mdc) using a one-shot Cursor agent,
// and emits a Markdown + JSON report plus non-blocking GitHub annotations.
//
// The check is intentionally NON-BLOCKING: it exits 0 unless --strict is passed.

import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import type { ModelSelection } from "@cursor/sdk";

import { runComplianceAgent } from "./agent.js";
import { getChangedFiles, getDiff, getRepoRoot, refExists, type DiffMode } from "./git.js";
import { buildPrompt, extractReportJson } from "./prompt.js";
import { normalizeReport, resolveReportPaths, writeEmptyReport, writeReport } from "./report.js";
import { selectApplicableRules } from "./rules.js";

interface CliOptions {
    base: string;
    head: string;
    mode: DiffMode;
    strict: boolean;
}

function log(message: string): void {
    process.stderr.write(`${message}\n`);
}

function usage(): void {
    process.stdout.write(
        `Usage: npm run check -- [options]\n\n` +
            `Evaluate changed files against the repository's Cursor rules using the Cursor\n` +
            `SDK, and emit a non-blocking compliance report.\n\n` +
            `Options:\n` +
            `  --base <ref>   Base git ref to diff against (default: $BASE_REF, origin/master, or HEAD~1)\n` +
            `  --head <ref>   Head git ref to diff (default: HEAD)\n` +
            `  --staged       Check staged changes only (useful for a pre-commit hook)\n` +
            `  --strict       Exit non-zero (1) when violations are found (default: exit 0)\n` +
            `  -h, --help     Show this help\n`,
    );
}

function parseArgs(argv: string[]): CliOptions {
    const options: CliOptions = {
        base: process.env.BASE_REF ?? "",
        head: process.env.HEAD_REF ?? "HEAD",
        mode: "range",
        strict: false,
    };
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        switch (arg) {
            case "--base":
                options.base = argv[++i] ?? "";
                break;
            case "--head":
                options.head = argv[++i] ?? "HEAD";
                break;
            case "--staged":
                options.mode = "staged";
                break;
            case "--strict":
                options.strict = true;
                break;
            case "-h":
            case "--help":
                usage();
                process.exit(0);
                break;
            default:
                log(`Unknown option: ${arg}`);
                usage();
                process.exit(2);
        }
    }
    return options;
}

/** Load CURSOR_API_KEY (and friends) from a local .env when not already set. */
function loadLocalEnv(repoRoot: string): void {
    if (process.env.CURSOR_API_KEY) {
        return;
    }
    const envPath = join(repoRoot, ".env");
    if (existsSync(envPath) && typeof process.loadEnvFile === "function") {
        try {
            process.loadEnvFile(envPath);
        } catch {
            // Best-effort only; the CURSOR_API_KEY guard below handles absence.
        }
    }
}

function resolveModel(): ModelSelection {
    const id = process.env.CURSOR_MODEL?.trim();
    // Model is required for local agents. Override with CURSOR_MODEL (e.g. a
    // repo variable in CI).
    return { id: id && id.length > 0 ? id : "gpt-5.5" };
}

function truncateDiff(diff: string, maxBytes: number): { diff: string; truncated: boolean } {
    const buffer = Buffer.from(diff, "utf8");
    if (buffer.byteLength <= maxBytes) {
        return { diff, truncated: false };
    }
    return { diff: buffer.subarray(0, maxBytes).toString("utf8"), truncated: true };
}

async function main(): Promise<number> {
    const options = parseArgs(process.argv.slice(2));

    const repoRoot = getRepoRoot();
    loadLocalEnv(repoRoot);

    const rulesDir = process.env.RULES_DIR ?? join(repoRoot, ".cursor", "rules");
    const outputDir = process.env.OUTPUT_DIR ?? join(repoRoot, ".cursor-rules-report");
    const maxDiffBytes = Number(process.env.MAX_DIFF_BYTES ?? 120000);
    const paths = resolveReportPaths(outputDir);

    // Resolve the diff base for range mode.
    if (options.mode === "range" && !options.base) {
        options.base = refExists(repoRoot, "origin/master") ? "origin/master" : "HEAD~1";
    }
    log(options.mode === "staged" ? "Diffing staged changes" : `Diffing ${options.base}...${options.head}`);

    const files = getChangedFiles(repoRoot, options.mode, options.base, options.head);
    if (files.length === 0) {
        writeEmptyReport(paths, "No added/modified/renamed files in range — nothing to check.");
        return 0;
    }

    const rules = selectApplicableRules(repoRoot, rulesDir, files);
    if (rules.length === 0) {
        writeEmptyReport(paths, "No Cursor rules apply to the changed files.");
        return 0;
    }
    log(`Changed files: ${files.length}; applicable rules: ${rules.length}`);

    const apiKey = process.env.CURSOR_API_KEY;
    if (!apiKey) {
        writeEmptyReport(paths, "CURSOR_API_KEY not set — skipping Cursor rules check. This is non-blocking.");
        return 0;
    }

    const { diff, truncated } = truncateDiff(getDiff(repoRoot, options.mode, options.base, options.head), maxDiffBytes);
    const prompt = buildPrompt({ rules, files, diff, truncated, maxDiffBytes });
    const model = resolveModel();

    // The agent occasionally returns a non-JSON message; a single retry makes
    // the verdict effectively reliable while staying non-blocking on failure.
    const maxAttempts = Math.max(1, Number(process.env.CURSOR_RULES_ATTEMPTS ?? 2));
    let parsed: unknown;
    let failureReason = "agent produced no valid JSON";
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        log(`Invoking Cursor agent (one-shot, plan mode) — attempt ${attempt}/${maxAttempts}...`);
        const outcome = await runComplianceAgent({ prompt, cwd: repoRoot, apiKey, model });

        if (outcome.text !== undefined) {
            writeFileSync(join(paths.dir, "agent-output.txt"), outcome.text);
        }

        if (outcome.ok) {
            parsed = extractReportJson(outcome.text ?? "");
            if (parsed !== undefined) {
                break;
            }
            log("Agent finished but produced no valid JSON verdict.");
        } else {
            failureReason = outcome.reason ?? failureReason;
            log(`Agent did not produce a verdict: ${failureReason}`);
            if (outcome.retryable === false) {
                break;
            }
        }
    }

    if (parsed === undefined) {
        writeEmptyReport(paths, `Cursor rules check could not run (${failureReason}). This is non-blocking.`);
        return options.strict ? 1 : 0;
    }

    const report = normalizeReport(parsed);
    writeReport(paths, report);
    log(`Done. Violations: ${report.violations.length}. Report: ${paths.md}`);

    return options.strict && report.violations.length > 0 ? 1 : 0;
}

main()
    .then((code) => process.exit(code))
    .catch((err) => {
        // A crash here must never block a merge; surface it and exit 0.
        log(`cursor-rules-check crashed: ${err instanceof Error ? err.stack ?? err.message : String(err)}`);
        process.exit(0);
    });
