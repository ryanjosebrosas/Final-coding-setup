/**
 * Plugin factory for OhMyOpenCode
 * Creates the main plugin interface with hooks, tools, and handlers
 */
import { loadPluginConfig } from "./config";
import { createContinuationHooks, createSessionHooks, createToolGuardHooks, createTransformHooks, createSkillHooks, } from "../plugin/hooks/create-hooks";
/**
 * All available skills for category dispatch reminders.
 */
const AVAILABLE_SKILLS = [
    // Built-in skills
    { name: "playwright", description: "Browser automation and web scraping", compatibility: "opencode" },
    { name: "frontend-ui-ux", description: "UI/UX design and implementation", compatibility: "opencode" },
    { name: "git-master", description: "Git operations and history management", compatibility: "opencode" },
    { name: "dev-browser", description: "Browser-based development workflow", compatibility: "opencode" },
    // Project skills
    { name: "code-loop", description: "Automated review-fix loop discipline", compatibility: "project" },
    { name: "code-review", description: "Technical code review with severity classification", compatibility: "project" },
    { name: "code-review-fix", description: "Minimal-change fix discipline", compatibility: "project" },
    { name: "commit", description: "Conventional commit quality", compatibility: "project" },
    { name: "council", description: "Multi-perspective reasoning", compatibility: "project" },
    { name: "decompose", description: "Infrastructure pillar identification", compatibility: "project" },
    { name: "execute", description: "Disciplined plan execution", compatibility: "project" },
    { name: "final-review", description: "Pre-commit approval gates", compatibility: "project" },
    { name: "mvp", description: "Big-idea discovery using Socratic questioning", compatibility: "project" },
    { name: "pillars", description: "Infrastructure pillar identification", compatibility: "project" },
    { name: "planning-methodology", description: "Systematic interactive planning", compatibility: "project" },
    { name: "pr", description: "Isolated feature branch creation", compatibility: "project" },
    { name: "prd", description: "Actionable PRDs with tech decisions", compatibility: "project" },
    { name: "prime", description: "Comprehensive context loading", compatibility: "project" },
    { name: "system-review", description: "Meta-analysis of pipeline quality", compatibility: "project" },
];
/**
 * Create a function to check if a hook is enabled.
 */
function createIsHookEnabled(disabledHooks) {
    return (hookName) => {
        return !disabledHooks.has(hookName);
    };
}
/**
 * Helper to extract event handler from a hook object.
 */
function getEventHandler(hook) {
    return hook.event;
}
/**
 * Helper to extract tool.execute.before handler from a hook object.
 */
function getToolBeforeHandler(hook) {
    return hook["tool.execute.before"];
}
/**
 * Helper to extract tool.execute.after handler from a hook object.
 */
function getToolAfterHandler(hook) {
    return hook["tool.execute.after"];
}
/**
 * Helper to extract chat.message handler from a hook object.
 */
function getChatMessageHandler(hook) {
    return hook["chat.message"];
}
/**
 * Create hooks object with all hook handlers.
 */
function createHooksObject(config, ctx, backgroundManager) {
    const disabledHooks = new Set(config.disabled_hooks ?? []);
    const isHookEnabled = createIsHookEnabled(disabledHooks);
    const hooks = {};
    // Create all core hooks
    const continuationHooks = createContinuationHooks({
        ctx,
        pluginConfig: config,
        isHookEnabled,
        backgroundManager,
        sessionRecovery: null,
    });
    const sessionHooks = createSessionHooks({
        ctx,
        pluginConfig: config,
        isHookEnabled,
    });
    const toolHooks = createToolGuardHooks({
        ctx,
        pluginConfig: config,
        isHookEnabled,
    });
    createTransformHooks({
        ctx,
        pluginConfig: config,
        isHookEnabled,
    });
    const skillHooks = createSkillHooks({
        ctx,
        pluginConfig: config,
        isHookEnabled,
        availableSkills: AVAILABLE_SKILLS,
    });
    // Collect all event handlers
    const eventHandlers = [];
    // Add continuation hooks
    if (continuationHooks.todoContinuationEnforcer) {
        eventHandlers.push(continuationHooks.todoContinuationEnforcer.handler);
    }
    if (continuationHooks.compactionTodoPreserver) {
        eventHandlers.push(continuationHooks.compactionTodoPreserver.event);
    }
    if (continuationHooks.backgroundNotificationHook) {
        const handler = getEventHandler(continuationHooks.backgroundNotificationHook);
        if (handler)
            eventHandlers.push(handler);
    }
    if (continuationHooks.atlasHook) {
        eventHandlers.push(continuationHooks.atlasHook.handler);
    }
    // Add session hooks
    if (sessionHooks.agentUsageReminder) {
        const handler = getEventHandler(sessionHooks.agentUsageReminder);
        if (handler)
            eventHandlers.push(handler);
    }
    // Add tool hooks (with event handlers)
    if (toolHooks.rulesInjector) {
        const handler = getEventHandler(toolHooks.rulesInjector);
        if (handler)
            eventHandlers.push(handler);
    }
    if (toolHooks.directoryAgentsInjector) {
        const handler = getEventHandler(toolHooks.directoryAgentsInjector);
        if (handler)
            eventHandlers.push(handler);
    }
    if (toolHooks.directoryReadmeInjector) {
        const handler = getEventHandler(toolHooks.directoryReadmeInjector);
        if (handler)
            eventHandlers.push(handler);
    }
    // Add skill hooks
    if (skillHooks.categorySkillReminder) {
        const handler = getEventHandler(skillHooks.categorySkillReminder);
        if (handler)
            eventHandlers.push(handler);
    }
    // Combine event handlers
    if (eventHandlers.length > 0) {
        hooks.event = async (input) => {
            for (const handler of eventHandlers) {
                try {
                    await handler(input);
                }
                catch (err) {
                    console.error("[Plugin] Event handler error:", err);
                }
            }
        };
    }
    // Collect tool.execute.before handlers
    const beforeHandlers = [];
    if (continuationHooks.atlasHook) {
        const handler = getToolBeforeHandler(continuationHooks.atlasHook);
        if (handler)
            beforeHandlers.push(handler);
    }
    if (toolHooks.rulesInjector) {
        const handler = getToolBeforeHandler(toolHooks.rulesInjector);
        if (handler)
            beforeHandlers.push(handler);
    }
    if (toolHooks.commentChecker) {
        const handler = getToolBeforeHandler(toolHooks.commentChecker);
        if (handler)
            beforeHandlers.push(handler);
    }
    if (toolHooks.directoryAgentsInjector) {
        const handler = getToolBeforeHandler(toolHooks.directoryAgentsInjector);
        if (handler)
            beforeHandlers.push(handler);
    }
    if (toolHooks.directoryReadmeInjector) {
        const handler = getToolBeforeHandler(toolHooks.directoryReadmeInjector);
        if (handler)
            beforeHandlers.push(handler);
    }
    if (beforeHandlers.length > 0) {
        hooks["tool.execute.before"] = async (input, output) => {
            for (const handler of beforeHandlers) {
                try {
                    await handler(input, output);
                }
                catch (err) {
                    console.error("[Plugin] tool.execute.before handler error:", err);
                }
            }
        };
    }
    // Collect tool.execute.after handlers
    const afterHandlers = [];
    if (continuationHooks.atlasHook) {
        const handler = getToolAfterHandler(continuationHooks.atlasHook);
        if (handler)
            afterHandlers.push(handler);
    }
    if (toolHooks.rulesInjector) {
        const handler = getToolAfterHandler(toolHooks.rulesInjector);
        if (handler)
            afterHandlers.push(handler);
    }
    if (toolHooks.commentChecker) {
        const handler = getToolAfterHandler(toolHooks.commentChecker);
        if (handler)
            afterHandlers.push(handler);
    }
    if (toolHooks.directoryAgentsInjector) {
        const handler = getToolAfterHandler(toolHooks.directoryAgentsInjector);
        if (handler)
            afterHandlers.push(handler);
    }
    if (toolHooks.directoryReadmeInjector) {
        const handler = getToolAfterHandler(toolHooks.directoryReadmeInjector);
        if (handler)
            afterHandlers.push(handler);
    }
    if (sessionHooks.agentUsageReminder) {
        const handler = getToolAfterHandler(sessionHooks.agentUsageReminder);
        if (handler)
            afterHandlers.push(handler);
    }
    if (skillHooks.categorySkillReminder) {
        const handler = getToolAfterHandler(skillHooks.categorySkillReminder);
        if (handler)
            afterHandlers.push(handler);
    }
    if (afterHandlers.length > 0) {
        hooks["tool.execute.after"] = async (input, output) => {
            for (const handler of afterHandlers) {
                try {
                    await handler(input, output);
                }
                catch (err) {
                    console.error("[Plugin] tool.execute.after handler error:", err);
                }
            }
        };
    }
    // Collect chat.message handlers
    const chatMessageHandlers = [];
    if (continuationHooks.backgroundNotificationHook) {
        const handler = getChatMessageHandler(continuationHooks.backgroundNotificationHook);
        if (handler)
            chatMessageHandlers.push(handler);
    }
    // Add session hooks with chat.message handlers (command-model-router)
    if (sessionHooks.commandModelRouter) {
        const handler = getChatMessageHandler(sessionHooks.commandModelRouter);
        if (handler)
            chatMessageHandlers.push(handler);
    }
    if (chatMessageHandlers.length > 0) {
        hooks["chat.message"] = async (input, output) => {
            for (const handler of chatMessageHandlers) {
                try {
                    await handler(input, output);
                }
                catch (err) {
                    console.error("[Plugin] chat.message handler error:", err);
                }
            }
        };
    }
    // Wire up experimental.session.compacting for todo preservation
    if (isHookEnabled("compaction-todo-preserver") && continuationHooks.compactionTodoPreserver) {
        hooks["experimental.session.compacting"] = async (input, _output) => {
            // Capture todos before compaction
            await continuationHooks.compactionTodoPreserver.capture(input.sessionID);
        };
    }
    return hooks;
}
/**
 * Main plugin factory
 * Entry point for OpenCode to initialize the plugin
 */
export function createPlugin(defaultConfig) {
    const plugin = async (ctx) => {
        console.log("[Plugin] OhMyOpenCode plugin initializing", {
            directory: ctx.directory,
        });
        // Load configuration from file
        const pluginConfig = loadPluginConfig(ctx.directory, ctx);
        // Merge with default config
        const finalConfig = {
            ...defaultConfig,
            ...pluginConfig,
        };
        // Background manager would be injected here if available
        // For now, we pass undefined as it's optional
        const backgroundManager = undefined;
        // Create hook context
        const hookCtx = {
            client: ctx.client,
            directory: ctx.directory,
        };
        // Create and return hooks
        const hooks = createHooksObject(finalConfig, hookCtx, backgroundManager);
        console.log("[Plugin] Hooks initialized", {
            hasEventHook: !!hooks.event,
            hasToolExecuteBefore: !!hooks["tool.execute.before"],
            hasToolExecuteAfter: !!hooks["tool.execute.after"],
            hasChatMessage: !!hooks["chat.message"],
            hasExperimentalSessionCompacting: !!hooks["experimental.session.compacting"],
        });
        return hooks;
    };
    return plugin;
}
//# sourceMappingURL=plugin.js.map