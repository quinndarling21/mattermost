import { defineTool } from "@cursor/bdk/tools";
import { z } from "zod";
import { MODULES } from "../lib/modules.js";
import { MODEL_LABEL } from "../lib/model.js";
import { BASE_BRANCH, REPO_URL } from "../lib/repo.js";

export default defineTool({
  description:
    "List the Enzyme -> RTL migration modules this factory knows about: id, directory, the Enzyme test files, and the snapshots each worker deletes.",
  effect: "read",
  inputSchema: z.object({}),
  async execute() {
    return {
      repo: REPO_URL,
      base: BASE_BRANCH,
      model: MODEL_LABEL,
      modules: MODULES.map((m) => ({
        id: m.id,
        title: m.title,
        dir: m.dir,
        testFiles: m.testFiles,
        snapshots: m.snapshots,
      })),
    };
  },
});
