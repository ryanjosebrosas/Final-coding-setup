# Task 13: Update Agent Models to Ollama Cloud + Codex

## Objective

Transition agent models to **Ollama Cloud** (remote API, no local setup) for cost efficiency, keeping Codex for ultrabrain-tier agents (sisyphus, hephaestus, oracle, momus).

## Scope

**Files touched**:
- UPDATE: `.opencode/agents/registry.ts` — Update FALLBACK_CHAINS and model assignments
- UPDATE: `.opencode/tools/delegate-task/constants.ts` — Update CATEGORY_MODEL_ROUTES (optional)

**Out of scope**: AGENTS.md (Task 11), INTEGRATION.md (Task 12)

## Prior Task Context

Tasks 1-12 completed tests and documentation. This task updates model configurations.

## Context References

### Current Model Assignments (from registry.ts)

```typescript
// Current (cloud-based):
sisyphus: claude-opus-4-6 (anthropic)
hephaestus: gpt-5.3-codex (openai)
atlas: kimi-k2.5 (bailian-coding)
prometheus: claude-opus-4-6 (anthropic)
oracle: gpt-5.2 (openai)
metis: claude-opus-4-6 (anthropic)
momus: gpt-5.2 (openai)
sisyphus-junior: claude-sonnet-4-6 (anthropic)
librarian: kimi-k2.5 (bailian-coding)
explore: grok-code-fast-1 (xai)
multimodal-looker: gemini-3-flash (ollama-cloud)
```

### Proposed Model Assignments (Ollama Cloud + Codex)

**Provider: `ollama-cloud`** — remote API access, no local setup required.

| Agent | Current | New Model | New Provider | Rationale |
|-------|---------|-----------|--------------|-----------|
| **sisyphus** | claude-opus-4-6 | gpt-5.3-codex | openai | Critical orchestrator - needs best reasoning |
| **hephaestus** | gpt-5.3-codex | gpt-5.3-codex | openai | Already Codex - deep autonomous work |
| **oracle** | gpt-5.2 | gpt-5.3-codex | openai | Architecture decisions - needs quality |
| **momus** | gpt-5.2 | gpt-5.3-codex | openai | Plan review - needs quality |
| **prometheus** | claude-opus-4-6 | qwen3-max | ollama-cloud | Interview planning - Ollama Cloud |
| **metis** | claude-opus-4-6 | qwen3-max | ollama-cloud | Gap analysis - Ollama Cloud |
| **atlas** | kimi-k2.5 | qwen3.5-plus | ollama-cloud | Todo tracking - Ollama Cloud |
| **sisyphus-junior** | claude-sonnet-4-6 | qwen3.5-plus | ollama-cloud | Category executor - Ollama Cloud |
| **librarian** | kimi-k2.5 | qwen3.5-plus | ollama-cloud | Doc search - Ollama Cloud |
| **explore** | grok-code-fast-1 | llama3.2 | ollama-cloud | Fast grep - cheap/fast |
| **multimodal-looker** | gemini-3-flash | llava:13b | ollama-cloud | Vision - Ollama Cloud |

### Key Model Info

| Model | Use Case | Notes |
|-------|----------|-------|
| **gpt-5.3-codex** | Ultrabrain agents | OpenAI, paid, highest quality |
| **qwen3-max** | Large reasoning | Ollama Cloud, good for planning/analysis |
| **qwen3.5-plus** | General purpose | Ollama Cloud, cost-effective |
| **llama3.2** | Fast tasks | Ollama Cloud, quick and cheap |
| **llava:13b** | Vision/multimodal | Ollama Cloud, image analysis |

**No local setup needed** — all Ollama models accessed via `ollama-cloud` provider.

## Step-by-Step Implementation

### Step 1: Update FALLBACK_CHAINS

**ACTION**: EDIT
**TARGET**: `.opencode/agents/registry.ts` (lines 80-92)

```typescript
// BEFORE (current):
export const FALLBACK_CHAINS = {
  sisyphus: ["kimi-k2.5", "glm-5", "big-pickle"],
  hephaestus: ["gpt-5.2"],
  oracle: ["gemini-3.1-pro", "claude-opus-4-6"],
  librarian: ["gemini-3-flash", "gpt-5.2", "glm-4.6v"],
  explore: ["minimax-m2.5", "claude-haiku-4-5", "gpt-5-nano"],
  metis: ["gpt-5.2", "kimi-k2.5", "gemini-3.1-pro"],
  momus: ["claude-opus-4-6", "gemini-3.1-pro"],
  atlas: ["claude-sonnet-4-6", "gpt-5.2"],
  prometheus: ["kimi-k2.5", "gpt-5.2", "gemini-3.1-pro"],
  sisyphusJunior: [],
  multimodalLooker: ["minimax-m2.5", "big-pickle"],
} as const

// AFTER (Ollama Cloud + Codex):
export const FALLBACK_CHAINS = {
  // Ultrabrain tier: Codex with GPT-5.2 fallback
  sisyphus: ["gpt-5.2"],
  hephaestus: ["gpt-5.2"],
  oracle: ["gpt-5.2"],
  momus: ["gpt-5.2"],

  // Medium tier: Ollama Cloud fallbacks
  prometheus: ["qwen3.5-plus"],
  metis: ["qwen3.5-plus"],
  atlas: ["llama3.2"],
  librarian: ["llama3.2"],

  // Fast tier: Ollama Cloud fallbacks
  explore: ["qwen3.5-plus"],
  multimodalLooker: ["llava:7b"],

  // Inherited from category dispatch
  sisyphusJunior: [],
} as const
```

### Step 2: Update AGENT_REGISTRY Models

**ACTION**: EDIT
**TARGET**: `.opencode/agents/registry.ts` (lines 98-241)

Update the `model` field for each agent:

```typescript
export const AGENT_REGISTRY: Record<string, AgentMetadata> = {
  sisyphus: {
    name: "sisyphus",
    displayName: "Sisyphus — Main Orchestrator",
    description: "Primary orchestrator...",
    category: "unspecified-high",
    model: "gpt-5.3-codex",        // KEPT: Codex for quality
    temperature: 0.1,
    mode: "all",
    permissions: PERMISSIONS.full,
    fallbackChain: FALLBACK_CHAINS.sisyphus,
    deniedTools: [],
  },

  hephaestus: {
    name: "hephaestus",
    displayName: "Hephaestus — Deep Autonomous Worker",
    description: "Autonomous problem-solver...",
    category: "ultrabrain",
    model: "gpt-5.3-codex",        // KEPT: Already Codex
    temperature: 0.1,
    mode: "all",
    permissions: PERMISSIONS.full,
    fallbackChain: FALLBACK_CHAINS.hephaestus,
    deniedTools: [],
  },

  atlas: {
    name: "atlas",
    displayName: "Atlas — Todo List Conductor",
    description: "Manages todo list...",
    category: "writing",
    model: "qwen3.5-plus",         // CHANGED: Ollama Cloud
    temperature: 0.1,
    mode: "primary",
    permissions: PERMISSIONS.fullNoTask,
    fallbackChain: FALLBACK_CHAINS.atlas,
    deniedTools: ["task", "call_omo_agent"],
  },

  prometheus: {
    name: "prometheus",
    displayName: "Prometheus — Strategic Interview Planner",
    description: "Interview-mode planner...",
    category: "unspecified-high",
    model: "qwen3-max",            // CHANGED: Ollama Cloud large
    temperature: 0.1,
    mode: "subagent",
    permissions: PERMISSIONS.readOnly,
    fallbackChain: FALLBACK_CHAINS.prometheus,
    deniedTools: ["write", "edit", "task"],
  },

  oracle: {
    name: "oracle",
    displayName: "Oracle — Architecture Consultant",
    description: "Read-only consultant...",
    category: "ultrabrain",
    model: "gpt-5.3-codex",        // CHANGED: Upgraded to Codex
    temperature: 0.1,
    mode: "subagent",
    permissions: PERMISSIONS.readOnly,
    fallbackChain: FALLBACK_CHAINS.oracle,
    deniedTools: ["write", "edit", "task", "call_omo_agent"],
  },

  metis: {
    name: "metis",
    displayName: "Metis — Pre-Planning Gap Analyzer",
    description: "Identifies hidden intentions...",
    category: "artistry",
    model: "qwen3-max",            // CHANGED: Ollama Cloud large
    temperature: 0.3,              // KEPT: Higher for creativity
    mode: "subagent",
    permissions: PERMISSIONS.readOnly,
    fallbackChain: FALLBACK_CHAINS.metis,
    deniedTools: ["write", "edit", "task"],
  },

  momus: {
    name: "momus",
    displayName: "Momus — Plan Reviewer",
    description: "Ruthless plan reviewer...",
    category: "ultrabrain",
    model: "gpt-5.3-codex",        // CHANGED: Upgraded to Codex
    temperature: 0.1,
    mode: "subagent",
    permissions: PERMISSIONS.readOnly,
    fallbackChain: FALLBACK_CHAINS.momus,
    deniedTools: ["write", "edit", "task"],
  },

  "sisyphus-junior": {
    name: "sisyphus-junior",
    displayName: "Sisyphus-Junior — Category Executor",
    description: "Focused executor...",
    category: "unspecified-high",
    model: "qwen3.5-plus",         // CHANGED: Ollama Cloud
    temperature: 0.1,
    mode: "all",
    permissions: PERMISSIONS.fullNoTask,
    fallbackChain: FALLBACK_CHAINS.sisyphusJunior,
    deniedTools: ["task"],
  },

  librarian: {
    name: "librarian",
    displayName: "Librarian — External Documentation",
    description: "Searches external docs...",
    category: "writing",
    model: "qwen3.5-plus",         // CHANGED: Ollama Cloud
    temperature: 0.1,
    mode: "subagent",
    permissions: PERMISSIONS.readOnly,
    fallbackChain: FALLBACK_CHAINS.librarian,
    deniedTools: ["write", "edit", "task", "call_omo_agent"],
  },

  explore: {
    name: "explore",
    displayName: "Explore — Internal Codebase Grep",
    description: "Fast contextual grep...",
    category: "deep",
    model: "llama3.2",             // CHANGED: Ollama Cloud fast
    temperature: 0.1,
    mode: "subagent",
    permissions: PERMISSIONS.readOnly,
    fallbackChain: FALLBACK_CHAINS.explore,
    deniedTools: ["write", "edit", "task", "call_omo_agent"],
  },

  "multimodal-looker": {
    name: "multimodal-looker",
    displayName: "Multimodal-Looker — PDF/Image Analysis",
    description: "Analyzes visual content...",
    category: "unspecified-low",
    model: "llava:13b",            // CHANGED: Ollama Cloud vision
    temperature: 0.1,
    mode: "subagent",
    permissions: PERMISSIONS.visionOnly,
    fallbackChain: FALLBACK_CHAINS.multimodalLooker,
    deniedTools: ["write", "edit", "bash", "grep", "task", "call_omo_agent"],
  },
} as const
```

### Step 3: Verify CATEGORY_MODEL_ROUTES

**ACTION**: REVIEW (no changes likely needed)
**TARGET**: `.opencode/tools/delegate-task/constants.ts`

Category routing already uses `ollama-cloud` for some categories. No changes needed unless you want to update these too.

Current category routes are fine:
- `visual-engineering` → `ollama-cloud` / `gemini-3-pro-preview`
- etc.

### Step 4: Run Tests

**ACTION**: RUN
**COMMAND**: `cd .opencode && bun test tests/integration/agent-resolution.test.ts`

**VALIDATE**: All tests pass with new model names

## Acceptance Criteria

- [ ] FALLBACK_CHAINS updated for all agents
- [ ] AGENT_REGISTRY model fields updated
- [ ] Codex preserved for ultrabrain agents (sisyphus, hephaestus, oracle, momus)
- [ ] Ollama Cloud for all other agents
- [ ] Tests pass

## Completion Checklist

- [ ] All model assignments updated
- [ ] Fallback chains updated
- [ ] Provider set to `ollama-cloud` (not `ollama`)
- [ ] No TypeScript errors
- [ ] Tests pass

## Handoff Notes

Phase 6 planning complete. Execute tasks in order:
1. Tasks 1-10: Integration tests
2. Task 11: Update AGENTS.md
3. Task 12: Create INTEGRATION.md
4. Task 13: Update agent models (this task)