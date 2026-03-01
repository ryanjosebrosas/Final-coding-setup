# Task 1 of 1: Fix Agent Response Extraction Chain

> **Feature**: `dispatch-agent-response-fix`
> **Brief Path**: `.agents/features/dispatch-agent-response-fix/task-1.md`
> **Plan Overview**: `.agents/features/dispatch-agent-response-fix/plan.md`

---

## OBJECTIVE

Fix `dispatchAgent()` response extraction in `.opencode/tools/dispatch.ts` so that
agent sessions that complete successfully return their actual output text instead of
`null`.

---

## SCOPE

**Files This Task Touches:**

| File | Action | What Changes |
|------|--------|-------------|
| `.opencode/tools/dispatch.ts` | UPDATE | Add `extractContentFromParts()`, update `getSessionLastResponse()`, add error checking in `dispatchAgent()`, update stale description |

**Out of Scope:**
- `dispatchCommand()` — dead code, no files use `mode: "command"`
- `dispatchText()` — already works correctly
- `dispatchCascade()` — calls `dispatchAgent()`, will benefit automatically from the fix
- `batch-dispatch` tool (`.opencode/tools/batch-dispatch.ts`) — separate tool, not affected
- `council` tool (`.opencode/tools/council.ts`) — separate tool, not affected
- Routing table changes — model routes are correct, the bug is in response extraction

**Dependencies:**
- None — this is the first and only task

---

## PRIOR TASK CONTEXT

This is the first task — no prior work. Start fresh from the codebase state.

---

## CONTEXT REFERENCES

### File: `.opencode/tools/dispatch.ts` (777 lines total)

**Full current content of functions being modified:**

#### `extractTextFromParts()` — lines 211-215

```typescript
function extractTextFromParts(data: any): string | null {
  const textParts = data?.parts?.filter((p: any) => p.type === "text") || []
  const text = textParts.map((p: any) => p.text).join("\n")
  return text || null
}
```

This function is used by `dispatchText()`, `dispatchAgent()`, and `getSessionLastResponse()`.
We will NOT modify this function — it remains correct for text-mode dispatch.
We will ADD a new broader function alongside it.

#### `dispatchAgent()` — lines 264-307

```typescript
async function dispatchAgent(
  sessionId: string,
  provider: string,
  model: string,
  prompt: string,
  description: string,
  timeoutMs: number,
): Promise<string | null> {
  try {
    // timeoutMs === 0 means no timeout — session runs until completion.
    // Used for planning/execution sessions that can take 20-60+ minutes.
    const fetchOptions: RequestInit = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: { providerID: provider, modelID: model }, // top-level model routes the message
        parts: [{
          type: "subtask",
          prompt,
          description,
          agent: "general",
          model: { providerID: provider, modelID: model }, // subtask part model (for child agent)
        }],
      }),
    }
    if (timeoutMs > 0) {
      fetchOptions.signal = AbortSignal.timeout(timeoutMs)
    }
    const response = await fetch(`${OPENCODE_URL}/session/${sessionId}/message`, fetchOptions)
    if (!response.ok) return null
    const data = await response.json()
    // Try extracting text directly from response parts
    const text = extractTextFromParts(data)
    if (text) return text
    // If response contains subtask parts, the result is in the child session
    const subtaskParts = data?.parts?.filter((p: any) => p.type === "subtask") || []
    if (subtaskParts.length > 0 && subtaskParts[0].sessionID) {
      return await getSessionLastResponse(subtaskParts[0].sessionID)
    }
    return null
  } catch {
    return null
  }
}
```

#### `getSessionLastResponse()` — lines 309-327

```typescript
async function getSessionLastResponse(sessionId: string): Promise<string | null> {
  try {
    const response = await fetch(
      `${OPENCODE_URL}/session/${sessionId}/message?limit=5`,
      { signal: AbortSignal.timeout(10_000) },
    )
    if (!response.ok) return null
    const messages = await response.json()
    if (!Array.isArray(messages) || messages.length === 0) return null
    // Get the last assistant message with text content
    for (let i = messages.length - 1; i >= 0; i--) {
      const text = extractTextFromParts(messages[i])
      if (text) return text
    }
    return null
  } catch {
    return null
  }
}
```

#### Stale timeout description — lines 579-585

```typescript
    timeout: tool.schema
      .number()
      .optional()
      .describe(
        "Custom timeout in ms. Defaults: text=120000, agent=300000, command=600000. " +
        "For long tasks: 900000 (15min) for planning/execution.",
      ),
```

#### Constants at top of file — lines 8-13

```typescript
const TEXT_TIMEOUT_MS = 120_000      // 2 min — text mode (reviews, analysis)
const AGENT_TIMEOUT_MS = 300_000     // 5 min — agent mode (default)
const AGENT_LONG_TIMEOUT_MS = 900_000 // 15 min — agent mode (complex tasks)
const AGENT_SESSION_NO_TIMEOUT = 0   // No timeout — planning/execution sessions run until done
const CASCADE_TIMEOUT_MS = 30_000    // 30 sec — per cascade attempt (text mode)
const COMMAND_TIMEOUT_MS = 600_000   // 10 min — command mode (full command execution)
```

### Full `dispatchCascade()` — dispatch.ts:374-427

This function calls `dispatchAgent()` and checks the return. The cascade bug is here:

```typescript
async function dispatchCascade(
  sessionId: string,
  cascade: CascadeRoute,
  prompt: string,
  mode: DispatchMode,
  description: string,
  command?: string,
  commandArgs?: string,
  taskType?: string,
): Promise<DispatchResult | null> {
  for (let i = 0; i < cascade.models.length; i++) {
    const route = cascade.models[i]
    const start = Date.now()
    let text: string | null = null

    if (mode === "command" && command) {
      text = await dispatchCommand(
        sessionId, route.provider, route.model,
        command, commandArgs || "", COMMAND_TIMEOUT_MS,
      )
    } else if (mode === "agent") {
      const agentTimeout = taskType && NO_TIMEOUT_TASK_TYPES.has(taskType)
        ? AGENT_SESSION_NO_TIMEOUT
        : AGENT_LONG_TIMEOUT_MS
      text = await dispatchAgent(
        sessionId, route.provider, route.model,
        prompt, description, agentTimeout,
      )
    } else {
      text = await dispatchText(
        sessionId, route.provider, route.model,
        prompt, CASCADE_TIMEOUT_MS,
      )
    }

    const latencyMs = Date.now() - start

    if (text) {
      return {
        text,
        provider: route.provider,
        model: route.model,
        label: route.label,
        mode,
        latencyMs,
        sessionId,
        cascadeAttempts: i + 1,
      }
    }
    // Model failed — try next in cascade
  }
  return null
}
```

The `if (text)` gate at line 412 is where the bug manifests in cascade mode.
When `dispatchAgent()` returns null, the cascade moves to the next model even
though the first model succeeded. We do NOT modify this function — fixing
`dispatchAgent()` and `getSessionLastResponse()` fixes the cascade automatically.

### Full `execute()` dispatch section — dispatch.ts:664-741

```typescript
    // ── 5. Dispatch ──
    const start = Date.now()
    let result: DispatchResult | null = null

    if (isCascade) {
      result = await dispatchCascade(
        sessionId,
        resolved.route as CascadeRoute,
        args.prompt,
        mode,
        taskDescription,
        args.command,
        args.prompt,
        args.taskType,
      )
    } else {
      const route = resolved.route as ModelRoute
      let text: string | null = null

      if (mode === "command" && args.command) {
        text = await dispatchCommand(
          sessionId, route.provider, route.model,
          args.command, args.prompt, timeoutMs,
        )
      } else if (mode === "agent") {
        text = await dispatchAgent(
          sessionId, route.provider, route.model,
          args.prompt, taskDescription, timeoutMs,
        )
      } else {
        text = await dispatchText(
          sessionId, route.provider, route.model,
          args.prompt, timeoutMs,
        )
      }

      if (text) {
        result = {
          text,
          provider: route.provider,
          model: route.model,
          label: route.label,
          mode,
          latencyMs: Date.now() - start,
          sessionId,
        }
      } else if (resolved.source !== "explicit") {
        let fallbackText: string | null = null
        if (mode === "command" && args.command) {
          fallbackText = await dispatchCommand(
            sessionId, FALLBACK_ROUTE.provider, FALLBACK_ROUTE.model,
            args.command, args.prompt, timeoutMs,
          )
        } else if (mode === "agent") {
          fallbackText = await dispatchAgent(
            sessionId, FALLBACK_ROUTE.provider, FALLBACK_ROUTE.model,
            args.prompt, taskDescription, timeoutMs,
          )
        } else {
          fallbackText = await dispatchText(
            sessionId, FALLBACK_ROUTE.provider, FALLBACK_ROUTE.model,
            args.prompt, timeoutMs,
          )
        }
        if (fallbackText) {
          result = {
            text: fallbackText,
            provider: FALLBACK_ROUTE.provider,
            model: FALLBACK_ROUTE.model,
            label: FALLBACK_ROUTE.label,
            mode,
            latencyMs: Date.now() - start,
            sessionId,
          }
        }
      }
    }
```

Same pattern — the `if (text)` / `if (fallbackText)` gates depend on
`dispatchAgent()` returning non-null. We do NOT modify `execute()` either.

### SDK Part Types (for reference — from `@opencode-ai/sdk`)

The `Part` union:
```typescript
export type Part = TextPart | SubtaskPart | ReasoningPart | FilePart | ToolPart
    | StepStartPart | StepFinishPart | SnapshotPart | PatchPart | AgentPart
    | RetryPart | CompactionPart;
```

Content-bearing types:
```typescript
// TextPart — primary content
{ type: "text", text: string, id: string, sessionID: string, messageID: string }

// ToolPart — tool call with output
{ type: "tool", id: string, sessionID: string, messageID: string,
  state: { status: "pending"|"running"|"completed"|"error", output?: string } }

// ReasoningPart — model reasoning
{ type: "reasoning", text: string, id: string, sessionID: string, messageID: string }
```

Non-content types (skip these):
```typescript
// StepStartPart, StepFinishPart — agent step markers (metadata only)
// SnapshotPart, PatchPart — file diffs (not human-readable output)
// AgentPart — agent lifecycle events
// RetryPart, CompactionPart — internal bookkeeping
// FilePart — file attachments
// SubtaskPart — child session reference (handled separately in dispatchAgent)
```

### Session Messages API

```
GET /session/{sessionID}/message?limit=N
```

Response shape:
```typescript
Array<{
  info: Message;   // { role: "user"|"assistant", error?: { type: string, message: string }, ... }
  parts: Part[];   // Array of Part union types
}>
```

---

## PATTERNS TO FOLLOW

### Pattern 1: The `|| []` guard pattern (used throughout dispatch.ts)

Every array filter uses `|| []` to guard against null/undefined:

```typescript
// From dispatch.ts:212
const textParts = data?.parts?.filter((p: any) => p.type === "text") || []

// From dispatch.ts:299
const subtaskParts = data?.parts?.filter((p: any) => p.type === "subtask") || []
```

**Rule**: ALL new array operations MUST use this pattern. Never assume `.parts` exists.

### Pattern 2: try/catch with null return (all dispatch functions)

```typescript
// From dispatch.ts:221-244 (dispatchText)
async function dispatchText(...): Promise<string | null> {
  try {
    // ... do work ...
    return extractTextFromParts(data)
  } catch {
    return null
  }
}
```

**Rule**: New extraction functions follow the same pattern — never throw, return null on failure.

### Pattern 3: Backward iteration for message scanning (getSessionLastResponse:319-321)

```typescript
for (let i = messages.length - 1; i >= 0; i--) {
  const text = extractTextFromParts(messages[i])
  if (text) return text
}
```

**Rule**: When scanning messages, iterate backward (most recent first) and return the
first match. This is correct and should be preserved in the updated version.

### Pattern 4: Conditional AbortSignal (dispatchAgent:289-291)

```typescript
if (timeoutMs > 0) {
  fetchOptions.signal = AbortSignal.timeout(timeoutMs)
}
```

**Rule**: Timeout 0 means no timeout. Always check before applying AbortSignal.

---

## STEP-BY-STEP TASKS

### Step 1: Add `extractContentFromParts()` function

**ACTION**: ADD new function after `extractTextFromParts()` (after line 215)

**IMPLEMENT**:

This function is broader than `extractTextFromParts()` — it checks TextPart first,
then falls back to ToolPart completed outputs, then ReasoningPart.

**Current** (lines 211-215):
```typescript
function extractTextFromParts(data: any): string | null {
  const textParts = data?.parts?.filter((p: any) => p.type === "text") || []
  const text = textParts.map((p: any) => p.text).join("\n")
  return text || null
}
```

**Replace with** (lines 211-239):
```typescript
function extractTextFromParts(data: any): string | null {
  const textParts = data?.parts?.filter((p: any) => p.type === "text") || []
  const text = textParts.map((p: any) => p.text).join("\n")
  return text || null
}

// Broader extraction for agent sessions where the final output may not be
// in TextPart entries. Checks: TextPart → ToolPart (completed) → ReasoningPart.
// Used by getSessionLastResponse() for child session message scanning.
function extractContentFromParts(data: any): string | null {
  // Priority 1: TextPart — the standard output
  const textParts = data?.parts?.filter((p: any) => p.type === "text") || []
  const text = textParts.map((p: any) => p.text).join("\n")
  if (text) return text

  // Priority 2: Completed ToolPart outputs — tool calls that produced results
  const toolParts = data?.parts?.filter(
    (p: any) => p.type === "tool" && p.state?.status === "completed" && p.state?.output
  ) || []
  if (toolParts.length > 0) {
    const toolOutput = toolParts.map((p: any) => p.state.output).join("\n")
    if (toolOutput) return toolOutput
  }

  // Priority 3: ReasoningPart — model's reasoning text (some providers expose this)
  const reasoningParts = data?.parts?.filter((p: any) => p.type === "reasoning" && p.text) || []
  if (reasoningParts.length > 0) {
    const reasoning = reasoningParts.map((p: any) => p.text).join("\n")
    if (reasoning) return reasoning
  }

  return null
}
```

**PATTERN**: Follows the `|| []` guard pattern from existing code. Each priority
level filters, maps, joins, and checks — same structure as `extractTextFromParts()`.

**GOTCHA**: Do NOT extract from `StepFinishPart`, `PatchPart`, `SnapshotPart`, or
`AgentPart` — these contain metadata/diffs, not human-readable output. Do NOT extract
from `SubtaskPart` — that's handled separately by the subtask fallback in `dispatchAgent()`.

**VALIDATE**: After adding, verify `extractTextFromParts()` still exists unchanged
(used by `dispatchText()`). The new function sits alongside it, not replacing it.

---

### Step 2: Add error checking to `dispatchAgent()`

**ACTION**: UPDATE `dispatchAgent()` to check `info.error` before extraction

**IMPLEMENT**:

**Current** (lines 292-297):
```typescript
    const response = await fetch(`${OPENCODE_URL}/session/${sessionId}/message`, fetchOptions)
    if (!response.ok) return null
    const data = await response.json()
    // Try extracting text directly from response parts
    const text = extractTextFromParts(data)
    if (text) return text
```

**Replace with** (lines 292-302):
```typescript
    const response = await fetch(`${OPENCODE_URL}/session/${sessionId}/message`, fetchOptions)
    if (!response.ok) return null
    const data = await response.json()
    // Check for error in the response
    if (data?.info?.error) {
      const err = data.info.error
      return `[Agent error: ${err.type || "unknown"}] ${err.message || ""}`
    }
    // Try extracting text directly from response parts
    const text = extractTextFromParts(data)
    if (text) return text
```

**PATTERN**: Returns a formatted error string instead of null — this way the caller
knows the agent errored rather than "no response." The error becomes visible in the
dispatch output.

**GOTCHA**: The error check MUST come before `extractTextFromParts()`. If the model
errored AND returned some text parts, the error takes priority — we want the caller
to know about the error.

**VALIDATE**: Verify the function still has the subtask fallback below this section.
The full function flow should be:
1. Check `info.error` → return error string
2. Try `extractTextFromParts(data)` → return text if found
3. Try subtask fallback → return child session response
4. Return null

---

### Step 3: Update `getSessionLastResponse()`

**ACTION**: UPDATE the function to be more robust

**IMPLEMENT**:

**Current** (lines 309-327):
```typescript
async function getSessionLastResponse(sessionId: string): Promise<string | null> {
  try {
    const response = await fetch(
      `${OPENCODE_URL}/session/${sessionId}/message?limit=5`,
      { signal: AbortSignal.timeout(10_000) },
    )
    if (!response.ok) return null
    const messages = await response.json()
    if (!Array.isArray(messages) || messages.length === 0) return null
    // Get the last assistant message with text content
    for (let i = messages.length - 1; i >= 0; i--) {
      const text = extractTextFromParts(messages[i])
      if (text) return text
    }
    return null
  } catch {
    return null
  }
}
```

**Replace with** (lines 309-345):
```typescript
async function getSessionLastResponse(sessionId: string): Promise<string | null> {
  try {
    const response = await fetch(
      `${OPENCODE_URL}/session/${sessionId}/message?limit=20`,
      { signal: AbortSignal.timeout(30_000) },
    )
    if (!response.ok) return null
    const messages = await response.json()
    if (!Array.isArray(messages) || messages.length === 0) return null

    // Pass 1: Walk backward looking for TextPart content (most common case)
    for (let i = messages.length - 1; i >= 0; i--) {
      const text = extractTextFromParts(messages[i])
      if (text) return text
    }

    // Pass 2: Walk backward looking for any content (ToolPart output, ReasoningPart)
    // Agent sessions often end with tool calls, so the final text may be in these parts
    for (let i = messages.length - 1; i >= 0; i--) {
      const content = extractContentFromParts(messages[i])
      if (content) return content
    }

    // Pass 3: Check if any message has an error we should surface
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i]
      if (msg?.info?.error) {
        const err = msg.info.error
        return `[Session error: ${err.type || "unknown"}] ${err.message || ""}`
      }
    }

    return null
  } catch {
    return null
  }
}
```

**PATTERN**: Three-pass approach, most-specific to least-specific:
1. TextPart first (fast path, most common)
2. Broader content extraction (ToolPart, ReasoningPart)
3. Error surfacing (better than silent null)

**GOTCHA**:
- `limit=20` not `limit=100` — we don't want to fetch the entire session history.
  20 messages is enough to find the final output even in tool-heavy sessions.
- `timeout=30_000` not `10_000` — the server may be under load after a long session.
  30s is generous but not excessive.
- Pass 1 uses `extractTextFromParts()` (text-only, fast). Pass 2 uses
  `extractContentFromParts()` (broader, slightly slower). This means Pass 1 and Pass 2
  are NOT redundant — Pass 1 is a fast path that avoids the broader extraction if
  text parts exist.
- Pass 1 and Pass 2 are separate loops because `extractContentFromParts()` checks
  TextPart first internally — but we want to scan ALL messages for TextPart before
  falling back to tool output from ANY message. If we used a single loop with
  `extractContentFromParts()`, we might return a tool output from message 19 when
  message 15 has a text part.

**VALIDATE**: After updating, verify:
- Function signature unchanged: `async function getSessionLastResponse(sessionId: string): Promise<string | null>`
- Function is still called from `dispatchAgent()` line 301
- No other callers exist (it's only called from dispatchAgent)

---

### Step 4: Update stale timeout description

**ACTION**: UPDATE the timeout arg description

**IMPLEMENT**:

**Current** (lines 579-585):
```typescript
    timeout: tool.schema
      .number()
      .optional()
      .describe(
        "Custom timeout in ms. Defaults: text=120000, agent=300000, command=600000. " +
        "For long tasks: 900000 (15min) for planning/execution.",
      ),
```

**Replace with** (lines 579-586):
```typescript
    timeout: tool.schema
      .number()
      .optional()
      .describe(
        "Custom timeout in ms. Defaults: text=120000, agent=300000, command=600000. " +
        "Planning/execution tasks use no-timeout automatically (taskType routing). " +
        "Set to 0 explicitly to disable timeout for any task.",
      ),
```

**PATTERN**: Matches the actual behavior wired in `planning-dispatch-improvements`.

**GOTCHA**: Don't mention the 900000 value — it's no longer the mechanism. The
`NO_TIMEOUT_TASK_TYPES` set + `AGENT_SESSION_NO_TIMEOUT = 0` is the correct mechanism.

**VALIDATE**: Read the updated description and verify it accurately reflects the
behavior in `execute()` lines 607-609.

---

## TESTING STRATEGY

### Manual Smoke Test 1: Simple agent dispatch

Dispatch a quick agent task and verify the response is non-null:

```
dispatch({
  mode: "agent",
  prompt: "List the files in the src/ directory and report what you find.",
  provider: "bailian-coding-plan-test",
  model: "qwen3-coder-next",
  description: "Test agent response extraction"
})
```

**Expected**: Response contains file listing text, not "No model responded"

### Manual Smoke Test 2: Planning cascade dispatch

Dispatch via the planning cascade (the exact scenario that's been failing):

```
dispatch({
  mode: "agent",
  prompt: "Run /prime and report what you loaded.",
  taskType: "planning",
  description: "Test planning dispatch response"
})
```

**Expected**: Response contains the /prime output summary, not "No model responded"

### Manual Smoke Test 3: Error handling

Verify errors are surfaced instead of silent null:

```
dispatch({
  mode: "agent",
  prompt: "test",
  provider: "fake-provider",
  model: "fake-model",
  description: "Test error handling"
})
```

**Expected**: Returns dispatch error (can't connect or model not found), not silent failure

### Edge Cases to Consider

| Scenario | Input | Expected Output |
|----------|-------|-----------------|
| Session with 0 text parts but tool output | messages[last].parts = [{ type: "tool", state: { status: "completed", output: "file list..." } }] | Returns "file list..." |
| Session with error in `info.error` | messages[last].info.error = { type: "rate_limit", message: "too many requests" } | Returns "[Session error: rate_limit] too many requests" |
| Session timeout (fetch aborted) | AbortSignal fires | Returns null (catch block) |
| Session with text AND tool output | messages[last].parts = [{ type: "text", text: "done" }, { type: "tool", state: { output: "..." } }] | Returns "done" (TextPart priority) |
| Session with only ReasoningPart | messages[last].parts = [{ type: "reasoning", text: "thinking..." }] | Returns "thinking..." |
| Child session 404 | GET /session/{childID}/message returns 404 | Returns null |
| Empty messages array | GET returns [] | Returns null |
| Metadata-only parts | messages[last].parts = [{ type: "step-finish" }] | Returns null |
| Parent response has error | data.info.error = { type: "model_error" } | Returns "[Agent error: model_error]" before attempting extraction |

### Regression test: text mode must still work

After all changes, verify `dispatchText()` still uses `extractTextFromParts()` (not
the new `extractContentFromParts()`). The text-mode path MUST NOT be affected:

```typescript
// dispatchText() at line 221-244 — MUST remain unchanged
async function dispatchText(...): Promise<string | null> {
  try {
    const response = await fetch(...)
    if (!response.ok) return null
    const data = await response.json()
    return extractTextFromParts(data)   // <-- uses text-only extraction, correct
  } catch {
    return null
  }
}
```

---

## VALIDATION COMMANDS

### L1: Syntax

```bash
npx tsc --noEmit .opencode/tools/dispatch.ts 2>&1 || echo "TypeScript check completed (may show non-dispatch errors)"
```

**Note**: The project may not have a tsconfig that covers `.opencode/tools/`. If tsc
fails on import resolution, manually verify:
- All functions have valid TypeScript syntax
- No missing brackets, semicolons, or type errors
- `async function` signatures match `Promise<string | null>` return types

### L2: Types

Same as L1. Additionally verify:
- `extractContentFromParts()` has signature `(data: any): string | null`
- `getSessionLastResponse()` signature unchanged
- `dispatchAgent()` signature unchanged

### L3: Unit Tests

N/A — no test framework configured. Manual testing covers functionality.

### L4: Integration

Run the three manual smoke tests described in Testing Strategy.

### L5: Human Review

User reviews the diff. Key things to verify:
- `extractTextFromParts()` is NOT modified (used by dispatchText)
- `extractContentFromParts()` is NEW (added alongside)
- `getSessionLastResponse()` has 3-pass extraction (text → content → error)
- `dispatchAgent()` checks `info.error` before extraction
- Stale timeout description updated

---

## ACCEPTANCE CRITERIA

### Implementation Criteria
- [x] New `extractContentFromParts()` function exists after `extractTextFromParts()`
- [x] `extractContentFromParts()` checks TextPart, ToolPart (completed), ReasoningPart
- [x] `getSessionLastResponse()` uses `limit=20` instead of `limit=5`
- [x] `getSessionLastResponse()` uses `timeout=30_000` instead of `10_000`
- [x] `getSessionLastResponse()` has 3-pass extraction: text → content → error
- [x] `dispatchAgent()` checks `data?.info?.error` before extraction attempt
- [x] `dispatchAgent()` returns formatted error string when error detected
- [x] `extractTextFromParts()` is NOT modified (backward compatibility)
- [x] Timeout description updated to reference no-timeout mechanism
- [x] All `|| []` guard patterns used on new array operations

### Runtime Criteria
- [ ] Simple agent dispatch returns non-null response — requires live dispatch test
- [ ] Planning cascade dispatch returns non-null response — requires live dispatch test
- [ ] Error cases return descriptive error strings, not silent null — requires live dispatch test
- [ ] Text-mode dispatch still works (no regressions) — dispatchText() not modified (verified)

---

## COMPLETION CHECKLIST

- [x] All 4 steps implemented in dispatch.ts
- [x] `extractTextFromParts()` preserved unchanged
- [x] New `extractContentFromParts()` added
- [x] `getSessionLastResponse()` upgraded (limit, timeout, 3-pass)
- [x] `dispatchAgent()` error checking added
- [x] Timeout description updated
- [ ] Manual smoke tests pass — requires live environment
- [ ] Diff reviewed
- [ ] Changes committed
