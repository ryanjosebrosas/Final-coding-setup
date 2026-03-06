/**
 * Atlas Event Handler
 *
 * Handles session.idle events to inject boulder continuation reminders.
 */
import type { PluginInput, AtlasHookOptions, SessionState } from "./types";
/**
 * Create the Atlas event handler.
 */
export declare function createAtlasEventHandler(input: {
    ctx: PluginInput;
    options?: AtlasHookOptions;
    sessions: Map<string, SessionState>;
    getState: (sessionID: string) => SessionState;
}): (arg: {
    event: {
        type: string;
        properties?: unknown;
    };
}) => Promise<void>;
