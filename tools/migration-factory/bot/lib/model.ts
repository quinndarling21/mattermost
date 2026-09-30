import type { ModelSetting } from "@cursor/bdk";

/**
 * Every agent in the factory (the orchestrator turn and every cloud agent it
 * launches) runs Grok 4.7, High effort, Fast. BDK takes effort/speed as
 * params, not id suffixes. There is deliberately no `modelFallbacks`: if this
 * model is refused, the run fails loudly instead of switching models.
 */
export const GROK_47_HIGH_FAST: ModelSetting = {
  id: "grok-4.7",
  params: [
    { id: "context", value: "256k" },
    { id: "reasoning_effort", value: "high" },
    { id: "fast", value: "true" },
  ],
};

export const MODEL_LABEL = "grok-4.7 (reasoning_effort=high, fast=true, context=256k)";
