/**
 * Atlas Hook - The Boulder Pusher
 *
 * Atlas reads boulder.json and orchestrates the todo list to ensure
 * work continues until all tasks are complete. This is the core "boulder
 * pusher" hook that enforces completion guarantees.
 *
 * Priority: CRITICAL - Part of continuation tier.
 */
import { createAtlasEventHandler } from "./event-handler";
import { HOOK_NAME } from "./hook-name";
/**
 * Create the Atlas hook.
 *
 * @param ctx - Plugin context
 * @param options - Hook options
 * @returns Hook handlers for event and tool.execute
 */
export function createAtlasHook(ctx, options) {
    const sessions = new Map();
    const pendingFilePaths = new Map();
    function getState(sessionID) {
        let state = sessions.get(sessionID);
        if (!state) {
            state = { promptFailureCount: 0 };
            sessions.set(sessionID, state);
        }
        return state;
    }
    return {
        handler: createAtlasEventHandler({ ctx, options, sessions, getState }),
        // Tool execute before handler (for file path tracking)
        "tool.execute.before": async (input, output) => {
            const filePath = (output.args.filePath ?? output.args.file_path ?? output.args.path);
            if (filePath) {
                pendingFilePaths.set(input.callID, filePath);
            }
        },
        // Tool execute after handler (for file path cleanup)
        "tool.execute.after": async (input, _output) => {
            pendingFilePaths.delete(input.callID);
        },
    };
}
export { HOOK_NAME };
export { readBoulderState, writeBoulderState, getPlanProgress, getNextPendingTask, createBoulderState } from "./boulder-state";
//# sourceMappingURL=index.js.map