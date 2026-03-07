import { type Skill } from "./index";
/**
 * Skill availability check result.
 */
export interface SkillAvailability {
    name: string;
    available: boolean;
    path?: string;
    description?: string;
}
/**
 * Get list of all available skill names.
 */
export declare function getAvailableSkillNames(): string[];
/**
 * Get detailed list of all available skills.
 */
export declare function getAvailableSkills(): Skill[];
/**
 * Check if specific skills are available.
 * Returns map of skill name to availability status.
 */
export declare function checkSkillAvailability(skillNames: string[]): SkillAvailability[];
/**
 * Get skills by compatibility level.
 * Groups skills by their compatibility tag.
 */
export declare function getSkillsByCompatibility(): Record<string, Skill[]>;
/**
 * Search skills by keyword in description or name.
 */
export declare function searchSkills(keyword: string): Skill[];
/**
 * Print a summary of available skills for logging/debugging.
 */
export declare function printSkillsSummary(): string;
