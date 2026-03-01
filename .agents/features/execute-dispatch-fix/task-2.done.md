# Task 2 of 2: Update build.md Step 5 to sequential two-call pattern

> **Feature**: `execute-dispatch-fix`
> **Brief Path**: `.agents/features/execute-dispatch-fix/task-2.md`
> **Plan Overview**: `.agents/features/execute-dispatch-fix/plan.md`

---

## OBJECTIVE

Update `.opencode/commands/build.md` Step 5 (Execute All Briefs) to replace the single agent-mode prompt dispatch with the proven sequential two-call command-mode pattern from Step 2, for both Task Brief Mode and Master Plan Mode.

---

## SCOPE

**Files This Task Touches:**

| File | Action | What Changes |
|------|--------|-------------|
| `.opencode/commands/build.md` | UPDATE | Step 5 Task Brief Mode dispatch (lines 392-410) |
| `.opencode/commands/build.md` | UPDATE | Step 5 Master Plan Mode dispatch (lines 427-445) |

**Out of Scope:**
- Step 2 (planning dispatch) — already correct, this is our reference
- Steps 1, 3, 4, 6, 7 — not affected
- dispatch.ts — handled in task-1

---

## PRIOR TASK CONTEXT

### From Task 1
- `dispatchCommand()` now uses `extractContentFromParts()` + `getSessionLastResponse()` fallback
- `dispatchCommand()` now has `if (timeoutMs > 0)` timeout guard
- The command mode dispatch should now correctly return text from `/execute` responses

---

## CONTEXT REFERENCES

### Current Content: Step 2 planning dispatch (lines 228-267) — THE WORKING PATTERN

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

   **Call 2: Run planning in the SAME session (explicit model — no cascade)**
   ```
   result2 = dispatch({
     mode: "command",
     command: "planning",
     prompt: "{spec-name} --auto-approve\n\nSpec Context:\n{specContext}",
     provider: provider,   // from Call 1
     model: model,         // from Call 1
     sessionId: sessionId, // from Call 1
     description: "Plan {spec-name}",
   })
   ```
```

### Current Content: Step 5 Task Brief Mode dispatch (lines 392-410) — TO REPLACE

```markdown
1. **Dispatch or execute one brief:**

   **If dispatch available:**
   ```
   dispatch({
     mode: "agent",
     prompt: "Run /prime first. Then run /execute .agents/features/{spec-name}/plan.md",
     taskType: "execution",
     timeout: 900,
   })
   ```

   **If dispatch unavailable:**
   Run `/execute .agents/features/{spec-name}/plan.md` inline. `/execute` auto-detects the next undone brief by scanning for `task-{N}.done.md` files.

   **If dispatch fails or times out:**
   - Fall back to the "If dispatch unavailable" path (run `/execute` inline).
   - Log: "Dispatch timed out for execution — falling back to inline execution."
   - If inline execution also fails: STOP, report the error.
```

### Current Content: Step 5 Master Plan Mode dispatch (lines 427-445) — TO REPLACE

```markdown
1. **Dispatch or execute one phase:**

   **If dispatch available:**
   ```
   dispatch({
     mode: "agent",
     prompt: "Run /prime first. Then run /execute .agents/features/{spec-name}/plan-master.md",
     taskType: "execution",
     timeout: 900,
   })
   ```

   **If dispatch unavailable:**
   Run `/execute .agents/features/{spec-name}/plan-master.md` inline. `/execute` auto-detects the next undone phase by scanning for `plan-phase-{N}.done.md` files.

   **If dispatch fails or times out:**
   - Fall back to the "If dispatch unavailable" path (run `/execute` inline).
   - Log: "Dispatch timed out for execution — falling back to inline execution."
   - If inline execution also fails: STOP, report the error.
```

---

## STEP-BY-STEP TASKS

### Step 1: UPDATE Step 5 Task Brief Mode dispatch

**What**: Replace single agent-mode dispatch with sequential two-call command-mode pattern.

**Current** (lines 392-410):
```markdown
1. **Dispatch or execute one brief:**

   **If dispatch available:**
   ```
   dispatch({
     mode: "agent",
     prompt: "Run /prime first. Then run /execute .agents/features/{spec-name}/plan.md",
     taskType: "execution",
     timeout: 900,
   })
   ```

   **If dispatch unavailable:**
   Run `/execute .agents/features/{spec-name}/plan.md` inline. `/execute` auto-detects the next undone brief by scanning for `task-{N}.done.md` files.

   **If dispatch fails or times out:**
   - Fall back to the "If dispatch unavailable" path (run `/execute` inline).
   - Log: "Dispatch timed out for execution — falling back to inline execution."
   - If inline execution also fails: STOP, report the error.
```

**Replace with**:
```markdown
1. **Dispatch or execute one brief:**

   **If dispatch available — use sequential dispatch (two calls, same session):**

   **Call 1: Prime the session**
   ```
   result1 = dispatch({
     mode: "command",
     command: "prime",
     prompt: " ",
     taskType: "execution",
     description: "Prime for {spec-name} execution",
   })
   // Extract from result1 output:
   //   **Session ID**: `{id}`        → sessionId
   //   **Model**: LABEL (`prov/mod`) → provider, model
   sessionId = extractSessionId(result1)
   provider = extractProvider(result1)
   model = extractModel(result1)
   ```

   **Call 2: Execute in the SAME session (explicit model — no routing)**
   ```
   result2 = dispatch({
     mode: "command",
     command: "execute",
     prompt: ".agents/features/{spec-name}/plan.md",
     provider: provider,   // from Call 1 — ensures same model handles both
     model: model,         // from Call 1 — bypasses routing table
     sessionId: sessionId, // from Call 1 — reuses the primed session
     description: "Execute {spec-name}",
     timeout: 0,           // no timeout — execution runs until done
   })
   ```

   **Why two calls**: A single prompt ("Run /prime then /execute...") is unreliable — models skip steps. Two explicit command dispatches with shared sessionId ensures both run in order with accumulated context.

   **If dispatch unavailable:**
   Run `/execute .agents/features/{spec-name}/plan.md` inline. `/execute` auto-detects the next undone brief by scanning for `task-{N}.done.md` files.

   **If dispatch fails (either call):**
   - If Call 1 (`/prime`) fails: Fall back to inline execution.
   - If Call 2 (`/execute`) fails: Retry once with a new session (Call 1 + Call 2). If retry also fails, fall back to inline execution.
   - Log: "Dispatch failed for execution {spec-name} — falling back to inline execution."
```

---

### Step 2: UPDATE Step 5 Master Plan Mode dispatch

**What**: Apply the same two-call pattern to Master Plan Mode.

**Current** (lines 427-445):
```markdown
1. **Dispatch or execute one phase:**

   **If dispatch available:**
   ```
   dispatch({
     mode: "agent",
     prompt: "Run /prime first. Then run /execute .agents/features/{spec-name}/plan-master.md",
     taskType: "execution",
     timeout: 900,
   })
   ```

   **If dispatch unavailable:**
   Run `/execute .agents/features/{spec-name}/plan-master.md` inline. `/execute` auto-detects the next undone phase by scanning for `plan-phase-{N}.done.md` files.

   **If dispatch fails or times out:**
   - Fall back to the "If dispatch unavailable" path (run `/execute` inline).
   - Log: "Dispatch timed out for execution — falling back to inline execution."
   - If inline execution also fails: STOP, report the error.
```

**Replace with**:
```markdown
1. **Dispatch or execute one phase:**

   **If dispatch available — use sequential dispatch (two calls, same session):**

   **Call 1: Prime the session**
   ```
   result1 = dispatch({
     mode: "command",
     command: "prime",
     prompt: " ",
     taskType: "execution",
     description: "Prime for {spec-name} phase execution",
   })
   sessionId = extractSessionId(result1)
   provider = extractProvider(result1)
   model = extractModel(result1)
   ```

   **Call 2: Execute in the SAME session (explicit model — no routing)**
   ```
   result2 = dispatch({
     mode: "command",
     command: "execute",
     prompt: ".agents/features/{spec-name}/plan-master.md",
     provider: provider,
     model: model,
     sessionId: sessionId,
     description: "Execute {spec-name} phase",
     timeout: 0,
   })
   ```

   **If dispatch unavailable:**
   Run `/execute .agents/features/{spec-name}/plan-master.md` inline. `/execute` auto-detects the next undone phase by scanning for `plan-phase-{N}.done.md` files.

   **If dispatch fails (either call):**
   - If Call 1 (`/prime`) fails: Fall back to inline execution.
   - If Call 2 (`/execute`) fails: Retry once with a new session (Call 1 + Call 2). If retry also fails, fall back to inline execution.
   - Log: "Dispatch failed for execution {spec-name} — falling back to inline execution."
```

---

## ACCEPTANCE CRITERIA

- [x] Step 5 Task Brief Mode uses two-call sequential command-mode dispatch
- [x] Step 5 Master Plan Mode uses two-call sequential command-mode dispatch
- [x] Both use `mode: "command"` (not agent)
- [x] Both use `sessionId` from Call 1 in Call 2
- [x] Both use explicit `provider` + `model` from Call 1
- [x] Both use `timeout: 0` in Call 2
- [x] Fallback paths preserved
- [x] No changes to Steps 1-4, 6-7

---

## COMPLETION CHECKLIST

- [x] Step 1 completed (Task Brief Mode)
- [x] Step 2 completed (Master Plan Mode)
- [x] All acceptance criteria checked
- [x] Brief marked done: `task-2.md` → `task-2.done.md`
