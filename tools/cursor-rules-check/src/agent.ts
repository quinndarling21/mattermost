import { Agent, CursorAgentError } from "@cursor/sdk";
import type { ModelSelection } from "@cursor/sdk";

export interface AgentRunOptions {
    prompt: string;
    cwd: string;
    apiKey: string;
    model: ModelSelection;
}

export interface AgentRunOutcome {
    ok: boolean;
    /** Final assistant text when the run finished successfully. */
    text?: string;
    /** Human-readable reason for a degraded (non-blocking) report. */
    reason?: string;
    /** Whether retrying the run might succeed (transient vs. config failure). */
    retryable?: boolean;
}

/**
 * Run the rules review as a one-shot Cursor agent.
 *
 * Uses `Agent.prompt` (create → one prompt → dispose) in plan mode so the
 * reviewer is read-only and cannot modify repository files. The function never
 * throws: every failure is mapped to a degraded outcome so the advisory check
 * stays non-blocking.
 *
 * Failure handling distinguishes the two SDK failure modes:
 * - a thrown `CursorAgentError` means the run never started (auth/config/network);
 * - a returned `status !== "finished"` means the run executed but did not succeed.
 */
export async function runComplianceAgent(options: AgentRunOptions): Promise<AgentRunOutcome> {
    try {
        const result = await Agent.prompt(options.prompt, {
            apiKey: options.apiKey,
            model: options.model,
            mode: "plan",
            local: {
                cwd: options.cwd,
                // Inline config only — don't load ambient project/user/team settings.
                settingSources: [],
            },
        });

        if (result.status !== "finished") {
            // A run that executed but didn't finish (error/cancelled) is usually transient.
            return {
                ok: false,
                reason: `agent run ended with status "${result.status}" (run ${result.id})`,
                retryable: true,
            };
        }

        return { ok: true, text: result.result ?? "" };
    } catch (err) {
        if (err instanceof CursorAgentError) {
            const code = err.code ? `, code=${err.code}` : "";
            return {
                ok: false,
                reason: `agent failed to start: ${err.message} (retryable=${err.isRetryable}${code})`,
                retryable: err.isRetryable,
            };
        }
        const message = err instanceof Error ? err.message : String(err);
        return { ok: false, reason: `unexpected agent error: ${message}`, retryable: false };
    }
}
