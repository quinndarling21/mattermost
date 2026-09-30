# CI workflows routing policy

Routed product for GitHub Actions workflows and reusable actions. Discovered via `.cursor/approval-policies/ROUTING.md`. These paths have no dedicated directory `APPROVAL_POLICY.md`; routing fills that gap.

## Boundary

- `.github/workflows/**`
- `.github/actions/**`

## Auto-approve when all of these hold

- The PR only makes low-risk CI hygiene changes (label text, documentation comments in workflow YAML, or additive non-gating steps that do not change required checks).
- Bugbot and Security review context (when enabled) report no findings that need human follow-up.
- Workflow syntax and related CI are green for the PR.

## Require human review

- Changing required checks, job `if:` conditions, continue-on-error, or status overrides that make failures look green (including `e2e-tests-override-status.yml`, `pr-test-analysis-override.yml`, and similar override workflows).
- Editing secrets usage, OIDC, deploy, Docker push, CodeQL, Scorecards, or release tagging workflows (`docker-push-mirrored.yml`, `codeql-analysis.yml`, `scorecards-analysis.yml`, `tag-public-module.yaml`, and related).
- Weakening `server-ci.yml`, `webapp-ci.yml`, `e2e-tests-ci.yml`, `e2e-tests-on-merge.yml`, or template workflows those files call.
- Any edit to an `APPROVAL_POLICY.md`, `.cursor/approval-policies/ROUTING.md`, or other routed policy files.

## Conflict rule

If this routed policy conflicts with another applicable policy and specificity is unclear, follow the stricter instruction and do not auto-approve.
