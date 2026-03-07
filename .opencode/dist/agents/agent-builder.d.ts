import type { AgentConfig, AgentMode, AgentPermissions } from "./types";
import { type AgentName } from "./registry";
export type AgentFactory = (model: string) => AgentConfig;
export type AgentFactoryWithMode = AgentFactory & {
    mode: AgentMode;
};
export interface ModelRequirement {
    provider: string;
    model: string;
    temperature: number;
}
export interface AgentModelRequirements {
    primary: ModelRequirement;
    fallbacks: ModelRequirement[];
}
/**
 * Build an agent configuration from its metadata.
 *
 * The builder pattern allows for:
 * - Model override
 * - Permission customization
 * - Temperature adjustment
 */
export declare function buildAgent(agentName: AgentName, options?: {
    model?: string;
    provider?: string;
    temperature?: number;
    permissions?: AgentPermissions;
    instructions?: string;
}): AgentConfig | null;
/**
 * Create a factory function for an agent.
 * This follows the OhMyOpenCode pattern: createXXXAgent(model) → AgentConfig
 */
export declare function createAgentFactory(agentName: AgentName): AgentFactoryWithMode;
/**
 * Create all agent factories at once.
 */
export declare function createAllAgentFactories(): Record<AgentName, AgentFactoryWithMode>;
export declare const AGENT_FACTORIES: Record<string, AgentFactoryWithMode>;
export declare const createSisyphusAgent: AgentFactoryWithMode;
export declare const createHephaestusAgent: AgentFactoryWithMode;
export declare const createAtlasAgent: AgentFactoryWithMode;
export declare const createPrometheusAgent: AgentFactoryWithMode;
export declare const createOracleAgent: AgentFactoryWithMode;
export declare const createMetisAgent: AgentFactoryWithMode;
export declare const createMomusAgent: AgentFactoryWithMode;
export declare const createSisyphusJuniorAgent: AgentFactoryWithMode;
export declare const createLibrarianAgent: AgentFactoryWithMode;
export declare const createExploreAgent: AgentFactoryWithMode;
export declare const createMultimodalLookerAgent: AgentFactoryWithMode;
export { type AgentName } from "./registry";
