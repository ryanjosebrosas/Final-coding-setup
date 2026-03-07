/**
 * Pipeline Hook Options
 */
export interface PipelineHookOptions {
    /** Priority for hook execution (default: 90) */
    priority?: number;
    /** Skip reminder if blocked state */
    skipBlocked?: boolean;
}
/**
 * Create a pipeline hook that injects pending work reminder on session start.
 *
 * This hook fires after context load and before agent logic, surfacing
 * "what to do next" for the current pipeline state.
 *
 * @param workspaceDir - Project root directory
 * @param options - Hook configuration options
 */
export declare function createPipelineHook(workspaceDir: string, options?: PipelineHookOptions): {
    name: string;
    priority: number;
    /**
     * Fire on session start to surface pending work.
     *
     * Returns a system reminder if there's pending pipeline work.
     */
    onSessionStart(): Promise<{
        type: string;
        content: string;
    } | null>;
    /**
     * Fire after a command completes.
     *
     * This could auto-update handoff based on command results,
     * but for MVP, we rely on manual state transitions.
     */
    onCommandComplete(_command: string, _result: unknown): Promise<null>;
};
/**
 * Create a lightweight hook factory for MCP registration.
 */
export declare function createPipelineHookFactory(workspaceDir: string): (options?: PipelineHookOptions) => {
    name: string;
    priority: number;
    /**
     * Fire on session start to surface pending work.
     *
     * Returns a system reminder if there's pending pipeline work.
     */
    onSessionStart(): Promise<{
        type: string;
        content: string;
    } | null>;
    /**
     * Fire after a command completes.
     *
     * This could auto-update handoff based on command results,
     * but for MVP, we rely on manual state transitions.
     */
    onCommandComplete(_command: string, _result: unknown): Promise<null>;
};
