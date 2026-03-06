/**
 * Hook Composition - Create all hooks in correct tier order
 *
 * This module creates and wires all hooks together following the tier order:
 * 1. Continuation hooks (todo enforcement, atlas, recovery)
 * 2. Session hooks (lifecycle, errors)
 * 3. Tool-guard hooks (pre/post tool execution)
 * 4. Transform hooks (message transformation)
 * 5. Skill hooks (skill-specific)
 */
import type { HookName } from "../../hooks/base";
import { createTodoContinuationEnforcer, createAtlasHook, createCompactionTodoPreserverHook, createBackgroundNotificationHook } from "../../hooks/index";
import type { AvailableSkill } from "../../agents/dynamic-prompt-builder";
/**
 * Configuration for enabling/disabling hooks.
 */
export interface OhMyOpenCodeConfig {
    hooks?: Record<HookName, boolean>;
    agents?: Record<string, unknown>;
    start_work?: {
        auto_commit?: boolean;
    };
    [key: string]: unknown;
}
/**
 * Hook context passed to all hooks.
 */
export interface HookContext {
    client: unknown;
    directory: string;
}
/**
 * Background manager interface.
 */
export interface BackgroundManager {
    handleEvent(event: {
        type: string;
        properties?: unknown;
    }): void;
    injectPendingNotificationsIntoChatMessage(output: unknown, sessionID: string): void;
    getTasksByParentSession(sessionID: string): Array<{
        status: string;
    }>;
}
/**
 * Continuation hooks output.
 */
export interface ContinuationHooks {
    stopContinuationGuard: unknown | null;
    compactionContextInjector: unknown | null;
    compactionTodoPreserver: ReturnType<typeof createCompactionTodoPreserverHook> | null;
    todoContinuationEnforcer: ReturnType<typeof createTodoContinuationEnforcer> | null;
    unstableAgentBabysitter: unknown | null;
    backgroundNotificationHook: ReturnType<typeof createBackgroundNotificationHook> | null;
    atlasHook: ReturnType<typeof createAtlasHook> | null;
}
/**
 * Create continuation hooks (tier 1).
 */
export declare function createContinuationHooks(args: {
    ctx: HookContext;
    pluginConfig: OhMyOpenCodeConfig;
    isHookEnabled: (hookName: HookName) => boolean;
    backgroundManager?: BackgroundManager;
    sessionRecovery?: {
        setOnAbortCallback: (callback: (sessionID: string) => void) => void;
        setOnRecoveryCompleteCallback: (callback: (sessionID: string) => void) => void;
    } | null;
}): ContinuationHooks;
/**
 * Create session hooks (tier 2).
 */
export declare function createSessionHooks(args: {
    ctx: HookContext;
    pluginConfig: OhMyOpenCodeConfig;
    isHookEnabled: (hookName: HookName) => boolean;
}): Record<string, unknown>;
/**
 * Create tool-guard hooks (tier 3).
 */
export declare function createToolGuardHooks(args: {
    ctx: HookContext;
    pluginConfig: OhMyOpenCodeConfig;
    isHookEnabled: (hookName: HookName) => boolean;
}): Record<string, unknown>;
/**
 * Create transform hooks (tier 4).
 */
export declare function createTransformHooks(args: {
    ctx: HookContext;
    pluginConfig: OhMyOpenCodeConfig;
    isHookEnabled: (hookName: HookName) => boolean;
}): Record<string, unknown>;
/**
 * Create skill hooks (tier 5).
 */
export declare function createSkillHooks(args: {
    ctx: HookContext;
    pluginConfig: OhMyOpenCodeConfig;
    isHookEnabled: (hookName: HookName) => boolean;
    availableSkills: AvailableSkill[];
}): Record<string, unknown>;
/**
 * Create all core hooks.
 */
export declare function createCoreHooks(args: {
    ctx: HookContext;
    pluginConfig: OhMyOpenCodeConfig;
    isHookEnabled: (hookName: HookName) => boolean;
    backgroundManager?: BackgroundManager;
    availableSkills: AvailableSkill[];
}): {
    continuation: ContinuationHooks;
    session: Record<string, unknown>;
    tool: Record<string, unknown>;
    transform: Record<string, unknown>;
    skill: Record<string, unknown>;
};
