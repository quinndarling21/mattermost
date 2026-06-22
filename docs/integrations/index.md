# Webhooks, commands, OAuth, and bots

Integrations let teams connect external systems to Mattermost.

## Admin toggles

System Console includes settings for:

- Incoming webhooks.
- Outgoing webhooks.
- Slash commands.
- OAuth 2.0 provider behavior.
- Outgoing OAuth connections.
- Dynamic client registration and redirect URI allowlists.
- Bot accounts.
- Integration request timeout.

## Team-level integration pages

When enabled and permitted, teams can manage incoming webhooks, outgoing webhooks, slash commands, OAuth apps, outgoing OAuth connections, and bot accounts from the integrations UI.

## Incoming webhooks

Incoming webhooks post to `POST /hooks/{id}`. The endpoint accepts JSON, form-encoded, and multipart requests, and webhook posts are labeled as bot messages.

## Activity digest webhooks

Team activity digest can send outbound JSON requests to an external webhook configured per team from **System Console > Reporting > Team Statistics**. Test requests use the `team_digest_test` event, and delivered digests use the `team_digest` event with the team ID and member activity list.

## Admin guidance

Keep integration docs clear about scope. Some settings are server-wide, while individual webhooks, commands, OAuth apps, and bots belong to a team or channel workflow.
