import { execFileSync, spawnSync } from "node:child_process";

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

/** True when the given tracked path differs from HEAD in the index or working tree. */
export function hasChanges(repoRoot: string, relPath: string): boolean {
    const result = spawnSync("git", ["diff", "--quiet", "HEAD", "--", relPath], { cwd: repoRoot });
    if (result.status === 0) {
        return false;
    }
    if (result.status === 1) {
        return true;
    }
    return false;
}
