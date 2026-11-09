---
name: security-vuln-fix
description: Implement the minimal fix for a confirmed security vulnerability and prove it against the regression test written by security-vuln-test-coverage. Use after a failing regression test exists for a Jira security ticket.
---

# Security vulnerability fix

Input: a Jira ticket key with a recorded failing test in `.cursor/security-evidence/<KEY>.json`.

Run every command from the repository root. The shell keeps its working directory between commands, so return to the root after any `cd`. Run test commands with nothing chained after them, so the exit code is the test result.

## Workflow

1. Read the evidence file and confirm you are on its `branch`. Re-run `test_command` once and confirm it still fails.

2. Fix the root cause at the vulnerable code path:
   - Change application code only. Do not edit, skip, or loosen the regression test or any existing test.
   - Keep the change as small as possible and in the same style as the surrounding code.
   - Prefer exact matching and real parsers (`net/url`, `URL`) over string prefix/suffix tricks.
   - If the same flawed pattern exists in a sibling function in the same file, mention it in the report but do not widen the change unless the ticket covers it.

3. Re-run `test_command` and confirm it passes.

4. Run the whole package or test file to catch regressions:

   | Area | Command |
   | --- | --- |
   | Go server | `cd server && go test ./<package path> -count=1` |
   | Webapp | `cd webapp/channels && npx jest <path/to/file.test.tsx>` |

   For Go, also run `cd server && go vet ./<package path>`.

   If anything fails, check whether it also fails without your change before touching it:

   ```bash
   git stash
   <re-run only the failing test>
   git stash pop
   ```

   - Fails on the baseline too: it is pre-existing. Note it in the report and leave it alone.
   - Passes on the baseline: your fix caused it. Fix the application code and repeat. Never change a test to make it pass.

5. Update the evidence file with the passing run. The fix is not committed yet; `security-vuln-pr` commits it.

   ```json
   "green": {"result": "pass", "package_command": "<command from step 4>"}
   ```

## Output

Report the files changed, a one-paragraph explanation of the root cause and the fix, the passing test output, and the package-level result.
