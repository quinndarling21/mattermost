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
    /** Human-readable reason for a degraded outcome. */
    reason?: string;
    retryable?: boolean;
}

/**
 * Run the Improver as a one-shot Cursor agent in agent mode so it can edit the
 * target skill file. Mirrors the failure handling of the other Cursor SDK tools
 * in this repo: never throws, maps both SDK failure modes to a degraded outcome
 * so the surrounding workflow stays non-blocking.
 */
export async function runImproveAgent(options: AgentRunOptions): Promise<AgentRunOutcome> {
    try {
        const result = await Agent.prompt(options.prompt, {
            apiKey: options.apiKey,
            model: options.model,
            mode: "agent",
            local: {
                cwd: options.cwd,
                // Inline config only — don't load ambient project/user/team settings.
                settingSources: [],
            },
        });

        if (result.status !== "finished") {
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
