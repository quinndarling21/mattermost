# Cursor Rules Compliance Check

An **advisory, non-blocking** pre-merge check that uses the
[Cursor SDK](https://cursor.com/docs/sdk/typescript) (`@cursor/sdk`) to flag
changes that may break this repository's Cursor rules (`.cursor/rules/*.mdc`)
and the docs they reference (e.g. `webapp/STYLE_GUIDE.md`).

The goal is to keep our Cursor rules *maintained and enforced* without gating
merges on a probabilistic model: violations are surfaced loudly (PR annotations,
a sticky PR comment, and a job summary) but never turn the check red.

## Why the Cursor SDK?

Our rules are written in natural language ("prefer shared components", "use
semantic HTML", "always import via the full package name"). A regex/linter
cannot reason about most of them. The SDK runs the same models that power the
editor against the PR diff plus the rule text, so the checks are genuinely
intelligent and stay in sync with the rules as they evolve.

We use the SDK's one-shot entry point (`Agent.prompt`) in **plan mode**, which
is read-only — the reviewer agent analyses the diff and returns a verdict but
cannot modify repository files. Compared to shelling out to the headless CLI,
the SDK gives us proper lifecycle management (no process-babysitting), typed
results, and a clean split between *startup* failures (`CursorAgentError`) and
*run* failures (`status !== "finished"`) — all mapped to a graceful,
non-blocking degraded report.

## How it works

```
changed files (git diff)
        │
        ├─ match against rule globs/alwaysApply  ──►  applicable .mdc rules
        │
        ▼
  prompt = rules + diff  ──►  Agent.prompt (plan mode)  ──►  JSON verdict
        │
        ▼
  report.md  +  ::warning:: annotations  +  sticky PR comment  +  job summary
```

The entry point (`src/index.ts`):

1. Computes the changed files for the PR (or staged changes locally).
2. Selects which rules apply, using each rule's `globs:` / `alwaysApply:`
   frontmatter.
3. Builds a prompt containing the applicable rules and the unified diff, and
   asks the agent for a strict JSON verdict.
4. Renders `report.md`, emits one non-blocking `::warning::` annotation per
   finding, and writes a GitHub job summary.
5. **Always exits 0** (unless `--strict` is passed), so it cannot block a merge.

## Enabling it in CI

1. Generate a Cursor API key from the Cursor dashboard.
2. Add it as a repository (or org) secret named `CURSOR_API_KEY`:

   ```bash
   gh secret set CURSOR_API_KEY --repo OWNER/REPO --body "$CURSOR_API_KEY"
   ```

3. That's it. `.github/workflows/cursor-rules-check.yml` runs on every PR. If
   the secret is absent, the workflow is a no-op (it posts a `::notice::` and
   exits green), so it is safe to merge before the secret is configured.

Optional: set a repository variable `CURSOR_RULES_MODEL` to pin a model;
otherwise the check uses `gpt-5.5`.

### Making it a *required* (but still non-blocking) check

Because the job reports success even when it finds issues, you can mark
**Cursor rules compliance (advisory)** as a required status check in branch
protection: the PR must *run* the check, but findings won't block the merge.

## Local usage

Install dependencies once, then run against the current branch:

```bash
cd tools/cursor-rules-check
npm ci

# The key can come from the environment or a repo-root .env file.
export CURSOR_API_KEY=...        # or add CURSOR_API_KEY=... to <repo>/.env
npm run check -- --base origin/master

cat ../../.cursor-rules-report/report.md
```

Opt into a non-blocking git pre-commit hook (checks staged changes):

```bash
ln -sf ../../tools/cursor-rules-check/pre-commit .git/hooks/pre-commit
```

The hook only runs when dependencies are installed and a `CURSOR_API_KEY` is
available, and can be skipped for a single commit with
`CURSOR_RULES_SKIP=1 git commit ...`. It never blocks a commit.

## Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `CURSOR_API_KEY` | — | Cursor SDK auth (required for real runs; read from `.env` if unset). |
| `CURSOR_MODEL` | `gpt-5.5` | Model selection passed to the agent. |
| `RULES_DIR` | `.cursor/rules` | Directory of `*.mdc` rule files. |
| `OUTPUT_DIR` | `.cursor-rules-report` | Where `report.json` / `report.md` go. |
| `MAX_DIFF_BYTES` | `120000` | Truncate large diffs before sending. |
| `BASE_REF` / `HEAD_REF` | resolved | Override the diff range. |
| `--staged` flag | off | Check the git index instead of a commit range. |
| `--strict` flag | off | Exit non-zero on violations (off = advisory). |

## Testing

There is no mock suite; validate against the real backend locally:

```bash
cd tools/cursor-rules-check
npm ci
npm run typecheck                      # type-checks the source
CURSOR_API_KEY=... npm run check -- --base origin/master
```

Point `--base` at a ref that differs from `HEAD` so there is a diff to review,
then inspect `.cursor-rules-report/report.md`.
