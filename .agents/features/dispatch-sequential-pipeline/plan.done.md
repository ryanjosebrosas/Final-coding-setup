# Feature Plan: dispatch-sequential-pipeline

> **Feature**: `dispatch-sequential-pipeline`
> **Plan Path**: `.agents/features/dispatch-sequential-pipeline/plan.md`
> **Status**: Planning complete — ready for execution
> **Created**: 2026-03-02

---

## Problem Statement

The `/build` command cannot run `/prime` then `/planning` in the same OpenCode session.
Each `dispatch()` call creates a new session, so the model loses the context primed by
`/prime` before it reaches `/planning`. The current workaround — cramming both commands
into a single prompt ("Run /prime first. Then run /planning...") — fails because:

1. Multi-instruction prompts are unreliable — models may skip steps or truncate
2. The ollama-cloud models in T0 cascade positions 1-2 (kimi-k2-thinking, cogito-2.1) 
   output raw tool call tokens as literal text in agent mode — they cannot make actual 
   tool calls, making them useless for planning dispatch
3. Plan quality from dispatched `/planning` was below the 700-line minimum (455 lines 
   for plan.md, 368-549 lines for task briefs) because the dispatch prompt lacked 
   sufficient spec context

## Solution

Three coordinated changes across three files:

1. **dispatch.ts** — Add `dispatchSequential()` function + fix T0 planning cascade
2. **build.md** — Update Step 2 planning dispatch to use `dispatchSequential()` 
3. **model-strategy.md** — Fix false "agent mode works with ALL providers" claim + update T0 cascade

---

## Architecture

### dispatchSequential() Design

```
┌──────────────────────────────────────────────────┐
│ dispatchSequential(steps, options)                │
│                                                  │
│  1. Resolve cascade/model ONCE (shared session)  │
│  2. Create ONE session                           │
│  3. For each step:                               │
│     ├─ command step → dispatchCommand()          │
│     ├─ message step → dispatchText()             │
│     └─ agent step   → dispatchAgent()            │
│  4. Wait for completion before next step         │
│  5. Return all results + last text               │
└──────────────────────────────────────────────────┘
```

**Key design decisions:**
- One session, multiple messages — the session accumulates context across steps
- Model resolution happens ONCE at the start — all steps use the same model
- Per-step timeouts — `/prime` needs ~30s, `/planning` needs no timeout
- Steps can be `command` (slash command), `message` (text), or `agent` (subtask)
- The function is generic and reusable — not build-specific

### Updated T0 Cascade

```
BEFORE: kimi-k2-thinking → cogito-2.1:671b → qwen3-max → claude-opus-4-5
AFTER:  gpt-5.3-codex → qwen3-max → qwen3.5-plus → claude-opus-4-5
```

**Rationale:**
- kimi-k2-thinking and cogito-2.1 CANNOT do agent mode (output raw tool call tokens)
- gpt-5.3-codex is user's preferred planning model (Codex-first policy)
- qwen3-max and qwen3.5-plus are confirmed working in agent mode
- claude-opus-4-5 remains the paid last-resort

### Build.md Step 2 Update

The dispatch call changes from a single agent prompt to `dispatchSequential()`:

```
BEFORE:
dispatch({
  mode: "agent",
  prompt: "Run /prime first. Then run /planning {spec}...",
  taskType: "planning",
})

AFTER:
dispatchSequential({
  steps: [
    { type: "command", command: "prime", args: "", timeout: 60000 },
    { type: "command", command: "planning", args: "{spec} {spec-name} --auto-approve\n\n{full spec context}", timeout: 0 },
  ],
  taskType: "planning",
  description: "Plan {spec-name}",
})
```

The `/planning` step now includes the FULL spec context (description, acceptance criteria,
files touched, patterns from prior specs) inline in the args — not just the spec ID.

---

## Task Breakdown

| Task | File | Action | Lines Changed | Self-Contained |
|------|------|--------|---------------|----------------|
| Task 1 | `.opencode/tools/dispatch.ts` | UPDATE | ~150 new lines (types, function, cascade) | Yes — new types + function + cascade update |
| Task 2 | `.opencode/commands/build.md` | UPDATE | ~40 lines changed in Step 2 | Yes — references dispatchSequential from Task 1 |
| Task 3 | `.opencode/reference/model-strategy.md` | UPDATE | ~25 lines changed | Yes — documentation only |

**Execution order**: Task 1 → Task 2 → Task 3 (Task 2 depends on Task 1's types being defined; Task 3 is independent but logically last)

---

## Files Modified

### `.opencode/tools/dispatch.ts` (Task 1)

**Current state**: 829 lines. Contains:
- Types: `DispatchMode`, `ModelRoute`, `CascadeRoute`, `DispatchResult`, `SessionInfo`
- Server interaction: `checkServerHealth()`, `createSession()`, `extractTextFromParts()`, `extractContentFromParts()`
- Dispatch modes: `dispatchText()`, `dispatchAgent()`, `dispatchCommand()`
- Cascade: `dispatchCascade()`
- Route resolution: `resolveRoute()`
- Session management: `listSessions()`, `archiveSession()`, `archiveOldDispatches()`
- Tool export: single `dispatch` tool

**Changes needed**:
1. New types: `SequentialStep`, `SequentialStepResult`, `SequentialOptions`, `SequentialResult`
2. New function: `dispatchSequential()` (~80 lines)
3. Update T0 cascade at lines 104-112 (replace 4 models)
4. Export the new function (or expose via tool args — TBD in task brief)

### `.opencode/commands/build.md` (Task 2)

**Current state**: 926 lines. Step 2 (lines 186-251) dispatches planning via single agent prompt.

**Changes needed**:
1. Replace the agent dispatch code block (lines 216-222) with `dispatchSequential()` call
2. Add spec context gathering instructions before dispatch
3. Include full spec details in the `/planning` command args

### `.opencode/reference/model-strategy.md` (Task 3)

**Current state**: 199 lines.

**Changes needed**:
1. Line 13: Update T0 cascade in overview table 
2. Line 21: Update "Planning cascade" description
3. Line 38: Update T0 row in Task Type Routing table
4. Line 106: Fix false "Agent mode works with ALL providers" claim
5. Line 112: Fix "All (free and paid via OpenCode native tools)" in dispatch modes table

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| dispatchSequential creates session but first command fails | Medium | Low | Return partial results; build.md falls back to inline planning |
| gpt-5.3-codex unavailable/slow as T0 first choice | Low | Medium | Cascade falls through to qwen3-max (free) |
| Command mode API shape changes | Low | High | dispatchCommand already works — no API change needed |
| build.md Step 2 prompt too long for /planning args | Low | Medium | Spec context is ~20-30 lines; well within limits |

---

## Validation Strategy

### Per-Task Validation
- **Task 1**: TypeScript syntax check (no runtime available, but the file must parse cleanly). Manual review of types and function logic.
- **Task 2**: Read the updated Step 2 section and verify the dispatch call is syntactically correct and includes all required context.
- **Task 3**: Read the updated file and verify all 5 locations are corrected consistently.

### End-to-End Validation (post all tasks)
1. Start OpenCode server (`opencode serve`)
2. Create a test session manually
3. Send `/prime` via `POST /session/{id}/command` — verify it returns context
4. Send `/planning string-reverse` to the SAME session — verify plan artifacts are created
5. Check plan.md line count >= 700
6. Check task brief line counts >= 700

---

## Task Brief Index

| Brief | File | Status |
|-------|------|--------|
| [task-1.done.md](./task-1.done.md) | `.opencode/tools/dispatch.ts` — Add `dispatchSequential()` + fix T0 cascade | Done |
| [task-2.done.md](./task-2.done.md) | `.opencode/commands/build.md` — Update Step 2 planning dispatch | Done |
| [task-3.done.md](./task-3.done.md) | `.opencode/reference/model-strategy.md` — Fix docs + update T0 | Done |

---

## Dependencies

- **Upstream**: `dispatch-agent-response-fix` (commit `2b4cf05`) — already merged. Provides `extractContentFromParts()` and improved `getSessionLastResponse()`.
- **Downstream**: P1-01 string-reverse execution via `/build` — this feature unblocks autonomous planning dispatch.

---

## Design Decisions

1. **Generic function, not build-specific**: `dispatchSequential()` is a reusable primitive. Any command that needs multi-step same-session dispatch can use it. This avoids build-specific hacks.

2. **Command mode for slash commands, not agent mode**: Prior testing showed that `POST /session/{id}/command` is the reliable way to run slash commands. Agent mode with "Run /planning..." prompts is unreliable.

3. **Cascade resolution once**: The cascade picks the first working model once, then uses it for ALL steps. We don't want step 1 using kimi and step 2 using codex — that would lose session context.

4. **Codex-first cascade**: User explicitly requested `gpt-5.3-codex` as primary planning model. It's paid but cheap relative to opus, and produces better plans.

5. **Spec context in /planning args**: The prior failure was plan quality. The fix is to pass full spec details (acceptance criteria, files touched, patterns) so the model has everything it needs without having to discover it.

---

## Glossary

- **dispatchSequential()**: New function that creates one session and sends multiple commands/messages in order
- **T0 cascade**: The model fallback chain for planning tasks (thinking models preferred)
- **command mode**: Dispatch mode that sends a slash command via `POST /session/{id}/command`
- **agent mode**: Dispatch mode that creates a subtask with full tool access
- **spec context**: The description, acceptance criteria, files touched, and patterns for a BUILD_ORDER spec
