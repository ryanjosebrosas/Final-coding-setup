/**
 * Boulder state file reader and progress tracker.
 */
import * as fs from "fs";
import * as path from "path";
import { BOULDER_FILE } from "./constants";
import { log } from "../../shared/logger";
/**
 * Read the boulder state from the workspace directory.
 */
export function readBoulderState(directory) {
    const boulderPath = path.join(directory, ".agents", "boulder", BOULDER_FILE);
    try {
        if (!fs.existsSync(boulderPath)) {
            return null;
        }
        const content = fs.readFileSync(boulderPath, "utf-8");
        const state = JSON.parse(content);
        return state;
    }
    catch (error) {
        log(`[atlas] Failed to read boulder state`, { directory, error: String(error) });
        return null;
    }
}
/**
 * Write boulder state to disk.
 */
export function writeBoulderState(directory, state) {
    const boulderDir = path.join(directory, ".agents", "boulder");
    const boulderPath = path.join(boulderDir, BOULDER_FILE);
    try {
        if (!fs.existsSync(boulderDir)) {
            fs.mkdirSync(boulderDir, { recursive: true });
        }
        state.updated_at = Date.now();
        fs.writeFileSync(boulderPath, JSON.stringify(state, null, 2), "utf-8");
        return true;
    }
    catch (error) {
        log(`[atlas] Failed to write boulder state`, { directory, error: String(error) });
        return false;
    }
}
/**
 * Get plan progress from active plan.
 */
export function getPlanProgress(activePlan) {
    if (!activePlan || !activePlan.tasks) {
        return { completed: 0, total: 0, isComplete: false };
    }
    const completed = activePlan.tasks.filter((t) => t.status === "completed" || t.status === "cancelled").length;
    const total = activePlan.tasks.length;
    const isComplete = completed === total;
    return { completed, total, isComplete };
}
/**
 * Find the next pending task in the plan.
 */
export function getNextPendingTask(state) {
    if (!state.active_plan?.tasks) {
        return null;
    }
    // First, find any in-progress task
    const inProgress = state.active_plan.tasks.find((t) => t.status === "in_progress");
    if (inProgress) {
        return inProgress;
    }
    // Then, find the first pending task
    const pending = state.active_plan.tasks.find((t) => t.status === "pending");
    return pending || null;
}
/**
 * Mark a task as in-progress.
 */
export function startTask(directory, state, taskId) {
    if (!state.active_plan?.tasks) {
        return false;
    }
    const task = state.active_plan.tasks.find((t) => t.id === taskId);
    if (!task) {
        return false;
    }
    task.status = "in_progress";
    task.started_at = Date.now();
    state.active_plan.current = taskId;
    return writeBoulderState(directory, state);
}
/**
 * Mark a task as completed.
 */
export function completeTask(directory, state, taskId) {
    if (!state.active_plan?.tasks) {
        return false;
    }
    const task = state.active_plan.tasks.find((t) => t.id === taskId);
    if (!task) {
        return false;
    }
    task.status = "completed";
    task.completed_at = Date.now();
    // Clear current if this was the current task
    if (state.active_plan.current === taskId) {
        state.active_plan.current = undefined;
    }
    return writeBoulderState(directory, state);
}
/**
 * Create a new boulder state.
 */
export function createBoulderState(planName, planPath, tasks, agent) {
    return {
        plan_name: planName,
        plan_path: planPath,
        agent: agent || DEFAULT_ATLAS_AGENT,
        session_ids: [],
        active_plan: {
            total: tasks.length,
            completed: 0,
            tasks,
        },
        created_at: Date.now(),
        updated_at: Date.now(),
    };
}
import { DEFAULT_ATLAS_AGENT } from "./constants";
//# sourceMappingURL=boulder-state.js.map