---
name: setup-demo-channel-summarize
description: Set up the channel summarize feature on a local Mattermost by booting the demo 101 stack with plugin uploads and the xAI key wired in, building the channel-summarizer plugin, and installing and enabling it. Use when the user asks for setup-demo-channel-summarize, to set up the channel summarize demo, the Grok summarize demo, or the /summarize feature locally.
disable-model-invocation: true
---

# Setup Channel Summarize

Brings up local Mattermost with the `/summarize` slash command backed by the xAI Grok API. Builds on the same stack as `setup-demo-101`; run from the repository root on a checkout that contains `integrations/channel-summarizer` (master after the feature merges, or the feature branch).

## Workflow

1. Confirm the xAI API key is available. Never print, log, or commit the key value.

   ```bash
   if [ -z "${XAI_API_KEY:-}" ]; then
     echo "XAI_API_KEY is not set"
   fi
   ```

   If it is not set, stop and ask the user to export `XAI_API_KEY` (from https://console.x.ai) in their shell before continuing. Without it, `/summarize` replies with a configuration hint instead of a summary.

2. Preserve uncommitted work and handle branches the same way as `setup-demo-101` (stash if dirty, work from a demo branch when the user wants one). Skip the branch dance if the user asked to demo the current branch.

3. Boot the stack the same way as `setup-demo-101`, with two extra environment variables exported in the same shell so the server inherits the key and accepts plugin uploads:

   ```bash
   export XAI_API_KEY   # already set from step 1
   export MM_PLUGINSETTINGS_ENABLEUPLOADS=true
   cd server
   ENABLED_DOCKER_SERVICES='postgres redis' RUN_SERVER_IN_BACKGROUND=true make run
   ```

   Run this as a long-running background command (tmux session), and reuse an already-healthy stack when one is running — but note the plugin only sees `XAI_API_KEY` if the server process was started with it exported. If a running stack lacks the key, set it as a plugin setting instead in step 6.

4. Wait for the server to be healthy:

   ```bash
   for i in {1..120}; do
     curl -fsS http://127.0.0.1:8065/api/v4/system/ping >/dev/null && break
     sleep 2
   done
   curl -fsS http://127.0.0.1:8065/api/v4/system/ping
   ```

5. Build and install the plugin (from the repository root):

   ```bash
   (cd integrations/channel-summarizer && make dist)
   cd server
   ./bin/mmctl --local plugin add ../integrations/channel-summarizer/dist/com.mattermost.channel-summarizer-0.1.0.tar.gz
   ./bin/mmctl --local plugin enable com.mattermost.channel-summarizer
   ```

   If `plugin add` reports uploads disabled, run `./bin/mmctl --local config set PluginSettings.EnableUploads true` and retry.

6. Only if the server was already running without `XAI_API_KEY` in its environment: set the key as a plugin setting through **System Console > Plugins > Channel Summarizer > xAI API Key** (takes effect without a restart), or restart the stack with the key exported.

7. Verify the plugin is active:

   ```bash
   ./bin/mmctl --local plugin list
   ```

   `com.mattermost.channel-summarizer` must appear under enabled plugins.

8. Open http://localhost:8065, go to any channel with a few recent messages, and run `/summarize`. The ephemeral reply shows key takeaways, action items, the Grok model id, token counts, and the cost of the call in USD.

9. Finish by reporting the app URL, the plugin status, and where the key came from (server environment or plugin setting) without revealing it.

## Notes

- The plugin defaults to `https://api.x.ai/v1` and model `grok-4.6`; both are overridable in System Console or via `XAI_API_URL` / `XAI_MODEL`.
- No seeded branch or fixture data is required; `/summarize` works on whatever messages the open channel already has.
- If the xAI API is unreachable from the machine (egress restrictions), `/summarize` reports the API error in-channel; the stack itself stays healthy.
