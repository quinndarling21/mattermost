# Docs and changelog routing policy

Routed product for documentation and top-level narrative files that do not all live under `docs/`. Discovered via `.cursor/approval-policies/ROUTING.md`. Directory discovery for `docs/APPROVAL_POLICY.md` still applies to paths under `docs/`.

## Boundary

- `docs/**`
- `README.md`
- `CHANGELOG.md`
- `CONTRIBUTING.md`
- `SECURITY.md`

## Auto-approve when all of these hold

- The PR only updates documentation or changelog narrative in the boundary above.
- Changes are additive or corrective (clarifications, link fixes, release-note wording) and do not remove security guidance.
- Bugbot and Security review context (when enabled) report no findings that need human follow-up.
- Docs-related checks such as `docs-impact-review` are green when they run.

## Require human review

- Weakening or deleting security, vulnerability-reporting, or permissions guidance in `SECURITY.md` or `docs/admin/authentication-and-security.md`.
- Rewrites of contribution or support process that change how security reports are handled.
- Any edit to an `APPROVAL_POLICY.md`, this routing file, or other files under `.cursor/approval-policies/`. Markdown alone does not make a policy file auto-approvable.

## Conflict rule

If this routed policy conflicts with a closer directory `APPROVAL_POLICY.md`, follow the closer policy when specificity is clear. If specificity is unclear, follow the stricter instruction and do not auto-approve.
