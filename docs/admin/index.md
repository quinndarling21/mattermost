# System Console

System Console is the main administration UI for this Mattermost instance. The console definition in the web app is the best source for current sections, settings, license gates, help text, and links.

## Main sections

- About
- Billing
- Reporting
- User Management
- System Attributes
- Environment
- Site Configuration
- Authentication
- Plugins
- Integrations
- Compliance
- Experimental

## How settings work

Most settings map to server config keys. The web app exposes the setting, help text, validation, and visibility rules. The server config defines defaults and backend behavior.

Useful source areas:

- `webapp/channels/src/components/admin_console/admin_definition.tsx`
- `webapp/channels/src/components/admin_console/admin_console.tsx`
- `webapp/channels/src/utils/admin_console_index.tsx`
- `server/public/model/config.go`

## Delegated administration

System Console permissions can be delegated by resource area. Read and write access are separate, so a role can inspect one area without changing it.
