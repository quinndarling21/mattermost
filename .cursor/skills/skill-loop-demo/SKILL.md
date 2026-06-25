---
name: skill-loop-demo
description: Run the self-improvement loop demo end to end without opening a terminal — the agent installs deps if needed, runs the deterministic dry run and the live agent edit, then shows the feedback report and the diff. Use when the user asks to "run the skill loop demo", "demo the self-improving skills", or present how Cursor skills improve themselves.
disable-model-invocation: true
---

# Run the skill self-improvement demo

Use this skill to drive the demo from chat. You (the agent) run the commands and
present the results; the user never opens a terminal. The full narration lives in
`.cursor/self-improvement/DEMO.md`, and the architecture in `PLAN.md`.

## What this demonstrates

The double loop: agents do the work, human feedback is the training signal, and a
scheduled agent retools the skill from that feedback — humans review and merge,
nothing auto-merges.

## Steps

1. **Preconditions.**
   - If `tools/cursor-skill-improve/node_modules` is missing, run:
     `npm --prefix tools/cursor-skill-improve ci`
   - Check whether `CURSOR_API_KEY` is set. If it is not, tell the user only the
     deterministic dry run will execute (the live agent edit is skipped), and that
     setting `CURSOR_API_KEY` enables the live step.

2. **Run the demo — one command.**
   - Default (repeatable; restores the skill afterward):
     `npm --prefix tools/cursor-skill-improve run demo`
   - If the user wants to KEEP the edit (for example to then open a PR):
     `npm --prefix tools/cursor-skill-improve run demo -- --keep`

3. **Present the results.** From the command output, show the user:
   - the **feedback report** (the weighted-corrections table) from the dry run,
   - the **diff** the live agent produced — the sharpened/merged principle and the
     `version: N -> N+1` bump, scoped to the single skill file,
   - the closing note that in CI this same diff becomes a **draft PR** via
     `.github/workflows/skill-self-improve.yml`, which a human reviews.

4. **Offer the fully-live variant.** If the user wants the loop to learn from real
   GitHub reactions instead of the bundled fixture, point them to the
   `skill-loop-seed` skill.

## Guardrails

- The default run restores the skill so the demo is repeatable; only pass
  `--keep` when the user explicitly wants to retain the change.
- Do not commit or push the demo edit unless the user asks.
- This skill only runs the tooling under `tools/cursor-skill-improve`; it does not
  modify application code.
