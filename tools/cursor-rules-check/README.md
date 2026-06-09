# Cursor Rules Compliance Check

An **advisory, non-blocking** pre-merge check that uses the [Cursor CLI in
headless mode](https://cursor.com/docs/cli/headless) to flag changes that may
break this repository's Cursor rules (`.cursor/rules/*.mdc`) and the docs they
reference (e.g. `webapp/STYLE_GUIDE.md`).

The goal is to keep our Cursor rules *maintained and enforced* without gating
merges on a probabilistic model: violations are surfaced loudly (PR annotations,
a sticky PR comment, and a job summary) but never turn the check red.

## Why the Cursor CLI?

Our rules are written in natural language ("prefer shared components", "use
semantic HTML", "always import via the full package name"). A regex/linter
cannot reason about most of them. The Cursor CLI runs the same models that power
the editor against the PR diff plus the rule text, so the checks are genuinely
intelligent and stay in sync with the rules as they evolve — no parallel
rule-engine to maintain.

We use the **headless CLI** (`cursor-agent --print ...`) rather than the
interactive agent or a long-running SDK process because it is the documented,
stateless entry point for CI and is trivial to mock in tests.

## How it works

```
changed files (git diff)
        │
        ├─ match against rule globs/alwaysApply  ──►  applicable .mdc rules
        │
        ▼
  prompt = rules + diff  ──►  cursor-agent --print  ──►  report.json
        │
        ▼
  report.md  +  ::warning:: annotations  +  sticky PR comment  +  job summary
```

`check-rules.sh`:

1. Computes the changed files for the PR (or staged changes locally).
2. Selects which rules apply, using each rule's `globs:` / `alwaysApply:`
   frontmatter.
3. Builds a prompt containing the applicable rules and the unified diff, and
   asks the agent to write a strict JSON verdict to `report.json`.
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

Optional: set a repository variable `CURSOR_RULES_MODEL` to pin a model (e.g.
`gpt-5.2`); otherwise the agent's default is used.

### Making it a *required* (but still non-blocking) check

Because the job reports success even when it finds issues, you can mark
**Cursor rules compliance (advisory)** as a required status check in branch
protection: the PR must *run* the check, but findings won't block the merge.
Reviewers still see the annotations and comment.

## Local usage

Run it by hand against the current branch:

```bash
export CURSOR_API_KEY=...        # your key
bash tools/cursor-rules-check/check-rules.sh --base origin/master
cat .cursor-rules-report/report.md
```

Opt into a non-blocking git pre-commit hook (checks staged changes):

```bash
ln -sf ../../tools/cursor-rules-check/pre-commit .git/hooks/pre-commit
```

The hook only runs when `CURSOR_API_KEY` is set and can be skipped for a single
commit with `CURSOR_RULES_SKIP=1 git commit ...`. It never blocks a commit.

## Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `CURSOR_API_KEY` | — | Cursor CLI auth (required for real runs). |
| `CURSOR_AGENT_BIN` | `cursor-agent` | Agent binary (overridden in tests). |
| `CURSOR_MODEL` | agent default | Model to use. |
| `RULES_DIR` | `.cursor/rules` | Directory of `*.mdc` rule files. |
| `OUTPUT_DIR` | `.cursor-rules-report` | Where `report.json` / `report.md` go. |
| `MAX_DIFF_BYTES` | `120000` | Truncate large diffs before sending. |
| `AGENT_TIMEOUT` | `300` | Seconds before the agent call is aborted. |
| `--strict` flag | off | Exit non-zero on violations (off = advisory). |

## Tests

`test/run-tests.sh` exercises the full script end-to-end using a deterministic
mock agent (`test/mock-cursor-agent.sh`) — no API key or network required:

```bash
bash tools/cursor-rules-check/test/run-tests.sh
```
