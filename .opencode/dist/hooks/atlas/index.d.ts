/**
 * Atlas Hook - The Boulder Pusher
 *
 * Atlas reads boulder.json and orchestrates the todo list to ensure
 * work continues until all tasks are complete. This is the core "boulder
 * pusher" hook that enforces completion guarantees.
 *
 * Priority: CRITICAL - Part of continuation tier.
 */
import type { AtlasHookOptions, PluginInput } from "./types";
import { HOOK_NAME } from "./hook-name";
/**
 * Create the Atlas hook.
 *
 * @param ctx - Plugin context
 * @param options - Hook options
 * @returns Hook handlers for event and tool.execute
 */
export declare function createAtlasHook(ctx: PluginInput, options?: AtlasHookOptions): {
    handler: (arg: {
        event: {
            type: string;
            properties?: unknown;
        };
    }) => Promise<void>;
    "tool.execute.before": (input: {
        tool: string;
        sessionID: string;
        callID: string;
    }, output: {
        args: Record<string, unknown>;
    }) => Promise<void>;
    "tool.execute.after": (input: {
        tool: string;
        sessionID: string;
        callID: string;
    }, _output: {
        title: string;
        output: string;
    }) => Promise<void>;
};
export { HOOK_NAME };
export type { AtlasHookOptions, SessionState } from "./types";
export { readBoulderState, writeBoulderState, getPlanProgress, getNextPendingTask, createBoulderState } from "./boulder-state";
