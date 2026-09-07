# Security findings ledger — 2026-09-06

Revision: `8c311f260ff17092de4a8775ddfc92f1b34681e5`

## WH-1 Incoming webhook UserId attribution

- **Domain:** Incoming webhook identity
- **Specialist:** authorization-reviewer
- **Status:** validated
- **Attacker:** default `team_admin` (or any principal with `manage_others_incoming_webhooks`)
- **Chain:** `POST /api/v4/hooks/incoming` with attacker-chosen `user_id` → `createIncomingHook` only `GetUser` → `CreateIncomingWebhookForChannel` stores that id → unauthenticated `POST /hooks/{id}` `CreateWebhookPost` as `hook.UserId`; `@username` `GetOrCreateDirectChannel`; unlocked hooks retarget private channels using the bound user's (including system_admin) `ReadChannelContent`
- **Evidence:** `server/channels/api4/webhook.go:59-77`, `server/channels/app/webhook.go:396-401`, `801-912`, `server/public/model/role.go:995-1012`, `server/public/model/config.go:592-593`
- **Validation:** `docs/security/validations/WH-1.md` — independent rerun `cd /workspace/docs/security/validations/WH-1 && go test -v -count=1 .` exit 1; FAIL on missing `ValidateIncomingWebhookUser` and missing target-user `HasPermissionToChannel`/`IsSystemAdmin`; preconditions and negative control PASS. Logs: `docs/security/validations/WH-1/author.log`, `docs/security/validations/WH-1/verifier.log`
- **Upstream fix absent:** `ab31663fce`
- **Impact:** forge posts and DMs as any user including system_admin

## OAUTH-SWITCH-1 OAuth session can unlink SSO and set a password

- **Domain:** Credential lifecycle
- **Specialist:** credential-reviewer
- **Status:** validating
- **Attacker:** operator of an OAuth app the victim authorized (`EnableOAuthServiceProvider` default true; app registration is `manage_oauth` / system_admin, then any user who consents)
- **Chain:** OAuth access token → session `IsOAuth: true` with full `user.Roles` → `POST /api/v4/users/login/switch` OAuthToEmail with attacker-chosen `new_password` → `SwitchOAuthToEmail` `UpdatePassword` (clears AuthService) → `RevokeAllSessions` → attacker logs in with email+password
- **Evidence:** `server/channels/api4/user.go:72`, `2810-2832`, `server/channels/app/oauth.go:513-528`, `1207-1253`
- **Upstream fix absent:** `04a0efba6f` (handler + app-layer `IsOAuth` deny)
- **Impact:** account takeover of SSO users who authorized any integration

## Retracted this run

- SAML unsigned RelayState: `fullyQualifiedRedirectURL` blocks off-site token attach; OSS `email_token` unused
- SSO `MakeClient(true)`: admin-only OpenID config
- Link-preview redirect vs RestrictLinkPreviews: default empty; reserved-IP still filtered
- Config patch SignaturePublicKeyFiles: same principal can install plugins
- PAT revoke/disable/enable via OAuth: PAT perms not default; DoS not theft — below bar next to ATO
- OAuth deauthorize other apps: availability only
