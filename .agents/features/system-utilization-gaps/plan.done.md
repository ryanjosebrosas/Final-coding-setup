# system-utilization-gaps — Implementation Plan

## Feature Description

Closes the 5 utilization gaps discovered during a full audit of the opencode-ai-coding-system.
The system was built with deeper capabilities than it was using — this plan activates all of them.
Changes are additive config and documentation edits; no new TypeScript logic is introduced.

## User Story

As a developer using opencode-ai-coding-system, I want every configured capability to actually
fire at runtime — so the pipeline-hook surfaces pending work, Archon RAG enhances research,
hephaestus gets routed to for hard tasks, debug logging is visible, and all 5 audit gaps are
permanently closed.

## Problem Statement

The audit found 5 gaps:
1. `pipeline-hook` exists and is fully implemented but was never exported from `hooks/index.ts`
   — so OpenCode never loads it. Session-start reminders don't fire.
2. Archon MCP is wired throughout the codebase (112 references) but `mcps: {}` in
   oh-my-opencode.jsonc means it's never connected. Every RAG step silently falls back.
3. `hephaestus` is defined and configured but missing from the Delegation Table in AGENTS.md
   — no clear trigger criteria, so it never gets called.
4. `disabled_agents/hooks/commands/skills` arrays are all empty with no documentation of
   when/why to use them — cost-control levers invisible to users.
5. `experimental.debug_logging: false` — no observability into hook execution or model routing.

## Solution Statement

Five targeted edits across four files plus one new file:

1. **`hooks/index.ts`** — add one export line for `createPipelineHook` from `./pipeline-hook`
2. **`opencode.json`** (new, project root) — native OpenCode remote MCP config for Archon
3. **`oh-my-opencode.jsonc`** — flip `debug_logging` to `true`; add comment on McpConfig scope
4. **`AGENTS.md`** — add `hephaestus` entry to Delegation Table with explicit trigger criteria
5. **`README.md`** — update the system-utilization section to reflect all gaps resolved

## Feature Metadata

- Spec ID: system-utilization-gaps
- Depth: standard
- Dependencies: none (all changes are additive)
- Estimated tasks: 5
- Test impact: existing 512 tests remain passing; no new test files needed

## Context References

### Codebase Files

- `.opencode/hooks/index.ts:70-86` — Transform + Skill tier where pipeline-hook export belongs
- `.opencode/hooks/pipeline-hook/index.ts:1-124` — The fully implemented hook awaiting export
- `.opencode/oh-my-opencode.jsonc:68-79` — disabled arrays, mcps, experimental section
- `.opencode/core/types.ts:54-58` — McpConfig type (stdio only: command/args/env)
- `AGENTS.md:397-407` — Delegation Table, missing hephaestus
- `AGENTS.md:463-464` — "When to Use Each Agent" table that mentions hephaestus but Delegation Table doesn't
- `.opencode/reference/model-strategy.md:194-208` — Archon endpoint documented as `http://159.195.45.47:8051/mcp`
- `.opencode/reference/archon-workflow.md:1-60` — Archon task + RAG workflow patterns

### Key Architectural Finding

`oh-my-opencode.jsonc`'s `mcps` field uses the **stdio** McpConfig schema (`command`/`args`/`env`).
Archon is an HTTP/remote MCP server. OpenCode's native config handles remote MCPs with:
```json
{
  "mcp": {
    "archon": {
      "type": "remote",
      "url": "http://159.195.45.47:8051/mcp"
    }
  }
}
```
This goes in `opencode.json` at the project root — OpenCode discovers it automatically.

## Patterns to Follow

### Pattern 1: Hook export pattern (hooks/index.ts)
```typescript
// Every hook follows this exact pattern in hooks/index.ts:

// Comment Checker - Check for AI comments
export { createCommentCheckerHooks } from "./comment-checker"

// Directory Agents Injector - Inject AGENTS.md
export { createDirectoryAgentsInjectorHook } from "./directory-agents-injector"

// Pipeline Hook - the missing entry should follow the same format:
// Pipeline Hook - Surface pending work on session start
export { createPipelineHook, createPipelineHookFactory } from "./pipeline-hook"
```

### Pattern 2: oh-my-opencode.jsonc experimental block
```jsonc
// Current:
  "experimental": {
    "debug_logging": false
  }

// After:
  "experimental": {
    "debug_logging": true
  }
```

### Pattern 3: AGENTS.md Delegation Table entry format
```markdown
// Current entries follow this format:
- **Architecture decisions** → `oracle` — Multi-system tradeoffs, unfamiliar patterns
- **Hard debugging** → `oracle` — After 2+ failed fix attempts

// hephaestus entry should follow the same pattern:
- **Complex implementation** → `hephaestus` — Multi-file logic, algorithms, hard autonomous work
- **Hard debugging (implementation)** → `hephaestus` — When oracle diagnosis is done, needs actual fixing
```

### Pattern 4: OpenCode native MCP config (opencode.json)
```json
{
  "$schema": "https://opencode.ai/config.schema.json",
  "mcp": {
    "archon": {
      "type": "remote",
      "url": "http://159.195.45.47:8051/mcp",
      "enabled": true
    }
  }
}
```

## Implementation Plan

### Wave 1 — Independent (Tasks 1, 2, 3, 4 can run in parallel)
- Task 1: Export pipeline-hook in hooks/index.ts
- Task 2: Create opencode.json with Archon remote MCP config
- Task 3: Update oh-my-opencode.jsonc (debug_logging + comment)
- Task 4: Add hephaestus to AGENTS.md Delegation Table

### Wave 2 — Depends on Wave 1 complete
- Task 5: Update README.md to reflect resolved gaps

## Step-by-Step Tasks

### Task 1: Export pipeline-hook
- **ACTION**: UPDATE
- **TARGET**: `.opencode/hooks/index.ts`
- **IMPLEMENT**: Add export block for `createPipelineHook` and `createPipelineHookFactory`
  after the Transform tier placeholder comment (line 79) and before the Skill tier (line 84)
- **PATTERN**: Match exact comment style and export syntax of adjacent exports
- **GOTCHA**: Export BOTH `createPipelineHook` AND `createPipelineHookFactory` — both are
  exported from the hook's own index.ts and may be used by downstream consumers
- **VALIDATE**: `tsc --noEmit` clean; `grep -r "createPipelineHook" .opencode/hooks/index.ts`
  returns a match

### Task 2: Create opencode.json (Archon MCP)
- **ACTION**: CREATE
- **TARGET**: `opencode.json` (project root)
- **IMPLEMENT**: Native OpenCode remote MCP config for Archon at `http://159.195.45.47:8051/mcp`
- **PATTERN**: OpenCode remote MCP schema: `type: "remote"`, `url`, `enabled`
- **GOTCHA**: This is NOT in oh-my-opencode.jsonc — that file's McpConfig type only supports
  stdio. Remote MCPs must go in OpenCode's native config file at the project root.
- **VALIDATE**: File exists at project root; JSON is valid; `opencode run "/prime"` shows
  Archon MCP connected in the Archon Status section of prime output

### Task 3: Update oh-my-opencode.jsonc
- **ACTION**: UPDATE
- **TARGET**: `.opencode/oh-my-opencode.jsonc`
- **IMPLEMENT**: Two changes:
  1. Flip `experimental.debug_logging` from `false` to `true`
  2. Add a comment above `mcps` explaining that remote MCPs go in `opencode.json`
- **PATTERN**: Existing jsonc comment style uses `//` inline comments
- **GOTCHA**: jsonc allows `//` comments but standard JSON parsers don't — only add comments
  in places that are already commented or where jsonc is the explicit format
- **VALIDATE**: File is valid JSONC; `debug_logging` is `true`

### Task 4: Add hephaestus to AGENTS.md Delegation Table
- **ACTION**: UPDATE
- **TARGET**: `AGENTS.md`
- **IMPLEMENT**: Add two hephaestus entries to the Delegation Table at lines 397-407,
  with explicit trigger criteria distinguishing it from oracle (oracle = consult,
  hephaestus = implement)
- **PATTERN**: Match existing delegation table entry format exactly
- **GOTCHA**: The "When to Use Each Agent" table (line 464) already mentions hephaestus
  correctly — the Delegation Table must be consistent with it, not contradict it
- **VALIDATE**: `grep "hephaestus" AGENTS.md` shows entry in Delegation Table section

### Task 5: Update README.md
- **ACTION**: UPDATE
- **TARGET**: `README.md`
- **IMPLEMENT**: In the agent architecture section or a new "System Utilization" section,
  note that all 5 audit gaps are now resolved. Update any statements that imply
  hephaestus is unused or Archon is not connected.
- **PATTERN**: Match existing README section style (prose, no bullet overload)
- **VALIDATE**: No stale "gap" language remains in README

## Testing Strategy

### Validation Pyramid

- **L1 (Syntax)**: JSON/JSONC files parse without error
- **L2 (Types)**: `tsc --noEmit` passes (no TypeScript changes, but verify import is clean)
- **L3 (Unit)**: `npm run test` — existing 512 tests must still pass
- **L4 (Integration)**: `opencode run "/prime"` shows Archon connected and pipeline-hook fires
- **L5 (Manual)**: Start a session — session-start should show pipeline handoff reminder if
  `.agents/context/next-command.md` has pending work

### No new test files needed
All changes are config/docs. The 512 existing tests cover the TypeScript that pipeline-hook
calls (handoff, state-machine, commands). If the export is syntactically correct and types
check, the hook works.

## Validation Commands

```bash
# L1: JSON validity
node -e "JSON.parse(require('fs').readFileSync('opencode.json','utf8'))"

# L2: TypeScript
cd .opencode && npx tsc --noEmit

# L3: Unit tests
cd .opencode && npm test

# L4: Grep verification
grep "createPipelineHook" .opencode/hooks/index.ts
grep "hephaestus" AGENTS.md | head -5
grep "debug_logging" .opencode/oh-my-opencode.jsonc
grep "archon" opencode.json
```

## Acceptance Criteria

### Implementation
- [ ] `hooks/index.ts` exports `createPipelineHook` and `createPipelineHookFactory`
- [ ] `opencode.json` exists at project root with Archon remote MCP config
- [ ] `oh-my-opencode.jsonc` has `debug_logging: true`
- [ ] `oh-my-opencode.jsonc` has a comment explaining remote MCPs go in `opencode.json`
- [ ] `AGENTS.md` Delegation Table includes `hephaestus` with trigger criteria
- [ ] `README.md` reflects resolved gaps (no stale "unused" language)

### Runtime
- [ ] `tsc --noEmit` clean
- [ ] All 512 tests pass
- [ ] `opencode.json` is valid JSON

## Completion Checklist
- [ ] All 5 tasks implemented
- [ ] Validation commands pass
- [ ] No new TypeScript errors
- [ ] README updated
- [ ] Pipeline handoff written

## Notes

- **Key decision**: Archon goes in `opencode.json` (native OpenCode remote MCP), not
  `oh-my-opencode.jsonc` (stdio-only McpConfig schema)
- **Confidence**: 9/10 — all changes are additive config edits with no logic changes
- **Risk**: The one unknown is whether OpenCode's project-level `opencode.json` remote MCP
  config is discovered automatically. If not, user may need to add it to their global
  OpenCode config instead.

---

## TASK INDEX

| Task | Brief Path | Scope | Status | Files |
|------|-----------|-------|--------|-------|
| 1 | `task-1.md` | Export pipeline-hook from hooks/index.ts | pending | 0 created, 1 modified |
| 2 | `task-2.md` | Create opencode.json with Archon remote MCP config | pending | 1 created, 0 modified |
| 3 | `task-3.md` | Update oh-my-opencode.jsonc (debug_logging + comment) | pending | 0 created, 1 modified |
| 4 | `task-4.md` | Add hephaestus to AGENTS.md Delegation Table | pending | 0 created, 1 modified |
| 5 | `task-5.md` | Update README.md to reflect resolved gaps | pending | 0 created, 1 modified |
