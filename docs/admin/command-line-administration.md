# Command-line administration

`mmctl` is the command-line admin tool for Mattermost. It supports local and remote administration workflows.

## Common areas

Use `mmctl` for:

- Users
- Teams
- Channels
- Webhooks
- Plugins
- Permissions
- Config
- LDAP and SAML
- Exports

## Source reference

The generated command reference lives under `server/cmd/mmctl/docs/`. When a command changes, update the generated reference and any product or admin page that explains the related workflow.

## Admin guidance

Prefer System Console for routine settings. Use `mmctl` when the workflow is operational, scripted, bulk-oriented, or not exposed in the UI.
