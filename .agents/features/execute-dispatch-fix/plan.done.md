# Plan: execute-dispatch-fix

> **Feature**: `execute-dispatch-fix`
> **Feature Directory**: `.agents/features/execute-dispatch-fix/`
> **Plan Type**: Task Briefs (2 tasks, 2 briefs)
> **Generated**: 2026-03-02

---

## FEATURE DESCRIPTION

Fix the dispatch tool so `/execute` works via command-mode dispatch the same way `/planning` works. Currently:
- `/planning` via command-mode dispatch → works (text extraction succeeds)
- `/execute` via command-mode dispatch → fails silently (returns null, model runs but response is lost)

**Root Cause Analysis** (from testing):

Direct API calls to `/session/{id}/command` work for both `/prime` and `/execute`. The model executes correctly. But the dispatch tool's `dispatchCommand()` function fails to extract the response because:

1. **Response extraction bug**: `dispatchCommand()` calls `extractTextFromParts(data)` which ONLY looks for `type: "text"` parts. But OpenCode command responses return multi-step structures: `step-start` → `reasoning` → `tool` → `text` → `step-finish` → `patch`. The text parts ARE there but `extractTextFromParts` returns null when the response has a complex multi-message structure.

2. **Timeout bug**: `dispatchCommand()` always applies `AbortSignal.timeout(timeoutMs)` — when `timeoutMs === 0` (meaning "no timeout"), `AbortSignal.timeout(0)` aborts immediately. `dispatchAgent()` has a `if (timeoutMs > 0)` guard — `dispatchCommand()` needs the same.

3. **build.md Step 5 pattern**: Uses old single-prompt agent-mode dispatch. Must be updated to sequential two-call command-mode pattern matching Step 2.

**Evidence**:

The successful `/planning` session (`ses_354f38f5fffeS05KOmDuvajZuc`) was run directly in OpenCode — NOT through the dispatch tool. When we tested direct API calls for `/execute`, they worked perfectly. The dispatch tool is the broken layer.

Testing the `/execute` direct API call showed the response structure:
```
MSG 0: [step-start] [reasoning] [text: "Task 2/2 complete..."] [step-finish]
```
The text IS in the response — `extractTextFromParts` should find it IF the response data structure is what we expect. The issue may be that the command endpoint returns the response differently than expected — possibly as an array of messages rather than a single message object.

**Solution**: 
1. Fix `dispatchCommand()` to use `extractContentFromParts()` (broad extraction) instead of `extractTextFromParts()` (narrow). If that still fails, fall back to `getSessionLastResponse()` to scan session messages.
2. Fix the timeout guard (`if (timeoutMs > 0)`)
3. Update `build.md` Step 5 to use sequential two-call command-mode pattern

---

## FEATURE METADATA

| Field | Value |
|-------|-------|
| **Complexity** | light |
| **Target Files** | `.opencode/tools/dispatch.ts`, `.opencode/commands/build.md` |
| **Files to Modify** | `.opencode/tools/dispatch.ts`, `.opencode/commands/build.md` |
| **Estimated Effort** | 2 tasks, ~45 minutes |
| **Risk Level** | LOW |

### Slice Guardrails

**What's In Scope**:
- Fix `dispatchCommand()` response extraction in `dispatch.ts`
- Fix `dispatchCommand()` timeout guard in `dispatch.ts`
- Update `build.md` Step 5 both modes to sequential two-call pattern

**What's Out of Scope**:
- `dispatchAgent()` — already correct
- `dispatchCascade()` — already correct  
- `dispatchText()` — not affected
- `/execute` command itself (execute.md) — works correctly
- `/planning` dispatch in Step 2 — already working

**Definition of Done**:
- [ ] `dispatchCommand()` extracts text from multi-step command responses
- [ ] `dispatchCommand()` has `if (timeoutMs > 0)` timeout guard
- [ ] `build.md` Step 5 uses sequential two-call command-mode dispatch
- [ ] E2E test: `/prime` → `/execute` via dispatch tool succeeds

---

## TASK INDEX

| Task | Brief | Target File | Description |
|------|-------|-------------|-------------|
| 1 | `task-1.md` | `.opencode/tools/dispatch.ts` | Fix `dispatchCommand()` extraction + timeout |
| 2 | `task-2.md` | `.opencode/commands/build.md` | Update Step 5 to sequential two-call pattern |

---

## DEBUGGING FINDINGS

### What the command API actually returns

When calling `POST /session/{id}/command`, the response is a single message object with `parts[]`. Each part has a `type`. For a `/prime` command, the text extraction works because `/prime` outputs a clean text response. For `/execute`, the response contains multiple steps:

```
parts: [
  { type: "step-start" },
  { type: "reasoning", text: "..." },
  { type: "tool", tool: "write", state: { status: "completed" } },
  { type: "step-finish" },
  { type: "patch", additions: N, deletions: M },
  { type: "step-start" },
  { type: "reasoning", text: "..." },
  { type: "text", text: "Task 2/2 complete..." },  // ← THIS is what we need
  { type: "step-finish" },
]
```

The text IS there — but `extractTextFromParts` may be failing because:
1. The response wraps parts differently than expected
2. The `/execute` API returns multiple messages (array) instead of one message
3. There's an error response wrapping the data

### What `extractContentFromParts` does differently

`extractContentFromParts()` (lines 223-246) tries three extraction strategies:
1. TextPart (same as `extractTextFromParts`)
2. Completed ToolPart outputs
3. ReasoningPart text

This broader extraction is more likely to find content in complex command responses.

### What `getSessionLastResponse` does

`getSessionLastResponse()` (lines 345-379) fetches the last 20 messages from a session and walks backward looking for content. This is the nuclear option — guaranteed to find the response if the model produced one.

---

## TESTING STRATEGY

### Integration Test (the real test)

After both tasks are applied:

```
Call 1: dispatch({ mode: "command", command: "prime", prompt: " ", provider: "bailian-coding-plan-test", model: "qwen3.5-plus" })
→ Extract sessionId

Call 2: dispatch({ mode: "command", command: "execute", prompt: ".agents/features/string-capitalize/plan.md", provider: "...", model: "...", sessionId: "...", timeout: 0 })
→ Should return text (not null)
```

### Fallback Verification

If `extractContentFromParts` still fails, the plan includes a fallback to `getSessionLastResponse()`. Test by checking if dispatch returns any text at all.

---

## VALIDATION COMMANDS

### Level 1: Syntax
```bash
grep -n "timeoutMs > 0" .opencode/tools/dispatch.ts
# Expected: 2 matches
grep -n "extractContentFromParts\|getSessionLastResponse" .opencode/tools/dispatch.ts | grep -i command
# Expected: at least 1 match in dispatchCommand area
```

### Level 5: Manual Validation
1. Read `dispatchCommand()` — verify extraction and timeout fixes
2. Read `build.md` Step 5 — verify sequential pattern
3. Run the E2E test dispatch
