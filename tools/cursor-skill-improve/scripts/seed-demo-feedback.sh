#!/usr/bin/env bash
#
# Seed a throwaway PR with stamped agent comments + human-style feedback, so the
# LIVE outer loop has real signal to learn from during a demo.
#
#   tools/cursor-skill-improve/scripts/seed-demo-feedback.sh [--skill dry-review]
#
# Requires: `gh` authenticated with WRITE access to the repo (a personal token,
# NOT the read-only CI token). It creates a branch, opens a PR, posts two stamped
# "agent" comments, and adds reactions + a correcting reply.
#
# After seeding, run a live collection (no --fixture):
#   npm --prefix tools/cursor-skill-improve run improve -- --dry-run --target dry-review
# then a real run / the scheduled workflow opens a draft improvement PR.

set -euo pipefail

SKILL="dry-review"
while [ $# -gt 0 ]; do
  case "$1" in
    --skill) SKILL="$2"; shift 2 ;;
    *) echo "Unknown argument: $1" >&2; exit 2 ;;
  esac
done

command -v gh >/dev/null || { echo "gh CLI is required." >&2; exit 1; }

REPO="$(gh repo view --json nameWithOwner -q .nameWithOwner)"
BASE="$(gh repo view --json defaultBranchRef -q .defaultBranchRef.name)"
TS="$(date -u +%Y%m%d%H%M%S)"
ISO="$(date -u +%Y-%m-%dT%H:%MZ)"
BRANCH="demo/skill-loop-seed-${TS}"

echo "Repo: ${REPO} · base: ${BASE} · branch: ${BRANCH}"

git checkout -b "${BRANCH}"
mkdir -p .demo
printf 'Throwaway file to seed the skill self-improvement demo (%s).\n' "${TS}" > ".demo/skill-loop-${TS}.md"
git add ".demo/skill-loop-${TS}.md"
git commit -m "chore: seed skill-loop demo feedback (${TS})"
git push -u origin "${BRANCH}"

PR_URL="$(gh pr create --repo "${REPO}" --base "${BASE}" --head "${BRANCH}" \
  --title "Demo: seed ${SKILL} feedback" \
  --body "Throwaway PR that seeds self-improvement feedback for a demo. Safe to close.")"
PR_NUM="$(gh pr view "${PR_URL}" --json number -q .number)"
echo "Opened ${PR_URL} (#${PR_NUM})"

post()  { gh api "repos/${REPO}/issues/${PR_NUM}/comments" -f body="$1" -q .id; }
react() { gh api "repos/${REPO}/issues/comments/${1}/reactions" -f content="$2" >/dev/null; }

# Run 1: a shape-named extraction that gets 👎 and a correcting reply.
C1="$(post "## DRY Review Summary
- Extracted: \`SharedMenu\` from three channel menus
- Left duplicated: none
- Validation: jest (webapp)

_Was this helpful? 👍 / 👎, or reply with a correction — it trains \`${SKILL}\`._
<!-- skill:${SKILL}@1 run:${ISO} -->")"
react "${C1}" "-1"
post "Reverted. \`SharedMenu\` is shape-named and only fit after adding four props. The duplication was cheaper — keep these separate."

# Run 2: a domain-named hook extraction that gets 👍.
C2="$(post "## DRY Review Summary
- Extracted: \`useChannelDraft\` hook shared by composer and thread
- Left duplicated: none
- Validation: jest (webapp)

_Was this helpful? 👍 / 👎, or reply with a correction — it trains \`${SKILL}\`._
<!-- skill:${SKILL}@1 run:${ISO} -->")"
react "${C2}" "+1"

echo
echo "Seeded 2 stamped runs (with reactions + a correcting reply) on ${PR_URL}"
echo "Next:"
echo "  npm --prefix tools/cursor-skill-improve run improve -- --dry-run --target ${SKILL}"
echo "  # (live collection; omit --fixture). Then a real run opens a draft improvement PR."
echo "When done, close the PR: gh pr close ${PR_NUM} --repo ${REPO} --delete-branch"
