#!/bin/bash
# Guardrail hook (beforeShellExecution): enforces this repo's documented
# workflow rules by denying or gating risky shell commands.
#
# Receives the proposed command as JSON on stdin and returns a permission
# decision as JSON on stdout. See https://cursor.com/docs/hooks.

input=$(cat)
command=$(printf '%s' "$input" | jq -r '.command // empty')

emit() {
  # $1=permission  $2=user_message  $3=agent_message
  jq -n \
    --arg p "$1" --arg u "$2" --arg a "$3" \
    '{permission: $p, user_message: $u, agent_message: $a}'
  exit 0
}

# Rule (server-workflows.mdc): never run `go mod tidy` directly; the repo's
# `make modules-tidy` excludes private enterprise imports that break tidy.
if printf '%s' "$command" | grep -Eq 'go[[:space:]]+mod[[:space:]]+tidy'; then
  emit "deny" \
    "Blocked: use \`make modules-tidy\` instead of \`go mod tidy\`." \
    "This repo requires \`make modules-tidy\` (run from server/) rather than \`go mod tidy\`. The make target excludes private enterprise imports that would otherwise break tidy. Please rerun using \`cd server && make modules-tidy\`."
fi

# Guard force-pushes: easy to do real damage during a demo, so require approval.
if printf '%s' "$command" | grep -Eq 'git[[:space:]]+push.*(--force([^-]|$)|-f([[:space:]]|$)|--force-with-lease)'; then
  emit "ask" \
    "Force push detected — review before continuing." \
    "This command force-pushes, which can overwrite remote history. Confirm the branch and intent before approving."
fi

# Everything else is allowed.
emit "allow" "" ""
