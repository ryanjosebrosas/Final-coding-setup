import type { AgentMode } from "./types";
export interface AgentMetadata {
    name: string;
    displayName: string;
    description: string;
    category: string;
    model: string;
    temperature: number;
    mode: AgentMode;
    permissions: AgentPermissions;
    fallbackChain: readonly string[];
    deniedTools: string[];
    archonEnabled?: boolean;
}
export interface AgentPermissions {
    readFile: boolean;
    writeFile: boolean;
    editFile: boolean;
    bash: boolean;
    grep: boolean;
    task: boolean;
}
export declare const PERMISSIONS: {
    readonly full: {
        readonly readFile: true;
        readonly writeFile: true;
        readonly editFile: true;
        readonly bash: true;
        readonly grep: true;
        readonly task: true;
    };
    readonly readOnly: {
        readonly readFile: true;
        readonly writeFile: false;
        readonly editFile: false;
        readonly bash: false;
        readonly grep: true;
        readonly task: false;
    };
    readonly fullNoTask: {
        readonly readFile: true;
        readonly writeFile: true;
        readonly editFile: true;
        readonly bash: true;
        readonly grep: true;
        readonly task: false;
    };
    readonly visionOnly: {
        readonly readFile: false;
        readonly writeFile: false;
        readonly editFile: false;
        readonly bash: false;
        readonly grep: false;
        readonly task: false;
    };
};
export declare const FALLBACK_CHAINS: {
    readonly sisyphus: readonly ["kimi-k2.5", "glm-5", "big-pickle"];
    readonly hephaestus: readonly ["claude-sonnet-4-5", "deepseek-v3.1:671b"];
    readonly oracle: readonly ["gemini-3.1-pro", "claude-opus-4-5"];
    readonly momus: readonly ["claude-opus-4-5", "gemini-3.1-pro"];
    readonly prometheus: readonly ["kimi-k2.5", "gpt-5.2", "gemini-3.1-pro"];
    readonly metis: readonly ["gpt-5.2", "kimi-k2.5", "gemini-3.1-pro"];
    readonly atlas: readonly ["kimi-k2.5", "gpt-5.2"];
    readonly librarian: readonly ["deepseek-v3.2", "qwen3.5-plus", "glm-4.7"];
    readonly explore: readonly ["qwen3-coder-next", "kimi-k2.5", "glm-4.7"];
    readonly multimodalLooker: readonly ["gemini-3-flash", "minimax-m2.5", "big-pickle"];
    readonly sisyphusJunior: readonly [];
};
export declare const AGENT_REGISTRY: Record<string, AgentMetadata>;
export declare function getAgentByName(name: string): AgentMetadata | null;
export declare function getAllAgentNames(): string[];
export declare function getAgentsByMode(mode: AgentMode): AgentMetadata[];
export declare function getAgentsByCategory(category: string): AgentMetadata[];
export declare function getReadOnlyAgents(): AgentMetadata[];
export declare function getDelegatingAgents(): AgentMetadata[];
export type AgentName = keyof typeof AGENT_REGISTRY;
export declare const AGENT_NAMES: AgentName[];
