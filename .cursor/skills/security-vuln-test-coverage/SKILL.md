---
name: security-vuln-test-coverage
description: Write a regression test that reproduces a confirmed security vulnerability and prove it fails against the current code. Use after a Jira security ticket has been validated as a real vulnerability and before any fix is written.
---

# Security vulnerability test coverage

Input: a Jira ticket key (for example `MM-12`) whose vulnerability has already been confirmed, plus the validation verdict (location, exploit input, expected safe behavior).

The goal is a test that fails today because of the vulnerability and will pass once it is fixed. Do not change application code in this skill.

## Workflow

Run every command from the repository root. The shell keeps its working directory between commands, so return to the root after any `cd`.

1. Create the fix branch from the baseline. Skip the checkout and pull if you are already on a freshly pulled `demo/security-backlog`:

   ```bash
   git checkout demo/security-backlog
   git pull --ff-only origin demo/security-backlog
   git checkout -b "security/<KEY>-<short-slug>"
   ```

   If the branch already exists, check it out instead of recreating it.

2. Find where the vulnerable function is already tested and add the test there. If there is no test file for it, create one next to the source file in the same package.
   - Go: `*_test.go` in the same package, table-driven with `t.Run`, using `testify` `require`/`assert`.
   - Webapp: the co-located `*.test.ts` / `*.test.tsx`, using Jest `describe`/`test`.

3. Write cases for:
   - the exploit input from the verdict, asserting the safe behavior (rejected, blocked, sanitized);
   - at least one close variant of the exploit (different case, encoding, or separator);
   - at least one legitimate input that must keep working, so the fix cannot simply reject everything.

   Name the test after the behavior, not the ticket (for example `TestIsEmailAddressAllowedRejectsLookalikeDomains`).

4. Run only the new test and confirm it fails for the right reason (the assertion on the exploit input, not a compile error or setup failure):

   | Area | Command |
   | --- | --- |
   | Go server | `cd server && go test ./<package path> -run '<TestName>' -count=1` |
   | Webapp | `cd webapp/channels && npx jest <path/to/file.test.tsx> -t '<test name>'` |

   If the test passes, the vulnerability is not reproduced. Stop and report that back instead of continuing.

5. Record the evidence so later steps and hooks can re-run the same test:

   ```bash
   mkdir -p .cursor/security-evidence
   ```

   Write `.cursor/security-evidence/<KEY>.json`:

   ```json
   {
     "ticket": "<KEY>",
     "branch": "security/<KEY>-<short-slug>",
     "test_command": "cd server && go test ./channels/... -run 'TestName' -count=1",
     "red": {"base_commit": "<git rev-parse HEAD>", "result": "fail"}
   }
   ```

   `test_command` must start with `cd server && go test ` or `cd webapp/channels && npx jest `.

## Output

Report the branch name, test file and test name, the exact command, and the key lines of failing output that show the exploit input being accepted.
