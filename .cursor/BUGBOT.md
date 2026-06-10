# Mattermost Bugbot rules

These project rules are intentionally lightweight and exist to demonstrate how
nested `BUGBOT.md` files can scope Bugbot review guidance across the repo.

- Prioritize correctness, regressions, and missing tests over style-only nits.
- Flag changes that alter public behavior, API contracts, permissions, or data
  shape without corresponding validation in tests or docs.
- Prefer concrete, user-impacting findings over speculative cleanup requests.
