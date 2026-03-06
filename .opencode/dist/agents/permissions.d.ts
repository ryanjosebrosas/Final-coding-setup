import type { AgentName } from "./registry";
export type PermissionLevel = "full" | "full-no-task" | "read-only" | "vision-only";
export interface DetailedPermissions {
    readFile: boolean;
    writeFile: boolean;
    editFile: boolean;
    bash: boolean;
    grep: boolean;
    glob: boolean;
    task: boolean;
    call_omo_agent: boolean;
    lsp_goto_definition: boolean;
    lsp_find_references: boolean;
    lsp_symbols: boolean;
    lsp_diagnostics: boolean;
    archon_mcp: boolean;
    webfetch: boolean;
    websearch: boolean;
}
export declare const PERMISSION_PRESETS: Record<PermissionLevel, DetailedPermissions>;
export declare const AGENT_PERMISSIONS: Record<AgentName, PermissionLevel>;
/**
 * Get the permission level for an agent.
 */
export declare function getPermissionLevel(agentName: AgentName): PermissionLevel;
/**
 * Get detailed permissions for an agent.
 */
export declare function getPermissions(agentName: AgentName): DetailedPermissions;
/**
 * Check if an agent can use a specific tool.
 */
export declare function canUseTool(agentName: AgentName, toolName: string): boolean;
/**
 * Get list of denied tools for an agent.
 */
export declare function getDeniedToolsList(agentName: AgentName): string[];
/**
 * Check if agent is read-only.
 */
export declare function isReadOnly(agentName: AgentName): boolean;
/**
 * Check if agent can delegate.
 */
export declare function canDelegate(agentName: AgentName): boolean;
/**
 * Validate that a tool call is permitted for an agent.
 * Throws an error if permission is denied.
 */
export declare function enforcePermission(agentName: AgentName, toolName: string): void;
/**
 * Filter available tools for an agent.
 */
export declare function filterAvailableTools(agentName: AgentName, allTools: string[]): {
    allowed: string[];
    denied: string[];
};
