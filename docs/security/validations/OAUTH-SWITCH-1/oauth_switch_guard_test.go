// Source-level reproduction for OAUTH-SWITCH-1.
// Expects FAIL on this revision: switchAccountType OAuthToEmail and
// SwitchOAuthToEmail lack the Session().IsOAuth deny added upstream in 04a0efba6f.
package oauthswitch1_test

import (
	"os"
	"path/filepath"
	"regexp"
	"runtime"
	"strings"
	"testing"
)

func TestOAuthSwitchMissingIsOAuthDeny(t *testing.T) {
	root := repoRoot(t)
	userSrc := readRepoFile(t, root, "server/channels/api4/user.go")
	oauthSrc := readRepoFile(t, root, "server/channels/app/oauth.go")
	switchSrc := readRepoFile(t, root, "server/public/model/switch_request.go")

	t.Run("oauth_to_email_branch_contains_IsOAuth", func(t *testing.T) {
		fn := extractFunc(t, userSrc, "func switchAccountType")
		branch := extractBetween(t, fn, "switchRequest.OAuthToEmail()", "} else if")
		if strings.Contains(branch, "IsOAuth") {
			return
		}
		t.Fatalf("OAuthToEmail branch of switchAccountType must contain IsOAuth (upstream Session().IsOAuth deny before SwitchOAuthToEmail); got:\n%s", branch)
	})

	t.Run("switch_oauth_to_email_denies_oauth_session_before_UpdatePassword", func(t *testing.T) {
		body := extractFunc(t, oauthSrc, "func (a *App) SwitchOAuthToEmail")
		guard := strings.Index(body, "Session().IsOAuth")
		update := strings.Index(body, "UpdatePassword")
		if update < 0 {
			t.Fatal("SwitchOAuthToEmail must call UpdatePassword; UpdatePassword not found")
		}
		if guard < 0 {
			t.Fatalf("SwitchOAuthToEmail must contain Session().IsOAuth before UpdatePassword; Session().IsOAuth not found, UpdatePassword at %d", update)
		}
		if guard > update {
			t.Fatalf("SwitchOAuthToEmail must contain Session().IsOAuth before UpdatePassword; Session().IsOAuth at %d, UpdatePassword at %d", guard, update)
		}
	})

	t.Run("createUserAccessToken_denies_oauth", func(t *testing.T) {
		fn := extractFunc(t, userSrc, "func createUserAccessToken")
		if !strings.Contains(fn, "IsOAuth") {
			t.Fatal("negative control: createUserAccessToken must contain IsOAuth")
		}
		if !strings.Contains(fn, "attempted access by oauth app") {
			t.Fatal("negative control: createUserAccessToken must deny with \"attempted access by oauth app\"")
		}
	})

	t.Run("gitlab_to_email_is_OAuthToEmail", func(t *testing.T) {
		fn := extractFunc(t, switchSrc, "func (o *SwitchRequest) OAuthToEmail()")
		gitlab := lookupModelStringConst(t, root, "UserAuthServiceGitlab")
		email := lookupModelStringConst(t, root, "UserAuthServiceEmail")
		currentOK := comparisonMentions(fn, "o.CurrentService", "UserAuthServiceGitlab")
		newOK := comparisonMentions(fn, "o.NewService", "UserAuthServiceEmail")
		oauthToEmail := currentOK && newOK && gitlab != "" && email != ""
		if !oauthToEmail {
			t.Fatalf("SwitchRequest.OAuthToEmail must be true for gitlab→email; gitlab_const=%q email_const=%q current_cmp=%v new_cmp=%v body:\n%s", gitlab, email, currentOK, newOK, fn)
		}
	})
}

func repoRoot(t *testing.T) string {
	t.Helper()
	_, thisFile, _, ok := runtime.Caller(0)
	if !ok {
		t.Fatal("runtime.Caller failed")
	}
	root := filepath.Clean(filepath.Join(filepath.Dir(thisFile), "..", "..", "..", ".."))
	if _, err := os.Stat(filepath.Join(root, "server", "channels", "api4", "user.go")); err != nil {
		t.Fatalf("repo root %s missing server/channels/api4/user.go: %v", root, err)
	}
	return root
}

func readRepoFile(t *testing.T, root, rel string) string {
	t.Helper()
	b, err := os.ReadFile(filepath.Join(root, filepath.FromSlash(rel)))
	if err != nil {
		t.Fatalf("read %s: %v", rel, err)
	}
	return string(b)
}

func extractFunc(t *testing.T, src, signature string) string {
	t.Helper()
	idx := strings.Index(src, signature)
	if idx < 0 {
		t.Fatalf("signature %q not found", signature)
	}
	rest := src[idx:]
	brace := strings.Index(rest, "{")
	if brace < 0 {
		t.Fatalf("opening brace for %q not found", signature)
	}
	depth := 0
	for i := brace; i < len(rest); i++ {
		switch rest[i] {
		case '{':
			depth++
		case '}':
			depth--
			if depth == 0 {
				return rest[:i+1]
			}
		}
	}
	t.Fatalf("unbalanced braces for %q", signature)
	return ""
}

func extractBetween(t *testing.T, src, start, end string) string {
	t.Helper()
	i := strings.Index(src, start)
	if i < 0 {
		t.Fatalf("start marker %q not found", start)
	}
	rest := src[i+len(start):]
	j := strings.Index(rest, end)
	if j < 0 {
		t.Fatalf("end marker %q not found after %q", end, start)
	}
	return rest[:j]
}

func comparisonMentions(fn, field, ident string) bool {
	re := regexp.MustCompile(regexp.QuoteMeta(field) + `\s*==\s*` + regexp.QuoteMeta(ident) + `\b`)
	return re.FindStringIndex(fn) != nil
}

func lookupModelStringConst(t *testing.T, root, ident string) string {
	t.Helper()
	entries, err := os.ReadDir(filepath.Join(root, "server", "public", "model"))
	if err != nil {
		t.Fatalf("read model dir: %v", err)
	}
	re := regexp.MustCompile(`\b` + regexp.QuoteMeta(ident) + `\s*=\s*"([^"]*)"`)
	for _, e := range entries {
		if e.IsDir() || !strings.HasSuffix(e.Name(), ".go") || strings.HasSuffix(e.Name(), "_test.go") {
			continue
		}
		src := readRepoFile(t, root, filepath.Join("server", "public", "model", e.Name()))
		if m := re.FindStringSubmatch(src); m != nil {
			return m[1]
		}
	}
	t.Fatalf("const %s not found in server/public/model", ident)
	return ""
}
