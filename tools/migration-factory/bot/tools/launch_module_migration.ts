import { defineTool } from "@cursor/bdk/tools";
import { launchCloudAgent } from "@cursor/bdk/extensions/cursor-cloud-agents";
import { z } from "zod";
import { MODULES, findModule, migrationBrief } from "../lib/modules.js";
import { GROK_47_HIGH_FAST, MODEL_LABEL } from "../lib/model.js";
import { BASE_BRANCH, REPO_URL } from "../lib/repo.js";

export default defineTool({
  description:
    "Hand one migration module to its own Cursor Cloud Agent (Grok 4.7 High Fast). The agent branches from master, migrates that module's Enzyme tests to React Testing Library per webapp/STYLE_GUIDE.md, runs the module's Jest tests, and opens its own PR against master. Call once per module.",
  effect: "write",
  inputSchema: z.object({
    module: z.enum(MODULES.map((m) => m.id) as [string, ...string[]]),
  }),
  async execute({ module }, ctx) {
    const m = findModule(module);
    if (m === undefined) throw new Error(`Unknown module ${module}`);
    const launched = await launchCloudAgent(ctx, {
      name: `migration-factory: RTL ${m.id}`,
      prompt: migrationBrief(m),
      model: GROK_47_HIGH_FAST,
      cloud: {
        repos: [{ url: REPO_URL, startingRef: BASE_BRANCH }],
        autoCreatePR: true,
      },
    });
    return { module: m.id, model: MODEL_LABEL, ...launched };
  },
});
