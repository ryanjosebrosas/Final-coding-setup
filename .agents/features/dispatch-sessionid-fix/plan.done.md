# Plan: dispatch-sessionid-fix

> **Feature**: `dispatch-sessionid-fix`
> **Feature Directory**: `.agents/features/dispatch-sessionid-fix/`
> **Plan Type**: Task Briefs (1 task, 1 brief)
> **Generated**: 2026-03-02

---

## FEATURE DESCRIPTION

Fix the `sessionId` parameter so it actually carries through in sequential dispatch calls. Currently, passing `sessionId` in Call 2 is silently ignored — a new session is created every time, meaning the `/prime` context from Call 1 is lost.

**Root Cause Analysis**:

There are TWO dispatch tools in play:

1. **Custom `dispatch.ts`** (`.opencode/tools/dispatch.ts`) — has `sessionId` parameter, code at line 769 correctly handles it
2. **MCP `mcp_dispatch`** — the tool exposed to Claude via the OpenCode MCP server. This tool's schema does NOT include `sessionId`

When we call `mcp_dispatch` with `sessionId`, the parameter is silently dropped because the MCP tool schema doesn't define it. The custom `dispatch.ts` tool's `sessionId` parameter exists in code but is never reachable from the MCP layer.

**Evidence**:

The `mcp_dispatch` tool definition (from the system prompt) shows these parameters:
- `prompt`, `description`, `mode`, `model`, `provider`, `taskType`, `command`, `timeout`

No `sessionId`. Meanwhile `dispatch.ts` line 694-703 defines:
```typescript
sessionId: tool.schema.string().optional().describe("Existing session ID...")
```

The code is there but the MCP server isn't exposing it — OR the MCP server has its OWN dispatch implementation that doesn't include `sessionId`.

**Investigation needed**: Determine whether:
- (A) The MCP `mcp_dispatch` is a separate tool from `dispatch.ts` (different implementation)
- (B) The MCP server wraps `dispatch.ts` but strips optional params
- (C) The MCP tool cache is stale and needs a server restart to pick up the `sessionId` arg

**Solution approaches** (depends on investigation):

1. **If (A)**: The MCP dispatch is a built-in OpenCode tool — we need to find where it's defined and add `sessionId` support, OR we bypass MCP and use direct API calls (which we already proved work)
2. **If (B/C)**: Restart the OpenCode server to pick up the updated schema, or find the MCP wrapper layer

3. **Alternative**: Skip the dispatch tool entirely for sequential calls. Use direct HTTP API calls via bash/fetch:
   ```
   POST /session/{id}/command  {"command":"prime", "arguments":"", "model":"..."}
   POST /session/{id}/command  {"command":"execute", "arguments":"...", "model":"..."}
   ```
   This was already proven to work in our earlier direct API test.

---

## FEATURE METADATA

| Field | Value |
|-------|-------|
| **Complexity** | light |
| **Target Files** | TBD after investigation |
| **Risk Level** | LOW |

### Slice Guardrails

**What's In Scope**:
- Investigate why `sessionId` doesn't carry through
- Determine which approach fixes it
- Implement the fix

**What's Out of Scope**:
- Response extraction (already fixed in execute-dispatch-fix)
- Timeout handling (already fixed)
- build.md Step 5 pattern (already updated)

**Definition of Done**:
- [ ] Call 1 (`/prime`) returns a sessionId
- [ ] Call 2 (`/execute`) reuses that same sessionId
- [ ] The model in Call 2 has the `/prime` context from Call 1
- [ ] E2E test passes: `/prime` → `/execute` in same session

---

## TASK INDEX

| Task | Brief | Description |
|------|-------|-------------|
| 1 | `task-1.md` | Investigate MCP vs custom dispatch, implement fix |

---

## INVESTIGATION PLAN

### Step 1: Check if MCP dispatch is the same as dispatch.ts

```bash
# Search for any other dispatch tool definitions
grep -r "dispatch" .opencode/ --include="*.ts" --include="*.json" -l
# Check opencode config for tool registration
cat .opencode/config.yaml  # or config.json
```

### Step 2: Check if opencode server exposes custom tools via MCP

The OpenCode server (`opencode serve`) registers tools from `.opencode/tools/`. If it hot-reloads, the `sessionId` param should be there. If it's cached, a restart may fix it.

### Step 3: Test after server restart

Restart `opencode serve` and check if the `sessionId` parameter appears in the MCP tool definition.

### Step 4: If MCP doesn't expose sessionId — use direct API

The direct API approach (`POST /session/{id}/command`) was already proven to work. We can:
- Create a NEW tool (e.g., `sequential-dispatch.ts`) that exposes a `sequentialExecute` function
- OR modify the build.md Step 5 to use raw HTTP calls instead of the dispatch tool
- OR add a second tool specifically for session-reuse dispatch

---

## TESTING STRATEGY

After fix is applied:

```
Call 1: dispatch /prime → get sessionId X
Call 2: dispatch /execute with sessionId X → verify session in output matches X
```

The session IDs in Call 1 output and Call 2 output must match.
