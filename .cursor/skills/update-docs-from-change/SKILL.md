---
name: update-docs-from-change
description: Update the repository-local Mattermost docs from a current branch diff, a specific pull request, or a manually described product/admin change. Use when an engineer or PM asks to update docs for a code change, feature, PR, or written change description.
---

# Update docs from change

Use this skill from the repository root.

## Inputs

Accept any one of these inputs:

- Current branch diff against `origin/master`.
- A pull request number or URL.
- A manual change description from an engineer or PM.

## Workflow

1. Identify the change source.

   - For current branch changes:

     ```bash
     git fetch origin master
     git diff --name-only origin/master...HEAD
     git diff origin/master...HEAD
     ```

   - For a pull request:

     ```bash
     gh pr view <pr-number-or-url> --json number,title,body,baseRefName,headRefName,files
     gh pr diff <pr-number-or-url>
     ```

   - For a manual entry, save the user's description as the change source.

2. Decide whether docs are needed.

   Update docs when the change affects product behavior, admin-visible configuration, user workflows, plugin-managed product behavior, authentication, permissions, compliance, integrations, notifications, files, search, teams, channels, or command-line administration.

   Skip docs when the change is only tests, internal refactoring, build tooling, comments, or implementation detail with no user or admin impact.

3. Inspect the relevant source files.

   Start with these paths when applicable:

   - `webapp/channels/src/components/admin_console/admin_definition.tsx`
   - `server/public/model/config.go`
   - `server/public/model/team.go`
   - `server/public/model/channel.go`
   - `server/public/model/role.go`
   - `server/public/model/permission.go`
   - `webapp/channels/src/components/integrations/`
   - `server/channels/web/webhook.go`

4. Edit the docs directly.

   - Product pages live in `docs/product/`.
   - Administration pages live in `docs/admin/`.
   - Integration pages live in `docs/integrations/`.
   - Add new pages to `docs/.vitepress/config.mts` when they should appear in navigation.
   - Follow `.cursor/rules/docs-standards.mdc`.

5. Verify the site.

   ```bash
   cd docs
   npm run build
   ```

6. Report what changed.

   Include the change source, docs files edited, docs files added, and whether `npm run build` passed.
