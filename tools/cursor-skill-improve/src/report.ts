import { appendFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import type { FeedbackSummary } from "./feedback.js";

const HEADING = "## Skill self-improvement";

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

export interface ReportInput {
    target: string;
    /** "dry-run" (no agent, no writes), "skipped" (no key/records), or "applied". */
    mode: "dry-run" | "skipped" | "applied";
    version: number | null;
    summary: FeedbackSummary;
    /** Whether the target skill file actually changed (applied mode). */
    changed?: boolean;
    /** The agent's final text summary (applied mode), or a reason (skipped). */
    detail?: string;
}

export function renderReport(input: ReportInput): string {
    const { target, mode, version, summary, changed, detail } = input;
    const lines: string[] = [HEADING, "", `Target skill: \`${target}\`${version !== null ? ` (currently v${version})` : ""}`, ""];

    lines.push(
        `Feedback window: **${summary.runs}** stamped run(s) — ` +
            `👍 ${summary.thumbsUp} · 👎 ${summary.thumbsDown} · replies ${summary.replyCount} · ` +
            `closed-unmerged ${summary.closedUnmerged} · heavy-edits ${summary.heavyEdits} · relabels ${summary.relabels}`,
    );
    lines.push("");

    if (summary.corrections.length > 0) {
        lines.push("Weighted corrections (strongest first):");
        lines.push("");
        lines.push("| Weight | Kind | Signal |");
        lines.push("| --- | --- | --- |");
        for (const c of summary.corrections.slice(0, 12)) {
            lines.push(`| ${c.weight} | ${c.kind} | ${c.text.replace(/\n/g, " ").slice(0, 160)} |`);
        }
        lines.push("");
    }

    if (mode === "dry-run") {
        const next = version !== null ? version + 1 : null;
        lines.push("**Dry run** — no agent was called and no files were changed.");
        lines.push("");
        lines.push(
            summary.corrections.length > 0
                ? `A real run would feed these corrections to the \`improve-skill\` meta-skill and, if it found a ` +
                      `transferable principle, edit \`${target}\`${next !== null ? ` and bump it to v${next}` : ""}.`
                : "No corrections in the window — a real run would make no change.",
        );
        lines.push("");
        lines.push("The proposed agent prompt was written to `prompt.txt` in this report directory.");
    } else if (mode === "skipped") {
        lines.push(`_${detail ?? "Nothing to do."}_`);
    } else {
        lines.push(changed ? "**The Improver edited the skill.**" : "**No change** — the Improver found nothing durable to learn.");
        if (detail) {
            lines.push("");
            lines.push("<details><summary>Agent report</summary>");
            lines.push("");
            lines.push(detail);
            lines.push("");
            lines.push("</details>");
        }
    }

    lines.push("");
    lines.push("_Self-improvement changes always land as a draft PR for human review — never auto-merged._");
    return `${lines.join("\n")}\n`;
}

export function writeReport(outputDir: string, markdown: string): string {
    mkdirSync(outputDir, { recursive: true });
    const path = join(outputDir, "report.md");
    writeFileSync(path, markdown);
    ghSummary(markdown);
    return path;
}

export function writePromptArtifact(outputDir: string, prompt: string): void {
    mkdirSync(outputDir, { recursive: true });
    writeFileSync(join(outputDir, "prompt.txt"), prompt);
}
