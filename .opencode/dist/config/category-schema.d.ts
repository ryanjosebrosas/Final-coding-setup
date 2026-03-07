import { z } from "zod";
/**
 * Schema for a single category definition.
 */
export declare const CategoryDefinitionSchema: z.ZodObject<{
    model: z.ZodString;
    provider: z.ZodString;
    temperature: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    description: z.ZodString;
    useWhen: z.ZodOptional<z.ZodArray<z.ZodString>>;
    avoidWhen: z.ZodOptional<z.ZodArray<z.ZodString>>;
    promptAppend: z.ZodOptional<z.ZodString>;
    reasoning: z.ZodOptional<z.ZodEnum<{
        low: "low";
        medium: "medium";
        high: "high";
        xhigh: "xhigh";
    }>>;
    creativity: z.ZodOptional<z.ZodEnum<{
        low: "low";
        medium: "medium";
        high: "high";
        max: "max";
    }>>;
}, z.core.$strip>;
/**
 * Schema for the complete categories configuration.
 */
export declare const CategoriesConfigSchema: z.ZodObject<{
    $schema: z.ZodOptional<z.ZodString>;
    categories: z.ZodRecord<z.ZodString, z.ZodObject<{
        model: z.ZodString;
        provider: z.ZodString;
        temperature: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        description: z.ZodString;
        useWhen: z.ZodOptional<z.ZodArray<z.ZodString>>;
        avoidWhen: z.ZodOptional<z.ZodArray<z.ZodString>>;
        promptAppend: z.ZodOptional<z.ZodString>;
        reasoning: z.ZodOptional<z.ZodEnum<{
            low: "low";
            medium: "medium";
            high: "high";
            xhigh: "xhigh";
        }>>;
        creativity: z.ZodOptional<z.ZodEnum<{
            low: "low";
            medium: "medium";
            high: "high";
            max: "max";
        }>>;
    }, z.core.$strip>>;
    defaults: z.ZodOptional<z.ZodObject<{
        fallbackCategory: z.ZodString;
        fallbackModel: z.ZodObject<{
            provider: z.ZodString;
            model: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type CategoryDefinition = z.infer<typeof CategoryDefinitionSchema>;
export type CategoriesConfig = z.infer<typeof CategoriesConfigSchema>;
/**
 * Supported category names for task dispatch.
 */
export type CategoryName = "visual-engineering" | "ultrabrain" | "artistry" | "quick" | "deep" | "unspecified-low" | "unspecified-high" | "writing";
/**
 * All available category names.
 */
export declare const CATEGORY_NAMES: CategoryName[];
/**
 * Validate a single category definition.
 */
export declare function validateCategoryDefinition(data: unknown): CategoryDefinition | null;
/**
 * Validate complete categories configuration.
 */
export declare function validateCategoriesConfig(data: unknown): CategoriesConfig | null;
/**
 * Check if a string is a valid category name.
 */
export declare function isValidCategoryName(name: string): name is CategoryName;
/**
 * Validate category configuration and return typed result with errors.
 */
export declare function validateCategoryConfigWithErrors(data: unknown): {
    success: boolean;
    data?: CategoriesConfig;
    errors?: z.ZodError;
};
