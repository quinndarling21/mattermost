# Webapp channels Bugbot rules

When reviewing changes under `webapp/channels/`:

- Look for regressions in navigation, focus handling, drafts, and message or
  channel workflows.
- Flag brittle async logic, stale memoization, or missing dependency handling in
  React hooks.
- Prefer findings with a clear reproduction path or user-facing failure mode.
