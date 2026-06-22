# Plugins and bundled tools

Several larger product areas are delivered as plugins rather than core channel code.

## Plugin-managed product areas

This repository references these plugin IDs:

- Calls: `com.mattermost.calls`
- Playbooks: `playbooks`
- Boards: `focalboard`
- Apps: `com.mattermost.apps`
- NPS: `com.mattermost.nps`
- AI: `mattermost-ai`
- Channel export: `com.mattermost.plugin-channel-export`

Admins manage plugins through System Console. Availability depends on whether a plugin is installed, enabled, licensed, and allowed by configuration.

## User-facing integrations

Plugins can add product switcher entries, app bar entries, channel header actions, slash commands, bot behavior, and settings pages. Calls adds call controls to channels. Playbooks can launch run workflows from channel routes. Boards integrates with board-specific channel types.

## Admin guidance

When a product behavior depends on a plugin, document the plugin dependency and the relevant System Console setting. Do not describe the behavior as part of core messaging unless the core app works without the plugin.
