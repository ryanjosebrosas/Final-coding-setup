/**
 * OpenCode Hooks - Main Export
 *
 * Exports all hook implementations organized by tier.
 * Hooks are grouped into 5 tiers based on execution priority:
 *
 * 1. Continuation - Run first to enforce completion guarantees
 * 2. Session - Session lifecycle management
 * 3. Tool-Guard - Pre/post tool execution
 * 4. Transform - Message transformation
 * 5. Skill - Skill-specific hooks
 */
export type { HookName, HookTier, HookConfig, HookContext, HookResult, HookEventType, HookHandler, HookDefinition, HookRegistry, PluginInput } from "./base";
export { HOOK_TIER_ORDER, getHookTierOrder, createHookRegistry } from "./base";
export { createTodoContinuationEnforcer } from "./todo-continuation";
export type { TodoContinuationEnforcer, TodoContinuationEnforcerOptions, SessionStateStore, Todo } from "./todo-continuation/types";
export { createAtlasHook, readBoulderState, writeBoulderState, getPlanProgress, getNextPendingTask, createBoulderState } from "./atlas";
export type { AtlasHookOptions, SessionState as AtlasSessionState, BoulderState, PlanProgress, TaskInfo, PluginInput as AtlasPluginInput } from "./atlas/types";
export { createSessionRecoveryHook } from "./session-recovery";
export type { SessionRecoveryHook, SessionRecoveryOptions, RecoveryErrorType } from "./session-recovery/types";
export { createCompactionTodoPreserverHook } from "./compaction-todo-preserver";
export type { CompactionTodoPreserver } from "./compaction-todo-preserver";
export { createBackgroundNotificationHook } from "./background-notification";
export { createAgentUsageReminderHook } from "./agent-usage-reminder";
export type { AgentUsageState } from "./agent-usage-reminder/types";
export { createCommandModelRouterHook } from "./command-model-router";
export { createRulesInjectorHook } from "./rules-injector";
export { createCommentCheckerHooks } from "./comment-checker";
export { createDirectoryAgentsInjectorHook } from "./directory-agents-injector";
export { createDirectoryReadmeInjectorHook } from "./directory-readme-injector";
export { createCategorySkillReminderHook } from "./category-skill-reminder";
