import type { CommandInfo, PipelineStatus } from "./types";
/**
 * Load a command's metadata from its method file.
 */
export declare function loadCommand(commandName: string, workspaceDir: string): CommandInfo | null;
/**
 * List all available commands.
 */
export declare function listCommands(workspaceDir: string): CommandInfo[];
/**
 * Check if a command name is valid.
 */
export declare function isValidCommand(commandName: string): boolean;
/**
 * Get the target status for a command.
 */
export declare function getCommandStatus(commandName: string): PipelineStatus | undefined;
/**
 * Get all commands that can transition to a given status.
 */
export declare function getCommandsForStatus(status: PipelineStatus): string[];
/**
 * Get a brief description of a command's purpose.
 */
export declare function getCommandDescription(commandName: string): string;
/**
 * Get the suggested next command based on current status.
 */
export declare function suggestNextCommand(status: PipelineStatus, feature?: string): string | null;
