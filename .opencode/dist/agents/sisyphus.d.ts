import { type AgentMetadata } from "./registry";
import { type AgentPromptContext, type BuiltPrompt } from "./prompt-builder";
export declare const SISYPHUS_METADATA: AgentMetadata;
/**
 * Build the complete prompt for Sisyphus orchestrator.
 */
export declare function createSisyphusPrompt(context: AgentPromptContext): BuiltPrompt;
/**
 * Factory function compatible with OhMyOpenCode pattern.
 */
export declare function createSisyphusAgent(model: string): {
    name: string;
    instructions: string;
    model: string;
    temperature: number;
    mode: import("./types").AgentMode;
    permissions: import("./registry").AgentPermissions;
    fallbackChain: string[];
};
