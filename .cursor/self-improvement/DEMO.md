# Demo: building a software factory with Cursor

A ~10-minute walkthrough of the self-improvement loop. The story: agents do the
work, the team's normal reactions become a training signal, and a scheduled
agent retools the skills — with humans as the merge gate. See `PLAN.md` for the
full architecture.

## Prereqs

- `CURSOR_API_KEY` set in your shell (for the live agent step).
- Dependencies installed once: `cd tools/cursor-skill-improve && npm ci`.
- For the *fully live* path only: `gh` authenticated with **write** access.

## Fast path (one command)

```bash
cd tools/cursor-skill-improve
npm run demo            # dry run -> live agent edit -> shows the diff -> restores the file
```

Add `--keep` to keep the agent's edit. **Show:** the printed report (weighted
corrections), then the `git diff` where the agent sharpened a principle and
bumped `version: 1 -> 2`.

## Narrated path (for a live audience)

1. **Frame it.** Open `.cursor/self-improvement/PLAN.md`; show the double-loop
   diagram. "Most teams write a prompt once. A factory builds loops."
2. **The substrate.** Open `.cursor/skills/dry-review/SKILL.md`; point at the
   `version:` and the `## Principles (learned)` section. "This is the skill's
   memory; the loop edits only this section."
3. **Dry run (deterministic).**
   ```bash
   npm run improve -- --dry-run --fixture fixtures/sample-feedback.json
   cat ../../.cursor-skill-improve/report.md
   ```
   **Show:** the feedback summary + weighted corrections, and `prompt.txt`
   (exactly what the agent will be asked — transparency).
4. **Live agent run (the wow).**
   ```bash
   npm run improve -- --target dry-review --fixture fixtures/sample-feedback.json
   git diff .cursor/skills/dry-review/SKILL.md
   ```
   **Show:** the agent's `Decision / Principle / Rationale` in the report and the
   diff (sharpen + version bump), scoped to one file.
5. **Governance.** "It's a draft PR in CI, reviewed like any teammate's change —
   never auto-merged." Point at `.github/workflows/skill-self-improve.yml`.

## Fully live path (real GitHub feedback)

Use this when you want the loop to learn from real reactions instead of the
fixture.

```bash
# 1) Seed a throwaway PR with stamped agent comments + 👍/👎 + a reply (needs gh write):
tools/cursor-skill-improve/scripts/seed-demo-feedback.sh

# 2) Collect that real feedback (note: no --fixture):
npm --prefix tools/cursor-skill-improve run improve -- --dry-run --target dry-review

# 3) Open a real improvement PR from GitHub Actions:
#    Actions -> "Skill Self-Improvement" -> Run workflow -> dry_run: false
#    It scans recent PRs/issues for `<!-- skill:dry-review@N -->` comments, reads
#    their reactions/replies, and opens a DRAFT PR with the principle + version bump.
```

**Show:** the draft "improvement PR" GitHub opens, and the skill's git history
(`git log -p .cursor/skills/dry-review/SKILL.md`) — principles accreting over
time with provenance tags. That history is the whole thesis in one screen.

## Talking points

- **Inner loop / outer loop.** Inner = agents doing work (Cloud Agents, the CI
  SDK reviewers/doers, Bugbot). Outer = the Improver retooling the skills.
- **Principles beat rules.** The loop writes *how to think*, not brittle
  one-offs; it sharpens/merges/deletes, so skills don't bloat.
- **Feedback where you already work.** A 👍/👎 or a reply is the training signal —
  no new meeting.
- **Cursor primitives.** Same agents run in the IDE, headless in CI via the
  Cursor SDK, and as Cloud Agents — the factory runs and retools itself, humans
  stay the quality gate, and every change is a reviewed commit in git.
