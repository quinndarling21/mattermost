import test from "node:test";
import assert from "node:assert/strict";

import { summarizeFeedback, type FeedbackRecord } from "../src/feedback.js";
import { buildPrompt } from "../src/prompt.js";

const records: FeedbackRecord[] = [
    {
        runId: "2026-06-20T10:00:00Z",
        version: 1,
        url: "https://example.test/pr/1",
        context: "extracted SharedMenu",
        signals: {
            thumbsUp: 0,
            thumbsDown: 1,
            replies: ["name too generic"],
            agentPrState: "closed_unmerged",
            mergedWithHeavyEdits: false,
            relabeledAway: false,
        },
    },
];

test("buildPrompt scopes edits to the target skill and embeds feedback", () => {
    const summary = summarizeFeedback(records);
    const prompt = buildPrompt({
        target: "dry-review",
        version: 1,
        metaSkill: "META",
        skillContent: "SKILL BODY",
        records,
        summary,
    });

    assert.match(prompt, /Edit ONLY `\.cursor\/skills\/dry-review\/SKILL\.md`/);
    assert.match(prompt, /bump the frontmatter `version:` from 1 to 2/);
    assert.match(prompt, /Do NOT commit, push, or open a PR/);
    assert.match(prompt, /name too generic/);
    assert.match(prompt, /META/);
    assert.match(prompt, /SKILL BODY/);
    assert.match(prompt, /untrusted data/);
});

test("buildPrompt omits the version-bump line when version is unknown", () => {
    const summary = summarizeFeedback(records);
    const prompt = buildPrompt({ target: "x", version: null, metaSkill: "M", skillContent: "S", records, summary });
    assert.doesNotMatch(prompt, /bump the frontmatter/);
});
