import { readFileSync } from "node:fs";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** State of an agent-authored companion PR, when the run produced one. */
export type AgentPrState = "merged" | "merged_with_edits" | "closed_unmerged" | "open" | "none";

/** Raw human reaction to a single stamped inner-loop run. */
export interface RunSignals {
    thumbsUp: number;
    thumbsDown: number;
    /** Free-text correcting replies left by humans. */
    replies: string[];
    agentPrState: AgentPrState;
    /** Agent PR merged but only after substantial human edits. */
    mergedWithHeavyEdits: boolean;
    /** A human moved the issue/PR off the label/decision the agent chose. */
    relabeledAway: boolean;
}

/** One stamped run of an inner-loop skill, plus the feedback it attracted. */
export interface FeedbackRecord {
    /** From the `run:` field of the stamp; an ISO-8601 timestamp. */
    runId: string;
    /** Skill version the run executed under (`skill:NAME@VERSION`). */
    version: number;
    /** Link back to the artifact (PR/issue comment), for the PR body. */
    url: string;
    /** Short human-readable description of what the run did. */
    context: string;
    signals: RunSignals;
}

/** A `--fixture` file, or the result of live collection. */
export interface FeedbackFile {
    skill: string;
    windowDays?: number;
    records: FeedbackRecord[];
}

/** A weighted, human-readable correction extracted from the signals. */
export interface Correction {
    /** Higher = stronger evidence the agent got it wrong. */
    weight: number;
    kind: "reaction" | "reply" | "closed-pr" | "relabel" | "heavy-edit";
    text: string;
    url: string;
    runId: string;
}

export interface FeedbackSummary {
    runs: number;
    thumbsUp: number;
    thumbsDown: number;
    replyCount: number;
    closedUnmerged: number;
    heavyEdits: number;
    relabels: number;
    /** Count of clearly-positive outcomes (👍 or merged as-is). */
    positives: number;
    /** Sorted strongest-first; the raw material for a principle edit. */
    corrections: Correction[];
}

// ---------------------------------------------------------------------------
// Marker parsing
// ---------------------------------------------------------------------------

const MARKER_RE = /skill:([a-z0-9][a-z0-9-]*)@(\d+)(?:\s+run:(\S+))?/i;

/**
 * Parse a stamped-output marker, e.g.
 *   `<!-- skill:dry-review@2 run:2026-06-24T12:00Z -->`
 * Returns `null` when the text carries no recognizable marker.
 */
export function parseMarker(text: string): { name: string; version: number; runId?: string } | null {
    const match = text.match(MARKER_RE);
    if (!match) {
        return null;
    }
    const [, name, versionRaw, runId] = match;
    return { name, version: Number(versionRaw), runId: runId || undefined };
}

// ---------------------------------------------------------------------------
// Fixture loading
// ---------------------------------------------------------------------------

function asSignals(raw: unknown): RunSignals {
    const s = (raw ?? {}) as Record<string, unknown>;
    const states: AgentPrState[] = ["merged", "merged_with_edits", "closed_unmerged", "open", "none"];
    const agentPrState = states.includes(s.agentPrState as AgentPrState) ? (s.agentPrState as AgentPrState) : "none";
    return {
        thumbsUp: Number(s.thumbsUp ?? 0) || 0,
        thumbsDown: Number(s.thumbsDown ?? 0) || 0,
        replies: Array.isArray(s.replies) ? s.replies.map(String) : [],
        agentPrState,
        mergedWithHeavyEdits: Boolean(s.mergedWithHeavyEdits),
        relabeledAway: Boolean(s.relabeledAway),
    };
}

function asRecord(raw: unknown): FeedbackRecord {
    const r = (raw ?? {}) as Record<string, unknown>;
    return {
        runId: typeof r.runId === "string" ? r.runId : "unknown",
        version: Number(r.version ?? 0) || 0,
        url: typeof r.url === "string" ? r.url : "",
        context: typeof r.context === "string" ? r.context : "",
        signals: asSignals(r.signals),
    };
}

/** Read and normalize a feedback fixture from disk. Throws on unreadable/invalid JSON. */
export function loadFixture(path: string): FeedbackFile {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;
    if (typeof parsed.skill !== "string" || !Array.isArray(parsed.records)) {
        throw new Error(`Fixture ${path} must have a string "skill" and an array "records".`);
    }
    return {
        skill: parsed.skill,
        windowDays: typeof parsed.windowDays === "number" ? parsed.windowDays : undefined,
        records: parsed.records.map(asRecord),
    };
}

// ---------------------------------------------------------------------------
// Summarization
// ---------------------------------------------------------------------------

const WEIGHT = { strong: 3, medium: 2, weak: 1 } as const;

/**
 * Reduce raw records to counts plus a weighted, sorted list of corrections.
 * Explicit human corrections (👎, replies, a closed agent PR) outweigh
 * implicit ones (a relabel, a heavily-edited merge). Positive outcomes are
 * counted but never become corrections.
 */
export function summarizeFeedback(records: FeedbackRecord[]): FeedbackSummary {
    const summary: FeedbackSummary = {
        runs: records.length,
        thumbsUp: 0,
        thumbsDown: 0,
        replyCount: 0,
        closedUnmerged: 0,
        heavyEdits: 0,
        relabels: 0,
        positives: 0,
        corrections: [],
    };

    for (const record of records) {
        const { signals } = record;
        summary.thumbsUp += signals.thumbsUp;
        summary.thumbsDown += signals.thumbsDown;
        summary.replyCount += signals.replies.length;

        if (signals.thumbsUp > 0) {
            summary.positives += signals.thumbsUp;
        }
        if (signals.agentPrState === "merged") {
            summary.positives += 1;
        }

        if (signals.thumbsDown > 0) {
            summary.corrections.push({
                weight: WEIGHT.strong,
                kind: "reaction",
                text: `${signals.thumbsDown}× 👎 on ${record.context || record.runId}`,
                url: record.url,
                runId: record.runId,
            });
        }
        for (const reply of signals.replies) {
            summary.corrections.push({
                weight: WEIGHT.strong,
                kind: "reply",
                text: reply,
                url: record.url,
                runId: record.runId,
            });
        }
        if (signals.agentPrState === "closed_unmerged") {
            summary.closedUnmerged += 1;
            summary.corrections.push({
                weight: WEIGHT.strong,
                kind: "closed-pr",
                text: `Agent PR closed unmerged: ${record.context || record.runId}`,
                url: record.url,
                runId: record.runId,
            });
        }
        if (signals.relabeledAway) {
            summary.relabels += 1;
            summary.corrections.push({
                weight: WEIGHT.medium,
                kind: "relabel",
                text: `Human relabeled away from the agent's decision: ${record.context || record.runId}`,
                url: record.url,
                runId: record.runId,
            });
        }
        if (signals.mergedWithHeavyEdits) {
            summary.heavyEdits += 1;
            summary.corrections.push({
                weight: WEIGHT.medium,
                kind: "heavy-edit",
                text: `Merged only after heavy edits: ${record.context || record.runId}`,
                url: record.url,
                runId: record.runId,
            });
        }
    }

    summary.corrections.sort((a, b) => b.weight - a.weight);
    return summary;
}
