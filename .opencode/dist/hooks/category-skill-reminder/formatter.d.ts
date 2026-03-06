/**
 * Build the reminder message for category + skill delegation.
 */
import type { AvailableSkill } from "../../agents/dynamic-prompt-builder";
/**
 * Build the reminder message shown to orchestrator agents.
 */
export declare function buildReminderMessage(availableSkills: AvailableSkill[]): string;
