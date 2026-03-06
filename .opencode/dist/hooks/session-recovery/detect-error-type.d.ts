/**
 * Detect the type of recoverable error.
 */
import type { RecoveryErrorType } from "./types";
/**
 * Detect the type of recoverable error from error object.
 */
export declare function detectErrorType(error: unknown): RecoveryErrorType | null;
