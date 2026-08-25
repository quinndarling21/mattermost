---
name: teardown-demo-channel-summarize
description: Tear down the channel summarize feature by removing the channel-summarizer plugin from the local Mattermost and then stopping the demo stack the same way as teardown-demo-101. Use when the user asks for teardown-demo-channel-summarize, to tear down or clean up the channel summarize demo, the Grok summarize demo, or the /summarize feature.
disable-model-invocation: true
---

# Teardown Channel Summarize

Removes the `/summarize` plugin and shuts the local stack down. Run from the repository root.

## Workflow

1. If the server is still reachable, remove the plugin first (ignore failures if it was never installed):

   ```bash
   cd server
   ./bin/mmctl --local plugin disable com.mattermost.channel-summarizer || true
   ./bin/mmctl --local plugin delete com.mattermost.channel-summarizer || true
   cd ..
   ```

2. Clean plugin build artifacts:

   ```bash
   (cd integrations/channel-summarizer && make clean)
   ```

3. Stop the stack and restore branches by following the `teardown-demo-101` skill (stash demo-branch changes, check out `master`, run `make stop` in `server/`). If the current branch is not a `*_mattermost_demo` branch because the user demoed a feature branch directly, skip the branch guard and stash steps and just stop the stack:

   ```bash
   cd server
   make stop
   ```

4. Verify the server is down (continue even if this fails):

   ```bash
   curl -fsS http://127.0.0.1:8065/api/v4/system/ping >/dev/null 2>&1 && echo "SERVER_STILL_RUNNING=yes" || echo "SERVER_STILL_RUNNING=no"
   ```

5. Finish by reporting whether the plugin was removed, the current branch, and whether the stack stopped cleanly.

## Notes

- Never echo `XAI_API_KEY` while tearing down. If the user exported it only for the demo, remind them they can `unset XAI_API_KEY`.
- `make stop` is safe to run even if the stack was never started.
