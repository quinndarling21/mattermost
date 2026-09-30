import { defineAgent } from "@cursor/bdk";
import { GROK_47_HIGH_FAST } from "./lib/model.js";

export default defineAgent({
  name: "migration-factory",
  description:
    "Splits the Enzyme -> React Testing Library migration into modules and hands each module to its own Cursor Cloud Agent, one PR per module.",
  // Orchestrator turn runs the same model as the workers. No modelFallbacks.
  model: GROK_47_HIGH_FAST,
  // The orchestrator never edits code itself: it only has read tools plus the
  // factory's authored tools (reached over MCP). Cloud agents do the coding.
  tools: ["read", "grep", "glob", "ls"],
});
