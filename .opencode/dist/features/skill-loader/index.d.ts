/**
 * Represents a loaded skill from a SKILL.md file.
 */
export interface Skill {
    name: string;
    path: string;
    content: string;
    description: string;
    compatibility: string;
}
/**
 * Discover all available skills from skill directories.
 * Scans .opencode/skills/ and .claude/skills/ directories.
 */
export declare function discoverSkills(): Map<string, Skill>;
/**
 * Load a specific skill by name.
 */
export declare function loadSkill(name: string): Skill | null;
/**
 * Load multiple skills by name.
 * Returns array of successfully loaded skills (skips failed ones).
 */
export declare function loadSkills(names: string[]): Skill[];
/**
 * Get skill content for injection into prompts.
 * Formats skills as a prependable block for agent prompts.
 */
export declare function getSkillContentForPrompt(skillNames: string[]): string;
/**
 * Build instructions for combining category + skills.
 * Prepends skill content before category prompt.
 */
export declare function buildCategorySkillPrompt(categoryPrompt: string, skillNames: string[]): string;
/**
 * Clear the skills cache (useful for testing or hot reload).
 */
export declare function clearSkillsCache(): void;
