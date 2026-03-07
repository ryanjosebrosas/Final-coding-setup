// ============================================================================
// EXPLORE — INTERNAL CODEBASE GREP
// ============================================================================
// 
// Fast contextual grep for the internal codebase. Find files, extract
// patterns, discover implementations. Named after exploration — finding
// what exists in your own code.
//
import { AGENT_REGISTRY } from "./registry";
import { buildSystemPrompt, buildRules, } from "./prompt-builder";
// ============================================================================
// AGENT METADATA
// ============================================================================
export const EXPLORE_METADATA = AGENT_REGISTRY["explore"];
// ============================================================================
// PROMPT BUILDER
// ============================================================================
/**
 * Build approach steps for Explore.
 */
function buildExploreApproachSteps() {
    const steps = [
        "Glob for file patterns: Find relevant files",
        "Grep for content patterns: Find implementations",
        "Read key files: Understand structure",
        "Synthesize findings: Report with locations",
    ];
    return steps.map((step, i) => `${i + 1}. ${step}`).join("\n");
}
/**
 * Build the complete prompt for Explore agent.
 */
export function createExplorePrompt(context) {
    const metadata = EXPLORE_METADATA;
    const roleContext = buildRoleContext();
    const approachSteps = buildExploreApproachSteps();
    const toolPriority = buildToolPriority();
    const outputFormat = buildOutputFormat();
    const searchPatterns = buildSearchPatterns();
    const systemPrompt = buildExploreSystemPrompt(metadata, roleContext, approachSteps, toolPriority, outputFormat, searchPatterns);
    return {
        systemPrompt,
        skillsPrompt: "",
        categoryPrompt: context.category ? `Category: ${context.category}` : "",
        fullPrompt: context.taskDescription,
    };
}
/**
 * Build Explore-specific system prompt.
 */
function buildExploreSystemPrompt(metadata, roleContext, approachSteps, toolPriority, outputFormat, searchPatterns) {
    let prompt = buildSystemPrompt(metadata.name, metadata, roleContext);
    prompt += "\n";
    prompt += "## Mission\n\n";
    prompt += "Search the local codebase efficiently to find patterns, implementations, and file structures. Provide findings with exact file paths and line numbers.\n\n";
    prompt += "## Success Criteria\n\n";
    prompt += "- Exact file paths provided\n";
    prompt += "- Line numbers for all claims\n";
    prompt += "- Pattern descriptions included\n";
    prompt += "- Gotchas surfaced\n\n";
    prompt += "## Exploration Process\n\n";
    prompt += approachSteps;
    prompt += "\n\n";
    prompt += toolPriority;
    prompt += outputFormat;
    prompt += buildRules([
        "Never modify files: this is read-only",
        "Always include file:line: no vague references",
        "Say when not found: don't guess",
        "Keep concise: findings, not essays",
        "Flag inconsistencies: if patterns conflict",
    ]);
    prompt += "\n";
    prompt += searchPatterns;
    prompt += "## When to Use\n\n";
    prompt += "- \"Find all authentication code\"\n";
    prompt += "- \"How is error handling implemented?\"\n";
    prompt += "- \"Where is X pattern used?\"\n";
    prompt += "- \"Find similar implementations\"\n";
    prompt += "- \"Discover integration points\"\n\n";
    prompt += "## When NOT to Use\n\n";
    prompt += "- External documentation (use Librarian)\n";
    prompt += "- Architecture decisions (use Oracle)\n";
    prompt += "- Implementation (use Hephaestus or category dispatch)\n";
    return prompt;
}
/**
 * Build role-specific context.
 */
function buildRoleContext() {
    return `You are the explorer of the internal codebase. You search INSIDE the project to find implementations, patterns, and file structures. You provide exact file:line references.`;
}
/**
 * Build tool priority section.
 */
function buildToolPriority() {
    return `## Tool Usage Priority

1. **Glob** — Find files by name/pattern
2. **Grep** — Find content by pattern
3. **Read** — Understand full context
4. **AST-grep** — Structural code search (advanced)

`;
}
/**
 * Build output format section.
 */
function buildOutputFormat() {
    return `## Output Format

\`\`\`markdown
## Findings: {topic}

### Files Found
- \`path/to/file.ts:42\` — {what this file does}
- \`path/to/other.ts:15\` — {what this file does}

### Patterns Identified

#### {Pattern Name}
{description with file:line references}
\`\`\`{language}
// From: path/to/file.ts:42
{code snippet}
\`\`\`

#### {Pattern Name}
{description}

### Conventions
- **Naming**: {observed convention}
- **Error Handling**: {observed pattern}
- **Testing**: {observed approach}

### Integration Points
- {where new code would connect}

### Gotchas
- {anything surprising or non-obvious}

### Recommendations for Implementation
- {if appropriate, suggest approach based on patterns}
\`\`\`

`;
}
/**
 * Build search patterns section.
 */
function buildSearchPatterns() {
    return `## Search Patterns

**Effective queries**:
- "find auth implementations" → Glob auth*.ts, Grep "auth"
- "error handling pattern" → Grep "catch", Grep "Error"
- "API routes" → Glob routes/**, Grep "router"

**Parallel execution** (fire multiple explores):
\`\`\`
task(subagent_type="explore", prompt="Find auth patterns...")
task(subagent_type="explore", prompt="Find database queries...")
task(subagent_type="explore", prompt="Find API endpoints...")
// All run in parallel
\`\`\`

`;
}
/**
 * Factory function compatible with OhMyOpenCode pattern.
 */
export function createExploreAgent(model) {
    const metadata = EXPLORE_METADATA;
    return {
        name: metadata.name,
        instructions: buildExploreSystemPrompt(metadata, buildRoleContext(), buildExploreApproachSteps(), buildToolPriority(), buildOutputFormat(), buildSearchPatterns()),
        model,
        temperature: metadata.temperature,
        mode: metadata.mode,
        permissions: metadata.permissions,
        fallbackChain: [...metadata.fallbackChain],
    };
}
//# sourceMappingURL=explore.js.map