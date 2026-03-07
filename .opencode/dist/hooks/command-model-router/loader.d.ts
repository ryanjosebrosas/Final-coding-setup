/**
 * Command loader for command-model-router hook.
 *
 * Loads command metadata from .opencode/commands/*.md files.
 * Reuses the existing loadCommand from pipeline/commands.ts.
 */
import type { CommandMetadata, ParsedModel } from "./types";
/**
 * Parse a model string in provider/model format.
 *
 * Examples:
 *   "ollama/glm-4.7:cloud" -> { providerID: "ollama", modelID: "glm-4.7:cloud" }
 *   "anthropic/claude-opus-4-6" -> { providerID: "anthropic", modelID: "claude-opus-4-6" }
 *   "claude-sonnet-4-6" -> null (no provider specified)
 */
export declare function parseModelString(modelString: string): ParsedModel | null;
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
export declare function loadCommandMetadata(commandName: string, workspaceDir: string): CommandMetadata | null;
/**
 * Get the model for a command, if specified in frontmatter.
 *
 * Returns null if:
 * - Command not found
 * - No model field in frontmatter
 * - Model string doesn't parse correctly
 */
export declare function getCommandModel(commandName: string, workspaceDir: string): ParsedModel | null;
/**
 * Clear the command cache.
 * Useful for testing or when commands are updated.
 */
export declare function clearCommandCache(): void;
/**
 * Load command metadata with caching.
 *
 * Uses an in-memory cache to avoid repeated disk reads for
 * frequently accessed commands.
 */
export declare function loadCommandMetadataCached(commandName: string, workspaceDir: string): CommandMetadata | null;
