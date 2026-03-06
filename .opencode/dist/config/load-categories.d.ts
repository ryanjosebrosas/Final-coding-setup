import { type CategoriesConfig, type CategoryDefinition } from "./category-schema";
/**
 * Load the effective category configuration.
 * Merges defaults with user overrides if present.
 */
export declare function loadCategories(): CategoriesConfig;
/**
 * Get a specific category definition.
 */
export declare function getCategoryDefinition(name: string): CategoryDefinition | null;
/**
 * Clear the configuration cache.
 */
export declare function clearCategoriesCache(): void;
