#!/usr/bin/env bash
#
# One-command demo of the skill self-improvement loop.
#
#   npm run demo                 # dry run, then (if CURSOR_API_KEY is set) a live agent run
#   npm run demo -- --keep       # keep the agent's edit instead of restoring it
#   npm run demo -- --skill dry-review --fixture fixtures/sample-feedback.json
#
# The live step edits the target skill, prints the diff, then restores the file
# so the demo is repeatable. In CI the same diff becomes a draft PR.

set -euo pipefail

TOOL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$TOOL_DIR"
REPO_ROOT="$(git rev-parse --show-toplevel)"

SKILL="dry-review"
FIXTURE="fixtures/sample-feedback.json"
KEEP=0

while [ $# -gt 0 ]; do
  case "$1" in
    --skill) SKILL="$2"; shift 2 ;;
    --fixture) FIXTURE="$2"; shift 2 ;;
    --keep) KEEP=1; shift ;;
    *) echo "Unknown argument: $1" >&2; exit 2 ;;
  esac
done

hr() { printf '\n\033[1m== %s ==\033[0m\n' "$1"; }
cmd() { printf '\033[2m$ %s\033[0m\n' "$1"; }

has_cursor_api_key() {
  if [ -n "${CURSOR_API_KEY:-}" ]; then
    return 0
  fi

  node -e '
    const fs = require("node:fs");
    const envPath = process.argv[1];
    if (!fs.existsSync(envPath) || typeof process.loadEnvFile !== "function") {
      process.exit(1);
    }
    try {
      process.loadEnvFile(envPath);
    } catch {
      process.exit(1);
    }
    process.exit(process.env.CURSOR_API_KEY ? 0 : 1);
  ' "${REPO_ROOT}/.env"
}

REPORT="${REPO_ROOT}/.cursor-skill-improve/report.md"
SKILL_PATH="${REPO_ROOT}/.cursor/skills/${SKILL}/SKILL.md"

hr "STEP 1 · Deterministic dry run (no API key, no network)"
cmd "npm run improve -- --dry-run --fixture ${FIXTURE}"
npm run --silent improve -- --dry-run --fixture "${FIXTURE}"
echo
echo "----- report.md -----"
cat "${REPORT}"

if ! has_cursor_api_key; then
  hr "CURSOR_API_KEY not set in the environment or .env — stopping after the dry run"
  echo "Set CURSOR_API_KEY in the environment or repo .env to watch the agent edit the skill and bump its version."
  exit 0
fi

if [ ! -f "${SKILL_PATH}" ]; then
  echo "Skill not found at ${SKILL_PATH}" >&2
  exit 1
fi

SNAPSHOT="$(mktemp)"
cp "${SKILL_PATH}" "${SNAPSHOT}"

hr "STEP 2 · Live agent run (edits ${SKILL} + bumps version)"
cmd "npm run improve -- --target ${SKILL} --fixture ${FIXTURE}"
npm run --silent improve -- --target "${SKILL}" --fixture "${FIXTURE}"

hr "STEP 3 · The diff the loop produced"
git -C "${REPO_ROOT}" --no-pager diff -- ".cursor/skills/${SKILL}/SKILL.md" || true

if [ "${KEEP}" -eq 0 ]; then
  cp "${SNAPSHOT}" "${SKILL_PATH}"
  hr "Restored ${SKILL} for repeatability (pass --keep to keep the change)"
else
  hr "Kept the change to ${SKILL} (commit it or open a PR to land it)"
fi
rm -f "${SNAPSHOT}"

hr "In CI this diff becomes a DRAFT PR"
echo "via .github/workflows/skill-self-improve.yml — humans review and merge; nothing auto-merges."
