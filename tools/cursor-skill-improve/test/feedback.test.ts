import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

import { loadFixture, parseMarker, summarizeFeedback } from "../src/feedback.js";

const here = dirname(fileURLToPath(import.meta.url));
const fixturePath = join(here, "..", "fixtures", "sample-feedback.json");

test("parseMarker reads name, version and run id", () => {
    const parsed = parseMarker("<!-- skill:dry-review@2 run:2026-06-24T12:00Z -->");
    assert.deepEqual(parsed, { name: "dry-review", version: 2, runId: "2026-06-24T12:00Z" });
});

test("parseMarker works without a run id", () => {
    const parsed = parseMarker("noise <!-- skill:improve-skill@10 --> more noise");
    assert.deepEqual(parsed, { name: "improve-skill", version: 10, runId: undefined });
});

test("parseMarker returns null when no marker is present", () => {
    assert.equal(parseMarker("just a normal comment"), null);
});

test("loadFixture parses the sample feedback file", () => {
    const file = loadFixture(fixturePath);
    assert.equal(file.skill, "dry-review");
    assert.equal(file.records.length, 3);
    assert.equal(file.records[0].version, 1);
});

test("loadFixture rejects malformed input", () => {
    assert.throws(() => loadFixture(join(here, "feedback.test.ts")));
});

test("summarizeFeedback counts signals and weights corrections", () => {
    const file = loadFixture(fixturePath);
    const summary = summarizeFeedback(file.records);

    assert.equal(summary.runs, 3);
    assert.equal(summary.thumbsUp, 3);
    assert.equal(summary.thumbsDown, 3);
    assert.equal(summary.replyCount, 2);
    assert.equal(summary.closedUnmerged, 1);
    assert.equal(summary.heavyEdits, 1);
    assert.equal(summary.relabels, 0);
    assert.equal(summary.positives, 4);

    // 3 from the closed/👎/reply run + 3 from the heavy-edit/👎/reply run.
    assert.equal(summary.corrections.length, 6);
    // Strongest first; the medium-weight heavy-edit sorts last.
    assert.equal(summary.corrections[0].weight, 3);
    const last = summary.corrections[summary.corrections.length - 1];
    assert.equal(last.weight, 2);
    assert.equal(last.kind, "heavy-edit");
});

test("summarizeFeedback on no records yields no corrections", () => {
    const summary = summarizeFeedback([]);
    assert.equal(summary.runs, 0);
    assert.equal(summary.corrections.length, 0);
    assert.equal(summary.positives, 0);
});
