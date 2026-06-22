---
name: teardown-demo-101
description: Tear down the local Mattermost 101 demo by stashing changes on the current *_mattermost_demo branch, checking out master, and stopping the dev server plus Docker services. Use when the user asks for teardown-demo-101, teardown_demo 101, teardown demo 101, or to clean up after the Mattermost 101 demo.
disable-model-invocation: true
---

# Teardown Demo 101

## Workflow

Use this skill from the repository root.

1. Confirm the current branch is a demo branch before changing anything:

   ```bash
   branch="$(git branch --show-current)"
   case "$branch" in
     *_mattermost_demo) ;;
     *)
       echo "Refusing teardown-demo-101 from non-demo branch: $branch"
       exit 1
       ;;
   esac
   ```

   If this guard fails, stop and ask the user what to do.

2. Stash all tracked and untracked changes on the demo branch:

   ```bash
   git stash push -u -m "teardown-demo-101: ${branch} $(date +%Y%m%d_%H%M%S)"
   ```

   If Git reports `No local changes to save`, continue.

3. Check out `master`:

   ```bash
   git checkout master
   ```

4. Stop the local dev stack so nothing keeps running on the laptop:

   ```bash
   SESSION_NAME="mattermost-docs-site"
   tmux -f /exec-daemon/tmux.portal.conf has-session -t "=$SESSION_NAME" 2>/dev/null && tmux -f /exec-daemon/tmux.portal.conf kill-session -t "=$SESSION_NAME" || true
   cd server
   make stop
   ```

   If the tmux config path is unavailable, run the tmux commands without `-f /exec-daemon/tmux.portal.conf`.

   This stops the documentation site, Mattermost server, webapp watcher, and Docker Compose services (`mattermost-postgres`, `mattermost-redis`, and related containers).

   If `docker info` fails, still run `make stop` and report Docker as unavailable.

5. Verify the server is down (continue even if this fails):

   ```bash
   curl -fsS http://127.0.0.1:8065/api/v4/system/ping >/dev/null 2>&1 && echo "SERVER_STILL_RUNNING=yes" || echo "SERVER_STILL_RUNNING=no"
   ```

6. Finish by reporting the previous demo branch name, whether a stash was created, the current branch, and whether the dev stack and documentation site were stopped successfully.

## Notes

- Always run step 4 as part of teardown; do not leave the dev server or Docker services running after a demo ends.
- `make stop` is safe to run even if the stack was never started or is already stopped.
