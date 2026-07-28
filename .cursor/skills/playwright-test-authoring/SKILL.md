---
name: playwright-test-authoring
description: Author Playwright e2e tests that follow Mattermost's e2e-tests/playwright conventions (fixtures, page objects, placement, tags, and local run commands). Use when writing or adding Playwright tests, expanding e2e coverage, adding regression tests for the webapp, or when the qa-reviewer agent recommends a Playwright spec.
---

# Playwright test authoring

Write Playwright specs that match this repository's existing patterns. Prefer page objects and the `pw` fixture over raw selectors in specs.

## Where specs live

Under `e2e-tests/playwright/specs/`:

| Kind | Path | Notes |
|------|------|--------|
| Functional | `specs/functional/<area>/...` | Behavior and regressions. Areas include `channels/`, `system_console/`, `plugins/`. Nest by feature (e.g. `channels/search/`). |
| Visual | `specs/visual/<area>/...` | UI snapshots. Always tag `@visual`. |
| Accessibility | `specs/accessibility/<product>/...` | WCAG/keyboard/a11y. Tag `@accessibility` plus feature tags. See `docs/accessibility/`. |

File names: snake_case with `.spec.ts` (e.g. `find_channels.spec.ts`).

## Conventions (from existing specs)

**Imports** — always from the shared lib, not `@playwright/test` directly for `test`/`expect`:

```typescript
import {expect, test} from '@mattermost/playwright-lib';
```

Package: `@mattermost/playwright-lib` (workspace at `e2e-tests/playwright/lib/`). Page/component objects live in `lib/src/ui/pages` and `lib/src/ui/components`.

**Fixture** — use the `pw` fixture (`PlaywrightExtended`):

- `await pw.initSetup()` — creates admin client, team, and user; returns `{adminClient, adminUser, user, userClient, team, ...}`.
- `await pw.testBrowser.login(user)` — returns page objects such as `{channelsPage}`.
- Helpers on `pw`: `createNewUserProfile`, `random` (ids/channels/posts), `matchSnapshot`, license/feature skips, etc.

**Typical flow**:

```typescript
const {user, team} = await pw.initSetup();
const {channelsPage} = await pw.testBrowser.login(user);
await channelsPage.goto(); // or channelsPage.goto(team.name, 'town-square')
await channelsPage.toBeVisible();
```

**Titles and docs**:

- Prefer action-oriented titles; include a ticket id when one exists (`MM-T5435_1 ...`, `MM-67920 ...`, or `MM-67594_1 ...`).
- JSDoc `@objective` (and `@reference` when applicable) above the test.
- Comments: `// #` for actions, `// *` for assertions.

**Tags** — second arg to `test(...)`, e.g. `{tag: '@smoke'}`, `{tag: ['@mentions', '@visual']}`, `{tag: ['@accessibility', '@settings']}`.

**Locators** — put selectors in page/component objects under `lib/src/ui/`. Prefer role/label/text locators; use `data-testid` only when needed. Specs should not hardcode static UI text or CSS selectors when a page object exists or should.

## Run locally (server at http://localhost:8065)

With Mattermost already running (default base URL is `http://localhost:8065`):

```bash
cd e2e-tests/playwright
npm i
npx playwright install   # if browsers missing
npm run test -- path/or/name --project=chrome
```

Useful env vars (see `sample.env`; defaults from `lib/src/test_config.ts`):

- `PW_BASE_URL` — default `http://localhost:8065`
- `PW_HEADLESS` — default `true`; set `false` for headed
- `PW_ADMIN_USERNAME` / `PW_ADMIN_PASSWORD` / `PW_ADMIN_EMAIL` — admin API credentials
- `PW_SLOWMO`, `PW_WORKERS`

Other scripts from `package.json`: `npm run test:ci`, `npm run playwright-ui`, `npm run lint`, `npm run tsc`, `npm run check` (lint + prettier + tsc + test-doc lint).

Inside Playwright Docker (visual snapshots), use `PW_BASE_URL=http://host.docker.internal:8065`.

## Workflow

1. Identify the user-visible behavior and which product area it belongs to.
2. Search `specs/` for an existing similar test; prefer extending over duplicating.
3. Check `lib/src/ui/` for a page/component object before writing locators; add or extend one if missing.
4. Place the new `.spec.ts` under the correct `functional` / `visual` / `accessibility` tree.
5. Follow imports, `pw.initSetup` + `testBrowser.login`, title/tag/comment conventions above.
6. Run the single spec with `npm run test -- <path-or-grep> --project=chrome` against localhost:8065; iterate until green.
7. Run `npm run check` if you touched shared lib or want full lint/type validation.
