import { join } from "node:path";

/** Repo-relative path to a skill's SKILL.md. */
export function skillRelPath(name: string): string {
    return join(".cursor", "skills", name, "SKILL.md");
}

/** Absolute path to a skill's SKILL.md under a repo root. */
export function skillAbsPath(repoRoot: string, name: string): string {
    return join(repoRoot, skillRelPath(name));
}

/** Extract the frontmatter block (between the first two `---` lines), or null. */
function frontmatter(content: string): { block: string; start: number; end: number } | null {
    const lines = content.split(/\r?\n/);
    if (lines[0] !== "---") {
        return null;
    }
    for (let i = 1; i < lines.length; i++) {
        if (lines[i] === "---") {
            return { block: lines.slice(1, i).join("\n"), start: 0, end: i };
        }
    }
    return null;
}

/** Read the integer `version:` from a skill/rule's frontmatter, or null if absent. */
export function readVersion(content: string): number | null {
    const fm = frontmatter(content);
    if (!fm) {
        return null;
    }
    const match = fm.block.match(/^version:\s*(\d+)\s*$/m);
    return match ? Number(match[1]) : null;
}

export interface VersionBump {
    content: string;
    from: number;
    to: number;
}

/**
 * Increment the frontmatter `version:` by one and return the rewritten content.
 * Throws when the file has no frontmatter or no `version:` field — callers
 * should ensure the skill opted into versioning first.
 */
export function bumpVersion(content: string): VersionBump {
    const current = readVersion(content);
    if (current === null) {
        throw new Error("No integer `version:` field found in frontmatter.");
    }
    const to = current + 1;
    const updated = content.replace(/^(version:\s*)\d+(\s*)$/m, `$1${to}$2`);
    return { content: updated, from: current, to };
}
