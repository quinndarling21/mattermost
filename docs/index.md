# Mattermost Docs

This site documents the product behavior and administration workflows in this repository. Treat the application source as the authority. When behavior changes in the app, update these docs in the same branch or let the documentation impact automation open a follow-up pull request.

## What is covered

- Product behavior for teams, channels, messaging, files, search, notifications, plugins, and integrations.
- Administration workflows in System Console, authentication, permissions, compliance, and mmctl.
- Operational details that admins need when configuring this instance.

## Local access

Run the docs site with:

```bash
cd docs
npm run dev
```

The local docs site listens at `http://localhost:3001`. The Mattermost web app header links to that address when you are signed in.

## Source of truth

These docs are based on the current repository. The most important source areas are:

- `webapp/channels/src/components/admin_console/admin_definition.tsx` for System Console sections and settings.
- `server/public/model/config.go` for server defaults and config fields.
- `server/public/model/team.go` and `server/public/model/channel.go` for team and channel behavior.
- `server/public/model/role.go` and `server/public/model/permission.go` for roles and permissions.
- `webapp/channels/src/components/integrations/` and `server/channels/web/webhook.go` for integration behavior.
