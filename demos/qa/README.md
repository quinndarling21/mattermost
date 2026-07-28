# QA demos for Cursor

Two demo flows that show Cursor supporting QA work, ramping from assisted coverage
gaps to an autonomous exploratory pass. Both run from `master` — no branch
checkouts required.

## Demo 1 — Agent-assisted test coverage

Shows an agent reviewing recent change coverage, then authoring a missing
Playwright test in the repo’s conventions.

### Artifacts

- `.cursor/skills/playwright-test-authoring/SKILL.md` — how to author Playwright
  specs for this repository
- `.cursor/agents/qa-reviewer.md` — subagent that reviews coverage gaps

### How to run

Paste a prompt such as:

> Use the qa-reviewer subagent to review test coverage for \<recent change\>,
> then add the highest-impact missing Playwright test.

### What the audience sees

1. A coverage-gap report for the change under review.
2. A new Playwright spec authored to match existing e2e conventions.
3. The new test run green locally.

## Demo 2 — Autonomous exploratory QA pass

Shows an agent driving the real Mattermost UI against a local server, catching a
silent edit-save failure, and filing a Linear bug with repro evidence.

### Artifacts

- `.cursor/skills/qa-exploratory-pass/SKILL.md` — exploratory QA charter
- Flag-gated seeded defect in `webapp/channels/src/actions/views/posts.js` —
  when `localStorage` key `MM_QA_DEMO_BUG` is `'true'`, message edits return
  fake success and the edited text is silently lost. The flag is off by
  default, so `main` behavior is unchanged until armed.

### Arm the seeded defect

In the browser DevTools console on the Mattermost tab:

```js
localStorage.setItem('MM_QA_DEMO_BUG', 'true')
```

To disarm:

```js
localStorage.removeItem('MM_QA_DEMO_BUG')
```

You can also instruct the agent’s browser session to set the key before the
pass.

### How to run

1. Start the local stack (known-good Cloud flow):

   ```bash
   cd server
   ENABLED_DOCKER_SERVICES='postgres redis' RUN_SERVER_IN_BACKGROUND=true make run
   ```

2. Confirm health: `curl http://127.0.0.1:8065/api/v4/system/ping`
3. Arm `MM_QA_DEMO_BUG` in the Mattermost browser session.
4. Paste:

   > Run the qa-exploratory-pass skill against the local server and file
   > anything you find.

### What the audience sees

1. The agent exercises core messaging flows in the real UI.
2. It catches that an edited message reverts after the editor closes (and after
   reload).
3. It files a Linear bug (team MAT) with steps, expected vs actual, and
   screenshot/video evidence.

## Resetting after the demo

1. Disarm the flag: `localStorage.removeItem('MM_QA_DEMO_BUG')` in the
   Mattermost tab (or close that browser profile).
2. Optionally close or delete any Linear issue filed during the pass so the
   tracker stays clean.
