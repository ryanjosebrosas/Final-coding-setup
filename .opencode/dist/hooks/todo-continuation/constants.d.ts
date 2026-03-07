/**
 * Constants for the todo continuation enforcer hook.
 */
/**
 * Hook name for logging and identification.
 */
export declare const HOOK_NAME = "todo-continuation-enforcer";
/**
 * Default agents to skip for todo continuation.
 * Subagents should not be forced to complete todos - they're delegated work.
 */
export declare const DEFAULT_SKIP_AGENTS: string[];
/**
 * Countdown delay before injecting continuation reminder (ms).
 */
export declare const COUNTDOWN_DELAY_MS = 5000;
/**
 * Interval between continuation reminders (ms).
 */
export declare const CONTINUATION_INTERVAL_MS = 10000;
/**
 * Maximum consecutive failures before giving up.
 */
export declare const MAX_CONSECUTIVE_FAILURES = 3;
/**
 * Cooldown period after last injection (ms).
 */
export declare const INJECTION_COOLDOWN_MS = 15000;
/**
 * TTL for idle session state entries (10 minutes).
 */
export declare const SESSION_STATE_TTL_MS: number;
/**
 * Prune interval for cleanup (2 minutes).
 */
export declare const SESSION_STATE_PRUNE_INTERVAL_MS: number;
