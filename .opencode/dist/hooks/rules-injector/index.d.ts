/**
 * Rules Injector Hook
 *
 * Injects project rules (.cursorrules, .opencode/rules, etc.) into file read outputs.
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
interface ToolExecuteBeforeOutput {
    args: unknown;
}
interface EventInput {
    event: {
        type: string;
        properties?: unknown;
    };
}
/**
 * Create the rules injector hook.
 */
export declare function createRulesInjectorHook(ctx: PluginInput, _modelCacheState?: {
    anthropicContext1MEnabled: boolean;
}): {
    "tool.execute.before": (input: ToolExecuteInput, output: ToolExecuteBeforeOutput) => Promise<void>;
    "tool.execute.after": (input: ToolExecuteInput, output: ToolExecuteOutput) => Promise<void>;
    event: (input: EventInput) => Promise<void>;
};
export {};
