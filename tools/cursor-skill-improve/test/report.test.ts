import test from "node:test";
import assert from "node:assert/strict";

import { summarizeFeedback, type FeedbackRecord } from "../src/feedback.js";
import { renderReport } from "../src/report.js";

const records: FeedbackRecord[] = [
    {
        runId: "r1",
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

test("dry-run report explains no agent was called and a real run would bump version", () => {
    const summary = summarizeFeedback(records);
    const md = renderReport({ target: "dry-review", mode: "dry-run", version: 1, summary });
    assert.match(md, /Dry run/);
    assert.match(md, /bump it to v2/);
    assert.match(md, /Weighted corrections/);
    assert.match(md, /never auto-merged/);
});

test("applied report reflects whether the skill changed", () => {
    const summary = summarizeFeedback(records);
    const changed = renderReport({ target: "dry-review", mode: "applied", version: 2, summary, changed: true, detail: "did a thing" });
    assert.match(changed, /edited the skill/);
    assert.match(changed, /did a thing/);

    const unchanged = renderReport({ target: "dry-review", mode: "applied", version: 1, summary, changed: false });
    assert.match(unchanged, /No change/);
});

test("skipped report surfaces the reason", () => {
    const summary = summarizeFeedback([]);
    const md = renderReport({ target: "dry-review", mode: "skipped", version: 1, summary, detail: "CURSOR_API_KEY not set" });
    assert.match(md, /CURSOR_API_KEY not set/);
});
