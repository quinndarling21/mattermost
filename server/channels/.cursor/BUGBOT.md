# Server channels Bugbot rules

When reviewing changes under `server/channels/`:

- Pay extra attention to API behavior, websocket events, store side effects, and
  permission checks.
- Flag config or data model changes that can break existing clients or clustered
  deployments.
- Expect focused tests when core channel, post, or notification flows change.
