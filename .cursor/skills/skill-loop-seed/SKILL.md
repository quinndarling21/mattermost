---
name: skill-loop-seed
description: Seed real GitHub feedback for the self-improvement loop and collect it, so a demo shows the loop learning from genuine reactions. The agent opens a throwaway PR with stamped agent comments plus reactions and a correcting reply, then runs live collection. Use for the "fully live" skill-loop demo. Requires gh with write access.
disable-model-invocation: true
---

# Seed and run the live skill-loop

Use this when the user wants the self-improvement loop to learn from REAL GitHub
feedback rather than the bundled fixture. Pairs with the `skill-loop-demo` skill,
which uses the fixture.

## Preconditions

- `gh` must be authenticated with WRITE access to the repo (a personal token, not
  a read-only CI token). Verify with `gh auth status`. If write access is not
  available, stop and tell the user — the seed step opens a real (throwaway) PR.
- If `tools/cursor-skill-improve/node_modules` is missing, run:
  `npm --prefix tools/cursor-skill-improve ci`

## Steps

1. **Confirm with the user** that this opens a throwaway PR and posts comments on
   it, then proceed.

2. **Seed the feedback.** Run:
   `bash tools/cursor-skill-improve/scripts/seed-demo-feedback.sh`
   Capture the throwaway PR URL and number it prints.

3. **Collect it live — no fixture.** Run:
   `npm --prefix tools/cursor-skill-improve run improve -- --dry-run --target dry-review`
   Show the user the report: the live collector should now find the seeded stamped
   runs with their reactions and the correcting reply.

4. **(Optional) Open a real improvement PR.** Either:
   - GitHub UI: Actions -> "Skill Self-Improvement" -> Run workflow, set
     `dry_run: false`; or
   - locally with `CURSOR_API_KEY` set:
     `npm --prefix tools/cursor-skill-improve run improve -- --target dry-review`
     then review the diff (the scheduled workflow is what opens the draft PR in CI).

5. **Clean up.** When the demo is done, close the throwaway PR — the seed script
   prints the exact command, e.g. `gh pr close <number> --delete-branch`.

## Guardrails

- Only the throwaway PR and its comments are created; never modify application
  code, and never merge anything.
- Never auto-merge an improvement PR — a human reviews it.
