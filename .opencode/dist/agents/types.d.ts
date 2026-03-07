export type AgentMode = "primary" | "subagent" | "all";
export type AgentRole = "orchestrator" | "executor" | "consultant" | "researcher" | "coordinator" | "planner" | "analyzer";
export interface AgentConfig {
    name: string;
    instructions: string;
    model: string;
    temperature: number;
    mode: AgentMode;
    permissions: AgentPermissions;
    fallbackChain?: readonly string[];
}
export interface AgentPermissions {
    readFile: boolean;
    writeFile: boolean;
    editFile: boolean;
    bash: boolean;
    grep: boolean;
    task: boolean;
}
export interface AgentFactory {
    (model: string): AgentConfig;
    mode: AgentMode;
}
export interface ModelRequirement {
    provider: string;
    model: string;
    temperature: number;
    reasoningBudget?: number;
    creativity?: number;
}
export interface AgentModelRequirements {
    agentName: string;
    primary: ModelRequirement;
    fallbacks: ModelRequirement[];
}
export interface AgentCapabilities {
    canReadFiles: boolean;
    canWriteFiles: boolean;
    canEditFiles: boolean;
    canRunCommands: boolean;
    canSearchCode: boolean;
    canDelegate: boolean;
    canAnalyzeVisuals: boolean;
    canUseExternalSearch: boolean;
}
export declare function getCapabilities(permissions: AgentPermissions): AgentCapabilities;
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
