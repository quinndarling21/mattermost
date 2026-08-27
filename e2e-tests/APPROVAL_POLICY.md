# E2E tests approval policy

Applies to files under `e2e-tests/` (Cypress under `e2e-tests/cypress/` and Playwright under `e2e-tests/playwright/`). This policy is closer than the repo root policy for those paths.

## Auto-approve when all of these hold

- The PR only adds or narrowly updates tests, fixtures, or selectors without reducing coverage.
- Changes do not weaken CI gates, skip lists, or required workflows under `.github/workflows/` that drive e2e (those workflow files are covered by routed CI policy, not this directory).
- Bugbot and Security review context (when enabled) report no findings that need human follow-up.
- Relevant e2e CI (`e2e-tests-ci`, `e2e-tests-playwright`, `e2e-tests-cypress`, or related checks) is green when it runs for the PR.

## Require human review

- Deleting tests, skipping previously required cases, or raising flake tolerances in a way that hides failures.
- Changes to shared runners, Docker Compose, or Makefile targets that alter how CI launches Mattermost for e2e.
- Edits that embed credentials, licenses, or production URLs in fixtures.
- Any edit to an `APPROVAL_POLICY.md`, `.cursor/approval-policies/ROUTING.md`, or a routed policy file.

## Conflict rule

Ancestor policies still apply unless they conflict with this file. If specificity is unclear, follow the stricter instruction and do not auto-approve.
