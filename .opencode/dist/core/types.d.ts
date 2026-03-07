/**
 * Core type definitions for OhMyOpenCode plugin
 */
/**
 * Agent model configuration
 */
export interface AgentModelConfig {
    model?: string;
    provider?: string;
    temperature?: number;
    prompt?: string;
    permissions?: string;
}
/**
 * Category-based model routing configuration
 */
export interface CategoryConfig {
    model?: string;
    provider?: string;
    temperature?: number;
}
/**
 * Experimental features configuration
 */
export interface ExperimentalConfig {
    debug_logging?: boolean;
    safe_hook_creation?: boolean;
}
/**
 * OhMyOpenCode configuration schema
 */
export interface OhMyOpenCodeConfig {
    agents?: Record<string, AgentModelConfig>;
    categories?: Record<string, CategoryConfig>;
    disabled_agents?: string[];
    disabled_hooks?: string[];
    disabled_commands?: string[];
    disabled_skills?: string[];
    mcps?: Record<string, McpConfig>;
    experimental?: ExperimentalConfig;
    start_work?: {
        auto_commit?: boolean;
    };
    [key: string]: unknown;
}
/**
 * MCP server configuration
 */
export interface McpConfig {
    command?: string;
    args?: string[];
    env?: Record<string, string>;
}
/**
 * Plugin context passed from OpenCode
 * Matches the PluginInput interface from @opencode-ai/plugin
 */
export interface PluginContext {
    client: unknown;
    project: unknown;
    directory: string;
    worktree: string;
    serverUrl: URL;
    $: unknown;
}
