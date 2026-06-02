# Cursor Cloud Agent Instructions

These instructions apply to Cursor Cloud Agents after `.cursor/scripts/cloud-agent-start.sh` materializes this file as `.cursor/AGENTS.md`.

## Environment

- Docker must be available. If `docker info` fails, inspect `/tmp/docker-service-start.log` and `/tmp/dockerd.log`; do not assume a snapshot will provide Docker.
- The image includes Go, Node/npm, Docker Compose, AWS CLI v2, and `agent-browser`.
- Cursor should provide `mattermost/enterprise` through the multi-repo environment. The expected layout is sibling repositories, such as `/agent/repos/mattermost` and `/agent/repos/enterprise`; this matches `server/Makefile`'s default `../../enterprise` path.

## Running Mattermost

1. Start dependencies:

   ```bash
   cd server
   make start-docker
   ```

2. Start the server:

   ```bash
   cd server
   make run-server
   ```

3. Start the web app in another terminal when UI work needs live verification:

   ```bash
   cd webapp
   make run
   ```

The Mattermost server is expected at `http://localhost:8065`. The webapp dev server commonly uses `http://localhost:9005`.

### Known-good Cloud flow

- In this multi-repo Cloud environment, `mattermost` and `enterprise` are expected to start from `master`, so sibling checkout skew should not need extra handling.
- `server/Makefile`'s `run` target only reaches `run-client` if the server is backgrounded. In Cloud, the reliable combined startup is:

  ```bash
  cd server
  ENABLED_DOCKER_SERVICES='postgres redis' RUN_SERVER_IN_BACKGROUND=true make run
  ```

- If you want split terminals instead, use:

  ```bash
  cd server
  ENABLED_DOCKER_SERVICES='postgres redis' make run-server
  ```

  and then:

  ```bash
  cd webapp
  make run
  ```

- When the server starts and `MM_LICENSE` is present in the environment, the server applies that license automatically. If `MM_LICENSE` is not set, starting the server automatically applies an Entry license, which provides nearly all functionality needed for development.
- When `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` are configured as Cloud Agent secrets, `cloud-agent-start.sh` logs in to Docker Hub and the full default `make start-docker` dependency set can be used without trimming services.
- `ENABLED_DOCKER_SERVICES='postgres redis'` avoids optional local-dev services such as Prometheus, Grafana, Loki, Minio, Azurite, and OpenLDAP. Use this fallback when Docker Hub credentials are unavailable and anonymous pulls hit rate limits.
- If the first-user signup UI is flaky but the server is already healthy, seed local state with `mmctl` and then log in through the browser:

  ```bash
  cd server
  ./bin/mmctl --local user create --email cursor@example.com --username cursoradmin --password Password123! --system-admin --email-verified --disable-welcome-email
  ./bin/mmctl --local team create --name cursorteam --display-name "Cursor Team" --email cursor@example.com
  ```

- A healthy server responds at:

  ```bash
  curl http://127.0.0.1:8065/api/v4/system/ping
  ```

## Tests And Setup

- Backend workspace setup is handled by `cd server && make setup-go-work`; never run `go mod tidy` directly.
- Webapp dependencies are installed with `cd webapp && make node_modules`.
- Playwright dependencies are installed with `cd e2e-tests/playwright && npm ci`.
- For full Playwright compose flows, use the existing `e2e-tests` Makefile and scripts. Docker Compose is available in the Cloud Agent image.

## Browser Screenshots

Use `agent-browser` for browser automation and screenshots. If the CLI is missing or browsers are unavailable, run:

```bash
npm install -g agent-browser@0.27.0
agent-browser install
```

- Chrome is available in the Cloud image, and `agent-browser skills get core --full` is a quick check that the CLI and bundled skills are working.
Prefer verifying UI changes against the running local Mattermost instance before opening or updating a PR.

## AWS And PR Artifacts

AWS CLI v2 is installed for uploading screenshots or reports. Cloud Agents should receive `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_S3_BUCKET_NAME` as environment variables.

Before uploading, verify credentials with:

```bash
aws sts get-caller-identity
```

- If the configured S3 bucket is public, upload with `aws s3 cp` and share the plain object URL `https://$AWS_S3_BUCKET_NAME.s3.amazonaws.com/<key>` instead of generating a presigned URL.
Do not hardcode AWS credentials or bucket secrets in the repository.

## Cursor Cloud specific instructions

- **Dependency refresh on startup:** run `CLOUD_AGENT_SKIP_ENTERPRISE=true bash .cursor/scripts/cloud-agent-install.sh` when the `mattermost/enterprise` sibling checkout is not present (private repo). With the multi-repo environment, omit the skip so `verify_enterprise_checkout` can succeed.
- **Docker permissions:** if `docker ps` returns permission denied, use `sg docker -c '<command>'` or confirm the `ubuntu` user is in the `docker` group and the daemon is running (`sudo service docker start`). `cloud-agent-start.sh` can time out even when Docker works after manual start.
- **Minimal local stack:** `cd server && sg docker -c "ENABLED_DOCKER_SERVICES='postgres redis' make start-docker"` then `ENABLED_DOCKER_SERVICES='postgres redis' RUN_SERVER_IN_BACKGROUND=true make run` (or `make run-server` in tmux). See ports **8065** (server) and **9005** (webapp dev server).
- **Go version:** match `server/.go-version` (install under `/usr/local/go` if the VM image Go is older). If `go.dev` downloads fail, use `https://dl.google.com/go/go<version>.linux-amd64.tar.gz`.
- **Node version:** match `.nvmrc` (`nvm use 24.11` after sourcing `~/.nvm/nvm.sh`).
- **Seeded admin for API/UI checks:** after `make run-server`, create `cursoradmin` / `Password123!` and team `cursorteam` with the `mmctl` commands above, then `mmctl --local team users add cursorteam cursoradmin` before posting to `town-square`.
- **Lint/tests (representative):** `cd webapp && make check-types`; `cd server && go test -short ./public/model/...` (or `make gotestsum` then `make test-server-quick` once `bin/gotestsum` exists). Full Playwright/docker E2E flows live under `e2e-tests/` (see `e2e-tests/README.md`).
- **Headless UI automation:** webpack dev bundles may hit the HTML meta CSP (`script-src 'self'`) in Playwright; use `bypassCSP: true` and a desktop user agent, or validate via API (`/api/v4/system/ping`, login + posts) when the UI shell is blocked.
