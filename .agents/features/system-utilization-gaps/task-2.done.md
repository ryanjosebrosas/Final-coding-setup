# Task 2: Create opencode.json with Archon Remote MCP Config

## Objective
Create `opencode.json` at the project root to configure Archon as a remote MCP server,
so every command that calls `rag_search_knowledge_base`, `manage_task`, etc. actually
connects to the running Archon instance at `http://159.195.45.47:8051/mcp`.

## Scope
- **Files created**: `opencode.json` at project root (1 file)
- **Files modified**: none
- **Out of scope**: Do NOT touch `oh-my-opencode.jsonc` in this task (that's Task 3)
- **Dependencies**: none — Wave 1, fully independent

## Prior Task Context
None. This is a Wave 1 task independent of all others.

## Critical Architectural Context

### Why NOT oh-my-opencode.jsonc?

`oh-my-opencode.jsonc` uses this McpConfig type (`.opencode/core/types.ts:54-58`):

```typescript
export interface McpConfig {
  command?: string   // stdio: the executable to run
  args?: string[]    // stdio: arguments to the executable
  env?: Record<string, string>  // stdio: environment variables
}
```

This is **stdio transport only** — it launches a local process. Archon is a remote HTTP
server. OpenCode's native config supports remote MCPs with a different schema:

```json
{
  "mcp": {
    "server-name": {
      "type": "remote",
      "url": "http://host:port/mcp",
      "enabled": true
    }
  }
}
```

OpenCode discovers `opencode.json` at the project root automatically — same convention
as `oh-my-opencode.jsonc`. This is where Archon must go.

### Archon Server Details
- **Endpoint**: `http://159.195.45.47:8051/mcp`
- **Transport**: HTTP (streamable HTTP / MCP over HTTP)
- **Auth**: None (open server)
- **Already documented**: `.opencode/reference/model-strategy.md:207`

### Archon MCP Tools Available
Once connected, these tools become available to the agent:
```
rag_search_knowledge_base    — Search curated documentation (2-5 keyword queries)
rag_search_code_examples     — Find reference code implementations
rag_read_full_page           — Read full documentation pages
rag_get_available_sources    — List indexed documentation sources
manage_task / find_tasks     — Persistent task tracking across sessions
manage_project / find_projects — Project and version management
health_check                 — Verify Archon is running
session_info                 — Current session metadata
```

## Context References

### Reference: model-strategy.md Archon section (lines 194-208)
```markdown
## MCP Server: Archon (Remote — RAG + Task Management)

[Archon MCP](https://github.com/coleam00/archon) provides curated knowledge base and task tracking.

| Tool | Purpose |
|------|---------|
| `rag_search_knowledge_base` | Search curated documentation (2-5 keyword queries) |
| `rag_search_code_examples` | Find reference code implementations |
| `rag_read_full_page` | Read full documentation pages |
| `rag_get_available_sources` | List indexed documentation sources |
| `manage_task` / `find_tasks` | Persistent task tracking across sessions |
| `manage_project` / `find_projects` | Project and version management |

**Endpoint**: `http://159.195.45.47:8051/mcp`
**Status**: Optional — all commands degrade gracefully if unavailable.
```

### Reference: archon-workflow.md key workflow (lines 1-30)
```markdown
# CRITICAL: ARCHON-FIRST RULE - READ THIS FIRST

**BEFORE doing ANYTHING else, when you see ANY task management scenario:**
1. STOP and check if Archon MCP server is available
2. Use Archon task management as PRIMARY system

## Core Workflow: Task-Driven Development

**MANDATORY task cycle before coding:**

1. **Get Task** → `find_tasks(task_id="...")` or `find_tasks(filter_by="status", filter_value="todo")`
2. **Start Work** → `manage_task("update", task_id="...", status="doing")`
3. **Research** → Use knowledge base (see RAG workflow below)
4. **Implement** → Write code based on research
5. **Review** → `manage_task("update", task_id="...", status="review")`
6. **Next Task** → `find_tasks(filter_by="status", filter_value="todo")`
```

## Patterns to Follow

### Pattern: OpenCode remote MCP config schema
Based on OpenCode documentation:
```json
{
  "mcp": {
    "github": {
      "type": "remote",
      "url": "https://api.example.com/mcp/github",
      "enabled": true
    }
  }
}
```

For local stdio MCPs (for reference — NOT what we need here):
```json
{
  "mcp": {
    "filesystem": {
      "type": "local",
      "command": ["npx", "-y", "@modelcontextprotocol/server-filesystem", "/path"],
      "enabled": true
    }
  }
}
```

### Pattern: OpenCode project config file
OpenCode auto-discovers `opencode.json` at the project root — same convention as
`oh-my-opencode.jsonc`. No manual registration needed.

## Step-by-Step Implementation

### Step 1: Check if opencode.json already exists
```bash
ls opencode.json 2>/dev/null && echo "EXISTS" || echo "NOT FOUND"
```
If it exists, read it first before writing — merge, don't overwrite.

### Step 2: Create opencode.json

**CREATE** `opencode.json` at project root with this exact content:

```json
{
  "mcp": {
    "archon": {
      "type": "remote",
      "url": "http://159.195.45.47:8051/mcp",
      "enabled": true
    }
  }
}
```

**Notes on each field**:
- `"archon"` — the key name. This becomes the MCP server identifier in OpenCode. Keep it
  lowercase, matches the name used throughout all command files and reference docs.
- `"type": "remote"` — tells OpenCode this is an HTTP server, not a local process
- `"url"` — the exact endpoint from model-strategy.md
- `"enabled": true` — explicit enable; some OpenCode configs support disabling MCPs without
  removing the entry

### Step 3: Verify JSON is valid

```bash
node -e "JSON.parse(require('fs').readFileSync('opencode.json','utf8')); console.log('valid')"
```

Expected output: `valid`

### Step 4: Verify Archon server is reachable (optional but recommended)

```bash
curl -s -o /dev/null -w "%{http_code}" http://159.195.45.47:8051/mcp
```

Expected: HTTP 200 or 405 (method not allowed on GET — normal for MCP endpoints that
expect POST). A 200 or 4xx confirms the server is reachable. A connection error or
timeout means the server may be down — note this in evidence but proceed; the config
is correct, the server may simply not be running at the time of the test.

## QA Scenarios

### Scenario 1: File exists and is valid JSON
**Tool**: Bash
**Steps**:
1. `ls opencode.json`
2. `node -e "JSON.parse(require('fs').readFileSync('opencode.json','utf8')); console.log('VALID JSON')"`
**Expected**: File exists; output is `VALID JSON`
**Evidence**: `.agents/features/system-utilization-gaps/evidence/task-2-json-valid.txt`

### Scenario 2: Archon key is present with correct URL
**Tool**: Bash
**Steps**:
1. `node -e "const c=JSON.parse(require('fs').readFileSync('opencode.json','utf8')); console.log(c.mcp.archon.url)"`
**Expected**: `http://159.195.45.47:8051/mcp`
**Evidence**: Terminal output

### Scenario 3: Server reachability check
**Tool**: Bash
**Steps**:
1. `curl -s -o /dev/null -w "%{http_code}" http://159.195.45.47:8051/mcp || echo "unreachable"`
**Expected**: Returns an HTTP status code (200, 4xx, or 5xx) — not `unreachable`
**Evidence**: `.agents/features/system-utilization-gaps/evidence/task-2-archon-reachable.txt`

## Validation Commands

```bash
# L1: File exists
ls opencode.json

# L2: Valid JSON
node -e "JSON.parse(require('fs').readFileSync('opencode.json','utf8')); console.log('valid')"

# L3: Correct URL in config
node -e "const c=JSON.parse(require('fs').readFileSync('opencode.json','utf8')); console.log(c.mcp.archon.url)"

# L4: Server reachability
curl -I http://159.195.45.47:8051/mcp 2>&1 | head -5
```

## Acceptance Criteria

### Implementation
- [ ] `opencode.json` exists at project root
- [ ] File is valid JSON (no syntax errors)
- [ ] Contains `mcp.archon.type === "remote"`
- [ ] Contains `mcp.archon.url === "http://159.195.45.47:8051/mcp"`
- [ ] Contains `mcp.archon.enabled === true`

### Runtime
- [ ] `node -e "JSON.parse(...)"` exits 0 on the file
- [ ] Archon server responds (or is noted as temporarily offline)

## Parallelization
- **Wave**: 1 — no dependencies
- **Can Parallel**: YES — fully independent of Tasks 1, 3, 4
- **Blocks**: Task 5 (README)
- **Blocked By**: nothing

## Handoff Notes
After this task, Tasks 1/3/4 can complete in any order. Task 5 waits for all four.

## Completion Checklist
- [ ] `opencode.json` created at project root
- [ ] Valid JSON confirmed
- [ ] URL and type fields correct
- [ ] Evidence saved
