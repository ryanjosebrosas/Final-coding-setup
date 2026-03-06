// ============================================================================
// AGENT TYPES
// ============================================================================
export function getCapabilities(permissions) {
    return {
        canReadFiles: permissions.readFile,
        canWriteFiles: permissions.writeFile,
        canEditFiles: permissions.editFile,
        canRunCommands: permissions.bash,
        canSearchCode: permissions.grep,
        canDelegate: permissions.task,
        canAnalyzeVisuals: false, // Only multimodal-looker
        canUseExternalSearch: !permissions.task, // Read-only agents can search external
    };
}
// ============================================================================
// AGENT MODE EXPLANATIONS
// ============================================================================
/**
 * Agent Mode determines how the agent is invoked:
 *
 * "primary" - Respects the user-selected model from the UI. Uses fallback chain
 *             when the primary model fails. Suitable for main orchestrator.
 *
 * "subagent" - Uses its own fallback chain regardless of UI selection. Suitable
 *               for specialized agents that should have consistent model behavior.
 *
 * "all" - Available in both primary and subagent contexts. The agent's mode
 *          property is checked at dispatch time to determine behavior.
 *
 * Examples:
 * - Sisyphus (primary/all) - Main orchestrator, respects user choice
 * - Oracle (subagent) - Always uses its fallback chain for consistent advice
 * - Sisyphus-Junior (all) - Can be spawned by primary or as subagent
 */ 
//# sourceMappingURL=types.js.map