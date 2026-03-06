import type { CategoriesConfig, CategoryDefinition } from "../config/category-schema";
/**
 * Merge user-defined categories with default categories.
 * User categories override defaults with the same name.
 */
export declare function mergeCategories(defaultCategories: Record<string, CategoryDefinition>, userCategories: Record<string, CategoryDefinition>): Record<string, CategoryDefinition>;
/**
 * Merge complete category configs (with defaults).
 */
export declare function mergeCategoryConfigs(defaultConfig: CategoriesConfig, userConfig: Partial<CategoriesConfig>): CategoriesConfig;
/**
 * Load user-defined categories from a config file path.
 * Returns null if file doesn't exist or is invalid.
 */
export declare function loadUserCategories(configPath: string): Record<string, CategoryDefinition> | null;
/**
 * Get the effective category configuration by merging defaults with user overrides.
 */
export declare function getEffectiveCategories(defaultConfigPath: string, userConfigPath: string): Record<string, CategoryDefinition> | null;
