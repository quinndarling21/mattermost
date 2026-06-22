# Files, search, and notifications

Files, search, and notifications are tightly connected because file extraction can affect search results and notification settings affect message delivery.

## File storage and sharing

Local file storage is the default and stores files under `./data/`. Admins can configure Amazon S3 or Azure Blob storage instead.

Admins can configure:

- Maximum file size.
- Whether file attachments are enabled.
- Whether mobile users can upload or download files.
- Whether public file links are allowed.
- Whether document contents are extracted for search.
- Whether ZIP contents are inspected for search.

## Search

Database search is the default search mode. Elasticsearch can be used for indexing and queries when configured. Elasticsearch settings are split so admins can enable indexing, enable search queries, rebuild indexes, and control autocomplete and public-channel search behavior separately.

Search results can be truncated by server limits. When this happens, the web app shows a banner explaining that not all results are visible.

## Notifications

Admins can configure email, desktop, mobile push, and mention behavior.

Email notifications can be disabled globally or batched. Push notifications can be off, use the Mattermost-hosted push service, use the test push service, or use a custom push server. Desktop notifications respect user settings, channel mute state, thread state, do-not-disturb, and client type.
