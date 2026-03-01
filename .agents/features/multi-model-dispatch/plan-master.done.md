# Feature: Multi-Model Dispatch Integration

## Feature Description

Build the two missing dispatch tools (`dispatch.ts` and `batch-dispatch.ts`) plus a context primer document (`_dispatch-primer.md`) that together unlock the full multi-model orchestration system designed in `model-strategy.md`. These tools let every command in the system delegate implementation, review, and validation work to free ZAI, Bailian, and Ollama-Cloud models — while Claude Opus only handles orchestration and strategy. The council tool already exists and proves the server API works; dispatch and batch-dispatch complete the tooling trifecta.

## User Story

As a developer using this AI coding system, I want commands like `/execute`, `/code-review`, and `/code-loop` to automatically dispatch work to free models on my ZAI/Bailian/Ollama-Cloud subscriptions, so that Claude Opus is reserved for orchestration while implementation and review happen at zero cost.

## Problem Statement

The system has a detailed 199-line model strategy (`model-strategy.md`) defining 30+ models across 5 providers, 27+ task type routings, 10 batch patterns, a 5-tier cascade, and smart escalation rules. But only the council tool is implemented. The two workhorses — `dispatch` (single-model) and `batch-dispatch` (parallel multi-model) — are referenced by 10+ commands but don't exist.

The result: Claude Opus does everything. Implementation, review, validation, commit messages, PR descriptions — all burned on the most expensive subscription. Meanwhile, free subscriptions (ZAI with GLM-5/4.5/4.7, Bailian with Qwen3.5-plus/Qwen3-max/Kimi-K2, Ollama-Cloud with DeepSeek/Cogito/Devstral/Gemini/Mistral) sit idle. The system was designed for multi-model orchestration but can only execute single-model.

## Solution Statement

- **Decision 1**: Build `dispatch.ts` as a standalone OpenCode tool (same pattern as `council.ts`) with two modes: `text` (prompt → response) via the standard message endpoint, and `agent` (full tool access) via `SubtaskPartInput` — because the OpenCode server already natively supports both dispatch types through its session/message API.
- **Decision 2**: Build `batch-dispatch.ts` as a separate tool (not merged into dispatch) that dispatches the same prompt to N models in parallel and produces a comparison report — because batch operations have different orchestration concerns (parallel execution, consensus analysis, wall-time tracking) that would bloat a single-dispatch tool.
- **Decision 3**: NO primer document — agent mode models have full OpenCode sessions and read `AGENTS.md`, commands, and project files themselves. Text mode prompts come from the calling command with sufficient context. The dispatch tool is a thin router, not a prompt factory. Context responsibility belongs to the caller, not the transport layer.
- **Decision 4**: Implement taskType auto-routing in dispatch (not in commands) — because centralizing the routing table in one tool means commands just pass `taskType: "code-review"` and the tool resolves it to the correct provider/model. No routing logic scattered across 10 command files.
- **Decision 6**: Three dispatch modes: `text` (prompt → response), `agent` (full OpenCode session via SubtaskPartInput), and `command` (dispatch a slash command via the command endpoint). Command mode is the most structured way to delegate PIV loop work — the model enters the command workflow directly.
- **Decision 5**: Split into 2 phases because dispatch is the foundation that batch-dispatch builds on — batch-dispatch internally calls dispatch per model.

## Feature Metadata

- **Feature Type**: New Capability
- **Estimated Complexity**: High
- **Primary Systems Affected**: `.opencode/tools/` (new tools), `.opencode/reference/` (primer doc)
- **Dependencies**: `@opencode-ai/plugin` (already installed), `opencode serve` running at `http://127.0.0.1:4096`
- **Total Phases**: 2
- **Total Estimated Tasks**: 8 (4 per phase)

### Slice Guardrails (Whole Feature)

- **Single Outcome**: Both model-strategy dispatch tools exist and are functional: `dispatch.ts` and `batch-dispatch.ts`
- **Expected Files Touched**:
  - `.opencode/tools/dispatch.ts` — CREATE (Phase 1)
  - `.opencode/tools/batch-dispatch.ts` — CREATE (Phase 2)
- **Scope Boundary**: Does NOT modify any command files (commands already reference dispatch/batch-dispatch with correct signatures). Does NOT modify `council.ts`. Does NOT change `model-strategy.md`. Does NOT add new providers or models.
- **Split Trigger**: If testing reveals that commands need signature changes to work with the tools, create a follow-up plan for command updates.

---

## PHASE BREAKDOWN

### Phase 1: dispatch.ts (thin orchestration router)

- **Scope**: Build the single-model dispatch tool with text/agent/command modes, taskType auto-routing across 5 tiers (55+ task types), T0 planning cascade fallback, and session management. Agent mode gives models full OpenCode sessions — they read files, run commands, follow the PIV loop. No primer document needed.
- **Files Touched**:
  - `.opencode/tools/dispatch.ts` — CREATE: ~400-500 lines TypeScript tool
- **Dependencies**: None — this is the foundation
- **Sub-Plan Path**: `.agents/features/multi-model-dispatch/plan-phase-1.md`
- **Estimated Tasks**: 3

### Phase 2: batch-dispatch.ts

- **Scope**: Build the parallel multi-model dispatch tool with 10 pre-defined batch patterns, wall-time reporting, consensus scoring, custom model lists, and integration with the smart escalation rules.
- **Files Touched**:
  - `.opencode/tools/batch-dispatch.ts` — CREATE: ~500-600 lines TypeScript tool
- **Dependencies**: Phase 1 must complete first (batch-dispatch imports/reuses dispatch patterns)
- **Sub-Plan Path**: `.agents/features/multi-model-dispatch/plan-phase-2.md`
- **Estimated Tasks**: 4

---

## SHARED CONTEXT REFERENCES

### Relevant Codebase Files

> IMPORTANT: The execution agent MUST read these files before implementing ANY phase!

- `.opencode/tools/council.ts` (all 759 lines) — Why: The ONLY implemented tool. Provides the exact pattern for: `tool()` definition, OpenCode server API interaction, session lifecycle, error handling, response extraction, timeout management, and auto-archiving. **Every design decision in dispatch.ts must mirror council.ts patterns.**

- `.opencode/reference/model-strategy.md` (all 199 lines) — Why: The AUTHORITATIVE design document. Contains: 5-tier overview, taskType routing table (27+ types), dispatch modes (text/agent), batch patterns (10 pre-defined), smart escalation rules, cascade review-fix loop, and per-spec depth matrix. **This is the spec we're implementing.**

- `.opencode/node_modules/@opencode-ai/sdk/dist/v2/gen/types.gen.d.ts` (lines 242-254, 1452-1473, 2635-2663, 2885-2912) — Why: Contains `SubtaskPartInput` (agent mode), `SubtaskPart` response type, message prompt body shape, and `SessionCommandData` (command mode dispatch). **Critical for understanding how agent and command modes work.**

- `.opencode/node_modules/@opencode-ai/plugin/dist/tool.d.ts` (all ~30 lines) — Why: The `tool()` function signature and `ToolContext` type. Shows how tools are defined, registered, and what context they receive.

- `.opencode/node_modules/@opencode-ai/plugin/dist/index.d.ts` (relevant types) — Why: Full `Hooks`, `Plugin`, `PluginInput` types and available exports.

### New Files to Create (Across All Phases)

- `.opencode/tools/dispatch.ts` — Thin dispatch router with text/agent/command modes and taskType routing
- `.opencode/tools/batch-dispatch.ts` — Parallel multi-model dispatch with batch patterns and consensus

### Related Memories (from memory.md)

No relevant memories found in memory.md (memory.md does not exist in this repo).

### Relevant Documentation

- OpenCode Plugin API — Already available via local `@opencode-ai/plugin` types in `node_modules/`
- OpenCode SDK — Already available via local `@opencode-ai/sdk` types in `node_modules/`

### Patterns to Follow

**Pattern 1: Tool definition** (from `.opencode/tools/council.ts:1-28`):
```typescript
import { tool } from "@opencode-ai/plugin"

const OPENCODE_URL = "http://127.0.0.1:4096"
const DEFAULT_TIMEOUT_MS = 90000

const COUNCIL_MODELS = {
  quick: [
    { provider: "zai-coding-plan", model: "glm-5", label: "GLM-5" },
    // ...
  ],
  standard: [ /* ... */ ],
}

export default tool({
  description: "Run multi-model council discussion...",
  args: {
    topic: tool.schema.string().describe("The topic..."),
    quick: tool.schema.boolean().optional().describe("Use 3 models..."),
  },
  async execute(args, context) {
    // ... implementation
    return "formatted output string"
  }
})
```
- Why this pattern: All tools in `.opencode/tools/` must follow this exact structure. The `tool()` wrapper, `tool.schema` for Zod args, and `export default` are non-negotiable.
- Common gotchas: `execute()` must return `Promise<string>`. All output goes through the return value — no console.log or side channels.

**Pattern 2: Server health check + session creation** (from `.opencode/tools/council.ts:105-150`):
```typescript
async function checkServerHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${OPENCODE_URL}/global/health`, {
      signal: AbortSignal.timeout(5000),
    })
    const data = await response.json()
    return data?.healthy === true
  } catch {
    return false
  }
}

async function createSession(title: string, parentID?: string): Promise<string | null> {
  try {
    const body: any = { title }
    if (parentID) body.parentID = parentID
    const response = await fetch(`${OPENCODE_URL}/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    if (!response.ok) return null
    const data = await response.json()
    return data?.id || null
  } catch {
    return null
  }
}
```
- Why this pattern: Graceful degradation — returns `null` on failure instead of throwing. The calling code checks for null and produces a human-readable error message.
- Common gotchas: Always use `AbortSignal.timeout()` — the server may be down or slow.

**Pattern 3: Sending a message and extracting text** (from `.opencode/tools/council.ts:152-190`):
```typescript
async function sendMessage(
  sessionId: string,
  providerID: string,
  modelID: string,
  text: string,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<string | null> {
  try {
    const response = await fetch(`${OPENCODE_URL}/session/${sessionId}/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: { providerID, modelID },
        parts: [{ type: "text", text }],
      }),
      signal: AbortSignal.timeout(timeoutMs),
    })
    if (!response.ok) return null
    const data = await response.json()
    const textParts = data.parts?.filter((p: any) => p.type === "text") || []
    return textParts.map((p: any) => p.text).join("\n") || null
  } catch {
    return null
  }
}
```
- Why this pattern: This is text mode dispatch. The `model` field routes to any provider/model. Response extraction filters for `type: "text"` parts only.
- Common gotchas: Some models may return empty responses — check for null/empty before processing.

**Pattern 4: SubtaskPartInput for agent mode** (from SDK types `types.gen.d.ts:1462-1473`):
```typescript
export type SubtaskPartInput = {
    id?: string;
    type: "subtask";
    prompt: string;
    description: string;
    agent: string;
    model?: {
        providerID: string;
        modelID: string;
    };
    command?: string;
};
```
- Why this pattern: Agent mode dispatch sends a `SubtaskPartInput` instead of a text part. The server creates a subtask session with full tool access for the specified model. The `agent` field specifies which agent configuration to use (e.g., "default"), `description` is a short label, and `prompt` contains the full task.
- Common gotchas: The `command` field is optional — it allows dispatching as if a slash command was run. The response comes back as parts in the parent session's message response.

**Pattern 5: Parallel dispatch with Promise.allSettled** (from `.opencode/tools/council.ts:280-330`):
```typescript
const promises = models.map(async (model) => {
  const childId = await createSession(/* ... */)
  if (!childId) return null
  const start = Date.now()
  const text = await sendMessage(childId, model.provider, model.model, prompt, timeoutMs)
  const latencyMs = Date.now() - start
  if (!text) return null
  return { label: model.label, provider: model.provider, model: model.model, text, latencyMs }
})

const results = await Promise.allSettled(promises)
const responses = results
  .filter((r): r is PromiseFulfilledResult<ModelResponse | null> => r.status === "fulfilled")
  .map(r => r.value)
  .filter((v): v is ModelResponse => v !== null)
```
- Why this pattern: `Promise.allSettled` ensures no single model failure kills the batch. Each model gets its own child session. Latency tracking per model.
- Common gotchas: Always filter out null results — some models will fail silently.

---

## HUMAN REVIEW CHECKPOINT

- [ ] **Phase 1 Review** — Approved by: {name} on {date}
  - Sub-plan: `.agents/features/multi-model-dispatch/plan-phase-1.md`
  - Status: pending
  - Notes: {any feedback or concerns}

- [ ] **Phase 2 Review** — Approved by: {name} on {date}
  - Sub-plan: `.agents/features/multi-model-dispatch/plan-phase-2.md`
  - Status: pending
  - Notes: {any feedback or concerns}

---

## ACCEPTANCE CRITERIA (Whole Feature)

### Implementation (verify during execution)

- [x] `dispatch.ts` exports a valid `tool()` with description, args, and execute function
- [x] `dispatch.ts` supports `text` mode (prompt → response via standard message API)
- [x] `dispatch.ts` supports `agent` mode (SubtaskPartInput — full OpenCode session with tool access)
- [x] `dispatch.ts` supports `command` mode (slash command dispatch via command endpoint)
- [x] `dispatch.ts` implements taskType auto-routing for all 55+ task types in model-strategy.md
- [x] `dispatch.ts` implements T0 planning cascade (kimi-k2-thinking → cogito-2.1:671b → qwen3-max → claude-opus-4-5)
- [x] `dispatch.ts` supports explicit provider/model override (bypassing taskType routing)
- [x] `dispatch.ts` includes health check, session management, timeout handling, and error reporting
- [x] `dispatch.ts` does NOT include a primer — agent mode models read project files themselves (thin dispatch principle)
- [x] `batch-dispatch.ts` exports a valid `tool()` with description, args, and execute function
- [x] `batch-dispatch.ts` supports all 10 pre-defined batch patterns from model-strategy.md (+ t4-sign-off = 11 total)
- [x] `batch-dispatch.ts` supports custom model lists (not just patterns)
- [x] `batch-dispatch.ts` dispatches models in parallel with `Promise.allSettled`
- [x] `batch-dispatch.ts` produces comparison output with per-model responses, latencies, and agreement analysis
- [x] `batch-dispatch.ts` reports wall-time for the full batch
- [x] All three tools follow council.ts patterns (error handling, session lifecycle, response extraction)
- [x] TypeScript compiles without errors (`npx tsc --noEmit`)

### Runtime (verify after testing/deployment)

- [ ] `dispatch({ taskType: "code-review", prompt: "..." })` routes to GLM-5 and returns a response
- [ ] `dispatch({ mode: "agent", prompt: "List files in .opencode/tools/", taskType: "execution" })` spawns a full OpenCode session
- [ ] `dispatch({ mode: "command", command: "planning", prompt: "auth-system", taskType: "planning" })` runs `/planning auth-system` via a model
- [ ] `dispatch({ taskType: "planning", prompt: "..." })` tries kimi-k2-thinking first, falls back through the cascade
- [ ] `batch-dispatch({ batchPattern: "free-review-gauntlet", prompt: "..." })` dispatches to 5 models in parallel
- [ ] `/council` still works unchanged after new tools are added
- [ ] Commands that reference `dispatch()` can call it without modifications

---

## KEY DESIGN DECISIONS

- **Decision 1**: Use `SubtaskPartInput` for agent mode and `SessionCommandData` for command mode — because the OpenCode server already implements full agent infrastructure natively. Agent mode gives models the same tools we have (read, write, bash, grep, commands). Command mode dispatches a slash command directly. We don't build agent infrastructure — we use the server's.
  - Alternatives considered: Building our own agent loop with tool call handling. Too complex and redundant.
  - Trade-offs: We depend on OpenCode's agent infrastructure working correctly for all providers.

- **Decision 2**: Centralize the entire taskType routing table in `dispatch.ts` as a static const — because scattering routing logic across commands creates maintenance hell. One table, one source of truth.
  - Alternatives considered: Reading routing from `model-strategy.md` at runtime (fragile). Putting it in `config.md` (per-project override of a system-level concern).
  - Trade-offs: Adding a new taskType requires editing `dispatch.ts`. Acceptable because it's a single file change with clear structure.

- **Decision 3**: `batch-dispatch.ts` is a separate tool, not a "batch mode" flag on dispatch — because batch dispatch has fundamentally different orchestration concerns (parallel execution, comparison output, consensus scoring, wall-time) that would bloat `dispatch.ts`.
  - Alternatives considered: `dispatch({ batch: true, models: [...] })`. Creates a god-tool with two very different execution paths behind one interface.
  - Trade-offs: Two tools to maintain instead of one. Acceptable because their concerns are cleanly separated.

- **Decision 4**: NO primer document — eliminated entirely. Agent/command mode models have full OpenCode sessions and read `AGENTS.md`, project files, and commands themselves. Text mode prompts come from the calling command with sufficient context already embedded. The dispatch tool is a thin router, not a prompt factory. Context responsibility belongs to the caller (the command), not the transport layer (dispatch).
  - Alternatives considered: Static primer file auto-prepended. Rejected because it wastes context window on agent mode (model reads files itself) and is the wrong abstraction for text mode (caller knows what context is needed).
  - Trade-offs: Text mode reviews might lack context if the calling command doesn't include enough. Mitigation: commands already include relevant context in their review prompts.

- **Decision 5**: Cascade fallback (T0 planning) is implemented as sequential attempts with short timeouts — because the cascade models are ordered by preference (free first, paid last). If the first model works, we save time. If it 404s or times out, we fall through quickly.
  - Alternatives considered: Parallel cascade (try all, use first to respond). Wastes resources on paid models that shouldn't be needed.
  - Trade-offs: Sequential means higher latency if early models fail. Mitigated by short per-attempt timeouts (30s).

---

## RISKS

- **Risk 1**: OpenCode server may not support `SubtaskPartInput` for all providers equally
  - Likelihood: Medium
  - Impact: High (agent mode broken for some models)
  - Mitigation: Test with at least one model per provider during Phase 1 validation. The model-strategy doc states "Agent mode works with ALL providers" — if this is wrong, we fall back to text mode for affected providers.

- **Risk 2**: Free model providers may have rate limits or downtime
  - Likelihood: Medium
  - Impact: Medium (dispatch fails for specific models)
  - Mitigation: `dispatch.ts` includes fallback logic (model-strategy.md line 22: "If `bailian-coding-plan-test` 404s, use `zai-coding-plan/glm-4.7`"). Each batch-dispatch pattern continues with however many models succeed.

- **Risk 3**: The primer document may be too long, consuming context window on small models
  - Likelihood: Low
  - Impact: Low (models can still function with truncated context)
  - Mitigation: Keep primer under 100 lines (~2K tokens). Focus on essentials: tech stack, file structure, coding conventions. Skip methodology details.

- **Risk 4**: TypeScript compilation may fail if the `@opencode-ai/plugin` API has undocumented constraints
  - Likelihood: Low
  - Impact: Low (fix type errors during validation)
  - Mitigation: Mirror council.ts patterns exactly. If council.ts compiles, dispatch.ts should too with the same patterns.

---

## CONFIDENCE SCORE

**Overall Confidence**: 8/10

- **Strengths**: Clear design spec (model-strategy.md), working reference implementation (council.ts), SDK types available locally, server API proven via council, all patterns documented above
- **Uncertainties**: SubtaskPartInput behavior for agent mode (never tested in this codebase), free model reliability, primer content calibration
- **Mitigations**: Mirror proven council.ts patterns, test incrementally, keep primer minimal

### Per-Phase Confidence

- **Phase 1**: 9/10 — dispatch.ts is a close cousin of council.ts. The routing table is explicitly defined. Text mode is identical to council. Agent mode uses a well-typed SDK type. Main uncertainty is SubtaskPartInput behavior.
- **Phase 2**: 7/10 — batch-dispatch.ts builds on Phase 1 patterns but adds consensus analysis and 10 batch patterns. The consensus scoring is new logic with no reference implementation. The comparison output format needs design.

---

## SUB-PLAN INDEX

| Phase | Sub-Plan Path | Status | Tasks | Files |
|-------|---------------|--------|-------|-------|
| 1 | `.agents/features/multi-model-dispatch/plan-phase-1.md` | done | 3 | `dispatch.ts` |
| 2 | `.agents/features/multi-model-dispatch/plan-phase-2.md` | done | 4 | `batch-dispatch.ts` |
