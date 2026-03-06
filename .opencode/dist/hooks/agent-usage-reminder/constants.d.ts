/**
 * Agent Usage Reminder Hook Constants
 */
/**
 * Hook name for logging.
 */
export declare const HOOK_NAME = "agent-usage-reminder";
/**
 * Tools that should trigger a reminder about agent usage.
 */
export declare const TARGET_TOOLS: Set<string>;
/**
 * Tools that indicate the agent is already using agents.
 */
export declare const AGENT_TOOLS: Set<string>;
/**
 * Reminder message shown to agents.
 */
export declare const REMINDER_MESSAGE = "\n\n## <system-reminder>\n**Agent Delegation Reminder**\n\nYou have access to specialized agents for complex tasks. Consider using them:\n\n- **explore** - Free: Contextual grep for codebase patterns\n- **librarian** - Cheap: External docs and OSS implementation search\n- **oracle** - Expensive: Architecture decisions and debugging\n- **metis** - Expensive: Pre-planning analysis\n- **momus** - Expensive: Plan review\n\n**Default Bias: DELEGATE. Work yourself only when it is SUPER SIMPLE.**\n\nExample:\n```typescript\n// Contextual Grep (internal)\ntask(subagent_type=\"explore\", run_in_background=true, prompt=\"Find auth patterns\")\n\n// Reference Grep (external)\ntask(subagent_type=\"librarian\", run_in_background=true, prompt=\"Find Express auth patterns\")\n```\n</system-reminder>\n";
