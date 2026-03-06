import { type AgentMetadata, type AgentName } from "./registry";
export interface ResolvedAgent {
    agent: AgentMetadata;
    model: string;
    provider: string;
    source: "agent-default" | "category-default" | "user-override" | "fallback";
}
export interface ResolutionOptions {
    agentName?: AgentName;
    category?: string;
    provider?: string;
    model?: string;
}
/**
 * Resolve the model for an agent, considering:
 * 1. User override (explicit provider/model)
 * 2. Agent default model
 * 3. Category default model (if agent spawned via category)
 * 4. System fallback
 */
export declare function resolveAgentModel(options: ResolutionOptions): ResolvedAgent | null;
/**
 * Check if an agent is available (has valid model configuration).
 */
export declare function isAgentAvailable(agent: AgentMetadata | AgentName): boolean;
/**
 * Get all available agents.
 */
export declare function getAvailableAgents(): AgentMetadata[];
/**
 * Get agents suitable for a given task type.
 */
export declare function getAgentsForTask(taskType: string): AgentMetadata[];
/**
 * Check if an agent has permission to use a specific tool.
 */
export declare function hasPermission(agentName: AgentName, tool: string): boolean;
/**
 * Get denied tools for an agent.
 */
export declare function getDeniedTools(agentName: AgentName): string[];
