/**
 * Command Model Router Hook
 *
 * Routes slash commands to their configured model based on frontmatter.
 *
 * Usage:
 *   import { createCommandModelRouterHook } from "./hooks/command-model-router"
 *
 *   const hook = createCommandModelRouterHook()
 *   // Register in OpenCode plugin hooks
 */
export { createCommandModelRouterHook, clearSessionState } from "./hook";
export { detectSlashCommand, extractPromptText, parseSlashCommand, isExcludedCommand } from "./detector";
export { loadCommandMetadata, loadCommandMetadataCached, parseModelString, clearCommandCache } from "./loader";
export type { ChatMessageInput, ChatMessageOutput, ParsedCommand, CommandMetadata, ParsedModel } from "./types";
