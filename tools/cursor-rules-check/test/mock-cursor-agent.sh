#!/usr/bin/env bash
#
# Deterministic stand-in for `cursor-agent` used by the test suite.
#
# The real agent reads the target report path from the prompt and writes JSON
# there. This mock instead reads the path from the CURSOR_RULES_OUTPUT env var
# (which check-rules.sh exports) and writes a canned payload selected by
# MOCK_MODE: violations (default) | clean | invalid | nofile.

set -euo pipefail

out="${CURSOR_RULES_OUTPUT:-}"
mode="${MOCK_MODE:-violations}"

echo "[mock-cursor-agent] mode=${mode} out=${out}"

case "${mode}" in
    nofile)
        # Simulate an agent that never writes the report file.
        exit 0
        ;;
    invalid)
        printf 'this is not json' >"${out}"
        exit 0
        ;;
    clean)
        cat >"${out}" <<'JSON'
{
  "summary": "No rule violations detected in the changed files.",
  "status": "ok",
  "violations": []
}
JSON
        ;;
    violations)
        cat >"${out}" <<'JSON'
{
  "summary": "1 advisory issue found against webapp standards.",
  "status": "violations",
  "violations": [
    {
      "file": "webapp/channels/src/components/widget/widget.tsx",
      "line": 12,
      "rule": "webapp-standards.mdc",
      "severity": "warning",
      "title": "Bespoke button instead of shared Button",
      "detail": "A raw <button> element is added; the rule requires Button from @mattermost/shared/components/button.",
      "suggestion": "Replace the <button> with <Button> from @mattermost/shared/components/button."
    }
  ]
}
JSON
        ;;
    *)
        echo "[mock-cursor-agent] unknown MOCK_MODE: ${mode}" >&2
        exit 1
        ;;
esac

exit 0
