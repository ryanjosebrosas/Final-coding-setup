/**
 * Plugin factory for OhMyOpenCode
 * Creates the main plugin interface with hooks, tools, and handlers
 */

import type { Plugin, Hooks } from "@opencode-ai/plugin"
import type { OhMyOpenCodeConfig } from "./types"
import { loadPluginConfig } from "./config"
import {
  createContinuationHooks,
  createSessionHooks,
  createToolGuardHooks,
  createTransformHooks,
  createSkillHooks,
  type BackgroundManager,
  type HookContext,
} from "../plugin/hooks/create-hooks"
import type { AvailableSkill } from "../agents/dynamic-prompt-builder"
import type { HookName } from "../hooks/base"

/**
 * Event type from OpenCode.
 * Since Event isn't directly exported, we define a compatible type here.
 */
type EventType = {
  type: string
  properties?: Record<string, unknown>
}

/** Event input for hooks */
type EventInput = { event: EventType }

/** Tool execute before input */
type ToolBeforeInput = { tool: string; sessionID: string; callID: string }
/** Tool execute before output */
type ToolBeforeOutput = { args: unknown }

/** Tool execute after input */
type ToolAfterInput = { tool: string; sessionID: string; callID: string }
/** Tool execute after output */
type ToolAfterOutput = { title: string; output: string; metadata: unknown }

/** Chat message input */
type ChatMessageInput = { sessionID: string }
/** Chat message output */
type ChatMessageOutput = { message: unknown; parts: unknown[] }

/**
 * All available skills for category dispatch reminders.
 */
const AVAILABLE_SKILLS: AvailableSkill[] = [
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
]

/**
 * Create a function to check if a hook is enabled.
 */
function createIsHookEnabled(disabledHooks: Set<string>): (hookName: HookName) => boolean {
  return (hookName: HookName): boolean => {
    return !disabledHooks.has(hookName)
  }
}

/**
 * Event handler type for combining multiple handlers.
 */
type EventHandler = (input: EventInput) => Promise<void>

/**
 * Tool execute before handler type.
 */
type ToolBeforeHandler = (input: ToolBeforeInput, output: ToolBeforeOutput) => Promise<void>

/**
 * Tool execute after handler type.
 */
type ToolAfterHandler = (input: ToolAfterInput, output: ToolAfterOutput) => Promise<void>

/**
 * Chat message handler type.
 */
type ChatMessageHandler = (input: ChatMessageInput, output: ChatMessageOutput) => Promise<void>

/**
 * Helper to extract event handler from a hook object.
 */
function getEventHandler(hook: Record<string, unknown>): EventHandler | undefined {
  return hook.event as EventHandler | undefined
}

/**
 * Helper to extract tool.execute.before handler from a hook object.
 */
function getToolBeforeHandler(hook: Record<string, unknown>): ToolBeforeHandler | undefined {
  return hook["tool.execute.before"] as ToolBeforeHandler | undefined
}

/**
 * Helper to extract tool.execute.after handler from a hook object.
 */
function getToolAfterHandler(hook: Record<string, unknown>): ToolAfterHandler | undefined {
  return hook["tool.execute.after"] as ToolAfterHandler | undefined
}

/**
 * Helper to extract chat.message handler from a hook object.
 */
function getChatMessageHandler(hook: Record<string, unknown>): ChatMessageHandler | undefined {
  return hook["chat.message"] as ChatMessageHandler | undefined
}

/**
 * Create hooks object with all hook handlers.
 */
function createHooksObject(
  config: OhMyOpenCodeConfig,
  ctx: HookContext,
  backgroundManager?: BackgroundManager
): Hooks {
  const disabledHooks = new Set(config.disabled_hooks ?? [])
  const isHookEnabled = createIsHookEnabled(disabledHooks)
  const hooks: Hooks = {}

  // Create all core hooks
  const continuationHooks = createContinuationHooks({
    ctx,
    pluginConfig: config,
    isHookEnabled,
    backgroundManager,
    sessionRecovery: null,
  })

  const sessionHooks = createSessionHooks({
    ctx,
    pluginConfig: config,
    isHookEnabled,
  })

  const toolHooks = createToolGuardHooks({
    ctx,
    pluginConfig: config,
    isHookEnabled,
  })

  createTransformHooks({
    ctx,
    pluginConfig: config,
    isHookEnabled,
  })

  const skillHooks = createSkillHooks({
    ctx,
    pluginConfig: config,
    isHookEnabled,
    availableSkills: AVAILABLE_SKILLS,
  })

  // Collect all event handlers
  const eventHandlers: EventHandler[] = []

  // Add continuation hooks
  if (continuationHooks.todoContinuationEnforcer) {
    eventHandlers.push(continuationHooks.todoContinuationEnforcer.handler as EventHandler)
  }
  if (continuationHooks.compactionTodoPreserver) {
    eventHandlers.push(continuationHooks.compactionTodoPreserver.event as EventHandler)
  }
  if (continuationHooks.backgroundNotificationHook) {
    const handler = getEventHandler(continuationHooks.backgroundNotificationHook as unknown as Record<string, unknown>)
    if (handler) eventHandlers.push(handler)
  }
  if (continuationHooks.atlasHook) {
    eventHandlers.push(continuationHooks.atlasHook.handler as EventHandler)
  }

  // Add session hooks
  if (sessionHooks.agentUsageReminder) {
    const handler = getEventHandler(sessionHooks.agentUsageReminder as unknown as Record<string, unknown>)
    if (handler) eventHandlers.push(handler)
  }

  // Add tool hooks (with event handlers)
  if (toolHooks.rulesInjector) {
    const handler = getEventHandler(toolHooks.rulesInjector as unknown as Record<string, unknown>)
    if (handler) eventHandlers.push(handler)
  }
  if (toolHooks.directoryAgentsInjector) {
    const handler = getEventHandler(toolHooks.directoryAgentsInjector as unknown as Record<string, unknown>)
    if (handler) eventHandlers.push(handler)
  }
  if (toolHooks.directoryReadmeInjector) {
    const handler = getEventHandler(toolHooks.directoryReadmeInjector as unknown as Record<string, unknown>)
    if (handler) eventHandlers.push(handler)
  }

  // Add skill hooks
  if (skillHooks.categorySkillReminder) {
    const handler = getEventHandler(skillHooks.categorySkillReminder as unknown as Record<string, unknown>)
    if (handler) eventHandlers.push(handler)
  }

  // Combine event handlers
  if (eventHandlers.length > 0) {
    hooks.event = async (input: { event: EventType }) => {
      for (const handler of eventHandlers) {
        try {
          await handler(input as EventInput)
        } catch (err) {
          console.error("[Plugin] Event handler error:", err)
        }
      }
    }
  }

  // Collect tool.execute.before handlers
  const beforeHandlers: ToolBeforeHandler[] = []

  if (continuationHooks.atlasHook) {
    const handler = getToolBeforeHandler(continuationHooks.atlasHook as unknown as Record<string, unknown>)
    if (handler) beforeHandlers.push(handler)
  }
  if (toolHooks.rulesInjector) {
    const handler = getToolBeforeHandler(toolHooks.rulesInjector as unknown as Record<string, unknown>)
    if (handler) beforeHandlers.push(handler)
  }
  if (toolHooks.commentChecker) {
    const handler = getToolBeforeHandler(toolHooks.commentChecker as unknown as Record<string, unknown>)
    if (handler) beforeHandlers.push(handler)
  }
  if (toolHooks.directoryAgentsInjector) {
    const handler = getToolBeforeHandler(toolHooks.directoryAgentsInjector as unknown as Record<string, unknown>)
    if (handler) beforeHandlers.push(handler)
  }
  if (toolHooks.directoryReadmeInjector) {
    const handler = getToolBeforeHandler(toolHooks.directoryReadmeInjector as unknown as Record<string, unknown>)
    if (handler) beforeHandlers.push(handler)
  }

  if (beforeHandlers.length > 0) {
    hooks["tool.execute.before"] = async (input, output) => {
      for (const handler of beforeHandlers) {
        try {
          await handler(input, output)
        } catch (err) {
          console.error("[Plugin] tool.execute.before handler error:", err)
        }
      }
    }
  }

  // Collect tool.execute.after handlers
  const afterHandlers: ToolAfterHandler[] = []

  if (continuationHooks.atlasHook) {
    const handler = getToolAfterHandler(continuationHooks.atlasHook as unknown as Record<string, unknown>)
    if (handler) afterHandlers.push(handler)
  }
  if (toolHooks.rulesInjector) {
    const handler = getToolAfterHandler(toolHooks.rulesInjector as unknown as Record<string, unknown>)
    if (handler) afterHandlers.push(handler)
  }
  if (toolHooks.commentChecker) {
    const handler = getToolAfterHandler(toolHooks.commentChecker as unknown as Record<string, unknown>)
    if (handler) afterHandlers.push(handler)
  }
  if (toolHooks.directoryAgentsInjector) {
    const handler = getToolAfterHandler(toolHooks.directoryAgentsInjector as unknown as Record<string, unknown>)
    if (handler) afterHandlers.push(handler)
  }
  if (toolHooks.directoryReadmeInjector) {
    const handler = getToolAfterHandler(toolHooks.directoryReadmeInjector as unknown as Record<string, unknown>)
    if (handler) afterHandlers.push(handler)
  }
  if (sessionHooks.agentUsageReminder) {
    const handler = getToolAfterHandler(sessionHooks.agentUsageReminder as unknown as Record<string, unknown>)
    if (handler) afterHandlers.push(handler)
  }
  if (skillHooks.categorySkillReminder) {
    const handler = getToolAfterHandler(skillHooks.categorySkillReminder as unknown as Record<string, unknown>)
    if (handler) afterHandlers.push(handler)
  }

  if (afterHandlers.length > 0) {
    hooks["tool.execute.after"] = async (input, output) => {
      for (const handler of afterHandlers) {
        try {
          await handler(input, output)
        } catch (err) {
          console.error("[Plugin] tool.execute.after handler error:", err)
        }
      }
    }
  }

  // Collect chat.message handlers
  const chatMessageHandlers: ChatMessageHandler[] = []

  if (continuationHooks.backgroundNotificationHook) {
    const handler = getChatMessageHandler(continuationHooks.backgroundNotificationHook as unknown as Record<string, unknown>)
    if (handler) chatMessageHandlers.push(handler)
  }

  // Add session hooks with chat.message handlers (command-model-router)
  if (sessionHooks.commandModelRouter) {
    const handler = getChatMessageHandler(sessionHooks.commandModelRouter as unknown as Record<string, unknown>)
    if (handler) chatMessageHandlers.push(handler)
  }

  if (chatMessageHandlers.length > 0) {
    hooks["chat.message"] = async (input, output) => {
      for (const handler of chatMessageHandlers) {
        try {
          await handler(input, output)
        } catch (err) {
          console.error("[Plugin] chat.message handler error:", err)
        }
      }
    }
  }

  // Wire up experimental.session.compacting for todo preservation
  if (isHookEnabled("compaction-todo-preserver" as HookName) && continuationHooks.compactionTodoPreserver) {
    hooks["experimental.session.compacting"] = async (input, _output) => {
      // Capture todos before compaction
      await continuationHooks.compactionTodoPreserver!.capture(input.sessionID)
    }
  }

  return hooks
}

/**
 * Main plugin factory
 * Entry point for OpenCode to initialize the plugin
 */
export function createPlugin(defaultConfig: OhMyOpenCodeConfig): Plugin {
  const plugin: Plugin = async (ctx) => {
    console.log("[Plugin] OhMyOpenCode plugin initializing", {
      directory: ctx.directory,
    })

    // Load configuration from file
    const pluginConfig = loadPluginConfig(ctx.directory, ctx)

    // Merge with default config
    const finalConfig: OhMyOpenCodeConfig = {
      ...defaultConfig,
      ...pluginConfig,
    }

    // Background manager would be injected here if available
    // For now, we pass undefined as it's optional
    const backgroundManager: BackgroundManager | undefined = undefined

    // Create hook context
    const hookCtx: HookContext = {
      client: ctx.client,
      directory: ctx.directory,
    }

    // Create and return hooks
    const hooks = createHooksObject(finalConfig, hookCtx, backgroundManager)

    console.log("[Plugin] Hooks initialized", {
      hasEventHook: !!hooks.event,
      hasToolExecuteBefore: !!hooks["tool.execute.before"],
      hasToolExecuteAfter: !!hooks["tool.execute.after"],
      hasChatMessage: !!hooks["chat.message"],
      hasExperimentalSessionCompacting: !!hooks["experimental.session.compacting"],
    })

    return hooks
  }

  return plugin
}