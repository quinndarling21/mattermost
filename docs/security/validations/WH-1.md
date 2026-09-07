# WH-1 Incoming webhook UserId attribution — independent verification

- **Verdict:** `validated`
- **Candidate:** WH-1 Incoming webhook UserId attribution
- **Product revision:** `8c311f260ff17092de4a8775ddfc92f1b34681e5`
- **Workspace HEAD at rerun:** `be04ce2a6c14d9bab02da731b13dbffe8397b1ea` (test-only commits; product webhook/role/permission files unchanged vs `8c311f`)
- **Verifier:** security-verifier (did not author the test; test not modified)

## Command

```bash
cd /workspace/docs/security/validations/WH-1 && go test -v -count=1 .
```

- **Exit code:** `1`
- **Outcome:** `FAIL` for the claimed missing authorization, not a setup or import error

## Assertions vs observed

| Subtest | Expected | Received |
| ------- | -------- | -------- |
| precondition: team_admin has `manage_others_incoming_webhooks` and `bypass_incoming_webhook_channel_lock` | PASS | PASS |
| negative control: team_user must not include `manage_others_incoming_webhooks` | PASS | PASS |
| createIncomingHook other-user branch: GetUser only; missing target-user authorization | FAIL: no `HasPermissionToChannel` or `IsSystemAdmin` on that branch | FAIL `webhook_userid_validation_test.go:66`: `other-user branch has no HasPermissionToChannel or IsSystemAdmin check for the target user` |
| `ValidateIncomingWebhookUser` must exist in webhook handlers | FAIL: identifier absent from api4 and app webhook.go | FAIL `:71` api4 and `:74` app: does not contain `ValidateIncomingWebhookUser` |
| HandleIncomingWebhook posts as `hook.UserId`; open channels skip membership | PASS (documents the sink) | PASS |

No compile, import, or file-read failures.

## Reconstructed attack chain (from product code, not the specialist summary)

1. **Attacker:** default `team_admin`. `MakeDefaultRoles` grants `PermissionManageOthersIncomingWebhooks` and `PermissionBypassIncomingWebhookChannelLock` (`server/public/model/role.go:995-1012`). Permission ids are `manage_others_incoming_webhooks` and `bypass_incoming_webhook_channel_lock` (`server/public/model/permission.go:746-762`). Default `team_user` does not get `manage_others_incoming_webhooks` (`role.go:953-968`).
2. **Create path:** `POST /api/v4/hooks/incoming` is session-required (`server/channels/api4/webhook.go:15,29`). When `hook.UserId != "" && hook.UserId != session.UserId`, the handler requires team `manage_others_incoming_webhooks`, then only `GetUser(hook.UserId)`, then sets `userId = hook.UserId` (`api4/webhook.go:59-73`). That other-user branch does not call `HasPermissionToChannel` or `IsSystemAdmin`. `ValidateIncomingWebhookUser` does not appear anywhere under `server/`.
3. **Persist:** `CreateIncomingWebhookForChannel` assigns `hook.UserId = creatorId` (`server/channels/app/webhook.go:396-401`), so the attacker-chosen id is stored. If the session has `bypass_incoming_webhook_channel_lock`, `ChannelLocked` is not forced (`api4/webhook.go:75-78`).
4. **Unauthenticated sink:** `POST /hooks/{id}` uses `APIHandlerTrustRequester` (`server/channels/web/webhook.go:22`) and calls `HandleIncomingWebhook`.
5. **Post as bound user:** `HandleIncomingWebhook` loads the user by `hook.UserId`, skips `HasPermissionToChannel` when `channel.Type == ChannelTypeOpen` (`app/webhook.go:865-872`), opens DMs with `GetOrCreateDirectChannel(rctx, hook.UserId, result.Id)` on `@username` (`app/webhook.go:801-811`), and posts with `CreateWebhookPost(..., hook.UserId, ...)` which sets `post.UserId` (`app/webhook.go:316-320,912`). Unlocked hooks that retarget a non-open channel use the bound user's `ReadChannelContent`, including a `system_admin` target.

Every required edge is present in this tree. The independent rerun failed on the two missing-check assertions that encode that gap.

## Evidence paths

- Test (unchanged): `docs/security/validations/WH-1/webhook_userid_validation_test.go`
- Author log: `docs/security/validations/WH-1/author.log`
- Verifier log: `docs/security/validations/WH-1/verifier.log`
- This record: `docs/security/validations/WH-1.md`
- Ledger: `docs/security/security-findings.md`

## Verdict rationale

`validated` — independent reconstruction holds; identical command fails for missing `ValidateIncomingWebhookUser` and missing target-user `HasPermissionToChannel` / `IsSystemAdmin` on the `createIncomingHook` other-user branch; preconditions and negative control pass.
