import { BASE_BRANCH } from "./repo.js";

/**
 * Factory preflight: make webapp CI on PRs into master actually run the Jest
 * jobs. Same change as commit 7217e5d on branch migration/enzyme-to-rtl.
 */
export const ENABLE_JEST_CI_BRIEF = `You are the preflight worker of the Enzyme -> React Testing Library migration factory (a BDK bot).

## Problem
In \`.github/workflows/webapp-ci.yml\` on \`${BASE_BRANCH}\`, the Jest jobs \`test-platform\` ("test (platform)"), \`test-mattermost-redux\` ("test (mattermost-redux)"), \`test-channels\` ("test (channels shard N/4)") and \`upload-coverage\` are gated on \`github.repository_owner == 'mattermost'\`, so on this fork (quinndarling21/mattermost) every PR into \`${BASE_BRANCH}\` skips Jest. The migration PRs need Jest to run.

## Change (exactly this, nothing else)
Create a new branch from \`${BASE_BRANCH}\` (suggested: \`migration-factory/enable-webapp-jest\`) and edit only \`.github/workflows/webapp-ci.yml\`:
1. For the \`test-platform\`, \`test-mattermost-redux\` and \`test-channels\` jobs, replace
   \`if: github.repository_owner == 'mattermost'\`
   with
   \`if: (github.repository_owner == 'mattermost' || github.repository == 'quinndarling21/mattermost')\`
2. For \`upload-coverage\`, replace
   \`if: \${{ github.repository_owner == 'mattermost' && (github.event_name != 'pull_request' || !startsWith(github.event.pull_request.base.ref, 'release-')) }}\`
   with
   \`if: \${{ (github.repository_owner == 'mattermost' || github.repository == 'quinndarling21/mattermost') && (github.event_name != 'pull_request' || !startsWith(github.event.pull_request.base.ref, 'release-')) }}\`

This is the same four-line change as commit 7217e5d58a3f300c5d25350f803b92a1512abe9a on branch \`migration/enzyme-to-rtl\`; you can compare with \`git show 7217e5d\` if that commit is fetchable. Do not change any other line or file. Validate the YAML still parses (e.g. \`python3 -c "import yaml,sys; yaml.safe_load(open('.github/workflows/webapp-ci.yml'))"\`).

## Pull request
Open one PR against \`${BASE_BRANCH}\` titled \`ci: run webapp Jest jobs on the quinndarling21 fork\`. Body: what was skipped and why, the four \`if:\` lines changed, and a line saying it was opened by the BDK migration-factory bot as the factory's Jest-gate preflight. Include a \`release-note\` block with \`NONE\`.`;

/** The factory's CI-fix loop: a fresh cloud agent repairs a failing PR on its own branch. */
export function ciFixBrief(prUrl: string, failure: string): string {
  return `You are the CI-fix worker of the Enzyme -> React Testing Library migration factory (a BDK bot).

Pull request ${prUrl} has failing CI. Work directly on that PR's existing branch: push fix commits to it. Do not open a new PR, do not force-push, and do not change the PR's base.

## Failure reported by CI
${failure}

## What to do
1. Reproduce the failure locally with the narrowest command (for Jest: \`cd webapp/channels && TZ=Etc/UTC npx jest <path>\`; for lint: \`npx eslint <files>\`; for types: \`npm run check-types\`).
2. Fix it within the files this PR already changes whenever possible. Follow \`webapp/STYLE_GUIDE.md\` (RTL helpers from \`tests/react_testing_utils\`, role/text queries, awaited \`userEvent\`, no new snapshots, keep the \`enzyme\` dependency).
3. Re-run the command until it passes, commit with a clear message, and push to the PR branch.
4. Do not modify \`.github/\`, \`package.json\` or lockfiles.`;
}
