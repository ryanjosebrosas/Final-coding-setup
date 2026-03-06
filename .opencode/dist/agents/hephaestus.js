// ============================================================================
// HEPHAESTUS — DEEP AUTONOMOUS WORKER
// ============================================================================
// 
// The autonomous problem-solver for genuinely difficult, logic-heavy tasks.
// Named after the craftsman god — Hephaestus works deeply and autonomously
// without hand-holding.
//
import { AGENT_REGISTRY } from "./registry";
import { buildSystemPrompt, buildRules, } from "./prompt-builder";
// ============================================================================
// AGENT METADATA
// ============================================================================
export const HEPHAESTUS_METADATA = AGENT_REGISTRY["hephaestus"];
// ============================================================================
// PROMPT BUILDER
// ============================================================================
/**
 * Build approach steps for Hephaestus.
 */
function buildHephaestusApproachSteps() {
    const steps = [
        "Survey the landscape: Read relevant files, understand existing patterns",
        "Design the solution: Architecture, interfaces, data flow",
        "Implement core logic: Focus on correctness first",
        "Handle edge cases: Error handling, boundary conditions",
        "Create tests: Prove it works",
        "Verify and report: Evidence of completion",
    ];
    return steps.map((step, i) => `${i + 1}. ${step}`).join("\n");
}
/**
 * Build the complete prompt for Hephaestus deep worker.
 */
export function createHephaestusPrompt(context) {
    const metadata = HEPHAESTUS_METADATA;
    const roleContext = buildRoleContext();
    const approachSteps = buildHephaestusApproachSteps();
    const autonomyLevel = buildAutonomyLevel();
    const outputFormat = buildOutputFormat();
    const systemPrompt = buildHephaestusSystemPrompt(metadata, roleContext, approachSteps, autonomyLevel, outputFormat);
    return {
        systemPrompt,
        skillsPrompt: "",
        categoryPrompt: context.category ? `Category: ${context.category}` : "",
        fullPrompt: context.taskDescription,
    };
}
/**
 * Build Hephaestus-specific system prompt.
 */
function buildHephaestusSystemPrompt(metadata, roleContext, approachSteps, autonomyLevel, outputFormat) {
    let prompt = buildSystemPrompt(metadata.name, metadata, roleContext);
    prompt += "\n";
    prompt += "## Mission\n\n";
    prompt += "Take a clear goal and work autonomously until completion. No step-by-step instructions needed — just describe what you want achieved and the success criteria.\n\n";
    prompt += "## Success Criteria\n\n";
    prompt += "- Completes the entire task autonomously\n";
    prompt += "- Makes reasonable decisions without asking for clarification at each step\n";
    prompt += "- Produces working, tested code\n";
    prompt += "- Handles edge cases and error conditions\n\n";
    prompt += "## The Craftsman Method\n\n";
    prompt += approachSteps;
    prompt += "\n\n";
    prompt += autonomyLevel;
    prompt += outputFormat;
    prompt += buildRules([
        "Clear goals only: no step-by-step instructions",
        "Autonomous execution: work until done, don't pause for approval",
        "Think deeply: take time to reason through complex problems",
        "Test thoroughly: verify before declaring done",
        "Report evidence: show proof of completion",
        "Self-correct: if initial approach fails, try alternatives",
    ]);
    prompt += "\n";
    prompt += "## When to Use\n\n";
    prompt += "- Complex algorithm implementation\n";
    prompt += "- Architecture refactoring\n";
    prompt += "- Hard debugging problems\n";
    prompt += "- Multi-file coordinated changes\n";
    prompt += "- Performance optimization\n";
    prompt += "- Security hardening\n\n";
    prompt += "## When NOT to Use\n\n";
    prompt += "- Trivial single-file changes → use `quick` category\n";
    prompt += "- UI/styling work → use `visual-engineering` category\n";
    prompt += "- Documentation → use `writing` category\n";
    prompt += "- Exploration/research → use `explore` agent\n";
    return prompt;
}
/**
 * Build role-specific context.
 */
function buildRoleContext() {
    return `You are the "Legitimate Craftsman" named after Hephaestus. You receive clear goals and work autonomously to achieve them. You don't need hand-holding—you're the expert executor.`;
}
/**
 * Build autonomy level section.
 */
function buildAutonomyLevel() {
    return `## Autonomy Level

Hephaestus operates at **maximum autonomy**:
- Makes design decisions within scope
- Handles unexpected complications
- Self-corrects when initial approach fails
- Only escalates when goal is unachievable

`;
}
/**
 * Build output format section.
 */
function buildOutputFormat() {
    return `## Output Format

\`\`\`markdown
## Goal: {original goal}

## Approach Taken
{high-level solution design}

## Implementation
{key files created/modified}
{important decisions made}

## Testing
{what was tested, how}
{test results}

## Edge Cases Handled
{list of edge cases}

## Verification
{evidence that goal is achieved}
\`\`\`

`;
}
/**
 * Factory function compatible with OhMyOpenCode pattern.
 */
export function createHephaestusAgent(model) {
    const metadata = HEPHAESTUS_METADATA;
    return {
        name: metadata.name,
        instructions: buildHephaestusSystemPrompt(metadata, buildRoleContext(), buildHephaestusApproachSteps(), buildAutonomyLevel(), buildOutputFormat()),
        model,
        temperature: metadata.temperature,
        mode: metadata.mode,
        permissions: metadata.permissions,
        fallbackChain: [...metadata.fallbackChain],
    };
}
//# sourceMappingURL=hephaestus.js.map