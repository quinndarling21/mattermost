import { appendFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import type { ComplianceReport, ReportStatus, Severity, Violation } from "./types.js";

const HEADING = "## Cursor rules compliance";

export interface ReportPaths {
    dir: string;
    json: string;
    md: string;
}

export function resolveReportPaths(outputDir: string): ReportPaths {
    mkdirSync(outputDir, { recursive: true });
    return {
        dir: outputDir,
        json: join(outputDir, "report.json"),
        md: join(outputDir, "report.md"),
    };
}

// ---------------------------------------------------------------------------
// GitHub Actions helpers (no-ops outside CI)
// ---------------------------------------------------------------------------
export function ghSummary(text: string): void {
    if (process.env.GITHUB_STEP_SUMMARY) {
        appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${text}\n`);
    }
}

export function ghOutput(key: string, value: string): void {
    if (process.env.GITHUB_OUTPUT) {
        appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`);
    }
}

function ghEscape(value: string): string {
    return value.replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");
}

// ---------------------------------------------------------------------------
// Normalisation
// ---------------------------------------------------------------------------
function asString(value: unknown, fallback: string): string {
    return typeof value === "string" && value.length > 0 ? value : fallback;
}

function normalizeViolation(raw: unknown): Violation {
    const v = (raw ?? {}) as Record<string, unknown>;
    const severity: Severity = v.severity === "info" ? "info" : "warning";
    const line = typeof v.line === "number" ? v.line : null;
    return {
        file: asString(v.file, "?"),
        line,
        rule: asString(v.rule, "?"),
        severity,
        title: asString(v.title, asString(v.detail, "Cursor rule issue")),
        detail: asString(v.detail, ""),
        suggestion: asString(v.suggestion, ""),
    };
}

/** Coerce arbitrary agent JSON into a well-formed ComplianceReport. */
export function normalizeReport(raw: unknown): ComplianceReport {
    const obj = (raw ?? {}) as Record<string, unknown>;
    const violations = Array.isArray(obj.violations) ? obj.violations.map(normalizeViolation) : [];
    const status: ReportStatus =
        obj.status === "ok" || obj.status === "violations"
            ? obj.status
            : violations.length > 0
              ? "violations"
              : "ok";
    return {
        summary: asString(obj.summary, "Cursor rules compliance report"),
        status,
        violations,
    };
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------
function renderMarkdown(report: ComplianceReport): string {
    const lines: string[] = [HEADING, "", report.summary, ""];
    if (report.violations.length === 0) {
        lines.push("No rule violations detected in the changed files.");
    } else {
        lines.push(
            `Found **${report.violations.length}** potential rule issue(s). These are advisory and do **not** block merge.`,
        );
        lines.push("");
        lines.push("| Severity | File | Rule | Issue | Suggestion |");
        lines.push("| --- | --- | --- | --- | --- |");
        for (const v of report.violations) {
            const loc = v.line !== null ? `${v.file}:${v.line}` : v.file;
            const suggestion = v.suggestion.replace(/\n/g, " ");
            lines.push(`| ${v.severity} | \`${loc}\` | \`${v.rule}\` | ${v.title} | ${suggestion} |`);
        }
    }
    return `${lines.join("\n")}\n`;
}

function emitAnnotations(report: ComplianceReport): void {
    for (const v of report.violations) {
        let loc = "";
        if (v.file) {
            loc = v.line !== null ? `file=${v.file},line=${v.line}` : `file=${v.file}`;
        }
        const prefix = loc ? `${loc},` : "";
        const message = ghEscape(`[${v.rule}] ${v.detail}`);
        // ::warning:: annotations surface in the PR but never fail the job.
        console.log(`::warning ${prefix}title=Cursor rule: ${v.title}::${message}`);
    }
}

// ---------------------------------------------------------------------------
// Public entry points
// ---------------------------------------------------------------------------

/** Write a degraded/skipped report; used whenever the check cannot produce a verdict. */
export function writeEmptyReport(paths: ReportPaths, reason: string): void {
    const report: ComplianceReport = { summary: reason, status: "skipped", violations: [] };
    writeFileSync(paths.json, `${JSON.stringify(report)}\n`);
    writeFileSync(paths.md, `${HEADING}\n\n_${reason}_\n`);
    ghSummary(HEADING);
    ghSummary("");
    ghSummary(`_${reason}_`);
    ghOutput("violation_count", "0");
    ghOutput("status", "skipped");
}

/** Write the full report (JSON + Markdown), emit annotations, job summary, and outputs. */
export function writeReport(paths: ReportPaths, report: ComplianceReport): void {
    const markdown = renderMarkdown(report);
    writeFileSync(paths.json, `${JSON.stringify(report, null, 2)}\n`);
    writeFileSync(paths.md, markdown);
    ghSummary(markdown);
    emitAnnotations(report);
    ghOutput("violation_count", String(report.violations.length));
    ghOutput("status", report.status);
    ghOutput("report_md", paths.md);
    ghOutput("report_json", paths.json);
}
