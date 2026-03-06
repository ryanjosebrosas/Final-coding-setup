# Task 1: Export pipeline-hook from hooks/index.ts

## Objective
Add the two missing export lines for `createPipelineHook` and `createPipelineHookFactory`
to `.opencode/hooks/index.ts` so OpenCode loads the pipeline-hook at runtime.

## Scope
- **Files modified**: `.opencode/hooks/index.ts` (1 file)
- **Files created**: none
- **Out of scope**: Do NOT modify `pipeline-hook/index.ts` itself — it is already complete
- **Dependencies**: none — this is Wave 1, no prior tasks required

## Prior Task Context
None. This is Task 1.

## Context References

### Target file: `.opencode/hooks/index.ts` (full current content)

```typescript
/**
 * OpenCode Hooks - Main Export
 * 
 * Exports all hook implementations organized by tier.
 * Hooks are grouped into 5 tiers based on execution priority:
 * 
 * 1. Continuation - Run first to enforce completion guarantees
 * 2. Session - Session lifecycle management
 * 3. Tool-Guard - Pre/post tool execution
 * 4. Transform - Message transformation
 * 5. Skill - Skill-specific hooks
 */

// ============================================================================
// BASE TYPES
// ============================================================================

export type { HookName, HookTier, HookConfig, HookContext, HookResult, HookEventType, HookHandler, HookDefinition, HookRegistry, PluginInput } from "./base"
export { HOOK_TIER_ORDER, getHookTierOrder, createHookRegistry } from "./base"

// ============================================================================
// CONTINUATION TIER (Priority 1)
// ============================================================================

// Todo Continuation Enforcer - Enforce todo completion
export { createTodoContinuationEnforcer } from "./todo-continuation"
export type { TodoContinuationEnforcer, TodoContinuationEnforcerOptions, SessionStateStore, Todo } from "./todo-continuation/types"

// Atlas - Boulder pusher for task orchestration
export { createAtlasHook, readBoulderState, writeBoulderState, getPlanProgress, getNextPendingTask, createBoulderState } from "./atlas"
export type { AtlasHookOptions, SessionState as AtlasSessionState, BoulderState, PlanProgress, TaskInfo, PluginInput as AtlasPluginInput } from "./atlas/types"

// Session Recovery - Resume from errors
export { createSessionRecoveryHook } from "./session-recovery"
export type { SessionRecoveryHook, SessionRecoveryOptions, RecoveryErrorType } from "./session-recovery/types"

// Compaction Todo Preserver - Preserve todos during compaction
export { createCompactionTodoPreserverHook } from "./compaction-todo-preserver"
export type { CompactionTodoPreserver } from "./compaction-todo-preserver"

// Background Notification - Event routing
export { createBackgroundNotificationHook } from "./background-notification"

// ============================================================================
// SESSION TIER (Priority 2)
// ============================================================================

// Agent Usage Reminder - Remind about available agents
export { createAgentUsageReminderHook } from "./agent-usage-reminder"
export type { AgentUsageState } from "./agent-usage-reminder/types"

// Command Model Router - Route slash commands to configured models
export { createCommandModelRouterHook } from "./command-model-router"

// ============================================================================
// TOOL-GUARD TIER (Priority 3)
// ============================================================================

// Rules Injector - Inject project rules
export { createRulesInjectorHook } from "./rules-injector"

// Comment Checker - Check for AI comments
export { createCommentCheckerHooks } from "./comment-checker"

// Directory Agents Injector - Inject AGENTS.md
export { createDirectoryAgentsInjectorHook } from "./directory-agents-injector"

// Directory README Injector - Inject README.md
export { createDirectoryReadmeInjectorHook } from "./directory-readme-injector"

// ============================================================================
// TRANSFORM TIER (Priority 4)
// ============================================================================

// Placeholder for transform hooks
// - compaction-context-injector
// - hashline-read-enhancer
// - question-label-truncator

// ============================================================================
// SKILL TIER (Priority 5)
// ============================================================================

// Category Skill Reminder - Remind about category + skills
export { createCategorySkillReminderHook } from "./category-skill-reminder"
// Note: AvailableSkill type is now defined in agents/dynamic-prompt-builder.ts
```

### Source file: `.opencode/hooks/pipeline-hook/index.ts` (what we're exporting)

The file exports two functions:
- `createPipelineHook(workspaceDir: string, options?: PipelineHookOptions)` — main factory
- `createPipelineHookFactory(workspaceDir: string)` — lightweight factory for MCP registration
- `PipelineHookOptions` interface — options type

Both functions and the interface should be exported from the main index.

## Patterns to Follow

### Pattern: Export block style (from hooks/index.ts lines 60-69)

```typescript
// Comment Checker - Check for AI comments
export { createCommentCheckerHooks } from "./comment-checker"

// Directory Agents Injector - Inject AGENTS.md
export { createDirectoryAgentsInjectorHook } from "./directory-agents-injector"

// Directory README Injector - Inject README.md
export { createDirectoryReadmeInjectorHook } from "./directory-readme-injector"
```

Each export block:
1. Single `//` comment line describing the hook
2. `export { ... } from "./hook-name"` line
3. Blank line after (before next section or export)

The pipeline-hook export must match this exact style.

### Pattern: Where to insert (between Transform and Skill tiers)

The export belongs in its own section between Transform (Priority 4) and Skill (Priority 5).
This keeps the tier ordering intact. Insert a new `// PIPELINE TIER` or place it just before
the Skill tier with a clear comment.

The cleanest approach: add it as a standalone section between the Transform placeholder
and the Skill tier, since it logically crosses tiers (fires on session start = session tier,
but conceptually it's a pipeline concern distinct from skill reminders).

## Step-by-Step Implementation

### Step 1: Locate insertion point

The edit goes between line 79 (end of Transform tier placeholder) and line 84 (start of
Skill tier). The exact current content at that boundary:

```typescript
// Placeholder for transform hooks
// - compaction-context-injector
// - hashline-read-enhancer
// - question-label-truncator

// ============================================================================
// SKILL TIER (Priority 5)
// ============================================================================
```

### Step 2: Apply the edit

**CURRENT** (lines 72-86 of hooks/index.ts):
```typescript
// ============================================================================
// TRANSFORM TIER (Priority 4)
// ============================================================================

// Placeholder for transform hooks
// - compaction-context-injector
// - hashline-read-enhancer
// - question-label-truncator

// ============================================================================
// SKILL TIER (Priority 5)
// ============================================================================

// Category Skill Reminder - Remind about category + skills
export { createCategorySkillReminderHook } from "./category-skill-reminder"
// Note: AvailableSkill type is now defined in agents/dynamic-prompt-builder.ts
```

**REPLACE WITH**:
```typescript
// ============================================================================
// TRANSFORM TIER (Priority 4)
// ============================================================================

// Placeholder for transform hooks
// - compaction-context-injector
// - hashline-read-enhancer
// - question-label-truncator

// ============================================================================
// PIPELINE TIER (Priority 6)
// ============================================================================

// Pipeline Hook - Surface pending pipeline work on session start
export { createPipelineHook, createPipelineHookFactory } from "./pipeline-hook"
export type { PipelineHookOptions } from "./pipeline-hook"

// ============================================================================
// SKILL TIER (Priority 7)
// ============================================================================

// Category Skill Reminder - Remind about category + skills
export { createCategorySkillReminderHook } from "./category-skill-reminder"
// Note: AvailableSkill type is now defined in agents/dynamic-prompt-builder.ts
```

**Note**: Priority numbers updated from 5 to 6/7 to make room for the new tier. Check
whether these numbers are used anywhere in logic vs just as comments — if they're just
comments, update freely. If used in code, grep first.

### Step 3: Verify priority numbers are comment-only

Before updating the priority numbers, run:
```bash
grep -r "Priority 5\|Priority 6\|priority.*5\|priority.*6" .opencode/hooks/ --include="*.ts"
```

If results show code (not just comments) using these numbers, do NOT change the numbers —
just add the new section with `// PIPELINE TIER` and leave priority comments as-is.

## QA Scenarios

### Scenario 1: Export is importable
**Tool**: Bash
**Steps**:
1. Run `cd .opencode && npx tsc --noEmit`
**Expected**: Zero TypeScript errors. The new import path `./pipeline-hook` resolves
correctly because `pipeline-hook/index.ts` exists and exports `createPipelineHook`.
**Evidence**: `.agents/features/system-utilization-gaps/evidence/task-1-tsc.txt`

### Scenario 2: Export appears in compiled output
**Tool**: Bash
**Steps**:
1. Run `grep "createPipelineHook" .opencode/hooks/index.ts`
**Expected**: Returns the export line — confirms the edit was applied
**Evidence**: Terminal output

### Scenario 3: All existing tests still pass
**Tool**: Bash
**Steps**:
1. Run `cd .opencode && npm test`
**Expected**: 512 tests pass, 0 failures
**Evidence**: `.agents/features/system-utilization-gaps/evidence/task-1-tests.txt`

## Validation Commands

```bash
# L1: Verify export line exists
grep "createPipelineHook" .opencode/hooks/index.ts

# L2: TypeScript check
cd .opencode && npx tsc --noEmit

# L3: All tests pass
cd .opencode && npm test

# L4: Verify both exports present
grep -A2 "pipeline-hook" .opencode/hooks/index.ts
```

## Acceptance Criteria

### Implementation
- [ ] `hooks/index.ts` contains `export { createPipelineHook, createPipelineHookFactory } from "./pipeline-hook"`
- [ ] `hooks/index.ts` contains `export type { PipelineHookOptions } from "./pipeline-hook"`
- [ ] The export appears in a clearly labeled `// PIPELINE TIER` section
- [ ] No existing exports were removed or modified

### Runtime
- [ ] `tsc --noEmit` exits 0
- [ ] All 512 existing tests pass
- [ ] `grep "createPipelineHook" .opencode/hooks/index.ts` returns the new export line

## Parallelization
- **Wave**: 1 — no dependencies, starts immediately
- **Can Parallel**: YES — independent of Tasks 2, 3, 4
- **Blocks**: Task 5 (README, needs to reference all gaps resolved)
- **Blocked By**: nothing

## Handoff Notes
Task 2, 3, 4 are all Wave 1 and fully independent. After all four complete, Task 5
(README) runs as Wave 2.

## Completion Checklist
- [ ] Edit applied to `hooks/index.ts`
- [ ] tsc --noEmit clean
- [ ] All tests pass
- [ ] Evidence saved
