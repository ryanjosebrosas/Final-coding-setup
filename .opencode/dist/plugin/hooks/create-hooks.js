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
import { createTodoContinuationEnforcer, createAtlasHook, createSessionRecoveryHook, createCompactionTodoPreserverHook, createBackgroundNotificationHook, createAgentUsageReminderHook, createRulesInjectorHook, createCommentCheckerHooks, createDirectoryAgentsInjectorHook, createDirectoryReadmeInjectorHook, createCategorySkillReminderHook, createCommandModelRouterHook, } from "../../hooks/index";
import { log } from "../../shared/logger";
/**
 * Safe hook creation wrapper - catches errors during hook creation.
 */
function safeHook(hookName, factory, _options) {
    try {
        return factory();
    }
    catch (error) {
        log(`[create-hooks] Failed to create hook ${hookName}`, { error: String(error) });
        return null;
    }
}
/**
 * Create continuation hooks (tier 1).
 */
export function createContinuationHooks(args) {
    const { ctx, pluginConfig, isHookEnabled, backgroundManager, sessionRecovery } = args;
    // Create todo continuation enforcer
    const todoContinuationEnforcer = isHookEnabled("todo-continuation-enforcer")
        ? safeHook("todo-continuation-enforcer", () => createTodoContinuationEnforcer(ctx, {
            backgroundManager,
        }))
        : null;
    // Create compaction todo preserver
    const compactionTodoPreserver = isHookEnabled("compaction-todo-preserver")
        ? safeHook("compaction-todo-preserver", () => createCompactionTodoPreserverHook(ctx))
        : null;
    // Create background notification hook
    const backgroundNotificationHook = isHookEnabled("background-notification")
        ? safeHook("background-notification", () => createBackgroundNotificationHook(backgroundManager ?? null))
        : null;
    // Create atlas hook (boulder pusher)
    const atlasHook = isHookEnabled("atlas")
        ? safeHook("atlas", () => createAtlasHook(ctx, {
            directory: ctx.directory,
            backgroundManager,
            autoCommit: pluginConfig.start_work?.auto_commit,
        }))
        : null;
    // Wire up session recovery callbacks
    if (sessionRecovery) {
        const onAbortCallbacks = [];
        const onRecoveryCompleteCallbacks = [];
        if (todoContinuationEnforcer) {
            onAbortCallbacks.push(todoContinuationEnforcer.markRecovering);
            onRecoveryCompleteCallbacks.push(todoContinuationEnforcer.markRecoveryComplete);
        }
        if (onAbortCallbacks.length > 0) {
            sessionRecovery.setOnAbortCallback((sessionID) => {
                for (const callback of onAbortCallbacks)
                    callback(sessionID);
            });
        }
        if (onRecoveryCompleteCallbacks.length > 0) {
            sessionRecovery.setOnRecoveryCompleteCallback((sessionID) => {
                for (const callback of onRecoveryCompleteCallbacks)
                    callback(sessionID);
            });
        }
    }
    return {
        stopContinuationGuard: null,
        compactionContextInjector: null,
        compactionTodoPreserver,
        todoContinuationEnforcer,
        unstableAgentBabysitter: null,
        backgroundNotificationHook,
        atlasHook,
    };
}
/**
 * Create session hooks (tier 2).
 */
export function createSessionHooks(args) {
    const { ctx, isHookEnabled } = args;
    const sessionRecovery = isHookEnabled("session-recovery")
        ? safeHook("session-recovery", () => createSessionRecoveryHook(ctx))
        : null;
    const agentUsageReminder = isHookEnabled("agent-usage-reminder")
        ? safeHook("agent-usage-reminder", () => createAgentUsageReminderHook(ctx))
        : null;
    const commandModelRouter = isHookEnabled("command-model-router")
        ? safeHook("command-model-router", () => createCommandModelRouterHook(ctx.directory))
        : null;
    return {
        sessionRecovery,
        agentUsageReminder,
        commandModelRouter,
    };
}
/**
 * Create tool-guard hooks (tier 3).
 */
export function createToolGuardHooks(args) {
    const { ctx, isHookEnabled } = args;
    const rulesInjector = isHookEnabled("rules-injector")
        ? safeHook("rules-injector", () => createRulesInjectorHook(ctx))
        : null;
    const commentChecker = isHookEnabled("comment-checker")
        ? safeHook("comment-checker", () => createCommentCheckerHooks())
        : null;
    const directoryAgentsInjector = isHookEnabled("directory-agents-injector")
        ? safeHook("directory-agents-injector", () => createDirectoryAgentsInjectorHook(ctx))
        : null;
    const directoryReadmeInjector = isHookEnabled("directory-readme-injector")
        ? safeHook("directory-readme-injector", () => createDirectoryReadmeInjectorHook(ctx))
        : null;
    return {
        rulesInjector,
        commentChecker,
        directoryAgentsInjector,
        directoryReadmeInjector,
    };
}
/**
 * Create transform hooks (tier 4).
 */
export function createTransformHooks(args) {
    // Placeholder for transform hooks
    return {};
}
/**
 * Create skill hooks (tier 5).
 */
export function createSkillHooks(args) {
    const { ctx, isHookEnabled, availableSkills } = args;
    const categorySkillReminder = isHookEnabled("category-skill-reminder")
        ? safeHook("category-skill-reminder", () => createCategorySkillReminderHook(ctx, availableSkills))
        : null;
    return {
        categorySkillReminder,
    };
}
/**
 * Create all core hooks.
 */
export function createCoreHooks(args) {
    const { ctx, pluginConfig, isHookEnabled, backgroundManager, availableSkills } = args;
    // Create session recovery first (needed for continuation hooks)
    const sessionRecovery = isHookEnabled("session-recovery")
        ? safeHook("session-recovery", () => createSessionRecoveryHook(ctx))
        : null;
    const continuation = createContinuationHooks({
        ctx,
        pluginConfig,
        isHookEnabled,
        backgroundManager,
        sessionRecovery,
    });
    const session = createSessionHooks({ ctx, pluginConfig, isHookEnabled });
    // Add session recovery to session hooks
    if (sessionRecovery) {
        session["sessionRecovery"] = sessionRecovery;
    }
    const tool = createToolGuardHooks({ ctx, pluginConfig, isHookEnabled });
    const transform = createTransformHooks({ ctx, pluginConfig, isHookEnabled });
    const skill = createSkillHooks({ ctx, pluginConfig, isHookEnabled, availableSkills });
    return {
        continuation,
        session,
        tool,
        transform,
        skill,
    };
}
//# sourceMappingURL=create-hooks.js.map