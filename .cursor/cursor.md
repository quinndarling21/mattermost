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

- Before `make start-docker` or `make run`, confirm Docker works with `docker info`. If the daemon is down, run `bash .cursor/scripts/cloud-agent-start.sh`. If you see `permission denied` on `/var/run/docker.sock`, fix group access (`sudo usermod -aG docker "$USER"` and re-login) or use `sudo chmod g+rw /var/run/docker.sock`. In some Cloud VMs, `usermod` does not take effect until a new login; `sudo chmod 666 /var/run/docker.sock` is a reliable same-session workaround.
- For browser demos, set `AGENT_BROWSER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable` when `agent-browser install` cannot download Chromium (system Chrome is preinstalled in the Cloud image).
- Put Node 24.11 on `PATH` before server/webapp commands. The install hook uses nvm; in a fresh shell:

  ```bash
  export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
  [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
  nvm use 24.11.1
  export PATH="$NVM_DIR/versions/node/v24.11.1/bin:$HOME/go/bin:$PATH"
  ```

- Team Edition dev works without the sibling `enterprise` checkout. If the install hook fails on enterprise verification, set `CLOUD_AGENT_SKIP_ENTERPRISE=true` (runtime still uses `server/enterprise` source-available code).
- Use tmux for long-running `make run` / `make run-server` sessions so the stack survives beyond a single shell command.
- Quick verification commands after startup: `curl http://127.0.0.1:8065/api/v4/system/ping`, `cd server && make validate-go-version vet`, `cd server && make test-public`, `cd webapp && npm run test --workspace platform/client`.
