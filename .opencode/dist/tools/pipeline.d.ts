/**
 * Pipeline orchestration tool for AI coding workflow.
 *
 * Commands:
 * - status: Read current handoff state
 * - next: Get valid next states
 * - advance: Transition to new state
 * - artifacts: List artifacts for a feature
 * - commands: List available commands
 */
export declare const pipelineTool: {
    name: string;
    description: string;
    parameters: {
        type: string;
        properties: {
            command: {
                type: string;
                description: string;
                enum: string[];
            };
            feature: {
                type: string;
                description: string;
            };
            status: {
                type: string;
                description: string;
            };
            task: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    execute(args: {
        command: "status" | "next" | "advance" | "artifacts" | "commands";
        feature?: string;
        status?: string;
        task?: number;
    }): Promise<string>;
};
export default pipelineTool;
