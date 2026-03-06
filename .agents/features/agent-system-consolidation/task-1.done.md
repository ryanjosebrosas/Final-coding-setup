# Task 1: Verify Registry Completeness

## Objective

Verify that the TypeScript agent registry (`.opencode/agents/registry.ts`) has all necessary agent configurations to support the consolidated system — specifically that `explore` and `librarian` agents are properly configured for research tasks.

## Scope

### Files Touched
- `.opencode/agents/registry.ts` — VERIFY (no changes expected)

### What's Out of Scope
- Adding new agents to registry (not needed — existing agents cover all use cases)
- Modifying agent configurations (only verify they're correct)

### Dependencies
- None — this is the first task

## Prior Task Context

None — this is task 1 of 5.

---

## Context References

### `.opencode/agents/registry.ts` — Current Registry State

The registry defines 11 agents. The two most relevant for this consolidation are:

```typescript
explore: {
  name: "explore",
  displayName: "Explore — Internal Codebase Grep",
  description: "Fast contextual grep for the internal codebase. Find files, extract patterns, discover implementations.",
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
  description: "Searches external documentation and finds implementation examples from real repositories.",
  category: "writing",
  model: "kimi-k2.5",
  temperature: 0.1,
  mode: "subagent",
  permissions: PERMISSIONS.readOnly,
  fallbackChain: FALLBACK_CHAINS.librarian,
  deniedTools: ["write", "edit", "task", "call_omo_agent"],
  archonEnabled: true,
},
```

### Legacy Agent Mapping

The legacy markdown agents will be replaced by these registry agents:

| Legacy Agent | Registry Agent | Why It Works |
|--------------|----------------|--------------|
| `research-codebase` | `explore` | Both do internal codebase grep with read-only permissions |
| `research-external` | `librarian` | Both search external docs, librarian has archonEnabled |
| `planning-research` | `explore` | Search past plans is internal codebase search |
| `archon-retrieval` | `librarian` | librarian has `archonEnabled: true` for RAG integration |

---

## Patterns to Follow

### Pattern: Agent Invocation via task()

The consolidation will use these invocation patterns:

```typescript
// For codebase research (replaces research-codebase)
task(
  subagent_type="explore",
  run_in_background=true,
  load_skills=[],
  description="Find patterns for {feature}",
  prompt="I'm building {feature}. Find: integration points, patterns, gotchas..."
)

// For external docs (replaces research-external and archon-retrieval)
task(
  subagent_type="librarian",
  run_in_background=true,
  load_skills=[],
  description="Find docs for {library}",
  prompt="Find official documentation for {library}. Focus on: API usage, best practices..."
)
```

---

## Step-by-Step Tasks

### Step 1.1: Verify `explore` Agent Configuration

**IMPLEMENT**: Read and verify the explore agent has:
- `mode: "subagent"` — Can be invoked via task()
- `permissions: PERMISSIONS.readOnly` — Appropriate for research
- `archonEnabled: true` — Can use Archon RAG if available
- `fallbackChain` — Has fallback models defined

**Current Content** (from registry.ts lines 225-237):
```typescript
explore: {
  name: "explore",
  displayName: "Explore — Internal Codebase Grep",
  description: "Fast contextual grep for the internal codebase. Find files, extract patterns, discover implementations.",
  category: "deep",
  model: "deepseek-v3.2",
  temperature: 0.1,
  mode: "subagent",
  permissions: PERMISSIONS.readOnly,
  fallbackChain: FALLBACK_CHAINS.explore,
  deniedTools: ["write", "edit", "task", "call_omo_agent"],
  archonEnabled: true,
},
```

**VALIDATE**: All fields present and correct:
- [x] `mode: "subagent"` ✓
- [x] `permissions: PERMISSIONS.readOnly` ✓
- [x] `archonEnabled: true` ✓
- [x] `fallbackChain: FALLBACK_CHAINS.explore` ✓

**PATTERN**: Follow existing agent structure in registry

**GOTCHA**: The `explore` agent uses `deepseek-v3.2` as primary model — verify this model is available in the system

### Step 1.2: Verify `librarian` Agent Configuration

**IMPLEMENT**: Read and verify the librarian agent has:
- `mode: "subagent"` — Can be invoked via task()
- `permissions: PERMISSIONS.readOnly` — Appropriate for research
- `archonEnabled: true` — Can use Archon RAG if available
- `fallbackChain` — Has fallback models defined

**Current Content** (from registry.ts lines 211-223):
```typescript
librarian: {
  name: "librarian",
  displayName: "Librarian — External Documentation",
  description: "Searches external documentation and finds implementation examples from real repositories.",
  category: "writing",
  model: "kimi-k2.5",
  temperature: 0.1,
  mode: "subagent",
  permissions: PERMISSIONS.readOnly,
  fallbackChain: FALLBACK_CHAINS.librarian,
  deniedTools: ["write", "edit", "task", "call_omo_agent"],
  archonEnabled: true,
},
```

**VALIDATE**: All fields present and correct:
- [x] `mode: "subagent"` ✓
- [x] `permissions: PERMISSIONS.readOnly` ✓
- [x] `archonEnabled: true` ✓
- [x] `fallbackChain: FALLBACK_CHAINS.librarian` ✓

**PATTERN**: Follow existing agent structure in registry

**GOTCHA**: The `librarian` agent uses `kimi-k2.5` as primary model — verify this model is available

### Step 1.3: Verify Fallback Chains

**IMPLEMENT**: Check that fallback chains are properly defined

**Current Content** (from registry.ts lines 81-100):
```typescript
export const FALLBACK_CHAINS = {
  // ...
  librarian: ["deepseek-v3.2", "qwen3.5-plus", "glm-4.7"],
  explore: ["qwen3-coder-next", "kimi-k2.5", "glm-4.7"],
  // ...
} as const
```

**VALIDATE**: Both agents have fallback chains:
- [x] `explore` has 3 fallbacks: qwen3-coder-next, kimi-k2.5, glm-4.7
- [x] `librarian` has 3 fallbacks: deepseek-v3.2, qwen3.5-plus, glm-4.7

### Step 1.4: Verify AGENT_NAMES Export

**IMPLEMENT**: Check that both agents are in the exported agent names list

**Current Content** (from registry.ts lines 291-303):
```typescript
export const AGENT_NAMES: AgentName[] = [
  "sisyphus",
  "hephaestus",
  "atlas",
  "prometheus",
  "oracle",
  "metis",
  "momus",
  "sisyphus-junior",
  "librarian",
  "explore",
  "multimodal-looker",
] as const
```

**VALIDATE**: Both agents included:
- [x] `librarian` is in AGENT_NAMES
- [x] `explore` is in AGENT_NAMES

---

## Testing Strategy

### Unit Tests
- No changes to code — verification only

### Manual Verification
- Read registry.ts and confirm all checkpoints above pass

---

## Validation Commands

```bash
# L1: Lint (should pass — no changes)
npm run lint

# L2: Types (should pass — no changes)
npm run typecheck

# L3: Unit Tests (should pass — no changes)
npm run test
```

---

## Acceptance Criteria

### Implementation
- [ ] `explore` agent verified with correct config
- [ ] `librarian` agent verified with correct config
- [ ] Fallback chains verified
- [ ] AGENT_NAMES export verified

### Runtime
- [ ] No code changes needed — registry is already complete

---

## Handoff Notes

Task 1 is a verification task. The expected outcome is:
- **Registry is COMPLETE** — No modifications needed
- **Both agents are properly configured** for research tasks
- **Fallback chains exist** for resilience

Task 2 can proceed with confidence that the registry agents are ready to be invoked by updated commands.

---

## Completion Checklist

- [ ] Read registry.ts completely
- [ ] Verified explore agent config
- [ ] Verified librarian agent config
- [ ] Verified fallback chains
- [ ] Verified AGENT_NAMES export
- [ ] Confirmed no changes needed to registry
