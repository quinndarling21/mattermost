#!/usr/bin/env -S npx tsx
//
// The Improver: outer self-improvement loop for Cursor skills (Cursor SDK).
//
// Reads recent stamped inner-loop runs of a skill plus the human feedback they
// attracted, then (in a real run) edits ONLY that skill's `## Principles
// (learned)` section and bumps its version, following the `improve-skill`
// meta-skill. The surrounding workflow turns any change into a DRAFT PR — this
// tool never commits, pushes, merges, or edits anything but the target skill.
//
// Designed like the repo's other Cursor SDK tools: it never throws and degrades
// to a green no-op when CURSOR_API_KEY is absent. A `--dry-run` mode exercises
// the full deterministic pipeline (feedback -> summary -> prompt -> report)
// without an API key, network, or any file changes.

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
    collectFromGitHub,
    loadFixture,
    summarizeFeedback,
    type FeedbackFile,
} from "./feedback.js";
import { getRepoRoot, hasChanges } from "./git.js";
import { buildPrompt } from "./prompt.js";
import { renderReport, writePromptArtifact, writeReport, ghOutput } from "./report.js";
import { readVersion, skillAbsPath, skillRelPath } from "./version.js";

interface CliOptions {
    target?: string;
    fixture?: string;
    dryRun: boolean;
    windowDays: number;
    outputDir: string;
}

function log(message: string): void {
    process.stderr.write(`${message}\n`);
}

function usage(): void {
    process.stdout.write(
        "Usage: npm run improve -- [options]\n\n" +
            "Run the outer self-improvement loop for a Cursor skill.\n\n" +
            "Options:\n" +
            "  --target <skill>     Skill name under .cursor/skills/ (default: fixture's skill)\n" +
            "  --fixture <path>     Read feedback from a JSON fixture instead of GitHub\n" +
            "  --dry-run            Summarize + build the prompt; never call the agent or edit files\n" +
            "  --window-days <n>    Feedback window hint passed through to the report (default: 7)\n" +
            "  --output-dir <path>  Report directory (default: .cursor-skill-improve)\n" +
            "  -h, --help           Show this help\n",
    );
}

function parseArgs(argv: string[]): CliOptions {
    const options: CliOptions = {
        target: process.env.SKILL_TARGET,
        fixture: process.env.FIXTURE,
        dryRun: process.env.DRY_RUN === "1",
        windowDays: Number(process.env.WINDOW_DAYS ?? 7) || 7,
        outputDir: process.env.OUTPUT_DIR ?? ".cursor-skill-improve",
    };
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        switch (arg) {
            case "--target":
                options.target = argv[++i];
                break;
            case "--fixture":
                options.fixture = argv[++i];
                break;
            case "--dry-run":
                options.dryRun = true;
                break;
            case "--window-days":
                options.windowDays = Number(argv[++i] ?? 7) || 7;
                break;
            case "--output-dir":
                options.outputDir = argv[++i] ?? options.outputDir;
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

function loadLocalEnv(repoRoot: string): void {
    if (process.env.CURSOR_API_KEY) {
        return;
    }
    const envPath = join(repoRoot, ".env");
    if (existsSync(envPath) && typeof process.loadEnvFile === "function") {
        try {
            process.loadEnvFile(envPath);
        } catch {
            // The API key guard below handles missing/unreadable env files.
        }
    }
}

function resolveModelId(): string {
    const id = process.env.CURSOR_MODEL?.trim();
    return id && id.length > 0 ? id : "gpt-5.5";
}

async function main(): Promise<number> {
    const options = parseArgs(process.argv.slice(2));
    const repoRoot = getRepoRoot();
    loadLocalEnv(repoRoot);
    const outputDir = join(repoRoot, options.outputDir);

    // Resolve the feedback source: an explicit fixture, or live GitHub (Phase 1).
    let feedback: FeedbackFile;
    if (options.fixture) {
        try {
            feedback = loadFixture(options.fixture);
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            writeReport(outputDir, renderReport({
                target: options.target ?? "unknown",
                mode: "skipped",
                version: null,
                summary: summarizeFeedback([]),
                detail: `Could not read fixture: ${message}`,
            }));
            return 0;
        }
    } else {
        const target = options.target;
        if (!target) {
            writeReport(outputDir, renderReport({
                target: "unknown",
                mode: "skipped",
                version: null,
                summary: summarizeFeedback([]),
                detail: "No --target and no --fixture supplied; nothing to do.",
            }));
            return 0;
        }
        feedback = collectFromGitHub(target);
    }

    const target = options.target ?? feedback.skill;
    const summary = summarizeFeedback(feedback.records);

    // Read the target skill (for its version and to feed the prompt).
    const skillPath = skillAbsPath(repoRoot, target);
    const skillContent = existsSync(skillPath) ? readFileSync(skillPath, "utf8") : "";
    const version = skillContent ? readVersion(skillContent) : null;

    ghOutput("target", target);
    ghOutput("runs", String(summary.runs));
    ghOutput("corrections", String(summary.corrections.length));

    // Build the agent prompt up front so dry runs can surface exactly what a
    // real run would send.
    const metaSkillPath = skillAbsPath(repoRoot, "improve-skill");
    const metaSkill = existsSync(metaSkillPath) ? readFileSync(metaSkillPath, "utf8") : "(improve-skill meta-skill not found)";
    const prompt = buildPrompt({ target, version, metaSkill, skillContent, records: feedback.records, summary });
    writePromptArtifact(outputDir, prompt);

    // Nothing to learn: no corrections means no run is warranted.
    if (summary.corrections.length === 0) {
        writeReport(outputDir, renderReport({ target, mode: options.dryRun ? "dry-run" : "skipped", version, summary, detail: "No corrections in the feedback window; no change proposed." }));
        ghOutput("changed", "false");
        log(`No corrections for ${target}; nothing to do.`);
        return 0;
    }

    if (options.dryRun) {
        writeReport(outputDir, renderReport({ target, mode: "dry-run", version, summary }));
        ghOutput("changed", "false");
        log(`Dry run complete for ${target}: ${summary.corrections.length} correction(s). See ${outputDir}/report.md`);
        return 0;
    }

    const apiKey = process.env.CURSOR_API_KEY;
    if (!apiKey) {
        writeReport(outputDir, renderReport({ target, mode: "skipped", version, summary, detail: "CURSOR_API_KEY not set — skipping the agent run. This is non-blocking." }));
        ghOutput("changed", "false");
        return 0;
    }

    if (!skillContent) {
        writeReport(outputDir, renderReport({ target, mode: "skipped", version, summary, detail: `Skill file not found at ${skillRelPath(target)}.` }));
        ghOutput("changed", "false");
        return 0;
    }

    // Real run: load the SDK lazily so dry-run/skipped paths need no install.
    const { runImproveAgent } = await import("./agent.js");
    log(`Invoking the Improver agent for ${target} (agent mode)...`);
    const outcome = await runImproveAgent({ prompt, cwd: repoRoot, apiKey, model: { id: resolveModelId() } });

    if (!outcome.ok) {
        writeReport(outputDir, renderReport({ target, mode: "skipped", version, summary, detail: `Agent did not complete: ${outcome.reason}` }));
        ghOutput("changed", "false");
        return 0;
    }

    const changed = hasChanges(repoRoot, skillRelPath(target));
    const newVersion = changed ? readVersion(readFileSync(skillPath, "utf8")) : version;
    writeReport(outputDir, renderReport({ target, mode: "applied", version: newVersion ?? version, summary, changed, detail: outcome.text }));
    ghOutput("changed", changed ? "true" : "false");
    log(`Improver finished for ${target}. Changed: ${changed}.`);
    return 0;
}

main()
    .then((code) => process.exit(code))
    .catch((err) => {
        // A crash here must never block the scheduled workflow; surface and exit 0.
        log(`cursor-skill-improve crashed: ${err instanceof Error ? (err.stack ?? err.message) : String(err)}`);
        process.exit(0);
    });
