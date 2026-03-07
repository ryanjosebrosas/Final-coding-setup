/**
 * Compaction Todo Preserver Hook
 *
 * Preserves todo list state during context compaction.
 * Captures todos before compaction and restores them after.
 */
import { log } from "../../shared/logger";
const HOOK_NAME = "compaction-todo-preserver";
/**
 * Extract todos from API response.
 */
function extractTodos(response) {
    const payload = response;
    if (Array.isArray(payload?.data)) {
        return payload.data;
    }
    if (Array.isArray(response)) {
        return response;
    }
    return [];
}
/**
 * Resolve the todo writer function.
 */
async function resolveTodoWriter() {
    // In a real implementation, this would resolve to the actual todo writer
    // For now, return null to indicate no-op
    return null;
}
/**
 * Resolve session ID from event properties.
 */
function resolveSessionID(props) {
    return (props?.sessionID ?? props?.info?.id);
}
/**
 * Create the compaction todo preserver hook.
 */
/**
 * Create the compaction todo preserver hook.
 */
export function createCompactionTodoPreserverHook(ctx) {
    // Cast to required type - caller ensures client.session.todo exists
    const pluginCtx = ctx;
    const snapshots = new Map();
    /**
     * Capture todos for a session before compaction.
     */
    const capture = async (sessionID) => {
        if (!sessionID)
            return;
        try {
            const response = await pluginCtx.client.session.todo({ path: { id: sessionID } });
            const todos = extractTodos(response);
            if (todos.length === 0)
                return;
            snapshots.set(sessionID, todos);
            log(`[${HOOK_NAME}] Captured todo snapshot`, { sessionID, count: todos.length });
        }
        catch (err) {
            log(`[${HOOK_NAME}] Failed to capture todos`, { sessionID, error: String(err) });
        }
    };
    /**
     * Restore todos after compaction.
     */
    const restore = async (sessionID) => {
        const snapshot = snapshots.get(sessionID);
        if (!snapshot || snapshot.length === 0)
            return;
        // Check if todos already exist (compaction might have preserved them)
        let hasCurrent = false;
        let currentTodos = [];
        try {
            const response = await pluginCtx.client.session.todo({ path: { id: sessionID } });
            currentTodos = extractTodos(response);
            hasCurrent = true;
        }
        catch (err) {
            log(`[${HOOK_NAME}] Failed to fetch todos post-compaction`, { sessionID, error: String(err) });
        }
        // If todos already present, skip restore
        if (hasCurrent && currentTodos.length > 0) {
            snapshots.delete(sessionID);
            log(`[${HOOK_NAME}] Skipped restore (todos already present)`, { sessionID, count: currentTodos.length });
            return;
        }
        // Resolve todo writer
        const writer = await resolveTodoWriter();
        if (!writer) {
            log(`[${HOOK_NAME}] Skipped restore (Todo.update unavailable)`, { sessionID });
            return;
        }
        try {
            await writer({ sessionID, todos: snapshot });
            log(`[${HOOK_NAME}] Restored todos after compaction`, { sessionID, count: snapshot.length });
        }
        catch (err) {
            log(`[${HOOK_NAME}] Failed to restore todos`, { sessionID, error: String(err) });
        }
        finally {
            snapshots.delete(sessionID);
        }
    };
    /**
     * Handle events.
     */
    const event = async ({ event }) => {
        const props = event.properties;
        // Clean up on session deletion
        if (event.type === "session.deleted") {
            const sessionID = resolveSessionID(props);
            if (sessionID) {
                snapshots.delete(sessionID);
            }
            return;
        }
        // Restore todos after compaction
        if (event.type === "session.compacted") {
            const sessionID = resolveSessionID(props);
            if (sessionID) {
                await restore(sessionID);
            }
            return;
        }
    };
    return { capture, event };
}
//# sourceMappingURL=index.js.map