# Task 1 of 1: Investigate and fix sessionId passthrough

> **Feature**: `dispatch-sessionid-fix`
> **Brief Path**: `.agents/features/dispatch-sessionid-fix/task-1.md`
> **Plan Overview**: `.agents/features/dispatch-sessionid-fix/plan.md`

---

## OBJECTIVE

Determine why the `sessionId` parameter in `dispatch.ts` is not reachable from the MCP dispatch tool, and implement a fix so sequential dispatch (Call 1 → Call 2 in same session) works end-to-end.

---

## SCOPE

**Investigation targets:**

| Location | What to Check |
|----------|---------------|
| `.opencode/tools/dispatch.ts` | Verify `sessionId` arg exists in schema (line 694-703) |
| `.opencode/config.yaml` or `config.json` | Check tool registration config |
| OpenCode MCP server | Check if custom tools are exposed via MCP |
| `mcp_dispatch` tool schema | Compare params against dispatch.ts args |

**Possible fixes:**

| Approach | When to Use |
|----------|-------------|
| Server restart | If MCP cache is stale |
| New MCP tool for sequential dispatch | If MCP dispatch is a built-in, not our custom one |
| Direct API approach in build.md | If MCP can't be fixed — bypass it entirely |

---

## INVESTIGATION STEPS

### Step 1: Verify dispatch.ts has sessionId

```bash
grep -n "sessionId" .opencode/tools/dispatch.ts | head -20
```

Expected: Multiple matches — schema definition, session reuse logic, output format.

### Step 2: Check OpenCode config

```bash
ls .opencode/
cat .opencode/config.yaml 2>/dev/null || cat .opencode/config.json 2>/dev/null || echo "No config found"
```

### Step 3: Check if there's a separate MCP dispatch definition

```bash
grep -r "mcp_dispatch\|dispatch" .opencode/ --include="*.json" --include="*.yaml" -l
```

### Step 4: Compare MCP tool schema vs dispatch.ts schema

The MCP `mcp_dispatch` tool has these params: `prompt, description, mode, model, provider, taskType, command, timeout`

dispatch.ts defines: `prompt, taskType, provider, model, mode, command, timeout, description, sessionId`

The ONLY difference is `sessionId` — missing from MCP.

### Step 5: Determine fix approach

If the MCP server is supposed to auto-register custom tools from `.opencode/tools/`:
- The `sessionId` param should be there
- A server restart should fix it
- This was noted as Discovery #6 in our session context: "OpenCode server hot-reloads tools on restart... However, the MCP tool definition cached in the calling Claude session does NOT update"

This means the MCP tool definition is CORRECT on the server, but our Claude session has a STALE cached copy without `sessionId`.

**If this is the case**: The fix is NOT code — it's operational:
1. Restart `opencode serve` (picks up latest dispatch.ts)
2. Start a NEW Claude session (picks up new MCP tool definition with sessionId)
3. The current session's cached MCP schema will never update

**Alternative fix**: Since we can't update the MCP cache in this session, we can use the direct API approach via bash `curl` calls instead of the dispatch tool.

### Step 6: Implement the chosen approach

**If stale cache is the answer**:
- Document the finding
- Update build.md to note that sessionId requires a fresh session
- Test with direct API calls as the workaround for this session

**If MCP dispatch is truly separate**:
- Find and modify the MCP dispatch implementation
- Add sessionId parameter

---

## ACCEPTANCE CRITERIA

- [x] Root cause identified (stale MCP cache OR separate implementation)
- [x] Fix implemented or workaround documented
- [ ] E2E test: `/prime` → `/execute` in same session verified — deferred (requires fresh session)

---

## COMPLETION CHECKLIST

- [x] Investigation complete
- [x] Root cause documented
- [x] Fix or workaround applied
- [x] Brief marked done: `task-1.md` → `task-1.done.md`
