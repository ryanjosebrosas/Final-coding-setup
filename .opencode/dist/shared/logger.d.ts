/**
 * Shared logging utility for hooks and features.
 * Writes to a temporary log file for debugging.
 */
/**
 * Log a message with optional data to the hook log file.
 * @param message - Log message
 * @param data - Optional data to include
 */
export declare function log(message: string, data?: unknown): void;
/**
 * Get the path to the log file.
 */
export declare function getLogFilePath(): string;
