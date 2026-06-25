# The Improver — outer self-improvement loop for skills

This is the **outer loop** from `.cursor/self-improvement/PLAN.md`. It turns the
human feedback that an inner-loop agent attracts (👍/👎, replies, label drift,
PR merge-state) into a **reviewed, versioned edit** of the skill that produced
the run — using the [Cursor SDK](https://cursor.com/docs/sdk/typescript).

The inner-loop tools in this repo (`cursor-rules-check`, `cursor-docs-impact`,
Bugbot, Cloud Agents) *do work*. None of them learn from how that work landed.
The Improver closes that gap, and it does so safely: it only ever edits the
target skill's `## Principles (learned)` section, bumps the version, and the
surrounding workflow opens a **draft PR**. It never commits, pushes, merges, or
touches application code.

## How it works

```
stamped inner-loop runs + human feedback (fixture today; GitHub in Phase 1)
        │
        ▼
  summarize → weighted corrections (explicit > implicit)
        │
        ▼
  prompt = improve-skill meta-skill + target skill + corrections
        │
        ▼
  Agent.prompt (agent mode, scoped to the skill file)   ── real run, needs CURSOR_API_KEY
        │
        ▼
  edited SKILL.md + version bump  →  workflow opens a DRAFT PR  →  human merges
```

Design mirrors the repo's other Cursor SDK tools: it **never throws** and
degrades to a green no-op when `CURSOR_API_KEY` is absent.

## Modes

- `--dry-run` — runs the entire deterministic pipeline (load feedback →
  summarize → build the agent prompt → write a report) **without** an API key,
  network, or any file change. The exact prompt a real run would send is written
  to `prompt.txt`. This is the path covered by `npm test` and CI smoke checks.
- real run — with `CURSOR_API_KEY` set and corrections present, invokes the
  agent to edit the skill and bump its version. The workflow turns the change
  into a draft PR.

## Feedback sources

- `--fixture <path>` — read feedback from JSON (deterministic; best for demos).
- no `--fixture` — **live collection** from GitHub (`src/github.ts`): scans
  recently-updated PRs/issues for comments stamped `<!-- skill:NAME@N -->`, reads
  their 👍/👎 reactions and the human replies that follow, and infers PR
  merge-state. Needs `gh` authenticated (`GH_TOKEN` in CI; resolves the repo from
  `$GITHUB_REPOSITORY` or `gh repo view`). Degrades to no records on any error.

## One-command demo

```bash
cd tools/cursor-skill-improve && npm ci
npm run demo            # dry run -> live agent edit -> shows the diff -> restores the file
npm run demo -- --keep  # keep the agent's edit instead of restoring it
```

See `.cursor/self-improvement/DEMO.md` for the full narrated flow.

## Local usage

```bash
cd tools/cursor-skill-improve
npm ci

# Deterministic unit tests (no key, no network):
npm test
npm run typecheck

# Dry run from the bundled fixture:
npm run improve -- --dry-run --fixture fixtures/sample-feedback.json
cat ../../.cursor-skill-improve/report.md

# Real run (edits the skill in your working tree; review the diff before committing):
export CURSOR_API_KEY=...        # or add CURSOR_API_KEY=... to <repo>/.env
npm run improve -- --target dry-review --fixture fixtures/sample-feedback.json

# Fully live (real GitHub feedback): seed signal, then collect it (no --fixture):
scripts/seed-demo-feedback.sh          # needs gh WRITE access
npm run improve -- --dry-run --target dry-review
```

## Configuration

| Variable / flag | Default | Purpose |
| --- | --- | --- |
| `CURSOR_API_KEY` | — | Cursor SDK auth (required for real runs; read from `.env` if unset). |
| `CURSOR_MODEL` | `gpt-5.5` | Model passed to the agent. |
| `--target <skill>` | fixture's `skill` | Skill under `.cursor/skills/` to improve. |
| `--fixture <path>` | — | Read feedback from JSON instead of GitHub (Phase 1 adds live `gh` collection). |
| `--dry-run` | off | Summarize + build the prompt; never call the agent or edit files. |
| `--window-days <n>` | `7` | Feedback window hint surfaced in the report. |
| `--output-dir <path>` | `.cursor-skill-improve` | Where `report.md` / `prompt.txt` go. |

## Feedback fixture shape

See `fixtures/sample-feedback.json`. Each record is one stamped run plus the
signals it attracted; the signal weighting lives in
`.cursor/self-improvement/CONVENTIONS.md`.

## Guardrails

- Opens **draft** PRs only; humans merge. Never auto-merges.
- Edits **only** the target skill file; the prompt forbids touching anything else.
- Treats all feedback text as untrusted data, not instructions.
- One skill per run; scheduled + rate-limited by the workflow.
- No `CURSOR_API_KEY` → no-op. Crashes → exit 0. Always non-blocking.
