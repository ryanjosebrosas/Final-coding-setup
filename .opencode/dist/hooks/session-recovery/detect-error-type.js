/**
 * Detect the type of recoverable error.
 */
/**
 * Patterns for error detection.
 */
const ERROR_PATTERNS = {
    tool_result_missing: [
        /tool_result_missing/i,
        /missing tool result/i,
        /tool result not found/i,
    ],
    unavailable_tool: [
        /unavailable_tool/i,
        /tool not available/i,
        /unknown tool/i,
    ],
    thinking_block_order: [
        /thinking_block_order/i,
        /thinking block.*order/i,
    ],
    thinking_disabled_violation: [
        /thinking_disabled_violation/i,
        /thinking.*disabled/i,
    ],
    assistant_prefill_unsupported: [
        /assistant_prefill_unsupported/i,
        /prefill.*unsupported/i,
    ],
};
/**
 * Detect the type of recoverable error from error object.
 */
export function detectErrorType(error) {
    if (!error)
        return null;
    // Check error name
    const errorObj = error;
    const errorName = errorObj.name ?? "";
    const errorMessage = errorObj.message ?? "";
    for (const [type, patterns] of Object.entries(ERROR_PATTERNS)) {
        for (const pattern of patterns) {
            if (pattern.test(errorName) || pattern.test(errorMessage)) {
                return type;
            }
        }
    }
    return null;
}
//# sourceMappingURL=detect-error-type.js.map