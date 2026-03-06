/**
 * Category Skill Reminder Hook
 *
 * Reminds orchestrator agents to use category + skill delegation
 * when they start doing work manually that could be delegated.
 */
import { log } from "../../shared/logger";
import { HOOK_NAME } from "./constants";
import { buildReminderMessage } from "./formatter";
/**
 * Target agents that should receive category+skill reminders.
 * These are orchestrator agents that delegate work.
 */
// Target agents that should receive category+skill reminders.
// These are orchestrator agents that delegate work.
const _TARGET_AGENTS = new Set([
    "sisyphus",
    "sisyphus-junior",
    "atlas",
    "hephaestus",
    "prometheus",
]);
/**
 * Tools that indicate the agent is doing delegatable work.
 */
const DELEGATABLE_WORK_TOOLS = new Set([
    "edit",
    "write",
    "bash",
    "read",
    "grep",
    "glob",
]);
/**
 * Tools that indicate the agent is already using delegation.
 */
const DELEGATION_TOOLS = new Set([
    "task",
    "call_omo_agent",
]);
/**
 * Get or create session state.
 */
function getOrCreateState(sessionStates, sessionID) {
    if (!sessionStates.has(sessionID)) {
        sessionStates.set(sessionID, {
            delegationUsed: false,
            reminderShown: false,
            toolCallCount: 0,
        });
    }
    return sessionStates.get(sessionID);
}
/**
 * Create the category skill reminder hook.
 */
export function createCategorySkillReminderHook(_ctx, availableSkills = []) {
    const sessionStates = new Map();
    const reminderMessage = buildReminderMessage(availableSkills);
    /**
     * Handle tool execution after event.
     */
    const toolExecuteAfter = async (input, output) => {
        const { tool, sessionID } = input;
        const toolLower = tool.toLowerCase();
        // Check if this is a target agent
        // In real implementation, we'd get the agent from session state
        // For now, assume it's orchestrator
        const state = getOrCreateState(sessionStates, sessionID);
        // Check if delegation was used
        if (DELEGATION_TOOLS.has(toolLower)) {
            state.delegationUsed = true;
            log(`[${HOOK_NAME}] Delegation tool used`, { sessionID, tool });
            return;
        }
        // Only track delegatable tools
        if (!DELEGATABLE_WORK_TOOLS.has(toolLower)) {
            return;
        }
        state.toolCallCount++;
        // Show reminder after 3 delegatable tool calls without using delegation
        if (state.toolCallCount >= 3 && !state.delegationUsed && !state.reminderShown) {
            output.output += reminderMessage;
            state.reminderShown = true;
            log(`[${HOOK_NAME}] Reminder injected`, {
                sessionID,
                toolCallCount: state.toolCallCount,
            });
        }
    };
    /**
     * Handle events.
     */
    const event = async ({ event }) => {
        const props = event.properties;
        // Clean up on session deletion
        if (event.type === "session.deleted") {
            const sessionInfo = props?.info;
            if (sessionInfo?.id) {
                sessionStates.delete(sessionInfo.id);
            }
        }
        // Clean up on compaction
        if (event.type === "session.compacted") {
            const sessionID = (props?.sessionID ?? props?.info?.id);
            if (sessionID) {
                sessionStates.delete(sessionID);
            }
        }
    };
    return {
        "tool.execute.after": toolExecuteAfter,
        event,
    };
}
//# sourceMappingURL=hook.js.map