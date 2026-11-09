---
name: reset-demo-security-backlog
description: Reset the security backlog demo between runs by closing fix PRs, deleting security/* branches, removing the live-created rule, skill, hook, and subagent, and moving the Jira security tickets back to To Do. Use when the user asks for reset-demo-security-backlog or to reset the security backlog demo.
disable-model-invocation: true
---

# Reset demo: security backlog

Run from the repository root. This undoes everything a demo run creates. It does not stop the local stack.

## Workflow

1. Close open fix PRs on the fork and delete their remote branches:

   ```bash
   gh pr list --repo quinndarling21/mattermost --base demo/security-backlog --state open \
     --json number,headRefName --jq '.[] | select(.headRefName | startswith("security/")) | .number' |
   while read -r n; do
     gh pr close "$n" --repo quinndarling21/mattermost --delete-branch --comment "Closed by demo reset."
   done
   git ls-remote --heads origin 'security/*' | awk '{print $2}' | sed 's#refs/heads/##' |
   while read -r b; do git push origin --delete "$b"; done
   ```

2. Restore the baseline branch and remove local fix branches:

   ```bash
   git checkout demo/security-backlog
   git reset --hard origin/demo/security-backlog
   git branch --list 'security/*' | sed 's/^[* ]*//' | while read -r b; do git branch -D "$b"; done
   ```

3. Remove the live-created artifacts and local evidence. These paths are untracked on the baseline, so `reset --hard` does not remove them:

   ```bash
   rm -rf .cursor/agents/vuln-remediator.md \
          .cursor/skills/security-vuln-validate \
          .cursor/rules/secure-fix-standards.mdc \
          .cursor/hooks/require-security-tests.sh \
          .cursor/security-evidence
   git status --short
   ```

   `git status --short` should print nothing. `.cursor/hooks.json` is tracked, so step 2 already restored it.

4. Reset the Jira tickets with the Atlassian MCP (site `quinnsworkspace-610b13be.atlassian.net`, cloudId `bd7dc254-ec63-4026-9f13-d97c51fb68ad`):
   - Find them with JQL `project = MM AND labels = security`.
   - Transition each one to **To Do**.
   - Remove the `not-a-vulnerability` label if present (set `labels` to the list without it).
   - Keep the description untouched.
   - The Atlassian MCP cannot delete comments. Use `listJiraIssueComments` and list every ticket key that still has comments, with a link, so the user can delete them in the Jira UI before the demo.

5. Report: PRs closed, branches deleted, artifacts removed, and each ticket's status.
