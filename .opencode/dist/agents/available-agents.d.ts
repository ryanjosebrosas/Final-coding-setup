export interface AgentSummary {
    name: string;
    category: string;
    oneLiner: string;
    useWhen: string[];
    avoidWhen: string[];
    model: string;
    readOnly: boolean;
    canDelegate: boolean;
}
/**
 * Get summary for a specific agent.
 */
export declare function getAgentSummary(agentName: string): AgentSummary | null;
/**
 * Get all agent summaries.
 */
export declare function getAllAgentSummaries(): AgentSummary[];
/**
 * Get summaries for agents that can modify files.
 */
export declare function getExecutionAgentSummaries(): AgentSummary[];
/**
 * Get summaries for read-only consultation agents.
 */
export declare function getConsultationAgentSummaries(): AgentSummary[];
/**
 * Format summaries for prompt inclusion.
 */
export declare function formatAgentSummariesForPrompt(agents: AgentSummary[]): string;
/**
 * Get one-liner descriptions for all agents.
 */
export declare function getAgentOneLiners(): Record<string, string>;
/**
 * Build delegation context for prompts.
 */
export declare function buildDelegationContext(): string;
