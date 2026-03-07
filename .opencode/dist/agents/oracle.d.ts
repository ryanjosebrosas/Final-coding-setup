import { type AgentMetadata } from "./registry";
import { type AgentPromptContext, type BuiltPrompt } from "./prompt-builder";
export declare const ORACLE_METADATA: AgentMetadata;
/**
 * Build the complete prompt for Oracle consultant.
 */
export declare function createOraclePrompt(context: AgentPromptContext): BuiltPrompt;
/**
 * Factory function compatible with OhMyOpenCode pattern.
 */
export declare function createOracleAgent(model: string): {
    name: string;
    instructions: string;
    model: string;
    temperature: number;
    mode: import("./types").AgentMode;
    permissions: import("./registry").AgentPermissions;
    fallbackChain: string[];
};
