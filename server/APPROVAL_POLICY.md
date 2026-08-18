# Server approval policy

Applies to files under `server/`. This policy is stricter than the repo root default for backend Go, SQL migrations, and the public plugin surface.

## Auto-approve when all of these hold

- The PR is small and scoped (for example a narrowly targeted bugfix, logging clarity, or test-only addition under `server/` that does not touch the require-human paths below).
- Bugbot and Security review context (when enabled) report no findings that need human follow-up.
- Server CI is green (`server-ci` and related server workflows).

## Require human review

Request human review (and prefer CODEOWNERS such as `@mattermost/product-security` where listed) for:

- Authentication, sessions, OAuth, SAML, LDAP, MFA, and related app code (`server/channels/app/authentication.go`, `session.go`, `oauth.go`, `saml.go`, `ldap.go`, and neighboring session or auth helpers).
- Authorization, roles, and access control (`server/channels/app/authorization.go`, `access_control.go`, and related store or API changes).
- Cloud, license, billing, and customer web server interfaces (`server/channels/app/cloud.go`, `license.go`, `server/channels/api4/cloud.go`, `server/einterfaces/cloud.go`, `server/public/model/cloud.go`).
- Schema or data migrations under `server/channels/db/migrations`, `server/channels/jobs/migrations`, or `server/config/migrations`.
- Plugin host and Plugin API packages under `server/public/plugin` and `server/public/pluginapi`, including generated RPC layers.
- Changes that alter public API contracts under `server/channels/api4` for auth, permissions, sessions, or cloud endpoints.
- Any edit to an `APPROVAL_POLICY.md`, `.cursor/approval-policies/ROUTING.md`, or a routed policy file.

## Conflict rule

Ancestor policies still apply unless they conflict with this file. If specificity is unclear, follow the stricter instruction and do not auto-approve.
