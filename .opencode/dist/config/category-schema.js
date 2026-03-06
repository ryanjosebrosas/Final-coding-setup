import { z } from "zod";
// ============================================================================
// CATEGORY SCHEMA (Zod v4)
// ============================================================================
/**
 * Schema for a single category definition.
 */
export const CategoryDefinitionSchema = z.object({
    model: z.string().describe("Model ID to route to"),
    provider: z.string().describe("Provider ID to use"),
    temperature: z.number().min(0).max(2).optional().default(0.5).describe("Temperature for model inference"),
    description: z.string().describe("Human-readable description of the category"),
    useWhen: z.array(z.string()).optional().describe("When to use this category"),
    avoidWhen: z.array(z.string()).optional().describe("When NOT to use this category"),
    promptAppend: z.string().optional().describe("Prompt to append for this category"),
    reasoning: z.enum(["low", "medium", "high", "xhigh"]).optional().describe("Reasoning level required"),
    creativity: z.enum(["low", "medium", "high", "max"]).optional().describe("Creativity level"),
});
/**
 * Schema for the complete categories configuration.
 */
export const CategoriesConfigSchema = z.object({
    $schema: z.string().optional(),
    categories: z.record(z.string(), CategoryDefinitionSchema).describe("Map of category name to definition"),
    defaults: z.object({
        fallbackCategory: z.string().describe("Default category when none specified"),
        fallbackModel: z.object({
            provider: z.string(),
            model: z.string(),
        }).describe("Fallback model when category routing fails"),
    }).optional(),
});
/**
 * All available category names.
 */
export const CATEGORY_NAMES = [
    "visual-engineering",
    "ultrabrain",
    "artistry",
    "quick",
    "deep",
    "unspecified-low",
    "unspecified-high",
    "writing",
];
// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================
/**
 * Validate a single category definition.
 */
export function validateCategoryDefinition(data) {
    const result = CategoryDefinitionSchema.safeParse(data);
    return result.success ? result.data : null;
}
/**
 * Validate complete categories configuration.
 */
export function validateCategoriesConfig(data) {
    const result = CategoriesConfigSchema.safeParse(data);
    return result.success ? result.data : null;
}
/**
 * Check if a string is a valid category name.
 */
export function isValidCategoryName(name) {
    return CATEGORY_NAMES.includes(name);
}
/**
 * Validate category configuration and return typed result with errors.
 */
export function validateCategoryConfigWithErrors(data) {
    const result = CategoriesConfigSchema.safeParse(data);
    if (result.success) {
        return { success: true, data: result.data };
    }
    return { success: false, errors: result.error };
}
//# sourceMappingURL=category-schema.js.map