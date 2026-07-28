---
name: pm-roadmap-insights
description: Analyze PM roadmap input data from realistic account, user activity, feedback, and roadmap CSVs, plus ClickUp bug reports and Slack feedback. Use when the user asks to prioritize roadmap work from user activity data, generate product insights, identify adoption or retention drivers, compare feature opportunities, or prepare a PM decision brief.
---

# PM roadmap insights

## How this skill works

You (the parent agent) act as the orchestrator. Fan the evidence-gathering out to three subagents in parallel, then synthesize their findings yourself into the final decision brief and canvas. Do not do the source analysis in the foreground, and do not delegate the final synthesis.

Use this skill from the repository root.

## Step 1: Launch three analysis subagents in parallel

Launch all three in a single batch with `run_in_background: true`, then end your turn and wait for their completion notifications.

### 1a. Product telemetry — `pm-data-analyst` subagent

Launch the dedicated `pm-data-analyst` subagent. It already knows the CSV schemas, join keys, decision metrics, and scoring model for the data under `.cursor/insights/pm-roadmap/data/`. In the prompt, pass along:

- The user's focus area or hypothesis, if they stated one (e.g., "search improvements").
- Any alternative prioritization framework the user requested; otherwise the subagent uses its default scoring model.
- A reminder to return the full ranked scorecard, segment/persona breakdowns, named accounts, representative quotes, and data caveats.

### 1b. ClickUp bug reports — `generalPurpose` subagent

Launch a `generalPurpose` subagent to mine bug reports in ClickUp (MCP server `project-0-mattermost-clickup`; it should inspect tool schemas with GetMcpTools before calling). Instruct it to:

- Find the bug report list(s) in the workspace hierarchy (e.g., a "Bug Reports" list) and pull the tasks, including descriptions, priorities, tags, and linked tasks.
- Group bugs by theme / failure mode and note priority distribution (how many urgent/high vs normal).
- Flag bugs tied to revenue risk (renewal blockers, enterprise accounts) and bugs linked to roadmap or prototype tasks.
- Return per-theme counts, the highest-severity items with task links, and 2-3 representative excerpts from bug descriptions.

### 1c. Slack feedback — `generalPurpose` subagent

Launch a `generalPurpose` subagent to mine the Slack `#feedback-general` channel (MCP server `plugin-slack-slack`; it should inspect tool schemas with GetMcpTools before calling). Instruct it to:

- Read recent channel history (and thread replies on substantive messages) with `slack_read_channel` / `slack_read_thread`; use `slack_search_public` for targeted keyword sweeps if the history is long.
- Classify messages by feature area and sentiment, and note recurring complaints, who raises them (role/team if inferable), and any reaction counts that signal agreement.
- Return per-theme message counts, 3-5 representative quotes with permalinks, and any feedback that corroborates or contradicts the telemetry and bug-report signals.

## Step 2: Synthesize into a PM decision brief (parent agent)

Once all three subagents report back, reconcile their findings yourself. Where sources agree (telemetry friction + bug reports + Slack complaints on the same theme), say so explicitly — corroboration across independent sources is the strongest evidence in the brief. Where they disagree, name the discrepancy and weigh telemetry over anecdote.

Produce a PM decision brief, not a generic metrics dump:

- Lead with the recommended roadmap bet and the reason.
- Compare the top opportunities in a scorecard.
- Call out which customer segment and persona benefit most.
- Include a small number of representative quotes, attributed to their source (telemetry feedback, ClickUp bug, or Slack message).
- State which option should be deferred and why.

## Step 3: Create or update the canvas

Create or update this Cursor Canvas for the visual brief:

```text
pm-roadmap-insights.canvas.tsx
```

Keep all canvas data inline. Use titles, axis labels, legends, and source captions so the canvas can stand alone beside the chat. Show which evidence source backs each headline finding.

## Step 4: End with concrete PM follow-ups

- A one-paragraph roadmap-review summary.
- Suggested next analysis questions.
- Optional Linear issue drafts for the Mattermost Factory `MAT` project if the user asks to turn recommendations into tracked work.

## Degraded sources

If a source is unavailable (ClickUp or Slack MCP not connected, empty channel, no bug list), do not block: note the gap in the brief, proceed with the remaining sources, and tell the user which evidence is missing.
