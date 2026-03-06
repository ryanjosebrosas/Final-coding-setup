// ============================================================================
// PIPELINE HOOK - Session Start Reminder
// ============================================================================
import { readHandoff, hasPendingWork } from "../../pipeline/handoff";
import { getValidNextStates, getStatusDescription } from "../../pipeline/state-machine";
import { suggestNextCommand } from "../../pipeline/commands";
/**
 * Create a pipeline hook that injects pending work reminder on session start.
 *
 * This hook fires after context load and before agent logic, surfacing
 * "what to do next" for the current pipeline state.
 *
 * @param workspaceDir - Project root directory
 * @param options - Hook configuration options
 */
export function createPipelineHook(workspaceDir, options = {}) {
    const { priority = 90, skipBlocked = false } = options;
    return {
        name: "pipeline-handoff",
        priority,
        /**
         * Fire on session start to surface pending work.
         *
         * Returns a system reminder if there's pending pipeline work.
         */
        async onSessionStart() {
            const handoff = readHandoff(workspaceDir);
            if (!handoff) {
                // No pending work
                return null;
            }
            // Skip if blocked and configured
            if (skipBlocked && handoff.status === "blocked") {
                return {
                    type: "system-reminder",
                    content: `[PIPELINE] Pipeline is blocked. Last command: ${handoff.lastCommand}\n\nResolve blocking issue and run \`/prime\` to continue.`,
                };
            }
            // Check if there's pending work
            if (!hasPendingWork(handoff)) {
                return null;
            }
            // Build reminder
            const validStates = getValidNextStates(handoff.status);
            const description = getStatusDescription(handoff.status);
            const suggestion = suggestNextCommand(handoff.status, handoff.feature);
            let content = `[PIPELINE HANDOFF] Pending work detected:

- **Feature**: ${handoff.feature}
- **Status**: ${handoff.status} (${description})
- **Last Command**: ${handoff.lastCommand}
- **Next Command**: ${handoff.nextCommand}`;
            if (handoff.taskProgress) {
                content += `\n- **Task Progress**: ${handoff.taskProgress.completed}/${handoff.taskProgress.total} tasks complete`;
            }
            if (handoff.phaseProgress) {
                content += `\n- **Phase Progress**: ${handoff.phaseProgress.current}/${handoff.phaseProgress.total} phases complete`;
            }
            content += `\n\nValid next states: ${validStates.join(", ") || "none (terminal)"}`;
            if (suggestion) {
                content += `\n\nRun \`/prime\` to load context and continue, or run \`${suggestion}\` directly.`;
            }
            else {
                content += `\n\nRun \`/prime\` to load context.`;
            }
            return {
                type: "system-reminder",
                content,
            };
        },
        /**
         * Fire after a command completes.
         *
         * This could auto-update handoff based on command results,
         * but for MVP, we rely on manual state transitions.
         */
        async onCommandComplete(_command, _result) {
            // MVP: Manual state transitions via pipeline.advance()
            // Future: Auto-detect command completion and update handoff
            return null;
        },
    };
}
/**
 * Create a lightweight hook factory for MCP registration.
 */
export function createPipelineHookFactory(workspaceDir) {
    return (options) => createPipelineHook(workspaceDir, options);
}
//# sourceMappingURL=index.js.map