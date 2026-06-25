import { execFileSync } from "node:child_process";

import { parseMarker, type AgentPrState, type FeedbackFile, type FeedbackRecord } from "./feedback.js";

const MAX_BUFFER = 64 * 1024 * 1024;

// ---------------------------------------------------------------------------
// GitHub object shapes (only the fields we read)
// ---------------------------------------------------------------------------

export interface GhReactions {
    "+1"?: number;
    "-1"?: number;
}

export interface GhComment {
    html_url?: string;
    body?: string;
    created_at?: string;
    user?: { login?: string; type?: string };
    reactions?: GhReactions;
}

export interface GhIssue {
    number: number;
    title?: string;
    state?: string;
    updated_at?: string;
    /** Present (non-null) when the issue is actually a pull request. */
    pull_request?: unknown;
}

/** Shells out to a command and returns stdout; injectable so tests stay offline. */
export type GhRunner = (args: string[]) => string;

function realGh(args: string[]): string {
    return execFileSync("gh", args, { encoding: "utf8", maxBuffer: MAX_BUFFER });
}

// ---------------------------------------------------------------------------
// Pure helpers (unit-tested)
// ---------------------------------------------------------------------------

export function reactionCounts(reactions?: GhReactions): { thumbsUp: number; thumbsDown: number } {
    return { thumbsUp: reactions?.["+1"] ?? 0, thumbsDown: reactions?.["-1"] ?? 0 };
}

/**
 * Heuristic: a human reply is a comment with no HTML marker. Every agent sticky
 * comment in this repo embeds an HTML comment marker (`<!-- skill:... -->`,
 * `<!-- cursor-rules-compliance -->`, etc.), so excluding `<!--` reliably keeps
 * bot chatter out of the "corrections" the Improver learns from.
 */
export function isLikelyHumanReply(body: string): boolean {
    return body.trim().length > 0 && !body.includes("<!--");
}

export interface ThreadMeta {
    number: number;
    title: string;
    prState: AgentPrState;
}

/**
 * Turn one thread's comments into feedback records: for each comment stamped for
 * `skill`, read its reactions and collect the human replies that follow it (up
 * to the next stamped comment).
 */
export function buildRecordsFromThread(skill: string, thread: ThreadMeta, comments: GhComment[]): FeedbackRecord[] {
    const records: FeedbackRecord[] = [];
    for (let i = 0; i < comments.length; i++) {
        const body = comments[i].body ?? "";
        const marker = parseMarker(body);
        if (!marker || marker.name !== skill) {
            continue;
        }

        const replies: string[] = [];
        for (let j = i + 1; j < comments.length; j++) {
            const next = comments[j].body ?? "";
            if (parseMarker(next)) {
                break; // the next stamped run starts; stop attributing replies here
            }
            if (isLikelyHumanReply(next)) {
                replies.push(next.trim().slice(0, 280));
            }
        }

        const { thumbsUp, thumbsDown } = reactionCounts(comments[i].reactions);
        records.push({
            runId: marker.runId ?? comments[i].created_at ?? `${thread.number}#${i}`,
            version: marker.version,
            url: comments[i].html_url ?? "",
            context: `${thread.title} (#${thread.number})`,
            signals: {
                thumbsUp,
                thumbsDown,
                replies,
                agentPrState: thread.prState,
                mergedWithHeavyEdits: false,
                relabeledAway: false,
            },
        });
    }
    return records;
}

// ---------------------------------------------------------------------------
// gh-backed collection
// ---------------------------------------------------------------------------

function parseJson<T>(text: string, fallback: T): T {
    try {
        return JSON.parse(text) as T;
    } catch {
        return fallback;
    }
}

function resolveRepo(gh: GhRunner): string {
    if (process.env.GITHUB_REPOSITORY) {
        return process.env.GITHUB_REPOSITORY;
    }
    const view = parseJson<{ nameWithOwner?: string }>(gh(["repo", "view", "--json", "nameWithOwner"]), {});
    return view.nameWithOwner ?? "";
}

function listIssuesSince(gh: GhRunner, repo: string, sinceIso: string): GhIssue[] {
    const path = `repos/${repo}/issues?state=all&sort=updated&direction=desc&since=${sinceIso}&per_page=100`;
    return parseJson<GhIssue[]>(gh(["api", path]), []);
}

function listComments(gh: GhRunner, repo: string, issueNumber: number): GhComment[] {
    const path = `repos/${repo}/issues/${issueNumber}/comments?per_page=100`;
    return parseJson<GhComment[]>(gh(["api", path]), []);
}

function resolvePrState(gh: GhRunner, repo: string, issueNumber: number): AgentPrState {
    const view = parseJson<{ state?: string; merged?: boolean }>(
        gh(["pr", "view", String(issueNumber), "--repo", repo, "--json", "state,merged"]),
        {},
    );
    if (view.merged || view.state === "MERGED") {
        return "merged";
    }
    if (view.state === "CLOSED") {
        return "closed_unmerged";
    }
    if (view.state === "OPEN") {
        return "open";
    }
    return "none";
}

export interface CollectOptions {
    windowDays?: number;
    /** owner/name; defaults to $GITHUB_REPOSITORY or `gh repo view`. */
    repo?: string;
    /** Injectable runner (tests); defaults to the real `gh`. */
    gh?: GhRunner;
    log?: (message: string) => void;
    /** Cap on threads scanned per run (cost guard). */
    maxThreads?: number;
}

/**
 * Phase 1 live collection: scan recently-updated issues/PRs for comments stamped
 * with the skill's marker, read the human feedback they attracted (reactions and
 * replies), and assemble feedback records. Never throws — any failure (no `gh`,
 * no auth, API error) degrades to an empty record set so the caller no-ops.
 */
export function collectFromGitHub(skill: string, options: CollectOptions = {}): FeedbackFile {
    const log = options.log ?? (() => {});
    const gh = options.gh ?? realGh;
    const windowDays = options.windowDays ?? 7;
    const maxThreads = options.maxThreads ?? 60;

    try {
        const repo = options.repo ?? resolveRepo(gh);
        if (!repo) {
            log("Live collection: could not resolve a repository (set GITHUB_REPOSITORY or authenticate gh).");
            return { skill, windowDays, records: [] };
        }

        const sinceIso = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000).toISOString();
        const issues = listIssuesSince(gh, repo, sinceIso).slice(0, maxThreads);

        const records: FeedbackRecord[] = [];
        for (const issue of issues) {
            const comments = listComments(gh, repo, issue.number);
            const hasStamp = comments.some((c) => {
                const m = parseMarker(c.body ?? "");
                return m !== null && m.name === skill;
            });
            if (!hasStamp) {
                continue;
            }
            const prState = issue.pull_request ? resolvePrState(gh, repo, issue.number) : "none";
            records.push(
                ...buildRecordsFromThread(skill, { number: issue.number, title: issue.title ?? "", prState }, comments),
            );
        }

        log(`Live collection: scanned ${issues.length} thread(s) in ${repo}; found ${records.length} stamped run(s) for "${skill}".`);
        return { skill, windowDays, records };
    } catch (err) {
        log(`Live collection failed (${err instanceof Error ? err.message : String(err)}); returning no records.`);
        return { skill, windowDays, records: [] };
    }
}
