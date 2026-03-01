# Task 1 of 1: Fix Sequential Dispatch Bugs

> **Feature**: `dispatch-sequential-bugfixes`
> **Brief Path**: `.agents/features/dispatch-sequential-bugfixes/task-1.md`
> **Plan Overview**: `.agents/features/dispatch-sequential-bugfixes/plan.md`

---

## OBJECTIVE

Fix three bugs in the dispatch tool that break the sequential dispatch flow: empty prompt
validation blocking `/prime`, missing no-timeout for command mode planning, and redundant
cascade resolution on the second call.

---

## SCOPE

**Files This Task Touches:**

| File | Action | What Changes |
|------|--------|-------------|
| `.opencode/tools/dispatch.ts` | UPDATE | Fix line 713 (prompt validation) and line 706 (timeout condition) |
| `.opencode/commands/build.md` | UPDATE | Update Call 2 to pass explicit provider/model instead of taskType cascade |

**Out of Scope:**
- model-strategy.md — no changes needed
- Any new functions or types — these are one-line fixes
- The `resolveCascadeToModel()` function itself — it stays for other use cases

**Dependencies:**
- None — builds on the already-modified files from dispatch-sequential-pipeline

---

## PRIOR TASK CONTEXT

This is the first (and only) task. The files were last modified by the 
`dispatch-sequential-pipeline` feature execution which added `sessionId`, 
`resolveCascadeToModel()`, and the T0 cascade fix. Those changes are in the working 
tree (not yet committed).

---

## CONTEXT REFERENCES

### Files to Read

- `.opencode/tools/dispatch.ts` (lines 700-715) — Bug #1 and #2 location
- `.opencode/tools/dispatch.ts` (lines 774-812) — Bug #3 context (cascade+sessionId branch)
- `.opencode/commands/build.md` (lines 230-252) — Call 1 and Call 2 that need updating

### Current Content: Prompt Validation (Lines 712-715)

```typescript
    // ── 1. Validate inputs ──
    if (!args.prompt) {
      return "# Dispatch Error\n\nNo prompt provided."
    }
```

**Analysis**: `!""` is `true` in JavaScript. `/prime` has empty arguments, so `prompt: ""`
gets rejected. Need `== null` which catches undefined/null but allows empty string.

### Current Content: Timeout Override (Lines 704-710)

```typescript
    // Planning and execution sessions are long-running (20-60+ min).
    // Override to no-timeout so AbortSignal doesn't kill them.
    if (mode === "agent" && args.taskType && NO_TIMEOUT_TASK_TYPES.has(args.taskType)) {
      defaultTimeout = AGENT_SESSION_NO_TIMEOUT
    }

    const timeoutMs = args.timeout ?? defaultTimeout
```

**Analysis**: Condition only checks `mode === "agent"`. Sequential dispatch uses 
`mode: "command"` with `taskType: "planning"`. Need to include `mode === "command"`.

### Current Content: Build.md Call 2 (Lines 243-252)

```markdown
   **Call 2: Run planning in the SAME session**
   ```
   result2 = dispatch({
     mode: "command",
     command: "planning",
     prompt: "{spec-name} --auto-approve\n\nSpec Context:\n{specContext}",
     taskType: "planning",
     sessionId: sessionId,
     description: "Plan {spec-name}",
   })
   ```
```

**Analysis**: Uses `taskType: "planning"` which triggers cascade resolution. Should use
explicit `provider`/`model` extracted from Call 1's result to bypass cascade entirely.

### Current Content: Build.md Call 1 (Lines 230-241)

```markdown
   **Call 1: Prime the session**
   ```
   result1 = dispatch({
     mode: "command",
     command: "prime",
     prompt: "",
     taskType: "planning",
     description: "Prime for {spec-name}",
   })
   // Extract session ID from result1 output: **Session ID**: `{id}`
   sessionId = extractSessionId(result1)
   ```
```

**Analysis**: Call 1 also needs to extract `provider` and `model` from the result output
(the `**Model**` line) so Call 2 can pass them explicitly.

### Current Content: Dispatch Output Format (Lines 907-913)

```typescript
    const meta = [
      `**Model**: ${result.label} (\`${result.provider}/${result.model}\`)`,
      `**Mode**: ${result.mode}`,
      `**Route**: ${resolved.source}`,
      `**Latency**: ${(result.latencyMs / 1000).toFixed(1)}s`,
      `**Session**: ${result.sessionId}`,
      `**Session ID**: \`${result.sessionId}\``,
    ]
```

**Analysis**: The output already includes `**Model**: LABEL (\`provider/model\`)`. The
build.md instructions need to tell the model to extract provider and model from this line.

### Patterns to Follow

**Null check pattern** (standard JavaScript):
```typescript
// Catches undefined and null, allows "" (empty string), 0, false
if (value == null) { ... }
```
- Why: The `== null` idiom is well-established for "was the value provided at all?"
- How to apply: Replace `!args.prompt` with `args.prompt == null`

**Compound condition pattern** (from dispatch.ts:700-702):
```typescript
let defaultTimeout = mode === "command" ? COMMAND_TIMEOUT_MS
  : mode === "agent" ? AGENT_TIMEOUT_MS
  : TEXT_TIMEOUT_MS
```
- Why: Shows how mode checks are done in this file — string equality
- How to apply: Add `mode === "command"` with `||` to the existing condition

---

## STEP-BY-STEP TASKS

---

### Step 1: FIX `.opencode/tools/dispatch.ts` — Empty Prompt Validation

**What**: Allow empty string prompts so `/prime` with `prompt: ""` works in command mode.

**IMPLEMENT**:

Current (line 713 of `.opencode/tools/dispatch.ts`):
```typescript
    if (!args.prompt) {
```

Replace with:
```typescript
    if (args.prompt == null) {
```

**PATTERN**: Standard JavaScript null check — `== null` catches undefined/null, allows `""`

**IMPORTS**: N/A

**GOTCHA**: Must be `== null` (loose equality), NOT `=== null`. Loose equality catches both
`undefined` and `null`. Strict equality (`=== null`) would miss `undefined`.

**VALIDATE**:
```bash
grep -n "args.prompt ==" .opencode/tools/dispatch.ts
# Should show: if (args.prompt == null) {
# Should NOT show: if (!args.prompt)
```

---

### Step 2: FIX `.opencode/tools/dispatch.ts` — Command Mode No-Timeout

**What**: Extend the no-timeout override to include command mode, so `/planning` via 
command dispatch doesn't get killed at 10 minutes.

**IMPLEMENT**:

Current (line 706 of `.opencode/tools/dispatch.ts`):
```typescript
    if (mode === "agent" && args.taskType && NO_TIMEOUT_TASK_TYPES.has(args.taskType)) {
```

Replace with:
```typescript
    if ((mode === "agent" || mode === "command") && args.taskType && NO_TIMEOUT_TASK_TYPES.has(args.taskType)) {
```

**PATTERN**: Same compound condition style as lines 700-702

**IMPORTS**: N/A

**GOTCHA**: The parentheses around `(mode === "agent" || mode === "command")` are critical.
Without them, operator precedence makes `&&` bind tighter than `||`, producing a wrong 
condition: `mode === "agent" && ... || mode === "command"` which always allows command mode
regardless of taskType.

**VALIDATE**:
```bash
grep -n "mode === .command." .opencode/tools/dispatch.ts | head -5
# Should show the updated timeout condition with || mode === "command"
```

---

### Step 3: UPDATE `.opencode/commands/build.md` — Extract Model from Call 1

**What**: Update Call 1 instructions to also extract provider and model from the result.

**IMPLEMENT**:

Current (lines 230-241 of `.opencode/commands/build.md`):
```markdown
   **Call 1: Prime the session**
   ```
   result1 = dispatch({
     mode: "command",
     command: "prime",
     prompt: "",
     taskType: "planning",
     description: "Prime for {spec-name}",
   })
   // Extract session ID from result1 output: **Session ID**: `{id}`
   sessionId = extractSessionId(result1)
   ```
```

Replace with:
```markdown
   **Call 1: Prime the session**
   ```
   result1 = dispatch({
     mode: "command",
     command: "prime",
     prompt: "",
     taskType: "planning",
     description: "Prime for {spec-name}",
   })
   // Extract from result1 output:
   //   **Session ID**: `{id}`        → sessionId
   //   **Model**: LABEL (`prov/mod`) → provider, model
   sessionId = extractSessionId(result1)
   provider = extractProvider(result1)   // e.g., "bailian-coding-plan-test"
   model = extractModel(result1)         // e.g., "qwen3-max-2026-01-23"
   ```
```

**PATTERN**: Existing pseudo-code style in build.md

**IMPORTS**: N/A

**GOTCHA**: The `extractProvider` and `extractModel` are pseudo-functions — the executing 
model parses the `**Model**: LABEL (\`provider/model\`)` line from the dispatch output.

**VALIDATE**:
```bash
grep "extractProvider\|extractModel" .opencode/commands/build.md
# Should show both extraction pseudo-functions
```

---

### Step 4: UPDATE `.opencode/commands/build.md` — Explicit Route in Call 2

**What**: Update Call 2 to use explicit provider/model from Call 1 instead of taskType 
cascade, eliminating the redundant cascade resolution.

**IMPLEMENT**:

Current (lines 243-252 of `.opencode/commands/build.md`):
```markdown
   **Call 2: Run planning in the SAME session**
   ```
   result2 = dispatch({
     mode: "command",
     command: "planning",
     prompt: "{spec-name} --auto-approve\n\nSpec Context:\n{specContext}",
     taskType: "planning",
     sessionId: sessionId,
     description: "Plan {spec-name}",
   })
   ```
```

Replace with:
```markdown
   **Call 2: Run planning in the SAME session (explicit model — no cascade)**
   ```
   result2 = dispatch({
     mode: "command",
     command: "planning",
     prompt: "{spec-name} --auto-approve\n\nSpec Context:\n{specContext}",
     provider: provider,   // from Call 1 — ensures same model handles both commands
     model: model,         // from Call 1 — bypasses cascade (no redundant ping)
     sessionId: sessionId, // from Call 1 — reuses the primed session
     description: "Plan {spec-name}",
   })
   ```

   **Why explicit provider/model**: Call 1 already resolved the cascade and found a working
   model. Passing it explicitly in Call 2 avoids a redundant cascade resolution ping, 
   eliminates the risk of model mismatch, and saves ~15s latency.
```

**PATTERN**: Existing dispatch call pattern in build.md

**IMPORTS**: N/A

**GOTCHA**: Removed `taskType: "planning"` and replaced with `provider`/`model`. When both 
`provider` and `model` are explicit, `resolveRoute()` returns them directly without 
consulting the TASK_ROUTES table — cascade is bypassed entirely.

**VALIDATE**:
```bash
grep -A 8 "Call 2:" .opencode/commands/build.md
# Should show provider: provider, model: model — NOT taskType: "planning"
```

---

### Step 5: UPDATE `.opencode/commands/build.md` — Update Sequential Dispatch Explanation

**What**: Update the "Why sequential dispatch" explanation to mention explicit model passing.

**IMPLEMENT**:

Current (line 257 of `.opencode/commands/build.md`):
```markdown
   **Why sequential dispatch**: A single prompt with "Run /prime first, then /planning..." is unreliable — models skip steps or truncate. Two explicit command dispatches with shared sessionId ensures both commands run in order with accumulated context.
```

Replace with:
```markdown
   **Why sequential dispatch**: A single prompt with "Run /prime first, then /planning..." is unreliable — models skip steps or truncate. Two explicit command dispatches with shared sessionId ensures both commands run in order with accumulated context. Call 2 passes the exact provider/model from Call 1 to guarantee the same model handles the full session.
```

**PATTERN**: Same paragraph style

**IMPORTS**: N/A

**GOTCHA**: Keep it on one line (it's a markdown paragraph).

**VALIDATE**:
```bash
grep "same model handles" .opencode/commands/build.md
# Should show the updated explanation
```

---

## TESTING STRATEGY

### Unit Tests

No unit tests — tool files have no test runner. Covered by manual validation.

### Integration Tests

End-to-end test using the dispatch tool (not raw API):
1. Dispatch `/prime` with `prompt: ""` — verify it doesn't error
2. Extract sessionId + provider + model from result
3. Dispatch `/planning` with explicit provider/model + sessionId — verify it works
4. Check plan artifacts created

### Edge Cases

- `prompt: undefined` (no prompt arg at all) — should still return error
- `prompt: null` — should still return error  
- `prompt: ""` — should be ALLOWED (the fix)
- `prompt: " "` (whitespace) — should be allowed (it's a string with content)
- `mode: "command"` + `taskType: "planning"` — should get no-timeout (0)
- `mode: "command"` + `taskType: "boilerplate"` — should get normal command timeout (10min)
- `mode: "text"` + `taskType: "planning"` — should get normal text timeout (2min) — text mode doesn't need no-timeout

---

## VALIDATION COMMANDS

### Level 1: Syntax & Style
```bash
# Verify file is syntactically valid
wc -l .opencode/tools/dispatch.ts
# Should be 924 lines (same count — we're changing lines, not adding)
```

### Level 5: Manual Validation

1. **Bug #1 fix**: Open dispatch.ts, find the prompt validation — verify `args.prompt == null`
2. **Bug #2 fix**: Find the timeout override — verify `(mode === "agent" || mode === "command")`
3. **Bug #3 fix**: Open build.md, find Call 2 — verify `provider: provider, model: model` instead of `taskType: "planning"`
4. **End-to-end test**: Use dispatch tool with `prompt: ""`, `command: "prime"`, `mode: "command"`, `taskType: "planning"` — verify it returns a result (not an error)

---

## ACCEPTANCE CRITERIA

### Implementation (verify during execution)

- [x] `dispatch.ts:713`: `!args.prompt` changed to `args.prompt == null`
- [x] `dispatch.ts:706`: `mode === "agent"` changed to `(mode === "agent" || mode === "command")`
- [x] `build.md` Call 1: Extracts provider and model from result (extractProvider, extractModel)
- [x] `build.md` Call 2: Uses `provider: provider, model: model` instead of `taskType: "planning"`
- [x] `build.md` Call 2: Has `sessionId: sessionId`
- [x] `build.md` Why block mentions "same model handles the full session"
- [x] No other lines changed in dispatch.ts
- [x] File line counts unchanged (surgical edits)

### Runtime (verify after testing/deployment)

- [ ] `/prime` with `prompt: ""` via dispatch tool succeeds
- [ ] `/planning` via command mode gets no-timeout (timeoutMs === 0)
- [ ] Sequential dispatch Call 1 → Call 2 works end-to-end
- [ ] Plan artifacts created successfully

---

## COMPLETION CHECKLIST

- [x] All steps completed in order
- [x] Each step's VALIDATE command executed and passed
- [x] All validation levels run
- [x] Implementation acceptance criteria all checked
- [x] No regressions
- [x] Brief marked done: rename `task-1.md` → `task-1.done.md`

---

## NOTES

### Key Design Decisions

- **`== null` vs `=== undefined`**: `== null` is the idiomatic JS pattern for "not provided". It catches both `undefined` (arg not passed) and `null` (explicitly null) while allowing all truthy and falsy strings including `""`.
- **No code change for Bug #3**: The fix is purely in build.md instructions. The `resolveCascadeToModel()` function stays — it's still useful for cases where sessionId is reused without knowing which model to use. But for the `/build` flow, explicit model passing is cleaner.

---

> **Reminder**: Mark this brief done after execution:
> Rename `task-1.md` → `task-1.done.md`
