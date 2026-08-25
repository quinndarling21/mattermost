# Channel Summarizer plugin

A Mattermost server plugin that summarizes recent channel activity with the [xAI Grok API](https://docs.x.ai/). Type `/summarize` in any channel and the plugin fetches the latest messages, asks Grok for key takeaways and action items, and replies with an ephemeral post that includes the model id, token usage, and the cost of that call in USD computed from published xAI list pricing.

## Usage

- `/summarize` — summarize the last 30 messages in the current channel.
- `/summarize 80` — summarize the last 80 messages (capped at 200).

Only the requesting user sees the result. The footer of each summary reports the model, input/output token counts (including cached prompt tokens when reported), and the per-call cost.

## Configuration

| Setting | Environment fallback | Default |
| --- | --- | --- |
| xAI API Key | `XAI_API_KEY` | none (required) |
| xAI API Base URL | `XAI_API_URL` | `https://api.x.ai/v1` |
| Model | `XAI_MODEL` | `grok-4.6` |

Set the key in **System Console > Plugins > Channel Summarizer**, or export `XAI_API_KEY` in the server environment before starting it. Never commit an API key. If no key is configured, `/summarize` responds with a setup hint instead of failing.

Pricing for cost reporting lives in `server/cost.go`; update it there when xAI list prices or the default model change.

## Build and install

Requires the Go toolchain used by `server/` (see `go.mod`).

```bash
cd integrations/channel-summarizer
make dist
```

Against a local dev server started with `make run` (local mode enabled):

```bash
cd server
./bin/mmctl --local config set PluginSettings.EnableUploads true
./bin/mmctl --local plugin add ../integrations/channel-summarizer/dist/com.mattermost.channel-summarizer-0.1.0.tar.gz
./bin/mmctl --local plugin enable com.mattermost.channel-summarizer
```

The `setup-demo-channel-summarize` Cursor skill automates the full flow (local stack, build, install, enable), and `teardown-demo-channel-summarize` removes it.

## Tests

```bash
cd integrations/channel-summarizer
make test
```

Tests cover the cost computation, the xAI client against a stub server, transcript assembly, and the slash-command flow. No network access or API key is needed.
