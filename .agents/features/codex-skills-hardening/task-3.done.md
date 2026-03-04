# Task 3: Create Planning Skill (Codex)

## Objective

Create `.codex/skills/planning/SKILL.md` — a Codex CLI skill for interactive planning that adds
reasoning depth: discovery-first discipline, Phase 3 structured thinking, task decomposition
quality criteria, and brief writing standards.

## Scope

- **File to create**: `.codex/skills/planning/SKILL.md`
- **Out of scope**: Do NOT modify `.opencode/commands/planning.md`
- **Dependencies**: None

## Prior Task Context

Tasks 1-2 created mvp and prd skills. Same Codex frontmatter pattern: `name:` + `description:`
with trigger phrases + body starting with `## When to Use This Skill` + closing `## Key Rules`.

## Context References

### Reference: Source Command — `.opencode/commands/planning.md` (key sections)

```markdown
## Core Rules
1. Discovery first, plan second. Do NOT auto-generate a plan.
2. Work WITH the user. This is a conversation.
3. No code in this phase.
4. Plan-before-execute.

## Phase 1: Understand (Discovery Conversation)
- Ask ONE question at a time
- After each discovery, confirm with user

## Phase 3: Design (Structured Reasoning)
3a. Synthesize — distill into clear picture
3b. Analyze — dependency graph, risks, failure modes, interface boundaries
3c. Decide — chosen approach with reasoning + rejected alternatives
3d. Decompose — tasks with justifications

## Phase 4: Preview (Approval Gate)
Show 1-page preview before writing the full plan.
Only write after explicit approval.

## Hard requirement: plan.md under 700 lines is REJECTED
## Hard requirement: task brief under 700 lines is REJECTED

## Task splitting heuristic: One task brief = one target file
```

### Reference: Codex skill frontmatter pattern (from execute skill)

```yaml
---
name: execute
description: Execute a task brief from .agents/features/ to implement a planned feature.
             Use when the user asks to execute a task brief, implement a plan, run a task,
             work on the next task, or implement a feature. Trigger phrases include:
             "execute task", "implement the plan", "run the task brief".
---
```

## Patterns to Follow

### Pattern: Phase 3 structured reasoning is the core value

The command describes Phase 3 in detail. The skill must emphasize that skipping Phase 3 substeps
(Synthesize → Analyze → Decide → Decompose in order) produces low-quality plans. Each substep
has quality criteria.

### Pattern: Brief line count is not padding

700 lines comes from inline content:
- Context References: paste current file content (50-150 lines)
- Patterns to Follow: paste complete code snippets (30-80 lines)
- Current/Replace blocks: exact before + after (50-200 lines)
NOT from verbose descriptions.

## Step-by-Step Tasks

### IMPLEMENT: Create `.codex/skills/planning/SKILL.md`

```markdown
---
name: planning
description: Interactive discovery session to explore ideas with the user, then produce a
             structured implementation plan with task briefs. Use when a feature needs to be
             planned before implementation, a complex task needs to be broken down, or the
             user wants to create a structured plan. Trigger phrases include: "plan a feature",
             "create an implementation plan", "break down this feature", "let's plan",
             "I need a plan for", "planning", "how do we implement".
---

# Planning: Interactive Discovery + Structured Plan

## When to Use This Skill

Use this skill when:
- `/planning {feature}` is invoked
- A feature needs to be broken down before Codex can execute it
- The user wants a structured task brief series for a complex change
- Planning artifacts (plan.md + task-N.md briefs) need to be created

## Phase 1: Discovery Discipline

**Rule: discovery first, plan second.**

Never auto-generate a plan from a feature name. Ask questions first:

```
What are we building? Give me the short version.
```

Then ask 2-3 targeted follow-up questions (one at a time):
- "What's the most important thing this needs to do?"
- "What existing code should this integrate with?"
- "Any constraints on how to build it?"

**Why this matters:** A plan built without discovery produces wrong file paths, wrong patterns,
and wrong task ordering. 20 minutes of discovery saves hours of wrong-direction execution.

## Phase 2: Research Before Design

Before Phase 3, delegate research to subagents (if available):
- `research-codebase` — find relevant files, patterns, integration points
- `planning-research` — scan past `.done.md` plans for reusable patterns
- `research-external` — look up library docs if external dependencies are involved

If no subagents available: use Glob/Grep/Read to explore the codebase directly.
The plan must pass the "no-prior-knowledge test" — another agent can execute it without context.

## Phase 3: Structured Reasoning (Do NOT Skip Substeps)

Phase 3 has four substeps in order. Each one's output is required input for the next.
Skipping any substep produces incomplete plans.

**3a. Synthesize** — distill Phase 1+2 into one clear picture:
- What are we building (1 paragraph, precise)
- What research found (codebase patterns, prior plan patterns, gotchas)
- What the user cares about most
- Constraints + unknowns

**3b. Analyze** — structured analysis before any decisions:
- Dependency graph (what depends on what)
- Critical path (what must be done first)
- Risk assessment (HIGH/MEDIUM/LOW with mitigations)
- Interface boundaries (inputs, outputs, what it touches)

**3c. Decide** — propose the approach ONLY after analysis:
- Chosen approach (2-3 sentences, specific file paths and method names)
- Why this approach (tied to analysis findings, not intuition)
- Rejected alternatives (with specific reasons from analysis)
- Key tradeoff accepted

**3d. Decompose** — break into tasks with justifications:
- Default: one task per target file
- Each task: name, target file, why separate, depends on, scope
- Order rationale (reference dependency graph from 3b)
- Confidence score with reasoning

## Phase 4: Preview Gate (Non-Skippable)

Show a 1-page preview before writing any files:

```
PLAN PREVIEW: {spec-name}
=============================
What:           {1-line description}
Approach:       {the locked-in approach}
Files:          create: X, modify: Y
Key decision:   {the main architectural choice and why}
Risks:          {top 1-2 risks}
Tests:          {testing approach}
Estimated tasks: {N tasks}
Mode:           Task Briefs (N briefs)

Approve this direction to write the full plan? [y/n/adjust]
```

Only write plan artifacts after explicit approval.

## Brief Writing Standards

### plan.md — 700-1000 lines

Required sections: Feature Description, User Story, Problem/Solution Statements,
Feature Metadata, Context References WITH code snippets, Patterns to Follow WITH code snippets,
Step-by-Step Tasks summary, Testing Strategy, Validation Commands, Acceptance Criteria,
Completion Checklist, TASK INDEX table.

If under 700 lines: rejected. Expand by pasting more code from context files.

### task-N.md briefs — 700-1000 lines each

Each brief is self-contained — Codex executes it without reading plan.md.

Required sections: Objective, Scope, Prior Task Context, Context References (with full pasted
content), Patterns to Follow (full code snippets), Step-by-Step Tasks (with IMPLEMENT blocks),
Testing Strategy, Validation Commands, Acceptance Criteria, Handoff Notes, Completion Checklist.

**How briefs reach 700 lines — inline content only:**
- Context References: paste the full current content of target files in code blocks
- Patterns to Follow: paste complete reference patterns (not summaries or "see line X")
- Current/Replace blocks: paste EXACT current content + COMPLETE replacement — every line
- No "..." abbreviation — full content only

A brief that says "see lines 45-62" is rejected. Paste those 18 lines inline.

### Task splitting heuristic

One brief = one target file. Default. Exceptions only when edits are tightly coupled
(renaming in file A requires updating import in file B). If a brief touches 3+ files,
split it unless you can justify why they can't be changed independently.

## Key Rules

1. **Discovery first** — never auto-generate a plan; ask questions first
2. **Phase 3 substeps are ordered** — Synthesize → Analyze → Decide → Decompose
3. **Preview gate is non-negotiable** — no files written before explicit approval
4. **700 lines = inline content, not padding** — depth comes from pasted code
5. **One brief per target file** — split unless edits are tightly coupled
6. **No-prior-knowledge test** — another agent should be able to execute the brief without context
7. **Current/Replace blocks are exact** — no "..." abbreviations, every line preserved
```

### VALIDATE

```bash
grep -c "name: planning" .codex/skills/planning/SKILL.md
grep -c "When to Use This Skill" .codex/skills/planning/SKILL.md
grep -c "Key Rules" .codex/skills/planning/SKILL.md
grep -c "Phase 4" .codex/skills/planning/SKILL.md
grep -c "Trigger phrases" .codex/skills/planning/SKILL.md
```

## Testing Strategy

No unit tests — markdown file. L1 grep + manual review that skill covers Phase 3 substep
discipline, brief writing standards (700 lines = inline content), and preview gate.

## Validation Commands

```bash
# L1
grep -c "name: planning" .codex/skills/planning/SKILL.md
grep -c "When to Use This Skill" .codex/skills/planning/SKILL.md
grep -c "Key Rules" .codex/skills/planning/SKILL.md
grep -c "Phase 4" .codex/skills/planning/SKILL.md
grep -c "700" .codex/skills/planning/SKILL.md

# L2-L5: N/A
```

## Acceptance Criteria

### Implementation
- [ ] `.codex/skills/planning/SKILL.md` exists
- [ ] Frontmatter has `name: planning` and trigger phrases
- [ ] Has `## When to Use This Skill` section
- [ ] Has Phase 3 structured reasoning with all 4 substeps (3a-3d)
- [ ] Has Phase 4 preview gate (non-skippable)
- [ ] Has brief writing standards explaining what "700 lines" means
- [ ] Has `## Key Rules` section

### Runtime
- [ ] Codex matches this skill when user says "plan a feature" or "create implementation plan"

## Handoff Notes

Task 4 creates `.codex/skills/council/SKILL.md`. Council is different — it's about discussion
quality, not planning artifacts. Focus: perspective selection quality (genuinely distinct),
genuine argument discipline (no strawmanning), analysis + synthesis standards.

## Completion Checklist

- [ ] `.codex/skills/planning/SKILL.md` created
- [ ] All grep validations pass
- [ ] `task-3.md` → `task-3.done.md` rename completed
