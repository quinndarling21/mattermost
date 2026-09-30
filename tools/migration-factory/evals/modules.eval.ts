import { defineEval } from "@cursor/bdk/evals";

// Deterministic-ish smoke check that does NOT launch cloud agents: the
// orchestrator must discover all three modules via list_modules.
export default defineEval({
  tags: ["smoke"],
  description: "Factory lists the three Enzyme -> RTL modules without launching anything.",
  async test(t) {
    await t.send("List the migration modules you would fan out. Do not launch anything.");
    t.succeeded();
    t.calledTool("list_modules");
  },
});
