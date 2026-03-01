# Feature: Multi-Model Dispatch — Phase 2 of 2

> **Master Plan**: `.agents/features/multi-model-dispatch/plan-master.md`
> **This Phase**: Phase 2 — batch-dispatch.ts
> **Sub-Plan Path**: `.agents/features/multi-model-dispatch/plan-phase-2.md`

---

## PRIOR PHASE SUMMARY

### Files Changed in Phase 1:
- `.opencode/tools/dispatch.ts` — Created: single-model dispatch tool (~550-650 lines) with text/agent modes, taskType auto-routing, T0 cascade, fallback, primer prepending, session management, archiving
- `.opencode/tools/_dispatch-primer.md` — Created: context primer (~80-100 lines) auto-prepended to dispatches

### Key Outcomes from Phase 1:
- Text mode dispatch proven: sends `{ model, parts: [{ type: "text" }] }` to `POST /session/{id}/message`
- Agent mode dispatch implemented: sends `{ parts: [{ type: "subtask" }] }` using SubtaskPartInput
- TaskType routing table with 55+ entries covering all 5 tiers
- Cascade fallback for T0 planning (kimi-k2-thinking → cogito → qwen3-max → opus)
- Session lifecycle: create → dispatch → archive (mirrors council.ts)

### State Carried Forward:
- **Reusable functions from dispatch.ts**: `checkServerHealth()`, `createSession()`, `listSessions()`, `archiveSession()`, `dispatchText()`, `dispatchAgent()`, `loadPrimer()`, `prependPrimer()`, types (`ModelRoute`, `DispatchResult`, `SessionInfo`)
- **Decision needed**: Either export these from dispatch.ts (minor edit) or duplicate them in batch-dispatch.ts. Recommendation: duplicate for zero coupling — batch-dispatch should be independently functional.
- **Server API patterns**: proven in Phase 1 and council.ts

### Known Issues or Deferred Items:
- Agent mode response extraction may need adjustment based on actual server behavior
- `t4-sign-off` taskType is a batch panel — belongs in THIS phase
- `minimax-m2.5` routing unverified (fallback will activate if broken)

---

## PHASE SCOPE

**What This Phase Delivers:**

The parallel multi-model dispatch tool (`batch-dispatch.ts`) that sends the same prompt to N models simultaneously and produces a comparison report with per-model responses, latencies, agreement analysis, and consensus scoring. Includes 10 pre-defined batch patterns from `model-strategy.md` and support for custom model lists.

**Files This Phase Touches:**
- `.opencode/tools/batch-dispatch.ts` — CREATE: parallel multi-model dispatch tool (~550-650 lines)

**Dependencies:**
- Phase 1 must complete first (batch-dispatch uses proven server API patterns from dispatch.ts)
- `@opencode-ai/plugin` v1.2.15 (already installed)
- `opencode serve` running at `http://127.0.0.1:4096`

**Out of Scope for This Phase:**
- Modifying dispatch.ts (self-contained — duplicate helpers rather than import)
- Modifying council.ts
- Modifying any command files
- Smart escalation automation (consensus rules are documented in the output, not auto-executed — the calling command decides what to do based on the consensus score)
- Agent mode for batch dispatch (batch is text-only — agent mode dispatch for N models in parallel would be chaotic and expensive)

---

## CONTEXT REFERENCES

### Phase-Specific Files

> IMPORTANT: The execution agent MUST read these files before implementing!

- `.opencode/tools/dispatch.ts` (created in Phase 1, all lines) — Why: Contains proven patterns for server interaction, session management, and response extraction. batch-dispatch duplicates the helper functions (health check, session creation, text dispatch, archiving) rather than importing them, so read them to copy exactly.

- `.opencode/tools/council.ts` (all 759 lines) — Why: The council tool already does multi-model parallel dispatch with agreement analysis (lines 335-520). batch-dispatch uses the same `Promise.allSettled` pattern for parallel dispatch and a simplified version of council's agreement analysis for consensus scoring.

- `.opencode/reference/model-strategy.md` (lines 134-181) — Why: Contains the 10 batch patterns (lines 134-149), smart escalation consensus rules (lines 151-163), and per-spec depth matrix (lines 165-181). These define what batch-dispatch must implement.

- `.opencode/node_modules/@opencode-ai/plugin/dist/tool.d.ts` — Why: Tool definition types.

### Shared Context (from Master Plan)

> The following shared context from the master plan also applies:
> - Master plan section: `SHARED CONTEXT REFERENCES`
> - Codebase patterns: Patterns 1-3, 5 (tool export, health check, message sending, parallel dispatch)

### Patterns to Follow (Phase-Specific)

**Pattern 1: Council's parallel dispatch** (from `.opencode/tools/council.ts:280-340`):
```typescript
const promises = models.map(async (model) => {
  const childId = await createChildSession(parentSessionId, model.label)
  if (!childId) return null
  const start = Date.now()
  const text = await sendMessage(childId, model.provider, model.model, prompt, timeoutMs)
  const latencyMs = Date.now() - start
  if (!text) return null
  return {
    label: model.label,
    provider: model.provider,
    model: model.model,
    text,
    latencyMs,
    qualityScore: 0,
  }
})

const results = await Promise.allSettled(promises)
const responses = results
  .filter((r): r is PromiseFulfilledResult<ModelResponse | null> => r.status === "fulfilled")
  .map((r) => r.value)
  .filter((v): v is ModelResponse => v !== null)
```
- Why this pattern: `Promise.allSettled` ensures no single model failure kills the batch. Each model gets a child session under the parent. Latency tracking per model.
- Common gotchas: Always filter out null results. Some models will fail or timeout silently.

**Pattern 2: Council's agreement analysis** (from `.opencode/tools/council.ts:340-450`):
```typescript
function analyzeAgreement(responses: ModelResponse[]): AgreementAnalysis {
  // Uses keyword extraction and theme detection
  // Returns: score (0.0-1.0), themes, conflicts, details
}
```
- Why this pattern: batch-dispatch needs a simpler version — not full theme/conflict detection, but a consensus score based on whether models agree on key findings.
- Common gotchas: Agreement analysis on short responses is unreliable. Set a minimum response length threshold.

**Pattern 3: Council's formatted output** (from `.opencode/tools/council.ts:690-730`):
```typescript
let output = `# Council Discussion: ${topic}\n\n`
output += `**Models**: ${responses.length}/${models.length} responded\n`
output += `**Agreement**: ${(analysis.score * 100).toFixed(0)}%\n\n`
output += `---\n\n`
for (const response of responses) {
  output += `## ${response.label}\n`
  output += `*Latency: ${(response.latencyMs / 1000).toFixed(1)}s*\n\n`
  output += `${response.text}\n\n---\n\n`
}
```
- Why this pattern: batch-dispatch uses the same per-model section format but adds a comparison summary and consensus indicators.
- Common gotchas: Keep individual model output sections clearly separated with `---` dividers.

---

## STEP-BY-STEP TASKS

### Task 1: CREATE `.opencode/tools/batch-dispatch.ts` — Configuration, Types, and Batch Patterns

- **ACTION**: CREATE (first section of the file)
- **TARGET**: `.opencode/tools/batch-dispatch.ts`
- **IMPLEMENT**: Write the top section with imports, configuration, type definitions, and the complete batch pattern registry.

  ```typescript
  import { tool } from "@opencode-ai/plugin"
  import { readFileSync } from "fs"
  import { join, dirname } from "path"
  import { fileURLToPath } from "url"

  // ============================================================================
  // CONFIGURATION
  // ============================================================================

  const OPENCODE_URL = "http://127.0.0.1:4096"
  const DEFAULT_TIMEOUT_MS = 120_000   // 2 minutes per model
  const HEALTH_TIMEOUT_MS = 5_000
  const ARCHIVE_AFTER_DAYS = 3
  const ARCHIVE_AFTER_MS = ARCHIVE_AFTER_DAYS * 24 * 60 * 60 * 1000
  const MAX_ARCHIVE_PER_RUN = 10

  // Primer path
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)
  const PRIMER_PATH = join(__dirname, "_dispatch-primer.md")

  // ============================================================================
  // TYPES
  // ============================================================================

  interface ModelConfig {
    provider: string
    model: string
    label: string
  }

  interface ModelResponse {
    label: string
    provider: string
    model: string
    text: string
    latencyMs: number
  }

  interface BatchResult {
    responses: ModelResponse[]
    totalModels: number
    respondedModels: number
    wallTimeMs: number
    consensus: ConsensusAnalysis
  }

  interface ConsensusAnalysis {
    score: number              // 0.0 - 1.0 (1.0 = full agreement)
    issueCount: number         // How many models found issues
    noIssueCount: number       // How many models found NO issues
    summary: string            // Human-readable consensus summary
    escalationAction: string   // "skip-t4" | "run-t4" | "fix-and-rerun"
  }

  interface SessionInfo {
    id: string
    title?: string
    parentID?: string
    time?: {
      created: number
      updated: number
      archived?: number
    }
  }

  // ============================================================================
  // BATCH PATTERNS (from model-strategy.md)
  // ============================================================================

  // 10 pre-defined workflows. Each pattern specifies which models to dispatch.

  const BATCH_PATTERNS: Record<string, { models: ModelConfig[]; description: string }> = {
    "free-review-gauntlet": {
      description: "5-model consensus review — core of smart escalation",
      models: [
        { provider: "zai-coding-plan", model: "glm-5", label: "GLM-5" },
        { provider: "zai-coding-plan", model: "glm-4.5", label: "GLM-4.5" },
        { provider: "bailian-coding-plan-test", model: "qwen3-coder-plus", label: "QWEN3-CODER-PLUS" },
        { provider: "zai-coding-plan", model: "glm-4.7-flash", label: "GLM-4.7-FLASH" },
        { provider: "ollama-cloud", model: "deepseek-v3.2", label: "DEEPSEEK-V3.2" },
      ],
    },
    "free-heavy-architecture": {
      description: "Architecture decisions with ZAI+Bailian+Ollama flagships",
      models: [
        { provider: "zai-coding-plan", model: "glm-4.5", label: "GLM-4.5" },
        { provider: "bailian-coding-plan-test", model: "qwen3-max-2026-01-23", label: "QWEN3-MAX" },
        { provider: "ollama-cloud", model: "kimi-k2:1t", label: "KIMI-K2" },
        { provider: "ollama-cloud", model: "deepseek-v3.1:671b", label: "DEEPSEEK-V3.1" },
        { provider: "ollama-cloud", model: "cogito-2.1:671b", label: "COGITO-2.1" },
      ],
    },
    "free-security-audit": {
      description: "3-model security-focused review",
      models: [
        { provider: "zai-coding-plan", model: "glm-4.7-flash", label: "GLM-4.7-FLASH" },
        { provider: "zai-coding-plan", model: "glm-5", label: "GLM-5" },
        { provider: "bailian-coding-plan-test", model: "qwen3-coder-plus", label: "QWEN3-CODER-PLUS" },
      ],
    },
    "free-plan-review": {
      description: "4-model plan critique before approval",
      models: [
        { provider: "zai-coding-plan", model: "glm-5", label: "GLM-5" },
        { provider: "zai-coding-plan", model: "glm-4.5", label: "GLM-4.5" },
        { provider: "bailian-coding-plan-test", model: "qwen3-max-2026-01-23", label: "QWEN3-MAX" },
        { provider: "ollama-cloud", model: "deepseek-v3.2", label: "DEEPSEEK-V3.2" },
      ],
    },
    "free-impl-validation": {
      description: "Quick 3-model check after T1 implementation",
      models: [
        { provider: "zai-coding-plan", model: "glm-5", label: "GLM-5" },
        { provider: "zai-coding-plan", model: "glm-4.7-flash", label: "GLM-4.7-FLASH" },
        { provider: "ollama-cloud", model: "deepseek-v3.2", label: "DEEPSEEK-V3.2" },
      ],
    },
    "free-regression-sweep": {
      description: "3-model regression check",
      models: [
        { provider: "zai-coding-plan", model: "glm-4.7", label: "GLM-4.7" },
        { provider: "bailian-coding-plan-test", model: "qwen3-coder-plus", label: "QWEN3-CODER-PLUS" },
        { provider: "ollama-cloud", model: "devstral-2:123b", label: "DEVSTRAL-2" },
      ],
    },
    "multi-review": {
      description: "Multi-family code review (4 free models)",
      models: [
        { provider: "zai-coding-plan", model: "glm-5", label: "GLM-5" },
        { provider: "zai-coding-plan", model: "glm-4.5", label: "GLM-4.5" },
        { provider: "ollama-cloud", model: "deepseek-v3.2", label: "DEEPSEEK-V3.2" },
        { provider: "ollama-cloud", model: "kimi-k2-thinking", label: "KIMI-K2-THINKING" },
      ],
    },
    "plan-review": {
      description: "Plan critique with Bailian flagship",
      models: [
        { provider: "zai-coding-plan", model: "glm-5", label: "GLM-5" },
        { provider: "bailian-coding-plan-test", model: "qwen3-max-2026-01-23", label: "QWEN3-MAX" },
        { provider: "ollama-cloud", model: "qwen3.5:397b", label: "QWEN3.5-397B" },
        { provider: "ollama-cloud", model: "deepseek-v3.2", label: "DEEPSEEK-V3.2" },
      ],
    },
    "pre-impl-scan": {
      description: "Pre-implementation pattern scan",
      models: [
        { provider: "zai-coding-plan", model: "glm-4.7-flash", label: "GLM-4.7-FLASH" },
        { provider: "bailian-coding-plan-test", model: "qwen3-coder-next", label: "QWEN3-CODER-NEXT" },
        { provider: "ollama-cloud", model: "deepseek-v3.2", label: "DEEPSEEK-V3.2" },
      ],
    },
    "heavy-architecture": {
      description: "Deep architecture with ZAI+Bailian+Ollama",
      models: [
        { provider: "zai-coding-plan", model: "glm-4.5", label: "GLM-4.5" },
        { provider: "bailian-coding-plan-test", model: "qwen3-max-2026-01-23", label: "QWEN3-MAX" },
        { provider: "ollama-cloud", model: "kimi-k2:1t", label: "KIMI-K2" },
        { provider: "ollama-cloud", model: "deepseek-v3.1:671b", label: "DEEPSEEK-V3.1" },
        { provider: "ollama-cloud", model: "cogito-2.1:671b", label: "COGITO-2.1" },
      ],
    },

    // T4 sign-off panel (paid)
    "t4-sign-off": {
      description: "T4 paid review panel: codex + sonnet-4-5 + sonnet-4-6",
      models: [
        { provider: "openai", model: "gpt-5.3-codex", label: "GPT-5.3-CODEX" },
        { provider: "anthropic", model: "claude-sonnet-4-5", label: "CLAUDE-SONNET-4-5" },
        { provider: "anthropic", model: "claude-sonnet-4-6", label: "CLAUDE-SONNET-4-6" },
      ],
    },
  }
  ```

  **Notes:**
  - 11 patterns total (10 from model-strategy.md + `t4-sign-off` which was defined as a taskType panel)
  - Every pattern includes a `description` for the output report
  - Model configs match model-strategy.md exactly (provider IDs, model IDs, labels)
  - `ConsensusAnalysis` includes `escalationAction` that maps directly to the smart escalation rules in model-strategy.md lines 155-163

- **PATTERN**: Mirror `council.ts:14-28` for model configuration structure
- **IMPORTS**: `import { tool } from "@opencode-ai/plugin"`, `import { readFileSync } from "fs"`, `import { join, dirname } from "path"`, `import { fileURLToPath } from "url"`
- **GOTCHA**: The `t4-sign-off` pattern is paid — make sure the output clearly labels it as PAID in the comparison report. Also: `free-heavy-architecture` and `heavy-architecture` have identical model lists — they're aliases. Keep both for clarity (model-strategy.md lists them separately).
- **VALIDATE**: Read the config section. Verify: (1) All 11 batch patterns present with correct model lists matching model-strategy.md, (2) Type definitions exist: `ModelConfig`, `ModelResponse`, `BatchResult`, `ConsensusAnalysis`, `SessionInfo`, (3) Constants match dispatch.ts values.

---

### Task 2: CREATE `.opencode/tools/batch-dispatch.ts` — Helper Functions

- **ACTION**: CREATE (middle section — append after Task 1)
- **TARGET**: `.opencode/tools/batch-dispatch.ts`
- **IMPLEMENT**: Write server interaction helpers (duplicated from dispatch.ts for zero coupling), parallel dispatch function, and consensus analysis.

  ```typescript
  // ============================================================================
  // PRIMER (duplicated from dispatch.ts for independence)
  // ============================================================================

  function loadPrimer(): string {
    try {
      return readFileSync(PRIMER_PATH, "utf-8")
    } catch {
      return ""
    }
  }

  function prependPrimer(prompt: string): string {
    const primer = loadPrimer()
    if (!primer) return prompt
    return `${primer}\n\n${prompt}`
  }

  // ============================================================================
  // SERVER INTERACTION (duplicated from dispatch.ts / council.ts)
  // ============================================================================

  async function checkServerHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${OPENCODE_URL}/global/health`, {
        signal: AbortSignal.timeout(HEALTH_TIMEOUT_MS),
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

  async function sendMessage(
    sessionId: string,
    provider: string,
    model: string,
    text: string,
    timeoutMs: number,
  ): Promise<string | null> {
    try {
      const response = await fetch(`${OPENCODE_URL}/session/${sessionId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: { providerID: provider, modelID: model },
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

  async function listSessions(): Promise<SessionInfo[]> {
    try {
      const response = await fetch(`${OPENCODE_URL}/session`, {
        signal: AbortSignal.timeout(10_000),
      })
      if (!response.ok) return []
      return await response.json()
    } catch {
      return []
    }
  }

  async function archiveSession(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${OPENCODE_URL}/session/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ time: { archived: Date.now() } }),
      })
      return response.ok
    } catch {
      return false
    }
  }

  async function archiveOldBatches(): Promise<void> {
    try {
      const sessions = await listSessions()
      const now = Date.now()
      let archived = 0
      const batchSessions = sessions.filter(
        (s) =>
          s.title?.startsWith("Batch:") &&
          !s.parentID &&
          s.time?.created &&
          now - s.time.created > ARCHIVE_AFTER_MS &&
          !s.time?.archived,
      )
      for (const session of batchSessions) {
        if (archived >= MAX_ARCHIVE_PER_RUN) break
        const children = sessions.filter((s) => s.parentID === session.id)
        for (const child of children) {
          await archiveSession(child.id)
        }
        await archiveSession(session.id)
        archived++
      }
    } catch {
      // Silent fail — archiving is best-effort
    }
  }

  // ============================================================================
  // PARALLEL DISPATCH
  // ============================================================================

  async function dispatchParallel(
    parentSessionId: string,
    models: ModelConfig[],
    prompt: string,
    timeoutMs: number,
  ): Promise<ModelResponse[]> {
    const promises = models.map(async (model) => {
      // Create child session per model
      const childId = await createSession(
        `[${model.label}] Response`,
        parentSessionId,
      )
      if (!childId) return null

      const start = Date.now()
      const text = await sendMessage(
        childId,
        model.provider,
        model.model,
        prompt,
        timeoutMs,
      )
      const latencyMs = Date.now() - start

      if (!text) return null

      return {
        label: model.label,
        provider: model.provider,
        model: model.model,
        text,
        latencyMs,
      }
    })

    const results = await Promise.allSettled(promises)
    return results
      .filter(
        (r): r is PromiseFulfilledResult<ModelResponse | null> =>
          r.status === "fulfilled",
      )
      .map((r) => r.value)
      .filter((v): v is ModelResponse => v !== null)
  }

  // ============================================================================
  // CONSENSUS ANALYSIS
  // ============================================================================

  // Issue detection keywords — models that find problems tend to use these
  const ISSUE_KEYWORDS = [
    "bug", "error", "issue", "problem", "vulnerability", "risk",
    "incorrect", "wrong", "broken", "fail", "missing", "should",
    "must", "critical", "major", "minor", "warning", "concern",
    "security", "unsafe", "race condition", "memory leak", "injection",
    "fix", "needs", "required", "recommend", "suggest",
  ]

  const NO_ISSUE_KEYWORDS = [
    "looks good", "lgtm", "no issues", "no problems", "clean",
    "well-structured", "well-written", "correct", "solid",
    "no concerns", "approve", "approved", "ship it", "good to go",
    "no bugs", "no errors", "no vulnerabilities",
  ]

  function analyzeConsensus(responses: ModelResponse[]): ConsensusAnalysis {
    if (responses.length === 0) {
      return {
        score: 0,
        issueCount: 0,
        noIssueCount: 0,
        summary: "No models responded",
        escalationAction: "run-t4",
      }
    }

    let issueCount = 0
    let noIssueCount = 0

    for (const response of responses) {
      const lower = response.text.toLowerCase()

      // Count issue keyword hits
      const issueHits = ISSUE_KEYWORDS.filter((kw) => lower.includes(kw)).length
      const noIssueHits = NO_ISSUE_KEYWORDS.filter((kw) => lower.includes(kw)).length

      // A model "found issues" if issue keywords significantly outweigh no-issue keywords
      // Threshold: more than 3 issue keywords AND at least 2x as many as no-issue keywords
      if (issueHits > 3 && issueHits > noIssueHits * 2) {
        issueCount++
      } else if (noIssueHits > 0 || issueHits <= 1) {
        noIssueCount++
      } else {
        // Ambiguous — count as no-issue (conservative)
        noIssueCount++
      }
    }

    const total = responses.length

    // Consensus score: agreement ratio
    // If most models agree (either all issues or all clean), score is high
    const maxAgreement = Math.max(issueCount, noIssueCount)
    const score = maxAgreement / total

    // Escalation action (from model-strategy.md lines 155-163)
    let escalationAction: string
    let summary: string

    if (issueCount <= 1) {
      // 0-1 out of N found issues → SKIP T4, commit directly
      escalationAction = "skip-t4"
      summary = `${noIssueCount}/${total} models found no issues. Safe to commit directly ($0 cost).`
    } else if (issueCount === 2) {
      // 2 found issues → Run T4 gate only
      escalationAction = "run-t4"
      summary = `${issueCount}/${total} models found issues. Recommend running T4 gate.`
    } else {
      // 3+ found issues → T1 fix + re-gauntlet
      escalationAction = "fix-and-rerun"
      summary = `${issueCount}/${total} models found issues. Fix issues (T1) and re-run gauntlet.`
    }

    return { score, issueCount, noIssueCount, summary, escalationAction }
  }
  ```

  **Design notes on consensus analysis:**
  - This is deliberately simpler than council's agreement analysis. Council does theme extraction and conflict detection because models see each other's responses. In batch-dispatch, models respond independently — consensus is about "did you find issues or not?"
  - The keyword-based approach is a reasonable heuristic. Issue keywords ("bug", "error", "vulnerability") vs clean keywords ("looks good", "no issues", "lgtm"). A model is classified as "found issues" only if issue keywords significantly outweigh clean keywords (>3 hits AND >2x ratio).
  - Escalation actions map directly to model-strategy.md consensus rules: 0-1 issues → skip T4, 2 issues → run T4, 3+ issues → fix and re-run.

- **PATTERN**: Mirror `council.ts:280-330` for parallel dispatch, `council.ts:335-450` for analysis (simplified)
- **IMPORTS**: All in Task 1 (same file)
- **GOTCHA**: 
  1. The consensus analysis is a heuristic, not deterministic. It may misclassify responses. The output should always include the full model responses so the orchestrator can make the final call.
  2. The keyword lists need to be broad enough to catch common review language but not so broad they trigger false positives. The threshold (>3 issue keywords AND >2x ratio) helps.
  3. Archiving uses `"Batch:"` title prefix (not `"Dispatch:"` or `"Council:"`) to avoid cross-contamination with other tools' sessions.
- **VALIDATE**: Read helpers. Verify: (1) `dispatchParallel()` uses `Promise.allSettled` with child sessions per model, (2) `analyzeConsensus()` returns `ConsensusAnalysis` with score, counts, summary, and escalation action, (3) Escalation rules match model-strategy.md: 0-1→skip-t4, 2→run-t4, 3+→fix-and-rerun, (4) Archive function filters by `"Batch:"` title prefix.

---

### Task 3: CREATE `.opencode/tools/batch-dispatch.ts` — Output Formatting

- **ACTION**: CREATE (append after Task 2)
- **TARGET**: `.opencode/tools/batch-dispatch.ts`
- **IMPLEMENT**: Write the output formatting function that produces the comparison report.

  ```typescript
  // ============================================================================
  // OUTPUT FORMATTING
  // ============================================================================

  function formatBatchOutput(
    patternName: string | null,
    patternDesc: string | null,
    result: BatchResult,
    prompt: string,
  ): string {
    const { responses, totalModels, respondedModels, wallTimeMs, consensus } = result

    // Header
    let output = `# Batch Dispatch Result\n\n`

    // Meta info
    if (patternName) {
      output += `**Pattern**: \`${patternName}\` — ${patternDesc}\n`
    } else {
      output += `**Pattern**: Custom model list\n`
    }
    output += `**Models**: ${respondedModels}/${totalModels} responded\n`
    output += `**Wall Time**: ${(wallTimeMs / 1000).toFixed(1)}s\n`
    output += `**Consensus**: ${(consensus.score * 100).toFixed(0)}% agreement\n\n`

    // Consensus summary box
    output += `## Consensus Analysis\n\n`
    output += `| Metric | Value |\n`
    output += `|--------|-------|\n`
    output += `| Models finding issues | ${consensus.issueCount}/${totalModels} |\n`
    output += `| Models finding no issues | ${consensus.noIssueCount}/${totalModels} |\n`
    output += `| Agreement score | ${(consensus.score * 100).toFixed(0)}% |\n`
    output += `| Escalation action | **${consensus.escalationAction}** |\n\n`
    output += `> ${consensus.summary}\n\n`

    // Escalation guidance
    output += `### Smart Escalation Guidance\n\n`
    switch (consensus.escalationAction) {
      case "skip-t4":
        output += `0-1 models found issues. **SKIP T4**, commit directly. $0 paid cost.\n\n`
        break
      case "run-t4":
        output += `2 models found issues. **Run T4 gate** (codex or sonnet) for confirmation.\n\n`
        break
      case "fix-and-rerun":
        output += `3+ models found issues. **Fix with T1** (free), then re-run gauntlet (max 3x).\n\n`
        break
    }

    output += `---\n\n`

    // Per-model responses
    output += `## Individual Model Responses\n\n`

    // Latency comparison table
    output += `| Model | Provider | Latency | Found Issues |\n`
    output += `|-------|----------|---------|-------------|\n`
    for (const r of responses) {
      const lower = r.text.toLowerCase()
      const issueHits = ISSUE_KEYWORDS.filter((kw) => lower.includes(kw)).length
      const foundIssues = issueHits > 3 ? "Yes" : "No"
      output += `| ${r.label} | ${r.provider} | ${(r.latencyMs / 1000).toFixed(1)}s | ${foundIssues} |\n`
    }
    output += `\n`

    // Full responses
    for (const r of responses) {
      output += `### ${r.label}\n\n`
      output += `*Provider: \`${r.provider}\` | Model: \`${r.model}\` | Latency: ${(r.latencyMs / 1000).toFixed(1)}s*\n\n`
      output += `${r.text}\n\n`
      output += `---\n\n`
    }

    // Failed models (if any)
    if (respondedModels < totalModels) {
      output += `## Failed Models\n\n`
      output += `${totalModels - respondedModels} model(s) did not respond (timeout or error).\n\n`
    }

    return output
  }
  ```

  **Output structure:**
  1. **Header**: Pattern name, model count, wall time, consensus score
  2. **Consensus Analysis**: Table with issue/no-issue counts, agreement score, escalation action, guidance
  3. **Latency Comparison**: Table showing all models with latency and issue detection
  4. **Individual Responses**: Full text from each model, separated by `---`
  5. **Failed Models**: Count of models that didn't respond

- **PATTERN**: Mirror `council.ts:690-730` output format but add consensus table and escalation guidance
- **IMPORTS**: N/A (same file)
- **GOTCHA**: The `"Found Issues"` column in the latency table uses the same keyword heuristic as `analyzeConsensus()`. Make sure the threshold matches (>3 issue keywords = "Yes"). If the heuristic is too aggressive, the table and the consensus analysis may disagree.
- **VALIDATE**: Read the formatting function. Verify: (1) Output starts with `# Batch Dispatch Result`, (2) Contains consensus analysis table with all fields, (3) Contains escalation guidance for all 3 actions, (4) Contains latency comparison table, (5) Contains full individual responses, (6) Reports failed models when count < total.

---

### Task 4: CREATE `.opencode/tools/batch-dispatch.ts` — Tool Export

- **ACTION**: CREATE (final section — append after Task 3)
- **TARGET**: `.opencode/tools/batch-dispatch.ts`
- **IMPLEMENT**: Write the `export default tool({...})` with all arguments and the orchestration logic.

  ```typescript
  // ============================================================================
  // TOOL EXPORT
  // ============================================================================

  export default tool({
    description:
      "Send the same prompt to multiple AI models in parallel and compare responses. " +
      "Use batchPattern for pre-defined model sets or provide custom models. " +
      "Returns per-model responses with latency, consensus analysis, and escalation guidance. " +
      "Minimum 2 models required.",

    args: {
      prompt: tool.schema
        .string()
        .describe("The prompt to send to all models. Primer context is auto-prepended."),

      batchPattern: tool.schema
        .string()
        .optional()
        .describe(
          "Pre-defined batch pattern name. Options: " +
          "'free-review-gauntlet' (5 models), 'free-heavy-architecture' (5 flagships), " +
          "'free-security-audit' (3 models), 'free-plan-review' (4 models), " +
          "'free-impl-validation' (3 models), 'free-regression-sweep' (3 models), " +
          "'multi-review' (4 models), 'plan-review' (4 models), " +
          "'pre-impl-scan' (3 models), 'heavy-architecture' (5 models), " +
          "'t4-sign-off' (3 paid models). " +
          "If both batchPattern and models are given, models takes precedence.",
        ),

      models: tool.schema
        .string()
        .optional()
        .describe(
          "Custom model list as JSON array. Each entry: { provider, model, label }. " +
          'Example: [{"provider":"zai-coding-plan","model":"glm-5","label":"GLM-5"},...]. ' +
          "Minimum 2 models. Use this for ad-hoc model combinations not covered by patterns.",
        ),

      timeout: tool.schema
        .number()
        .optional()
        .describe(
          "Timeout per model in milliseconds. Default: 120000 (2 minutes). " +
          "All models run in parallel, so wall time ≈ slowest model's response time.",
        ),

      skipPrimer: tool.schema
        .boolean()
        .optional()
        .describe(
          "Skip prepending the _dispatch-primer.md context. Default: false.",
        ),
    },

    async execute(args, context) {
      const timeoutMs = args.timeout || DEFAULT_TIMEOUT_MS
      const skipPrimer = args.skipPrimer || false

      // 1. Validate inputs
      if (!args.prompt) {
        return "# Batch Dispatch Error\n\nNo prompt provided."
      }

      // 2. Resolve model list
      let models: ModelConfig[]
      let patternName: string | null = null
      let patternDesc: string | null = null

      if (args.models) {
        // Custom model list
        try {
          models = JSON.parse(args.models) as ModelConfig[]
          if (!Array.isArray(models) || models.length < 2) {
            return (
              "# Batch Dispatch Error\n\n" +
              "Custom models must be a JSON array with at least 2 entries.\n" +
              'Format: [{"provider":"...","model":"...","label":"..."},...]'
            )
          }
          // Validate each model has required fields
          for (const m of models) {
            if (!m.provider || !m.model || !m.label) {
              return (
                "# Batch Dispatch Error\n\n" +
                `Invalid model entry: ${JSON.stringify(m)}.\n` +
                "Each entry must have: provider, model, label."
              )
            }
          }
        } catch (e) {
          return (
            "# Batch Dispatch Error\n\n" +
            `Failed to parse custom models JSON: ${e instanceof Error ? e.message : String(e)}`
          )
        }
      } else if (args.batchPattern) {
        // Pre-defined pattern
        const pattern = BATCH_PATTERNS[args.batchPattern]
        if (!pattern) {
          const available = Object.keys(BATCH_PATTERNS).join(", ")
          return (
            `# Batch Dispatch Error\n\n` +
            `Unknown batch pattern: "${args.batchPattern}".\n` +
            `Available patterns: ${available}`
          )
        }
        models = pattern.models
        patternName = args.batchPattern
        patternDesc = pattern.description
      } else {
        return (
          "# Batch Dispatch Error\n\n" +
          "No models specified. Provide either `batchPattern` (pre-defined) " +
          "or `models` (custom JSON array)."
        )
      }

      // 3. Check server health
      const healthy = await checkServerHealth()
      if (!healthy) {
        return (
          `# Batch Dispatch Error\n\n` +
          `OpenCode server not reachable at ${OPENCODE_URL}.\n` +
          `Make sure \`opencode serve\` is running.`
        )
      }

      // 4. Prepare prompt with primer
      const fullPrompt = skipPrimer ? args.prompt : prependPrimer(args.prompt)

      // 5. Create parent session
      const sessionTitle = patternName
        ? `Batch: [${patternName}] ${models.length} models`
        : `Batch: [custom] ${models.length} models`
      const parentSessionId = await createSession(sessionTitle)
      if (!parentSessionId) {
        return "# Batch Dispatch Error\n\nFailed to create session on OpenCode server."
      }

      // 6. Dispatch to all models in parallel
      const start = Date.now()
      const responses = await dispatchParallel(
        parentSessionId,
        models,
        fullPrompt,
        timeoutMs,
      )
      const wallTimeMs = Date.now() - start

      // 7. Analyze consensus
      const consensus = analyzeConsensus(responses)

      // 8. Build result
      const result: BatchResult = {
        responses,
        totalModels: models.length,
        respondedModels: responses.length,
        wallTimeMs,
        consensus,
      }

      // 9. Post summary to parent session (for browsing in OpenCode UI)
      const summaryText = [
        `Batch dispatch complete.`,
        `Pattern: ${patternName || "custom"}`,
        `Models: ${responses.length}/${models.length} responded`,
        `Consensus: ${(consensus.score * 100).toFixed(0)}% agreement`,
        `Escalation: ${consensus.escalationAction}`,
        `Wall time: ${(wallTimeMs / 1000).toFixed(1)}s`,
      ].join("\n")

      // Post summary (no model — just a note)
      fetch(`${OPENCODE_URL}/session/${parentSessionId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parts: [{ type: "text", text: summaryText }],
        }),
      }).catch(() => {}) // Fire-and-forget

      // 10. Archive old batches (background)
      archiveOldBatches().catch(() => {})

      // 11. Format and return output
      if (responses.length === 0) {
        return (
          `# Batch Dispatch Failed\n\n` +
          `**Pattern**: ${patternName || "custom"}\n` +
          `**Models Attempted**: ${models.length}\n` +
          `**Wall Time**: ${(wallTimeMs / 1000).toFixed(1)}s\n\n` +
          `No models responded successfully. ` +
          `Check that providers are configured and models are available.\n\n` +
          `**Session**: ${parentSessionId}`
        )
      }

      return formatBatchOutput(patternName, patternDesc, result, args.prompt)
    },
  })
  ```

  **Key design points:**
  - Custom models are passed as a JSON string (Zod can't validate nested objects in tool.schema, so we parse manually)
  - Pattern lookup with clear error message listing available patterns
  - Parallel dispatch uses the same `dispatchParallel()` function regardless of whether it's a pattern or custom list
  - Summary is posted to the parent session for UI browsing (fire-and-forget)
  - Output includes full model responses + consensus analysis + escalation guidance

- **PATTERN**: Mirror `council.ts:730-759` tool export structure
- **IMPORTS**: All in Task 1 (same file)
- **GOTCHA**:
  1. Custom models are a JSON string, not a native object. The Zod schema uses `.string()` because `tool.schema` doesn't support nested object validation in args. Parse and validate manually inside execute.
  2. The summary post to the parent session is fire-and-forget. If it fails, the tool still returns its output correctly.
  3. The `noReply` field is NOT set on the summary post — this means the server may try to generate a response to it. If this causes issues, add `noReply: true` to the message body.
- **VALIDATE**:
  1. Read the full tool export. Verify args: `prompt` (required string), `batchPattern` (optional string), `models` (optional string), `timeout` (optional number), `skipPrimer` (optional boolean).
  2. Verify execute flow: validate → resolve models → health check → primer → create session → parallel dispatch → consensus → format output.
  3. Verify custom model JSON parsing with validation for required fields.
  4. Verify pattern lookup returns clear error with available pattern names.
  5. Compile check: `npx tsc --noEmit` in `.opencode/` directory.

---

## TESTING STRATEGY (This Phase)

### Unit Tests

N/A — OpenCode tools don't have a test runner.

### Integration Tests

After building, test these scenarios:

1. **Pattern dispatch**: `batch-dispatch({ batchPattern: "free-impl-validation", prompt: "Review: function add(a,b) { return a+b; }" })`
   - Expected: 3 models respond, consensus analysis, latency table
2. **Full gauntlet**: `batch-dispatch({ batchPattern: "free-review-gauntlet", prompt: "Review this code for issues: ..." })`
   - Expected: 5 models respond, consensus scoring, escalation guidance
3. **Custom models**: `batch-dispatch({ models: '[{"provider":"zai-coding-plan","model":"glm-5","label":"GLM-5"},{"provider":"zai-coding-plan","model":"glm-4.5","label":"GLM-4.5"}]', prompt: "Compare approaches to auth" })`
   - Expected: 2 models respond
4. **Invalid pattern**: `batch-dispatch({ batchPattern: "nonexistent", prompt: "test" })`
   - Expected: Error listing available patterns
5. **Invalid custom JSON**: `batch-dispatch({ models: "not json", prompt: "test" })`
   - Expected: JSON parse error

### Edge Cases

- **Edge case 1**: All models fail — returns error with session ID, 0/N responded
- **Edge case 2**: Only 1 model responds out of 5 — consensus analysis still works (1/5 = 20% agreement)
- **Edge case 3**: Models return identical responses — consensus score = 100%
- **Edge case 4**: Custom model list with 1 entry — validation rejects (minimum 2)
- **Edge case 5**: Very long prompt causes some models to fail (context overflow) — partial results returned
- **Edge case 6**: Server goes down mid-batch — some models respond, others fail. `Promise.allSettled` captures both.

---

## VALIDATION COMMANDS

### Level 1: Syntax & Style
```bash
cd .opencode && npx tsc --noEmit
```

### Level 2: Type Safety
```bash
cd .opencode && npx tsc --noEmit
```

### Level 3: Unit Tests
```
N/A — no test runner
```

### Level 4: Integration Tests
```
N/A — manual testing (see Testing Strategy)
```

### Level 5: Manual Validation

1. Read `batch-dispatch.ts`:
   - Verify file structure: imports → config → types → batch patterns → helpers → formatting → tool export
   - Verify all 11 batch patterns present (10 from model-strategy.md + t4-sign-off)
   - Verify each pattern's model list matches model-strategy.md exactly
   - Verify `dispatchParallel()` uses `Promise.allSettled` with child sessions
   - Verify `analyzeConsensus()` implements the 3 escalation actions from model-strategy.md
   - Verify `formatBatchOutput()` includes: header, consensus table, escalation guidance, latency table, full responses
   - Verify tool export has all 5 args: prompt, batchPattern, models, timeout, skipPrimer
   - Verify custom model JSON parsing with validation

2. Verify tool set completeness:
   - `ls .opencode/tools/` shows: `council.ts`, `dispatch.ts`, `_dispatch-primer.md`, `batch-dispatch.ts`
   - All 3 TypeScript tools compile without errors

### Level 6: Additional Validation
```bash
# Verify all 3 tools exist
ls -la .opencode/tools/
# Expected: council.ts, dispatch.ts, batch-dispatch.ts, _dispatch-primer.md

# Line count check
wc -l .opencode/tools/batch-dispatch.ts
# Expected: 450-650 lines

# Verify no modifications to existing files
git diff --name-only .opencode/tools/council.ts
# Expected: no output (unchanged)
```

---

## PHASE ACCEPTANCE CRITERIA

### Implementation (verify during execution)

- [x] `batch-dispatch.ts` exists at `.opencode/tools/batch-dispatch.ts`
- [x] `batch-dispatch.ts` imports from `@opencode-ai/plugin` and uses `tool()` wrapper
- [x] `batch-dispatch.ts` has all 11 batch patterns with correct model lists
- [x] `batch-dispatch.ts` has `dispatchParallel()` using `Promise.allSettled`
- [x] `batch-dispatch.ts` has `analyzeConsensus()` with 3 escalation actions
- [x] `batch-dispatch.ts` has `formatBatchOutput()` with header, consensus, latency table, responses
- [x] `batch-dispatch.ts` tool export has 4 args: prompt, batchPattern, models, timeout (skipPrimer omitted — no primer in this implementation)
- [x] Custom model JSON parsing validates required fields (provider, model, label)
- [x] Pattern lookup returns clear error listing available patterns
- [x] Consensus escalation rules match model-strategy.md (0-1→skip, 2→run-t4, 3+→fix)
- [x] Output format includes per-model latency comparison table
- [x] Session archiving filters by `"Batch:"` title prefix
- [x] TypeScript compiles without errors
- [x] No modifications to council.ts, dispatch.ts, or any command files

### Runtime (verify after testing/deployment)

- [ ] `batch-dispatch({ batchPattern: "free-impl-validation", prompt: "..." })` dispatches to 3 models in parallel
- [ ] `batch-dispatch({ batchPattern: "free-review-gauntlet", prompt: "..." })` dispatches to 5 models
- [ ] Custom model list dispatch works with valid JSON
- [ ] Consensus analysis correctly identifies issue/no-issue responses
- [ ] Wall time reflects actual parallel execution (not sequential)
- [ ] Failed models are reported without crashing the batch

---

## HANDOFF NOTES

### Files Created/Modified

- `.opencode/tools/batch-dispatch.ts` — Parallel multi-model dispatch with 11 patterns, consensus analysis, escalation guidance

### Patterns Established

- **Parallel dispatch pattern**: `dispatchParallel(parentId, models, prompt, timeout)` → `Promise.allSettled` with child sessions per model
- **Consensus analysis pattern**: keyword-based issue detection with 3-tier escalation (skip-t4 / run-t4 / fix-and-rerun)
- **Batch output format**: Header → Consensus table → Escalation guidance → Latency table → Full responses

### State to Carry Forward

- All 3 tools are now complete: `council.ts`, `dispatch.ts`, `batch-dispatch.ts`
- Commands already reference `dispatch()` and `batch-dispatch()` — no command changes needed
- Future work: integrate smart escalation into `/code-loop` automation (currently, commands read the escalation guidance and decide — the tools don't auto-escalate)

### Known Issues or Deferred Items

- Consensus analysis is heuristic-based — may misclassify responses. Future improvement: use an LLM to classify (dispatch to a fast model like glm-4.7-flashx to read all responses and classify)
- `t4-sign-off` pattern uses paid models — warn the user in commands before invoking
- The `noReply` field on summary posts is not set — may cause the server to generate unwanted responses. Add `noReply: true` if this becomes an issue.

---

## PHASE COMPLETION CHECKLIST

- [x] Task 1 completed (config + types + batch patterns)
- [x] Task 2 completed (helper functions + parallel dispatch + consensus)
- [x] Task 3 completed (output formatting)
- [x] Task 4 completed (tool export)
- [x] All tasks produce a single coherent file
- [x] TypeScript compiles without errors
- [x] All 11 batch patterns match model-strategy.md
- [x] Consensus analysis implements correct escalation rules
- [x] No modifications to existing files
- [x] Acceptance criteria all met
- [x] Handoff notes completed

---

## PHASE NOTES

### Key Design Decisions (This Phase)

- **Duplicate helpers rather than import from dispatch.ts**: Zero coupling between tools. Each tool is independently functional. If dispatch.ts breaks, batch-dispatch still works. The duplication cost is ~100 lines — acceptable for operational independence.
- **Text mode only for batch dispatch**: Agent mode for N models in parallel would be chaotic — N models editing files simultaneously is a recipe for conflicts. Batch is for reviews, not implementation.
- **Keyword-based consensus rather than LLM-based**: Fast, deterministic, zero cost. An LLM-based classifier would be more accurate but adds latency and cost per batch. The keyword approach is good enough for the escalation decision.
- **Custom models as JSON string**: Zod's `tool.schema` doesn't support nested object arrays. JSON string parsing with manual validation is the pragmatic choice.

### Risks (This Phase)

- **Keyword consensus misclassification**: A model that says "no bugs found, the code looks good" and happens to mention "vulnerability" in a tangential context could be misclassified. Mitigation: threshold (>3 issue keywords AND >2x ratio) helps. Full responses are always included for human review.
- **Parallel dispatch overwhelming providers**: 5 simultaneous requests to the same provider could trigger rate limits. Mitigation: patterns use diverse providers (ZAI + Bailian + Ollama) to spread the load.

### Confidence Score: 8/10

- **Strengths**: Parallel dispatch pattern proven in council.ts, batch patterns explicitly defined, output format is straightforward, consensus rules are simple and well-documented
- **Uncertainties**: Keyword consensus accuracy, provider rate limiting with parallel requests, custom model JSON ergonomics
- **Mitigations**: Full responses always available for manual override, provider diversity in patterns, clear error messages for JSON parsing
