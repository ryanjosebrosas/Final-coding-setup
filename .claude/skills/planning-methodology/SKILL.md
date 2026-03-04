---
name: planning-methodology
description: Guide for systematic interactive planning with template-driven output and confidence scoring
license: MIT
compatibility: claude-code
---

# Planning Methodology — Interactive Discovery + Structured Output

This skill provides the knowledge framework for transforming feature requests into comprehensive implementation plans. It complements the `/planning` command — the command provides the interactive discovery workflow, this skill provides the structured output methodology.

## When This Skill Applies

- User asks to "plan a feature", "create an implementation plan", or "structure development work"
- A feature request needs to be broken down before implementation
- Inside `/build` when generating standard or heavy plans

## The Discovery-to-Plan Flow

The `/planning` command drives an interactive conversation with the user. This skill defines what the plan artifact should contain and how to produce it.

### Phase 1: Understand (Interactive)
**Goal**: Define WHAT we're building and WHY — through conversation, not automation.
- Ask questions, confirm intent, discuss tradeoffs with the user
- Check `memory.md` for past decisions about this feature area
- Check `.agents/context/next-command.md` for context from prior specs
- Output: Clear shared understanding of scope and approach

### Phase 2: Explore (Codebase Intelligence)
**Goal**: Ground the plan in reality by exploring the codebase.
- **Local exploration**: Use Glob, Grep, Read to find patterns and integration points
- **RAG** (if available): Search knowledge base for similar implementations

- Share findings with the user as you discover them
- Output: File references with line numbers, patterns to follow, gotchas identified

### Phase 3: Design (Strategic Decisions)
**Goal**: Lock in the implementation approach.
- Propose approach with alternatives and tradeoffs
- For non-trivial decisions, suggest `/council` for multi-model input
- Get explicit user confirmation before proceeding
- Output: Locked approach, key decisions documented

### Phase 4: Preview + Approval
**Goal**: Validate direction before writing the full plan.
- Show a 1-page preview: what, approach, files, key decision, risks, tests
- Get explicit approval before writing the plan file
- Output: User approval to proceed

### Phase 5: Write Plan
**Goal**: Generate the structured plan document at the appropriate depth.
**All plans follow size requirements in `/planning` command:**
- **Target**: 700-1000 lines (hard requirement)
- Plans under 700 lines are REJECTED — expand code samples and task detail
- Depth label (light/standard/heavy) affects validation tier, NOT plan size

## Plan Quality Requirements

1. **Evidence-backed**: Every file reference has line numbers; every pattern has a code example from THIS project
2. **Executable tasks**: Each task includes ACTION, TARGET, IMPLEMENT, and VALIDATE at minimum
3. **No-prior-knowledge test**: Another session can execute the plan without additional context
4. **Approval gate**: Preview shown and approved before writing the final plan file

### The 7-Field Task Format (for heavy plans)

Every task in a heavy plan MUST include ALL fields:

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

## RAG Integration

If a RAG knowledge base MCP is available, search curated knowledge FIRST:
1. Check available sources
2. Search knowledge base (2-5 keyword queries)
3. Search code examples (2-5 keyword queries)
4. **Critical**: Keep queries SHORT — 2-5 keywords maximum for best vector search results

If RAG unavailable, proceed with local exploration and web search.

## Key Rules

1. **Discovery first, plan second.** Do NOT auto-generate. Work WITH the user.
2. **Plan depth scales with complexity.** Light for scaffolding, heavy for core logic.
3. **No code in planning.** Plans produce documents, not implementations.
4. **Research validation.** Verify all findings before building the plan on them.
5. **Agent-to-agent optimization.** The plan is consumed by `/execute` in a fresh session — it must be self-contained.

## Output

Save to: `.agents/features/{feature}/plan.md`
(For master plans: `.agents/features/{feature}/plan-master.md` + `.agents/features/{feature}/plan-phase-{N}.md`)

## Structured Plan Sections

Every plan should contain these sections (adapt depth to complexity):

```markdown
# {Feature Name} — Implementation Plan

## Feature Description
{What this feature does — 2-3 sentences}

## User Story
As a {user}, I want to {action}, so that {benefit}.

## Problem Statement
{What problem this solves}

## Solution Statement
{How this solves it — the approach}

## Feature Metadata
- Spec ID: {from BUILD_ORDER}
- Depth: {light/standard/heavy}
- Pillar: {from PILLARS.md}
- Dependencies: {list}
- Estimated tasks: {N}

## Context References
### Codebase Files
- `path/file:line` — {what's relevant}

### Memory References
- {relevant entries from memory.md}

### RAG References
- {relevant docs from knowledge base, or "None"}

## Patterns to Follow
### Pattern 1: {name}
```{language}
// Actual code from THIS project at path/file:line-line
```

## Implementation Plan

### Phase 1: Foundation
- Task 1.1: {description}
- Task 1.2: {description}

### Phase 2: Core
- Task 2.1: {description}

### Phase 3: Integration + Testing
- Task 3.1: {description}

## Step-by-Step Tasks

### Task 1: {name}
- **ACTION**: CREATE
- **TARGET**: `path/to/file.ts`
- **IMPLEMENT**: {detailed description with code samples}
- **PATTERN**: Follow `path/reference:line`
- **IMPORTS**: {exact import statements}
- **GOTCHA**: {known pitfall}
- **VALIDATE**: `{command to verify}`

### Task 2: {name}
...

## Testing Strategy
### Unit Tests
- {test file}: {what it tests}

### Integration Tests
- {test description}

### Edge Cases
- {edge case 1}
- {edge case 2}

## Validation Commands
```bash
# L1: Lint
{command}
# L2: Types
{command}
# L3: Unit Tests
{command}
# L4: Integration Tests
{command}
# L5: Manual
{steps}
```

## Acceptance Criteria

### Implementation
- [ ] {criterion 1}
- [ ] {criterion 2}

### Runtime
- [ ] {criterion 1}

## Completion Checklist
- [ ] All tasks implemented
- [ ] All tests passing
- [ ] All validation commands pass
- [ ] Code follows project patterns
- [ ] No new lint/type errors introduced

## Notes
- **Key decisions**: {list}
- **Risks**: {list}
- **Confidence**: {X}/10 for one-pass success
```

## Related Commands

- `/planning [feature]` — The interactive discovery workflow that uses this methodology
- `/execute [plan-path]` — Implements the plan this methodology produces
- `/build [spec]` — Wraps planning + execution in an automated loop
- `/prime` — Load context before starting planning
