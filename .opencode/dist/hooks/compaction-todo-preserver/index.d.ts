/**
 * Compaction Todo Preserver Hook
 *
 * Preserves todo list state during context compaction.
 * Captures todos before compaction and restores them after.
 */
import type { PluginInput as BasePluginInput } from "../base";
/**
 * Compaction Todo Preserver hook interface.
 */
export interface CompactionTodoPreserver {
    capture: (sessionID: string) => Promise<void>;
    event: (input: {
        event: {
            type: string;
            properties?: unknown;
        };
    }) => Promise<void>;
}
/**
 * Create the compaction todo preserver hook.
 */
/**
 * Create the compaction todo preserver hook.
 */
export declare function createCompactionTodoPreserverHook(ctx: BasePluginInput): CompactionTodoPreserver;
