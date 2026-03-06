import type { AgentMetadata } from "./registry";
/**
 * Context for building agent prompts.
 */
export interface AgentPromptContext {
    /** Agent name */
    agentName: string;
    /** Task description provided by user */
    taskDescription: string;
    /** Category if dispatched via category system */
    category?: string;
    /** Skills to load (names) */
    loadSkills: string[];
    /** Additional context from session */
    sessionContext?: string;
    /** Skills content (loaded externally) */
    skillsContent?: Map<string, string>;
}
/**
 * Built prompt result.
 */
export interface BuiltPrompt {
    /** System prompt for the agent */
    systemPrompt: string;
    /** Skills prompt (prepended) */
    skillsPrompt: string;
    /** Category prompt (prepended) */
    categoryPrompt: string;
    /** Full prompt (skills + category + task) */
    fullPrompt: string;
}
/**
 * Prompt section for structured prompting.
 */
export interface PromptSection {
    title: string;
    content: string;
}
/**
 * Build the system prompt for an agent from metadata.
 */
export declare function buildSystemPrompt(agentName: string, metadata: AgentMetadata, roleContext?: string): string;
/**
 * Build permission context section.
 */
export declare function buildPermissionContext(metadata: AgentMetadata): string;
/**
 * Build skills injection prompt.
 */
export declare function buildSkillsPrompt(skills: string[], skillsContent?: Map<string, string>): string;
/**
 * Build sections prompt from prompt sections.
 */
export declare function buildSectionsPrompt(sections: PromptSection[]): string;
/**
 * Build a complete prompt from context and agent metadata.
 */
export declare function buildCompletePrompt(context: AgentPromptContext, metadata: AgentMetadata, customPrompt: string): BuiltPrompt;
/**
 * Build approach steps as formatted list.
 */
export declare function buildApproachSteps(steps: string[]): string;
/**
 * Build decision tree as mermaid-like text.
 */
export declare function buildDecisionTree(branches: Record<string, string>): string;
/**
 * Build rules list.
 */
export declare function buildRules(rules: string[]): string;
/**
 * Build tool list.
 */
export declare function buildToolList(tools: {
    allowed: string[];
    denied: string[];
}): string;
/**
 * Build example invocation.
 */
export declare function buildInvocationExample(categoryOrAgent: string, prompt: string, loadSkills?: string[]): string;
/**
 * Escape special characters for markdown code blocks.
 */
export declare function escapeMarkdown(text: string): string;
