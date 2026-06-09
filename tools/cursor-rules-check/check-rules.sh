#!/usr/bin/env bash
#
# check-rules.sh - Intelligent, non-blocking compliance check for Cursor rules.
#
# Uses the Cursor CLI in headless mode (https://cursor.com/docs/cli/headless) to
# evaluate a set of changed files against the repository's Cursor rules
# (.cursor/rules/*.mdc) and the docs they reference. It produces a Markdown +
# JSON report and, when running inside GitHub Actions, emits non-blocking
# annotations and a job-summary section.
#
# The check is intentionally NON-BLOCKING: violations are surfaced as warnings
# but the script exits 0 unless --strict is passed. This lets teams enforce
# "maintenance" of their rules without gating merges on a probabilistic model.
#
# The Cursor agent invocation is isolated behind $CURSOR_AGENT_BIN so the script
# can be exercised end-to-end in tests with a deterministic mock agent.

set -euo pipefail

# ---------------------------------------------------------------------------
# Configuration (override via env or flags)
# ---------------------------------------------------------------------------
REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
RULES_DIR="${RULES_DIR:-${REPO_ROOT}/.cursor/rules}"
OUTPUT_DIR="${OUTPUT_DIR:-${REPO_ROOT}/.cursor-rules-report}"
CURSOR_AGENT_BIN="${CURSOR_AGENT_BIN:-cursor-agent}"
CURSOR_MODEL="${CURSOR_MODEL:-}"
AGENT_TIMEOUT="${AGENT_TIMEOUT:-300}"
MAX_DIFF_BYTES="${MAX_DIFF_BYTES:-120000}"

BASE_REF="${BASE_REF:-}"
HEAD_REF="${HEAD_REF:-}"
MODE="range"   # range | staged
STRICT="false"

usage() {
    cat <<'EOF'
Usage: check-rules.sh [options]

Evaluate changed files against the repository's Cursor rules using the Cursor
CLI in headless mode, and emit a non-blocking compliance report.

Options:
  --base <ref>     Base git ref to diff against (default: origin/master or HEAD~1)
  --head <ref>     Head git ref to diff (default: working tree / HEAD)
  --staged         Check staged changes only (useful for a pre-commit hook)
  --strict         Exit non-zero (1) when violations are found (default: exit 0)
  -h, --help       Show this help

Key environment variables:
  CURSOR_API_KEY     Required by the real Cursor CLI for authentication.
  CURSOR_AGENT_BIN   Agent binary to invoke (default: cursor-agent).
  CURSOR_MODEL       Optional model name passed to the agent.
  RULES_DIR          Directory of *.mdc rule files (default: .cursor/rules).
  OUTPUT_DIR         Where to write report.json / report.md.
  MAX_DIFF_BYTES     Truncate the diff sent to the agent (default: 120000).
  AGENT_TIMEOUT      Seconds before the agent call is aborted (default: 300).
EOF
}

while [ $# -gt 0 ]; do
    case "$1" in
        --base) BASE_REF="$2"; shift 2 ;;
        --head) HEAD_REF="$2"; shift 2 ;;
        --staged) MODE="staged"; shift ;;
        --strict) STRICT="true"; shift ;;
        -h|--help) usage; exit 0 ;;
        *) echo "Unknown option: $1" >&2; usage >&2; exit 2 ;;
    esac
done

log() { printf '%s\n' "$*" >&2; }

# ---------------------------------------------------------------------------
# GitHub Actions helpers (no-ops outside CI)
# ---------------------------------------------------------------------------
gh_summary() {
    if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then
        printf '%s\n' "$*" >>"${GITHUB_STEP_SUMMARY}"
    fi
}

gh_output() {
    if [ -n "${GITHUB_OUTPUT:-}" ]; then
        printf '%s\n' "$1=$2" >>"${GITHUB_OUTPUT}"
    fi
}

# Escape a string for use in a GitHub workflow command annotation.
gh_escape() {
    printf '%s' "$1" | sed -e 's/%/%25/g' -e 's/\r/%0D/g' -e ':a;N;$!ba;s/\n/%0A/g'
}

# ---------------------------------------------------------------------------
# Resolve the diff range
# ---------------------------------------------------------------------------
mkdir -p "${OUTPUT_DIR}"
REPORT_JSON="${OUTPUT_DIR}/report.json"
REPORT_MD="${OUTPUT_DIR}/report.md"

changed_files() {
    if [ "${MODE}" = "staged" ]; then
        git -C "${REPO_ROOT}" diff --cached --name-only --diff-filter=ACMR
        return
    fi
    git -C "${REPO_ROOT}" diff --name-only --diff-filter=ACMR "${BASE_REF}...${HEAD_REF:-HEAD}"
}

diff_text() {
    if [ "${MODE}" = "staged" ]; then
        git -C "${REPO_ROOT}" diff --cached --diff-filter=ACMR
        return
    fi
    git -C "${REPO_ROOT}" diff --diff-filter=ACMR "${BASE_REF}...${HEAD_REF:-HEAD}"
}

if [ "${MODE}" = "range" ]; then
    if [ -z "${BASE_REF}" ]; then
        if git -C "${REPO_ROOT}" rev-parse --verify -q origin/master >/dev/null; then
            BASE_REF="origin/master"
        else
            BASE_REF="HEAD~1"
        fi
    fi
    log "Diffing ${BASE_REF}...${HEAD_REF:-HEAD}"
else
    log "Diffing staged changes"
fi

mapfile -t FILES < <(changed_files || true)

# ---------------------------------------------------------------------------
# Match changed files against rule globs
# ---------------------------------------------------------------------------
# Translate a Cursor rule glob (e.g. "webapp/**") into a bash [[ ]] pattern.
glob_to_pattern() {
    local g="$1"
    g="${g#./}"
    g="${g//\*\*/\*}"   # collapse ** -> * (bash [[ ]] '*' already spans '/')
    printf '%s' "$g"
}

# Read frontmatter field from a .mdc file (between the first two '---' lines).
read_frontmatter_field() {
    local file="$1" field="$2"
    awk -v field="${field}" '
        NR==1 && $0=="---" { infm=1; next }
        infm && $0=="---" { exit }
        infm {
            if ($0 ~ "^"field":") {
                sub("^"field":[[:space:]]*", "")
                print
                exit
            }
        }
    ' "${file}"
}

APPLICABLE_RULES=()
if [ -d "${RULES_DIR}" ]; then
    shopt -s nullglob
    for rule in "${RULES_DIR}"/*.mdc; do
        always="$(read_frontmatter_field "${rule}" "alwaysApply" || true)"
        globs="$(read_frontmatter_field "${rule}" "globs" || true)"

        include="false"
        if [ "${always}" = "true" ]; then
            include="true"
        elif [ -n "${globs}" ] && [ "${#FILES[@]}" -gt 0 ]; then
            IFS=',' read -ra GLOBS <<<"${globs}"
            for raw in "${GLOBS[@]}"; do
                raw="$(printf '%s' "${raw}" | xargs || true)"   # trim
                [ -z "${raw}" ] && continue
                pat="$(glob_to_pattern "${raw}")"
                for f in "${FILES[@]}"; do
                    # shellcheck disable=SC2053
                    if [[ "${f}" == ${pat} ]]; then
                        include="true"
                        break 2
                    fi
                done
            done
        fi

        if [ "${include}" = "true" ]; then
            APPLICABLE_RULES+=("${rule}")
        fi
    done
    shopt -u nullglob
fi

write_empty_report() {
    local reason="$1"
    printf '{"summary":%s,"violations":[],"status":"skipped"}\n' \
        "$(jq -Rn --arg r "${reason}" '$r')" >"${REPORT_JSON}"
    {
        echo "## Cursor rules compliance"
        echo
        echo "_${reason}_"
    } >"${REPORT_MD}"
    gh_summary "## Cursor rules compliance"
    gh_summary ""
    gh_summary "_${reason}_"
    gh_output "violation_count" "0"
    gh_output "status" "skipped"
}

if [ "${#FILES[@]}" -eq 0 ]; then
    write_empty_report "No added/modified/renamed files in range — nothing to check."
    exit 0
fi

if [ "${#APPLICABLE_RULES[@]}" -eq 0 ]; then
    write_empty_report "No Cursor rules apply to the changed files."
    exit 0
fi

log "Changed files: ${#FILES[@]}; applicable rules: ${#APPLICABLE_RULES[@]}"

# ---------------------------------------------------------------------------
# Build the prompt
# ---------------------------------------------------------------------------
PROMPT_FILE="$(mktemp)"
DIFF_FILE="$(mktemp)"
trap 'rm -f "${PROMPT_FILE}" "${DIFF_FILE}"' EXIT

diff_text >"${DIFF_FILE}" || true
DIFF_BYTES="$(wc -c <"${DIFF_FILE}")"
TRUNCATED="false"
if [ "${DIFF_BYTES}" -gt "${MAX_DIFF_BYTES}" ]; then
    head -c "${MAX_DIFF_BYTES}" "${DIFF_FILE}" >"${DIFF_FILE}.trunc"
    mv "${DIFF_FILE}.trunc" "${DIFF_FILE}"
    TRUNCATED="true"
fi

{
    echo "You are a meticulous code reviewer enforcing this repository's Cursor rules."
    echo "Evaluate ONLY the unified diff below against the rules provided."
    echo
    echo "Strict instructions:"
    echo "- Only flag problems introduced or touched by the diff. Ignore pre-existing"
    echo "  code that the diff does not change."
    echo "- Be precise and conservative: only report a violation when a specific rule is"
    echo "  clearly broken. When unsure, do not report it."
    echo "- Severity must be either \"warning\" or \"info\" (this check is non-blocking)."
    echo "- For each violation, cite the rule file it comes from."
    echo "- Do NOT modify any source files. Your ONLY file write is the JSON report."
    echo
    echo "When finished, write a JSON document to the file at this exact path:"
    echo "  ${REPORT_JSON}"
    echo
    echo "The JSON MUST match this schema exactly:"
    cat <<'SCHEMA'
{
  "summary": "one short sentence describing overall compliance",
  "status": "ok" | "violations",
  "violations": [
    {
      "file": "relative/path",
      "line": <integer or null>,
      "rule": "<rule file name, e.g. webapp-standards.mdc>",
      "severity": "warning" | "info",
      "title": "short title (<= 8 words)",
      "detail": "what rule is broken and why, referencing the diff",
      "suggestion": "concrete fix"
    }
  ]
}
SCHEMA
    echo
    echo "Write valid JSON only to that file (no Markdown fences). If there are no"
    echo "violations, write an empty \"violations\" array and status \"ok\"."
    echo
    echo "===== CURSOR RULES ====="
    for rule in "${APPLICABLE_RULES[@]}"; do
        echo
        echo "----- FILE: ${rule#"${REPO_ROOT}/"} -----"
        cat "${rule}"
    done
    echo
    echo "===== CHANGED FILES ====="
    printf '%s\n' "${FILES[@]}"
    echo
    echo "===== UNIFIED DIFF ====="
    if [ "${TRUNCATED}" = "true" ]; then
        echo "(diff truncated to ${MAX_DIFF_BYTES} bytes)"
    fi
    cat "${DIFF_FILE}"
} >"${PROMPT_FILE}"

# ---------------------------------------------------------------------------
# Invoke the Cursor agent (headless)
# ---------------------------------------------------------------------------
rm -f "${REPORT_JSON}"

AGENT_ARGS=(--print --force --output-format text)
if [ -n "${CURSOR_MODEL}" ]; then
    AGENT_ARGS+=(--model "${CURSOR_MODEL}")
fi

# Exported so a mock agent can locate the expected output file deterministically.
export CURSOR_RULES_OUTPUT="${REPORT_JSON}"

AGENT_LOG="${OUTPUT_DIR}/agent.log"
AGENT_RC=0
log "Invoking ${CURSOR_AGENT_BIN} (timeout ${AGENT_TIMEOUT}s)..."
# The headless CLI has been reported to occasionally hang in CI after finishing
# (https://forum.cursor.com/t/133511). Send SIGTERM at AGENT_TIMEOUT and
# SIGKILL 15s later so a stuck agent can never wedge the pipeline. We rely on
# the JSON report file rather than the process exit code for the verdict.
if ! timeout --kill-after=15 "${AGENT_TIMEOUT}" \
        "${CURSOR_AGENT_BIN}" "${AGENT_ARGS[@]}" "$(cat "${PROMPT_FILE}")" \
        >"${AGENT_LOG}" 2>&1; then
    AGENT_RC=$?
    log "Agent exited with code ${AGENT_RC} (see ${AGENT_LOG})."
fi

# ---------------------------------------------------------------------------
# Validate the agent output
# ---------------------------------------------------------------------------
if [ ! -s "${REPORT_JSON}" ] || ! jq -e . "${REPORT_JSON}" >/dev/null 2>&1; then
    log "Agent did not produce valid JSON; emitting a degraded (skipped) report."
    write_empty_report "Cursor rules check could not run (agent produced no valid report; rc=${AGENT_RC}). This is non-blocking."
    [ "${STRICT}" = "true" ] && exit 1
    exit 0
fi

# Normalise: ensure required keys exist.
jq '{
    summary: (.summary // "Cursor rules compliance report"),
    status: (.status // (if ((.violations // []) | length) > 0 then "violations" else "ok" end)),
    violations: (.violations // [])
}' "${REPORT_JSON}" >"${REPORT_JSON}.norm" && mv "${REPORT_JSON}.norm" "${REPORT_JSON}"

VIOLATION_COUNT="$(jq '.violations | length' "${REPORT_JSON}")"
SUMMARY="$(jq -r '.summary' "${REPORT_JSON}")"

# ---------------------------------------------------------------------------
# Render Markdown report
# ---------------------------------------------------------------------------
{
    echo "## Cursor rules compliance"
    echo
    echo "${SUMMARY}"
    echo
    if [ "${VIOLATION_COUNT}" -eq 0 ]; then
        echo "No rule violations detected in the changed files."
    else
        echo "Found **${VIOLATION_COUNT}** potential rule issue(s). These are advisory and do **not** block merge."
        echo
        echo "| Severity | File | Rule | Issue | Suggestion |"
        echo "| --- | --- | --- | --- | --- |"
        jq -r '.violations[] |
            "| \(.severity // "warning") | `\(.file // "?")\(if .line then ":" + (.line|tostring) else "" end)` | `\(.rule // "?")` | \(.title // .detail // "") | \((.suggestion // "") | gsub("\n"; " ")) |"' \
            "${REPORT_JSON}"
    fi
} >"${REPORT_MD}"

# ---------------------------------------------------------------------------
# GitHub Actions: job summary + non-blocking annotations
# ---------------------------------------------------------------------------
if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then
    cat "${REPORT_MD}" >>"${GITHUB_STEP_SUMMARY}"
fi

if [ "${VIOLATION_COUNT}" -gt 0 ]; then
    # Emit one ::warning:: annotation per violation. Warnings never fail a job.
    while IFS= read -r line; do
        file="$(jq -r '.file // ""' <<<"${line}")"
        ln="$(jq -r '.line // ""' <<<"${line}")"
        rule="$(jq -r '.rule // ""' <<<"${line}")"
        title="$(jq -r '.title // "Cursor rule issue"' <<<"${line}")"
        detail="$(jq -r '.detail // ""' <<<"${line}")"
        msg="$(gh_escape "[${rule}] ${detail}")"
        loc=""
        [ -n "${file}" ] && loc="file=${file}"
        [ -n "${file}" ] && [ -n "${ln}" ] && loc="file=${file},line=${ln}"
        echo "::warning ${loc},title=Cursor rule: ${title}::${msg}"
    done < <(jq -c '.violations[]' "${REPORT_JSON}")
fi

gh_output "violation_count" "${VIOLATION_COUNT}"
gh_output "status" "$(jq -r '.status' "${REPORT_JSON}")"
gh_output "report_md" "${REPORT_MD}"
gh_output "report_json" "${REPORT_JSON}"

log "Done. Violations: ${VIOLATION_COUNT}. Report: ${REPORT_MD}"

if [ "${STRICT}" = "true" ] && [ "${VIOLATION_COUNT}" -gt 0 ]; then
    exit 1
fi
exit 0
