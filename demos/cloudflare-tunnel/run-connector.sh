#!/usr/bin/env bash
set -Eeuo pipefail

# Starts the private-network-side Cloudflare Tunnel connector for the Mattermost
# demo. The connector dials outbound to Cloudflare and forwards requests to the
# local Mattermost dev server on http://localhost:8065. No inbound ports are
# opened on this machine.
#
# Usage:
#   ./run-connector.sh
#
# Requires CLOUDFLARE_TUNNEL_TOKEN, read from the environment or from a local
# .env file in this directory (copy .env.example to .env). The token comes from
# the Cloudflare Zero Trust dashboard when you create the named tunnel. Never
# commit it: demos/cloudflare-tunnel/.env is gitignored.
#
# On macOS, installing the native binary (brew install cloudflared) is the most
# reliable option because "localhost" then resolves to this host, matching the
# tunnel's published route. The Docker fallback needs host networking to reach
# the host's localhost and is intended for Linux hosts.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

log() {
  printf '[run-connector] %s\n' "$*" >&2
}

if [ -f "$SCRIPT_DIR/.env" ]; then
  set -a
  # shellcheck source=/dev/null
  . "$SCRIPT_DIR/.env"
  set +a
fi

if [ -z "${CLOUDFLARE_TUNNEL_TOKEN:-}" ]; then
  cat >&2 <<'EOF'
[run-connector] CLOUDFLARE_TUNNEL_TOKEN is not set.

Set it one of two ways:
  1. Copy .env.example to .env and paste your tunnel token, or
  2. export CLOUDFLARE_TUNNEL_TOKEN=... in your shell.

Find the token in the Cloudflare Zero Trust dashboard:
Networks > Tunnels > (your tunnel) > the value after --token in the install command.
EOF
  exit 1
fi

log "Before starting the connector, make sure Mattermost is running:"
log "  cd server && make run-server   (serves http://localhost:8065)"

CLOUDFLARE_TUNNEL_IMAGE="${CLOUDFLARE_TUNNEL_IMAGE:-cloudflare/cloudflared:latest}"

if command -v cloudflared >/dev/null 2>&1; then
  log "Starting native cloudflared connector (Ctrl-C to stop)."
  exec cloudflared tunnel --no-autoupdate run --token "$CLOUDFLARE_TUNNEL_TOKEN"
fi

if command -v docker >/dev/null 2>&1; then
  log "Native cloudflared not found; starting the Docker connector with host networking."
  log "On macOS, prefer: brew install cloudflared (host networking in Docker Desktop is unreliable)."
  exec docker run --rm --name mm-cloudflared --network host \
    "$CLOUDFLARE_TUNNEL_IMAGE" \
    tunnel --no-autoupdate run --token "$CLOUDFLARE_TUNNEL_TOKEN"
fi

log "Neither cloudflared nor docker is available. Install one:"
log "  macOS:  brew install cloudflared"
log "  Docker: https://docs.docker.com/get-docker/"
exit 1
