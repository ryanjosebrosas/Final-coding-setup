# Feature: Multi-Model Dispatch — Phase 1 of 2

> **Master Plan**: `.agents/features/multi-model-dispatch/plan-master.md`
> **This Phase**: Phase 1 — dispatch.ts (thin orchestration router)
> **Sub-Plan Path**: `.agents/features/multi-model-dispatch/plan-phase-1.md`

---

## PRIOR PHASE SUMMARY

This is the first phase — no prior work. Start fresh.

The only existing tool is `.opencode/tools/council.ts` (759 lines), which provides the reference implementation for server API interaction patterns.

**Critical discovery during planning**: The OpenCode server's agent mode via `SubtaskPartInput` gives the dispatched model a **full OpenCode session** with the same tools as the orchestrator: file read/write, bash, glob, grep, and slash commands. This means:
- Agent mode dispatch does NOT need to send large prompts with inline code
- Agent mode dispatch does NOT need a primer document — the model reads `AGENTS.md` and project files itself
- Agent mode dispatch is **thin orchestration**: route to a model, give it a short instruction (e.g., "Run `/planning auth-system`"), let it work
- The dispatch tool's job is routing and session management, not prompt engineering

Additionally, the server has a **dedicated command endpoint** (`POST /session/{sessionID}/command`) that can dispatch a slash command directly to a model. This is even cleaner than SubtaskPartInput for command-based workflows.

---

## PHASE SCOPE

**What This Phase Delivers:**

A thin dispatch tool (`dispatch.ts`) that routes tasks to the right model with two modes:
- **Agent mode**: Creates a full OpenCode agent session. The dispatched model has file access, bash, grep, and can run slash commands. Instructions are short ("Run `/planning auth-system`"). The model follows the same PIV loop we follow.
- **Text mode**: Simple prompt → response. No tool access. Used for reviews, opinions, analysis where the model just needs to read and respond.
- **Command mode**: Dispatches a specific slash command to a model via the command endpoint. The most structured way to delegate work.

Plus taskType auto-routing across 5 tiers, T0 planning cascade, and session management.

**Files This Phase Touches:**
- `.opencode/tools/dispatch.ts` — CREATE: thin dispatch router (~400-500 lines)

**Dependencies:**
- `@opencode-ai/plugin` v1.2.15 (already installed)
- `opencode serve` running at `http://127.0.0.1:4096`

**Out of Scope for This Phase:**
- Batch/parallel dispatch (Phase 2)
- `_dispatch-primer.md` — **eliminated**. Agent mode models read AGENTS.md themselves. Text mode models get the prompt as-is; the calling command is responsible for including enough context.
- Modifying any command files
- Modifying council.ts

---

## CONTEXT REFERENCES

### Phase-Specific Files

> IMPORTANT: The execution agent MUST read these files before implementing!

- `.opencode/tools/council.ts` (all 759 lines) — Why: PRIMARY reference. Provides patterns for: `tool()` definition, server API interaction, session lifecycle, error handling, response extraction, timeout management, archiving. Read ENTIRELY before writing dispatch.ts.

- `.opencode/reference/model-strategy.md` (all 199 lines) — Why: The AUTHORITATIVE spec. Contains: 5-tier overview, taskType routing table (lines 31-61), dispatch modes (lines 97-123), cascade rules. This is what we're implementing.

- `.opencode/node_modules/@opencode-ai/sdk/dist/v2/gen/types.gen.d.ts` (lines 242-254) — Why: `SubtaskPart` response type.

- `.opencode/node_modules/@opencode-ai/sdk/dist/v2/gen/types.gen.d.ts` (lines 1452-1473) — Why: `SubtaskPartInput` type — the agent mode dispatch mechanism:
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

- `.opencode/node_modules/@opencode-ai/sdk/dist/v2/gen/types.gen.d.ts` (lines 2885-2912) — Why: `SessionCommandData` — the command endpoint for dispatching slash commands directly:
  ```typescript
  export type SessionCommandData = {
      body?: {
          messageID?: string;
          agent?: string;
          model?: string;
          arguments: string;
          command: string;
          variant?: string;
          parts?: Array<{...}>;
      };
      path: { sessionID: string; };
      query?: { directory?: string; };
      url: "/session/{sessionID}/command";
  };
  ```

- `.opencode/node_modules/@opencode-ai/plugin/dist/tool.d.ts` — Why: `tool()` function signature and `ToolContext` type.

### New Files to Create

- `.opencode/tools/dispatch.ts` — Thin dispatch router with text/agent/command modes

### Related Memories

No relevant memories found.

### Patterns to Follow (Phase-Specific)

**Pattern 1: Tool export structure** (from `.opencode/tools/council.ts:1,730-759`):
```typescript
import { tool } from "@opencode-ai/plugin"

// ... config, types, helpers ...

export default tool({
  description: "...",
  args: { /* Zod schemas */ },
  async execute(args, context) {
    // 1. Validate inputs
    // 2. Resolve route
    // 3. Health check
    // 4. Create session
    // 5. Dispatch (text, agent, or command)
    // 6. Archive old sessions
    // 7. Return formatted output
    return output
  }
})
```
- Why: All tools follow this structure. Config at top, helpers in middle, export at bottom.
- Gotcha: `execute()` must return `Promise<string>`. Never throw — return error messages.

**Pattern 2: Text mode dispatch** (from `.opencode/tools/council.ts:152-190`):
```typescript
const response = await fetch(`${OPENCODE_URL}/session/${sessionId}/message`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: { providerID, modelID },
    parts: [{ type: "text", text: prompt }],
  }),
  signal: AbortSignal.timeout(timeoutMs),
})
```
- Why: This is exactly how text mode works — send a prompt, get text back.
- Gotcha: Filter response parts for `type: "text"` only.

**Pattern 3: Agent mode dispatch** (from SDK types `SubtaskPartInput`):
```typescript
const response = await fetch(`${OPENCODE_URL}/session/${sessionId}/message`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    parts: [{
      type: "subtask",
      prompt: "Run /planning auth-system",  // SHORT instruction
      description: "Planning: auth-system",
      agent: "default",
      model: { providerID: "bailian-coding-plan-test", modelID: "qwen3.5-plus" },
    }],
  }),
  signal: AbortSignal.timeout(timeoutMs),
})
```
- Why: Agent mode sends a `SubtaskPartInput`. The server creates a child session with FULL tool access. The model can read files, edit code, run bash, execute commands — the same capabilities we have.
- Gotcha: The prompt should be SHORT — "Run /execute .agents/features/auth/plan.md" — not a wall of text. The model reads files itself. The `command` field in SubtaskPartInput is optional and may also trigger command execution.

**Pattern 4: Command mode dispatch** (from SDK types `SessionCommandData`):
```typescript
const response = await fetch(`${OPENCODE_URL}/session/${sessionId}/command`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    command: "planning",
    arguments: "auth-system",
    model: "bailian-coding-plan-test/qwen3.5-plus",
  }),
})
```
- Why: The command endpoint dispatches a slash command directly to a model. This is the most structured dispatch — the model enters the command's workflow immediately.
- Gotcha: The `model` field here is a string in `"provider/model"` format, NOT a `{ providerID, modelID }` object. Also: the response may be long-running. Use `prompt_async` (`POST /session/{id}/prompt_async`) for fire-and-forget if the result doesn't need to come back synchronously.

**Pattern 5: Session archiving** (from `.opencode/tools/council.ts:600-680`):
```typescript
async function archiveOldDispatches(): Promise<void> {
  // Filter by "Dispatch:" title prefix
  // Archive parent + children
  // Cap at MAX_ARCHIVE_PER_RUN
  // Silent fail — best-effort
}
```
- Why: Background cleanup. Fire-and-forget.
- Gotcha: Use `"Dispatch:"` prefix to avoid touching council sessions.

---

## STEP-BY-STEP TASKS

### Task 1: CREATE `.opencode/tools/dispatch.ts` — Configuration, Types, Routing Table

- **ACTION**: CREATE (first section of the file)
- **TARGET**: `.opencode/tools/dispatch.ts`
- **IMPLEMENT**: Write imports, configuration constants, type definitions, and the complete taskType routing table.

  ```typescript
  import { tool } from "@opencode-ai/plugin"

  // ============================================================================
  // CONFIGURATION
  // ============================================================================

  const OPENCODE_URL = "http://127.0.0.1:4096"
  const TEXT_TIMEOUT_MS = 120_000     // 2 min — text mode (reviews, analysis)
  const AGENT_TIMEOUT_MS = 300_000    // 5 min — agent mode (default)
  const AGENT_LONG_TIMEOUT_MS = 900_000 // 15 min — agent mode (planning, execution)
  const CASCADE_TIMEOUT_MS = 30_000   // 30 sec — per cascade attempt (text mode)
  const COMMAND_TIMEOUT_MS = 600_000  // 10 min — command mode (full command execution)
  const HEALTH_TIMEOUT_MS = 5_000
  const ARCHIVE_AFTER_DAYS = 3
  const ARCHIVE_AFTER_MS = ARCHIVE_AFTER_DAYS * 24 * 60 * 60 * 1000
  const MAX_ARCHIVE_PER_RUN = 10

  // ============================================================================
  // TYPES
  // ============================================================================

  type DispatchMode = "text" | "agent" | "command"

  interface ModelRoute {
    provider: string
    model: string
    label: string
  }

  interface CascadeRoute {
    type: "cascade"
    models: ModelRoute[]
  }

  interface DispatchResult {
    text: string
    provider: string
    model: string
    label: string
    mode: DispatchMode
    latencyMs: number
    sessionId: string
    cascadeAttempts?: number
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
  // TASK TYPE ROUTING TABLE
  // ============================================================================

  // Authoritative routing from model-strategy.md
  // Each taskType → specific provider/model (or cascade for T0)

  const TASK_ROUTES: Record<string, ModelRoute | CascadeRoute> = {
    // ── T1a: Fast (Bailian) ──
    "boilerplate":          { provider: "bailian-coding-plan-test", model: "qwen3-coder-next", label: "QWEN3-CODER-NEXT" },
    "simple-fix":           { provider: "bailian-coding-plan-test", model: "qwen3-coder-next", label: "QWEN3-CODER-NEXT" },
    "quick-check":          { provider: "bailian-coding-plan-test", model: "qwen3-coder-next", label: "QWEN3-CODER-NEXT" },
    "general-opinion":      { provider: "bailian-coding-plan-test", model: "qwen3-coder-next", label: "QWEN3-CODER-NEXT" },
    "pre-commit-analysis":  { provider: "bailian-coding-plan-test", model: "qwen3-coder-next", label: "QWEN3-CODER-NEXT" },

    // ── T1b: Code (Bailian) ──
    "test-scaffolding":     { provider: "bailian-coding-plan-test", model: "qwen3-coder-plus", label: "QWEN3-CODER-PLUS" },
    "test-generation":      { provider: "bailian-coding-plan-test", model: "qwen3-coder-plus", label: "QWEN3-CODER-PLUS" },
    "logic-verification":   { provider: "bailian-coding-plan-test", model: "qwen3-coder-plus", label: "QWEN3-CODER-PLUS" },
    "api-analysis":         { provider: "bailian-coding-plan-test", model: "qwen3-coder-plus", label: "QWEN3-CODER-PLUS" },
    "code-quality-review":  { provider: "bailian-coding-plan-test", model: "qwen3-coder-plus", label: "QWEN3-CODER-PLUS" },

    // ── T1c: Complex (Bailian) ──
    "complex-codegen":      { provider: "bailian-coding-plan-test", model: "qwen3.5-plus", label: "QWEN3.5-PLUS" },
    "complex-fix":          { provider: "bailian-coding-plan-test", model: "qwen3.5-plus", label: "QWEN3.5-PLUS" },
    "research":             { provider: "bailian-coding-plan-test", model: "qwen3.5-plus", label: "QWEN3.5-PLUS" },
    "architecture":         { provider: "bailian-coding-plan-test", model: "qwen3.5-plus", label: "QWEN3.5-PLUS" },
    "library-comparison":   { provider: "bailian-coding-plan-test", model: "qwen3.5-plus", label: "QWEN3.5-PLUS" },
    "pattern-scan":         { provider: "bailian-coding-plan-test", model: "qwen3.5-plus", label: "QWEN3.5-PLUS" },
    "execution":            { provider: "bailian-coding-plan-test", model: "qwen3.5-plus", label: "QWEN3.5-PLUS" },

    // ── T1d: Long Context (Bailian) ──
    "docs-lookup":          { provider: "bailian-coding-plan-test", model: "kimi-k2.5", label: "KIMI-K2.5" },
    "long-context-review":  { provider: "bailian-coding-plan-test", model: "kimi-k2.5", label: "KIMI-K2.5" },

    // ── T1e: Prose (Bailian) ──
    "docs-generation":      { provider: "bailian-coding-plan-test", model: "minimax-m2.5", label: "MINIMAX-M2.5" },
    "docstring-generation": { provider: "bailian-coding-plan-test", model: "minimax-m2.5", label: "MINIMAX-M2.5" },
    "changelog-generation": { provider: "bailian-coding-plan-test", model: "minimax-m2.5", label: "MINIMAX-M2.5" },

    // ── T0: Planning (Cascade: FREE → PAID) ──
    "planning": {
      type: "cascade",
      models: [
        { provider: "ollama-cloud", model: "kimi-k2-thinking", label: "KIMI-K2-THINKING" },
        { provider: "ollama-cloud", model: "cogito-2.1:671b", label: "COGITO-2.1" },
        { provider: "bailian-coding-plan-test", model: "qwen3-max-2026-01-23", label: "QWEN3-MAX" },
        { provider: "anthropic", model: "claude-opus-4-5", label: "CLAUDE-OPUS-4-5" },
      ],
    },

    // ── T1f: Reasoning (Bailian) ──
    "deep-plan-review":     { provider: "bailian-coding-plan-test", model: "qwen3-max-2026-01-23", label: "QWEN3-MAX" },
    "complex-reasoning":    { provider: "bailian-coding-plan-test", model: "qwen3-max-2026-01-23", label: "QWEN3-MAX" },

    // ── T2a: Thinking Review (ZAI) ──
    "thinking-review":      { provider: "zai-coding-plan", model: "glm-5", label: "GLM-5" },
    "first-validation":     { provider: "zai-coding-plan", model: "glm-5", label: "GLM-5" },
    "code-review":          { provider: "zai-coding-plan", model: "glm-5", label: "GLM-5" },
    "security-review":      { provider: "zai-coding-plan", model: "glm-5", label: "GLM-5" },
    "plan-review":          { provider: "zai-coding-plan", model: "glm-5", label: "GLM-5" },
    "logic-review":         { provider: "zai-coding-plan", model: "glm-5", label: "GLM-5" },

    // ── T2b: Flagship (ZAI) ──
    "architecture-audit":   { provider: "zai-coding-plan", model: "glm-4.5", label: "GLM-4.5" },
    "design-review":        { provider: "zai-coding-plan", model: "glm-4.5", label: "GLM-4.5" },

    // ── T2c: Standard (ZAI) ──
    "regression-check":     { provider: "zai-coding-plan", model: "glm-4.7", label: "GLM-4.7" },
    "compatibility-check":  { provider: "zai-coding-plan", model: "glm-4.7", label: "GLM-4.7" },

    // ── T2d: Flash (ZAI) ──
    "style-review":         { provider: "zai-coding-plan", model: "glm-4.7-flash", label: "GLM-4.7-FLASH" },
    "quick-style-check":    { provider: "zai-coding-plan", model: "glm-4.7-flash", label: "GLM-4.7-FLASH" },

    // ── T2e: Ultrafast (ZAI) ──
    "fast-review":          { provider: "zai-coding-plan", model: "glm-4.7-flashx", label: "GLM-4.7-FLASHX" },
    "ultra-fast-check":     { provider: "zai-coding-plan", model: "glm-4.7-flashx", label: "GLM-4.7-FLASHX" },

    // ── T3: Second Validation (Ollama Cloud) ──
    "second-validation":    { provider: "ollama-cloud", model: "deepseek-v3.2", label: "DEEPSEEK-V3.2" },
    "deep-research":        { provider: "ollama-cloud", model: "deepseek-v3.2", label: "DEEPSEEK-V3.2" },
    "independent-review":   { provider: "ollama-cloud", model: "deepseek-v3.2", label: "DEEPSEEK-V3.2" },
    "architecture-review":  { provider: "ollama-cloud", model: "kimi-k2:1t", label: "KIMI-K2" },
    "deep-code-review":     { provider: "ollama-cloud", model: "deepseek-v3.1:671b", label: "DEEPSEEK-V3.1" },
    "reasoning-review":     { provider: "ollama-cloud", model: "cogito-2.1:671b", label: "COGITO-2.1" },
    "test-review":          { provider: "ollama-cloud", model: "devstral-2:123b", label: "DEVSTRAL-2" },
    "multi-review":         { provider: "ollama-cloud", model: "gemini-3-pro-preview", label: "GEMINI-3-PRO" },
    "fast-second-opinion":  { provider: "ollama-cloud", model: "gemini-3-flash-preview", label: "GEMINI-3-FLASH" },
    "heavy-codegen":        { provider: "ollama-cloud", model: "mistral-large-3:675b", label: "MISTRAL-LARGE-3" },
    "big-code-review":      { provider: "ollama-cloud", model: "qwen3-coder:480b", label: "QWEN3-CODER-480B" },
    "thinking-second":      { provider: "ollama-cloud", model: "kimi-k2-thinking", label: "KIMI-K2-THINKING" },
    "plan-critique":        { provider: "ollama-cloud", model: "qwen3.5:397b", label: "QWEN3.5-397B" },

    // ── T4: Paid Review Gate ──
    "codex-review":         { provider: "openai", model: "gpt-5.3-codex", label: "GPT-5.3-CODEX" },
    "codex-validation":     { provider: "openai", model: "gpt-5.3-codex", label: "GPT-5.3-CODEX" },
    "sonnet-45-review":     { provider: "anthropic", model: "claude-sonnet-4-5", label: "CLAUDE-SONNET-4-5" },
    "sonnet-46-review":     { provider: "anthropic", model: "claude-sonnet-4-6", label: "CLAUDE-SONNET-4-6" },

    // ── T5: Final Review ──
    "final-review":         { provider: "anthropic", model: "claude-sonnet-4-6", label: "CLAUDE-SONNET-4-6" },
    "critical-review":      { provider: "anthropic", model: "claude-sonnet-4-6", label: "CLAUDE-SONNET-4-6" },

    // ── Haiku: Cheap text generation ──
    "commit-message":       { provider: "anthropic", model: "claude-haiku-4-5", label: "CLAUDE-HAIKU-4-5" },
    "pr-description":       { provider: "anthropic", model: "claude-haiku-4-5", label: "CLAUDE-HAIKU-4-5" },
    "changelog":            { provider: "anthropic", model: "claude-haiku-4-5", label: "CLAUDE-HAIKU-4-5" },
  }

  // Fallback when primary provider 404s (from model-strategy.md line 22)
  const FALLBACK_ROUTE: ModelRoute = {
    provider: "zai-coding-plan", model: "glm-4.7", label: "GLM-4.7 (fallback)"
  }
  ```

  **Notes:**
  - 55+ entries covering all taskTypes from model-strategy.md
  - `"execution"` added (used by `/build` Step 5, routes to T1c qwen3.5-plus)
  - `"t4-sign-off"` omitted (batch-dispatch concern)
  - `DispatchMode` now includes `"command"` as a third mode
  - Three timeout tiers: text (2min), agent (5min default / 15min for planning+execution), command (10min)

- **PATTERN**: Mirror `council.ts:1-28` — config at top, then model definitions
- **IMPORTS**: `import { tool } from "@opencode-ai/plugin"` (only import needed — no fs/path since no primer file)
- **GOTCHA**: Double-check every provider/model string against model-strategy.md. A typo means silent 404s.
- **VALIDATE**: Read the top section. Verify: (1) Single import, (2) 6 timeout constants, (3) `DispatchMode = "text" | "agent" | "command"`, (4) All types defined, (5) TASK_ROUTES has all taskTypes from model-strategy.md, (6) Planning cascade has 4 models in correct order, (7) FALLBACK_ROUTE defined.

---

### Task 2: CREATE `.opencode/tools/dispatch.ts` — Helper Functions (Server + Dispatch)

- **ACTION**: CREATE (middle section — append after Task 1)
- **TARGET**: `.opencode/tools/dispatch.ts`
- **IMPLEMENT**: Write all helper functions for server interaction and the three dispatch modes.

  ```typescript
  // ============================================================================
  // SERVER INTERACTION (mirrors council.ts patterns)
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

  function extractTextFromParts(data: any): string | null {
    const textParts = data?.parts?.filter((p: any) => p.type === "text") || []
    const text = textParts.map((p: any) => p.text).join("\n")
    return text || null
  }

  // ============================================================================
  // TEXT MODE — prompt in, text out (no tool access)
  // ============================================================================

  async function dispatchText(
    sessionId: string,
    provider: string,
    model: string,
    prompt: string,
    timeoutMs: number,
  ): Promise<string | null> {
    try {
      const response = await fetch(`${OPENCODE_URL}/session/${sessionId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: { providerID: provider, modelID: model },
          parts: [{ type: "text", text: prompt }],
        }),
        signal: AbortSignal.timeout(timeoutMs),
      })
      if (!response.ok) return null
      const data = await response.json()
      return extractTextFromParts(data)
    } catch {
      return null
    }
  }

  // ============================================================================
  // AGENT MODE — full OpenCode session (file access, bash, grep, commands)
  //
  // The dispatched model gets the SAME tools we have. It reads AGENTS.md,
  // navigates the codebase, follows the PIV loop, runs slash commands.
  // The prompt should be SHORT — a task description, not a wall of text.
  //
  // Examples of good agent prompts:
  //   "Run /planning auth-system"
  //   "Run /execute .agents/features/auth/plan.md"
  //   "Read src/auth.ts and fix the null pointer on line 42"
  //   "Run /code-review"
  //
  // Examples of BAD agent prompts:
  //   "Here is 500 lines of code, please review it and..." (use text mode)
  //   "The project structure is: ... The conventions are: ..." (model reads itself)
  // ============================================================================

  async function dispatchAgent(
    sessionId: string,
    provider: string,
    model: string,
    prompt: string,
    description: string,
    timeoutMs: number,
  ): Promise<string | null> {
    try {
      const response = await fetch(`${OPENCODE_URL}/session/${sessionId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parts: [{
            type: "subtask",
            prompt,
            description,
            agent: "default",
            model: { providerID: provider, modelID: model },
          }],
        }),
        signal: AbortSignal.timeout(timeoutMs),
      })
      if (!response.ok) return null
      const data = await response.json()
      // Try extracting text directly from response parts
      const text = extractTextFromParts(data)
      if (text) return text
      // If response contains subtask parts, the result is in the child session
      const subtaskParts = data?.parts?.filter((p: any) => p.type === "subtask") || []
      if (subtaskParts.length > 0 && subtaskParts[0].sessionID) {
        return await getSessionLastResponse(subtaskParts[0].sessionID)
      }
      return null
    } catch {
      return null
    }
  }

  async function getSessionLastResponse(sessionId: string): Promise<string | null> {
    try {
      const response = await fetch(
        `${OPENCODE_URL}/session/${sessionId}/message?limit=5`,
        { signal: AbortSignal.timeout(10_000) },
      )
      if (!response.ok) return null
      const messages = await response.json()
      if (!Array.isArray(messages) || messages.length === 0) return null
      // Get the last assistant message with text content
      for (let i = messages.length - 1; i >= 0; i--) {
        const text = extractTextFromParts(messages[i])
        if (text) return text
      }
      return null
    } catch {
      return null
    }
  }

  // ============================================================================
  // COMMAND MODE — dispatch a slash command directly to a model
  //
  // The most structured dispatch. The model enters the command's workflow
  // immediately. Example: command="planning", arguments="auth-system"
  // makes the model run /planning auth-system in its own session.
  //
  // This is the preferred mode for PIV loop delegation:
  //   command="planning"  → model runs /planning
  //   command="execute"   → model runs /execute
  //   command="code-review" → model runs /code-review
  //   command="commit"    → model runs /commit
  // ============================================================================

  async function dispatchCommand(
    sessionId: string,
    provider: string,
    model: string,
    command: string,
    commandArgs: string,
    timeoutMs: number,
  ): Promise<string | null> {
    try {
      const response = await fetch(`${OPENCODE_URL}/session/${sessionId}/command`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command,
          arguments: commandArgs,
          model: `${provider}/${model}`,
        }),
        signal: AbortSignal.timeout(timeoutMs),
      })
      if (!response.ok) return null
      const data = await response.json()
      return extractTextFromParts(data)
    } catch {
      return null
    }
  }

  // ============================================================================
  // CASCADE DISPATCH (T0 Planning — sequential fallthrough)
  // ============================================================================

  async function dispatchCascade(
    sessionId: string,
    cascade: CascadeRoute,
    prompt: string,
    mode: DispatchMode,
    description: string,
    command?: string,
    commandArgs?: string,
  ): Promise<DispatchResult | null> {
    for (let i = 0; i < cascade.models.length; i++) {
      const route = cascade.models[i]
      const start = Date.now()
      let text: string | null = null

      if (mode === "command" && command) {
        text = await dispatchCommand(
          sessionId, route.provider, route.model,
          command, commandArgs || "", COMMAND_TIMEOUT_MS,
        )
      } else if (mode === "agent") {
        text = await dispatchAgent(
          sessionId, route.provider, route.model,
          prompt, description, AGENT_LONG_TIMEOUT_MS,
        )
      } else {
        text = await dispatchText(
          sessionId, route.provider, route.model,
          prompt, CASCADE_TIMEOUT_MS,
        )
      }

      const latencyMs = Date.now() - start

      if (text) {
        return {
          text,
          provider: route.provider,
          model: route.model,
          label: route.label,
          mode,
          latencyMs,
          sessionId,
          cascadeAttempts: i + 1,
        }
      }
      // Model failed — try next in cascade
    }
    return null
  }

  // ============================================================================
  // ROUTE RESOLUTION
  // ============================================================================

  function resolveRoute(
    taskType?: string,
    provider?: string,
    model?: string,
  ): { route: ModelRoute | CascadeRoute; source: string } | null {
    // Explicit provider/model overrides taskType
    if (provider && model) {
      return {
        route: { provider, model, label: `${provider}/${model}` },
        source: "explicit",
      }
    }
    // TaskType lookup
    if (taskType) {
      const route = TASK_ROUTES[taskType]
      if (route) return { route, source: `taskType:${taskType}` }
      return { route: FALLBACK_ROUTE, source: `taskType:${taskType} (unknown → fallback)` }
    }
    return null
  }

  // ============================================================================
  // SESSION ARCHIVING (mirrors council.ts)
  // ============================================================================

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

  async function archiveOldDispatches(): Promise<void> {
    try {
      const sessions = await listSessions()
      const now = Date.now()
      let archived = 0
      const dispatchSessions = sessions.filter(
        (s) =>
          s.title?.startsWith("Dispatch:") &&
          !s.parentID &&
          s.time?.created &&
          now - s.time.created > ARCHIVE_AFTER_MS &&
          !s.time?.archived,
      )
      for (const session of dispatchSessions) {
        if (archived >= MAX_ARCHIVE_PER_RUN) break
        const children = sessions.filter((s) => s.parentID === session.id)
        for (const child of children) {
          await archiveSession(child.id)
        }
        await archiveSession(session.id)
        archived++
      }
    } catch {
      // Silent fail
    }
  }
  ```

  **Key differences from the old plan:**
  - `dispatchAgent` sends SHORT prompts, not walls of text. Comments emphasize this.
  - `dispatchCommand` is a NEW function using `POST /session/{id}/command`. It's the cleanest way to delegate — the model enters the command workflow directly.
  - `dispatchCascade` now supports all three modes (text, agent, command).
  - No `loadPrimer()` or `prependPrimer()` — eliminated. Agent mode models read project files themselves. Text mode prompts come from the calling command, which already includes the necessary context.
  - `extractTextFromParts()` factored out as a shared helper.

- **PATTERN**: Mirror council.ts for server interaction; new patterns for command endpoint
- **IMPORTS**: Already in Task 1
- **GOTCHA**: 
  1. The command endpoint's `model` field is `"provider/model"` STRING format, not the `{ providerID, modelID }` object used by the message endpoint. Different serialization.
  2. Agent mode may time out for long tasks (planning = 15 min). Use `AGENT_LONG_TIMEOUT_MS` for planning/execution taskTypes.
  3. `getSessionLastResponse` fetches the last 5 messages and walks backward looking for text — the last message might be a tool call, not text.
- **VALIDATE**: Read helpers. Verify: (1) Three dispatch functions: `dispatchText`, `dispatchAgent`, `dispatchCommand`, (2) `dispatchAgent` uses `SubtaskPartInput` with `type: "subtask"`, (3) `dispatchCommand` uses `POST /session/{id}/command` with `"provider/model"` format, (4) `dispatchCascade` supports all 3 modes, (5) No primer loading functions exist (intentionally removed), (6) `extractTextFromParts` shared helper used consistently.

---

### Task 3: CREATE `.opencode/tools/dispatch.ts` — Tool Export

- **ACTION**: CREATE (final section — append after Task 2)
- **TARGET**: `.opencode/tools/dispatch.ts`
- **IMPLEMENT**: Write the `export default tool({...})` with all arguments and orchestration logic.

  ```typescript
  // ============================================================================
  // TOOL EXPORT
  // ============================================================================

  export default tool({
    description:
      "Route a task to an AI model via the OpenCode server. Three modes:\n" +
      "• text: prompt → response (reviews, analysis, opinions)\n" +
      "• agent: full OpenCode session with file access, bash, grep, commands " +
      "(implementation, planning, execution — model follows the same PIV loop)\n" +
      "• command: dispatch a slash command directly to a model " +
      "(e.g., /planning, /execute, /code-review, /commit)\n\n" +
      "Use taskType for auto-routing or specify provider/model explicitly.",

    args: {
      prompt: tool.schema
        .string()
        .describe(
          "The prompt or instruction to send. For agent mode, keep it SHORT — " +
          "the model has full tool access and reads files itself. " +
          'Example: "Run /planning auth-system" or "Fix the null pointer in src/auth.ts:42"',
        ),

      taskType: tool.schema
        .string()
        .optional()
        .describe(
          "Auto-route to the correct model by task type. " +
          "Examples: 'code-review' → GLM-5, 'execution' → Qwen3.5-Plus, " +
          "'planning' → cascade (free→paid), 'commit-message' → Haiku. " +
          "Full table in model-strategy.md. Overridden by explicit provider/model.",
        ),

      provider: tool.schema
        .string()
        .optional()
        .describe(
          "Explicit provider ID. Examples: 'bailian-coding-plan-test', " +
          "'zai-coding-plan', 'ollama-cloud', 'anthropic', 'openai'. " +
          "Must be paired with 'model'.",
        ),

      model: tool.schema
        .string()
        .optional()
        .describe(
          "Explicit model ID. Examples: 'qwen3.5-plus', 'glm-5', " +
          "'deepseek-v3.2', 'kimi-k2:1t'. Must be paired with 'provider'.",
        ),

      mode: tool.schema
        .string()
        .optional()
        .describe(
          "Dispatch mode. Default: 'text'.\n" +
          "• 'text': prompt → response, no tool access\n" +
          "• 'agent': full OpenCode session (read/write/bash/grep/commands)\n" +
          "• 'command': dispatch a slash command (use with 'command' arg)",
        ),

      command: tool.schema
        .string()
        .optional()
        .describe(
          "Slash command to dispatch (command mode only). " +
          "Examples: 'planning', 'execute', 'code-review', 'commit'. " +
          "The 'prompt' arg becomes the command arguments.",
        ),

      timeout: tool.schema
        .number()
        .optional()
        .describe(
          "Custom timeout in ms. Defaults: text=120000, agent=300000, command=600000. " +
          "For long tasks: 900000 (15min) for planning/execution.",
        ),

      description: tool.schema
        .string()
        .optional()
        .describe(
          "Short description for the session title (shown in OpenCode UI). " +
          "Defaults to taskType or 'Dispatch task'.",
        ),
    },

    async execute(args, context) {
      const mode: DispatchMode = (args.mode as DispatchMode) || "text"
      const description = args.description || args.taskType || "Dispatch task"

      // Default timeouts by mode
      const defaultTimeout = mode === "command" ? COMMAND_TIMEOUT_MS
        : mode === "agent" ? AGENT_TIMEOUT_MS
        : TEXT_TIMEOUT_MS
      const timeoutMs = args.timeout || defaultTimeout

      // ── 1. Validate inputs ──
      if (!args.prompt) {
        return "# Dispatch Error\n\nNo prompt provided."
      }
      if (!args.taskType && !args.provider && !args.model) {
        return (
          "# Dispatch Error\n\n" +
          "No routing info. Provide `taskType` (auto-route) " +
          "or both `provider` + `model` (explicit route)."
        )
      }
      if ((args.provider && !args.model) || (!args.provider && args.model)) {
        return (
          "# Dispatch Error\n\n" +
          "`provider` and `model` must be used together. " +
          `Got provider=${args.provider || "none"}, model=${args.model || "none"}.`
        )
      }
      if (mode === "command" && !args.command) {
        return (
          "# Dispatch Error\n\n" +
          "Command mode requires the `command` arg. " +
          'Example: command="planning", prompt="auth-system"'
        )
      }

      // ── 2. Resolve route ──
      const resolved = resolveRoute(args.taskType, args.provider, args.model)
      if (!resolved) {
        return "# Dispatch Error\n\nCould not resolve model route."
      }

      // ── 3. Health check ──
      const healthy = await checkServerHealth()
      if (!healthy) {
        return (
          `# Dispatch Error\n\n` +
          `OpenCode server not reachable at ${OPENCODE_URL}.\n` +
          `Make sure \`opencode serve\` is running.`
        )
      }

      // ── 4. Create session ──
      const isCascade = "type" in resolved.route && resolved.route.type === "cascade"
      const routeLabel = isCascade ? "CASCADE" : (resolved.route as ModelRoute).label
      const sessionTitle = `Dispatch: [${routeLabel}] ${description} (${mode})`
      const sessionId = await createSession(sessionTitle)
      if (!sessionId) {
        return "# Dispatch Error\n\nFailed to create session."
      }

      // ── 5. Dispatch ──
      const start = Date.now()
      let result: DispatchResult | null = null

      if (isCascade) {
        result = await dispatchCascade(
          sessionId,
          resolved.route as CascadeRoute,
          args.prompt,
          mode,
          description,
          args.command,
          args.prompt, // For command mode, prompt = command arguments
        )
      } else {
        const route = resolved.route as ModelRoute
        let text: string | null = null

        if (mode === "command" && args.command) {
          text = await dispatchCommand(
            sessionId, route.provider, route.model,
            args.command, args.prompt, timeoutMs,
          )
        } else if (mode === "agent") {
          text = await dispatchAgent(
            sessionId, route.provider, route.model,
            args.prompt, description, timeoutMs,
          )
        } else {
          text = await dispatchText(
            sessionId, route.provider, route.model,
            args.prompt, timeoutMs,
          )
        }

        if (text) {
          result = {
            text,
            provider: route.provider,
            model: route.model,
            label: route.label,
            mode,
            latencyMs: Date.now() - start,
            sessionId,
          }
        } else if (resolved.source !== "explicit") {
          // Try fallback for non-explicit routes
          let fallbackText: string | null = null
          if (mode === "command" && args.command) {
            fallbackText = await dispatchCommand(
              sessionId, FALLBACK_ROUTE.provider, FALLBACK_ROUTE.model,
              args.command, args.prompt, timeoutMs,
            )
          } else if (mode === "agent") {
            fallbackText = await dispatchAgent(
              sessionId, FALLBACK_ROUTE.provider, FALLBACK_ROUTE.model,
              args.prompt, description, timeoutMs,
            )
          } else {
            fallbackText = await dispatchText(
              sessionId, FALLBACK_ROUTE.provider, FALLBACK_ROUTE.model,
              args.prompt, timeoutMs,
            )
          }
          if (fallbackText) {
            result = {
              text: fallbackText,
              provider: FALLBACK_ROUTE.provider,
              model: FALLBACK_ROUTE.model,
              label: FALLBACK_ROUTE.label,
              mode,
              latencyMs: Date.now() - start,
              sessionId,
            }
          }
        }
      }

      const totalMs = Date.now() - start

      // ── 6. Background cleanup ──
      archiveOldDispatches().catch(() => {})

      // ── 7. Format output ──
      if (!result) {
        return (
          `# Dispatch Failed\n\n` +
          `**Route**: ${resolved.source}\n` +
          `**Mode**: ${mode}\n` +
          `**Session**: ${sessionId}\n` +
          `**Time**: ${(totalMs / 1000).toFixed(1)}s\n\n` +
          `No model responded. Check provider configuration.\n\n` +
          `**Debug**: \`GET ${OPENCODE_URL}/session/${sessionId}\``
        )
      }

      const meta = [
        `**Model**: ${result.label} (\`${result.provider}/${result.model}\`)`,
        `**Mode**: ${result.mode}`,
        `**Route**: ${resolved.source}`,
        `**Latency**: ${(result.latencyMs / 1000).toFixed(1)}s`,
        `**Session**: ${result.sessionId}`,
      ]
      if (result.cascadeAttempts) {
        meta.push(`**Cascade**: attempt ${result.cascadeAttempts}/${(resolved.route as CascadeRoute).models.length}`)
      }
      if (mode === "command" && args.command) {
        meta.push(`**Command**: /${args.command} ${args.prompt}`)
      }

      return `# Dispatch Result\n\n${meta.join("\n")}\n\n---\n\n${result.text}`
    },
  })
  ```

  **Key design decisions in the tool export:**
  - 7 args: `prompt`, `taskType`, `provider`, `model`, `mode`, `command`, `timeout`, `description`
  - Mode defaults to `"text"` — most existing command references use text mode for reviews
  - Command mode validates that `command` arg is provided
  - Fallback only triggers for non-explicit routes (if you explicitly chose a model and it fails, that's your problem)
  - Output format: markdown header with metadata, `---` separator, then the model's response
  - Session title includes the mode for easy identification in OpenCode UI
  - For command mode in cascade, `prompt` doubles as `commandArgs` (e.g., "auth-system")

- **PATTERN**: Mirror `council.ts:730-759` — tool export at bottom
- **IMPORTS**: All in Task 1
- **GOTCHA**:
  1. `mode` is a string in Zod, not an enum. Validate via type assertion `(args.mode as DispatchMode)`.
  2. In command mode, `args.prompt` serves double duty: it's the "prompt" for routing purposes AND the "arguments" for the command endpoint. This is intentional — when you dispatch `/planning auth-system`, "auth-system" is both the prompt arg and the command argument.
  3. The `description` arg defaults to `taskType` if provided, then falls back to "Dispatch task". This makes session titles readable in the UI.
- **VALIDATE**:
  1. Verify args: prompt (required), taskType (optional), provider (optional), model (optional), mode (optional), command (optional), timeout (optional), description (optional) = 8 args.
  2. Verify validation: missing prompt, missing routing, mismatched provider/model, command mode without command arg.
  3. Verify flow: validate → resolve → health → session → dispatch (cascade/direct) → fallback → archive → format.
  4. Verify all error paths return formatted markdown strings.
  5. Compile: `npx tsc --noEmit` in `.opencode/`.

---

## TESTING STRATEGY (This Phase)

### Unit Tests

N/A — OpenCode tools don't have a test runner.

### Integration Tests

After building, test these scenarios:

1. **Text mode, taskType routing**:
   ```
   dispatch({ taskType: "code-review", prompt: "Review: function add(a,b) { return a+b; }" })
   ```
   Expected: Routes to GLM-5, returns text review.

2. **Agent mode, short instruction**:
   ```
   dispatch({ taskType: "execution", mode: "agent", prompt: "List the files in .opencode/tools/ and describe each one" })
   ```
   Expected: Routes to Qwen3.5-Plus, model uses glob/read tools, returns file descriptions.

3. **Command mode, planning**:
   ```
   dispatch({ taskType: "planning", mode: "command", command: "planning", prompt: "test-feature" })
   ```
   Expected: Cascades through T0 models, runs `/planning test-feature` in agent session.

4. **Explicit provider/model**:
   ```
   dispatch({ provider: "zai-coding-plan", model: "glm-5", prompt: "What is 2+2?" })
   ```
   Expected: Direct route to GLM-5, text mode, returns answer.

5. **Unknown taskType (fallback)**:
   ```
   dispatch({ taskType: "nonexistent", prompt: "Hello" })
   ```
   Expected: Falls to FALLBACK_ROUTE (glm-4.7), returns response.

6. **Server down**:
   ```
   dispatch({ taskType: "code-review", prompt: "test" })
   ```
   (with server stopped) Expected: "OpenCode server not reachable" error.

### Edge Cases

- **Edge case 1**: Server down → clear error with "make sure `opencode serve` is running"
- **Edge case 2**: Model returns empty → null → triggers fallback (non-explicit) or fails (explicit)
- **Edge case 3**: Agent mode timeout → AbortSignal fires → null → fallback
- **Edge case 4**: Command mode without command arg → validation error
- **Edge case 5**: Both taskType and provider/model → explicit takes precedence
- **Edge case 6**: Cascade all models fail → "No model responded" with debug URL
- **Edge case 7**: Agent mode model can't run a command (unsupported) → returns partial/error text, not null

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

### Level 3-4: N/A

### Level 5: Manual Validation

1. Read `dispatch.ts`:
   - File structure: imports → config → types → routing table → helpers → tool export
   - All 55+ taskType entries match model-strategy.md
   - Planning cascade: kimi-k2-thinking → cogito → qwen3-max → opus
   - Three dispatch functions: `dispatchText`, `dispatchAgent`, `dispatchCommand`
   - `dispatchAgent` uses `SubtaskPartInput` with short prompt emphasis
   - `dispatchCommand` uses `POST /session/{id}/command` with `"provider/model"` format
   - Tool export has 8 args with clear descriptions
   - **NO primer loading** (intentionally eliminated)
   - All error paths return formatted markdown

2. Verify tool set:
   ```bash
   ls .opencode/tools/
   # Expected: council.ts, dispatch.ts
   ```

### Level 6: Additional
```bash
wc -l .opencode/tools/dispatch.ts
# Expected: 400-550 lines

# Verify no primer file was created
ls .opencode/tools/_dispatch-primer.md 2>&1 || echo "Good — no primer file"
```

---

## PHASE ACCEPTANCE CRITERIA

### Implementation (verify during execution)

- [x] `dispatch.ts` exists at `.opencode/tools/dispatch.ts`
- [x] Imports only `@opencode-ai/plugin` (no fs/path — no primer)
- [x] `TASK_ROUTES` has all taskTypes from model-strategy.md (55+ entries)
- [x] Planning cascade has 4 models in correct order
- [x] `FALLBACK_ROUTE` defined (glm-4.7)
- [x] `DispatchMode` includes "text", "agent", "command"
- [x] `dispatchText()` sends `{ model, parts: [{ type: "text" }] }`
- [x] `dispatchAgent()` sends `{ parts: [{ type: "subtask", agent: "default", model }] }`
- [x] `dispatchCommand()` sends to `POST /session/{id}/command` with `"provider/model"` string
- [x] `dispatchCascade()` supports all 3 modes
- [x] `resolveRoute()` handles explicit, taskType, and fallback
- [x] Tool export has 8 args: prompt, taskType, provider, model, mode, command, timeout, description
- [x] Command mode validates `command` arg is present
- [x] All error paths return formatted markdown (no throws)
- [x] Session archiving filters by `"Dispatch:"` prefix
- [x] **No `_dispatch-primer.md` created** (intentionally eliminated)
- [x] **No `loadPrimer()` or `prependPrimer()` functions** (intentionally eliminated)
- [x] TypeScript compiles without errors
- [x] No modifications to council.ts or any command files

### Runtime (verify after testing/deployment)

- [ ] Text mode returns responses from routed models
- [ ] Agent mode creates a full OpenCode session with tool access
- [ ] Command mode dispatches slash commands to models
- [ ] Cascade tries models in order, stops at first success
- [ ] Fallback activates for non-explicit failed routes
- [ ] `/council` still works unchanged

---

## HANDOFF NOTES

### Files Created/Modified

- `.opencode/tools/dispatch.ts` — Thin dispatch router with text/agent/command modes

### Patterns Established

- **Text mode**: `dispatchText(sessionId, provider, model, prompt, timeout)` → `{ model, parts: [text] }`
- **Agent mode**: `dispatchAgent(sessionId, provider, model, prompt, description, timeout)` → `{ parts: [subtask] }` — model gets full OpenCode session
- **Command mode**: `dispatchCommand(sessionId, provider, model, command, args, timeout)` → `POST /session/{id}/command` — model runs a slash command
- **Thin dispatch principle**: Agent/command mode prompts are SHORT. The model reads project files itself. No primer, no inline code, no context packing.

### State to Carry Forward

- `batch-dispatch.ts` in Phase 2 should duplicate server helpers (health check, session, text dispatch) for zero coupling
- batch-dispatch is TEXT MODE ONLY — no agent or command mode needed for parallel review gauntlets
- The `extractTextFromParts()` pattern should be duplicated in batch-dispatch

### Known Issues or Deferred Items

- Agent mode response extraction is unverified — SubtaskPartInput behavior needs runtime testing
- Command endpoint's response format may differ from message endpoint — verify during testing
- `minimax-m2.5` provider routing (T1e) is unverified — fallback will activate if broken
- `_dispatch-primer.md` was **intentionally eliminated** from Phase 1. If text mode reviews need project context, the calling command should include it in the prompt. This is a deliberate design choice — context responsibility belongs to the caller, not the transport layer.

---

## PHASE COMPLETION CHECKLIST

- [x] Task 1 completed (config + types + routing table)
- [x] Task 2 completed (helper functions: text, agent, command dispatch)
- [x] Task 3 completed (tool export with 8 args)
- [x] All tasks produce a single coherent file
- [x] TypeScript compiles without errors
- [x] 3 dispatch modes implemented: text, agent, command
- [x] Manual validation confirms structure matches council.ts patterns
- [x] No primer file or functions exist (intentional)
- [x] No modifications to existing files
- [x] Acceptance criteria all met
- [x] Handoff notes completed for Phase 2

---

## PHASE NOTES

### Key Design Decisions (This Phase)

- **Thin dispatch, not prompt engineering**: The old plan packed prompts with primers, inline code, and context. The new design sends SHORT instructions for agent/command mode because the model has full tool access and reads project files itself. This is simpler, more reliable, and doesn't waste context window.
- **Three modes instead of two**: Adding `command` mode alongside text and agent. Command mode is the cleanest way to delegate PIV loop work — `dispatch(mode: "command", command: "planning", prompt: "auth-system")` makes the model run `/planning auth-system` directly.
- **No primer file**: Eliminated `_dispatch-primer.md` entirely. Agent mode models read `AGENTS.md` themselves. Text mode prompts come from the calling command with sufficient context. The transport layer should not inject context — that's the caller's job.
- **`prompt` doubles as command arguments**: In command mode, `args.prompt` is both the routing prompt and the command's arguments string. This avoids adding yet another arg for command arguments.

### Risks (This Phase)

- **SubtaskPartInput behavior unverified**: We've never sent a subtask from a custom tool. The response format may surprise us. Mitigation: fallback to reading child session messages.
- **Command endpoint may behave differently than expected**: The `model` field is a string ("provider/model"), not the `{ providerID, modelID }` object. If the format is wrong, it silently fails. Mitigation: test with one command first.
- **Cascade timeout tuning**: 30s per model for text mode, 15 min for agent mode. Too short = premature fallthrough. Too long = slow cascade. Mitigation: allow `timeout` arg to override.

### Confidence Score: 9/10

- **Strengths**: Much simpler than the old plan. Three clean dispatch modes. Proven server API patterns from council.ts. Command endpoint discovered from SDK types. No primer complexity.
- **Uncertainties**: SubtaskPartInput runtime behavior. Command endpoint `model` field format.
- **Mitigations**: Fallback response extraction. Runtime testing.
