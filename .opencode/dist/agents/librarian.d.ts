import { type AgentMetadata } from "./registry";
import { type AgentPromptContext, type BuiltPrompt } from "./prompt-builder";
export declare const LIBRARIAN_METADATA: AgentMetadata;
/**
 * Build the complete prompt for Librarian agent.
 */
export declare function createLibrarianPrompt(context: AgentPromptContext): BuiltPrompt;
/**
 * Factory function compatible with OhMyOpenCode pattern.
 */
export declare function createLibrarianAgent(model: string): {
    name: string;
    instructions: string;
    model: string;
    temperature: number;
    mode: import("./types").AgentMode;
    permissions: import("./registry").AgentPermissions;
    fallbackChain: string[];
};
