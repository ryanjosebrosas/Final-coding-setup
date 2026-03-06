/**
 * Hook infrastructure base types and interfaces.
 *
 * Hooks are modular pieces of logic that respond to events in the OpenCode system.
 * They are organized into tiers based on execution priority and purpose.
 */
/**
 * Plugin input for hook initialization.
 * Passed to all hooks during creation.
 */
export interface PluginInput {
    client?: {
        session?: {
            abort?: (args: {
                path: {
                    id: string;
                };
            }) => unknown;
            messages?: (args: {
                path: {
                    id: string;
                };
                query?: {
                    directory: string;
                };
            }) => unknown;
            delete?: (args: {
                path: {
                    id: string;
                };
            }) => unknown;
        };
        tui?: {
            showToast?: (args: {
                body: {
                    title: string;
                    message: string;
                    variant: string;
                    duration: number;
                };
            }) => unknown;
        };
    };
    directory: string;
    [key: string]: unknown;
}
/**
 * Hook name identifiers for all supported hooks.
 */
export type HookName = "todo-continuation-enforcer" | "atlas" | "session-recovery" | "agent-usage-reminder" | "anthropic-effort" | "auto-slash-command" | "keyword-detector" | "non-interactive-env" | "compaction-todo-preserver" | "session-notification" | "context-window-monitor" | "think-mode" | "model-fallback" | "anthropic-context-window-limit-recovery" | "auto-update-checker" | "interactive-bash-session" | "ralph-loop" | "edit-error-recovery" | "delegate-task-retry" | "task-resume-info" | "start-work" | "prometheus-md-only" | "sisyphus-junior-notepad" | "command-model-router" | "rules-injector" | "comment-checker" | "directory-agents-injector" | "directory-readme-injector" | "read-image-resizer" | "tool-output-truncator" | "empty-task-response-detector" | "json-error-recovery" | "write-existing-file-guard" | "claude-code-hooks" | "compaction-context-injector" | "hashline-read-enhancer" | "question-label-truncator" | "hashline-edit-diff-enhancer" | "background-notification" | "stop-continuation-guard" | "unstable-agent-babysitter" | "preemptive-compaction" | "tasks-todowrite-disabler" | "runtime-fallback" | "no-sisyphus-gpt" | "no-hephaestus-non-gpt" | "category-skill-reminder" | "thinking-block-validator";
/**
 * Hook tier identifiers for execution ordering.
 */
export type HookTier = "session" | "tool-guard" | "transform" | "continuation" | "skill";
/**
 * Hook configuration for enabling/disabling specific hooks.
 */
export interface HookConfig {
    enabled: boolean;
    priority?: number;
    options?: Record<string, unknown>;
}
/**
 * Hook execution context passed to all hook handlers.
 */
export interface HookContext {
    hookName: HookName;
    tier: HookTier;
    timestamp: number;
    sessionID?: string;
    properties?: Record<string, unknown>;
}
/**
 * Result of a hook execution.
 */
export interface HookResult {
    handled: boolean;
    modified?: boolean;
    output?: unknown;
    error?: Error;
}
/**
 * Event types that hooks can respond to.
 */
export type HookEventType = "session.idle" | "session.deleted" | "session.compacted" | "session.error" | "tool.execute.before" | "tool.execute.after" | "chat.message" | "chat.headers" | "chat.params" | "event";
/**
 * Hook handler function signature.
 */
export type HookHandler<TInput = unknown, TOutput = unknown> = (input: TInput, output?: TOutput) => Promise<HookResult | void> | HookResult | void;
/**
 * Hook definition with all metadata.
 */
export interface HookDefinition {
    name: HookName;
    tier: HookTier;
    description: string;
    eventTypes: HookEventType[];
    enabled: boolean;
    priority: number;
    handler: HookHandler;
}
/**
 * Hook tier execution order (lower = earlier).
 */
export declare const HOOK_TIER_ORDER: Record<HookTier, number>;
/**
 * Get the execution order for a hook tier.
 */
export declare function getHookTierOrder(tier: HookTier): number;
/**
 * Hook registry for managing active hooks.
 */
export interface HookRegistry {
    register(hook: HookDefinition): void;
    unregister(hookName: HookName | string): void;
    getEnabledHooks(): HookDefinition[];
    getHooksByTier(tier: HookTier): HookDefinition[];
    getHooksForEvent(eventType: HookEventType): HookDefinition[];
}
/**
 * Create a new hook registry.
 */
export declare function createHookRegistry(): HookRegistry;
