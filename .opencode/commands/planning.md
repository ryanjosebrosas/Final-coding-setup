---
description: Interactive discovery session — explore ideas WITH the user, then produce a structured plan
---

# Planning: Interactive Discovery + Structured Plan

Work WITH the user to explore, question, and discover the right approach for a spec, then produce a structured implementation plan. This is a conversation, not an auto-generator.

## Feature: $ARGUMENTS

---

## Pipeline Position

```
/mvp → /prd → /pillars → /decompose → /planning (this) → /build → /ship
```

Used per-spec inside the `/build` loop, or standalone for manual planning.

---

## Core Rules

1. **Discovery first, plan second.** Do NOT auto-generate a plan. Ask questions, discuss approaches, explore the codebase together.
2. **Work WITH the user.** This is a conversation. Ask short questions, confirm insights, discuss tradeoffs.
3. **No code in this phase.** Planning produces a plan document, not code.
4. **Plan-before-execute.** `/execute` only runs from a `/planning`-generated artifact in `.agents/features/{feature}/`.

---

## Phase 1: Understand (Discovery Conversation)

Start by understanding what the user wants to build. This is interactive:

### If called from `/build` with a spec:
- Read the spec from `.agents/specs/BUILD_ORDER.md`
- Read `.agents/specs/build-state.json` for context from prior specs
- Summarize: "This spec is about {purpose}. It depends on {deps} which are done. Here's what I think we need to build..."
- Ask: "Does this match your thinking? Anything to add or change?"

### Pillar context loading (automatic):
When planning any spec with a pillar ID (e.g., P0-03, P1-02):
1. Extract pillar number from spec ID
2. Look for `.agents/specs/pillar-{N}-*.md` matching that pillar
3. If found, read the pillar file — it contains:
   - Pillar scope and context from PILLARS.md
   - Research findings (RAG references, council feedback)
   - PRD coverage analysis
   - The full spec list for that pillar with dependencies
4. Use this as the PRIMARY context for planning (more specific than BUILD_ORDER.md)
5. If no pillar file found, fall back to reading BUILD_ORDER.md directly

### If called standalone:
- If `$ARGUMENTS` matches a pillar spec ID (e.g., `P0-01`, `P1-03`):
  1. Read the matching pillar file from `.agents/specs/pillar-{N}-*.md`
  2. Read the specific spec entry from that file
  3. Summarize: "This spec is about {purpose}. Pillar context: {scope}. Research found: {key findings}."
  4. Ask: "Does this match your thinking? Anything to add or change?"
- Otherwise:
  - Ask: "What are we building? Give me the short version."
  - Listen, then ask 2-3 targeted follow-up questions:
    - "What's the most important thing this needs to do?"
    - "What existing code should this integrate with?"
    - "Any constraints or preferences on how to build it?"

### Discovery Tools
Use these to explore the codebase during conversation:
- **Glob/Grep/Read** — find and read relevant files
- **Archon RAG** (if available) — search knowledge base for patterns and examples
- **Dispatch** (if available) — send targeted research queries to free models
- **Council** — for architectural decisions with multiple valid approaches (suggest to user)

### Checkpoints
After each major discovery, confirm:
- "Here's what I'm seeing — does this match your intent?"
- "I think we should approach it like X because Y. Sound right?"
- Keep confirmations SHORT — one sentence, not paragraphs.

---

## Phase 2: Explore (Sub-Agent Research)

Once the direction is clear, offload research to sub-agents running in parallel. This keeps the main conversation context clean — only research summaries come back, not raw search results.

### 2a. Pillar context (inline — read directly, small and pre-curated):
If the spec has a pillar ID and a matching pillar file was found in Phase 1:
- Read the Research Findings section — pre-researched RAG results and council feedback
- Read the PRD Coverage table — which PRD requirements this spec covers
- Read the Dependency Verification — cross-pillar dependencies
- Use these as starting context — don't re-research what /decompose already found

### 2b. Launch parallel research agents:

Launch ALL three agents in a single message (parallel Task tool calls). Each runs in its own context and returns a summary.

**Agent 1: research-codebase** (Task tool, subagent_type: "explore")
```
Prompt: "Thorough exploration for planning context.

Feature: {feature description from Phase 1}

Find:
1. Files with patterns we should follow for this feature
2. Integration points — where new code connects to existing code
3. Naming conventions, error handling patterns, testing patterns
4. Gotchas from the codebase (inconsistencies, non-obvious behavior)

Return: structured findings with exact file:line references."
```

**Agent 2: research-external** (Task tool, subagent_type: "explore")
```
Prompt: "Research external documentation and best practices.

Feature: {feature description}
Technologies: {languages, frameworks, libraries involved}

Find:
1. Official documentation for relevant APIs
2. Best practices and recommended patterns
3. Version compatibility notes
4. Common pitfalls in the documentation

Use Archon RAG first (rag_search_knowledge_base, rag_search_code_examples with 2-5 keyword queries).
If RAG unavailable, use WebFetch for official docs.

Return: findings with source URLs/citations."
```

**Agent 3: planning-research** (Task tool, subagent_type: "explore")
```
Prompt: "Search for planning context from knowledge base and completed plans.

Feature: {feature description}

Find:
1. Archon RAG: architecture patterns and code examples (2-5 keyword queries)
2. Completed plans: scan .agents/features/*/plan.done.md for similar features
3. Lessons and patterns from past implementations

Return: structured findings with sources."
```

### 2c. Collect and share findings:

When all three agents return:
1. Read each agent's summary
2. Share key findings with the user: "Research found these patterns..." / "Past plan for {X} used this approach..."
3. Merge findings into the working context for Phase 3

**Fallback**: If Task tool is unavailable, do research inline using Glob/Grep/Read for codebase, Archon RAG for knowledge base, and WebFetch for external docs. The agent prompts above serve as a checklist for what to cover.

### 2d. Dispatch for deep research (optional, when agents aren't enough):

| Need | Tier | Approach |
|------|------|----------|
| Quick factual check | T1 | Dispatch quick-check |
| API/pattern question | T1 | Dispatch api-analysis |
| Library comparison | T2 | Dispatch research |
| Documentation lookup | T1 | Dispatch docs-lookup |

If dispatch unavailable, use Archon RAG or web search.

---

## Phase 3: Design (Strategic Decisions)

Discuss the implementation approach with the user:

1. **Propose the approach** — "Here's how I'd build this: {approach}. The key decision is {X}."
2. **Present alternatives** — if multiple valid approaches exist, show 2-3 options with tradeoffs
3. **Confirm the direction** — "Lock in approach A? Or should we explore B more?"

For non-trivial architecture decisions, suggest council:
- "This has multiple valid approaches. Want to run `/council` to get multi-model input?"

---

## Phase 4: Preview (Approval Gate)

Before writing the full plan, show a **1-page preview**:

```
PLAN PREVIEW: {spec-name}
=============================

What:      {1-line description}
Approach:  {the locked-in approach}
Files:     {create: X, modify: Y}
Key decision: {the main architectural choice and why}
Risks:     {top 1-2 risks}
Tests:     {testing approach}
Estimated tasks: {N tasks}
Mode:      {Single Plan | Master + Sub-Plans (N phases)}

Approve this direction to write the full plan? [y/n/adjust]
```

Only write the plan file after explicit approval.

---

## Phase 5: Write Plan

### Auto-Detect Complexity

After Phases 1-4 (discovery/design), assess complexity:
- **Single Plan Mode**: Estimated tasks < 10, no distinct phases
- **Master + Sub-Plan Mode**: Estimated tasks >= 10 OR multiple distinct phases identified

Announce the mode transparently:
- Single: "This looks like ~8 tasks in one phase — I'll write a single structured plan."
- Multi: "I count ~15 tasks across 3 phases — I'll use the master + sub-plan approach."

---

### Single Plan Mode

Generate the structured plan. **Every plan is 700-1000 lines. No exceptions.** The depth label (light/standard/heavy) does NOT affect planning quality — it only affects the validation tier during `/build`. All plans get the full treatment:

- Feature Description, User Story, Problem Statement, Solution Statement
- Feature Metadata with Slice Guardrails
- Pillar Context (if available): pillar N — name, scope, research findings relevant to this spec, PRD requirements this spec covers
- Context References (codebase files with line numbers, related memories, relevant docs)
- Patterns to Follow (with actual code snippets from the project)
- Implementation Plan (Foundation → Core → Integration → Testing phases)
- Step-by-Step Tasks (every task has ACTION, TARGET, IMPLEMENT, PATTERN, IMPORTS, GOTCHA, VALIDATE)
- Testing Strategy (unit, integration, edge cases)
- Validation Commands (all levels of the validation pyramid)
- Acceptance Criteria (Implementation + Runtime, with checkboxes)
- Completion Checklist
- Notes (key decisions, risks, confidence score)

**Hard requirement:** If the plan is under 700 lines, it is REJECTED. Expand code samples, add more task detail, include more pattern references. Code samples must be copy-pasteable, not summaries.

---

### Master + Sub-Plan Mode

For complex features with 10+ tasks or multiple distinct phases:

**Step 1: Write Master Plan**
- ~400-600 lines
- Save to `.agents/features/{feature}/plan-master.md`
- Contains: overview, phases, dependencies, cross-phase decisions, risk register

**Step 2: Write Sub-Plans (sequential)**
- 700-1000 lines each
- Save to `.agents/features/{feature}/plan-phase-{N}.md`
- Phase count heuristic: 1 phase per 3-5 tasks, 2-4 phases typical
- Each sub-plan references handoff notes from prior phases
- Later sub-plans include "Handoff Received" section with context from earlier phases

**Phase naming:**
- Phase 1: Foundation/Setup tasks
- Phase 2: Core implementation
- Phase 3: Integration/Testing
- (Adjust based on actual feature structure)

---

## Output

Create the feature directory if it doesn't exist: `.agents/features/{feature}/`

**Single Plan Mode:**
```
.agents/features/{feature}/plan.md
```

**Master + Sub-Plan Mode:**
```
.agents/features/{feature}/plan-master.md
.agents/features/{feature}/plan-phase-1.md
.agents/features/{feature}/plan-phase-2.md
...
```

### Archon Task Sync (if connected)

After writing the plan, sync to Archon:
1. Call `list_projects()` to find or create project for this codebase
2. Call `manage_task("create", ...)` for each task in the plan
3. Store Archon task IDs in plan metadata for `/execute` to update

---

## After Writing

**Single Plan Mode:**
```
Plan written: .agents/features/{feature}/plan.md
Tasks: {N} tasks across {phases} phases
Pillar: {N} — {name} (from {pillar-file-path})   ← omit if no pillar context
PRD requirements covered: {list from pillar file PRD Coverage}   ← omit if no pillar context
Confidence: {X}/10 for one-pass success
Key risk: {top risk}
Archon: {synced N tasks / not connected}

Next: /execute .agents/features/{feature}/plan.md
```

**Master + Sub-Plan Mode:**
```
Master plan: .agents/features/{feature}/plan-master.md
Sub-plans:   .agents/features/{feature}/plan-phase-1.md
             .agents/features/{feature}/plan-phase-2.md
             .agents/features/{feature}/plan-phase-3.md
Total:       {N} tasks across {M} phases
Confidence:  {X}/10 for one-pass success
Key risk:    {top risk}
Archon:      {synced N tasks / not connected}

Next: /execute .agents/features/{feature}/plan-master.md
```

---

## The 7-Field Task Format

Every task in a plan MUST include at minimum ACTION, TARGET, IMPLEMENT, VALIDATE. Heavy plans include all 7 fields:

| Field | Purpose | Example |
|-------|---------|---------|
| **ACTION** | What operation | CREATE / UPDATE / ADD / REMOVE / REFACTOR |
| **TARGET** | Specific file path | `src/services/auth.ts` |
| **IMPLEMENT** | Code-level detail | "Class AuthService with methods: login(), logout()" |
| **PATTERN** | Reference pattern | "Follow pattern in `src/services/user.ts:45-62`" |
| **IMPORTS** | Exact imports | Copy-paste ready import statements |
| **GOTCHA** | Known pitfalls | "Must use async/await — the database client is async-only" |
| **VALIDATE** | Verification command | `npm test -- --grep "auth"` |

Light and standard plans use a reduced format (ACTION, TARGET, IMPLEMENT, VALIDATE minimum).

---

## Interaction Protocol

- **Be concise.** Short questions, short confirmations. Don't lecture.
- **Listen more than talk.** The user knows what they want — help them articulate it.
- **Share discoveries.** When you find something in the codebase, share it immediately.
- **Confirm, don't assume.** If unsure about intent, ask. Don't guess.
- **Know when to stop discovering.** When direction is clear, move to the plan. Don't over-explore.
- **If user says "I already told you"** — synthesize from their inputs immediately. Don't re-ask.

---

## Notes

- This command replaces automated planning with interactive discovery
- Archon RAG is preferred for knowledge lookup; falls back to local exploration
- The plan must pass the "no-prior-knowledge test" — another session can execute it without context
- Keep the conversation moving — a planning session should take 10-30 minutes depending on complexity
