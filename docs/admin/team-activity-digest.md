# Team activity digest

Team activity digest settings are configured per team from **System Console > Reporting > Team Statistics**. The Activity digest panel appears below the team statistics for the selected team.

## Access

Users must have permission to manage the selected team to view, save, preview, or test that team's digest settings. Access to the Team Statistics page itself follows the System Console reporting permissions for team statistics.

Digest settings are stored per team under the internal plugin ID `com.mattermost.team-digest`.

## Configure a team digest

1. Go to **System Console > Reporting > Team Statistics**.
2. Select the team from the team filter.
3. In **Activity digest**, enable **Send periodic activity digests to an external webhook**.
4. Enter a **Webhook URL**. A webhook URL is required when the digest is enabled.
5. Optionally enter a **Digest header**. The header is HTML shown at the top of the digest preview.
6. Choose a **Delivery cadence** of `daily` or `weekly`.
7. Select **Test webhook** to send a test request to the configured webhook URL.
8. Select **Save**.

## Preview member activity

The digest preview shows the configured header and a table of member activity for the selected team. The preview can be filtered by username or email address.

Member activity is limited to active team members and is ordered by last activity, with at most 100 members returned. Activity counts include non-deleted posts and replies across the server for each listed user.

## Webhook behavior

The test action sends a JSON request to the webhook URL and returns the HTTP status code from the remote service. The test payload includes `event: "team_digest_test"` and a UTC `timestamp`.

Digest delivery requests use JSON and include `event: "team_digest"`, the `team_id`, and a `members` array with member activity fields such as `user_id`, `username`, `email`, `last_activity_at`, `post_count`, and `reply_count`.

Webhook requests include an `Authorization` header. The exact credential is implementation detail and should not be copied into external documentation.
