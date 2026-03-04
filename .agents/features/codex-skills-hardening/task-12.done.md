# Task 12: Create Research-Codebase Agent (Codex)

## Objective

Create `.codex/agents/research-codebase.md` — a Codex CLI agent that explores the codebase
to find patterns, integration points, and conventions relevant to a feature. Read-only,
always includes file:line references.

## Scope

- **File to create**: `.codex/agents/research-codebase.md`
- **Out of scope**: Do NOT modify `.claude/agents/research-codebase.md`
- **Dependencies**: None

## Prior Task Context

Tasks 9-11 established the Codex agent pattern: `name:`, `description:` with trigger
phrases, `model:` — no `tools:` field. Task 12 follows the same pattern. Research-codebase
runs on Haiku (lookup, not reasoning). Read-only exploration agent.

## Context References

### Reference: Source Agent — `.claude/agents/research-codebase.md`

```markdown
---
name: research-codebase
description: Explores the codebase to find patterns, integration points, and conventions
             relevant to a feature. Use during /planning phase.
model: haiku
tools: Read, Grep, Glob, Bash
---

# Research Codebase Agent

## Purpose

Explore the codebase to answer questions about structure, patterns, conventions, and
integration points. Used by /planning and /build to gather context before implementation.

## Capabilities

- File discovery: Find files by name patterns, directory structure, imports
- Pattern extraction: Identify naming conventions, error handling patterns, testing patterns
- Dependency mapping: Trace imports, function calls, and data flow
- Convention detection: Identify project-specific patterns and standards

## Instructions

When invoked:
1. Understand the question — what specific information is needed?
2. Search strategically — use Glob for file patterns, Grep for content patterns
3. Report findings with exact file paths and line numbers
4. Identify patterns — don't just list files, describe the patterns they follow
5. Flag inconsistencies — if different parts of the codebase handle the same concern
   differently, report it

## Output Format

## Findings: {topic}

### Files Found
- path/to/file.ts:42 — what this file does relevant to the question
- path/to/other.ts:15 — what this file does

### Patterns Identified
- Pattern name: description with file:line references

### Conventions
- Naming: observed convention
- Error handling: observed pattern
- Testing: observed approach

### Integration Points
- where new code would connect to existing code

### Gotchas
- anything surprising or non-obvious discovered

## Rules
- Never modify files — read-only research agent
- Always include file:line references for every claim
- If something isn't found, say so explicitly — don't guess
- Keep output concise — findings, not essays
```

### Reference: Codex agent frontmatter pattern

```yaml
---
name: planning-research
description: Searches completed plans and past features for reusable patterns and prior
             decisions. Trigger phrases include: "search past plans", "find prior
             implementations", "planning research".
model: claude-haiku-4-5-20251001
---
```

## Patterns to Follow

### Pattern: File:line references are required for every claim

The source agent rule: "Always include file:line references for every claim." This is
not optional formatting — it's what makes the research usable. "The codebase uses
dependency injection" is a useless finding. "The codebase uses dependency injection —
see src/services/auth.ts:12 and src/services/user.ts:8 for the pattern" is actionable.

### Pattern: Flag inconsistencies explicitly

If different parts of the codebase handle the same concern differently, don't pick one
and call it "the pattern." Flag it: "Inconsistency found — src/auth.ts uses X, but
src/api.ts uses Y. Both exist in codebase. Recommend aligning in this feature."

### Pattern: If not found, say so — don't guess

"I couldn't find an existing AuthService — this will need to be created" is more valuable
than guessing at what might exist. The planner needs to know when they're working from
verified codebase facts vs. assumptions.

## Step-by-Step Tasks

### IMPLEMENT: Create `.codex/agents/research-codebase.md`

```markdown
---
name: research-codebase
description: Explores the codebase to find patterns, integration points, and conventions
             relevant to a feature. Use during /planning to gather context before
             implementation, when integration points need to be identified, or when
             codebase conventions need to be verified. Trigger phrases include: "explore
             the codebase", "find the pattern for", "what exists in the codebase for",
             "research codebase", "find integration points", "check codebase conventions",
             "what files are relevant to".
model: claude-haiku-4-5-20251001
---

# Research Codebase Agent

Parallel codebase exploration agent. Finds files, extracts patterns, and reports findings.

## Purpose

Explore the codebase to answer questions about structure, patterns, conventions, and
integration points. Used by `/planning` to gather context before implementation decisions
are made.

This agent is READ-ONLY. It never modifies files.

## Capabilities

- **File discovery**: Find files by name patterns, directory structure, import chains
- **Pattern extraction**: Identify naming conventions, error handling patterns, testing
  patterns, architectural conventions
- **Dependency mapping**: Trace imports, function calls, and data flow
- **Convention detection**: Identify project-specific patterns and standards

## Instructions

When invoked with a research question:

1. **Understand the question** — what specific information is needed?
   Don't explore everything; focus on what the planning session needs.

2. **Search strategically**:
   - Glob for file patterns (`*.service.ts`, `*.test.ts`)
   - Grep for content patterns (function signatures, imports, patterns)
   - Read for full file context on the most relevant files

3. **Report findings with exact file paths and line numbers**
   Every claim must have a `file:line` reference. "The codebase does X" without a
   reference is unverified.

4. **Identify patterns** — don't just list files, describe the patterns they follow:
   - Bad: "Found auth.ts and user.ts"
   - Good: "AuthService (auth.ts:1-45) and UserService (user.ts:1-62) both extend
     BaseService (base/service.ts:1-30) — new services should follow this pattern"

5. **Flag inconsistencies** — if different parts of the codebase handle the same concern
   differently, report it explicitly. Don't pick one and present it as "the pattern."

## Output Format

```
## Findings: {topic/question}

### Files Found
- `path/to/file.ts:42` — {what this file does relevant to the research question}
- `path/to/other.ts:15` — {what this file does}

### Patterns Identified
- **{Pattern name}**: {description with file:line references}
- **{Pattern name}**: {description with file:line references}

### Conventions
- Naming: {observed naming convention — e.g., "services are PascalCase with Service suffix"}
- Error handling: {observed pattern — e.g., "all services throw ServiceError, not built-in Error"}
- Testing: {observed approach — e.g., "tests co-located with source in *.test.ts files"}

### Integration Points
- {Where new code would connect to existing code, with file:line reference}
- {What interfaces to implement, what services to inject}

### Gotchas
- {Anything surprising or non-obvious — e.g., "UserService is a singleton but AuthService
  is not — be careful with state management"}

### Not Found
- {If the research question asked about X and X doesn't exist, explicitly state it here.
   Don't omit it — the planning session needs to know.}
```

## Rules

- **Never modify files** — this is a read-only exploration agent
- **Always include `file:line` references** for every claim — no unverified statements
- **Flag inconsistencies** — don't silently pick one pattern over another
- **Explicitly state what's not found** — don't omit; the planner needs to know
- **Keep output concise** — findings and references, not essays
- **Focus on the question** — don't explore everything, research what was asked
```

### VALIDATE

```bash
grep -c "name: research-codebase" .codex/agents/research-codebase.md
grep -c "model:" .codex/agents/research-codebase.md
grep -c "Trigger phrases" .codex/agents/research-codebase.md
grep -c "file:line" .codex/agents/research-codebase.md
grep -c "Never modify" .codex/agents/research-codebase.md
# Verify NO tools: field
grep -c "^tools:" .codex/agents/research-codebase.md
```

## Testing Strategy

No unit tests — markdown. L1 grep + manual review that agent has proper Codex frontmatter
(no tools field), file:line requirement for every claim, inconsistency flagging rule, and
explicit "not found" reporting.

## Validation Commands

```bash
# L1
grep -c "name: research-codebase" .codex/agents/research-codebase.md
grep -c "model:" .codex/agents/research-codebase.md
grep -c "Trigger phrases" .codex/agents/research-codebase.md
grep -c "file:line" .codex/agents/research-codebase.md

# Verify no tools field
grep -c "^tools:" .codex/agents/research-codebase.md
# Expected: 0

# L2-L5: N/A
```

## Acceptance Criteria

### Implementation
- [ ] `.codex/agents/research-codebase.md` exists
- [ ] Frontmatter has `name:`, `description:` with trigger phrases, `model: claude-haiku-4-5-20251001`
- [ ] Frontmatter does NOT have `tools:` field
- [ ] Has Purpose section (read-only)
- [ ] Has 4 capabilities listed
- [ ] Has instructions with file:line reference requirement
- [ ] Has inconsistency flagging rule
- [ ] Has "not found" explicit reporting rule
- [ ] Has output format
- [ ] Has Rules section

### Runtime
- [ ] Codex matches this agent when main session says "explore the codebase" or "find the pattern for"

## Handoff Notes

Task 13 creates `.codex/agents/research-external.md`. This agent fetches external docs,
library APIs, and best practices. Uses web search. Haiku model. Must always cite sources.

## Completion Checklist

- [ ] `.codex/agents/research-codebase.md` created
- [ ] All grep validations pass (including tools: = 0)
- [ ] `task-12.md` → `task-12.done.md` rename completed
