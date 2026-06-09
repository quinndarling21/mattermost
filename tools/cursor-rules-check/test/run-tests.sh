#!/usr/bin/env bash
#
# End-to-end tests for check-rules.sh using a deterministic mock agent.
# No CURSOR_API_KEY or network access required.
#
# `ok`/`bad` always return 0, so the `cond && ok || bad` pattern is intentional.
# shellcheck disable=SC2015

set -euo pipefail

THIS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT="${THIS_DIR}/../check-rules.sh"
MOCK="${THIS_DIR}/mock-cursor-agent.sh"

PASS=0
FAIL=0
ok()   { echo "  ok: $*"; PASS=$((PASS + 1)); }
bad()  { echo "  FAIL: $*"; FAIL=$((FAIL + 1)); }

# --- build an isolated git repo fixture ------------------------------------
WORK="$(mktemp -d)"
cleanup() { rm -rf "${WORK}"; }
trap cleanup EXIT

cd "${WORK}"
git init -q
git config user.email test@example.com
git config user.name "Test"
git config commit.gpgsign false

mkdir -p .cursor/rules webapp/channels/src/components/widget server

cat > .cursor/rules/webapp-standards.mdc <<'EOF'
---
description: Webapp style and shared component conventions
globs: webapp/**
alwaysApply: false
---
# Webapp Guidance
- Use Button from @mattermost/shared/components/button for text buttons.
EOF

cat > .cursor/rules/always.mdc <<'EOF'
---
description: Always applies
alwaysApply: true
---
# Always
- Keep things tidy.
EOF

echo "baseline" > webapp/channels/src/components/widget/widget.tsx
echo "baseline" > server/main.go
git add -A
git commit -qm baseline
BASE="$(git rev-parse HEAD)"

# introduce a change to a webapp file (matches webapp/** glob)
cat > webapp/channels/src/components/widget/widget.tsx <<'EOF'
export const Widget = () => <button className="btn">Click</button>;
EOF
git add -A
git commit -qm change

run_check() {
    # usage: run_check <mock_mode> [extra args...]
    local mode="$1"; shift
    OUTPUT_DIR="${WORK}/out" \
    CURSOR_AGENT_BIN="${MOCK}" \
    MOCK_MODE="${mode}" \
    bash "${SCRIPT}" --base "${BASE}" --head HEAD "$@"
}

echo "Test 1: violations are reported, exit 0 (non-blocking)"
rm -rf "${WORK}/out"
rc=0; run_check violations >/dev/null 2>&1 || rc=$?
[ "${rc}" -eq 0 ] && ok "exit 0" || bad "expected exit 0, got ${rc}"
count="$(jq '.violations | length' "${WORK}/out/report.json")"
[ "${count}" = "1" ] && ok "1 violation in report.json" || bad "expected 1 violation, got ${count}"
grep -q "do \*\*not\*\* block merge" "${WORK}/out/report.md" && ok "report.md marks advisory" || bad "report.md missing advisory note"

echo "Test 2: GitHub annotations + summary + outputs are emitted"
rm -rf "${WORK}/out"
summary="${WORK}/summary.md"; outputs="${WORK}/outputs.txt"
: > "${summary}"; : > "${outputs}"
annotations="$(GITHUB_STEP_SUMMARY="${summary}" GITHUB_OUTPUT="${outputs}" run_check violations 2>/dev/null)"
echo "${annotations}" | grep -q "^::warning " && ok "emitted ::warning annotation" || bad "missing ::warning annotation"
grep -q "Cursor rules compliance" "${summary}" && ok "wrote job summary" || bad "job summary missing"
grep -q "^violation_count=1$" "${outputs}" && ok "set violation_count output" || bad "violation_count output missing"

echo "Test 3: clean result -> 0 violations, exit 0"
rm -rf "${WORK}/out"
rc=0; run_check clean >/dev/null 2>&1 || rc=$?
[ "${rc}" -eq 0 ] && ok "exit 0" || bad "expected exit 0, got ${rc}"
count="$(jq '.violations | length' "${WORK}/out/report.json")"
[ "${count}" = "0" ] && ok "0 violations" || bad "expected 0 violations, got ${count}"

echo "Test 4: invalid agent output -> degraded skipped report, exit 0"
rm -rf "${WORK}/out"
rc=0; run_check invalid >/dev/null 2>&1 || rc=$?
[ "${rc}" -eq 0 ] && ok "exit 0" || bad "expected exit 0, got ${rc}"
status="$(jq -r '.status' "${WORK}/out/report.json")"
[ "${status}" = "skipped" ] && ok "status=skipped" || bad "expected skipped, got ${status}"

echo "Test 5: agent writes no file -> degraded skipped report, exit 0"
rm -rf "${WORK}/out"
rc=0; run_check nofile >/dev/null 2>&1 || rc=$?
[ "${rc}" -eq 0 ] && ok "exit 0" || bad "expected exit 0, got ${rc}"
status="$(jq -r '.status' "${WORK}/out/report.json")"
[ "${status}" = "skipped" ] && ok "status=skipped" || bad "expected skipped, got ${status}"

echo "Test 6: --strict exits 1 when violations exist"
rm -rf "${WORK}/out"
rc=0; run_check violations --strict >/dev/null 2>&1 || rc=$?
[ "${rc}" -eq 1 ] && ok "exit 1 in strict mode" || bad "expected exit 1, got ${rc}"

echo "Test 7: change with no applicable rules -> skipped"
# new commit touching only a file that matches no rule glob and no alwaysApply…
# (always.mdc has alwaysApply, so to truly get 'no applicable rules' we disable it)
sed -i 's/alwaysApply: true/alwaysApply: false/' .cursor/rules/always.mdc
git add -A && git commit -qm "disable always rule"
BASE2="$(git rev-parse HEAD)"
echo "x" >> server/main.go
git add -A && git commit -qm "server-only change"
rm -rf "${WORK}/out"
rc=0; OUTPUT_DIR="${WORK}/out" CURSOR_AGENT_BIN="${MOCK}" MOCK_MODE="violations" \
    bash "${SCRIPT}" --base "${BASE2}" --head HEAD >/dev/null 2>&1 || rc=$?
[ "${rc}" -eq 0 ] && ok "exit 0" || bad "expected exit 0, got ${rc}"
status="$(jq -r '.status' "${WORK}/out/report.json")"
[ "${status}" = "skipped" ] && ok "status=skipped (no applicable rules)" || bad "expected skipped, got ${status}"

echo
echo "Passed: ${PASS}, Failed: ${FAIL}"
[ "${FAIL}" -eq 0 ]
