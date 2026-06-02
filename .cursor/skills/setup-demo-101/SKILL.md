---
name: setup-demo-101
description: Set up the local Mattermost 101 demo by preserving existing work, creating a fresh datetime branch named *_mattermost_demo, starting the required Docker services and local app, waiting for readiness, and opening the app in a browser. Use when the user asks for setup-demo-101, setup_demo 101, setup demo 101, or to prepare the Mattermost 101 demo.
disable-model-invocation: true
---

# Setup Demo 101

## Workflow

Use this skill from the repository root.

1. Preserve any existing uncommitted work before switching branches:

   ```bash
   if [ -n "$(git status --porcelain)" ]; then
     git stash push -u -m "setup-demo-101 pre-demo preserve: $(git branch --show-current) $(date +%Y%m%d_%H%M%S)"
   fi
   ```

   Tell the user if a pre-demo stash was created.

2. Create a fresh demo branch from up-to-date `master`:

   ```bash
   git fetch origin master
   git checkout master
   git pull --ff-only origin master
   branch="$(date +%Y%m%d_%H%M%S)_mattermost_demo"
   git checkout -b "$branch"
   ```

3. Start the Mattermost local stack as a long-running background command:

   ```bash
   cd server
   ENABLED_DOCKER_SERVICES='postgres redis' RUN_SERVER_IN_BACKGROUND=true make run
   ```

   This intentionally starts only the required local Docker services, `mattermost-postgres` and `mattermost-redis`, then starts the Mattermost server and webapp.

4. Wait for the server to be healthy:

   ```bash
   for i in {1..90}; do
     if curl -fsS http://127.0.0.1:8065/api/v4/system/ping >/dev/null; then
       break
     fi
     sleep 2
   done
   curl -fsS http://127.0.0.1:8065/api/v4/system/ping
   ```

5. Open the app in the browser at:

   ```text
   http://localhost:8065
   ```

   Prefer the Cursor browser MCP when available. If browser MCP is unavailable, run:

   ```bash
   open http://localhost:8065
   ```

6. Finish by reporting the branch name, app URL, and whether a pre-demo stash was created.

## Notes

- Before starting a new long-running app command, inspect existing terminals and reuse a healthy running stack when possible.
- If `docker info` fails, report Docker as unavailable instead of trying to work around it.
- A healthy server responds at `http://127.0.0.1:8065/api/v4/system/ping`.
