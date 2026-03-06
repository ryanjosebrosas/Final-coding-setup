/**
 * Wisdom Extractor
 *
 * Extracts learnings from completed task executions.
 * Analyzes code review findings, test failures, error messages,
 * and successful patterns to identify wisdom.
 */
import { WisdomItem } from './types';
/**
 * Extract wisdom from a code review finding.
 */
export declare function extractFromReviewFinding(finding: {
    severity: 'critical' | 'major' | 'minor';
    type: string;
    message: string;
    location: string;
    suggestion: string;
}): WisdomItem;
/**
 * Extract wisdom from a test failure.
 */
export declare function extractFromTestFailure(failure: {
    testName: string;
    error: string;
    expected: string;
    actual: string;
    stackTrace: string;
}): WisdomItem;
/**
 * Extract wisdom from a successful pattern.
 */
export declare function extractFromSuccess(success: {
    approach: string;
    result: string;
    context: string;
    files: string[];
}): WisdomItem;
/**
 * Extract all wisdom from a task execution report.
 */
export declare function extractFromReport(report: {
    divergences: Array<{
        what: string;
        reason: string;
        classification: string;
    }>;
    issues: Array<{
        severity: string;
        description: string;
    }>;
    successes: string[];
}): WisdomItem[];
declare const _default: {
    extractFromReviewFinding: typeof extractFromReviewFinding;
    extractFromTestFailure: typeof extractFromTestFailure;
    extractFromSuccess: typeof extractFromSuccess;
    extractFromReport: typeof extractFromReport;
};
export default _default;
