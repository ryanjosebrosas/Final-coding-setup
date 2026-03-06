/**
 * Boulder state file reader and progress tracker.
 */
import type { BoulderState, PlanProgress, TaskInfo } from "./types";
/**
 * Read the boulder state from the workspace directory.
 */
export declare function readBoulderState(directory: string): BoulderState | null;
/**
 * Write boulder state to disk.
 */
export declare function writeBoulderState(directory: string, state: BoulderState): boolean;
/**
 * Get plan progress from active plan.
 */
export declare function getPlanProgress(activePlan?: PlanProgress): {
    completed: number;
    total: number;
    isComplete: boolean;
};
/**
 * Find the next pending task in the plan.
 */
export declare function getNextPendingTask(state: BoulderState): TaskInfo | null;
/**
 * Mark a task as in-progress.
 */
export declare function startTask(directory: string, state: BoulderState, taskId: string): boolean;
/**
 * Mark a task as completed.
 */
export declare function completeTask(directory: string, state: BoulderState, taskId: string): boolean;
/**
 * Create a new boulder state.
 */
export declare function createBoulderState(planName: string, planPath: string, tasks: TaskInfo[], agent?: string): BoulderState;
