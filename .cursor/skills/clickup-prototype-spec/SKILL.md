---
name: clickup-prototype-spec
description: Write a prototype build spec and file it as a task in the ClickUp Prototype Lab list, then report build status back to that task. Use when the user asks to write or file a build spec, push a spec or plan to ClickUp, create a prototype task, or report prototype progress and verification results to ClickUp.
---

# ClickUp prototype spec task

Turn an agreed scope into a build spec filed as a ClickUp task, and keep that task updated as the prototype is built, via the ClickUp MCP server configured in `.cursor/mcp.json`.

## Workspace map

| Thing | Name | ID |
|---|---|---|
| Space | Team Space | `90146618637` |
| List | Prototype Lab | `901418333285` |
| List | Product Backlog | `901418333282` |
| List | Design | `901418333283` |
| Doc | Product Insights | `2kydjj1w-554` |

If an ID returns not-found (workspace was reseeded), resolve by name with `clickup_get_list` / `clickup_search` instead of guessing.

## Workflow

1. **Gather the agreed context first** — the spec is grounded in prior artifacts, not a fresh prompt:
   - The relevant Product Insights doc page (the data evidence).
   - Figma design context: the Mattermost Design System file (`yqPk3ZBWpsYtnoOmNj9Yom`), e.g. the "Search Recovery — Prototype" page.
   - The design system rule `.cursor/rules/design-system.mdc` for tokens and component conventions.
2. **Write the spec** in the task description using this structure:

   ```markdown
   ## Problem & evidence
   [1 paragraph + the 2-3 key numbers from the insights brief]

   ## Scope
   **In:** [components/flows to build]
   **Out:** [explicitly deferred items]

   ## Design references
   [Figma file/page links, frame names, which design system components and tokens to use]

   ## Build plan
   [Ordered steps; target directories in the webapp, e.g. webapp/channels/src/components/search_results/]

   ## Acceptance criteria
   - [ ] [User-visible, checkable criteria — include interaction states: hover, focus, loading, empty, error]

   ## Verification
   [How the build agent proves it works: browser checks, screenshots posted back to this task]
   ```

3. **Create the task** in Prototype Lab with `clickup_create_task` (high priority for active work). Then link it to the source artifacts with `clickup_add_task_link` (the backlog investigation task and the Design exploration task).
4. **Report back during the build.** Post status comments on the task at milestones; attach verification screenshots with `clickup_attach_task_file` (URL/base64) or `clickup_request_attachment_upload` (local files). Set status to `complete` only after verification evidence is attached.

## API gotchas

- `priority` on tasks is a string: `"urgent" | "high" | "normal" | "low"` — not a number.
- Default list statuses are `to do` and `complete`; don't invent custom statuses.
- `clickup_add_tag_to_task` fails unless the tag already exists in the space — skip tags unless they're confirmed to exist.
- Assignees accept `"me"`, emails, or usernames; only real workspace members resolve.
