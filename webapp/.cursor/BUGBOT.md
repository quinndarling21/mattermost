# Webapp Bugbot rules

When reviewing changes under `webapp/`:

- Prioritize user-visible regressions, accessibility issues, and state
  management bugs.
- Flag changes that skip loading, error, permission, or i18n handling in
  important UI flows.
- Expect tests when reducers, selectors, hooks, or shared components change.
