---
name: setup-demo-security-backlog
description: Prepare the security backlog remediation demo by checking out demo/security-backlog, making sure the local stack and Jira backlog are ready, and warming test caches. Use when the user asks for setup-demo-security-backlog or to get ready for the security backlog demo.
disable-model-invocation: true
---

# Setup demo: security backlog

Run from the repository root. Read `DEMO-SECURITY-BACKLOG.md` for what the demo shows.

## Workflow

1. Preserve uncommitted work, then check out the baseline:

   ```bash
   if [ -n "$(git status --porcelain)" ]; then
     git stash push -u -m "setup-demo-security-backlog preserve: $(git branch --show-current) $(date +%Y%m%d_%H%M%S)"
   fi
   git fetch origin demo/security-backlog
   git checkout demo/security-backlog
   git reset --hard origin/demo/security-backlog
   ```

   Tell the user if a stash was created.

2. Confirm the four live-demo artifacts do not exist yet. If any do, run the `reset-demo-security-backlog` skill first:

   ```bash
   ls .cursor/agents/vuln-remediator.md \
      .cursor/skills/security-vuln-validate \
      .cursor/rules/secure-fix-standards.mdc \
      .cursor/hooks/require-security-tests.sh 2>/dev/null
   ```

3. Make sure the local stack is healthy. A passing ping alone is not enough: the server answers pings even when Postgres is down.

   ```bash
   docker info >/dev/null 2>&1 || echo "DOCKER_UNAVAILABLE"
   docker ps --format '{{.Names}}' | grep -qx mattermost-postgres || docker start mattermost-postgres mattermost-redis
   curl -fsS http://127.0.0.1:8065/api/v4/system/ping
   ```

   If no server is listening on 8065, start it with the `setup-demo-101` skill's stack step. Then confirm logins work:

   ```bash
   curl -s -o /dev/null -w '%{http_code}\n' -X POST http://127.0.0.1:8065/api/v4/users/login \
     -H 'Content-Type: application/json' -d '{"login_id":"admin","password":"admin"}'
   ```

   Expect `200`.

4. Check the GitHub CLI is signed in as the fork owner:

   ```bash
   gh auth status
   git config user.email
   ```

   If `git config user.email` prints nothing, ask the user for a name and email and set them with `git config user.name` / `git config user.email`. Otherwise every demo commit prints an "identity set automatically" warning.

5. Check the Jira backlog with the Atlassian MCP. Run JQL `project = MM AND labels = security ORDER BY key ASC` and confirm there are four tickets, all in **To Do**, with no `not-a-vulnerability` label. If not, run `reset-demo-security-backlog`. Also check each ticket has no comments (`listJiraIssueComments`); the MCP cannot delete them, so list leftovers for the user to delete in the Jira UI.

6. Warm the Go build cache and Jest so the live test runs take seconds:

   ```bash
   (cd server && go test ./public/model ./channels/app/teams ./channels/app/users -run 'TestNothing' -count=1)
   (cd webapp/channels && npx jest src/utils/url.test.tsx)
   ```

7. Report: current branch, stash status, stack health, admin login status, gh account, Jira ticket keys and statuses, and that caches are warm.
