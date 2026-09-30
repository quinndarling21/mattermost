// BDK's Cursor Cloud Agents extension. Mounted as `cloud`, it contributes
// cloud__launch / cloud__get / cloud__list / cloud__dump / cloud__reply /
// cloud__cancel and the cloud__handoff skill. The factory's own tools call
// the same launch path (launchCloudAgent), so every agent they start is
// steerable with these tools too.
import cursorCloudAgents from "@cursor/bdk/extensions/cursor-cloud-agents";
import { GROK_47_HIGH_FAST } from "../lib/model.js";
import { BASE_BRANCH, REPO_URL } from "../lib/repo.js";

export default cursorCloudAgents({
  cloud: {
    repos: [{ url: REPO_URL, startingRef: BASE_BRANCH }],
    autoCreatePR: true,
  },
  model: GROK_47_HIGH_FAST,
  // Repositories are allowlisted above, so launches don't park for approval.
  needsApproval: false,
});
