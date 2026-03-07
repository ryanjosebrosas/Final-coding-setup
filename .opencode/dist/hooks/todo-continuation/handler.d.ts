/**
 * Event handler for todo continuation enforcement.
 */
import type { SessionStateStore, TodoContinuationPluginInput } from "./types";
interface EventHandlerArgs {
    ctx: TodoContinuationPluginInput;
    sessionStateStore: SessionStateStore;
    backgroundManager?: unknown;
    skipAgents?: string[];
    isContinuationStopped?: (sessionID: string) => boolean;
}
/**
 * Handle session.idle event - check for incomplete todos and inject reminder.
 */
export declare function handleSessionIdle(args: {
    ctx: TodoContinuationPluginInput;
    sessionID: string;
    sessionStateStore: SessionStateStore;
    backgroundManager?: unknown;
    skipAgents?: string[];
    isContinuationStopped?: (sessionID: string) => boolean;
}): Promise<void>;
/**
 * Handle non-idle events - reset state appropriately.
 */
export declare function handleNonIdleEvent(args: {
    eventType: string;
    properties: Record<string, unknown> | undefined;
    sessionStateStore: SessionStateStore;
}): void;
/**
 * Create the todo continuation event handler.
 */
export declare function createTodoContinuationHandler(args: EventHandlerArgs): (input: {
    event: {
        type: string;
        properties?: unknown;
    };
}) => Promise<void>;
export {};
