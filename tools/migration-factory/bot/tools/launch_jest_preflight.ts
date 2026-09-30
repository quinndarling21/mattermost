import { defineTool } from "@cursor/bdk/tools";
import { launchCloudAgent } from "@cursor/bdk/extensions/cursor-cloud-agents";
import { z } from "zod";
import { ENABLE_JEST_CI_BRIEF } from "../lib/tasks.js";
import { GROK_47_HIGH_FAST, MODEL_LABEL } from "../lib/model.js";
import { BASE_BRANCH, REPO_URL } from "../lib/repo.js";

export default defineTool({
  description:
    "Factory preflight (the Jest gate): launch a Cursor Cloud Agent (Grok 4.7 High Fast) that opens a PR changing .github/workflows/webapp-ci.yml so PRs into master run the webapp Jest jobs. Only call when asked to run the Jest-gate preflight.",
  effect: "write",
  inputSchema: z.object({}),
  async execute(_input, ctx) {
    const launched = await launchCloudAgent(ctx, {
      name: "migration-factory: enable webapp Jest in CI",
      prompt: ENABLE_JEST_CI_BRIEF,
      model: GROK_47_HIGH_FAST,
      cloud: {
        repos: [{ url: REPO_URL, startingRef: BASE_BRANCH }],
        autoCreatePR: true,
      },
    });
    return { task: "enable-jest-ci", model: MODEL_LABEL, ...launched };
  },
});
