# Task 1 of 2: Fix dispatchCommand() extraction + timeout in dispatch.ts

> **Feature**: `execute-dispatch-fix`
> **Brief Path**: `.agents/features/execute-dispatch-fix/task-1.md`
> **Plan Overview**: `.agents/features/execute-dispatch-fix/plan.md`

---

## OBJECTIVE

Fix `dispatchCommand()` in `.opencode/tools/dispatch.ts` so it correctly extracts text from multi-step command responses AND handles `timeoutMs === 0` (no timeout) without aborting immediately.

---

## SCOPE

**Files This Task Touches:**

| File | Action | What Changes |
|------|--------|-------------|
| `.opencode/tools/dispatch.ts` | UPDATE | Fix `dispatchCommand()` (lines 397-422) |

**Out of Scope:**
- `dispatchAgent()` — already correct
- `dispatchCascade()` — not affected
- `dispatchText()` — not affected
- `extractTextFromParts()` — not modified (still used elsewhere)
- `extractContentFromParts()` — not modified (already exists)

---

## CONTEXT REFERENCES

### Current Content: dispatchCommand() (lines 397-422) — THE BROKEN CODE

```typescript
async function dispatchCommand(
  sessionId: string,
  provider: string,
  model: string,
  command: string,
  commandArgs: string,
  timeoutMs: number,
): Promise<string | null> {
  try {
    const response = await fetch(`${OPENCODE_URL}/session/${sessionId}/command`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        command,
        arguments: commandArgs,
        model: `${provider}/${model}`,
      }),
      signal: AbortSignal.timeout(timeoutMs),
    })
    if (!response.ok) return null
    const data = await response.json()
    return extractTextFromParts(data)
  } catch {
    return null
  }
}
```

**Two bugs:**
1. Line 414: `signal: AbortSignal.timeout(timeoutMs)` — when `timeoutMs === 0`, aborts immediately
2. Line 418: `extractTextFromParts(data)` — only finds `type: "text"` parts, misses text in complex multi-step responses

### Reference: dispatchAgent() (lines 295-343) — CORRECT TIMEOUT PATTERN

```typescript
const fetchOptions: RequestInit = {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ ... }),
}
if (timeoutMs > 0) {
  fetchOptions.signal = AbortSignal.timeout(timeoutMs)
}
const response = await fetch(url, fetchOptions)
```

### Reference: extractContentFromParts() (lines 223-246) — BROAD EXTRACTION

```typescript
function extractContentFromParts(data: any): string | null {
  // Priority 1: TextPart — the standard output
  const textParts = data?.parts?.filter((p: any) => p.type === "text") || []
  const text = textParts.map((p: any) => p.text).join("\n")
  if (text) return text

  // Priority 2: Completed ToolPart outputs
  const toolParts = data?.parts?.filter(
    (p: any) => p.type === "tool" && p.state?.status === "completed" && p.state?.output
  ) || []
  if (toolParts.length > 0) {
    const toolOutput = toolParts.map((p: any) => p.state.output).join("\n")
    if (toolOutput) return toolOutput
  }

  // Priority 3: ReasoningPart
  const reasoningParts = data?.parts?.filter((p: any) => p.type === "reasoning" && p.text) || []
  if (reasoningParts.length > 0) {
    const reasoning = reasoningParts.map((p: any) => p.text).join("\n")
    if (reasoning) return reasoning
  }

  return null
}
```

### Reference: getSessionLastResponse() (lines 345-379)

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

    // Pass 1: Walk backward looking for TextPart content
    for (let i = messages.length - 1; i >= 0; i--) {
      const text = extractTextFromParts(messages[i])
      if (text) return text
    }

    // Pass 2: Walk backward looking for any content
    for (let i = messages.length - 1; i >= 0; i--) {
      const content = extractContentFromParts(messages[i])
      if (content) return content
    }

    // Pass 3: Check for errors
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

---

## STEP-BY-STEP TASKS

### Step 1: UPDATE dispatchCommand() in dispatch.ts

**What**: Refactor to fix both timeout and extraction bugs.

**Current** (lines 397-422):
```typescript
async function dispatchCommand(
  sessionId: string,
  provider: string,
  model: string,
  command: string,
  commandArgs: string,
  timeoutMs: number,
): Promise<string | null> {
  try {
    const response = await fetch(`${OPENCODE_URL}/session/${sessionId}/command`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        command,
        arguments: commandArgs,
        model: `${provider}/${model}`,
      }),
      signal: AbortSignal.timeout(timeoutMs),
    })
    if (!response.ok) return null
    const data = await response.json()
    return extractTextFromParts(data)
  } catch {
    return null
  }
}
```

**Replace with**:
```typescript
async function dispatchCommand(
  sessionId: string,
  provider: string,
  model: string,
  command: string,
  commandArgs: string,
  timeoutMs: number,
): Promise<string | null> {
  try {
    const fetchOptions: RequestInit = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        command,
        arguments: commandArgs,
        model: `${provider}/${model}`,
      }),
    }
    // timeoutMs === 0 means no timeout — execution sessions run until completion.
    if (timeoutMs > 0) {
      fetchOptions.signal = AbortSignal.timeout(timeoutMs)
    }
    const response = await fetch(`${OPENCODE_URL}/session/${sessionId}/command`, fetchOptions)
    if (!response.ok) return null
    const data = await response.json()
    // Command responses have multi-step structures (step-start, reasoning, tool, text, step-finish).
    // Try broad extraction first (covers text, tool output, reasoning parts).
    const content = extractContentFromParts(data)
    if (content) return content
    // If direct extraction fails, scan session messages as fallback.
    // This handles cases where the command API returns a different structure
    // than expected (e.g., array of messages, nested response).
    return await getSessionLastResponse(sessionId)
  } catch {
    return null
  }
}
```

**Changes**:
1. `fetchOptions` pattern with `if (timeoutMs > 0)` guard — matches `dispatchAgent()`
2. `extractContentFromParts(data)` instead of `extractTextFromParts(data)` — broader extraction
3. Fallback to `getSessionLastResponse(sessionId)` if direct extraction fails — guaranteed to find text if model produced any

**GOTCHA**: 
- Keep the fetch URL as `/session/${sessionId}/command` (not `/message`)
- Keep the body format as `{ command, arguments, model: string }` (not object model)
- `getSessionLastResponse` has its own 30s timeout — this is fine as a fallback since the command already completed

---

## ACCEPTANCE CRITERIA

- [x] `dispatchCommand()` uses `fetchOptions` pattern with `if (timeoutMs > 0)` guard
- [x] `dispatchCommand()` calls `extractContentFromParts()` (not `extractTextFromParts()`)
- [x] `dispatchCommand()` falls back to `getSessionLastResponse()` if extraction fails
- [x] No other functions in dispatch.ts modified
- [x] `grep -n "timeoutMs > 0" .opencode/tools/dispatch.ts` returns 2 matches

---

## COMPLETION CHECKLIST

- [x] Step 1 completed
- [x] All acceptance criteria checked
- [x] No regressions in adjacent code
- [x] Brief marked done: `task-1.md` → `task-1.done.md`
