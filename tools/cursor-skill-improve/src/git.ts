import { execFileSync } from "node:child_process";

const MAX_GIT_BUFFER = 64 * 1024 * 1024;

function git(args: string[], cwd: string): string {
    return execFileSync("git", args, { cwd, encoding: "utf8", maxBuffer: MAX_GIT_BUFFER });
}

export function getRepoRoot(): string {
    try {
        return git(["rev-parse", "--show-toplevel"], process.cwd()).trim();
    } catch {
        return process.cwd();
    }
}

/** True when the given repo-relative path has uncommitted changes. */
export function hasChanges(repoRoot: string, relPath: string): boolean {
    try {
        return git(["status", "--porcelain", "--", relPath], repoRoot).trim().length > 0;
    } catch {
        return false;
    }
}
