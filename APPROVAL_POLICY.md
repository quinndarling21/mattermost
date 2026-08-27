# Approval policy

Conservative default for this Mattermost monorepo. Closer `APPROVAL_POLICY.md` files under `docs/`, `e2e-tests/`, `server/`, and `webapp/` override this file for paths under those trees when they are more specific. Routed policies listed in `.cursor/approval-policies/ROUTING.md` also apply for matching products.

## Auto-approve when all of these hold

- The PR is small and scoped: one clear concern, limited file count, and no drive-by refactors.
- Changed paths are low risk for the areas they touch (for example typo fixes, comment-only edits, or narrowly scoped non-security bugfixes outside the require-human paths below).
- Bugbot and Security review context (when enabled) report no findings that need human follow-up.
- Required CI for the touched areas is green (`server-ci`, `webapp-ci`, e2e workflows, and related checks as applicable).
- The PR does not change approval policy files, routing files, or `.cursor/hooks/`.

## Require human review

Do not auto-approve when any of the following apply. Prefer requesting review from the relevant CODEOWNERS entry when one exists (for example `@mattermost/product-security` on `server/channels/app/authentication.go` and `server/channels/app/authorization.go`).

- Auth, sessions, OAuth, SAML, LDAP, MFA, or login flows (for example `server/channels/app/authentication.go`, `server/channels/app/session.go`, `server/channels/app/oauth.go`, `server/channels/app/saml.go`, `server/channels/app/ldap.go`, and webapp login or authorize UI under `webapp/channels/src/components/login` and `webapp/channels/src/components/authorize`).
- Permissions, roles, access control, or permission scheme UI (for example `server/channels/app/authorization.go`, `server/channels/app/access_control.go`, and `webapp/channels/src/components/admin_console/permission_schemes_settings` or `webapp/channels/src/components/permissions_gates`).
- Secrets, credentials, tokens, licenses, or anything that handles `MM_LICENSE`, cloud billing, or payment UI (for example `server/channels/app/license.go`, `server/channels/app/cloud.go`, `server/channels/api4/cloud.go`, and `webapp/channels/src/components/payment_form`).
- Database schema or data migrations under `server/channels/db/migrations`, `server/channels/jobs/migrations`, or `server/config/migrations`.
- Plugin API or plugin host surface under `server/public/plugin` and `server/public/pluginapi`.
- Cursor hooks or agent runtime behavior under `.cursor/hooks/` or `.cursor/hooks.json`.
- Any change to `APPROVAL_POLICY.md`, `.cursor/approval-policies/ROUTING.md`, or routed policy files under `.cursor/approval-policies/`. A PR that edits these files must not use the new content to relax review for that same PR.

## Conflict rule

When applicable policies disagree, follow the closest (most specific) policy. If specificity is unclear, follow the stricter instruction and do not auto-approve.
