import type { RuleFile } from "./rules.js";

export interface PromptInput {
    rules: RuleFile[];
    files: string[];
    diff: string;
    truncated: boolean;
    maxDiffBytes: number;
}

export function buildPrompt(input: PromptInput): string {
    const { rules, files, diff, truncated, maxDiffBytes } = input;
    const lines: string[] = [];

    lines.push("You are a meticulous code reviewer enforcing this repository's Cursor rules.");
    lines.push("Evaluate ONLY the unified diff below against the rules provided.");
    lines.push("");
    lines.push("Strict instructions:");
    lines.push("- Only flag problems introduced or touched by the diff. Ignore pre-existing");
    lines.push("  code that the diff does not change.");
    lines.push("- Be precise and conservative: only report a violation when a specific rule is");
    lines.push("  clearly broken. When unsure, do not report it.");
    lines.push('- Severity must be either "warning" or "info" (this check is non-blocking).');
    lines.push("- For each violation, cite the rule file it comes from.");
    lines.push("- Do NOT modify any files. Respond with the JSON verdict only.");
    lines.push("");
    lines.push("Output ONLY a single JSON object as your final message — no prose before or");
    lines.push("after it, and no Markdown code fences. The JSON MUST match this schema exactly:");
    lines.push("");
    lines.push(
        JSON.stringify(
            {
                summary: "one short sentence describing overall compliance",
                status: "ok | violations",
                violations: [
                    {
                        file: "relative/path",
                        line: "<integer or null>",
                        rule: "<rule file name, e.g. webapp-standards.mdc>",
                        severity: "warning | info",
                        title: "short title (<= 8 words)",
                        detail: "what rule is broken and why, referencing the diff",
                        suggestion: "concrete fix",
                    },
                ],
            },
            null,
            2,
        ),
    );
    lines.push("");
    lines.push('If there are no violations, return an empty "violations" array and status "ok".');
    lines.push("");
    lines.push("===== CURSOR RULES =====");
    for (const rule of rules) {
        lines.push("");
        lines.push(`----- FILE: ${rule.relPath} -----`);
        lines.push(rule.content);
    }
    lines.push("");
    lines.push("===== CHANGED FILES =====");
    lines.push(...files);
    lines.push("");
    lines.push("===== UNIFIED DIFF =====");
    if (truncated) {
        lines.push(`(diff truncated to ${maxDiffBytes} bytes)`);
    }
    lines.push(diff);

    return lines.join("\n");
}

/**
 * Best-effort extraction of the JSON verdict from the agent's final message.
 * Tries the raw text, a fenced ```json block, and the widest `{...}` span.
 */
export function extractReportJson(text: string): unknown | undefined {
    if (!text) {
        return undefined;
    }

    const candidates: string[] = [];
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced) {
        candidates.push(fenced[1]);
    }
    candidates.push(text);
    const first = text.indexOf("{");
    const last = text.lastIndexOf("}");
    if (first !== -1 && last > first) {
        candidates.push(text.slice(first, last + 1));
    }

    for (const candidate of candidates) {
        try {
            return JSON.parse(candidate.trim());
        } catch {
            // try the next candidate
        }
    }
    return undefined;
}
