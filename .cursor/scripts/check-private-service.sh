#!/usr/bin/env bash
set -Eeuo pipefail

# Verifies that a Cursor Cloud Agent can reach the private demo Mattermost server
# through the Cloudflare Tunnel using Cloudflare Access service-token headers.
# See demos/cloudflare-tunnel/README.md for the full runbook.
#
# Required environment (configured as Cursor Secrets):
#   MM_TUNNEL_URL           e.g. https://mm-internal.quinn-cloudflare-demo.com
#   CF_ACCESS_CLIENT_ID     Cloudflare Access service token client id
#   CF_ACCESS_CLIENT_SECRET Cloudflare Access service token client secret
#
# Exit codes:
#   0  success, or a graceful skip when none of the secrets are set (so the
#      environment stays usable for agents not running this demo)
#   1  the demo is configured but the private service could not be reached

log() {
  printf '[check-private-service] %s\n' "$*" >&2
}

if [ -z "${MM_TUNNEL_URL:-}" ] && [ -z "${CF_ACCESS_CLIENT_ID:-}" ] && [ -z "${CF_ACCESS_CLIENT_SECRET:-}" ]; then
  log "Cloudflare Tunnel demo secrets are not set; skipping."
  log "To enable, set MM_TUNNEL_URL, CF_ACCESS_CLIENT_ID, and CF_ACCESS_CLIENT_SECRET as Cursor Secrets."
  log "See demos/cloudflare-tunnel/README.md."
  exit 0
fi

missing=0
for var in MM_TUNNEL_URL CF_ACCESS_CLIENT_ID CF_ACCESS_CLIENT_SECRET; do
  if [ -z "${!var:-}" ]; then
    log "Missing required variable: ${var}"
    missing=1
  fi
done
if [ "$missing" -ne 0 ]; then
  log "The demo is partially configured. Set all three secrets and retry."
  exit 1
fi

ping_url="${MM_TUNNEL_URL%/}/api/v4/system/ping?get_server_status=true"
log "Requesting ${ping_url}"

tmp_body="$(mktemp)"
trap 'rm -f "$tmp_body"' EXIT

http_code="$(curl -sS -o "$tmp_body" -w '%{http_code}' --max-time 20 \
  -H "CF-Access-Client-Id: ${CF_ACCESS_CLIENT_ID}" \
  -H "CF-Access-Client-Secret: ${CF_ACCESS_CLIENT_SECRET}" \
  "$ping_url" 2>/dev/null || printf '000')"

body="$(cat "$tmp_body" 2>/dev/null || true)"

if [ "$http_code" = "200" ]; then
  log "SUCCESS: reached the private Mattermost through the Cloudflare Tunnel (HTTP 200)."
  log "Response: ${body}"
  exit 0
fi

log "FAILED: expected HTTP 200 but got ${http_code}."
if [ -n "$body" ]; then
  log "Response body: ${body}"
fi
case "$http_code" in
  000) log "Could not connect. Check MM_TUNNEL_URL, and add the hostname to the network allowlist if egress is restricted." ;;
  403) log "Access denied. Check the CF_ACCESS_CLIENT_ID/SECRET service token and the Access policy (Action: Service Auth)." ;;
  502 | 503 | 530) log "Tunnel reachable but origin down. Start the connector and 'make run-server' on the private-network host." ;;
esac
exit 1
