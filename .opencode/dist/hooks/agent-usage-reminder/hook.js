/**
 * Agent Usage Reminder Hook
 *
 * Reminds agents about available specialized subagents when
 * they're doing work that could be delegated.
 */
import { TARGET_TOOLS, AGENT_TOOLS, HOOK_NAME, REMINDER_MESSAGE } from "./constants";
import { log } from "../../shared/logger";
/**
 * Orchestrator agents that should receive reminders.
 * Subagents (explore, librarian, oracle) are the targets of delegation,
 * not the source.
 */
const ORCHESTRATOR_AGENTS = new Set([
    "sisyphus",
    "sisyphus-junior",
    "atlas",
    "hephaestus",
    "prometheus",
]);
/**
 * Check if an agent name is an orchestrator.
 */
function isOrchestratorAgent(agentName) {
    const key = agentName.toLowerCase().replace(/-/g, "");
    for (const orch of ORCHESTRATOR_AGENTS) {
        if (key.includes(orch))
            return true;
    }
    return false;
}
/**
 * Create the agent usage reminder hook.
 */
export function createAgentUsageReminderHook(_ctx) {
    const sessionStates = new Map();
    /**
     * Get or create session state.
     */
    function getOrCreateState(sessionID) {
        if (!sessionStates.has(sessionID)) {
            const persisted = loadAgentUsageState(sessionID);
            const state = persisted ?? {
                sessionID,
                agentUsed: false,
                reminderCount: 0,
                updatedAt: Date.now(),
            };
            sessionStates.set(sessionID, state);
        }
        return sessionStates.get(sessionID);
    }
    /**
     * Mark that an agent was used.
     */
    function markAgentUsed(sessionID) {
        const state = getOrCreateState(sessionID);
        state.agentUsed = true;
        state.updatedAt = Date.now();
        saveAgentUsageState(state);
    }
    /**
     * Reset state for a session.
     */
    function resetState(sessionID) {
        sessionStates.delete(sessionID);
        clearAgentUsageState(sessionID);
    }
    /**
     * Handle tool execution after.
     */
    const toolExecuteAfter = async (input, output) => {
        const { tool, sessionID, agent } = input;
        const toolLower = tool.toLowerCase();
        // Check if orchestrator agent
        if (agent && !isOrchestratorAgent(agent)) {
            return;
        }
        // Check if already using agents
        if (AGENT_TOOLS.has(toolLower)) {
            markAgentUsed(sessionID);
            return;
        }
        // Only consider delegatable work tools
        if (!TARGET_TOOLS.has(toolLower)) {
            return;
        }
        const state = getOrCreateState(sessionID);
        // Show reminder if not already shown
        if (!state.agentUsed && state.reminderCount < 3) {
            output.output += REMINDER_MESSAGE;
            state.reminderCount++;
            log(`[${HOOK_NAME}] Reminder shown`, { sessionID, reminderCount: state.reminderCount });
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
                resetState(sessionInfo.id);
            }
        }
        // Clean up on compaction
        if (event.type === "session.compacted") {
            const sessionID = (props?.sessionID ?? props?.info?.id);
            if (sessionID) {
                resetState(sessionID);
            }
        }
    };
    return {
        "tool.execute.after": toolExecuteAfter,
        event,
    };
}
/**
 * Load agent usage state from storage.
 * Stub implementation - would use actual storage in production.
 */
function loadAgentUsageState(_sessionID) {
    // Stub - would load from file/DB
    return null;
}
/**
 * Save agent usage state to storage.
 * Stub implementation - would use actual storage in production.
 */
function saveAgentUsageState(_state) {
    // Stub - would save to file/DB
}
/**
 * Clear agent usage state from storage.
 * Stub implementation - would use actual storage in production.
 */
function clearAgentUsageState(_sessionID) {
    // Stub - would delete from file/DB
}
//# sourceMappingURL=hook.js.map