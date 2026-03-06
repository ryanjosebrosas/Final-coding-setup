/**
 * Category Skill Reminder Hook
 *
 * Reminds orchestrator agents to use category + skill delegation
 * when they start doing work manually that could be delegated.
 */
import type { AvailableSkill } from "../../agents/dynamic-prompt-builder";
interface PluginInput {
    directory: string;
}
/**
 * Session state for tracking reminder status.
 */
interface SessionState {
    delegationUsed: boolean;
    reminderShown: boolean;
    toolCallCount: number;
}
/**
 * Tool execution input.
 */
interface ToolExecuteInput {
    tool: string;
    sessionID: string;
    callID: string;
    agent?: string;
}
/**
 * Tool execution output.
 */
interface ToolExecuteOutput {
    title: string;
    output: string;
    metadata: unknown;
}
/**
 * Event input.
 */
interface EventInput {
    event: {
        type: string;
        properties?: unknown;
    };
}
/**
 * Create the category skill reminder hook.
 */
export declare function createCategorySkillReminderHook(_ctx: PluginInput, availableSkills?: AvailableSkill[]): {
    "tool.execute.after": (input: ToolExecuteInput, output: ToolExecuteOutput) => Promise<void>;
    event: (input: EventInput) => Promise<void>;
};
export type { AvailableSkill, SessionState };
