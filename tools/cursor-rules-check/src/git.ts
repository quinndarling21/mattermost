import { execFileSync } from "node:child_process";

export type DiffMode = "range" | "staged";

// 64 MiB: large PR diffs comfortably exceed the 1 MiB execFileSync default.
const MAX_GIT_BUFFER = 64 * 1024 * 1024;

function git(args: string[], cwd: string): string {
    return execFileSync("git", args, {
        cwd,
        encoding: "utf8",
        maxBuffer: MAX_GIT_BUFFER,
    });
}

export function getRepoRoot(): string {
    try {
        return git(["rev-parse", "--show-toplevel"], process.cwd()).trim();
    } catch {
        return process.cwd();
    }
}

export function refExists(repoRoot: string, ref: string): boolean {
    try {
        git(["rev-parse", "--verify", "-q", `${ref}^{commit}`], repoRoot);
        return true;
    } catch {
        return false;
    }
}

export function getChangedFiles(repoRoot: string, mode: DiffMode, base: string, head: string): string[] {
    const args =
        mode === "staged"
            ? ["diff", "--cached", "--name-only", "--diff-filter=ACMR"]
            : ["diff", "--name-only", "--diff-filter=ACMR", `${base}...${head}`];
    const out = git(args, repoRoot).trim();
    if (!out) {
        return [];
    }
    return out
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
}

export function getDiff(repoRoot: string, mode: DiffMode, base: string, head: string): string {
    const args =
        mode === "staged"
            ? ["diff", "--cached", "--diff-filter=ACMR"]
            : ["diff", "--diff-filter=ACMR", `${base}...${head}`];
    return git(args, repoRoot);
}
