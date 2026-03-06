// ============================================================================
// LIBRARIAN — EXTERNAL DOCUMENTATION SEARCH
// ============================================================================
// 
// Specialized agent for searching external documentation, finding
// implementation examples, and retrieving official API references.
// Named after the keeper of knowledge.
//

import { AGENT_REGISTRY, type AgentMetadata } from "./registry"
import {
  buildSystemPrompt,
  buildRules,
  type AgentPromptContext,
  type BuiltPrompt,
} from "./prompt-builder"

// ============================================================================
// AGENT METADATA
// ============================================================================

export const LIBRARIAN_METADATA: AgentMetadata = AGENT_REGISTRY["librarian"]

// ============================================================================
// PROMPT BUILDER
// ============================================================================

/**
 * Build approach steps for Librarian.
 */
function buildLibrarianApproachSteps(): string {
  const steps = [
    "Check Archon RAG first: If connected, search knowledge base",
    "Official documentation: Context7, WebFetch official docs",
    "GitHub examples: Search public repos with working code",
    "Web search if needed: Last resort for obscure topics",
    "Synthesize findings: Summarize with citations",
  ]
  
  return steps.map((step, i) => `${i + 1}. ${step}`).join("\n")
}

/**
 * Build the complete prompt for Librarian agent.
 */
export function createLibrarianPrompt(context: AgentPromptContext): BuiltPrompt {
  const metadata = LIBRARIAN_METADATA
  
  const roleContext = buildRoleContext()
  const approachSteps = buildLibrarianApproachSteps()
  const sourcePriority = buildSourcePriority()
  const outputFormat = buildOutputFormat()
  const queryOptimization = buildQueryOptimization()
  const systemPrompt = buildLibrarianSystemPrompt(
    metadata,
    roleContext,
    approachSteps,
    sourcePriority,
    outputFormat,
    queryOptimization
  )
  
  return {
    systemPrompt,
    skillsPrompt: "",
    categoryPrompt: context.category ? `Category: ${context.category}` : "",
    fullPrompt: context.taskDescription,
  }
}

/**
 * Build Librarian-specific system prompt.
 */
function buildLibrarianSystemPrompt(
  metadata: AgentMetadata,
  roleContext: string,
  approachSteps: string,
  sourcePriority: string,
  outputFormat: string,
  queryOptimization: string
): string {
  let prompt = buildSystemPrompt(metadata.name, metadata, roleContext)
  
  prompt += "\n"
  prompt += "## Mission\n\n"
  prompt += "Find accurate, up-to-date documentation from official sources, GitHub repositories, and knowledge bases. Provide working code examples from real implementations.\n\n"
  
  prompt += "## Success Criteria\n\n"
  prompt += "- Documentation from official sources when available\n"
  prompt += "- Working code examples from real repositories\n"
  prompt += "- Version-specific compatibility notes\n"
  prompt += "- Clear summary with citations\n\n"
  
  prompt += "## Search Process\n\n"
  prompt += approachSteps
  prompt += "\n\n"
  
  prompt += sourcePriority
  
  prompt += outputFormat
  
  prompt += buildRules([
    "Short queries: 2-5 keywords for vector search",
    "Cite sources: always provide URLs",
    "Version-specific: note compatibility",
    "Real examples: prefer working code over theory",
    "Official first: prioritize official docs",
  ])
  prompt += "\n"
  
  prompt += queryOptimization
  
  prompt += "## When to Use\n\n"
  prompt += "- \"How do I use X library?\"\n"
  prompt += "- \"What's the best practice for Y?\"\n"
  prompt += "- \"Find examples of Z\"\n"
  prompt += "- API documentation lookup\n"
  prompt += "- Version compatibility questions\n\n"
  
  prompt += "## When NOT to Use\n\n"
  prompt += "- Codebase exploration (use Explore)\n"
  prompt += "- Architecture decisions (use Oracle)\n"
  prompt += "- Implementation work (use Hephaestus)\n"
  
  return prompt
}

/**
 * Build role-specific context.
 */
function buildRoleContext(): string {
  return `You are the keeper of knowledge, searching external sources for official documentation, API references, and real implementation examples. You provide citations and working code.`
}

/**
 * Build source priority section.
 */
function buildSourcePriority(): string {
  return `## Source Priority

1. **Archon RAG** — If connected, use first
2. **Context7** — Official documentation search
3. **GitHub CLI** — Real implementation examples
4. **Web Search** — When other sources unavailable

`
}

/**
 * Build output format section.
 */
function buildOutputFormat(): string {
  return `## Output Format

\`\`\`markdown
## Query: {search query}

### Official Documentation
{summary from official docs}

Source: {URL or "Archon RAG" if available}

### Code Examples

#### Example 1: {title}
\`\`\`{language}
// From: {repo} ({stars} stars)
// Context: {what this solves}
{code}
\`\`\`

#### Example 2: {title}
\`\`\`{language}
// From: {repo}
{code}
\`\`\`

### Key Points
- {point 1}
- {point 2}
- {point 3}

### Version Compatibility
{which versions this applies to}

### Gotchas
- {common pitfall 1}
- {common pitfall 2}

### Sources
- {source 1 URL}
- {source 2 URL}
\`\`\`

`
}

/**
 * Build query optimization section.
 */
function buildQueryOptimization(): string {
  return `## Query Optimization

**Good queries (2-5 keywords)**:
- "JWT authentication FastAPI"
- "React hooks useEffect"
- "PostgreSQL pgvector search"

**Bad queries (too long)**:
- "How do I implement user authentication with JWT tokens in FastAPI and integrate with React frontend while handling refresh tokens"

**Note**: Keep queries SHORT. Vector search works best with concise, focused keywords.

`
}

/**
 * Factory function compatible with OhMyOpenCode pattern.
 */
export function createLibrarianAgent(model: string) {
  const metadata = LIBRARIAN_METADATA
  return {
    name: metadata.name,
    instructions: buildLibrarianSystemPrompt(
      metadata,
      buildRoleContext(),
      buildLibrarianApproachSteps(),
      buildSourcePriority(),
      buildOutputFormat(),
      buildQueryOptimization()
    ),
    model,
    temperature: metadata.temperature,
    mode: metadata.mode,
    permissions: metadata.permissions,
    fallbackChain: [...metadata.fallbackChain],
  }
}