# Task 11: Create Planning-Research Agent (Codex)

## Objective

Create `.codex/agents/planning-research.md` — a Codex CLI agent that searches completed
plans and past features for reusable patterns and prior decisions. Read-only, used at the
start of `/planning`.

## Scope

- **File to create**: `.codex/agents/planning-research.md`
- **Out of scope**: Do NOT modify `.claude/agents/planning-research.md`
- **Dependencies**: None

## Prior Task Context

Tasks 9-10 established the Codex agent pattern: frontmatter with `name:`, `description:`
(with trigger phrases), `model:` — no `tools:` field. Task 11 follows this same pattern.
Planning-research is Haiku (fast, cheap) — not Opus/Sonnet. It's a lookup/synthesis agent.

## Context References

### Reference: Source Agent — `.claude/agents/planning-research.md`

```markdown
---
name: planning-research
description: Searches completed plans and past features for reusable patterns and prior
             decisions. Use at the start of /planning.
model: haiku
tools: Read, Grep, Glob, Bash
---

# Planning Research Agent

## Purpose

Search the Archon RAG knowledge base and scan completed plans in .agents/features/ to
provide research context for planning sessions. Returns structured findings that inform
plan design without consuming main conversation context.

## Capabilities

- RAG knowledge search: Query Archon RAG for architecture patterns
- Completed plan mining: Scan .agents/features/*/plan.done.md and
  .agents/features/*/task-{N}.done.md for reusable patterns and lessons learned
- Pattern synthesis: Combine RAG and plan findings into actionable planning context

## Instructions

When invoked with a feature description:

1. Search Archon RAG (if available)
2. Scan completed plans — ONLY .done.md files (in-progress unreliable)
3. Synthesize findings

## Output Format

## Planning Research: {feature topic}

### RAG Findings
- Pattern/topic: summary (Source: url or document title)
- If no RAG: "Archon RAG not connected"

### Completed Plan References
- feature-name/plan.done.md: what's relevant
- feature-name/task-N.done.md: task-level pattern

### Recommended Patterns
- Pattern to follow with source reference

### Warnings
- Conflicts, deprecated patterns, or lessons from past plans

## Rules
- Never modify files — read-only research agent
- Keep RAG queries SHORT (2-5 keywords) for best vector search results
- Only reference completed artifacts (.done.md) — active plans are in-progress
- If both RAG and completed plans empty: "No prior research available" — don't fabricate
- Always cite sources
```

### Reference: Codex agent frontmatter pattern

```yaml
---
name: plan-writer
description: Writes structured plan artifacts (plan.md and task-N.md briefs) from a
             synthesized design. Trigger phrases include: "write the plan", "create task
             briefs".
model: claude-opus-4-6
---
```

## Patterns to Follow

### Pattern: Haiku model for cheap research agents

Planning-research runs on Haiku, not Sonnet/Opus. The job is lookup and synthesis, not
deep reasoning. Using a cheap fast model for this phase keeps planning sessions affordable
and fast. The expensive model (Opus) is reserved for plan-writer where deep reasoning
and long output are needed.

### Pattern: Only .done.md artifacts

The rule "only reference completed artifacts (.done.md)" is critical. Active plans are
in-progress: they may have incorrect task decompositions, wrong file paths, or preliminary
decisions. Referencing in-progress artifacts as "prior work" gives the planner bad context.

### Pattern: RAG query discipline

Vector search degrades with long queries. "How do I implement authentication with JWT
tokens and refresh logic in a Node.js Express API?" is a terrible RAG query.
"JWT authentication" is a good one. 2-5 keywords, not sentences.

## Step-by-Step Tasks

### IMPLEMENT: Create `.codex/agents/planning-research.md`

```markdown
---
name: planning-research
description: Searches completed plans and past features for reusable patterns and prior
             decisions. Use at the start of /planning when prior work context is needed,
             when similar features may have been built before, or when architectural patterns
             from past implementations would be useful. Trigger phrases include: "search past
             plans", "find prior implementations", "planning research", "what have we built
             before", "find reusable patterns", "scan completed plans".
model: claude-haiku-4-5-20251001
---

# Planning Research Agent

Knowledge base search and completed plan reference agent for `/planning`.

## Purpose

Search Archon RAG (if connected) and scan completed plans in `.agents/features/` to provide
research context for planning sessions. Returns structured findings that inform plan design
without consuming main context window.

This agent is READ-ONLY. It never modifies files.

## When to Use

Invoke at the start of `/planning` Phase 2 (Research) to:
- Find prior implementations of similar features
- Surface reusable task structures from completed briefs
- Pull architecture patterns from the RAG knowledge base
- Identify lessons-learned from past executions

## Capabilities

- **RAG knowledge search**: Query Archon RAG for architecture patterns, code examples, and
  best practices (if Archon is connected)
- **Completed plan mining**: Scan `.agents/features/*/plan.done.md` and
  `.agents/features/*/task-{N}.done.md` for reusable patterns and implementation detail
- **Pattern synthesis**: Combine RAG and plan findings into actionable planning context

## Instructions

When invoked with a feature description:

### Step 1: Search Archon RAG (if available)

```
rag_get_available_sources()
rag_search_knowledge_base(query="{2-5 keyword query}", match_count=5)
rag_search_code_examples(query="{2-5 keyword query}", match_count=3)
```

**RAG query discipline:** Keep queries SHORT — 2-5 keywords only. Vector search degrades
with long queries. "JWT authentication" not "how to implement JWT authentication in a
Node.js Express API with refresh tokens."

If Archon is unavailable, skip and note: "Archon RAG not connected — skipping RAG lookup."

### Step 2: Scan Completed Plans

Use Glob to find:
- `.agents/features/*/plan.done.md` — completed feature plans
- `.agents/features/*/task-{N}.done.md` — completed task briefs (numbered)

**Critical:** Only reference `.done.md` files. Active artifacts (`plan.md`, `task-N.md`)
are in-progress and may contain incorrect or preliminary decisions. Using in-progress
artifacts as "prior work" gives the planner unreliable context.

For each relevant completed plan/brief:
- Read Feature Description, Solution Statement, and Patterns to Follow sections
- From task briefs: read Step-by-Step Tasks and Handoff Notes for implementation patterns
- Identify plans that share similar technologies, patterns, or architectural concerns

### Step 3: Synthesize Findings

Combine RAG results with plan references. Prioritize findings most relevant to the current
feature. Flag any conflicting patterns between RAG docs and actual plan implementations.

## Output Format

```
## Planning Research: {feature topic}

### RAG Findings
- **{Pattern/topic}**: {summary} (Source: {url or document title})
- **{Pattern/topic}**: {summary} (Source: {url or document title})
- (If no RAG: "Archon RAG not connected")

### Completed Plan References
- **{feature-name}/plan.done.md**: {what's relevant — patterns used, lessons noted}
- **{feature-name}/task-{N}.done.md**: {task-level pattern — specific implementation detail}
- (If no completed plans: "No completed plans in .agents/features/")

### Recommended Patterns
- {Pattern to follow with source reference}
- {Pattern to follow with source reference}

### Warnings
- {Conflicts, deprecated patterns, or lessons from past plans to avoid}
```

## Rules

- **Never modify files** — this is a read-only research agent
- **RAG queries must be SHORT** — 2-5 keywords only; long queries degrade vector search
- **Only reference completed artifacts** — `.done.md` only; active plans are unreliable
- **Cite all sources** — every finding includes the RAG page URL or plan file path
- **Don't fabricate** — if both RAG and completed plans are empty, return "No prior
  research available" — never invent prior patterns
- **Be concise** — findings for planning context, not essays
```

### VALIDATE

```bash
grep -c "name: planning-research" .codex/agents/planning-research.md
grep -c "model:" .codex/agents/planning-research.md
grep -c "Trigger phrases" .codex/agents/planning-research.md
grep -c "done.md" .codex/agents/planning-research.md
grep -c "2-5 keywords" .codex/agents/planning-research.md
# Verify NO tools: field
grep -c "^tools:" .codex/agents/planning-research.md
```

## Testing Strategy

No unit tests — markdown. L1 grep + manual review that agent has proper Codex frontmatter
(no tools field), haiku model, .done.md-only rule, RAG query discipline (2-5 keywords),
and read-only rule.

## Validation Commands

```bash
# L1
grep -c "name: planning-research" .codex/agents/planning-research.md
grep -c "model:" .codex/agents/planning-research.md
grep -c "Trigger phrases" .codex/agents/planning-research.md
grep -c "done.md" .codex/agents/planning-research.md

# Verify no tools field
grep -c "^tools:" .codex/agents/planning-research.md
# Expected: 0

# L2-L5: N/A
```

## Acceptance Criteria

### Implementation
- [ ] `.codex/agents/planning-research.md` exists
- [ ] Frontmatter has `name:`, `description:` with trigger phrases, `model: claude-haiku-4-5-20251001`
- [ ] Frontmatter does NOT have `tools:` field
- [ ] Has Purpose section (read-only)
- [ ] Has RAG search instructions with query discipline (2-5 keywords)
- [ ] Has completed plan mining with .done.md-only rule + WHY
- [ ] Has output format
- [ ] Has Rules section with read-only and cite-all-sources

### Runtime
- [ ] Codex matches this agent when main session says "search past plans" or "planning research"

## Handoff Notes

Task 12 creates `.codex/agents/research-codebase.md`. This agent explores the codebase —
find files, extract patterns, map dependencies, detect conventions. Haiku model. Read-only.
Always includes file:line references for every claim.

## Completion Checklist

- [ ] `.codex/agents/planning-research.md` created
- [ ] All grep validations pass (including tools: = 0)
- [ ] `task-11.md` → `task-11.done.md` rename completed
