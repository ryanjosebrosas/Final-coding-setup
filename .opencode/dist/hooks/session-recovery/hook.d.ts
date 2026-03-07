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
import type { SessionRecoveryHook, SessionRecoveryOptions, SessionRecoveryPluginInput } from "./types";
import { detectErrorType } from "./detect-error-type";
/**
 * Create the session recovery hook.
 */
export declare function createSessionRecoveryHook(ctx: SessionRecoveryPluginInput, _options?: SessionRecoveryOptions): SessionRecoveryHook;
export { detectErrorType };
export type { RecoveryErrorType } from "./types";
