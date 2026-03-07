import type { PipelineHandoff, PipelineStatus } from "./types";
/**
 * Read the pipeline handoff file.
 *
 * Returns null if the file doesn't exist or can't be parsed.
 */
export declare function readHandoff(workspaceDir: string): PipelineHandoff | null;
/**
 * Write the pipeline handoff file.
 *
 * Creates the context directory if it doesn't exist.
 * Updates the timestamp automatically.
 * Uses atomic write (temp file + rename) for crash safety.
 */
export declare function writeHandoff(workspaceDir: string, handoff: PipelineHandoff): boolean;
/**
 * Create a new handoff with default values.
 */
export declare function createHandoff(feature: string, lastCommand: string, nextCommand: string, status?: PipelineStatus): PipelineHandoff;
/**
 * Update specific fields in a handoff.
 */
export declare function updateHandoff(handoff: PipelineHandoff, updates: Partial<PipelineHandoff>): PipelineHandoff;
/**
 * Check if a handoff has pending work.
 */
export declare function hasPendingWork(handoff: PipelineHandoff | null): boolean;
