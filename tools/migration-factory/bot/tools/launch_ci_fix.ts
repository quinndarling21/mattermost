import { defineTool } from "@cursor/bdk/tools";
import { launchCloudAgent } from "@cursor/bdk/extensions/cursor-cloud-agents";
import { z } from "zod";
import { ciFixBrief } from "../lib/tasks.js";
import { GROK_47_HIGH_FAST, MODEL_LABEL } from "../lib/model.js";
import { REPO_URL } from "../lib/repo.js";

export default defineTool({
  description:
    "CI-fix loop: launch a NEW Cursor Cloud Agent (Grok 4.7 High Fast) on an existing factory PR's branch to fix failing CI and push to that same branch (no new PR).",
  effect: "write",
  inputSchema: z.object({
    prUrl: z.string().url().describe("GitHub PR URL in quinndarling21/mattermost"),
    failure: z.string().min(1).describe("Failing job names and the relevant log excerpt"),
  }),
  async execute({ prUrl, failure }, ctx) {
    if (!prUrl.startsWith(`${REPO_URL}/pull/`)) {
      throw new Error(`prUrl must be a pull request of ${REPO_URL}`);
    }
    const launched = await launchCloudAgent(ctx, {
      name: `migration-factory: CI fix ${prUrl.split("/").pop()}`,
      prompt: ciFixBrief(prUrl, failure),
      model: GROK_47_HIGH_FAST,
      cloud: {
        repos: [{ url: REPO_URL, prUrl }],
        autoCreatePR: false,
      },
    });
    return { prUrl, model: MODEL_LABEL, ...launched };
  },
});
