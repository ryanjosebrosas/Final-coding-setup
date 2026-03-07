/**
 * Types for the command-model-router hook.
 *
 * This hook reads slash command frontmatter to determine model routing.
 */
/**
 * Input for chat.message hook.
 */
export interface ChatMessageInput {
    sessionID: string;
    agent?: {
        name?: string;
    };
    model?: {
        providerID: string;
        modelID: string;
    };
    provider?: {
        id: string;
    };
    messageID?: string;
}
/**
 * Output for chat.message hook.
 * The message object can be modified to override the model.
 */
export interface ChatMessageOutput {
    message: {
        model?: {
            providerID: string;
            modelID: string;
        };
        variant?: string;
        [key: string]: unknown;
    };
    parts: Array<{
        type: string;
        text?: string;
        [key: string]: unknown;
    }>;
}
/**
 * Parsed slash command from user input.
 */
export interface ParsedCommand {
    /** Command name without leading slash (e.g., "prime") */
    command: string;
    /** Arguments after the command */
    args: string;
    /** Original raw text */
    raw: string;
}
/**
 * Command metadata loaded from frontmatter.
 */
export interface CommandMetadata {
    /** Command name */
    name: string;
    /** Description from frontmatter */
    description?: string;
    /** Model specified in frontmatter (e.g., "ollama/glm-4.7:cloud") */
    model?: string;
    /** Agent specified in frontmatter */
    agent?: string;
}
/**
 * Parsed model string with provider/model split.
 */
export interface ParsedModel {
    providerID: string;
    modelID: string;
}
