import type { PipelineStatus, TransitionResult } from "./types";
/**
 * Check if a transition from one status to another is valid.
 */
export declare function canTransition(from: PipelineStatus, to: PipelineStatus): boolean;
/**
 * Validate a state transition and return the result.
 */
export declare function validateTransition(from: PipelineStatus, to: PipelineStatus): TransitionResult;
/**
 * Get all valid next states for a given status.
 */
export declare function getValidNextStates(current: PipelineStatus): PipelineStatus[];
/**
 * Check if a status is a terminal state (no transitions out).
 */
export declare function isTerminalState(status: PipelineStatus): boolean;
/**
 * Check if a status is the "blocked" state.
 * Blocked allows resuming from any previous state.
 */
export declare function isBlockedState(status: PipelineStatus): boolean;
/**
 * Check if a status indicates execution is in progress.
 */
export declare function isExecutionState(status: PipelineStatus): boolean;
/**
 * Check if a status is in the review phase.
 */
export declare function isReviewState(status: PipelineStatus): boolean;
/**
 * Check if a status is ready for commit.
 */
export declare function isCommitReady(status: PipelineStatus): boolean;
/**
 * Command to target state mapping.
 * Maps command names to the pipeline status they produce.
 */
export declare const COMMAND_TARGET_STATES: Record<string, PipelineStatus>;
/**
 * Get the target state for a command.
 */
export declare function getCommandTargetState(command: string): PipelineStatus | undefined;
/**
 * Infer the next state based on command completion and current state.
 */
export declare function inferNextState(currentStatus: PipelineStatus, completedCommand: string, success: boolean): PipelineStatus | null;
/**
 * Get human-readable description for a status.
 */
export declare function getStatusDescription(status: PipelineStatus): string;
