package wh1_test

import (
	"os"
	"strings"
	"testing"
)

const (
	api4WebhookPath  = "/workspace/server/channels/api4/webhook.go"
	appWebhookPath   = "/workspace/server/channels/app/webhook.go"
	roleGoPath       = "/workspace/server/public/model/role.go"
	permissionGoPath = "/workspace/server/public/model/permission.go"
)

func TestWH1IncomingWebhookUserIdAttribution(t *testing.T) {
	api4Src := mustRead(t, api4WebhookPath)
	appSrc := mustRead(t, appWebhookPath)
	roleSrc := mustRead(t, roleGoPath)
	permSrc := mustRead(t, permissionGoPath)

	manageOthers := permissionID(t, permSrc, "PermissionManageOthersIncomingWebhooks")
	bypassLock := permissionID(t, permSrc, "PermissionBypassIncomingWebhookChannelLock")
	if manageOthers != "manage_others_incoming_webhooks" {
		t.Fatalf("unexpected PermissionManageOthersIncomingWebhooks id %q", manageOthers)
	}
	if bypassLock != "bypass_incoming_webhook_channel_lock" {
		t.Fatalf("unexpected PermissionBypassIncomingWebhookChannelLock id %q", bypassLock)
	}

	t.Run("precondition: team_admin has manage_others_incoming_webhooks and bypass_incoming_webhook_channel_lock", func(t *testing.T) {
		perms := makeDefaultRolePermissions(t, roleSrc, "TeamAdminRoleId")
		if !containsIdent(perms, "PermissionManageOthersIncomingWebhooks") {
			t.Fatalf("TeamAdminRoleId missing PermissionManageOthersIncomingWebhooks.Id (id=%s)", manageOthers)
		}
		if !containsIdent(perms, "PermissionBypassIncomingWebhookChannelLock") {
			t.Fatalf("TeamAdminRoleId missing PermissionBypassIncomingWebhookChannelLock.Id (id=%s)", bypassLock)
		}
	})

	t.Run("negative control: team_user must not include manage_others_incoming_webhooks", func(t *testing.T) {
		perms := makeDefaultRolePermissions(t, roleSrc, "TeamUserRoleId")
		if containsIdent(perms, "PermissionManageOthersIncomingWebhooks") {
			t.Fatalf("TeamUserRoleId unexpectedly includes PermissionManageOthersIncomingWebhooks.Id (id=%s)", manageOthers)
		}
	})

	t.Run("createIncomingHook other-user branch: GetUser only; missing target-user authorization", func(t *testing.T) {
		fn := extractFunc(api4Src, "createIncomingHook")
		if fn == "" {
			t.Fatal("createIncomingHook not found in api4/webhook.go")
		}
		branch := extractOtherUserBranch(fn)
		if branch == "" {
			t.Fatal("createIncomingHook other-user branch (hook.UserId != session user) not found")
		}

		if !strings.Contains(branch, "GetUser") {
			t.Error("other-user branch does not call GetUser (existence check)")
		}

		// Secure contract (false today): target user must be authorized, not merely existent.
		if strings.Contains(branch, "HasPermissionToChannel") || strings.Contains(branch, "IsSystemAdmin") {
			return
		}
		t.Error("other-user branch has no HasPermissionToChannel or IsSystemAdmin check for the target user")
	})

	t.Run("ValidateIncomingWebhookUser must exist in webhook handlers", func(t *testing.T) {
		if !strings.Contains(api4Src, "ValidateIncomingWebhookUser") {
			t.Errorf("%s does not contain ValidateIncomingWebhookUser", api4WebhookPath)
		}
		if !strings.Contains(appSrc, "ValidateIncomingWebhookUser") {
			t.Errorf("%s does not contain ValidateIncomingWebhookUser", appWebhookPath)
		}
	})

	t.Run("HandleIncomingWebhook posts as hook.UserId; open channels skip membership", func(t *testing.T) {
		fn := extractFunc(appSrc, "HandleIncomingWebhook")
		if fn == "" {
			t.Fatal("HandleIncomingWebhook not found in app/webhook.go")
		}
		if !strings.Contains(fn, "CreateWebhookPost") || !strings.Contains(fn, "hook.UserId") {
			t.Error("HandleIncomingWebhook does not post as hook.UserId")
		}

		openGate := strings.Contains(fn, "ChannelTypeOpen")
		permCheck := strings.Contains(fn, "HasPermissionToChannel")
		if !openGate || !permCheck {
			t.Error("expected open-channel gate around HasPermissionToChannel in HandleIncomingWebhook")
		}
	})
}

func mustRead(t *testing.T, path string) string {
	t.Helper()
	b, err := os.ReadFile(path)
	if err != nil {
		t.Fatalf("read %s: %v", path, err)
	}
	return string(b)
}

func permissionID(t *testing.T, permSrc, ident string) string {
	t.Helper()
	marker := ident + " = &Permission{"
	i := strings.Index(permSrc, marker)
	if i < 0 {
		t.Fatalf("%s not found in permission.go", ident)
	}
	rest := permSrc[i:]
	quote := strings.Index(rest, `"`)
	if quote < 0 {
		t.Fatalf("%s: missing string id", ident)
	}
	rest = rest[quote+1:]
	end := strings.Index(rest, `"`)
	if end < 0 {
		t.Fatalf("%s: unterminated string id", ident)
	}
	return rest[:end]
}

func makeDefaultRolePermissions(t *testing.T, roleSrc, roleConst string) string {
	t.Helper()
	marker := "roles[" + roleConst + "] = &Role{"
	i := strings.Index(roleSrc, marker)
	if i < 0 {
		t.Fatalf("MakeDefaultRoles assignment for %s not found", roleConst)
	}
	block := extractBraceBlock(roleSrc, i+strings.Index(roleSrc[i:], "{"))
	permMarker := "Permissions: []string{"
	p := strings.Index(block, permMarker)
	if p < 0 {
		t.Fatalf("%s has no Permissions slice in MakeDefaultRoles", roleConst)
	}
	return extractBraceBlock(block, p+strings.Index(block[p:], "{"))
}

func containsIdent(permsBlock, ident string) bool {
	return strings.Contains(permsBlock, ident+".Id")
}

func extractFunc(src, name string) string {
	marker := "func " + name + "("
	i := strings.Index(src, marker)
	if i < 0 {
		marker = ") " + name + "("
		i = strings.Index(src, marker)
		if i < 0 {
			return ""
		}
		funcIdx := strings.LastIndex(src[:i], "func ")
		if funcIdx < 0 {
			return ""
		}
		i = funcIdx
	}
	brace := strings.Index(src[i:], "{")
	if brace < 0 {
		return ""
	}
	return src[i : i+brace] + extractBraceBlock(src, i+brace)
}

func extractOtherUserBranch(createIncomingHookSrc string) string {
	const marker = `if hook.UserId != "" && hook.UserId != userId {`
	i := strings.Index(createIncomingHookSrc, marker)
	if i < 0 {
		return ""
	}
	brace := strings.Index(createIncomingHookSrc[i:], "{")
	if brace < 0 {
		return ""
	}
	return createIncomingHookSrc[i : i+brace] + extractBraceBlock(createIncomingHookSrc, i+brace)
}

func extractBraceBlock(src string, openBraceIdx int) string {
	if openBraceIdx < 0 || openBraceIdx >= len(src) || src[openBraceIdx] != '{' {
		return ""
	}
	depth := 0
	for j := openBraceIdx; j < len(src); j++ {
		switch src[j] {
		case '{':
			depth++
		case '}':
			depth--
			if depth == 0 {
				return src[openBraceIdx : j+1]
			}
		}
	}
	return ""
}
