# Agent System Consolidation — Implementation Plan

## Feature Description

Consolidate the two parallel agent systems in the OpenCode AI Coding System into a single, coherent architecture. The current system has legacy markdown agent definitions (`.opencode/agents/*.md`) referenced by commands but not actually invocable, alongside a TypeScript registry (`.opencode/agents/registry.ts`) that defines proper agents but isn't connected to commands. This feature unifies both systems by mapping legacy agent names to registry agents and updating all commands to use the correct `task(subagent_type="...")` syntax.

## User Story

As a developer using the OpenCode AI Coding System, I want the agent invocation system to work correctly, so that when `/planning` says "invoke the research-codebase subagent", the system actually does so with the proper agent configuration.

## Problem Statement

The system evolved in two directions without integration:

### Legacy Markdown Agents (Broken)
Commands reference agents via "Agent tool" syntax that doesn't exist:
```markdown
# In planning.md:
Use the Agent tool to invoke the `research-codebase` subagent
Use the Agent tool to invoke the `planning-research` subagent
```

These markdown files exist:
- `research-codebase.md` — Codebase grep
- `research-external.md` — External docs
- `planning-research.md` — Past plan search
- `plan-writer.md` — Write plan artifacts
- `code-review.md` — Code review

**But there is NO "Agent tool".** OpenCode uses `task(subagent_type="...")`.

### TypeScript Registry (Unused)
The `registry.ts` defines 11 sophisticated agents with proper configurations:
- Fallback chains
- Permission levels
- Model assignments
- Temperature settings

But NO command invokes them. The agents are orphaned.

## Solution Statement

1. **Map legacy agent concepts to registry agents:**
   | Legacy Agent | Registry Agent | Rationale |
   |--------------|----------------|-----------|
   | `research-codebase` | `explore` | Both do internal codebase grep |
   | `research-external` | `librarian` | Both search external docs |
   | `planning-research` | `explore` | Search past plans in codebase |
   | `archon-retrieval` | `librarian` | Has `archonEnabled: true` |
   | `plan-writer` | `sisyphus-junior` | Use with `category: writing` |
   | `code-review` | `sisyphus-junior` | Use with `load_skills: ["code-review"]` |

2. **Update command syntax:**
   ```typescript
   // OLD (broken)
   Use the Agent tool to invoke the `research-codebase` subagent
   
   // NEW (working)
   task(subagent_type="explore", run_in_background=true, load_skills=[], prompt="...")
   ```

3. **Delete redundant markdown agents** after verification

## Feature Metadata

| Field | Value |
|-------|-------|
| **Spec ID** | agent-system-consolidation |
| **Depth** | standard |
| **Pillar** | Core Infrastructure |
| **Dependencies** | None — self-contained refactor |
| **Estimated Tasks** | 5 |

---

## Context References

### Codebase Files

#### `.opencode/agents/registry.ts` (Lines 1-303)
The authoritative agent registry with 11 agents defined:

```typescript
// ============================================================================
// AGENT REGISTRY
// ============================================================================

export interface AgentMetadata {
  name: string
  displayName: string
  description: string
  category: string
  model: string
  temperature: number
  mode: AgentMode
  permissions: AgentPermissions
  fallbackChain: readonly string[]
  deniedTools: string[]
  archonEnabled?: boolean
}

export const AGENT_REGISTRY: Record<string, AgentMetadata> = {
  sisyphus: {
    name: "sisyphus",
    displayName: "Sisyphus — Main Orchestrator",
    description: "Primary orchestrator that manages workflow...",
    category: "unspecified-high",
    model: "claude-opus-4-5",
    temperature: 0.1,
    mode: "all",
    permissions: PERMISSIONS.full,
    fallbackChain: FALLBACK_CHAINS.sisyphus,
    deniedTools: [],
  },
  // ... 10 more agents
  explore: {
    name: "explore",
    displayName: "Explore — Internal Codebase Grep",
    description: "Fast contextual grep for the internal codebase...",
    category: "deep",
    model: "deepseek-v3.2",
    temperature: 0.1,
    mode: "subagent",
    permissions: PERMISSIONS.readOnly,
    fallbackChain: FALLBACK_CHAINS.explore,
    deniedTools: ["write", "edit", "task", "call_omo_agent"],
    archonEnabled: true,
  },
  librarian: {
    name: "librarian",
    displayName: "Librarian — External Documentation",
    description: "Searches external documentation and finds implementation examples...",
    category: "writing",
    model: "kimi-k2.5",
    temperature: 0.1,
    mode: "subagent",
    permissions: PERMISSIONS.readOnly,
    fallbackChain: FALLBACK_CHAINS.librarian,
    deniedTools: ["write", "edit", "task", "call_omo_agent"],
    archonEnabled: true,
  },
}
```

Valid `subagent_type` values: `explore`, `librarian`, `oracle`, `metis`, `momus`, `prometheus`, `sisyphus`, `hephaestus`, `atlas`, `sisyphus-junior`, `multimodal-looker`

#### `.opencode/commands/planning.md` (Lines 71-103)
The broken agent invocation syntax that needs updating:

```markdown
### 2a. Codebase research → delegate to `research-codebase` subagent (Haiku)

Use the Agent tool to invoke the `research-codebase` subagent with a prompt covering:
- Feature being built and key integration points to find
- Patterns to look for (naming conventions, error handling, testing)
- Specific files or directories likely relevant

The subagent returns: file:line references, patterns found, gotchas, integration points.

### 2b. Knowledge base (if Archon connected) → delegate to `archon-retrieval` subagent (Haiku)

Use the Agent tool to invoke the `archon-retrieval` subagent with:
- 2-5 keyword queries for the feature's key concepts
- Ask for both docs and code examples

### 2c. External docs (if needed) → delegate to `research-external` subagent (Haiku)

Use the Agent tool to invoke the `research-external` subagent with:
- Libraries/APIs involved and what specifically to look up
- Any known version constraints

### 2d. Past plans → delegate to `planning-research` subagent (Haiku)

Use the Agent tool to invoke the `planning-research` subagent with:
- Feature name and short description
- Ask it to scan `.agents/features/*/plan.done.md` for similar features
```

#### `.opencode/agents/*.md` (Legacy files to delete)
Files that will be removed after migration:
- `research-codebase.md`
- `research-external.md`
- `planning-research.md`
- `plan-writer.md`
- `code-review.md`

---

## Patterns to Follow

### Pattern 1: task() Invocation Syntax

The correct syntax for invoking agents from commands:

```typescript
// Parallel research agents (always background)
task(subagent_type="explore", run_in_background=true, load_skills=[], 
     description="Find auth implementations", 
     prompt="I'm implementing JWT auth. Find: auth middleware, login handlers...")

task(subagent_type="librarian", run_in_background=true, load_skills=[], 
     description="Find JWT best practices", 
     prompt="Find OWASP auth guidelines, JWT security best practices...")

// Category-based dispatch with skills
task(category="writing", load_skills=["planning-methodology"], 
     description="Write plan artifact",
     prompt="Create plan.md for feature X...")

task(category="deep", load_skills=["code-review"], 
     description="Review auth changes",
     prompt="Review changes in src/auth/...")
```

### Pattern 2: Agent Name Mapping

| Legacy Concept | New Invocation |
|----------------|----------------|
| "invoke research-codebase" | `task(subagent_type="explore", ...)` |
| "invoke research-external" | `task(subagent_type="librarian", ...)` |
| "invoke planning-research" | `task(subagent_type="explore", ...)` |
| "invoke archon-retrieval" | `task(subagent_type="librarian", ...)` |
| "invoke plan-writer" | `task(category="writing", load_skills=["planning-methodology"], ...)` |
| "invoke code-review" | `task(category="deep", load_skills=["code-review"], ...)` |

### Pattern 3: Command Markdown Update

Before:
```markdown
### 2a. Codebase research → delegate to `research-codebase` subagent (Haiku)

Use the Agent tool to invoke the `research-codebase` subagent with a prompt covering:
- Feature being built and key integration points to find
```

After:
```markdown
### 2a. Codebase research → `explore` agent

Invoke the explore agent for internal codebase search:

```typescript
task(
  subagent_type="explore",
  run_in_background=true,
  load_skills=[],
  description="Find patterns for {feature}",
  prompt=`
    I'm building {feature description}. Find:
    - Key integration points in {likely directories}
    - Naming conventions and patterns used
    - Error handling approaches
    - Test patterns if they exist
    
    Return: file:line references, patterns found, gotchas, integration points.
  `
)
```
```

---

## Implementation Plan

### Phase 1: Registry Updates (Task 1)
Ensure the registry has all necessary agent configurations for the consolidated system.

### Phase 2: Command Updates (Tasks 2-3)
Update all commands to use the correct `task()` syntax with registry agents.

### Phase 3: Cleanup (Tasks 4-5)
Remove legacy markdown agents and verify the system works end-to-end.

---

## Step-by-Step Tasks

### Task 1: Verify Registry Completeness
- **ACTION**: VERIFY
- **TARGET**: `.opencode/agents/registry.ts`
- **SCOPE**: Confirm `explore` and `librarian` agents have the right configs for research tasks
- **VALIDATE**: `npm run typecheck`

### Task 2: Update `/planning` Command
- **ACTION**: UPDATE
- **TARGET**: `.opencode/commands/planning.md`
- **SCOPE**: Replace all "Agent tool" references with `task(subagent_type="...")` syntax
- **VALIDATE**: Manual review of syntax correctness

### Task 3: Update `/code-review` Command
- **ACTION**: UPDATE
- **TARGET**: `.opencode/commands/code-review.md`
- **SCOPE**: Update any agent invocation references
- **VALIDATE**: Manual review

### Task 4: Delete Legacy Markdown Agents
- **ACTION**: DELETE
- **TARGET**: `.opencode/agents/research-codebase.md`, `research-external.md`, `planning-research.md`, `plan-writer.md`, `code-review.md`
- **SCOPE**: Remove files no longer needed
- **VALIDATE**: `git status` shows deletions

### Task 5: Update AGENTS.md Agent Reference Table
- **ACTION**: UPDATE
- **TARGET**: `AGENTS.md`
- **SCOPE**: Ensure Agent Reference section matches registry.ts exactly
- **VALIDATE**: Compare with registry.ts programmatically

---

## Testing Strategy

### Unit Tests
- No new unit tests required — this is documentation/config refactoring

### Integration Tests
- Manual test: Run `/planning test-feature` and verify explore/librarian agents are invoked
- Manual test: Run `/code-review` and verify review agent is invoked

### Edge Cases
- Command with no agent invocation — should work unchanged
- Command with multiple agent invocations — all should use new syntax

---

## Validation Commands

```bash
# L1: Lint
npm run lint

# L2: Types
npm run typecheck

# L3: Unit Tests
npm run test

# L4: Integration Tests
# Manual: Run /planning and /code-review commands

# L5: Manual
# Verify commands invoke correct agents by checking task() output
```

---

## Acceptance Criteria

### Implementation
- [ ] All "Agent tool" references replaced with `task(subagent_type="...")` in planning.md
- [ ] All "Agent tool" references replaced in code-review.md (if any)
- [ ] Legacy markdown agents deleted (5 files)
- [ ] AGENTS.md Agent Reference table matches registry.ts

### Runtime
- [ ] `/planning {feature}` invokes explore and librarian agents correctly
- [ ] `/code-review` works without errors
- [ ] No references to deleted agent files remain

---

## Completion Checklist

- [ ] All tasks implemented
- [ ] All validation commands pass
- [ ] Code follows project patterns
- [ ] No new lint/type errors introduced
- [ ] Documentation updated (AGENTS.md)

---

## Notes

### Key Decisions
1. **Map to existing agents, don't create new ones** — `explore` and `librarian` already cover research needs
2. **Use category dispatch for writing tasks** — `plan-writer` becomes `task(category="writing", ...)`
3. **Use skill loading for code review** — `task(category="deep", load_skills=["code-review"], ...)`

### Risks
1. **Commands may have edge cases** — Some commands might reference agents in unexpected ways
   - Mitigation: Grep for "Agent tool", "subagent", "invoke" across all commands
2. **Broken invocations won't fail loudly** — Markdown is documentation, not code
   - Mitigation: Manual testing of each updated command

### Confidence
8/10 — The mapping is straightforward and the registry is well-structured. Main uncertainty is whether all agent references have been identified.

---

## TASK INDEX

| Task | Brief Path | Scope | Status | Files |
|------|-----------|-------|--------|-------|
| 1 | `task-1.md` | Verify registry has explore/librarian configs | pending | 1 verified |
| 2 | `task-2.md` | Update /planning command syntax | pending | 1 modified |
| 3 | `task-3.md` | Update /code-review command syntax | pending | 1 modified |
| 4 | `task-4.md` | Delete legacy markdown agents | pending | 5 deleted |
| 5 | `task-5.md` | Update AGENTS.md agent reference | pending | 1 modified |
