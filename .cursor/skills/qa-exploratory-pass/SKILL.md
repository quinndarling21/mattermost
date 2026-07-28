---
name: qa-exploratory-pass
description: Run a structured exploratory QA pass against a locally running Mattermost instance, exercising core messaging flows in the browser and filing defects with evidence. Use when the user asks for an exploratory QA pass, manual QA sweep, UI smoke test of core messaging flows, or autonomous frontend QA against the local server.
---

# Exploratory QA pass

Drive the real Mattermost UI against a healthy local stack. Report defects; do not fix them unless asked.

## Preconditions

1. Confirm the stack is healthy:

   ```bash
   curl http://127.0.0.1:8065/api/v4/system/ping
   ```

2. If it is not running, start it in tmux using the known-good Cloud flow:

   ```bash
   cd server
   ENABLED_DOCKER_SERVICES='postgres redis' RUN_SERVER_IN_BACKGROUND=true make run
   ```

3. If first-user signup is unavailable, seed an admin user and team:

   ```bash
   cd server
   ./bin/mmctl --local user create --email cursor@example.com --username cursoradmin --password Password123! --system-admin --email-verified --disable-welcome-email
   ./bin/mmctl --local team create --name cursorteam --display-name "Cursor Team" --email cursor@example.com
   ```

Open `http://localhost:8065` in the browser (computer use or `agent-browser`).

## Test charter

Exercise each flow and confirm the expected outcome. Failures must be recognizable from the UI.

1. **Log in** — Reach the channel view as the seeded admin (`cursoradmin` / `Password123!`).
2. **Post a message** — The new message appears in the channel timeline with the text you entered.
3. **Reply in a thread** — Opening the thread shows the reply under the parent; the channel list shows a thread indicator when expected.
4. **Edit a message** — After the editor closes, the timeline shows the edited text (not the original). Reload the page; the edited text still appears.
5. **Add an emoji reaction** — The reaction badge appears on the message with the chosen emoji and count.
6. **Create a public channel** — The new channel appears in the sidebar and opens to an empty timeline.
7. **Rename a channel** — The sidebar and channel header show the new display name.
8. **Open channel settings / notification preferences** — The settings UI opens and shows the current channel’s notification options without error.
9. **Delete a message** — The message is removed from the timeline (or replaced by the deleted-message placeholder per product behavior).

## Evidence rules

- Take a screenshot at each flow (pass or fail).
- When possible, record video of the full pass.
- Prefer `agent-browser` or computer-use tools already available in the environment.

## Findings protocol

For each defect:

1. Reproduce it twice.
2. Capture screenshot and/or video of the failure.
3. Write a bug report with title, steps to reproduce, expected vs actual, and severity.
4. File it in Linear (team **MAT** at [linear.app/mattermost-factory](https://linear.app/mattermost-factory)) when Linear MCP is available. Otherwise include the full reports in the final response.

Do **not** attempt to fix defects during the pass unless the user asks. Report first.

## Finish

Summarize which flows passed, which failed, links to filed Linear issues (or inline reports), and paths to screenshots/video.
