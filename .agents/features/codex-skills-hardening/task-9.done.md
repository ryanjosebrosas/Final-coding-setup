# Task 9: Create Plan-Writer Agent (Codex)

## Objective

Create `.codex/agents/plan-writer.md` — a Codex CLI agent that writes plan artifacts
(plan.md and task-N.md briefs) from structured planning context. One artifact per invocation,
700-1000 lines, all content inline.

## Scope

- **File to create**: `.codex/agents/plan-writer.md`
- **Out of scope**: Do NOT modify `.claude/agents/plan-writer.md`
- **Dependencies**: None (agent files are standalone)

## Prior Task Context

Tasks 1-8 created all 8 missing skills. Tasks 9-14 create the 6 Codex agent files.
The key difference from skills: agents are subprocess documents. They define a specialized
context that runs independently. Codex agents use `name:`, `description:`, `model:` in
frontmatter — no `tools:` field (Codex manages tool availability).

## Context References

### Reference: Source Agent — `.claude/agents/plan-writer.md`

```markdown
---
name: plan-writer
description: Writes structured plan artifacts (plan.md and task-N.md briefs) from a
             synthesised design. Use when /planning is ready to produce output.
model: opus
tools: Read, Grep, Glob, Bash, Write
---

# Plan Writer Agent

Specialized agent for writing plan artifacts (plan.md and task brief files) from
structured planning context.

## Purpose

Write plan artifacts for a feature based on structured context received from /planning
Phase 3 (Synthesize, Analyze, Decide, Decompose). Produces two types of artifacts:
1. plan.md — feature overview + task index (700-1000 lines)
2. task-N.md — individual task briefs (700-1000 lines each)

Each invocation writes ONE artifact.

This agent does NOT:
- Do discovery or research (that's Phase 1-2)
- Make design decisions (that's Phase 3)
- Execute code or run commands (that's /execute)
- Approve plans (that's Phase 4)

## Required Setup

Before writing any artifact, read these files:
1. .claude/templates/TASK-BRIEF-TEMPLATE.md — structural reference for task briefs
2. All target files referenced in the context

## Quality Criteria — The 700-Line Requirement

Both plan.md and task briefs must be 700-1000 lines. NOT padding — depth:
- Context References: Paste full current content (50-150 lines per file)
- Patterns to Follow: Complete reference patterns (30-80 lines per pattern)
- Current/Replace blocks: EXACT current content + COMPLETE replacement (50-200 lines per step)
- All sections filled

## Rejection Criteria

An artifact is REJECTED if it:
- Is under 700 lines
- Uses "see lines X-Y" instead of pasting content inline
- Skips any required section
- Has Current/Replace blocks that abbreviate or use "..."

## Self-Validation

Before declaring complete:
1. Count lines — if under 700, expand
2. Search for "see lines" or "read file" — replace with actual content
3. Check every required section is present and filled
4. Verify Current/Replace accuracy by re-reading target files
```

### Reference: Codex agent frontmatter pattern

The Codex agent format drops the `tools:` field from `.claude/agents/` frontmatter.
Codex CLI manages tool availability through its own configuration.

```yaml
---
name: plan-writer
description: Writes plan artifacts from /planning Phase 3 output. Use when /planning is
             ready to produce plan.md or task-N.md briefs. Trigger phrases include:
             "write the plan", "create the task briefs", "generate plan artifacts".
model: claude-opus-4-6
---
```

## Patterns to Follow

### Pattern: Agent adds trigger phrases to description

Unlike `.claude/agents/` which rely on programmatic invocation, `.codex/agents/` should
include trigger phrases so the main Codex agent can route to them via natural language.

### Pattern: One-artifact-per-invocation discipline

The `.claude/agents/plan-writer.md` makes this explicit: "Each invocation writes ONE
artifact." The Codex version should reinforce this — and explain WHY.

WHY: Plan writing is expensive (opus model, long output). Batching multiple artifacts in
one session means if it fails midway, you lose all partially-written content and can't
resume from the middle. One artifact per session is the recovery boundary.

## Step-by-Step Tasks

### IMPLEMENT: Create `.codex/agents/plan-writer.md`

```markdown
---
name: plan-writer
description: Writes structured plan artifacts (plan.md and task-N.md briefs) from a
             synthesized design. Use when /planning is ready to produce output, when plan
             artifacts need to be written, or when task briefs need to be created. Trigger
             phrases include: "write the plan", "create task briefs", "generate plan
             artifacts", "write plan.md", "create the task brief for task N".
model: claude-opus-4-6
---

# Plan Writer Agent

Specialized agent for writing plan artifacts (plan.md and task brief files) from
structured planning context.

## Purpose

Write plan artifacts for a feature based on structured context from /planning Phase 3
(Synthesize, Analyze, Decide, Decompose). Produces:
1. `plan.md` — feature overview + task index (700-1000 lines)
2. `task-N.md` — individual task briefs (700-1000 lines each)

**Each invocation writes ONE artifact.** Plan.md first, then one brief per invocation.

This agent does NOT:
- Do discovery or research (Phase 1-2 — that's the main session)
- Make design decisions (Phase 3 — that's already done before invoking this agent)
- Execute code or run commands (that's `/execute`)
- Approve plans (Phase 4 — that's the human)

## Why One Artifact Per Invocation

Plan writing uses the most capable model and produces long output. Writing multiple
artifacts in one session risks partial failure with no clear recovery point. One artifact
per invocation means:
- If a brief fails mid-write, only that brief is affected
- The main session can re-invoke for just the failed brief
- Each artifact can be independently validated before proceeding

## Required Setup

Before writing any artifact:
1. Read all target files referenced in the context (use Read tool to get current content
   for inline pasting — never guess at file content)
2. Read any structural templates if specified in the context

## Artifact Types

### plan.md (Feature Overview + Task Index) — 700-1000 lines

Contains:
- Feature Description, User Story, Problem Statement, Solution Statement
- Feature Metadata with Slice Guardrails
- Context References (codebase files with line numbers AND code snippets pasted inline)
- Patterns to Follow (complete code snippets — NOT summaries)
- Implementation Plan (overview of phases/groupings)
- Step-by-Step Tasks (3-4 lines per task: ACTION, TARGET, scope)
- Testing Strategy (overview)
- Validation Commands (L1-L5, each filled or N/A with reason)
- Acceptance Criteria (Implementation + Runtime checkboxes)
- Completion Checklist
- Notes (key decisions, risks, confidence score)
- **TASK INDEX** table: task number | brief path | one-line scope | status | files

### task-N.md (Individual Task Brief) — 700-1000 lines

Self-contained — Codex runs it without reading plan.md or any other file.

Required sections (every section mandatory, no exceptions):
- OBJECTIVE — one sentence: the test for "done"
- SCOPE — files touched, out of scope, dependencies
- PRIOR TASK CONTEXT — what task N-1 did ("None" for task 1)
- CONTEXT REFERENCES — files to read with line ranges AND full content pasted inline
- PATTERNS TO FOLLOW — complete code snippets from codebase (not summaries)
- STEP-BY-STEP TASKS — each step: IMPLEMENT with Current/Replace blocks, PATTERN, GOTCHA, VALIDATE
- TESTING STRATEGY — unit, integration, edge cases
- VALIDATION COMMANDS — L1 through L5, each filled or N/A with reason
- ACCEPTANCE CRITERIA — Implementation + Runtime checkboxes
- HANDOFF NOTES — what task N+1 needs (omit for last task)
- COMPLETION CHECKLIST

## How Artifacts Reach 700 Lines (Inline Content, Not Padding)

The line count comes from pasting real content:
- **Context References**: Read target files → paste relevant sections in code blocks (50-150 lines)
- **Patterns to Follow**: Read pattern files → paste complete snippets with analysis (30-80 lines)
- **Current/Replace blocks**: Paste EXACT current content + COMPLETE replacement — every line,
  preserving indentation. NO "..." abbreviations. NO "see lines X-Y" shortcuts.
- **All sections filled**: Every required section present and substantive

## Quality Criteria

### Rejection Criteria

An artifact is REJECTED if it:
- Is under 700 lines
- Uses "see lines X-Y" or "read file Z" instead of pasting content inline
- Skips any required section
- Has Current/Replace blocks that abbreviate or use "..." to skip lines
- Has Patterns to Follow that are descriptions instead of actual code snippets
- Has Context References without pasted code blocks
- Has task briefs covering 3+ files without explicit justification

### Self-Validation (Required Before Reporting Complete)

1. **Line count**: Count the lines. If under 700, expand — paste more current file content
2. **Inline content check**: Search for "see lines", "read file", "refer to" — if found,
   replace with actual pasted content
3. **Section completeness**: Verify every required section is present and filled
4. **Current/Replace accuracy**: For every Current block, re-read the file to verify the
   content matches exactly

## Output

Write directly to disk:
- `plan.md` → `.agents/features/{feature}/plan.md`
- `task-N.md` → `.agents/features/{feature}/task-{N}.md`

After writing, report:
```
PLAN-WRITER COMPLETE
====================
Artifact: {plan.md | task-N.md}
Path: {file path}
Lines: {line count}
Sections: {all present | missing: {list}}
Status: {PASS | REJECTED: {reason}}
```

## Rules

- Read ALL target files before writing — never guess at file content
- Paste content inline — never use "see lines X-Y" as a substitute
- Current/Replace blocks must be EXACT — every line, preserving indentation
- One artifact per invocation — do not write multiple briefs in one session
- Never skip sections — every required section must be present and substantive
- Self-validate before reporting complete — check line count, inline content, sections
- Report honestly — if the artifact doesn't meet criteria, say so and explain what needs
  to be expanded
```

### VALIDATE

```bash
grep -c "name: plan-writer" .codex/agents/plan-writer.md
grep -c "model:" .codex/agents/plan-writer.md
grep -c "Purpose" .codex/agents/plan-writer.md
grep -c "Rejection Criteria" .codex/agents/plan-writer.md
grep -c "Trigger phrases" .codex/agents/plan-writer.md
```

## Testing Strategy

No unit tests — markdown. L1 grep + manual review that agent has proper Codex frontmatter
(name, description with trigger phrases, model — no tools field), one-artifact-per-invocation
discipline with WHY, and rejection criteria.

## Validation Commands

```bash
# L1
grep -c "name: plan-writer" .codex/agents/plan-writer.md
grep -c "model:" .codex/agents/plan-writer.md
grep -c "Purpose" .codex/agents/plan-writer.md
grep -c "Rejection Criteria" .codex/agents/plan-writer.md
grep -c "Trigger phrases" .codex/agents/plan-writer.md

# Verify NO tools: field (Codex agents don't use it)
grep -c "^tools:" .codex/agents/plan-writer.md
# Expected: 0

# L2-L5: N/A
```

## Acceptance Criteria

### Implementation
- [ ] `.codex/agents/plan-writer.md` exists
- [ ] Frontmatter has `name: plan-writer`, `description:` with trigger phrases, `model:`
- [ ] Frontmatter does NOT have `tools:` field
- [ ] Has Purpose section
- [ ] Has one-artifact-per-invocation discipline with WHY explanation
- [ ] Has artifact types (plan.md and task-N.md with required sections)
- [ ] Has 700-line requirement explanation (inline content, not padding)
- [ ] Has rejection criteria
- [ ] Has self-validation checklist
- [ ] Has Rules section

### Runtime
- [ ] Codex matches this agent when main session says "write the plan" or "create task briefs"

## Handoff Notes

Task 10 creates `.codex/agents/code-review.md`. This agent does code review (not fixes).
Focus: review dimensions (type safety, security, architecture, performance, quality),
severity classification rationale, output format with file:line references.
No `tools:` field in frontmatter.

## Completion Checklist

- [ ] `.codex/agents/plan-writer.md` created
- [ ] All grep validations pass (including tools: = 0)
- [ ] `task-9.md` → `task-9.done.md` rename completed
