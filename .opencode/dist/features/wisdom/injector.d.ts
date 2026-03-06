/**
 * Wisdom Injector
 *
 * Injects relevant wisdom into subagent prompts at task start.
 */
import { WisdomItem } from './types';
/**
 * Context for wisdom injection.
 */
export interface InjectionContext {
    /** Feature being worked on */
    feature: string;
    /** Files being modified */
    files?: string[];
    /** Task type/subagent category */
    taskType?: string;
    /** Keywords from the task description */
    keywords?: string[];
    /** Patterns expected or mentioned */
    patterns?: string[];
}
/**
 * Injected wisdom for a prompt.
 */
export interface InjectedWisdom {
    /** Raw wisdom items */
    items: WisdomItem[];
    /** Formatted injection text */
    formatted: string;
    /** Stats */
    stats: {
        total: number;
        byCategory: Record<string, number>;
        avgConfidence: number;
    };
}
/**
 * Inject relevant wisdom into a prompt.
 */
export declare function inject(context: InjectionContext): InjectedWisdom;
/**
 * Build an injection block for prepending to prompts.
 */
export declare function buildInjectionBlock(context: InjectionContext): string;
declare const _default: {
    inject: typeof inject;
    buildInjectionBlock: typeof buildInjectionBlock;
};
export default _default;
