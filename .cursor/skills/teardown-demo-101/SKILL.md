---
name: teardown-demo-101
description: Tear down the local Mattermost 101 demo branch by stashing all changes on the current *_mattermost_demo branch with a recoverable name and checking out master. Use when the user asks for teardown-demo-101, teardown_demo 101, teardown demo 101, or to clean up after the Mattermost 101 demo.
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

4. Finish by reporting the previous demo branch name, whether a stash was created, and the current branch.

## Optional Service Shutdown

Do not stop the local app or Docker services unless the user explicitly asks. If requested, run:

```bash
cd server
make stop
```

This stops the Mattermost server, webapp watcher, and Docker Compose services.
