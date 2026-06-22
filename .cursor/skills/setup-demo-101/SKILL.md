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

4. Start the local documentation site in a separate tmux session:

   ```bash
   SESSION_NAME="mattermost-docs-site"
   REPO_ROOT="$(git rev-parse --show-toplevel)"
   tmux -f /exec-daemon/tmux.portal.conf has-session -t "=$SESSION_NAME" 2>/dev/null || tmux -f /exec-daemon/tmux.portal.conf new-session -d -s "$SESSION_NAME" -c "$REPO_ROOT" -- "${SHELL:-bash}" -l
   tmux -f /exec-daemon/tmux.portal.conf send-keys -t "$SESSION_NAME:0.0" "cd \"$REPO_ROOT/docs\" && npm ci && npm run dev" C-m
   ```

   If the tmux config path is unavailable, run the same commands without `-f /exec-daemon/tmux.portal.conf`.

5. Wait for the server to be healthy:

   ```bash
   for i in {1..90}; do
     if curl -fsS http://127.0.0.1:8065/api/v4/system/ping >/dev/null; then
       break
     fi
     sleep 2
   done
   curl -fsS http://127.0.0.1:8065/api/v4/system/ping
   ```

6. Wait for the docs site to be healthy:

   ```bash
   for i in {1..60}; do
     if curl -fsS http://127.0.0.1:3001 >/dev/null; then
       break
     fi
     sleep 2
   done
   curl -fsS http://127.0.0.1:3001 >/dev/null
   ```

7. Open the app in the browser at:

   ```text
   http://localhost:8065
   ```

   Prefer the Cursor browser MCP when available. If browser MCP is unavailable, run:

   ```bash
   open http://localhost:8065
   ```

8. Finish by reporting the branch name, app URL, docs URL, and whether a pre-demo stash was created.

## Notes

- Before starting a new long-running app command, inspect existing terminals and reuse a healthy running stack when possible.
- If `docker info` fails, report Docker as unavailable instead of trying to work around it.
- A healthy server responds at `http://127.0.0.1:8065/api/v4/system/ping`.
- The local documentation site responds at `http://127.0.0.1:3001`.
