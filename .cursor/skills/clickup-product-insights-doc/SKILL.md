---
name: clickup-product-insights-doc
description: Translate a completed product data analysis into a decision brief and publish it to the ClickUp Product Insights doc. Use when the user asks to push analysis findings or a report to ClickUp, create an insights doc, publish a decision brief, or write up the analysis in ClickUp.
---

# ClickUp product insights doc

Translate an analysis that has already been run into a decision brief and publish it to the team's Product Insights doc in ClickUp, via the ClickUp MCP server configured in `.cursor/mcp.json`.

This skill does not run the analysis. It assumes the findings (metrics, feature-area comparison, feedback verbatims) already exist in the session — typically from the `pm-roadmap-insights` skill. If no analysis is present in context, say so and stop; don't compute new numbers from raw data here.

## Workspace map

| Thing | Name | ID |
|---|---|---|
| Space | Team Space | `90146618637` |
| Doc | Product Insights | `2kydjj1w-554` |
| List | Product Backlog | `901418333282` |

If an ID returns not-found (workspace was reseeded), resolve by name with `clickup_search` / `clickup_get_list` instead of guessing.

## Workflow

1. **Collect the findings from the session.** Pull the decision metrics (reach, friction, business impact, effort-adjusted priority), the feature-area comparison, and the representative feedback verbatims from the analysis already in context. Use the numbers as computed — don't recalculate or embellish them.
2. **Write the brief, not a metrics dump.** Match the structure of the existing "June 2026 — Mobile notification controls analysis" page so reports read as a series:

   ```markdown
   # [Feature area] — decision brief ([Month Year])
   *Prepared for the [month] roadmap review. Data window: [range].*

   ## Recommendation
   [The bet, its scope, and the one-sentence reason.]

   ## Key numbers
   - [event volume, failure rate, feedback counts, top tags, segment concentration]

   ## Representative feedback
   > [2-3 short verbatims]

   ## What we deferred
   [The runner-up option and why.]

   ---
   *Method note: [data sources and joins used].*
   ```

3. **Publish as a new page** in the Product Insights doc with `clickup_create_document_page`. Never use `clickup_update_document_page` on an existing page for a new report — it replaces the page content entirely.
4. **Close the loop.** Comment on the related Product Backlog task (e.g. "Investigate search complaints from enterprise accounts") with the headline number and a link to the doc page.

## API gotchas

- Doc creation parent type is a numeric string: `{"id": "<space_id>", "type": "4"}` for a space.
- New reports get a new page (`clickup_create_document_page`); `clickup_update_document_page` wholesale-replaces existing content.
