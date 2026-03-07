/**
 * Slash command detector for command-model-router hook.
 *
 * Parses user messages to detect slash commands.
 */
import type { ParsedCommand } from "./types";
/**
 * Parse a slash command from text.
 * Returns null if not a valid slash command.
 */
export declare function parseSlashCommand(text: string): ParsedCommand | null;
/**
 * Check if a command is excluded from model routing.
 */
export declare function isExcludedCommand(command: string): boolean;
/**
 * Detect a slash command from message parts.
 *
 * Extracts the first text part that starts with "/" and parses it.
 * Returns null if no valid command found or command is excluded.
 */
export declare function detectSlashCommand(parts: Array<{
    type: string;
    text?: string;
}>): ParsedCommand | null;
/**
 * Extract the prompt text from message parts.
 * Prioritizes parts that start with "/" for slash command detection.
 */
export declare function extractPromptText(parts: Array<{
    type: string;
    text?: string;
}>): string;
