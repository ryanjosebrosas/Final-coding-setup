# Plan: codex-skills-hardening

## Feature Description

Add the 8 missing `.codex/skills/` knowledge files and create a new `.codex/agents/` directory
with 6 agent files. This gives Codex CLI full parity with the Claude system — every pipeline
command has a skill, and Codex has its own agent roster for subagent dispatch during execution.

## User Story

As a developer using Codex CLI, I want every pipeline command to have a skill file (so Codex
reasons about quality, not just workflow steps) and I want Codex to be able to invoke specialized
subagents (for research, review, and planning support) the same way Claude does.

## Problem Statement

Codex CLI currently has 5 skills: execute, prime, commit, code-review, code-loop. It has 13
commands total. The 8 missing skills mean Codex lacks quality reasoning for mvp, prd, planning,
council, code-review-fix, system-review, pr, and final-review. Additionally, no `.codex/agents/`
directory exists — Codex cannot dispatch subagents for parallel research or specialized review.

## Solution Statement

Create `.codex/skills/{name}/SKILL.md` for each of the 8 missing commands, following the
existing Codex skill pattern (YAML frontmatter with name + description trigger phrases, markdown
with When to Use, workflow steps, Key Rules). Create `.codex/agents/` with 6 agent files adapted
from `.claude/agents/` — same roles, Codex-compatible frontmatter (no tools: field, description
trigger phrases for Codex matching).

---

## Feature Metadata

- **Feature slug**: `codex-skills-hardening`
- **Directory**: `.agents/features/codex-skills-hardening/`
- **Total tasks**: 14 (8 skills + 6 agents)
- **Slice guardrail**: One file per task — do not combine skills or agents in a single task
- **Out of scope**: `.claude/skills/` (separate feature), `.opencode/commands/` (not modified)

---

## Context References

### Existing Codex Skill Pattern: `.codex/skills/execute/SKILL.md` (key structure)

```markdown
---
name: execute
description: Execute a task brief from .agents/features/ to implement a planned feature.
             Use when the user asks to execute a task brief, implement a plan, run a task,
             work on the next task, or implement a feature. Trigger phrases include:
             "execute task", "implement the plan", "run the task brief",
             "execute .agents/features/", "work on task N", "implement task brief at...",
             "run the next task", "implement the next task".
---

# Execute: Implement from Task Brief

## When to Use This Skill

Use this skill whenever the user asks you to implement something from a plan file in
`.agents/features/`. This is the **execution slot** in the Claude Plans → Codex Executes
pipeline.

## Entry Gate (Non-Skippable)
...

## Key Rules

- ONE task brief per session — never loop through all briefs automatically
- Never implement without a plan file under `.agents/features/`
- Never mark a task done without running validation
- Never include `Co-Authored-By` in git commits
```

Note the frontmatter pattern:
- `name:` — short identifier
- `description:` — multi-line, includes trigger phrases that Codex matches on

### Existing Claude Agent Pattern: `.claude/agents/plan-writer.md` (frontmatter)

```markdown
---
name: plan-writer
description: Writes structured plan artifacts (plan.md and task-N.md briefs) from a synthesised design. Use when /planning is ready to produce output.
model: opus
tools: Read, Grep, Glob, Bash, Write
---
```

### Codex Agent Frontmatter Adaptation

Codex agents drop `tools:` (Codex manages tool availability) and use description trigger phrases:

```markdown
---
name: research-codebase
description: Explores the codebase to find patterns, integration points, and conventions.
             Use when planning needs codebase context. Trigger phrases: "search the codebase",
             "find files related to", "look for patterns in", "explore the codebase".
model: haiku
---
```

### Pipeline Commands → Skills Mapping

| Command | Skill to Create | Key Focus |
|---------|----------------|-----------|
| mvp | `.codex/skills/mvp/SKILL.md` | Socratic discovery, scope discipline, one-question-at-a-time |
| prd | `.codex/skills/prd/SKILL.md` | Spec lock, direction preview, Section 8 depth standards |
| planning | `.codex/skills/planning/SKILL.md` | Discovery-first, task decomposition quality, brief standards |
| council | `.codex/skills/council/SKILL.md` | Perspective distinctness, genuine argument discipline |
| code-review-fix | `.codex/skills/code-review-fix/SKILL.md` | Minimal change, severity ordering, per-fix verification |
| system-review | `.codex/skills/system-review/SKILL.md` | Process vs code, scoring judgment, memory suggestion quality |
| pr | `.codex/skills/pr/SKILL.md` | Branch isolation, cherry-pick scoping, PR body quality |
| final-review | `.codex/skills/final-review/SKILL.md` | Approval gate discipline, criteria verification, verdict standards |

### Agents to Create → `.codex/agents/`

| Agent | Source | Role |
|-------|--------|------|
| `plan-writer.md` | `.claude/agents/plan-writer.md` | Writes plan.md + task briefs |
| `code-review.md` | `.claude/agents/code-review.md` | Comprehensive code review |
| `planning-research.md` | `.claude/agents/planning-research.md` | Past plans + RAG search |
| `research-codebase.md` | `.claude/agents/research-codebase.md` | Codebase exploration |
| `research-external.md` | `.claude/agents/research-external.md` | External docs search |
| `archon-retrieval.md` | `.claude/agents/archon-retrieval.md` | RAG + task tracking |

---

## Patterns to Follow

### Pattern 1: Codex Skill Frontmatter

```yaml
---
name: {skill-name}
description: {one-line purpose}.
             Use when {trigger context}. Trigger phrases include:
             "{phrase 1}", "{phrase 2}", "{phrase 3}".
---
```

Key: description is multi-line, ends with trigger phrases. No license/compatibility fields
(unlike .claude/skills/ which uses those). Just name + description.

### Pattern 2: Codex Skill Body Structure

From `.codex/skills/prime/SKILL.md`:
```markdown
# Prime: Load Project Context

## When to Use This Skill

Use this skill at the START of every Codex session before doing any implementation work.

## Step 0: Check Git State
...

## Key Notes

- This skill is READ-ONLY — it does not modify files, commit, or start implementation
- Always run at session start before any work (ABP — Always Be Priming)
```

Pattern: `# {Title}` → `## When to Use This Skill` → numbered Steps → `## Key Rules` or `## Key Notes`

### Pattern 3: Codex Agent Frontmatter (adapted from Claude)

Claude agent: `name, description, model, tools`
Codex agent: `name, description, model` (drop `tools:`)

```yaml
---
name: research-codebase
description: Explores the codebase to find patterns, integration points, and conventions
             relevant to a feature. Use during /planning phase. Trigger phrases: "search codebase",
             "find patterns", "explore project structure", "find integration points".
model: haiku
---
```

### Pattern 4: Skills add DEPTH, not workflow duplication

From `.codex/skills/execute/SKILL.md`:
- Command tells WHAT to do (workflow steps)
- Skill tells HOW TO THINK (quality criteria, entry gates, divergence classification)

Skills must cover quality standards that aren't in the command file.

---

## Implementation Plan

**Group 1 — Skills (Tasks 1-8)**: One skill file per command, in pipeline order.
Skills are independent of each other — each brief is self-contained.

**Group 2 — Agents (Tasks 9-14)**: Create `.codex/agents/` directory + 6 agent files.
Each agent adapts its `.claude/agents/` source with Codex-compatible frontmatter.

---

## Step-by-Step Tasks (Summary)

### Task 1 — CREATE `.codex/skills/mvp/SKILL.md`
- ACTION: CREATE
- TARGET: `.codex/skills/mvp/SKILL.md`
- IMPLEMENT: Codex skill for big-idea discovery. Frontmatter with trigger phrases ("define MVP",
  "what should I build", "help me discover my product idea"). Body: When to Use, Socratic
  questioning discipline, scope gate, mvp.md quality standards, Key Rules.
- VALIDATE: `grep -c "name: mvp" .codex/skills/mvp/SKILL.md` → 1

### Task 2 — CREATE `.codex/skills/prd/SKILL.md`
- ACTION: CREATE
- TARGET: `.codex/skills/prd/SKILL.md`
- IMPLEMENT: Codex skill for PRD creation. Trigger phrases ("create PRD", "write product spec",
  "product requirements"). Body: Spec Lock + Direction Preview gates, Section 8 depth standards,
  quality checks before writing.
- VALIDATE: `grep -c "name: prd" .codex/skills/prd/SKILL.md` → 1

### Task 3 — CREATE `.codex/skills/planning/SKILL.md`
- ACTION: CREATE
- TARGET: `.codex/skills/planning/SKILL.md`
- IMPLEMENT: Codex skill for interactive planning. Trigger phrases ("plan a feature", "create
  implementation plan", "break down a feature"). Body: Discovery-first, task decomposition
  quality, brief writing standards (700 lines, inline content), pipeline handoff.
- VALIDATE: `grep -c "name: planning" .codex/skills/planning/SKILL.md` → 1

### Task 4 — CREATE `.codex/skills/council/SKILL.md`
- ACTION: CREATE
- TARGET: `.codex/skills/council/SKILL.md`
- IMPLEMENT: Codex skill for multi-perspective discussions. Trigger phrases ("council",
  "get multiple perspectives", "debate this topic"). Body: perspective selection quality,
  genuine argument discipline, analysis, synthesis standards.
- VALIDATE: `grep -c "name: council" .codex/skills/council/SKILL.md` → 1

### Task 5 — CREATE `.codex/skills/code-review-fix/SKILL.md`
- ACTION: CREATE
- TARGET: `.codex/skills/code-review-fix/SKILL.md`
- IMPLEMENT: Codex skill for applying review fixes. Trigger phrases ("fix review issues",
  "apply code review fixes", "fix issues from review"). Body: hard entry gate, minimal change
  principle, severity ordering rationale, per-fix verification, scope discipline.
- VALIDATE: `grep -c "name: code-review-fix" .codex/skills/code-review-fix/SKILL.md` → 1

### Task 6 — CREATE `.codex/skills/system-review/SKILL.md`
- ACTION: CREATE
- TARGET: `.codex/skills/system-review/SKILL.md`
- IMPLEMENT: Codex skill for meta-analysis. Trigger phrases ("system review", "review the
  process", "analyze plan adherence"). Body: process vs code distinction, scoring judgment,
  divergence classification, memory suggestion quality.
- VALIDATE: `grep -c "name: system-review" .codex/skills/system-review/SKILL.md` → 1

### Task 7 — CREATE `.codex/skills/pr/SKILL.md`
- ACTION: CREATE
- TARGET: `.codex/skills/pr/SKILL.md`
- IMPLEMENT: Codex skill for PR creation. Trigger phrases ("create PR", "open pull request",
  "push and create PR"). Body: branch isolation rationale, cherry-pick scoping, PR body quality
  standards, conflict handling.
- VALIDATE: `grep -c "name: pr" .codex/skills/pr/SKILL.md` → 1

### Task 8 — CREATE `.codex/skills/final-review/SKILL.md`
- ACTION: CREATE
- TARGET: `.codex/skills/final-review/SKILL.md`
- IMPLEMENT: Codex skill for pre-commit approval gate. Trigger phrases ("final review",
  "pre-commit review", "review before commit"). Body: gate discipline, criteria verification
  standards, verdict quality, no-auto-commit rule.
- VALIDATE: `grep -c "name: final-review" .codex/skills/final-review/SKILL.md` → 1

### Task 9 — CREATE `.codex/agents/plan-writer.md`
- ACTION: CREATE
- TARGET: `.codex/agents/plan-writer.md`
- IMPLEMENT: Adapt `.claude/agents/plan-writer.md` for Codex. Drop `tools:` field. Add trigger
  phrases to description. Keep all content: Purpose, Required Setup, Artifact Types, Writing
  Process, Quality Criteria, Self-Validation, Output, Rules.
- VALIDATE: `grep -c "name: plan-writer" .codex/agents/plan-writer.md` → 1

### Task 10 — CREATE `.codex/agents/code-review.md`
- ACTION: CREATE
- TARGET: `.codex/agents/code-review.md`
- IMPLEMENT: Adapt `.claude/agents/code-review.md` for Codex. Drop `tools:` field. Add trigger
  phrases. Keep all content: Review Dimensions, Severity Levels, Output Format, Rules.
- VALIDATE: `grep -c "name: code-reviewer" .codex/agents/code-review.md` → 1

### Task 11 — CREATE `.codex/agents/planning-research.md`
- ACTION: CREATE
- TARGET: `.codex/agents/planning-research.md`
- IMPLEMENT: Adapt `.claude/agents/planning-research.md` for Codex. Drop `tools:` field.
  Add trigger phrases. Keep all content: Purpose, Capabilities, Instructions, Output Format, Rules.
- VALIDATE: `grep -c "name: planning-research" .codex/agents/planning-research.md` → 1

### Task 12 — CREATE `.codex/agents/research-codebase.md`
- ACTION: CREATE
- TARGET: `.codex/agents/research-codebase.md`
- IMPLEMENT: Adapt `.claude/agents/research-codebase.md` for Codex. Drop `tools:` field.
  Add trigger phrases. Keep all content: Purpose, Capabilities, Instructions, Output Format, Rules.
- VALIDATE: `grep -c "name: research-codebase" .codex/agents/research-codebase.md` → 1

### Task 13 — CREATE `.codex/agents/research-external.md`
- ACTION: CREATE
- TARGET: `.codex/agents/research-external.md`
- IMPLEMENT: Adapt `.claude/agents/research-external.md` for Codex. Drop `tools:` field.
  Add trigger phrases. Keep all content: Purpose, Capabilities, Instructions, Output Format, Rules.
- VALIDATE: `grep -c "name: research-external" .codex/agents/research-external.md` → 1

### Task 14 — CREATE `.codex/agents/archon-retrieval.md`
- ACTION: CREATE
- TARGET: `.codex/agents/archon-retrieval.md`
- IMPLEMENT: Adapt `.claude/agents/archon-retrieval.md` for Codex. Drop `tools:` field.
  Add trigger phrases. Keep all content: Rules, Workflow, Output Format.
- VALIDATE: `grep -c "name: archon-retrieval" .codex/agents/archon-retrieval.md` → 1

---

## Testing Strategy

All files are markdown. Testing is structural:
- L1: `grep -c "name: {skill}"` returns 1 for each file
- L1: required sections present (When to Use, Key Rules for skills; Purpose, Instructions for agents)
- L2: Manual review that skills add depth beyond commands (not just workflow duplication)

---

## Validation Commands

```bash
# L1: All 8 skills exist
ls .codex/skills/mvp/SKILL.md .codex/skills/prd/SKILL.md .codex/skills/planning/SKILL.md \
   .codex/skills/council/SKILL.md .codex/skills/code-review-fix/SKILL.md \
   .codex/skills/system-review/SKILL.md .codex/skills/pr/SKILL.md \
   .codex/skills/final-review/SKILL.md

# L1: All 6 agents exist
ls .codex/agents/plan-writer.md .codex/agents/code-review.md \
   .codex/agents/planning-research.md .codex/agents/research-codebase.md \
   .codex/agents/research-external.md .codex/agents/archon-retrieval.md

# L1: Skills have correct frontmatter
grep -rn "^name:" .codex/skills/
# Expected: 13 total (5 existing + 8 new)

# L1: Agents have correct frontmatter (no tools: field)
grep -rn "^name:" .codex/agents/
# Expected: 6

# L2-L5: N/A — markdown files
```

---

## Acceptance Criteria

### Implementation

- [ ] `.codex/skills/mvp/SKILL.md` exists with correct frontmatter and trigger phrases
- [ ] `.codex/skills/prd/SKILL.md` exists with correct frontmatter and trigger phrases
- [ ] `.codex/skills/planning/SKILL.md` exists with correct frontmatter and trigger phrases
- [ ] `.codex/skills/council/SKILL.md` exists with correct frontmatter and trigger phrases
- [ ] `.codex/skills/code-review-fix/SKILL.md` exists with correct frontmatter and trigger phrases
- [ ] `.codex/skills/system-review/SKILL.md` exists with correct frontmatter and trigger phrases
- [ ] `.codex/skills/pr/SKILL.md` exists with correct frontmatter and trigger phrases
- [ ] `.codex/skills/final-review/SKILL.md` exists with correct frontmatter and trigger phrases
- [ ] `.codex/agents/` directory exists
- [ ] `.codex/agents/plan-writer.md` exists — adapted from Claude, no tools: field
- [ ] `.codex/agents/code-review.md` exists — adapted from Claude, no tools: field
- [ ] `.codex/agents/planning-research.md` exists — adapted from Claude, no tools: field
- [ ] `.codex/agents/research-codebase.md` exists — adapted from Claude, no tools: field
- [ ] `.codex/agents/research-external.md` exists — adapted from Claude, no tools: field
- [ ] `.codex/agents/archon-retrieval.md` exists — adapted from Claude, no tools: field

### Runtime

- [ ] Codex CLI matches skills by description trigger phrases
- [ ] All skills add reasoning depth beyond their corresponding command files

---

## Completion Checklist

- [ ] All 8 skill files created
- [ ] All 6 agent files created
- [ ] All L1 grep validations pass
- [ ] plan.md → plan.done.md after all 14 tasks complete

---

## Notes

- Skills use Codex frontmatter (name + description only, no license/compatibility)
- Agents drop `tools:` from Claude agent frontmatter — Codex manages tool availability
- Agent content is preserved — same Purpose, Instructions, Output Format, Rules
- Feature runs parallel to `claude-skills-hardening` (different target directories)
- Confidence: 9/10 — all patterns are established and well-understood

---

## TASK INDEX

| Task | Brief Path | Scope | Status | Files |
|------|-----------|-------|--------|-------|
| 1 | `task-1.md` | Create `.codex/skills/mvp/SKILL.md` | pending | 1 created |
| 2 | `task-2.md` | Create `.codex/skills/prd/SKILL.md` | pending | 1 created |
| 3 | `task-3.md` | Create `.codex/skills/planning/SKILL.md` | pending | 1 created |
| 4 | `task-4.md` | Create `.codex/skills/council/SKILL.md` | pending | 1 created |
| 5 | `task-5.md` | Create `.codex/skills/code-review-fix/SKILL.md` | pending | 1 created |
| 6 | `task-6.md` | Create `.codex/skills/system-review/SKILL.md` | pending | 1 created |
| 7 | `task-7.md` | Create `.codex/skills/pr/SKILL.md` | pending | 1 created |
| 8 | `task-8.md` | Create `.codex/skills/final-review/SKILL.md` | pending | 1 created |
| 9 | `task-9.md` | Create `.codex/agents/plan-writer.md` | pending | 1 created |
| 10 | `task-10.md` | Create `.codex/agents/code-review.md` | pending | 1 created |
| 11 | `task-11.md` | Create `.codex/agents/planning-research.md` | pending | 1 created |
| 12 | `task-12.md` | Create `.codex/agents/research-codebase.md` | pending | 1 created |
| 13 | `task-13.md` | Create `.codex/agents/research-external.md` | pending | 1 created |
| 14 | `task-14.md` | Create `.codex/agents/archon-retrieval.md` | pending | 1 created |
