import test from "node:test";
import assert from "node:assert/strict";

import { bumpVersion, readVersion, skillRelPath } from "../src/version.js";

const withVersion = `---
name: dry-review
version: 3
description: example
---

# Body

text
`;

const noVersion = `---
name: dry-review
description: example
---

# Body
`;

test("skillRelPath builds the canonical path", () => {
    assert.equal(skillRelPath("dry-review"), ".cursor/skills/dry-review/SKILL.md");
});

test("readVersion reads the frontmatter integer", () => {
    assert.equal(readVersion(withVersion), 3);
});

test("readVersion returns null when absent or unframed", () => {
    assert.equal(readVersion(noVersion), null);
    assert.equal(readVersion("# no frontmatter\n"), null);
});

test("bumpVersion increments and preserves the rest of the file", () => {
    const { content, from, to } = bumpVersion(withVersion);
    assert.equal(from, 3);
    assert.equal(to, 4);
    assert.equal(readVersion(content), 4);
    assert.match(content, /# Body/);
    assert.match(content, /name: dry-review/);
});

test("bumpVersion throws when there is no version field", () => {
    assert.throws(() => bumpVersion(noVersion));
});
