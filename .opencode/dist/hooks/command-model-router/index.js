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
// Main hook factory
export { createCommandModelRouterHook, clearSessionState } from "./hook";
// Utilities for testing
export { detectSlashCommand, extractPromptText, parseSlashCommand, isExcludedCommand } from "./detector";
export { loadCommandMetadata, loadCommandMetadataCached, parseModelString, clearCommandCache } from "./loader";
//# sourceMappingURL=index.js.map