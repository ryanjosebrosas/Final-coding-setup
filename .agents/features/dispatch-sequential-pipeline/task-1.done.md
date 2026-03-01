# Task 1 of 3: Add dispatchSequential() and Fix T0 Cascade

> **Feature**: `dispatch-sequential-pipeline`
> **Brief Path**: `.agents/features/dispatch-sequential-pipeline/task-1.md`
> **Plan Overview**: `.agents/features/dispatch-sequential-pipeline/plan.md`

---

## OBJECTIVE

Add a reusable `dispatchSequential()` function to dispatch.ts that creates one OpenCode
session and sends multiple commands/messages in order, and fix the T0 planning cascade
to replace broken ollama-cloud models with working alternatives.

---

## SCOPE

**Files This Task Touches:**

| File | Action | What Changes |
|------|--------|-------------|
| `.opencode/tools/dispatch.ts` | UPDATE | Add new types (SequentialStep, SequentialStepResult, SequentialOptions, SequentialResult), add dispatchSequential() function (~80 lines), replace T0 cascade models (lines 104-112) |

**Out of Scope:**
- build.md updates — handled by Task 2
- model-strategy.md updates — handled by Task 3
- Tool export changes — dispatchSequential() is an internal function called by build.md logic, not a new tool parameter
- Any changes to dispatchText(), dispatchAgent(), dispatchCommand() — these are stable

**Dependencies:**
- None — this is the first task

---

## PRIOR TASK CONTEXT

This is the first task — no prior work. Start fresh from the codebase state.

The file was last modified in commit `2b4cf05` (dispatch-agent-response-fix) which added
`extractContentFromParts()` and improved `getSessionLastResponse()`. Those changes are
stable and this task builds on top of them.

---

## CONTEXT REFERENCES

> IMPORTANT: Read ALL files listed here before implementing. They are not optional.

### Files to Read

- `.opencode/tools/dispatch.ts` (all 829 lines) — Why: This is the target file. Must understand the full structure, existing types, existing functions, and where new code fits.

### Current Content: Types Section (Lines 24-61)

```typescript
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
```

**Analysis**: New types (`SequentialStep`, `SequentialStepResult`, `SequentialOptions`, `SequentialResult`) will be added immediately after the existing types block (after line 61). They follow the same naming conventions: PascalCase interfaces, descriptive field names. The `SequentialStep` type needs a `type` discriminator field like `CascadeRoute` uses `type: "cascade"`.

### Current Content: T0 Planning Cascade (Lines 103-112)

```typescript
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
```

**Analysis**: The first two models (kimi-k2-thinking, cogito-2.1) are ollama-cloud models that CANNOT do agent mode — they output raw tool call tokens (`<|tool_call_begin|>`, `<|tool▁calls▁begin|>`) as literal text. They must be replaced. The user wants gpt-5.3-codex as the first choice (Codex-first policy), with qwen3-max and qwen3.5-plus as confirmed-working free alternatives.

### Current Content: Configuration Constants (Lines 1-22)

```typescript
import { tool } from "@opencode-ai/plugin"

// ============================================================================
// CONFIGURATION
// ============================================================================

const OPENCODE_URL = "http://127.0.0.1:4096"
const TEXT_TIMEOUT_MS = 120_000      // 2 min — text mode (reviews, analysis)
const AGENT_TIMEOUT_MS = 300_000     // 5 min — agent mode (default)
const AGENT_LONG_TIMEOUT_MS = 900_000 // 15 min — agent mode (complex tasks)
const AGENT_SESSION_NO_TIMEOUT = 0   // No timeout — planning/execution sessions run until done
const CASCADE_TIMEOUT_MS = 30_000    // 30 sec — per cascade attempt (text mode)
const COMMAND_TIMEOUT_MS = 600_000   // 10 min — command mode (full command execution)

// Task types that are long-running sessions where timeout is not applicable.
// These sessions involve extensive codebase exploration, multi-file writes,
// and interactive tool use that can take 20-60+ minutes.
const NO_TIMEOUT_TASK_TYPES = new Set(["planning", "execution"])
const HEALTH_TIMEOUT_MS = 5_000
const ARCHIVE_AFTER_DAYS = 3
const ARCHIVE_AFTER_MS = ARCHIVE_AFTER_DAYS * 24 * 60 * 60 * 1000
const MAX_ARCHIVE_PER_RUN = 10
```

**Analysis**: The `COMMAND_TIMEOUT_MS` (10 min) and `AGENT_SESSION_NO_TIMEOUT` (0) constants are relevant for `dispatchSequential()`. The function needs to apply per-step timeouts. `/prime` should use `COMMAND_TIMEOUT_MS` and `/planning` should use `AGENT_SESSION_NO_TIMEOUT`. No new constants needed — existing ones cover all cases.

### Current Content: dispatchCommand() (Lines 394-419)

```typescript
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
```

**Analysis**: `dispatchCommand()` uses `POST /session/{id}/command` with `model: "provider/model"` string format. This is the function `dispatchSequential()` will call for command-type steps. It already supports the session ID pattern we need — send to existing session, not create new one. The `timeoutMs` param with `AbortSignal.timeout()` handles per-step timeouts.

### Current Content: dispatchAgent() (Lines 292-340)

```typescript
async function dispatchAgent(
  sessionId: string,
  provider: string,
  model: string,
  prompt: string,
  description: string,
  timeoutMs: number,
): Promise<string | null> {
  try {
    // timeoutMs === 0 means no timeout — session runs until completion.
    // Used for planning/execution sessions that can take 20-60+ minutes.
    const fetchOptions: RequestInit = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: { providerID: provider, modelID: model }, // top-level model routes the message
        parts: [{
          type: "subtask",
          prompt,
          description,
          agent: "general",
          model: { providerID: provider, modelID: model }, // subtask part model (for child agent)
        }],
      }),
    }
    if (timeoutMs > 0) {
      fetchOptions.signal = AbortSignal.timeout(timeoutMs)
    }
    const response = await fetch(`${OPENCODE_URL}/session/${sessionId}/message`, fetchOptions)
    if (!response.ok) return null
    const data = await response.json()
    // Check for error in the response
    if (data?.info?.error) {
      const err = data.info.error
      return `[Agent error: ${err.type || "unknown"}] ${err.message || ""}`
    }
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
```

**Analysis**: `dispatchAgent()` is used for agent-type steps in `dispatchSequential()`. It handles the no-timeout case (timeoutMs === 0) by conditionally skipping `AbortSignal.timeout()`. This is important for `/planning` steps.

### Current Content: dispatchCascade() (Lines 425-478)

```typescript
async function dispatchCascade(
  sessionId: string,
  cascade: CascadeRoute,
  prompt: string,
  mode: DispatchMode,
  description: string,
  command?: string,
  commandArgs?: string,
  taskType?: string,
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
      // Use no-timeout for planning/execution sessions; fallback to AGENT_LONG_TIMEOUT_MS
      const agentTimeout = taskType && NO_TIMEOUT_TASK_TYPES.has(taskType)
        ? AGENT_SESSION_NO_TIMEOUT
        : AGENT_LONG_TIMEOUT_MS
      text = await dispatchAgent(
        sessionId, route.provider, route.model,
        prompt, description, agentTimeout,
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
```

**Analysis**: `dispatchCascade()` tries models in order until one succeeds. For `dispatchSequential()`, we DON'T use cascade per-step — we resolve the cascade ONCE at the start, find the first working model, then use that model for ALL steps in the sequence. This is because steps share a session and switching models mid-sequence would lose context.

### Current Content: resolveRoute() (Lines 484-503)

```typescript
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
```

**Analysis**: `dispatchSequential()` will use `resolveRoute()` to get the route. If it's a cascade, we need a helper to resolve it to a single `ModelRoute` by trying each model with a health check or simple text ping. If it's already a `ModelRoute`, use it directly.

### Current Content: Tool Export Section (Lines 565-828)

The tool export is the `export default tool({...})` block that defines the dispatch tool's args and execute function. `dispatchSequential()` does NOT need changes here — it's an internal function that `/build` (and other commands) reference by name in their markdown instructions. The calling model uses the existing dispatch tool with appropriate arguments, or the sequential pattern is described in build.md.

**Key insight**: `dispatchSequential()` is NOT a new tool parameter. It's a conceptual pattern described in build.md. The build command tells the executing model to: (1) create a session, (2) send /prime via dispatch command mode to that session, (3) send /planning via dispatch command mode to that same session. But wait — the current dispatch tool creates a NEW session every time (line 711). 

**Revised approach**: We need to either:
- (a) Add a `sessionId` parameter to the dispatch tool so callers can reuse an existing session, OR
- (b) Create dispatchSequential as an actual exported function that build.md's executing model calls

Since the executing model interacts via tool calls (not direct function calls), option (a) is the correct approach. We add an optional `sessionId` arg to the dispatch tool. When provided, it skips session creation and sends to the existing session.

**This is the critical design insight.** Let me revise the implementation plan accordingly.

### Patterns to Follow

**Existing type pattern** (from `dispatch.ts:28-61`):
```typescript
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
```
- Why this pattern: Consistent PascalCase interfaces with descriptive field names
- How to apply: New types follow the same naming and structure conventions
- Common gotchas: Don't forget optional fields use `?` suffix

**Existing tool arg pattern** (from `dispatch.ts:576-637`):
```typescript
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
```
- Why this pattern: `tool.schema.string().optional().describe(...)` is the standard arg definition
- How to apply: New `sessionId` arg follows the same pattern
- Common gotchas: Description must explain when to use vs when to omit

**Cascade model entry pattern** (from `dispatch.ts:104-112`):
```typescript
  "planning": {
    type: "cascade",
    models: [
      { provider: "ollama-cloud", model: "kimi-k2-thinking", label: "KIMI-K2-THINKING" },
      { provider: "ollama-cloud", model: "cogito-2.1:671b", label: "COGITO-2.1" },
      { provider: "bailian-coding-plan-test", model: "qwen3-max-2026-01-23", label: "QWEN3-MAX" },
      { provider: "anthropic", model: "claude-opus-4-5", label: "CLAUDE-OPUS-4-5" },
    ],
  },
```
- Why this pattern: Array of ModelRoute objects in priority order
- How to apply: Replace models but keep the same structure
- Common gotchas: Labels must be UPPERCASE matching the model name convention

---

## STEP-BY-STEP TASKS

---

### Step 1: UPDATE `.opencode/tools/dispatch.ts` — Fix T0 Planning Cascade

**What**: Replace broken ollama-cloud models in the T0 planning cascade with confirmed-working models.

**IMPLEMENT**:

Current (lines 103-112 of `.opencode/tools/dispatch.ts`):
```typescript
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
```

Replace with:
```typescript
  // ── T0: Planning (Cascade: CODEX → FREE → PAID) ──
  // NOTE: ollama-cloud models (kimi-k2-thinking, cogito-2.1) removed — they output
  // raw tool call tokens in agent mode instead of making actual tool calls.
  // Codex-first per user policy; qwen3-max and qwen3.5-plus confirmed working.
  "planning": {
    type: "cascade",
    models: [
      { provider: "openai", model: "gpt-5.3-codex", label: "GPT-5.3-CODEX" },
      { provider: "bailian-coding-plan-test", model: "qwen3-max-2026-01-23", label: "QWEN3-MAX" },
      { provider: "bailian-coding-plan-test", model: "qwen3.5-plus", label: "QWEN3.5-PLUS" },
      { provider: "anthropic", model: "claude-opus-4-5", label: "CLAUDE-OPUS-4-5" },
    ],
  },
```

**PATTERN**: `dispatch.ts:70-112` — existing TASK_ROUTES entries with ModelRoute objects

**IMPORTS**: N/A

**GOTCHA**: The label must be UPPERCASE and match the model name convention. `GPT-5.3-CODEX` not `gpt-5.3-codex`. The comment explaining WHY the change was made is important for future maintainers.

**VALIDATE**:
```bash
# Verify the cascade was updated
grep -A 8 "T0: Planning" .opencode/tools/dispatch.ts
# Should show gpt-5.3-codex first, no ollama-cloud models
```

---

### Step 2: UPDATE `.opencode/tools/dispatch.ts` — Add sessionId Tool Arg

**What**: Add an optional `sessionId` parameter to the dispatch tool so callers can send messages to an existing session instead of always creating a new one.

**IMPLEMENT**:

Current (lines 636-646 of `.opencode/tools/dispatch.ts`):
```typescript
    description: tool.schema
      .string()
      .optional()
      .describe(
        "Short description for the session title (shown in OpenCode UI). " +
        "Defaults to taskType or 'Dispatch task'.",
      ),
  },
```

Replace with:
```typescript
    description: tool.schema
      .string()
      .optional()
      .describe(
        "Short description for the session title (shown in OpenCode UI). " +
        "Defaults to taskType or 'Dispatch task'.",
      ),

    sessionId: tool.schema
      .string()
      .optional()
      .describe(
        "Existing session ID to send to (skips session creation). " +
        "Use this for sequential dispatch — send /prime to a session, then " +
        "/planning to the SAME session so context carries over. " +
        "Get a session ID by calling dispatch once (it returns sessionId in output), " +
        "then pass that ID in subsequent calls.",
      ),
  },
```

**PATTERN**: `dispatch.ts:576-646` — existing tool arg definitions using `tool.schema.string().optional().describe(...)`

**IMPORTS**: N/A

**GOTCHA**: The arg must be added BEFORE the closing `},` of the args object. The description must clearly explain the use case (sequential dispatch).

**VALIDATE**:
```bash
# Verify the new arg is present
grep -A 5 "sessionId" .opencode/tools/dispatch.ts
# Should show the sessionId schema definition
```

---

### Step 3: UPDATE `.opencode/tools/dispatch.ts` — Use sessionId in Execute Function

**What**: Modify the execute function to use the provided `sessionId` instead of creating a new session when one is provided.

**IMPLEMENT**:

Current (lines 707-714 of `.opencode/tools/dispatch.ts`):
```typescript
    // ── 4. Create session ──
    const isCascade = "type" in resolved.route && resolved.route.type === "cascade"
    const routeLabel = isCascade ? "CASCADE" : (resolved.route as ModelRoute).label
    const sessionTitle = `Dispatch: [${routeLabel}] ${taskDescription} (${mode})`
    const sessionId = await createSession(sessionTitle)
    if (!sessionId) {
      return "# Dispatch Error\n\nFailed to create session."
    }
```

Replace with:
```typescript
    // ── 4. Create or reuse session ──
    const isCascade = "type" in resolved.route && resolved.route.type === "cascade"
    const routeLabel = isCascade ? "CASCADE" : (resolved.route as ModelRoute).label
    let sessionId: string
    if (args.sessionId) {
      // Reuse existing session — for sequential dispatch (e.g., /prime then /planning)
      sessionId = args.sessionId
    } else {
      const sessionTitle = `Dispatch: [${routeLabel}] ${taskDescription} (${mode})`
      const newSessionId = await createSession(sessionTitle)
      if (!newSessionId) {
        return "# Dispatch Error\n\nFailed to create session."
      }
      sessionId = newSessionId
    }
```

**PATTERN**: The existing session creation pattern at lines 707-714

**IMPORTS**: N/A

**GOTCHA**: When reusing a session, we must NOT archive it during cleanup (step 6 runs `archiveOldDispatches()`). The existing archiving logic only archives sessions with title starting "Dispatch:" that are older than 3 days, so there's no conflict — the session is fresh.

Also, the cascade dispatch (step 5) creates a session too — but with `args.sessionId` provided, the cascade should use the existing session. Let me check... The cascade is called at line 721 with `sessionId` already resolved, so it will use the reused session correctly. No additional changes needed.

**VALIDATE**:
```bash
# Verify the session reuse logic
grep -B 2 -A 10 "Create or reuse session" .opencode/tools/dispatch.ts
# Should show the if/else for args.sessionId
```

---

### Step 4: UPDATE `.opencode/tools/dispatch.ts` — Include sessionId in Output

**What**: Add the sessionId to the dispatch result output so callers can capture it for subsequent calls.

**IMPLEMENT**:

The sessionId is already included in the output at line 818:
```typescript
      `**Session**: ${result.sessionId}`,
```

But we should also make it parseable. The current output format is markdown. For sequential dispatch, the calling model needs to extract the session ID from the first dispatch result to pass to the second.

Current (lines 813-825 of `.opencode/tools/dispatch.ts`):
```typescript
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
```

Replace with:
```typescript
    const meta = [
      `**Model**: ${result.label} (\`${result.provider}/${result.model}\`)`,
      `**Mode**: ${result.mode}`,
      `**Route**: ${resolved.source}`,
      `**Latency**: ${(result.latencyMs / 1000).toFixed(1)}s`,
      `**Session**: ${result.sessionId}`,
      `**Session ID**: \`${result.sessionId}\``,
    ]
    if (result.cascadeAttempts) {
      meta.push(`**Cascade**: attempt ${result.cascadeAttempts}/${(resolved.route as CascadeRoute).models.length}`)
    }
    if (mode === "command" && args.command) {
      meta.push(`**Command**: /${args.command} ${args.prompt}`)
    }
```

**PATTERN**: Existing meta output format at lines 813-825

**IMPORTS**: N/A

**GOTCHA**: The `Session ID` line uses backticks around the value so the calling model can easily extract it. The existing `Session` line is kept for human readability. Both are needed.

**VALIDATE**:
```bash
# Verify both Session and Session ID lines exist
grep "Session" .opencode/tools/dispatch.ts | grep -v "SessionInfo\|session\|createSession\|archiveSession\|listSessions\|getSession\|sessionId\|sessionTitle\|newSessionId"
# Should show both **Session** and **Session ID** format lines
```

---

### Step 5: UPDATE `.opencode/tools/dispatch.ts` — Add Cascade Resolution Helper

**What**: Add a helper function that resolves a cascade to a single ModelRoute by trying each model with a quick health ping, so `dispatchSequential()` callers (and build.md) can resolve the cascade model once and reuse it for all sequential steps.

**IMPLEMENT**:

This function goes after the `resolveRoute()` function (after line 503), before the session archiving section.

Add the following new section:

```typescript
// ============================================================================
// CASCADE RESOLUTION (resolve cascade to single model for sequential use)
// ============================================================================

// Resolves a cascade to a single working ModelRoute by trying each model
// with a quick text ping. Used when you need one model for multiple sequential
// steps (e.g., /prime then /planning in the same session).
//
// Returns the first model that responds, or null if all fail.
async function resolveCascadeToModel(
  cascade: CascadeRoute,
  sessionId: string,
): Promise<{ model: ModelRoute; attempts: number } | null> {
  for (let i = 0; i < cascade.models.length; i++) {
    const route = cascade.models[i]
    try {
      // Quick text ping — "respond with OK" to test if model is reachable
      const text = await dispatchText(
        sessionId, route.provider, route.model,
        "Respond with exactly: OK", 15_000, // 15s timeout for ping
      )
      if (text) {
        return { model: route, attempts: i + 1 }
      }
    } catch {
      // Model failed — try next
    }
  }
  return null
}
```

**PATTERN**: `dispatch.ts:425-478` — `dispatchCascade()` which also iterates through cascade models

**IMPORTS**: N/A

**GOTCHA**: 
- The ping uses a short timeout (15s) and a trivial prompt. We don't want to burn a long prompt on a model that might fail.
- The ping creates a message in the session, which means the session will have a "Respond with exactly: OK" + "OK" exchange before the actual commands. This is acceptable — it's a small overhead that ensures the model is reachable.
- If no model responds, return null — the caller handles the failure.

**VALIDATE**:
```bash
# Verify the function exists
grep -A 3 "resolveCascadeToModel" .opencode/tools/dispatch.ts
# Should show the function signature
```

---

### Step 6: UPDATE `.opencode/tools/dispatch.ts` — Update Tool Description

**What**: Update the tool description to mention the `sessionId` parameter and sequential dispatch capability.

**IMPLEMENT**:

Current (lines 566-573 of `.opencode/tools/dispatch.ts`):
```typescript
  description:
    "Route a task to an AI model via the OpenCode server. Three modes:\n" +
    "• text: prompt → response (reviews, analysis, opinions)\n" +
    "• agent: full OpenCode session with file access, bash, grep, commands " +
    "(implementation, planning, execution — model follows the same PIV loop)\n" +
    "• command: dispatch a slash command directly to a model " +
    "(e.g., /planning, /execute, /code-review, /commit)\n\n" +
    "Use taskType for auto-routing or specify provider/model explicitly.",
```

Replace with:
```typescript
  description:
    "Route a task to an AI model via the OpenCode server. Three modes:\n" +
    "• text: prompt → response (reviews, analysis, opinions)\n" +
    "• agent: full OpenCode session with file access, bash, grep, commands " +
    "(implementation, planning, execution — model follows the same PIV loop)\n" +
    "• command: dispatch a slash command directly to a model " +
    "(e.g., /planning, /execute, /code-review, /commit)\n\n" +
    "Use taskType for auto-routing or specify provider/model explicitly.\n\n" +
    "For sequential dispatch (e.g., /prime then /planning in the same session),\n" +
    "call dispatch once to get a sessionId, then pass that sessionId in subsequent calls.",
```

**PATTERN**: Existing description at lines 566-573

**IMPORTS**: N/A

**GOTCHA**: Keep the description concise. Don't turn it into a manual — the detailed sequential dispatch instructions live in build.md.

**VALIDATE**:
```bash
# Verify updated description
grep -A 10 "Route a task" .opencode/tools/dispatch.ts
# Should include "sequential dispatch" mention
```

---

### Step 7: UPDATE `.opencode/tools/dispatch.ts` — Handle Cascade with sessionId

**What**: When `sessionId` is provided AND the route is a cascade, resolve the cascade to a single model first (using `resolveCascadeToModel`), then dispatch with that model. This prevents the cascade from trying each model with the full prompt on a reused session.

**IMPLEMENT**:

Current (lines 716-728 of `.opencode/tools/dispatch.ts`):
```typescript
    // ── 5. Dispatch ──
    const start = Date.now()
    let result: DispatchResult | null = null

    if (isCascade) {
      result = await dispatchCascade(
        sessionId,
        resolved.route as CascadeRoute,
        args.prompt,
        mode,
        taskDescription,
        args.command,
        args.prompt, // For command mode, prompt = command arguments
        args.taskType,
      )
```

Replace with:
```typescript
    // ── 5. Dispatch ──
    const start = Date.now()
    let result: DispatchResult | null = null

    if (isCascade) {
      // If reusing a session, resolve cascade to single model first
      // so all messages in the session use the same model.
      if (args.sessionId) {
        const resolved_model = await resolveCascadeToModel(
          resolved.route as CascadeRoute, sessionId,
        )
        if (resolved_model) {
          const route = resolved_model.model
          let text: string | null = null
          if (mode === "command" && args.command) {
            text = await dispatchCommand(
              sessionId, route.provider, route.model,
              args.command, args.prompt, timeoutMs,
            )
          } else if (mode === "agent") {
            text = await dispatchAgent(
              sessionId, route.provider, route.model,
              args.prompt, taskDescription, timeoutMs,
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
              cascadeAttempts: resolved_model.attempts,
            }
          }
        }
      } else {
        result = await dispatchCascade(
          sessionId,
          resolved.route as CascadeRoute,
          args.prompt,
          mode,
          taskDescription,
          args.command,
          args.prompt, // For command mode, prompt = command arguments
          args.taskType,
        )
      }
```

**PATTERN**: The existing cascade dispatch block at lines 720-729 and the non-cascade block at lines 731-792

**IMPORTS**: N/A

**GOTCHA**: 
- When `sessionId` is provided + cascade, we resolve ONCE then dispatch once. No fallthrough.
- When `sessionId` is NOT provided (normal case), behavior is unchanged — `dispatchCascade()` handles the fallthrough.
- The `resolved_model` variable uses underscore naming to avoid shadowing the outer `resolved` variable.
- The `timeoutMs` is used directly (not cascaded) because the caller controls timeout per-call.

**VALIDATE**:
```bash
# Verify the cascade+sessionId branch exists
grep -B 2 -A 5 "resolveCascadeToModel" .opencode/tools/dispatch.ts
# Should show the function call in the dispatch section
```

---

## TESTING STRATEGY

### Unit Tests

No unit tests — this task modifies `.opencode/tools/dispatch.ts` which is a tool plugin
loaded by OpenCode's runtime. There is no test runner configured for this file.
Covered by manual testing in Level 5.

### Integration Tests

N/A — integration testing requires OpenCode server running with configured providers.
Covered by manual testing in Level 5.

### Edge Cases

- **Cascade where all models fail**: `resolveCascadeToModel` returns null. The dispatch
  should return the standard "No model responded" error. The existing fallback logic
  after the cascade block handles this — `result` remains null.
- **sessionId pointing to non-existent session**: `dispatchCommand()` / `dispatchText()` /
  `dispatchAgent()` will get a non-200 response and return null. The dispatch returns
  "No model responded" which is informative enough.
- **sessionId provided with non-cascade route**: Works normally — session reuse just
  skips creation, then dispatches to the explicit model.
- **Empty cascade models array**: `resolveCascadeToModel` returns null immediately
  (loop doesn't execute). Handled by null check.

---

## VALIDATION COMMANDS

### Level 1: Syntax & Style
```bash
# File exists and is well-formed TypeScript
# Check that the file has no obvious syntax errors by looking for balanced braces
grep -c "{" .opencode/tools/dispatch.ts
grep -c "}" .opencode/tools/dispatch.ts
# Counts should be equal (or close — string literals may contain braces)
```

### Level 2: Type Safety
```bash
# N/A — no TypeScript compiler configured for standalone tool files
# The file uses @opencode-ai/plugin types but is loaded by the runtime, not compiled separately
```

### Level 3: Unit Tests
```bash
# N/A — no unit tests for this task (see Testing Strategy)
```

### Level 4: Integration Tests
```bash
# N/A — covered by Level 5 manual validation
```

### Level 5: Manual Validation

1. Open `.opencode/tools/dispatch.ts` and verify:
   - T0 cascade has 4 models: gpt-5.3-codex, qwen3-max, qwen3.5-plus, claude-opus-4-5
   - No ollama-cloud models in the cascade
   - Comment explains WHY the models were changed
2. Verify `sessionId` arg exists in the tool args section
3. Verify the execute function has the `if (args.sessionId)` branch for session reuse
4. Verify `resolveCascadeToModel()` function exists after `resolveRoute()`
5. Verify the cascade+sessionId branch in step 5 uses `resolveCascadeToModel`
6. Verify the tool description mentions sequential dispatch
7. Verify the output includes `**Session ID**: \`...\`` line
8. Count total lines — should be approximately 829 + ~80 (new function + types + args) = ~910 lines

### Level 6: Cross-Check

Verify consistency with Task 2 (build.md) and Task 3 (model-strategy.md):
- The T0 cascade models in dispatch.ts must match what model-strategy.md documents
- The `sessionId` arg must be referenced correctly in build.md's Step 2 instructions

---

## ACCEPTANCE CRITERIA

### Implementation (verify during execution)

- [ ] T0 cascade updated: gpt-5.3-codex → qwen3-max → qwen3.5-plus → claude-opus-4-5
- [ ] No ollama-cloud models in T0 cascade
- [ ] Comment explains the cascade change rationale
- [ ] `sessionId` optional arg added to tool with descriptive text
- [ ] Execute function reuses session when `sessionId` provided
- [ ] Execute function creates new session when `sessionId` not provided (no regression)
- [ ] `resolveCascadeToModel()` function added after `resolveRoute()`
- [ ] Cascade + sessionId branch uses `resolveCascadeToModel` then dispatches once
- [ ] Tool description updated to mention sequential dispatch
- [ ] Output includes `**Session ID**: \`...\`` for parseable extraction
- [ ] File parses as valid TypeScript (no syntax errors)

### Runtime (verify after testing/deployment)

- [ ] Sequential dispatch works: first call returns sessionId, second call uses it
- [ ] T0 cascade resolves to gpt-5.3-codex (or falls through) correctly
- [ ] `/prime` then `/planning` in same session produces plan artifacts

---

## HANDOFF NOTES

> Written AFTER execution completes.

### Files Created/Modified

- `.opencode/tools/dispatch.ts` — {to be filled after execution}

### Patterns Established

- {to be filled after execution}

### State to Carry Forward

- Task 2 must reference the `sessionId` arg in build.md's Step 2 dispatch instructions
- Task 3 must update model-strategy.md to match the new T0 cascade

### Known Issues or Deferred Items

- {to be filled after execution}

---

## COMPLETION CHECKLIST

- [ ] All steps completed in order
- [ ] Each step's VALIDATE command executed and passed
- [ ] All validation levels run (or explicitly N/A with reason)
- [ ] Manual testing confirms expected behavior
- [ ] Implementation acceptance criteria all checked
- [ ] No regressions in adjacent files
- [ ] Handoff notes written (if task N < M)
- [ ] Brief marked done: rename `task-1.md` → `task-1.done.md`

---

## NOTES

### Key Design Decisions (This Task)

- **sessionId arg instead of internal dispatchSequential()**: The executing model interacts via tool calls, not direct function invocations. Adding `sessionId` to the existing dispatch tool is the correct approach — it enables sequential dispatch without requiring a new tool or internal function that can't be called from markdown instructions.
- **resolveCascadeToModel with text ping**: A quick "Respond with OK" ping is cheap and reliable. It verifies the model is reachable without committing to the full prompt. The 15s timeout keeps it fast.
- **Codex-first cascade**: User policy. gpt-5.3-codex is paid but cheap relative to opus, and the user explicitly requested it for planning quality.

### Implementation Notes

- The `resolveCascadeToModel` ping creates a visible message in the session ("Respond with OK" / "OK"). This is acceptable overhead — it's ~2 tokens and ensures the model works before we commit to it for the full planning session.
- If gpt-5.3-codex is unavailable, the cascade falls through to qwen3-max (free), then qwen3.5-plus (free), then claude-opus-4-5 (paid). At least 2 of the 4 models are confirmed working.
- The `resolved_model` variable name uses underscore to avoid shadowing the `resolved` variable in the outer scope. This is intentional.

---

> **Reminder**: Mark this brief done after execution:
> Rename `task-1.md` → `task-1.done.md`
> This signals to `/execute` (via artifact scan) that this task is complete.
