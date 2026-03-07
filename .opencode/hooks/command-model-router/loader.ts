/**
 * Command loader for command-model-router hook.
 * 
 * Loads command metadata from .opencode/commands/*.md files.
 * Reuses the existing loadCommand from pipeline/commands.ts.
 */

import { loadCommand } from "../../pipeline/commands"
import type { CommandMetadata, ParsedModel } from "./types"

/**
 * Parse a model string in provider/model format.
 * 
 * Examples:
 *   "ollama/glm-4.7:cloud" -> { providerID: "ollama", modelID: "glm-4.7:cloud" }
 *   "anthropic/claude-opus-4-6" -> { providerID: "anthropic", modelID: "claude-opus-4-6" }
 *   "claude-sonnet-4-6" -> null (no provider specified)
 */
export function parseModelString(modelString: string): ParsedModel | null {
  const trimmed = modelString.trim()
  if (!trimmed) return null
  
  const slashIndex = trimmed.indexOf("/")
  if (slashIndex <= 0) return null
  
  const providerID = trimmed.slice(0, slashIndex)
  const modelID = trimmed.slice(slashIndex + 1)
  
  if (!providerID || !modelID) return null
  
  return { providerID, modelID }
}

/**
 * Load command metadata from disk.
 * 
 * Uses the existing loadCommand from pipeline/commands.ts to read
 * the command's frontmatter and extract the model field.
 * 
 * Returns null if:
 * - Command not found
 * - Command has no model field
 * - Model field doesn't parse correctly
 */
export function loadCommandMetadata(
  commandName: string,
  workspaceDir: string
): CommandMetadata | null {
  // Use existing loader from pipeline/commands.ts
  const commandInfo = loadCommand(commandName, workspaceDir)
  
  if (!commandInfo) {
    return null
  }
  
  return {
    name: commandInfo.name,
    description: commandInfo.description || undefined,
    model: commandInfo.model || undefined,
  }
}

/**
 * Get the model for a command, if specified in frontmatter.
 * 
 * Returns null if:
 * - Command not found
 * - No model field in frontmatter
 * - Model string doesn't parse correctly
 */
export function getCommandModel(
  commandName: string,
  workspaceDir: string
): ParsedModel | null {
  const metadata = loadCommandMetadata(commandName, workspaceDir)
  
  if (!metadata?.model) {
    return null
  }
  
  return parseModelString(metadata.model)
}

/**
 * Command cache to avoid repeated disk reads.
 * Maps commandName -> metadata | null.
 */
const commandCache = new Map<string, CommandMetadata | null>()

/**
 * Clear the command cache.
 * Useful for testing or when commands are updated.
 */
export function clearCommandCache(): void {
  commandCache.clear()
}

/**
 * Load command metadata with caching.
 * 
 * Uses an in-memory cache to avoid repeated disk reads for
 * frequently accessed commands.
 */
export function loadCommandMetadataCached(
  commandName: string,
  workspaceDir: string
): CommandMetadata | null {
  const cacheKey = `${workspaceDir}:${commandName}`
  
  if (commandCache.has(cacheKey)) {
    return commandCache.get(cacheKey) ?? null
  }
  
  const metadata = loadCommandMetadata(commandName, workspaceDir)
  commandCache.set(cacheKey, metadata)
  
  return metadata
}