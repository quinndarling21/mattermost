# E2E Bugbot rules

When reviewing changes under `e2e-tests/`:

- Focus on flakiness, brittle selectors, and environment-dependent assumptions.
- Prefer resilient assertions over sleeps, arbitrary waits, or implementation
  detail checks.
- Flag tests that hide real regressions by asserting too little or retrying too
  broadly.
