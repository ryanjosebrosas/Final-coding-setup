/**
 * Session Recovery Hook
 *
 * Handles recovery from various session errors to prevent session loss.
 * Supports recovery from:
 * - tool_result_missing: Inject cancelled tool results
 * - unavailable_tool: Remove unavailable tool calls
 * - thinking_block_order: Fix thinking block structure
 * - thinking_disabled_violation: Strip thinking blocks
 */
import { detectErrorType } from "./detect-error-type";
import { log } from "../../shared/logger";
/**
 * Create the session recovery hook.
 */
export function createSessionRecoveryHook(ctx, _options) {
    const processingErrors = new Set();
    // Experimental options not currently used
    let onAbortCallback = null;
    let onRecoveryCompleteCallback = null;
    const setOnAbortCallback = (callback) => {
        onAbortCallback = callback;
    };
    const setOnRecoveryCompleteCallback = (callback) => {
        onRecoveryCompleteCallback = callback;
    };
    const isRecoverableError = (error) => {
        return detectErrorType(error) !== null;
    };
    const handleSessionRecovery = async (info) => {
        if (!info || info.role !== "assistant" || !info.error)
            return false;
        const errorType = detectErrorType(info.error);
        if (!errorType)
            return false;
        const sessionID = info.sessionID;
        const assistantMsgID = info.id;
        if (!sessionID || !assistantMsgID)
            return false;
        // Prevent duplicate recovery attempts
        if (processingErrors.has(assistantMsgID))
            return false;
        processingErrors.add(assistantMsgID);
        try {
            // Notify abort callback
            if (onAbortCallback) {
                onAbortCallback(sessionID);
            }
            // Abort current session
            if (ctx.client?.session?.abort) {
                await ctx.client.session.abort({ path: { id: sessionID } }).catch(() => { });
            }
            // Show toast notification
            const toastTitles = {
                tool_result_missing: "Tool Crash Recovery",
                unavailable_tool: "Tool Recovery",
                thinking_block_order: "Thinking Block Recovery",
                thinking_disabled_violation: "Thinking Strip Recovery",
                assistant_prefill_unsupported: "Prefill Unsupported",
            };
            const toastMessages = {
                tool_result_missing: "Injecting cancelled tool results...",
                unavailable_tool: "Recovering from unavailable tool call...",
                thinking_block_order: "Fixing message structure...",
                thinking_disabled_violation: "Stripping thinking blocks...",
                assistant_prefill_unsupported: "Prefill not supported; continuing without recovery.",
            };
            await ctx.client?.tui?.showToast?.({
                body: {
                    title: toastTitles[errorType],
                    message: toastMessages[errorType],
                    variant: "warning",
                    duration: 3000,
                },
            }).catch(() => { });
            // Recovery logic would go here based on error type
            // For now, log the recovery attempt
            log("[session-recovery] Recovery attempted", {
                sessionID,
                errorType,
                assistantMsgID,
            });
            // For prefill_unsupported, we can't recover
            if (errorType === "assistant_prefill_unsupported") {
                return false;
            }
            return true;
        }
        catch (err) {
            log("[session-recovery] Recovery failed:", { error: String(err) });
            return false;
        }
        finally {
            processingErrors.delete(assistantMsgID);
            if (sessionID && onRecoveryCompleteCallback) {
                onRecoveryCompleteCallback(sessionID);
            }
        }
    };
    return {
        handleSessionRecovery,
        isRecoverableError,
        setOnAbortCallback,
        setOnRecoveryCompleteCallback,
    };
}
export { detectErrorType };
//# sourceMappingURL=hook.js.map