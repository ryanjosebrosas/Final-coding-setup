/**
 * Wisdom Storage
 *
 * Reads and writes wisdom files from .agents/wisdom/{feature}/
 */
import { WisdomItem, WisdomFile, Decision, Issue, WisdomQuery } from './types';
/**
 * Ensure the wisdom directory exists for a feature.
 */
export declare function ensureWisdomDir(feature: string): string;
/**
 * Load wisdom for a feature.
 */
export declare function loadWisdom(feature: string): WisdomFile;
/**
 * Save wisdom for a feature.
 */
export declare function saveWisdom(wisdom: WisdomFile): void;
/**
 * Add a wisdom item.
 */
export declare function addWisdomItem(feature: string, item: WisdomItem): void;
/**
 * Add multiple wisdom items.
 */
export declare function addWisdomItems(feature: string, items: WisdomItem[]): void;
/**
 * Search wisdom with query.
 */
export declare function searchWisdom(wisdom: WisdomFile, query: WisdomQuery): WisdomItem[];
/**
 * Load decisions for a feature.
 */
export declare function loadDecisions(feature: string): Decision[];
/**
 * Save a decision.
 */
export declare function saveDecision(feature: string, decision: Decision): void;
/**
 * Load issues for a feature.
 */
export declare function loadIssues(feature: string): Issue[];
/**
 * Save an issue.
 */
export declare function saveIssue(feature: string, issue: Issue): void;
declare const _default: {
    loadWisdom: typeof loadWisdom;
    saveWisdom: typeof saveWisdom;
    addWisdomItem: typeof addWisdomItem;
    addWisdomItems: typeof addWisdomItems;
    searchWisdom: typeof searchWisdom;
    loadDecisions: typeof loadDecisions;
    saveDecision: typeof saveDecision;
    loadIssues: typeof loadIssues;
    saveIssue: typeof saveIssue;
    ensureWisdomDir: typeof ensureWisdomDir;
};
export default _default;
