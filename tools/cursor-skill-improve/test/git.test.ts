import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

import { hasChanges } from "../src/git.js";

function git(cwd: string, args: string[]): void {
    execFileSync("git", args, { cwd, encoding: "utf8" });
}

test("hasChanges detects staged-only changes to the target file", () => {
    const repo = mkdtempSync(join(tmpdir(), "skill-improve-git-"));
    try {
        const relPath = ".cursor/skills/dry-review/SKILL.md";
        const skillPath = join(repo, relPath);
        mkdirSync(join(repo, ".cursor", "skills", "dry-review"), { recursive: true });

        git(repo, ["init", "-b", "main"]);
        git(repo, ["config", "user.name", "Test User"]);
        git(repo, ["config", "user.email", "test@example.com"]);
        writeFileSync(skillPath, "version: 1\n");
        git(repo, ["add", relPath]);
        git(repo, ["commit", "-m", "initial skill"]);

        assert.equal(hasChanges(repo, relPath), false);

        writeFileSync(skillPath, "version: 2\n");
        assert.equal(hasChanges(repo, relPath), true);

        git(repo, ["add", relPath]);
        assert.equal(hasChanges(repo, relPath), true);
    } finally {
        rmSync(repo, { recursive: true, force: true });
    }
});
