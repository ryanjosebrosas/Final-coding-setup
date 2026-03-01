# Feature Plan: dispatch-sequential-bugfixes

> **Feature**: `dispatch-sequential-bugfixes`
> **Plan Path**: `.agents/features/dispatch-sequential-bugfixes/plan.md`
> **Status**: Planning complete — awaiting approval
> **Created**: 2026-03-02
> **Upstream**: `dispatch-sequential-pipeline` (commit pending)

---

## Problem Statement

Three bugs found during end-to-end testing of the sequential dispatch flow. Two are
blockers that will cause `/build`'s sequential dispatch to fail when using the dispatch
tool. One is a design issue causing redundant work and potential model mismatch.

### Bug #1: Empty prompt validation blocks `/prime` (BLOCKER)

**Location**: `dispatch.ts:713`
**Code**: `if (!args.prompt) { return "# Dispatch Error..." }`
**Problem**: `/prime` via command mode has an empty prompt (`""`). In JavaScript, `!""` 
is `true`, so the validation rejects it before reaching the server.
**Impact**: Call 1 of sequential dispatch fails immediately. The entire flow is broken.
**Root cause**: Original validation assumed prompt is always non-empty. Command mode
uses prompt as command arguments, and some commands (`/prime`) take no arguments.

### Bug #2: Command mode missing no-timeout for planning (BLOCKER)

**Location**: `dispatch.ts:706`
**Code**: `if (mode === "agent" && args.taskType && NO_TIMEOUT_TASK_TYPES.has(args.taskType))`
**Problem**: The no-timeout override only triggers for `mode === "agent"`, but the 
sequential dispatch pattern uses `mode: "command"` with `taskType: "planning"`. So 
`/planning` via command mode gets `COMMAND_TIMEOUT_MS` (10 min).
**Impact**: `/planning` sessions that run 20-60+ minutes get killed at 10 min.
**Root cause**: When the no-timeout feature was added, only agent mode was considered.
Command mode was added later for sequential dispatch but the timeout logic wasn't updated.

### Bug #3: Redundant cascade resolution on Call 2 (DESIGN)

**Location**: `dispatch.ts:777-812` + `build.md:244-252`
**Problem**: When Call 2 passes `sessionId` with `taskType: "planning"` (cascade), 
`resolveCascadeToModel()` pings models again. This:
1. Adds ~15s latency for the unnecessary ping
2. Pollutes the session with "Respond with OK" / "OK" junk
3. Could resolve to a DIFFERENT model than Call 1 used (if availability changed), 
   breaking context continuity
**Impact**: Latency + potential model mismatch. Not a hard blocker but degrades reliability.
**Fix approach**: Update build.md Call 2 to pass explicit `provider`/`model` from Call 1's 
result. When explicit route is given, the cascade is bypassed entirely — no ping needed.

---

## Solution

### Fix #1: Allow empty prompt for command mode

```typescript
// BEFORE (line 713):
if (!args.prompt) {
  return "# Dispatch Error\n\nNo prompt provided."
}

// AFTER:
if (args.prompt == null) {
  return "# Dispatch Error\n\nNo prompt provided."
}
```

`== null` catches both `undefined` and `null` but allows `""` (empty string). This is 
the standard JavaScript pattern for "value was not provided" vs "value is empty".

### Fix #2: Extend no-timeout to command mode

```typescript
// BEFORE (line 706):
if (mode === "agent" && args.taskType && NO_TIMEOUT_TASK_TYPES.has(args.taskType)) {

// AFTER:
if ((mode === "agent" || mode === "command") && args.taskType && NO_TIMEOUT_TASK_TYPES.has(args.taskType)) {
```

Simple condition expansion. Command mode planning/execution sessions need the same 
no-timeout treatment as agent mode.

### Fix #3: Explicit model in Call 2

Update build.md Call 2 to extract provider/model from Call 1's result and pass them
explicitly, bypassing the cascade entirely:

```markdown
// BEFORE (Call 2 in build.md):
result2 = dispatch({
  mode: "command",
  command: "planning",
  prompt: "...",
  taskType: "planning",
  sessionId: sessionId,
})

// AFTER:
result2 = dispatch({
  mode: "command",
  command: "planning",
  prompt: "...",
  provider: provider,   // from Call 1 result
  model: model,         // from Call 1 result
  sessionId: sessionId, // from Call 1 result
})
```

When `provider`/`model` are explicit, `resolveRoute()` returns a `ModelRoute` (not cascade),
so the `isCascade` branch is never entered — no ping, no redundant resolution.

---

## Task Breakdown

Single task brief — all 3 fixes are tightly coupled in the same dispatch flow, and 
the code changes total ~5 lines.

| Task | Files | Changes |
|------|-------|---------|
| Task 1 | `dispatch.ts` (2 fixes) + `build.md` (1 fix) | 3 surgical edits |

---

## Validation Strategy

After all 3 fixes, test the ACTUAL dispatch tool (not raw API):

1. **Test Bug #1 fix**: Call dispatch with `prompt: ""`, `mode: "command"`, `command: "prime"` — should NOT return error
2. **Test Bug #2 fix**: Check that `timeoutMs` is 0 when `mode: "command"` + `taskType: "planning"`
3. **Test Bug #3 fix**: Verify build.md Call 2 passes explicit provider/model
4. **End-to-end**: Use dispatch tool for Call 1 (/prime) → extract sessionId + provider/model → Call 2 (/planning) with explicit route → verify plan artifacts created

---

## Task Brief Index

| Brief | Files | Status |
|-------|-------|--------|
| [task-1.md](./task-1.md) | `dispatch.ts` + `build.md` | Pending |
