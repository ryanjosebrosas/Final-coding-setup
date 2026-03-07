import { type AgentName } from "./registry";
export interface AgentPromptContext {
    agentName: AgentName;
    category?: string;
    loadSkills: string[];
    taskDescription: string;
}
export interface BuiltPrompt {
    systemPrompt: string;
    categoryPrompt: string;
    skillsPrompt: string;
    fullPrompt: string;
}
/**
 * Available skill information for category dispatch reminders.
 */
export interface AvailableSkill {
    name: string;
    description: string;
    compatibility: string;
}
/**
 * Generate a summary of available agents for inclusion in prompts.
 * Used by Sisyphus to know what specialists are available for delegation.
 */
export declare function buildAvailableAgentsSummary(): string;
/**
 * Build a delegation guide showing category options and skill loading.
 */
export declare function buildCategorySkillsDelegationGuide(category?: string, skills?: string[]): string;
/**
 * Build the complete prompt for an agent dispatch.
 *
 * Order:
 * 1. Skills (prepended) - domain-specific instructions
 * 2. Category prompt - semantic context
 * 3. Task description - user's request
 */
export declare function buildAgentPrompt(context: AgentPromptContext): BuiltPrompt;
/**
 * Get the prompt template for a specific agent.
 */
export declare function getAgentPromptTemplate(agentName: AgentName): string;
