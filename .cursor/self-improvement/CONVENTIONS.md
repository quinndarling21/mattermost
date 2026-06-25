# Conventions for self-improving skills

These are the formats the self-improvement loop depends on. They are
intentionally small: a version, a place to write learnings, a way to stamp a
run, and a way for humans to push back. See `PLAN.md` for the why.

## 1. Skill / rule versioning

Every skill and rule that participates in the loop carries a `version:` in its
frontmatter. Use a plain integer, bumped by one on every accepted change.

Skill (`.cursor/skills/<name>/SKILL.md`):

```yaml
---
name: dry-review
version: 2
description: ...
---
```

Rule (`.cursor/rules/<name>.mdc`):

```yaml
---
description: ...
globs: webapp/**
alwaysApply: false
version: 1
---
```

The integer is enough to attribute any stamped run to an exact revision. The
Improver bumps it; humans rarely touch it by hand.

## 2. The `## Principles (learned)` section

This is the only section the outer loop edits. Put it near the end of the skill.
Each entry is a principle — *how to think* — with a one-line rationale and a
provenance tag.

```markdown
## Principles (learned)

<!-- improver:managed-section -->
The Improver maintains this section. Each item is a transferable principle, not
a one-off exception. Sharpen, merge, or delete before appending.

- **Prefer reverting an extraction over defending it.** If a reviewer reverts a
  DRY extraction, the abstraction was not earning its keep. _(learned: PR #1234, 2026-06)_
- **Name by domain concept, never by shape.** `ChannelHeaderMenu`, not
  `SharedMenu`. Shape-named helpers get reverted. _(learned: PR #1290, 2026-06)_
```

Rules for this section:

- **Principles, not exceptions.** "Be conservative when the duplication spans
  two product concepts" transfers. "Don't merge files A and B" does not.
- **Bounded.** Sharpen and merge overlapping principles; delete ones the
  evidence stopped supporting. The section is curated, not append-only.
- **Provenance.** Every principle cites where it came from so a human can audit
  it: `(learned: PR #123, 2026-06)` or `(learned: Slack #webapp, 2026-06)`.
- **Managed marker.** The `<!-- improver:managed-section -->` comment tells the
  Improver where it is allowed to write.

## 3. Stamping a run

When an inner-loop agent produces an artifact (a PR comment, an issue comment,
a companion-PR body), it ends with a hidden marker and a feedback footer.

Marker (HTML comment, invisible in rendered Markdown):

```html
<!-- skill:dry-review@2 run:2026-06-24T12:00Z -->
```

- `skill:<name>@<version>` — which skill+version produced this.
- `run:<iso8601>` — when, so the Improver can window recent runs.

Feedback footer (visible, one line):

```markdown
_Was this helpful? 👍 / 👎 below, or reply with a correction — it trains `dry-review`._
```

The marker is how the Improver *finds* past decisions; the footer is how humans
*give* feedback without leaving the tool. The existing CI agents already use
sticky markers (`<!-- cursor-rules-compliance -->`, `<!-- cursor-docs-impact -->`);
Phase 1 extends those to include the `skill:<name>@<version>` form.

## 4. Feedback signals

The Improver reads these per stamped run. Explicit signals outrank implicit ones.

| Weight | Signal | Source |
| --- | --- | --- |
| strong | 👎 reaction, correcting reply | comment reactions / replies |
| strong | agent's companion PR closed unmerged | PR state |
| medium | agent's PR merged after heavy edits | PR diff vs. agent's original |
| medium | issue relabeled away from agent's label | issue events |
| weak | 👍 reaction | comment reactions |
| weak | PR merged as-is | PR state |

A `--fixture` JSON file mirrors this shape for offline runs; see
`tools/cursor-skill-improve/fixtures/sample-feedback.json`.

## 5. The draft-PR contract

Every improvement lands as a **draft** PR that contains exactly three things:

1. **Feedback reviewed** — the runs and signals the Improver looked at.
2. **Principle change** — what it wants to add / sharpen / delete and why.
3. **The diff** — the edit to the skill/rule file plus the version bump.

No other files. No auto-merge. A human reviews it like any other change. This is
the line between "useful self-improvement" and "the agents went off and did
their own thing."
