#!/usr/bin/env bash
set -Eeuo pipefail

# Calls the private Mattermost server through the Cloudflare Tunnel using the
# Cloudflare Access service-token headers. This is the same request a Cursor
# Cloud Agent makes. Run it from your laptop first to confirm the tunnel and the
# Access policy work before launching a Cloud Agent.
#
# Reads MM_TUNNEL_URL, CF_ACCESS_CLIENT_ID, and CF_ACCESS_CLIENT_SECRET from the
# environment or from a local .env file in this directory.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

log() {
  printf '[verify] %s\n' "$*" >&2
}

if [ -f "$SCRIPT_DIR/.env" ]; then
  set -a
  # shellcheck source=/dev/null
  . "$SCRIPT_DIR/.env"
  set +a
fi

: "${MM_TUNNEL_URL:?Set MM_TUNNEL_URL, e.g. https://mm-internal.quinn-cloudflare-demo.com}"
: "${CF_ACCESS_CLIENT_ID:?Set CF_ACCESS_CLIENT_ID (Cloudflare Access service token client id)}"
: "${CF_ACCESS_CLIENT_SECRET:?Set CF_ACCESS_CLIENT_SECRET (Cloudflare Access service token client secret)}"

ping_url="${MM_TUNNEL_URL%/}/api/v4/system/ping?get_server_status=true"
tmp_body="$(mktemp)"
trap 'rm -f "$tmp_body"' EXIT

log "GET ${ping_url}"
http_code="$(curl -sS -o "$tmp_body" -w '%{http_code}' --max-time 20 \
  -H "CF-Access-Client-Id: ${CF_ACCESS_CLIENT_ID}" \
  -H "CF-Access-Client-Secret: ${CF_ACCESS_CLIENT_SECRET}" \
  "$ping_url" 2>/dev/null || printf '000')"

log "HTTP ${http_code}"
body="$(cat "$tmp_body" 2>/dev/null || true)"
if [ -n "$body" ]; then
  log "Response: ${body}"
fi

if [ "$http_code" = "200" ]; then
  log "SUCCESS: reached Mattermost through the Cloudflare Tunnel."
  exit 0
fi

log "FAILED: expected HTTP 200. Common causes:"
case "$http_code" in
  000) log "  - Cannot connect: check MM_TUNNEL_URL and that the connector is running." ;;
  403) log "  - Access denied: check the service token headers and the Access 'Service Auth' policy." ;;
  502 | 503 | 530) log "  - Tunnel up but origin down: start 'make run-server' and ./run-connector.sh." ;;
  *) log "  - Unexpected status; see the response body above." ;;
esac
exit 1
