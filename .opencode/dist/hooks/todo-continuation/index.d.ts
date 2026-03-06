/**
 * Todo Continuation Enforcer Hook
 *
 * This hook enforces that all todos are completed before the agent can finish.
 * When a session goes idle with incomplete todos, it injects a system reminder
 * to force continuation until all todos are marked complete or cancelled.
 *
 * Priority: CRITICAL - Part of continuation tier, runs first.
 */
import type { TodoContinuationEnforcer, TodoContinuationEnforcerOptions, SessionStateStore, TodoContinuationPluginInput } from "./types";
export type { TodoContinuationEnforcer, TodoContinuationEnforcerOptions, SessionStateStore, TodoContinuationPluginInput };
/**
 * Create the todo continuation enforcer hook.
 *
 * @param ctx - Plugin context with client and directory
 * @param options - Hook options including background manager and skip agents
 * @returns Hook interface with handler and control methods
 */
export declare function createTodoContinuationEnforcer(ctx: TodoContinuationPluginInput, options?: TodoContinuationEnforcerOptions): TodoContinuationEnforcer;
