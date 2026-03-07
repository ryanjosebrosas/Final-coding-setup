/**
 * Directory Agents Injector Hook
 *
 * Injects directory-level AGENTS.md content into file reads.
 */
interface PluginInput {
    directory: string;
}
interface ToolExecuteInput {
    tool: string;
    sessionID: string;
    callID: string;
}
interface ToolExecuteOutput {
    title: string;
    output: string;
    metadata: unknown;
}
/**
 * Create the directory agents injector hook.
 */
export declare function createDirectoryAgentsInjectorHook(ctx: PluginInput, _modelCacheState?: {
    anthropicContext1MEnabled: boolean;
}): {
    "tool.execute.before": (input: ToolExecuteInput, output: {
        args: unknown;
    }) => Promise<void>;
    "tool.execute.after": (input: ToolExecuteInput, output: ToolExecuteOutput) => Promise<void>;
    event: (input: {
        event: {
            type: string;
            properties?: unknown;
        };
    }) => Promise<void>;
};
export {};
