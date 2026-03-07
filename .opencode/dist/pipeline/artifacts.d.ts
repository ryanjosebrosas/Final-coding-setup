import type { ArtifactInfo, ArtifactDiscoveryResult } from "./types";
/**
 * Discover all artifacts for a feature.
 */
export declare function discoverArtifacts(workspaceDir: string, feature: string): ArtifactInfo[];
/**
 * Get pending artifacts (status: "pending").
 */
export declare function getPendingArtifacts(artifacts: ArtifactInfo[]): ArtifactInfo[];
/**
 * Get completed artifacts (status: "done").
 */
export declare function getDoneArtifacts(artifacts: ArtifactInfo[]): ArtifactInfo[];
/**
 * Mark an artifact as done by renaming from `.md` to `.done.md`.
 *
 * Returns true if successful, false otherwise.
 */
export declare function markArtifactDone(workspaceDir: string, artifact: ArtifactInfo): boolean;
/**
 * Mark an artifact as pending by renaming from `.done.md` to `.md`.
 *
 * Returns true if successful, false otherwise.
 */
export declare function markArtifactPending(workspaceDir: string, artifact: ArtifactInfo): boolean;
/**
 * Get the next pending task artifact.
 */
export declare function getNextPendingTask(artifacts: ArtifactInfo[]): ArtifactInfo | undefined;
/**
 * Get comprehensive artifact discovery result for a feature.
 */
export declare function getArtifactDiscoveryResult(workspaceDir: string, feature: string): ArtifactDiscoveryResult;
/**
 * Check if all required artifacts for a phase are complete.
 */
export declare function isPhaseComplete(workspaceDir: string, feature: string, requiredArtifacts: string[]): boolean;
/**
 * Get the highest task number from task artifacts.
 */
export declare function getHighestTaskNumber(artifacts: ArtifactInfo[]): number;
/**
 * Get the next phase number from plan-phase artifacts.
 */
export declare function getNextPhaseNumber(artifacts: ArtifactInfo[]): number;
/**
 * Find the first incomplete artifact by type priority.
 *
 * Priority order: plan > plan-master > task-N > report > review
 */
export declare function findFirstIncompleteArtifact(workspaceDir: string, feature: string): ArtifactInfo | undefined;
