# Team activity digest

Team activity digest sends periodic member activity summaries for a team to an external webhook. Configure it from **System Console > Reporting > Team Statistics** in the **Activity digest** panel for the selected team.

## Access

The Team Statistics page is shown to admins who can read team statistics reporting. Changing digest settings uses the team's `manage_team` permission.

## Settings

Each team has its own activity digest settings:

- **Send periodic activity digests to an external webhook** enables or disables delivery for the selected team.
- **Webhook URL** is required when the digest is enabled.
- **Digest header** is optional HTML shown at the top of the digest preview.
- **Delivery cadence** accepts `daily` or `weekly`.
- **Filter members in preview** searches the preview by username or email address.

The preview lists up to 100 active team members, sorted by last activity. It includes each member's username, post count, and reply count. Post counts include non-deleted root posts, and reply counts include non-deleted replies.

## Test the webhook

Use **Test webhook** to send a test request to the configured webhook URL. The test action is disabled until a webhook URL is entered.

The test request sends a JSON payload with `event` set to `team_digest_test` and a UTC timestamp. Mattermost returns the HTTP status code from the webhook response.

## Delivered digest payload

When the digest is enabled and a webhook URL is configured, Mattermost sends a JSON payload with `event` set to `team_digest`, the team ID, and the member activity list.

Webhook delivery uses `POST` with `Content-Type: application/json`. If the webhook endpoint returns an HTTP status code of `400` or higher, the delivery is treated as failed.
