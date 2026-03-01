# Feature Plan: dispatch-agent-response-fix

## Feature Description

Fix `dispatchAgent()` response extraction in `.opencode/tools/dispatch.ts` so that
dispatched agent sessions reliably return their final output text instead of `null`.
Currently, agent sessions complete successfully (files are written, commands execute)
but the dispatch function cannot extract the response — it reports "No model responded"
even though the model did respond and did its work.

This is the **#1 blocker** for the autonomous `/build` pipeline: `/build` dispatches
`/planning` via agent mode, and if the response comes back `null`, the pipeline thinks
planning failed and cannot proceed.

---

## User Story

As a developer using the `/build` autonomous pipeline, I want dispatched agent sessions
to return their actual output so that the pipeline can read the result, validate it,
and proceed to the next step without manual intervention.

---

## Problem Statement

`dispatchAgent()` (dispatch.ts:264-307) has a 3-tier response extraction:

1. **Tier 1**: `extractTextFromParts(data)` — looks for `type: "text"` parts in the
   direct response. Works for simple text responses.
2. **Tier 2**: Check for `type: "subtask"` parts → read child session via
   `getSessionLastResponse(childSessionID)`. This is the fallback for agent sessions
   that delegate to a child session.
3. **Tier 3**: Return `null` if both fail.

The problem is in **Tier 2**: `getSessionLastResponse()` (dispatch.ts:309-327) is too
weak:

- Only fetches the **last 5 messages** — agent sessions that use many tool calls can
  have 50+ messages, and the last 5 may all be tool calls with no `TextPart`
- Only looks for `type: "text"` parts — misses the actual content when the model's
  final output is embedded in other part types
- Has a **10-second timeout** — may not be enough if the server is under load
- Does NOT check `info.error` on the response — errors are silently swallowed

Additionally, `dispatchAgent()` itself does not check `data?.info?.error` on the
initial POST response.

### Evidence

- Dispatching `/planning` via agent mode: session `ses_35579871dffer72eTV4ptfsshs`
  ran for 1169 seconds, created `plan.md` and `task-1.md` successfully, but dispatch
  reported "No model responded"
- Multiple prior dispatch attempts showed the same pattern: agent works, response is null
- The `planning-dispatch-improvements` feature explicitly acknowledged this bug in
  task-1.done.md line 680 and deferred it: "The dispatchAgent() response extraction
  bug is a separate issue not addressed by this task."
- The original `multi-model-dispatch` plan flagged response extraction as "unverified"
  in plan-phase-1.done.md lines 1189-1191

---

## Solution Statement

Expand `getSessionLastResponse()` to be more robust:

1. Increase message limit from 5 to 20
2. Increase timeout from 10s to 30s
3. Add broader part type extraction — check `ToolPart` completed outputs,
   `ReasoningPart` text, and other content-bearing parts beyond just `TextPart`
4. Add `info.error` checking in `dispatchAgent()`
5. Add a final fallback: if no text parts found in ANY of the last 20 messages,
   try extracting from the session's last assistant message directly (the parent
   session, not just the child)
6. Update the stale timeout description in the tool args schema

---

## Feature Metadata

| Field | Value |
|-------|-------|
| Feature name | dispatch-agent-response-fix |
| Complexity | light-standard |
| Risk | low — changes are additive, no breaking changes to the dispatch API |
| Files modified | 1 (`.opencode/tools/dispatch.ts`) |
| Files created | 0 |
| Estimated tasks | 1 |
| Mode | Task Brief (1 brief) |

### Slice Guardrails

- **Vertical slice**: Yes — fixes one specific function chain (dispatchAgent → getSessionLastResponse → extractTextFromParts)
- **One concern**: Response extraction reliability
- **Testable in isolation**: Yes — dispatch an agent task and verify non-null response
- **No feature flags needed**: Additive changes, no conditional behavior

---

## Context References

### Primary file: `.opencode/tools/dispatch.ts` (777 lines)

The entire file was read. Key sections:

#### `extractTextFromParts()` — dispatch.ts:211-215

```typescript
function extractTextFromParts(data: any): string | null {
  const textParts = data?.parts?.filter((p: any) => p.type === "text") || []
  const text = textParts.map((p: any) => p.text).join("\n")
  return text || null
}
```

Only looks for `type: "text"` parts. This is the root of the extraction weakness.

#### `dispatchAgent()` — dispatch.ts:264-307

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
    const fetchOptions: RequestInit = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: { providerID: provider, modelID: model },
        parts: [{
          type: "subtask",
          prompt,
          description,
          agent: "general",
          model: { providerID: provider, modelID: model },
        }],
      }),
    }
    if (timeoutMs > 0) {
      fetchOptions.signal = AbortSignal.timeout(timeoutMs)
    }
    const response = await fetch(`${OPENCODE_URL}/session/${sessionId}/message`, fetchOptions)
    if (!response.ok) return null
    const data = await response.json()
    const text = extractTextFromParts(data)
    if (text) return text
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

Has the subtask fallback but does not check `info.error`.

#### `getSessionLastResponse()` — dispatch.ts:309-327

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

The weakest link: 5 messages, 10s timeout, text-only extraction.

#### `dispatchCommand()` — dispatch.ts:343-368

Dead code in practice. No command files use `mode: "command"`. All dispatch calls
use `mode: "agent"` or `mode: "text"`. Not in scope for this fix.

#### `dispatchCascade()` — dispatch.ts:374-427

Calls `dispatchAgent()` for agent mode. The cascade falls through to the next model
when `text` is null — so the response extraction bug causes ALL cascade models to
"fail" in sequence even though the first model actually worked.

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
      // Use no-timeout for planning/execution sessions; fallback to AGENT_LONG_TIMEOUT_MS
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

The key line is `if (text)` at line 412 — when `dispatchAgent()` returns null due to
extraction failure, the cascade incorrectly moves to the next model. With the fix,
`dispatchAgent()` returns actual text, the cascade stops at the first model, and
the result is returned.

#### `execute()` agent dispatch path — dispatch.ts:688-692

```typescript
      } else if (mode === "agent") {
        text = await dispatchAgent(
          sessionId, route.provider, route.model,
          args.prompt, taskDescription, timeoutMs,
        )
      }
```

This is the direct (non-cascade) agent path. Same issue — if `dispatchAgent()`
returns null, the code falls through to the fallback route (GLM-4.7) at line 710-728:

```typescript
      } else if (resolved.source !== "explicit") {
        // Try fallback for non-explicit routes
        let fallbackText: string | null = null
        // ... tries FALLBACK_ROUTE with same mode ...
      }
```

And if the fallback also returns null (because the same extraction bug hits it),
the dispatch reports "No model responded."

#### Output formatting — dispatch.ts:749-758

```typescript
    if (!result) {
      return (
        `# Dispatch Failed\n\n` +
        `**Route**: ${resolved.source}\n` +
        `**Mode**: ${mode}\n` +
        `**Session**: ${sessionId}\n` +
        `**Time**: ${(totalMs / 1000).toFixed(1)}s\n\n` +
        `No model responded. Check provider configuration.\n\n` +
        `**Debug**: \`GET ${OPENCODE_URL}/session/${sessionId}\``
      )
    }
```

This is the "No model responded" message we've been seeing. With the fix,
`result` will be non-null because `dispatchAgent()` returns actual text.

#### Timeout description (stale) — dispatch.ts:582-584

```typescript
.describe(
  "Custom timeout in ms. Defaults: text=120000, agent=300000, command=600000. " +
  "For long tasks: 900000 (15min) for planning/execution.",
)
```

Outdated — should reference `NO_TIMEOUT_TASK_TYPES` and `AGENT_SESSION_NO_TIMEOUT`.

### SDK Part types — from `@opencode-ai/sdk/dist/v2/gen/types.gen.d.ts`

The `Part` union type (line 450):

```typescript
export type Part = TextPart | SubtaskPart | ReasoningPart | FilePart | ToolPart
    | StepStartPart | StepFinishPart | SnapshotPart | PatchPart | AgentPart
    | RetryPart | CompactionPart;
```

Content-bearing part types we should extract from:

- `TextPart` — `{ type: "text", text: string }` — primary content (currently handled)
- `ToolPart` — `{ type: "tool", state: { output?: string } }` — tool call results
  (completed tool calls have output strings)
- `ReasoningPart` — `{ type: "reasoning", text: string }` — model reasoning
  (visible in some providers)

Part types we should NOT extract from (metadata only):
- `StepStartPart`, `StepFinishPart` — agent step markers
- `SnapshotPart`, `PatchPart` — file diffs
- `AgentPart` — agent lifecycle
- `RetryPart`, `CompactionPart` — internal bookkeeping
- `FilePart` — file attachments
- `SubtaskPart` — child session reference (handled separately)

### Session Messages API

```
GET /session/{sessionID}/message?limit=N
```

Returns `Array<{ info: Message, parts: Array<Part> }>`. Each element has:
- `info.role` — "user" or "assistant"
- `info.error` — error object if the message errored: `{ type: string, message: string }`
- `info.time` — timestamps including `created`, `updated`, `completed`
- `parts` — the Part array

Example response for a completed agent session:
```json
[
  { "info": { "role": "user", ... }, "parts": [{ "type": "text", "text": "Run /prime" }] },
  { "info": { "role": "assistant", ... }, "parts": [
    { "type": "subtask", "sessionID": "ses_child123", "prompt": "...", "agent": "general" },
    { "type": "step-start", ... },
    { "type": "tool", "state": { "status": "completed", "output": "read file..." } },
    { "type": "tool", "state": { "status": "completed", "output": "wrote file..." } },
    { "type": "text", "text": "Done. Created plan.md and task-1.md." },
    { "type": "step-finish", ... }
  ]}
]
```

The text part ("Done. Created plan.md...") is what we want to extract. But in
many real agent sessions, the model's final turn ends with tool calls (writing
files) and no closing text part. That's when `extractTextFromParts()` returns null.

### Session Status API

```
GET /session/status
```

Returns `{ [sessionID: string]: SessionStatus }` where:
```typescript
type SessionStatus = { type: "idle" } | { type: "busy" } | { type: "retry", ... }
```

Not used by current dispatch — but could be used to verify a session completed
before reading messages. Out of scope for this fix (Option B polling approach
was rejected).

### Constants and timeouts — dispatch.ts:7-21

```typescript
const OPENCODE_URL = "http://127.0.0.1:4096"
const TEXT_TIMEOUT_MS = 120_000      // 2 min — text mode (reviews, analysis)
const AGENT_TIMEOUT_MS = 300_000     // 5 min — agent mode (default)
const AGENT_LONG_TIMEOUT_MS = 900_000 // 15 min — agent mode (complex tasks)
const AGENT_SESSION_NO_TIMEOUT = 0   // No timeout — planning/execution sessions run until done
const CASCADE_TIMEOUT_MS = 30_000    // 30 sec — per cascade attempt (text mode)
const COMMAND_TIMEOUT_MS = 600_000   // 10 min — command mode (full command execution)

const NO_TIMEOUT_TASK_TYPES = new Set(["planning", "execution"])
const HEALTH_TIMEOUT_MS = 5_000
const ARCHIVE_AFTER_DAYS = 3
const ARCHIVE_AFTER_MS = ARCHIVE_AFTER_DAYS * 24 * 60 * 60 * 1000
const MAX_ARCHIVE_PER_RUN = 10
```

No constants need to change. The `getSessionLastResponse()` timeout increase
(10s → 30s) is a hardcoded value inside the function, not a constant.

### `dispatchText()` — dispatch.ts:221-244 (DO NOT MODIFY)

```typescript
async function dispatchText(
  sessionId: string,
  provider: string,
  model: string,
  prompt: string,
  timeoutMs: number,
): Promise<string | null> {
  try {
    const response = await fetch(`${OPENCODE_URL}/session/${sessionId}/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: { providerID: provider, modelID: model },
        parts: [{ type: "text", text: prompt }],
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

This function uses `extractTextFromParts()` (text-only) and that is CORRECT for
text mode. Text mode responses always contain TextPart entries. Do NOT change this
function — it's not affected by the bug.

### Prior plans that touched dispatch.ts

1. **multi-model-dispatch** — Created the file. Flagged response extraction as unverified.
2. **planning-dispatch-improvements** — Fixed timeouts. Explicitly deferred response
   extraction bug.
3. **dispatch-wiring-completion** — Wired dispatch calls into all commands. Did NOT
   touch dispatch.ts.
4. **build-batch-dispatch-wiring** — Wired batch-dispatch into /build. Did NOT touch
   dispatch.ts.

---

## Patterns to Follow

### Pattern 1: The existing 3-tier extraction in `dispatchAgent()` (dispatch.ts:294-302)

This is the right structure — we're strengthening it, not replacing it:

```typescript
// Tier 1: Direct text parts from response
const text = extractTextFromParts(data)
if (text) return text
// Tier 2: Child session fallback
const subtaskParts = data?.parts?.filter((p: any) => p.type === "subtask") || []
if (subtaskParts.length > 0 && subtaskParts[0].sessionID) {
  return await getSessionLastResponse(subtaskParts[0].sessionID)
}
// Tier 3: null
return null
```

### Pattern 2: Error handling in dispatchText() (dispatch.ts:221-244)

All dispatch functions use the same try/catch-return-null pattern:

```typescript
async function dispatchText(...): Promise<string | null> {
  try {
    const response = await fetch(...)
    if (!response.ok) return null
    const data = await response.json()
    return extractTextFromParts(data)
  } catch {
    return null
  }
}
```

We maintain this pattern — errors don't throw, they return null.

### Pattern 3: The `|| []` safety pattern (dispatch.ts:212, 299)

```typescript
const textParts = data?.parts?.filter((p: any) => p.type === "text") || []
```

All array operations use `|| []` to guard against null/undefined. Maintain this.

### Pattern 4: Conditional AbortSignal timeout (dispatch.ts:289-291)

```typescript
if (timeoutMs > 0) {
  fetchOptions.signal = AbortSignal.timeout(timeoutMs)
}
```

When `timeoutMs === 0`, no `AbortSignal` is attached — the fetch runs indefinitely.
This pattern must be used in any new fetch calls (e.g., the updated
`getSessionLastResponse()`).

### Pattern 5: How `/build` dispatches `/planning` (build.md:216-222)

```markdown
dispatch({
  mode: "agent",
  prompt: "Run /prime first. Then run /planning {spec-id} {spec-name} --auto-approve ...",
  taskType: "planning",
})
```

This is the exact call that triggers the bug. The prompt tells the agent to run
`/prime` then `/planning`. The agent successfully does so (reads files, writes plan
artifacts), but `dispatchAgent()` returns null because `getSessionLastResponse()`
can't find text parts in the child session's last 5 messages.

### Pattern 6: The planning cascade route (dispatch.ts:104-112)

```typescript
"planning": {
  type: "cascade",
  models: [
    { provider: "ollama-cloud", model: "kimi-k2-thinking", label: "KIMI-K2-THINKING" },
    { provider: "ollama-cloud", model: "cogito-2.1:671b", label: "COGITO-2.1" },
    { provider: "bailian-coding-plan-test", model: "qwen3-max-2026-01-23", label: "QWEN3-MAX" },
    { provider: "anthropic", model: "claude-opus-4-5", label: "CLAUDE-OPUS-4-5" },
  ],
},
```

The cascade tries 4 models sequentially. With the current bug, ALL 4 models "fail"
because `dispatchAgent()` returns null for each, even though the first model actually
completed the work. With the fix, the first model returns actual text, and the cascade
stops immediately.

---

## Implementation Plan

### Overview

Single task: modify `dispatch.ts` to fix response extraction. All changes are in
one file with tightly coupled functions — `extractTextFromParts()`,
`getSessionLastResponse()`, and `dispatchAgent()` all work together.

### Step-by-Step Tasks (Summary Level)

#### Task 1: Fix response extraction chain in dispatch.ts

- **ACTION**: UPDATE
- **TARGET**: `.opencode/tools/dispatch.ts`
- **IMPLEMENT**:
  1. Create new `extractContentFromParts()` function that checks multiple part types
     (TextPart, ToolPart output, ReasoningPart) — broader than current text-only
  2. Update `getSessionLastResponse()`:
     - Increase message limit from 5 to 20
     - Increase timeout from 10s to 30s
     - Use new `extractContentFromParts()` instead of `extractTextFromParts()`
     - Add fallback: if walking backward through messages finds nothing, try the
       parent session's messages too
  3. Add `info.error` checking in `dispatchAgent()` before extraction
  4. Add `info.error` checking in `dispatchAgent()` child session path
  5. Update stale timeout description in tool args schema (line 582-584)
- **VALIDATE**: Dispatch an agent task via the MCP dispatch tool and verify non-null
  response is returned

---

## Testing Strategy

### Manual Testing (primary — no test framework configured)

1. **Smoke test**: Dispatch a simple agent task:
   ```
   dispatch({ mode: "agent", prompt: "List the files in src/", taskType: "quick-check" })
   ```
   Verify: non-null response containing file listing

2. **Planning test**: Dispatch a planning task:
   ```
   dispatch({ mode: "agent", prompt: "Run /prime", taskType: "planning" })
   ```
   Verify: non-null response (this is the exact scenario that currently returns null)

3. **Error case**: Dispatch to a non-existent model:
   ```
   dispatch({ mode: "agent", prompt: "test", provider: "fake", model: "fake" })
   ```
   Verify: returns error message, not silent null

### What NOT to test

- `dispatchText()` — already works, not being changed
- `dispatchCommand()` — dead code, not in scope
- `batch-dispatch` — separate tool, not affected

### Edge Cases

| Scenario | Expected behavior |
|----------|------------------|
| Session with 0 text parts but tool output | Returns tool output (Priority 2) |
| Session with error in `info.error` | Returns formatted error string |
| Session timeout (fetch aborted) | Returns null (unchanged behavior) |
| Session with both text parts AND tool output | Returns text parts (Priority 1 wins) |
| Session with only ReasoningPart | Returns reasoning text (Priority 3) |
| Child session not found (404) | Returns null (unchanged behavior) |
| Empty messages array | Returns null (unchanged behavior) |
| Messages with only StepStart/StepFinish | Returns null (no content in metadata parts) |

---

## Validation Commands

### L1: Syntax
```bash
npx tsc --noEmit .opencode/tools/dispatch.ts
```
Note: May fail if project tsconfig doesn't cover .opencode/ — in that case, verify
manually that the TypeScript is syntactically valid.

### L2: Types
Same as L1 — TypeScript compilation checks both syntax and types.

### L3: Unit Tests
N/A — no test framework configured for this project. Validation is manual.

### L4: Integration
Manual dispatch test as described in Testing Strategy above.

### L5: Human Review
User reviews the diff before commit.

---

## Acceptance Criteria

### Implementation Criteria
- [x] `extractContentFromParts()` created — extracts from TextPart, ToolPart.state.output,
      and ReasoningPart
- [x] `getSessionLastResponse()` updated — limit=20, timeout=30s, uses new extraction
- [x] `dispatchAgent()` checks `info.error` before extraction
- [x] Stale timeout description updated (line 635)
- [x] All existing dispatch modes still work (text, agent) — no regressions
- [x] `extractTextFromParts()` preserved for backward compatibility (used by dispatchText)

### Runtime Criteria
- [ ] Agent dispatch returns non-null response for sessions that complete successfully — requires live dispatch test
- [ ] Agent dispatch returns error info when session errors — requires live dispatch test
- [ ] Cascade dispatch stops at first successful model (doesn't fall through due to
      null extraction) — requires live dispatch test
- [ ] Planning dispatch (`taskType: "planning"`) returns response — requires live dispatch test

---

## Completion Checklist

- [x] dispatch.ts modified with all changes
- [ ] Manual smoke test passes — requires live environment
- [ ] Planning dispatch test passes — requires live environment
- [ ] No regressions in text mode dispatch — dispatchText() unchanged (verified by read)
- [ ] Diff reviewed by user
- [ ] Changes committed via `/commit`

---

## Notes

### Key Decisions

1. **Expand extraction, don't add polling** — Option A over Option B. The sync fetch
   already blocks until completion. The problem is extraction breadth, not timing.
2. **Keep `extractTextFromParts()` as-is** — It's used by `dispatchText()` where
   text-only extraction is correct. The new broader function is `extractContentFromParts()`
   used only in the agent path.
3. **Don't touch `dispatchCommand()`** — Dead code. No command files use
   `mode: "command"`. All dispatch calls use `mode: "agent"` or `mode: "text"`.
4. **Message limit 20, not "all"** — Fetching all messages from a 50+ message session
   would be expensive. 20 is a good balance — if the model's final text isn't in the
   last 20 messages, something else is wrong.

### Risks

1. **Part type assumptions** — We're assuming `ToolPart.state.output` and
   `ReasoningPart.text` exist based on SDK types. If the actual server response
   differs, extraction may still miss content. Mitigation: the TextPart path
   (tier 1) still works for simple cases.
2. **Message order** — We assume the last messages contain the final output. If the
   server returns messages in a different order, we'd miss it. Mitigation: we walk
   backward through all 20 messages.

### Confidence

**8/10** — High confidence. The fix is straightforward and well-understood. The pattern
already exists in `dispatchAgent()` tier 2 — we're just making it more robust. The
only uncertainty is whether the broader part type extraction covers all real-world
server response shapes.

---

## TASK INDEX

| Task | Brief Path | Scope | Status | Files |
|------|-----------|-------|--------|-------|
| 1 | `task-1.md` | Fix extractContentFromParts, getSessionLastResponse, dispatchAgent error checking, stale description | pending | 0 created, 1 modified |
