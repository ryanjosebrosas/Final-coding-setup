/**
 * Wisdom Categorizer
 *
 * Categorizes wisdom items and determines their relevance
 * to specific contexts and tasks.
 */
import { WisdomItem, WisdomCategory } from './types';
/**
 * Categorize a wisdom item based on its content.
 */
export declare function categorize(item: Omit<WisdomItem, 'category'>): WisdomCategory;
/**
 * Score the relevance of a wisdom item to a context.
 *
 * This is the canonical relevance scoring function used by both
 * categorizer.ts and injector.ts. Keep in sync.
 */
export declare function scoreRelevance(item: WisdomItem, context: {
    files?: string[];
    keywords?: string[];
    taskType?: string;
    patterns?: string[];
}): number;
/**
 * Group wisdom items by category.
 */
export declare function groupByCategory(items: WisdomItem[]): Record<WisdomCategory, WisdomItem[]>;
/**
 * Find duplicate wisdom items.
 */
export declare function findDuplicates(items: WisdomItem[]): WisdomItem[][];
/**
 * Merge duplicate wisdom items.
 */
export declare function mergeDuplicates(items: WisdomItem[]): WisdomItem[];
/**
 * Categorize items from a raw extraction.
 */
export declare function categorizeItems(items: Array<Omit<WisdomItem, 'category'>>): WisdomItem[];
declare const _default: {
    categorize: typeof categorize;
    scoreRelevance: typeof scoreRelevance;
    groupByCategory: typeof groupByCategory;
    findDuplicates: typeof findDuplicates;
    mergeDuplicates: typeof mergeDuplicates;
    categorizeItems: typeof categorizeItems;
};
export default _default;
