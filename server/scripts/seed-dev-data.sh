#!/usr/bin/env bash
# Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
# See LICENSE.txt for license information.
#
# Seed a local development Mattermost server with realistic test data:
# multiple teams, channels, named users and a healthy volume of messages,
# threaded replies and reactions. Useful for demos and exercising
# analytics-style features against data that looks real.
#
# Requirements:
#   * A local dev server running with local mode enabled
#     (e.g. `make run-server` started with MM_SERVICESETTINGS_ENABLELOCALMODE=true,
#      which is what `make seed-data` arranges for you).
#   * `bin/mmctl` built (this script builds it if missing).
#
# Usage:
#   seed-dev-data.sh [--if-empty]
#     --if-empty   Skip seeding (exit 0) if the server already contains the
#                  seed data. Use this for automatic seeding on startup so the
#                  data is only imported once (posts are not idempotent).
#
# Environment overrides:
#   SEED_POSTS_PER_CHANNEL   base posts per channel (default 60)
#   SEED_DAYS                spread history over the last N days (default 30)
#   SEED_RANDOM_SEED         deterministic random seed (default 1)
#   MAX_WAIT_SECONDS         how long to wait for the server (default 90)
#   SEED_MARKER_TEAM         team name used to detect prior seeding (default core)

set -Eeuo pipefail

IF_EMPTY=false
for arg in "$@"; do
    case "$arg" in
        --if-empty) IF_EMPTY=true ;;
        *) echo "Unknown argument: $arg" >&2; exit 2 ;;
    esac
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$SERVER_DIR"

MMCTL="$SERVER_DIR/bin/mmctl"
POSTS_PER_CHANNEL="${SEED_POSTS_PER_CHANNEL:-60}"
DAYS="${SEED_DAYS:-30}"
RANDOM_SEED="${SEED_RANDOM_SEED:-1}"
SEED_MARKER_TEAM="${SEED_MARKER_TEAM:-core}"
export MAX_WAIT_SECONDS="${MAX_WAIT_SECONDS:-90}"

log() { printf '[seed-dev-data] %s\n' "$*" >&2; }

seed_marker_team_exists() {
    local teams_json

    if ! teams_json="$("$MMCTL" team list --local --json 2>/dev/null)"; then
        return 1
    fi

    SEED_MARKER_TEAM="$SEED_MARKER_TEAM" python3 -c '
import json
import os
import sys

try:
    data = json.load(sys.stdin)
except Exception:
    sys.exit(1)

teams = data if isinstance(data, list) else [data]
marker = os.environ["SEED_MARKER_TEAM"]
for team in teams:
    if isinstance(team, dict) and team.get("name") == marker:
        sys.exit(0)

sys.exit(1)
' <<< "$teams_json"
}

if [ ! -x "$MMCTL" ]; then
    log "mmctl not found at $MMCTL, building it..."
    make mmctl-build
fi

log "Waiting for the local server to be reachable in local mode..."
if ! "$SCRIPT_DIR/wait-for-system-start.sh"; then
    log "ERROR: server did not become ready. Start it first with 'make run-server' (local mode enabled)."
    exit 1
fi

# Posts are not idempotent, so when asked, skip if the data is already present
# (detected by the marker team) to avoid duplicating messages on every startup.
if [ "$IF_EMPTY" = "true" ]; then
    if seed_marker_team_exists; then
        log "Seed data already present (team '$SEED_MARKER_TEAM' exists), skipping."
        exit 0
    fi
fi

# Allow large teams so all seeded members fit.
"$MMCTL" config set TeamSettings.MaxUsersPerTeam 1000 --local >/dev/null 2>&1 || true

WORKDIR="$(mktemp -d -t mm-seed-XXXXXX)"
trap 'rm -rf "$WORKDIR"' EXIT

JSONL="$WORKDIR/import.jsonl"
ZIP="$WORKDIR/seed-data.zip"

log "Generating realistic seed data (posts/channel=$POSTS_PER_CHANNEL, days=$DAYS, seed=$RANDOM_SEED)..."
python3 "$SCRIPT_DIR/seed-dev-data.py" \
    --out "$JSONL" \
    --seed "$RANDOM_SEED" \
    --posts-per-channel "$POSTS_PER_CHANNEL" \
    --days "$DAYS"

log "Packaging import archive..."
( cd "$WORKDIR" && zip -q "$ZIP" "import.jsonl" )

log "Starting import job (local mode, bypass-upload)..."
JOB_JSON="$("$MMCTL" import process --bypass-upload --local "$ZIP" --json)"
JOB_ID="$(printf '%s' "$JOB_JSON" | python3 -c 'import sys,json; data=json.load(sys.stdin); print(data[0]["id"] if isinstance(data,list) else data["id"])')"

if [ -z "$JOB_ID" ]; then
    log "ERROR: could not determine import job ID. Output was:"
    printf '%s\n' "$JOB_JSON" >&2
    exit 1
fi

log "Import job created: $JOB_ID. Waiting for it to finish..."
STATUS=""
for _ in $(seq 1 120); do
    SHOW_JSON="$("$MMCTL" import job show "$JOB_ID" --local --json 2>/dev/null || true)"
    STATUS="$(printf '%s' "$SHOW_JSON" | python3 -c 'import sys,json
try:
    d=json.load(sys.stdin)
    d=d[0] if isinstance(d,list) else d
    print(d.get("status",""))
except Exception:
    print("")' 2>/dev/null || true)"
    case "$STATUS" in
        success)
            log "Import finished successfully."
            break
            ;;
        error|canceled)
            log "ERROR: import job ended with status: $STATUS"
            printf '%s\n' "$SHOW_JSON" >&2
            exit 1
            ;;
        *)
            printf '.' >&2
            sleep 2
            ;;
    esac
done

if [ "$STATUS" != "success" ]; then
    log "ERROR: import job did not complete in time (last status: ${STATUS:-unknown})."
    exit 1
fi

cat >&2 <<EOF

========================================================================
 Dev seed data imported successfully.

 Log in with the system admin account:
   username: $(printf 'sysadmin')
   password: Sys@dmin-sample1

 Or any seeded user (e.g. liam.chen, emma.davis, harper.lee) with:
   password: Sample-Pass1
========================================================================
EOF
