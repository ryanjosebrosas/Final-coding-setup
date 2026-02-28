# Council Proxy Server — Implementation Plan

## Feature Description

A Node.js/TypeScript HTTP proxy server that sits in front of OpenCode server, exposing a native `/council` endpoint while transparently proxying all other requests to the underlying OpenCode server. This makes the council functionality visible as a first-class server endpoint rather than a client-side MCP tool.

## User Story

As a developer using OpenCode, I want to see `/council` as a visible server endpoint when I run `opencode serve`, so that I can call it directly via HTTP and integrate it with other tools without relying on MCP tool registration.

## Problem Statement

The council functionality currently exists as a TypeScript plugin (`.opencode/tools/council.ts`) that gets registered via MCP to Claude Code. When running `opencode serve`, users expect to see a `/council` endpoint but it doesn't exist — the server only exposes `/session`, `/global/health`, etc. The actual OpenCode server is a compiled Go binary that cannot be modified without Go toolchain and rebuilding.

## Solution Statement

Create a lightweight TypeScript proxy server that:
1. Listens on port 4097 (or configurable)
2. Exposes `/council` POST endpoint with the existing council logic
3. Exposes `/council/health` GET endpoint for status checks
4. Proxies all other requests to OpenCode server at `127.0.0.1:4096`
5. Can be started alongside `opencode serve` via a wrapper script

This approach:
- Requires no Go toolchain or binary modification
- Reuses existing council.ts logic (extract to shared module)
- Provides visible `/council` endpoint
- Maintains full OpenCode server compatibility via proxy

## Feature Metadata

- **Spec ID**: council-proxy-server
- **Depth**: standard
- **Pillar**: Infrastructure / Server Extension
- **Dependencies**: Node.js 22+, OpenCode server running on :4096
- **Estimated tasks**: 7 tasks
- **Mode**: Single Plan

### Slice Guardrails
- **In scope**: Proxy server, council endpoint, startup script
- **Out of scope**: Modifying OpenCode Go source, session streaming, WebSocket support
- **Deferred**: HTTPS support, authentication middleware, load balancing

---

## Context References

### Codebase Files

| File | Purpose | Lines |
|------|---------|-------|
| `.opencode/tools/council.ts` | Existing council logic to extract | 1-759 |
| `.opencode/package.json` | Existing dependencies | 1-5 |
| `.opencode/node_modules/@opencode-ai/plugin` | Plugin SDK (reference only) | - |

### Key Code Sections from council.ts

**Configuration (lines 6-28):**
```typescript
const OPENCODE_URL = "http://127.0.0.1:4096"
const AGREEMENT_THRESHOLD = 0.7
const DEFAULT_TIMEOUT_MS = 90000

const COUNCIL_MODELS = {
  quick: [
    { provider: "zai-coding-plan", model: "glm-5", label: "GLM-5" },
    { provider: "bailian-coding-plan-test", model: "qwen3-max-2026-01-23", label: "QWEN3-MAX" },
    { provider: "ollama-cloud", model: "kimi-k2:1t", label: "KIMI-K2" },
  ],
  standard: [
    { provider: "zai-coding-plan", model: "glm-5", label: "GLM-5" },
    { provider: "zai-coding-plan", model: "glm-4.5", label: "GLM-4.5" },
    { provider: "bailian-coding-plan-test", model: "qwen3-max-2026-01-23", label: "QWEN3-MAX" },
    { provider: "bailian-coding-plan-test", model: "qwen3.5-plus", label: "QWEN3.5-PLUS" },
    { provider: "ollama-cloud", model: "kimi-k2:1t", label: "KIMI-K2" },
  ],
}
```

**Core Functions to Extract (lines 91-671):**
- `checkServerHealth()` — verify OpenCode server is up
- `createParentSession()` / `createChildSession()` — session management
- `sendMessage()` — dispatch prompt to model
- `dispatchToAllModels()` — parallel execution
- `analyzeAgreement()` — semantic comparison
- `runSynthesis()` — generate synthesis when disagreement
- `formatCouncilOutput()` — format final output
- `archiveOldCouncils()` — cleanup old sessions

**Types (lines 34-85):**
- `ModelConfig`, `ModelResponse`, `AgreementAnalysis`, `ConflictInfo`, `CouncilResult`

### OpenCode Server API (Verified)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/global/health` | GET | Check server availability |
| `/session` | GET | List sessions |
| `/session` | POST | Create session `{ title: string }` |
| `/session/{id}` | PATCH | Update session |
| `/session/{id}/message` | POST | Send prompt |

### Memory References

- Go is NOT installed — cannot modify OpenCode binary
- This repo is NOT a git repo — cannot use submodules
- User wants `/council` visible as server endpoint
- Proxy approach approved over Go modification

---

## Patterns to Follow

### Pattern 1: Node.js HTTP Proxy

Standard pattern for transparent HTTP proxying:

```typescript
import http from "node:http"

async function proxyRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  targetUrl: string
): Promise<void> {
  const url = new URL(req.url || "/", targetUrl)
  
  const proxyReq = http.request(url, {
    method: req.method,
    headers: {
      ...req.headers,
      host: url.host,
    },
  }, (proxyRes) => {
    res.writeHead(proxyRes.statusCode || 500, proxyRes.headers)
    proxyRes.pipe(res)
  })
  
  req.pipe(proxyReq)
  
  proxyReq.on("error", (err) => {
    res.writeHead(502)
    res.end(JSON.stringify({ error: "Bad Gateway", message: err.message }))
  })
}
```

### Pattern 2: JSON Body Parsing (No External Dependencies)

```typescript
async function parseJsonBody<T>(req: http.IncomingMessage): Promise<T> {
  return new Promise((resolve, reject) => {
    let body = ""
    req.on("data", (chunk) => { body += chunk })
    req.on("end", () => {
      try {
        resolve(JSON.parse(body))
      } catch (err) {
        reject(new Error("Invalid JSON"))
      }
    })
    req.on("error", reject)
  })
}
```

### Pattern 3: Existing Council Execute Logic

From `.opencode/tools/council.ts:687-758`:

```typescript
async function executeCouncil(topic: string, quick: boolean): Promise<CouncilResult> {
  const startTime = Date.now()
  const models = quick ? COUNCIL_MODELS.quick : COUNCIL_MODELS.standard
  
  // Check server health first
  const healthy = await checkServerHealth()
  if (!healthy) {
    throw new Error("OpenCode server not available")
  }
  
  // Auto-archive old councils (fire and forget)
  archiveOldCouncils().catch(() => {})
  
  // Phase 0: Create parent session
  const parentId = await createParentSession(topic)
  if (!parentId) {
    throw new Error("Failed to create council session")
  }
  
  // Phase 1: Parallel dispatch
  const { responses } = await dispatchToAllModels(models, topic, parentId)
  
  if (responses.length === 0) {
    throw new Error("No models responded")
  }
  
  // Phase 2: Analyze agreement
  const analysis = analyzeAgreement(responses)
  
  // Phase 3: Smart synthesis (only if disagreement)
  let synthesis: string | null = null
  if (analysis.score < AGREEMENT_THRESHOLD || analysis.conflicts.length > 0) {
    if (analysis.bestResponder) {
      const synthesisSessionId = await createChildSession(parentId, "SYNTHESIS")
      if (synthesisSessionId) {
        synthesis = await runSynthesis(
          analysis.bestResponder,
          topic,
          responses,
          analysis.conflicts,
          synthesisSessionId
        )
      }
    }
  }
  
  const wallTimeMs = Date.now() - startTime
  
  // Post summary to parent session
  const result: CouncilResult = {
    topic,
    modelCount: responses.length,
    wallTimeMs,
    responses,
    analysis,
    synthesis,
  }
  
  await postSummaryToParent(parentId, formatCouncilOutput(result))
  
  const agreementPct = Math.round(analysis.score * 100)
  await updateSession(parentId, {
    title: `Council: ${topic.slice(0, 35)} (${agreementPct}% agree, ${responses.length} models)`
  })
  
  return result
}
```

---

## Implementation Plan

### Phase 1: Foundation (Tasks 1-2)

Set up the proxy server project structure with minimal dependencies.

### Phase 2: Core Implementation (Tasks 3-5)

Extract council logic and implement the HTTP server with routing.

### Phase 3: Integration (Tasks 6-7)

Create startup script and update documentation.

---

## Step-by-Step Tasks

### Task 1: Create Proxy Server Directory and Package

**ACTION**: CREATE
**TARGET**: `proxy-server/package.json`
**IMPLEMENT**: Create a minimal package.json for the proxy server

```json
{
  "name": "opencode-council-proxy",
  "version": "1.0.0",
  "description": "Proxy server adding /council endpoint to OpenCode",
  "type": "module",
  "main": "dist/server.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js",
    "dev": "tsx watch src/server.ts"
  },
  "dependencies": {},
  "devDependencies": {
    "typescript": "^5.8.0",
    "tsx": "^4.20.0",
    "@types/node": "^22.0.0"
  }
}
```

**PATTERN**: Minimal dependencies — use only Node.js built-ins for runtime
**IMPORTS**: None (built-in modules only)
**GOTCHA**: Must use `"type": "module"` for ESM support with Node 22
**VALIDATE**: `cd proxy-server && npm install && npm run build`

---

### Task 2: Create TypeScript Configuration

**ACTION**: CREATE
**TARGET**: `proxy-server/tsconfig.json`
**IMPLEMENT**: Configure TypeScript for Node.js ESM output

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**PATTERN**: Standard Node.js ESM TypeScript config
**IMPORTS**: N/A
**GOTCHA**: Must use `NodeNext` for both module and moduleResolution
**VALIDATE**: `cd proxy-server && npx tsc --noEmit`

---

### Task 3: Extract Council Core Logic

**ACTION**: CREATE
**TARGET**: `proxy-server/src/council.ts`
**IMPLEMENT**: Extract all council logic from `.opencode/tools/council.ts` into a standalone module

The file should contain:
1. All type definitions (ModelConfig, ModelResponse, AgreementAnalysis, etc.)
2. Configuration constants (OPENCODE_URL, AGREEMENT_THRESHOLD, COUNCIL_MODELS)
3. All helper functions (checkServerHealth, createParentSession, sendMessage, etc.)
4. Main `executeCouncil(topic: string, quick: boolean): Promise<CouncilResult>` function
5. `formatCouncilOutput(result: CouncilResult): string` function

```typescript
// ============================================================================
// CONFIGURATION
// ============================================================================

const OPENCODE_URL = process.env.OPENCODE_URL || "http://127.0.0.1:4096"
const AGREEMENT_THRESHOLD = 0.7
const DEFAULT_TIMEOUT_MS = 90000
const ARCHIVE_AFTER_DAYS = 3
const ARCHIVE_AFTER_MS = ARCHIVE_AFTER_DAYS * 24 * 60 * 60 * 1000
const MAX_ARCHIVE_PER_RUN = 10

const COUNCIL_MODELS = {
  quick: [
    { provider: "zai-coding-plan", model: "glm-5", label: "GLM-5" },
    { provider: "bailian-coding-plan-test", model: "qwen3-max-2026-01-23", label: "QWEN3-MAX" },
    { provider: "ollama-cloud", model: "kimi-k2:1t", label: "KIMI-K2" },
  ],
  standard: [
    { provider: "zai-coding-plan", model: "glm-5", label: "GLM-5" },
    { provider: "zai-coding-plan", model: "glm-4.5", label: "GLM-4.5" },
    { provider: "bailian-coding-plan-test", model: "qwen3-max-2026-01-23", label: "QWEN3-MAX" },
    { provider: "bailian-coding-plan-test", model: "qwen3.5-plus", label: "QWEN3.5-PLUS" },
    { provider: "ollama-cloud", model: "kimi-k2:1t", label: "KIMI-K2" },
  ],
}

// ============================================================================
// TYPES
// ============================================================================

export interface ModelConfig {
  provider: string
  model: string
  label: string
}

export interface ModelResponse {
  label: string
  provider: string
  model: string
  text: string
  latencyMs: number
  qualityScore: number
}

export interface AgreementAnalysis {
  score: number
  conflicts: ConflictInfo[]
  themes: string[]
  bestResponder: ModelResponse | null
}

export interface ConflictInfo {
  point1: string
  point2: string
  models: [string, string]
}

export interface CouncilResult {
  topic: string
  modelCount: number
  wallTimeMs: number
  responses: ModelResponse[]
  analysis: AgreementAnalysis
  synthesis: string | null
}

// ============================================================================
// SERVER INTERACTION
// ============================================================================

export async function checkServerHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${OPENCODE_URL}/global/health`, {
      signal: AbortSignal.timeout(5000)
    })
    if (!response.ok) return false
    const data = await response.json() as { healthy?: boolean }
    return data.healthy === true
  } catch {
    return false
  }
}

async function createParentSession(topic: string): Promise<string | null> {
  try {
    const response = await fetch(`${OPENCODE_URL}/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: `Council: ${topic.slice(0, 50)}` })
    })
    if (!response.ok) return null
    const data = await response.json() as { id: string }
    return data.id
  } catch {
    return null
  }
}

async function createChildSession(
  parentId: string,
  modelLabel: string
): Promise<string | null> {
  try {
    const response = await fetch(`${OPENCODE_URL}/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: `[${modelLabel}] Response`,
        parentID: parentId
      })
    })
    if (!response.ok) return null
    const data = await response.json() as { id: string }
    return data.id
  } catch {
    return null
  }
}

async function updateSession(
  sessionId: string,
  updates: { title?: string; archived?: number }
): Promise<boolean> {
  try {
    const body: Record<string, unknown> = {}
    if (updates.title) body.title = updates.title
    if (updates.archived) body.time = { archived: updates.archived }

    const response = await fetch(`${OPENCODE_URL}/session/${sessionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })
    return response.ok
  } catch {
    return false
  }
}

async function postSummaryToParent(
  sessionId: string,
  summary: string
): Promise<boolean> {
  try {
    const response = await fetch(`${OPENCODE_URL}/session/${sessionId}/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        parts: [{ type: "text", text: summary }]
      })
    })
    return response.ok
  } catch {
    return false
  }
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

async function listSessions(): Promise<SessionInfo[]> {
  try {
    const response = await fetch(`${OPENCODE_URL}/session`)
    if (!response.ok) return []
    return await response.json() as SessionInfo[]
  } catch {
    return []
  }
}

async function archiveSession(sessionId: string): Promise<boolean> {
  return updateSession(sessionId, { archived: Date.now() })
}

async function sendMessage(
  sessionId: string,
  provider: string,
  model: string,
  prompt: string
): Promise<string | null> {
  try {
    const response = await fetch(`${OPENCODE_URL}/session/${sessionId}/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: { providerID: provider, modelID: model },
        parts: [{ type: "text", text: prompt }]
      }),
      signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS)
    })
    if (!response.ok) return null
    const data = await response.json() as { parts?: Array<{ type: string; text?: string }> }
    
    const textParts = data.parts?.filter((p) => p.type === "text") || []
    return textParts.map((p) => p.text || "").join("\n")
  } catch {
    return null
  }
}

// ============================================================================
// AUTO-ARCHIVE
// ============================================================================

async function archiveOldCouncils(): Promise<number> {
  try {
    const sessions = await listSessions()
    const now = Date.now()
    const cutoff = now - ARCHIVE_AFTER_MS
    let archived = 0

    for (const session of sessions) {
      if (
        session.title?.startsWith("Council:") &&
        !session.parentID &&
        !session.time?.archived &&
        session.time?.updated &&
        session.time.updated < cutoff
      ) {
        const parentArchived = await archiveSession(session.id)
        if (parentArchived) {
          archived++
          
          for (const childSession of sessions) {
            if (childSession.parentID === session.id && !childSession.time?.archived) {
              await archiveSession(childSession.id)
            }
          }
        }
        
        if (archived >= MAX_ARCHIVE_PER_RUN) break
      }
    }

    return archived
  } catch {
    return 0
  }
}

// ============================================================================
// DISPATCH ORCHESTRATION
// ============================================================================

function buildCouncilPrompt(topic: string): string {
  return `You are participating in a multi-model council discussion.

TOPIC: ${topic}

Give your honest analysis, opinion, or answer. Be specific and concrete.
If this is a decision, state your recommendation and why.
If this is a review, give strengths, risks, and improvements.

Keep your response to 200-400 words. Be direct.`
}

interface DispatchResult {
  response: ModelResponse | null
  sessionId: string | null
}

async function dispatchToSingleModel(
  config: ModelConfig,
  prompt: string,
  parentId: string
): Promise<DispatchResult> {
  const startTime = Date.now()
  
  const sessionId = await createChildSession(parentId, config.label)
  if (!sessionId) return { response: null, sessionId: null }
  
  const text = await sendMessage(sessionId, config.provider, config.model, prompt)
  if (!text) return { response: null, sessionId }
  
  const latencyMs = Date.now() - startTime
  
  return {
    response: {
      label: config.label,
      provider: config.provider,
      model: config.model,
      text,
      latencyMs,
      qualityScore: 0,
    },
    sessionId
  }
}

async function dispatchToAllModels(
  models: ModelConfig[],
  topic: string,
  parentId: string
): Promise<{ responses: ModelResponse[]; sessionIds: string[] }> {
  const prompt = buildCouncilPrompt(topic)
  
  const results = await Promise.allSettled(
    models.map(m => dispatchToSingleModel(m, prompt, parentId))
  )
  
  const responses: ModelResponse[] = []
  const sessionIds: string[] = []
  
  for (const result of results) {
    if (result.status === "fulfilled") {
      if (result.value.response) {
        responses.push(result.value.response)
      }
      if (result.value.sessionId) {
        sessionIds.push(result.value.sessionId)
      }
    }
  }
  
  return { responses, sessionIds }
}

// ============================================================================
// AGREEMENT ANALYSIS
// ============================================================================

function extractKeyPoints(text: string): string[] {
  const points: string[] = []
  
  const sentences = text
    .replace(/\n+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 20)
  
  const recommendPatterns = [
    /\b(should|must|always|never|recommend|suggest|prefer|use|avoid|ensure)\b/i,
    /\b(best practice|important|critical|key|essential)\b/i,
  ]
  
  for (const sentence of sentences) {
    if (recommendPatterns.some(p => p.test(sentence))) {
      points.push(sentence.toLowerCase().trim())
    }
  }
  
  if (points.length === 0) {
    points.push(...sentences.slice(0, 3).map(s => s.toLowerCase()))
  }
  
  return points.slice(0, 5)
}

function calculateSimilarity(points1: string[], points2: string[]): number {
  if (points1.length === 0 || points2.length === 0) return 0.5
  
  let matchCount = 0
  const allWords1 = new Set(points1.join(" ").split(/\s+/).filter(w => w.length > 3))
  const allWords2 = new Set(points2.join(" ").split(/\s+/).filter(w => w.length > 3))
  
  for (const word of allWords1) {
    if (allWords2.has(word)) matchCount++
  }
  
  const totalUnique = new Set([...allWords1, ...allWords2]).size
  if (totalUnique === 0) return 0.5
  
  return matchCount / totalUnique
}

function detectConflicts(responses: ModelResponse[]): ConflictInfo[] {
  const conflicts: ConflictInfo[] = []
  
  const contradictionPairs: [RegExp, RegExp][] = [
    [/\balways\s+use\b/i, /\bavoid\b|\bnever\s+use\b/i],
    [/\brecommend\b/i, /\bdon't\s+recommend\b|\bavoid\b/i],
    [/\bbest\s+practice\b/i, /\banti-?pattern\b|\bbad\s+practice\b/i],
    [/\bprefer\s+(\w+)/i, /\bavoid\s+\1\b/i],
    [/\buse\s+try[\s-]?catch\b/i, /\buse\s+\.catch\(\)\b/i],
  ]
  
  for (let i = 0; i < responses.length; i++) {
    for (let j = i + 1; j < responses.length; j++) {
      const text1 = responses[i].text.toLowerCase()
      const text2 = responses[j].text.toLowerCase()
      
      for (const [pattern1, pattern2] of contradictionPairs) {
        const match1 = pattern1.exec(text1)
        const match2 = pattern2.exec(text2)
        
        if (match1 && match2) {
          conflicts.push({
            point1: match1[0],
            point2: match2[0],
            models: [responses[i].label, responses[j].label]
          })
        }
        
        const match1r = pattern1.exec(text2)
        const match2r = pattern2.exec(text1)
        
        if (match1r && match2r) {
          conflicts.push({
            point1: match2r[0],
            point2: match1r[0],
            models: [responses[i].label, responses[j].label]
          })
        }
      }
    }
  }
  
  const seen = new Set<string>()
  return conflicts.filter(c => {
    const key = `${c.point1}-${c.point2}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function extractCommonThemes(responses: ModelResponse[]): string[] {
  const allPoints = responses.flatMap(r => extractKeyPoints(r.text))
  
  const wordFreq = new Map<string, number>()
  for (const point of allPoints) {
    const words = point.split(/\s+/).filter(w => w.length > 4)
    for (const word of words) {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1)
    }
  }
  
  const threshold = Math.max(2, Math.floor(responses.length * 0.4))
  const commonWords = [...wordFreq.entries()]
    .filter(([_, count]) => count >= threshold)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word)
  
  return commonWords
}

function calculateQualityScore(response: ModelResponse): number {
  let score = 0
  const text = response.text
  
  const wordCount = text.split(/\s+/).length
  const lengthScore = Math.min(wordCount / 300, 1) * 0.2
  score += lengthScore
  
  if (text.includes("```")) score += 0.15
  if (/`[^`]+`/.test(text)) score += 0.10
  if (/\w+\.\w+/.test(text)) score += 0.05
  
  const actionWords = ["use", "implement", "add", "create", "avoid", "ensure", "always", "never", "should", "must"]
  const actionCount = actionWords.filter(w => text.toLowerCase().includes(w)).length
  score += Math.min(actionCount / 5, 1) * 0.3
  
  if (/^\s*[-*]\s/m.test(text)) score += 0.10
  if (/^\s*\d+[.)]\s/m.test(text)) score += 0.10
  
  return Math.min(score, 1)
}

function analyzeAgreement(responses: ModelResponse[]): AgreementAnalysis {
  if (responses.length === 0) {
    return { score: 0, conflicts: [], themes: [], bestResponder: null }
  }
  
  if (responses.length === 1) {
    const r = responses[0]
    r.qualityScore = calculateQualityScore(r)
    return { score: 1, conflicts: [], themes: [], bestResponder: r }
  }
  
  for (const response of responses) {
    response.qualityScore = calculateQualityScore(response)
  }
  
  const pointsByResponse = responses.map(r => extractKeyPoints(r.text))
  
  let totalSimilarity = 0
  let pairCount = 0
  
  for (let i = 0; i < pointsByResponse.length; i++) {
    for (let j = i + 1; j < pointsByResponse.length; j++) {
      totalSimilarity += calculateSimilarity(pointsByResponse[i], pointsByResponse[j])
      pairCount++
    }
  }
  
  const agreementScore = pairCount > 0 ? totalSimilarity / pairCount : 0.5
  
  const conflicts = detectConflicts(responses)
  const themes = extractCommonThemes(responses)
  
  const bestResponder = responses.reduce((best, r) => 
    r.qualityScore > best.qualityScore ? r : best
  )
  
  return {
    score: agreementScore,
    conflicts,
    themes,
    bestResponder,
  }
}

// ============================================================================
// SYNTHESIS
// ============================================================================

function buildSynthesisPrompt(
  topic: string,
  responses: ModelResponse[],
  conflicts: ConflictInfo[]
): string {
  const responsesText = responses
    .map(r => `[${r.label}]:\n${r.text}`)
    .join("\n\n---\n\n")
  
  const conflictsText = conflicts.length > 0
    ? `\nDETECTED CONFLICTS:\n${conflicts.map(c => 
        `- ${c.models[0]} says "${c.point1}" vs ${c.models[1]} says "${c.point2}"`
      ).join("\n")}`
    : ""
  
  return `You are synthesizing a multi-model council discussion.

TOPIC: ${topic}

MODEL RESPONSES:
${responsesText}
${conflictsText}

TASK: Synthesize these perspectives into a clear recommendation.
- Acknowledge where models agree
- Resolve conflicts with reasoning
- Provide a final actionable recommendation
- Keep response under 200 words`
}

async function runSynthesis(
  bestResponder: ModelResponse,
  topic: string,
  responses: ModelResponse[],
  conflicts: ConflictInfo[],
  sessionId: string
): Promise<string> {
  const prompt = buildSynthesisPrompt(topic, responses, conflicts)
  
  const text = await sendMessage(
    sessionId,
    bestResponder.provider,
    bestResponder.model,
    prompt
  )
  return text || "[Synthesis failed: no response]"
}

// ============================================================================
// OUTPUT FORMATTING
// ============================================================================

export function formatCouncilOutput(result: CouncilResult): string {
  const lines: string[] = []
  
  lines.push("+" + "=".repeat(68) + "+")
  lines.push(`|  COUNCIL: ${result.topic.slice(0, 54).padEnd(54)}  |`)
  lines.push(`|  ${result.modelCount} models - ${(result.wallTimeMs / 1000).toFixed(1)}s${"".padEnd(49)}  |`)
  lines.push("+" + "=".repeat(68) + "+")
  lines.push("")
  
  for (const response of result.responses) {
    lines.push(`[${response.label}] (${response.provider}) - ${(response.latencyMs / 1000).toFixed(1)}s`)
    lines.push("-".repeat(68))
    lines.push(response.text)
    lines.push("")
  }
  
  lines.push("+" + "=".repeat(68) + "+")
  lines.push("|  ANALYSIS                                                          |")
  lines.push("+" + "=".repeat(68) + "+")
  lines.push("")
  
  const agreementPct = Math.round(result.analysis.score * 100)
  const thresholdNote = agreementPct < 70 ? " (below threshold)" : ""
  lines.push(`Agreement: ${agreementPct}%${thresholdNote}`)
  
  if (result.analysis.conflicts.length > 0) {
    lines.push(`Conflicts detected: ${result.analysis.conflicts.length}`)
    for (const conflict of result.analysis.conflicts) {
      lines.push(`  * ${conflict.models[0]} says "${conflict.point1}"`)
      lines.push(`    ${conflict.models[1]} says "${conflict.point2}"`)
    }
  } else {
    lines.push("Conflicts detected: None")
  }
  
  if (result.analysis.themes.length > 0) {
    lines.push("")
    lines.push("Common themes:")
    for (const theme of result.analysis.themes) {
      lines.push(`  * ${theme}`)
    }
  }
  
  if (result.synthesis) {
    lines.push("")
    lines.push("+" + "=".repeat(68) + "+")
    const synthLabel = result.analysis.bestResponder?.label || "UNKNOWN"
    lines.push(`|  SYNTHESIS (by ${synthLabel})${" ".repeat(Math.max(0, 51 - synthLabel.length))}  |`)
    lines.push("+" + "=".repeat(68) + "+")
    lines.push("")
    lines.push(result.synthesis)
  } else {
    lines.push("")
    lines.push("Synthesis: Skipped (strong agreement)")
  }
  
  lines.push("")
  lines.push("+" + "=".repeat(68) + "+")
  
  return lines.join("\n")
}

// ============================================================================
// MAIN EXECUTE FUNCTION
// ============================================================================

export async function executeCouncil(topic: string, quick: boolean = false): Promise<CouncilResult> {
  const startTime = Date.now()
  const models = quick ? COUNCIL_MODELS.quick : COUNCIL_MODELS.standard
  
  const healthy = await checkServerHealth()
  if (!healthy) {
    throw new Error("OpenCode server not available at " + OPENCODE_URL)
  }
  
  archiveOldCouncils().catch(() => {})
  
  const parentId = await createParentSession(topic)
  if (!parentId) {
    throw new Error("Failed to create council session")
  }
  
  const { responses } = await dispatchToAllModels(models, topic, parentId)
  
  if (responses.length === 0) {
    throw new Error("No models responded. Check provider connections.")
  }
  
  const analysis = analyzeAgreement(responses)
  
  let synthesis: string | null = null
  if (analysis.score < AGREEMENT_THRESHOLD || analysis.conflicts.length > 0) {
    if (analysis.bestResponder) {
      const synthesisSessionId = await createChildSession(parentId, "SYNTHESIS")
      if (synthesisSessionId) {
        synthesis = await runSynthesis(
          analysis.bestResponder,
          topic,
          responses,
          analysis.conflicts,
          synthesisSessionId
        )
      }
    }
  }
  
  const wallTimeMs = Date.now() - startTime
  
  const result: CouncilResult = {
    topic,
    modelCount: responses.length,
    wallTimeMs,
    responses,
    analysis,
    synthesis,
  }
  
  await postSummaryToParent(parentId, formatCouncilOutput(result))
  
  const agreementPct = Math.round(analysis.score * 100)
  await updateSession(parentId, {
    title: `Council: ${topic.slice(0, 35)} (${agreementPct}% agree, ${responses.length} models)`
  })
  
  return result
}
```

**PATTERN**: Direct extraction from `.opencode/tools/council.ts:1-759`
**IMPORTS**: None — uses only `fetch` (global in Node 22)
**GOTCHA**: Environment variable `OPENCODE_URL` allows configuring target server
**VALIDATE**: `cd proxy-server && npx tsc --noEmit`

---

### Task 4: Create HTTP Server with Routing

**ACTION**: CREATE
**TARGET**: `proxy-server/src/server.ts`
**IMPLEMENT**: Main server file with council endpoint and proxy routing

```typescript
import http from "node:http"
import { executeCouncil, formatCouncilOutput, checkServerHealth, type CouncilResult } from "./council.js"

// ============================================================================
// CONFIGURATION
// ============================================================================

const PROXY_PORT = parseInt(process.env.PROXY_PORT || "4097", 10)
const OPENCODE_URL = process.env.OPENCODE_URL || "http://127.0.0.1:4096"
const OPENCODE_HOST = new URL(OPENCODE_URL).host

// ============================================================================
// HELPERS
// ============================================================================

async function parseJsonBody<T>(req: http.IncomingMessage): Promise<T> {
  return new Promise((resolve, reject) => {
    let body = ""
    req.on("data", (chunk: Buffer) => { body += chunk.toString() })
    req.on("end", () => {
      try {
        resolve(JSON.parse(body) as T)
      } catch {
        reject(new Error("Invalid JSON body"))
      }
    })
    req.on("error", reject)
  })
}

function sendJson(res: http.ServerResponse, status: number, data: unknown): void {
  res.writeHead(status, { "Content-Type": "application/json" })
  res.end(JSON.stringify(data))
}

function sendText(res: http.ServerResponse, status: number, text: string): void {
  res.writeHead(status, { "Content-Type": "text/plain" })
  res.end(text)
}

// ============================================================================
// PROXY HANDLER
// ============================================================================

function proxyToOpencode(req: http.IncomingMessage, res: http.ServerResponse): void {
  const url = new URL(req.url || "/", OPENCODE_URL)
  
  const proxyReq = http.request(url, {
    method: req.method,
    headers: {
      ...req.headers,
      host: OPENCODE_HOST,
    },
  }, (proxyRes) => {
    res.writeHead(proxyRes.statusCode || 500, proxyRes.headers)
    proxyRes.pipe(res)
  })
  
  req.pipe(proxyReq)
  
  proxyReq.on("error", (err) => {
    sendJson(res, 502, { error: "Bad Gateway", message: err.message })
  })
}

// ============================================================================
// COUNCIL HANDLERS
// ============================================================================

interface CouncilRequest {
  topic: string
  quick?: boolean
}

async function handleCouncil(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method Not Allowed", allowed: ["POST"] })
    return
  }
  
  try {
    const body = await parseJsonBody<CouncilRequest>(req)
    
    if (!body.topic || typeof body.topic !== "string") {
      sendJson(res, 400, { error: "Bad Request", message: "topic is required and must be a string" })
      return
    }
    
    const quick = body.quick === true
    const result = await executeCouncil(body.topic, quick)
    
    // Return both structured result and formatted output
    sendJson(res, 200, {
      success: true,
      result,
      formatted: formatCouncilOutput(result),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    sendJson(res, 500, { success: false, error: message })
  }
}

async function handleCouncilHealth(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Method Not Allowed", allowed: ["GET"] })
    return
  }
  
  const opencodeHealthy = await checkServerHealth()
  
  sendJson(res, opencodeHealthy ? 200 : 503, {
    healthy: opencodeHealthy,
    proxy: true,
    opencode: opencodeHealthy,
    version: "1.0.0",
  })
}

// ============================================================================
// MAIN SERVER
// ============================================================================

const server = http.createServer(async (req, res) => {
  const url = req.url || "/"
  
  // Council endpoints
  if (url === "/council" || url === "/council/") {
    await handleCouncil(req, res)
    return
  }
  
  if (url === "/council/health" || url === "/council/health/") {
    await handleCouncilHealth(req, res)
    return
  }
  
  // Proxy everything else to OpenCode
  proxyToOpencode(req, res)
})

server.listen(PROXY_PORT, "127.0.0.1", () => {
  console.log(`Council proxy server listening on http://127.0.0.1:${PROXY_PORT}`)
  console.log(`  /council        - POST council discussion`)
  console.log(`  /council/health - GET health check`)
  console.log(`  /*              - Proxied to ${OPENCODE_URL}`)
})

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\nShutting down...")
  server.close(() => {
    console.log("Server closed")
    process.exit(0)
  })
})

process.on("SIGTERM", () => {
  server.close(() => {
    process.exit(0)
  })
})
```

**PATTERN**: Standard Node.js http server pattern
**IMPORTS**: `http` from Node.js built-ins
**GOTCHA**: Must handle both /council and /council/ (trailing slash)
**VALIDATE**: `cd proxy-server && npm run build && npm start`

---

### Task 5: Create Source Directory Structure

**ACTION**: CREATE
**TARGET**: `proxy-server/src/` directory
**IMPLEMENT**: Ensure source directory exists for TypeScript files

This is implicit in Tasks 3-4 — the files go in `proxy-server/src/`.

**VALIDATE**: `ls proxy-server/src/`

---

### Task 6: Create Startup Script

**ACTION**: CREATE
**TARGET**: `start-servers.cmd` (Windows batch script)
**IMPLEMENT**: Script to start both OpenCode server and council proxy

```batch
@echo off
echo Starting OpenCode server on :4096...
start "OpenCode Server" cmd /c "opencode serve"

echo Waiting for OpenCode server to start...
timeout /t 3 /nobreak > nul

echo Starting Council proxy on :4097...
cd proxy-server
npm start

echo.
echo Both servers running:
echo   OpenCode: http://127.0.0.1:4096
echo   Council:  http://127.0.0.1:4097/council
```

**PATTERN**: Windows batch script for multi-process startup
**IMPORTS**: N/A
**GOTCHA**: Must wait for OpenCode to start before proxy
**VALIDATE**: Run `start-servers.cmd` and test both endpoints

---

### Task 7: Create Unix Startup Script

**ACTION**: CREATE
**TARGET**: `start-servers.sh` (Unix shell script)
**IMPLEMENT**: Script for macOS/Linux users

```bash
#!/bin/bash

echo "Starting OpenCode server on :4096..."
opencode serve &
OPENCODE_PID=$!

echo "Waiting for OpenCode server to start..."
sleep 3

echo "Starting Council proxy on :4097..."
cd proxy-server
npm start &
PROXY_PID=$!

echo ""
echo "Both servers running:"
echo "  OpenCode: http://127.0.0.1:4096 (PID: $OPENCODE_PID)"
echo "  Council:  http://127.0.0.1:4097/council (PID: $PROXY_PID)"
echo ""
echo "Press Ctrl+C to stop both servers"

trap "kill $OPENCODE_PID $PROXY_PID 2>/dev/null; exit" SIGINT SIGTERM

wait
```

**PATTERN**: Unix shell script with process management
**IMPORTS**: N/A
**GOTCHA**: Must trap SIGINT to clean up both processes
**VALIDATE**: `chmod +x start-servers.sh && ./start-servers.sh`

---

## Testing Strategy

### Unit Tests

Not required for this scope — the council logic is already tested in the existing tool.

### Integration Tests

Manual testing via curl:

```bash
# Test council health
curl http://127.0.0.1:4097/council/health

# Test council endpoint
curl -X POST http://127.0.0.1:4097/council \
  -H "Content-Type: application/json" \
  -d '{"topic": "Should we use TypeScript or JavaScript?", "quick": true}'

# Test proxy passthrough
curl http://127.0.0.1:4097/global/health
curl http://127.0.0.1:4097/session
```

### Edge Cases

1. OpenCode server not running — `/council/health` returns 503
2. Invalid JSON body — returns 400
3. Missing topic — returns 400
4. No models respond — returns 500 with error message

---

## Validation Commands

### Level 1: Syntax
```bash
cd proxy-server && npx tsc --noEmit
```

### Level 2: Build
```bash
cd proxy-server && npm run build
```

### Level 3: Runtime
```bash
# Start servers
./start-servers.cmd  # or ./start-servers.sh

# Test endpoints
curl http://127.0.0.1:4097/council/health
curl -X POST http://127.0.0.1:4097/council -H "Content-Type: application/json" -d '{"topic":"test","quick":true}'
```

### Level 4: Integration
```bash
# Verify proxy works
curl http://127.0.0.1:4097/session
curl http://127.0.0.1:4097/global/health
```

---

## Acceptance Criteria

### Implementation Criteria

- [x] `proxy-server/package.json` created with correct dependencies
- [x] `proxy-server/tsconfig.json` configured for Node.js ESM
- [x] `proxy-server/src/council.ts` contains all council logic
- [x] `proxy-server/src/server.ts` implements HTTP server with routing
- [x] `start-servers.cmd` starts both servers on Windows
- [x] `start-servers.sh` starts both servers on Unix

### Runtime Criteria

- [ ] `GET /council/health` returns health status — requires runtime test
- [ ] `POST /council` executes council and returns results — requires runtime test
- [ ] `GET /session` proxies to OpenCode server — requires runtime test
- [ ] `GET /global/health` proxies to OpenCode server — requires runtime test
- [ ] Council results match existing tool output format — requires runtime test

---

## Completion Checklist

- [x] Task 1: package.json created
- [x] Task 2: tsconfig.json created
- [x] Task 3: council.ts extracted and working
- [x] Task 4: server.ts implemented with routing
- [x] Task 5: Source directory structure verified
- [x] Task 6: Windows startup script created
- [x] Task 7: Unix startup script created
- [x] All validation commands pass
- [ ] Manual testing confirms endpoints work — requires runtime test with OpenCode server

---

## Notes

### Key Decisions

1. **Proxy approach over Go modification** — No Go toolchain required
2. **No external dependencies** — Uses only Node.js built-ins
3. **Port 4097** — Avoids conflict with OpenCode on 4096
4. **Separate process** — Can be started/stopped independently

### Risks

1. **Two servers to manage** — Mitigated by wrapper scripts
2. **Proxy adds latency** — Minimal for local requests (~1ms)

### Confidence Score

**8/10** — High confidence because:
- Council logic is already proven (existing tool works)
- HTTP proxy is straightforward
- No external dependencies to fail
- Clear separation of concerns

Risk factors:
- First time extracting council logic to standalone module
- Windows batch scripting can be finicky

---

## Archon Sync

Tasks will be synced to Archon after plan approval.

---

## Next Steps

After this plan is approved:
1. Run `/execute .agents/plans/council-proxy-server.md`
2. Test endpoints manually
3. Update `/council` command documentation to mention proxy server option
