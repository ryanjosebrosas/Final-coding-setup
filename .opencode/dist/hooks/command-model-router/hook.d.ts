/**
 * Command Model Router Hook
 *
 * Intercepts slash commands and routes to the model specified in command frontmatter.
 *
 * When a user runs `/prime`, this hook:
 * 1. Detects the slash command in the message
 * 2. Loads the command's frontmatter from .opencode/commands/prime.md
 * 3. Parses the `model:` field (e.g., "ollama/glm-4.7:cloud")
 * 4. Overrides the session model to use that model
 *
 * This ensures commands run on their intended model tier:
 * - /prime -> Haiku (cheap retrieval)
 * - /planning -> Opus (expensive planning)
 * - /code-review -> Sonnet (balanced review)
 */
import { clearCommandCache } from "./loader";
import type { ChatMessageInput, ChatMessageOutput } from "./types";
/**
 * Clear processed commands for a session.
 */
export declare function clearSessionState(sessionID: string): void;
/**
 * Create the command model router hook.
 */
export declare function createCommandModelRouterHook(workspaceDir?: string): {
    "chat.message": (input: ChatMessageInput, output: ChatMessageOutput) => Promise<void>;
    event: ({ event }: {
        event: {
            type: string;
            properties?: unknown;
        };
    }) => Promise<void>;
};
export { clearCommandCache };
