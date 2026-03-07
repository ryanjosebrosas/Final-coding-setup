/**
 * Slash command detector for command-model-router hook.
 *
 * Parses user messages to detect slash commands.
 */
/**
 * Pattern to match slash commands.
 * Matches: /command-name followed by optional arguments.
 * Examples: /prime, /planning auth-feature, /code-loop
 */
const SLASH_COMMAND_PATTERN = /^\/([a-zA-Z0-9_-]+)(?:\s+(.*))?$/;
/**
 * Commands that should not trigger model routing.
 * These are meta-commands or commands that handle their own routing.
 */
const EXCLUDED_COMMANDS = new Set([
    "help",
    "status",
    "clear",
    "reset",
    "config",
]);
/**
 * Remove code blocks from text to avoid false positives.
 */
function removeCodeBlocks(text) {
    return text.replace(/```[\s\S]*?```/g, "");
}
/**
 * Parse a slash command from text.
 * Returns null if not a valid slash command.
 */
export function parseSlashCommand(text) {
    const trimmed = text.trim();
    if (!trimmed.startsWith("/")) {
        return null;
    }
    const match = trimmed.match(SLASH_COMMAND_PATTERN);
    if (!match) {
        return null;
    }
    const [, command, args = ""] = match;
    return {
        command: command.toLowerCase(),
        args: args.trim(),
        raw: trimmed,
    };
}
/**
 * Check if a command is excluded from model routing.
 */
export function isExcludedCommand(command) {
    return EXCLUDED_COMMANDS.has(command.toLowerCase());
}
/**
 * Detect a slash command from message parts.
 *
 * Extracts the first text part that starts with "/" and parses it.
 * Returns null if no valid command found or command is excluded.
 */
export function detectSlashCommand(parts) {
    // Find first text part that starts with /
    for (const part of parts) {
        if (part.type !== "text" || !part.text)
            continue;
        const textWithoutCodeBlocks = removeCodeBlocks(part.text);
        const trimmed = textWithoutCodeBlocks.trim();
        if (!trimmed.startsWith("/"))
            continue;
        const parsed = parseSlashCommand(trimmed);
        if (!parsed)
            continue;
        if (isExcludedCommand(parsed.command)) {
            return null;
        }
        return parsed;
    }
    return null;
}
/**
 * Extract the prompt text from message parts.
 * Prioritizes parts that start with "/" for slash command detection.
 */
export function extractPromptText(parts) {
    // First, try to find a text part that starts with /
    for (const part of parts) {
        if (part.type === "text" && part.text?.trim().startsWith("/")) {
            return part.text;
        }
    }
    // Fall back to concatenating all text parts
    return parts
        .filter((p) => p.type === "text")
        .map((p) => p.text || "")
        .join(" ");
}
//# sourceMappingURL=detector.js.map