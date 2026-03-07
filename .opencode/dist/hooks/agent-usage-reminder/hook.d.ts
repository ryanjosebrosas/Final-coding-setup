/**
 * Agent Usage Reminder Hook
 *
 * Reminds agents about available specialized subagents when
 * they're doing work that could be delegated.
 */
import type { PluginInput } from "./types";
/**
 * Create the agent usage reminder hook.
 */
export declare function createAgentUsageReminderHook(_ctx: PluginInput): {
    "tool.execute.after": (input: {
        tool: string;
        sessionID: string;
        callID: string;
        agent?: string;
    }, output: {
        title: string;
        output: string;
        metadata: unknown;
    }) => Promise<void>;
    event: (input: {
        event: {
            type: string;
            properties?: unknown;
        };
    }) => Promise<void>;
};
