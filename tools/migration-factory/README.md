# migration-factory (BDK bot)

A [Grok Bot Development Kit](https://www.npmjs.com/package/@cursor/bdk) (`@cursor/bdk` 0.2.14)
project: agents defined as code, a folder of Markdown and TypeScript.

It takes the Enzyme -> React Testing Library migration, splits it into modules,
and hands each module to its **own Cursor Cloud Agent** through BDK's
`cursor-cloud-agents` extension. Each cloud agent opens its own PR against
`master`, which then goes through Bugbot, the Security Reviewer, webapp CI
(Jest), the approval agent, and auto-merge.

| Module id | Directory (under `webapp/channels/src/components`) | Enzyme tests |
| --- | --- | --- |
| `menu-items` | `widgets/menu/menu_items` | `menu_item_external_link`, `menu_item_toggle_modal_redux`, `menu_item_action` |
| `thread-list` | `threading/global_threads/thread_list` | `thread_list`, `virtualized_thread_list`, `virtualized_thread_list_row` |
| `markdown-image-expand` | `markdown_image_expand` | `markdown_image_expand` |

## Layout

```text
bot/
  agent.ts                        # defineAgent: model = Grok 4.7 High Fast, read-only harness tools
  instructions.md                 # orchestrator prompt (fan-out rules)
  extensions/cloud.ts             # mounts @cursor/bdk/extensions/cursor-cloud-agents as `cloud`
  lib/model.ts                    # grok-4.7 {reasoning_effort: high, fast: true, context: 256k}
  lib/modules.ts                  # the three modules + the per-module agent brief (STYLE_GUIDE rules)
  lib/tasks.ts                    # Jest-gate preflight brief + CI-fix brief
  tools/list_modules.ts           # read: list modules
  tools/launch_module_migration.ts# write: one cloud agent per module (launchCloudAgent)
  tools/launch_jest_preflight.ts  # write: cloud agent that turns Jest on in webapp CI
  tools/launch_ci_fix.ts          # write: CI-fix loop, new cloud agent on an existing PR branch
evals/modules.eval.ts             # smoke eval: lists modules without launching
```

Every agent in the flow (the orchestrator turn and every cloud agent) runs
`grok-4.7` with `reasoning_effort=high`, `fast=true`. There are no model fallbacks.

## Run it

Requires Node 22.13+ and `CURSOR_API_KEY` (or `bdk login`).

```bash
cd tools/migration-factory
npm install
npx bdk validate --dir .
npx bdk info --dir .

# serve with the local playground (sessions, tool calls, traces)
npx bdk dev --dir . --port 3000

# fan out all three modules (one cloud agent + one PR each)
npx bdk run --url http://127.0.0.1:3000/migration-factory \
  --message "Run the Enzyme to RTL migration: fan out all modules." --text

# Jest-gate preflight / CI-fix loop
npx bdk run --url http://127.0.0.1:3000/migration-factory --message "Run the Jest-gate preflight."
npx bdk run --url http://127.0.0.1:3000/migration-factory \
  --message "CI failed on https://github.com/quinndarling21/mattermost/pull/N: <job + log excerpt>. Launch the CI fix."
```

Deterministic tool call without a model turn: `npx bdk call list_modules --dir .`
