import test from "node:test";
import assert from "node:assert/strict";

import {
    buildRecordsFromThread,
    collectFromGitHub,
    isLikelyHumanReply,
    reactionCounts,
    type GhComment,
    type GhRunner,
} from "../src/github.js";

test("reactionCounts reads +1/-1 and defaults to zero", () => {
    assert.deepEqual(reactionCounts({ "+1": 3, "-1": 1 }), { thumbsUp: 3, thumbsDown: 1 });
    assert.deepEqual(reactionCounts(undefined), { thumbsUp: 0, thumbsDown: 0 });
});

test("isLikelyHumanReply excludes marker-bearing bot comments", () => {
    assert.equal(isLikelyHumanReply("Please keep these separate."), true);
    assert.equal(isLikelyHumanReply("Note\n<!-- cursor-rules-compliance -->"), false);
    assert.equal(isLikelyHumanReply("   "), false);
});

test("buildRecordsFromThread attributes reactions and the following human reply", () => {
    const comments: GhComment[] = [
        {
            html_url: "https://x/c1",
            created_at: "2026-06-20T10:00:00Z",
            body: "## DRY Review Summary\nExtracted SharedMenu\n<!-- skill:dry-review@1 run:2026-06-20T10:00Z -->",
            reactions: { "+1": 0, "-1": 2 },
        },
        { html_url: "https://x/c2", created_at: "2026-06-20T11:00:00Z", body: "Reverted — shape-named, needed 4 props." },
        { html_url: "https://x/c3", created_at: "2026-06-20T12:00:00Z", body: "bot note\n<!-- cursor-rules-compliance -->" },
    ];
    const records = buildRecordsFromThread("dry-review", { number: 5, title: "Extract menus", prState: "closed_unmerged" }, comments);

    assert.equal(records.length, 1);
    const r = records[0];
    assert.equal(r.version, 1);
    assert.equal(r.signals.thumbsDown, 2);
    assert.deepEqual(r.signals.replies, ["Reverted — shape-named, needed 4 props."]);
    assert.equal(r.signals.agentPrState, "closed_unmerged");
    assert.equal(r.url, "https://x/c1");
    assert.match(r.context, /#5/);
});

test("buildRecordsFromThread ignores comments stamped for a different skill", () => {
    const comments: GhComment[] = [
        { body: "x\n<!-- skill:other-skill@2 -->", reactions: { "-1": 5 } },
    ];
    assert.equal(buildRecordsFromThread("dry-review", { number: 1, title: "t", prState: "open" }, comments).length, 0);
});

function fakeGh(): GhRunner {
    return (args) => {
        if (args[0] === "api" && (args[1] ?? "").startsWith("repos/o/r/issues?")) {
            return JSON.stringify([
                { number: 5, title: "Extract menus", state: "closed", updated_at: "2026-06-20T00:00:00Z", pull_request: {} },
                { number: 9, title: "Unrelated", state: "open", updated_at: "2026-06-21T00:00:00Z" },
            ]);
        }
        if (args[0] === "api" && args[1] === "repos/o/r/issues/5/comments?per_page=100") {
            return JSON.stringify([
                {
                    html_url: "https://x/c1",
                    created_at: "2026-06-20T10:00:00Z",
                    body: "DRY summary\n<!-- skill:dry-review@1 run:2026-06-20T10:00Z -->",
                    reactions: { "+1": 0, "-1": 2 },
                },
                { html_url: "https://x/c2", created_at: "2026-06-20T11:00:00Z", body: "Reverted — keep separate." },
            ]);
        }
        if (args[0] === "api" && args[1] === "repos/o/r/issues/9/comments?per_page=100") {
            return JSON.stringify([{ body: "just a normal discussion comment" }]);
        }
        if (args[0] === "pr" && args[1] === "view") {
            return JSON.stringify({ state: "CLOSED", merged: false });
        }
        return "[]";
    };
}

test("collectFromGitHub assembles records from stamped threads only", () => {
    const file = collectFromGitHub("dry-review", { repo: "o/r", gh: fakeGh(), windowDays: 7 });
    assert.equal(file.skill, "dry-review");
    assert.equal(file.records.length, 1);
    assert.equal(file.records[0].signals.thumbsDown, 2);
    assert.equal(file.records[0].signals.agentPrState, "closed_unmerged");
    assert.deepEqual(file.records[0].signals.replies, ["Reverted — keep separate."]);
});

test("collectFromGitHub degrades to no records when gh throws", () => {
    const throwingGh: GhRunner = () => {
        throw new Error("gh not available");
    };
    const file = collectFromGitHub("dry-review", { repo: "o/r", gh: throwingGh });
    assert.equal(file.records.length, 0);
});
