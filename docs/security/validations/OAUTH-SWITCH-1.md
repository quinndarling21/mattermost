# OAUTH-SWITCH-1 OAuth session can unlink SSO and set a password — independent verification

- **Verdict:** `validated`
- **Candidate:** OAUTH-SWITCH-1 OAuth session can unlink SSO and set a password
- **Product revision:** `8c311f260ff17092de4a8775ddfc92f1b34681e5`
- **Workspace HEAD at rerun:** `be04ce2a6c14d9bab02da731b13dbffe8397b1ea` (test-only commits; product user/oauth/switch files unchanged vs `8c311f`)
- **Verifier:** security-verifier (did not author the test; test not modified)

## Command

```bash
cd /workspace/docs/security/validations/OAUTH-SWITCH-1 && go test -v -count=1 .
```

- **Exit code:** `1`
- **Outcome:** `FAIL` for the claimed missing `IsOAuth` deny on `switchAccountType` OAuthToEmail and `SwitchOAuthToEmail` before `UpdatePassword`, not a setup or import error

## Assertions vs observed

| Subtest | Expected | Received |
| ------- | -------- | -------- |
| `oauth_to_email_branch_contains_IsOAuth` | FAIL: OAuthToEmail branch of `switchAccountType` has no `IsOAuth` | FAIL `oauth_switch_guard_test.go:27`: branch is `SessionRequired()` then `SwitchOAuthToEmail(..., switchRequest.NewPassword, Session().UserId)` with no `IsOAuth` |
| `switch_oauth_to_email_denies_oauth_session_before_UpdatePassword` | FAIL: `Session().IsOAuth` absent before `UpdatePassword` | FAIL `:38`: `Session().IsOAuth not found, UpdatePassword at 1436` |
| negative control: `createUserAccessToken_denies_oauth` | PASS (`IsOAuth` + `"attempted access by oauth app"`) | PASS |
| negative control: `gitlab_to_email_is_OAuthToEmail` | PASS (`CurrentService` gitlab and `NewService` email) | PASS |

No compile, import, or file-read failures. Failure text matches the author log (`docs/security/validations/OAUTH-SWITCH-1/author.log`).

## Reconstructed attack chain (from product code, not the specialist summary)

1. **OAuth session mint:** `newSession` builds `Session{UserId: user.Id, Roles: user.Roles, IsOAuth: true}` (`server/channels/app/oauth.go:513-528`). `EnableOAuthServiceProvider` defaults true (`server/public/model/config.go:580-581`).
2. **Token accepted on API:** `ServeHTTP` parses the bearer/query token, `GetSession`, and attaches it. Query-string tokens are denied only when `!session.IsOAuth` (`server/channels/web/handlers.go:259-276`). CSRF applies only to cookie tokens (`handlers.go:498-499`).
3. **Switch route:** `POST /api/v4/users/login/switch` is `APIHandler(switchAccountType)` (`server/channels/api4/user.go:72`). The OAuthToEmail branch calls `SessionRequired()` (UserId non-empty only; no `IsOAuth` deny) then `SwitchOAuthToEmail(..., switchRequest.NewPassword, Session().UserId)` (`user.go:2826-2832`). Contrast: `createUserAccessToken` denies `Session().IsOAuth` with `"attempted access by oauth app"` (`user.go:2879-2882`).
4. **Predicate:** `SwitchRequest.OAuthToEmail()` is true for gitlab/google/office365/openid/saml → email (`server/public/model/switch_request.go:34-39`).
5. **App layer:** `SwitchOAuthToEmail` checks transfer/email-login flags (email signup/signin default true, `config.go:2148-2157`; licensed-only `ExperimentalEnableAuthenticationTransfer` also defaults true, `config.go:850-851`), `user.Id == requesterId`, and `user.IsOAuthUser() \|\| user.IsSAMLUser()`. There is no `rctx.Session().IsOAuth` check. It then calls `UpdatePassword` (`server/channels/app/oauth.go:1207-1239`).
6. **Credential rewrite:** `SqlUserStore.UpdatePassword` sets `Password`, `AuthData = NULL`, `AuthService = ''` (`server/channels/store/sqlstore/user_store.go:411-414`). `SwitchOAuthToEmail` then `RevokeAllSessions` (`oauth.go:1249-1251`). Email/password login is then available.

Every required edge is present in this tree. The independent rerun failed on the two missing-`IsOAuth` assertions that encode that gap. Negative controls confirm the same file still has the OAuth deny on PAT create, and gitlab→email is an `OAuthToEmail` request.

## Evidence paths

- Test (unchanged): `docs/security/validations/OAUTH-SWITCH-1/oauth_switch_guard_test.go`
- Author log: `docs/security/validations/OAUTH-SWITCH-1/author.log`
- Verifier log: `docs/security/validations/OAUTH-SWITCH-1/verifier.log`
- This record: `docs/security/validations/OAUTH-SWITCH-1.md`
- Ledger: `docs/security/security-findings.md`

## Verdict rationale

`validated` — independent reconstruction holds; identical command fails for missing `IsOAuth` on `switchAccountType` OAuthToEmail and missing `Session().IsOAuth` before `UpdatePassword` in `SwitchOAuthToEmail`; negative controls (`createUserAccessToken` IsOAuth deny; gitlab→email `OAuthToEmail`) pass.
