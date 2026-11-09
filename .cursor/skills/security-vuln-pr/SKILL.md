---
name: security-vuln-pr
description: Commit a tested security fix, open a pull request against the demo/security-backlog baseline on the quinndarling21/mattermost fork, and move the Jira ticket to In Review with a link to the PR. Use after security-vuln-fix reports a passing regression test.
---

# Security vulnerability PR

Input: a Jira ticket key whose evidence file `.cursor/security-evidence/<KEY>.json` has both a `red` failing run and a `green` passing run.

## Workflow

1. Confirm the current branch matches the evidence `branch` and that `git status` only shows the fix and its test. Do not commit the evidence file (it is gitignored).

2. Commit:

   ```bash
   git add <test file> <fixed source files>
   git commit -m "[<KEY>] Security: <short description of the fix>"
   ```

3. Push and open the PR. Always target the fork and the baseline branch, never upstream `mattermost/mattermost` or `master`:

   ```bash
   git push -u origin HEAD
   gh pr create \
     --repo quinndarling21/mattermost \
     --base demo/security-backlog \
     --head "$(git branch --show-current)" \
     --title "[<KEY>] Security: <short description>" \
     --body-file <tmp body file>
   ```

4. Build the PR body from `.github/PULL_REQUEST_TEMPLATE.md`, removing every `<!-- -->` comment and the `Screenshots` section:

   ```markdown
   #### Summary
   <Vulnerability class and CWE, the root cause, and what the fix changes. One short paragraph.>

   **Regression test:** `<test name>` in `<test file>`
   - Before the fix: fails (exploit input accepted)
   - After the fix: passes; full package passes

   #### Ticket Link
   Fixes: https://quinnsworkspace-610b13be.atlassian.net/browse/<KEY>

   #### Release Note
   ```release-note
   Fixed a security issue where <user-facing description>.
   ```
   ```

   Do not include working exploit payloads beyond what the test already contains.

5. Update Jira (site `quinnsworkspace-610b13be.atlassian.net`) with the Atlassian MCP:
   - Add a comment with the PR URL, the regression test name, and the before/after results.
   - Transition the ticket to **In Review** (`transitionJiraIssue`, transition name `In Review`).

## Output

Report the PR URL, the commit SHA, and the Jira ticket's new status.
