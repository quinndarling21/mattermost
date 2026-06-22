import {execFileSync} from 'node:child_process';

const MAX_GIT_BUFFER = 64 * 1024 * 1024;

export function git(args: string[], cwd: string): string {
    return execFileSync('git', args, {
        cwd,
        encoding: 'utf8',
        maxBuffer: MAX_GIT_BUFFER,
    });
}

export function getRepoRoot(): string {
    try {
        return git(['rev-parse', '--show-toplevel'], process.cwd()).trim();
    } catch {
        return process.cwd();
    }
}

export function getChangedFiles(repoRoot: string, base: string, head: string): string[] {
    const out = git(['diff', '--name-only', '--diff-filter=ACMR', `${base}...${head}`], repoRoot).trim();
    if (!out) {
        return [];
    }
    return out.split('\n').map((line) => line.trim()).filter(Boolean);
}

export function getDiff(repoRoot: string, base: string, head: string): string {
    return git(['diff', '--diff-filter=ACMR', `${base}...${head}`], repoRoot);
}

export function hasDocsChanges(repoRoot: string): boolean {
    const out = git(['status', '--porcelain', '--', 'docs'], repoRoot).trim();
    return out.length > 0;
}
