# Docs approval policy

Applies to files under `docs/`. This policy is closer than the repo root policy for documentation-only changes. It does not apply to markdown outside `docs/` (for example `README.md`, `CHANGELOG.md`, or approval policy files).

## Auto-approve when all of these hold

- The PR only changes copy, structure, or examples under `docs/` (including `docs/admin/`, `docs/product/`, and `docs/integrations/`).
- Edits are additive or corrective: new sections, clarified steps, fixed links, or typo fixes.
- Bugbot and Security review context (when enabled) report no findings that need human follow-up.
- Docs-related CI such as `docs-impact-review` is green when it runs.

## Require human review

- Deleting substantial documentation, or rewriting security, authentication, compliance, or permissions guidance in a way that weakens or contradicts prior advice (especially under `docs/admin/authentication-and-security.md` and `docs/admin/users-and-permissions.md`).
- Changes that instruct operators to disable security controls, skip upgrades, or bypass authentication.
- Any edit to an `APPROVAL_POLICY.md`, `.cursor/approval-policies/ROUTING.md`, or a routed policy file, even if the file is markdown.

## Conflict rule

Ancestor policies still apply unless they conflict with this file. If specificity is unclear, follow the stricter instruction and do not auto-approve.
