import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

export interface RuleFile {
    /** Absolute path to the .mdc file. */
    path: string;
    /** Path relative to the repo root, for display in the prompt/report. */
    relPath: string;
    content: string;
}

/**
 * Read a single scalar field from a .mdc file's YAML-ish frontmatter (the block
 * delimited by the first two `---` lines). Mirrors the subset Cursor rules use:
 * `description`, `globs`, `alwaysApply`.
 */
export function readFrontmatterField(content: string, field: string): string | undefined {
    const lines = content.split(/\r?\n/);
    if (lines[0] !== "---") {
        return undefined;
    }
    for (let i = 1; i < lines.length; i++) {
        if (lines[i] === "---") {
            break;
        }
        const match = lines[i].match(new RegExp(`^${field}\\s*:\\s*(.*)$`));
        if (match) {
            return match[1].trim();
        }
    }
    return undefined;
}

/**
 * Translate a Cursor rule glob (e.g. `webapp/**`) into an anchored RegExp.
 * `**` collapses to `*`, and a single `*` spans path separators — matching the
 * permissive behaviour of the original bash `[[ ]]` glob comparison.
 */
function globToRegExp(glob: string): RegExp {
    const normalized = glob.trim().replace(/^\.\//, "").replace(/\*\*/g, "*");
    let pattern = "";
    for (const ch of normalized) {
        if (ch === "*") {
            pattern += ".*";
        } else if (ch === "?") {
            pattern += ".";
        } else {
            pattern += ch.replace(/[.+^${}()|[\]\\]/g, "\\$&");
        }
    }
    return new RegExp(`^${pattern}$`);
}

/**
 * Return the rules that apply to the given changed files: every rule with
 * `alwaysApply: true`, plus any whose `globs:` match at least one changed file.
 */
export function selectApplicableRules(repoRoot: string, rulesDir: string, files: string[]): RuleFile[] {
    let names: string[];
    try {
        names = readdirSync(rulesDir).filter((name) => name.endsWith(".mdc"));
    } catch {
        return [];
    }

    const applicable: RuleFile[] = [];
    for (const name of names.sort()) {
        const path = join(rulesDir, name);
        const content = readFileSync(path, "utf8");
        const always = readFrontmatterField(content, "alwaysApply");
        const globs = readFrontmatterField(content, "globs");

        let include = always === "true";
        if (!include && globs && files.length > 0) {
            const patterns = globs
                .split(",")
                .map((part) => part.trim())
                .filter(Boolean)
                .map(globToRegExp);
            include = files.some((file) => patterns.some((pattern) => pattern.test(file)));
        }

        if (include) {
            applicable.push({ path, relPath: relative(repoRoot, path), content });
        }
    }
    return applicable;
}
