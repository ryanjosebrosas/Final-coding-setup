export interface EnvironmentContext {
    projectName?: string;
    projectType?: "frontend" | "backend" | "fullstack" | "library" | "cli" | "other";
    language?: "typescript" | "javascript" | "python" | "rust" | "go" | "other";
    framework?: string;
    packageManager?: "npm" | "yarn" | "pnpm" | "pip" | "cargo" | "go";
    validationCommands?: {
        lint?: string;
        format?: string;
        types?: string;
        test?: string;
        integration?: string;
    };
    sourceDirectories?: {
        source?: string;
        tests?: string;
        config?: string;
    };
    git?: {
        remote?: string;
        mainBranch?: string;
        currentBranch?: string;
    };
    availableAgents?: string[];
    availableSkills?: string[];
    availableCategories?: string[];
}
/**
 * Collect environment context for dynamic prompt building.
 * This information is used to inform agents about the environment they're working in.
 */
export declare function collectEnvironmentContext(): EnvironmentContext;
/**
 * Format environment context for inclusion in a prompt.
 */
export declare function formatEnvironmentContext(context: EnvironmentContext): string;
/**
 * Build context section for agent prompts.
 */
export declare function buildContextSection(context: EnvironmentContext): string;
