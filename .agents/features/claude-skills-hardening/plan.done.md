# Claude Skills Hardening — Implementation Plan

## Feature Description

Add `.claude/skills/{command}/SKILL.md` for each of the 11 pipeline commands that currently
lack one. Each skill is a knowledge framework that deepens Claude's reasoning for that pipeline
step — the command file is the procedural workflow, the skill file is the reasoning depth,
quality standards, and anti-patterns behind it. Only one skill exists today: `planning-methodology`.

## User Story

As a developer using this Claude Code system, I want every pipeline command to have a
corresponding skill file so that Claude has rich methodology knowledge loaded for each step,
not just procedural instructions — improving thinking quality across the entire pipeline.

## Problem Statement

Currently only `/planning` has a skill (`planning-methodology/SKILL.md`). The other 11 commands
run from command files alone, which provide steps but not deep reasoning context. This means
Claude lacks the "how to think" scaffolding for discovery sessions, review scoring, divergence
classification, and delivery operations.

## Solution Statement

Create one `.claude/skills/{command}/SKILL.md` per command following the established pattern
from `planning-methodology/SKILL.md`. Each skill encapsulates the methodology knowledge,
quality standards, anti-patterns, and key rules for its domain — giving Claude Code the
reasoning depth needed for each pipeline phase.

## Feature Metadata

- Feature: `claude-skills-hardening`
- Depth: standard
- Mode: Task Briefs (11 briefs)
- Dependencies: none — all source commands are fully readable
- Estimated tasks: 11

## Slice Guardrails

- One skill per task brief — no mixing
- Each skill must follow the YAML frontmatter + markdown pattern from `planning-methodology`
- Skills add reasoning DEPTH, not workflow duplication
- No changes to existing command files

---

## Context References

### Codebase Files

- `.claude/skills/planning-methodology/SKILL.md:1-224` — the canonical skill pattern to follow
- `.claude/commands/mvp.md:1-201` — MVP discovery methodology
- `.claude/commands/prd.md:1-406` — PRD structure and quality gates
- `.claude/commands/prime.md:1-320` — context loading + stack detection
- `.claude/commands/council.md:1-77` — multi-perspective discussion
- `.claude/commands/execute.md:1-449` — plan execution with divergence tracking
- `.claude/commands/code-review.md:1-240` — code review severity levels
- `.claude/commands/code-review-fix.md:1-218` — fix methodology
- `.claude/commands/code-loop.md:1-238` — automated fix loop
- `.claude/commands/system-review.md:1-407` — meta-analysis scoring
- `.claude/commands/commit.md:1-110` — conventional commit
- `.claude/commands/pr.md:1-291` — PR creation with cherry-pick isolation

### Memory References

- codex-integration feature: skills use YAML frontmatter (name, description) + markdown
- planning-methodology skill: added "knowledge framework" approach, not command mirror

---

## Patterns to Follow

### Pattern 1: Skill YAML Frontmatter

From `.claude/skills/planning-methodology/SKILL.md:1-6`:

```yaml
---
name: planning-methodology
description: Guide for systematic interactive planning with template-driven output and confidence scoring
license: MIT
compatibility: claude-code
---
```

Every skill must have: `name`, `description`, `license: MIT`, `compatibility: claude-code`.

### Pattern 2: Skill Structure

From `.claude/skills/planning-methodology/SKILL.md:8-224`:

```markdown
# {Title} — {Subtitle}

## When This Skill Applies
{conditions that trigger this skill}

## {Phase/Section 1}
{detailed methodology content}

## Key Rules
{numbered or bulleted rules}

## Related Commands
- `/{command}` — {what it does}
```

Each skill: title, when-applies, methodology sections, key rules, related commands.

### Pattern 3: Skills Add DEPTH, Not Duplication

The skill is NOT a copy of the command. It adds:
- Quality criteria (what "good" looks like)
- Anti-patterns (what to avoid)
- Reasoning scaffolding (how to think, not just what to do)
- Edge case guidance
- Cross-command context

---

## Implementation Plan

### Group 1: Discovery Phase Skills (Tasks 1-4)
MVP, PRD, Prime, Council — the thinking/discovery tools at the top of the pipeline.

### Group 2: Execution Phase Skills (Tasks 5-8)
Execute, Code Review, Code Review Fix, Code Loop — the implementation and quality tools.

### Group 3: Delivery Phase Skills (Tasks 9-11)
System Review, Commit, PR — the finalization and delivery tools.

---

## Step-by-Step Tasks

### Task 1: mvp skill
- **ACTION**: CREATE
- **TARGET**: `.claude/skills/mvp/SKILL.md`
- **IMPLEMENT**: Knowledge framework for Socratic discovery — one-question-at-a-time discipline,
  scope gate quality standards, what a good mvp.md looks like, anti-patterns (lists of questions,
  skipping scope gate, tech-first discovery)
- **VALIDATE**: `grep -c "name: mvp" .claude/skills/mvp/SKILL.md`

### Task 2: prd skill
- **ACTION**: CREATE
- **TARGET**: `.claude/skills/prd/SKILL.md`
- **IMPLEMENT**: Knowledge framework for PRD quality — spec lock importance, direction preview,
  backend design depth standards, what makes a PRD useful for planning vs. decorative
- **VALIDATE**: `grep -c "name: prd" .claude/skills/prd/SKILL.md`

### Task 3: prime skill
- **ACTION**: CREATE
- **TARGET**: `.claude/skills/prime/SKILL.md`
- **IMPLEMENT**: Knowledge framework for context loading — dirty state awareness, stack detection
  heuristics, handoff merge logic, config.md creation standards
- **VALIDATE**: `grep -c "name: prime" .claude/skills/prime/SKILL.md`

### Task 4: council skill
- **ACTION**: CREATE
- **TARGET**: `.claude/skills/council/SKILL.md`
- **IMPLEMENT**: Knowledge framework for multi-perspective reasoning — perspective selection
  quality, genuine argument discipline, synthesis vs. picking a winner, when to escalate
- **VALIDATE**: `grep -c "name: council" .claude/skills/council/SKILL.md`

### Task 5: execute skill
- **ACTION**: CREATE
- **TARGET**: `.claude/skills/execute/SKILL.md`
- **IMPLEMENT**: Knowledge framework for plan execution — divergence classification depth,
  self-review quality standards, validation pyramid discipline, one-brief-per-session rule
- **VALIDATE**: `grep -c "name: execute" .claude/skills/execute/SKILL.md`

### Task 6: code-review skill
- **ACTION**: CREATE
- **TARGET**: `.claude/skills/code-review/SKILL.md`
- **IMPLEMENT**: Knowledge framework for code review quality — severity classification guidance,
  what constitutes Critical vs Major vs Minor, review completeness standards, RAG integration
- **VALIDATE**: `grep -c "name: code-review" .claude/skills/code-review/SKILL.md`

### Task 7: code-review-fix skill
- **ACTION**: CREATE
- **TARGET**: `.claude/skills/code-review-fix/SKILL.md`
- **IMPLEMENT**: Knowledge framework for fix discipline — minimal change principle, severity
  ordering rationale, verification after each fix, scope discipline
- **VALIDATE**: `grep -c "name: code-review-fix" .claude/skills/code-review-fix/SKILL.md`

### Task 8: code-loop skill
- **ACTION**: CREATE
- **TARGET**: `.claude/skills/code-loop/SKILL.md`
- **IMPLEMENT**: Knowledge framework for automated fix loops — checkpoint discipline, escape
  hatch criteria (when to escalate to planning), loop exit conditions, completion sweep
- **VALIDATE**: `grep -c "name: code-loop" .claude/skills/code-loop/SKILL.md`

### Task 9: system-review skill
- **ACTION**: CREATE
- **TARGET**: `.claude/skills/system-review/SKILL.md`
- **IMPLEMENT**: Knowledge framework for meta-analysis — scoring methodology depth, divergence
  classification criteria, memory suggestion quality, process improvement specificity
- **VALIDATE**: `grep -c "name: system-review" .claude/skills/system-review/SKILL.md`

### Task 10: commit skill
- **ACTION**: CREATE
- **TARGET**: `.claude/skills/commit/SKILL.md`
- **IMPLEMENT**: Knowledge framework for conventional commits — type/scope selection guidance,
  artifact completion sweep discipline, scoped staging rationale, handoff write standards
- **VALIDATE**: `grep -c "name: commit" .claude/skills/commit/SKILL.md`

### Task 11: pr skill
- **ACTION**: CREATE
- **TARGET**: `.claude/skills/pr/SKILL.md`
- **IMPLEMENT**: Knowledge framework for PR creation — branch isolation rationale, cherry-pick
  scoping, PR body quality standards, report-driven scope detection
- **VALIDATE**: `grep -c "name: pr" .claude/skills/pr/SKILL.md`

---

## Testing Strategy

### L1 Validation (per task)
```bash
grep -c "name: {command}" .claude/skills/{command}/SKILL.md  # must return 1
grep -c "compatibility: claude-code" .claude/skills/{command}/SKILL.md  # must return 1
grep -c "## When This Skill Applies" .claude/skills/{command}/SKILL.md  # must return 1
grep -c "## Key Rules" .claude/skills/{command}/SKILL.md  # must return 1
```

### L2: File count check (after all tasks complete)
```bash
ls .claude/skills/*/SKILL.md | wc -l  # must return 12
```

### Edge Cases
- Skills must not simply mirror command files — they must add depth
- Each skill must be independently loadable (no cross-skill dependencies)
- YAML frontmatter must be valid (no missing fields)

---

## Validation Commands

```bash
# L1: Check all skills have correct frontmatter
grep -rn "compatibility: claude-code" .claude/skills/  # must return 12 lines

# L1: Check all skills have required sections
grep -rn "When This Skill Applies" .claude/skills/  # must return 12 lines

# L2: File count
ls .claude/skills/ | wc -l  # must return 12

# L3/L4: N/A — markdown files, no unit tests
# L5: Manual — read each skill and verify it adds depth beyond the command file
```

---

## Acceptance Criteria

### Implementation
- [ ] `.claude/skills/mvp/SKILL.md` created with valid frontmatter + methodology sections
- [ ] `.claude/skills/prd/SKILL.md` created with valid frontmatter + methodology sections
- [ ] `.claude/skills/prime/SKILL.md` created with valid frontmatter + methodology sections
- [ ] `.claude/skills/council/SKILL.md` created with valid frontmatter + methodology sections
- [ ] `.claude/skills/execute/SKILL.md` created with valid frontmatter + methodology sections
- [ ] `.claude/skills/code-review/SKILL.md` created with valid frontmatter + methodology sections
- [ ] `.claude/skills/code-review-fix/SKILL.md` created with valid frontmatter + methodology sections
- [ ] `.claude/skills/code-loop/SKILL.md` created with valid frontmatter + methodology sections
- [ ] `.claude/skills/system-review/SKILL.md` created with valid frontmatter + methodology sections
- [ ] `.claude/skills/commit/SKILL.md` created with valid frontmatter + methodology sections
- [ ] `.claude/skills/pr/SKILL.md` created with valid frontmatter + methodology sections
- [ ] Each skill has: name, description, license, compatibility fields in frontmatter
- [ ] Each skill has: When This Skill Applies, Key Rules, Related Commands sections
- [ ] No skill simply duplicates its command file — each adds reasoning depth

### Runtime
- [ ] Claude Code auto-loads skills when relevant command is invoked
- [ ] Skills provide richer context than commands alone for each pipeline step

---

## Completion Checklist

- [ ] All 11 task briefs complete
- [ ] All 11 SKILL.md files created
- [ ] All L1 validations pass
- [ ] report.md written
- [ ] Pipeline handoff updated

---

## Notes

- **Key decision**: Skills add DEPTH, not duplication. The command is the workflow; the skill
  is the reasoning knowledge framework behind it.
- **Confidence**: 9/10 — all source commands are readable, pattern is established, no
  external dependencies. Only risk is skills becoming command mirrors instead of knowledge frameworks.
- **Anti-pattern to avoid**: Don't write a skill that just rephrases the command steps. Each
  skill should contain things not in the command: quality criteria, anti-patterns, edge cases,
  cross-pipeline context.

---

## TASK INDEX

| Task | Brief Path | Scope | Status | Files |
|------|-----------|-------|--------|-------|
| 1 | `task-1.md` | Create `.claude/skills/mvp/SKILL.md` | pending | 1 created |
| 2 | `task-2.md` | Create `.claude/skills/prd/SKILL.md` | pending | 1 created |
| 3 | `task-3.md` | Create `.claude/skills/prime/SKILL.md` | pending | 1 created |
| 4 | `task-4.md` | Create `.claude/skills/council/SKILL.md` | pending | 1 created |
| 5 | `task-5.md` | Create `.claude/skills/execute/SKILL.md` | pending | 1 created |
| 6 | `task-6.md` | Create `.claude/skills/code-review/SKILL.md` | pending | 1 created |
| 7 | `task-7.md` | Create `.claude/skills/code-review-fix/SKILL.md` | pending | 1 created |
| 8 | `task-8.md` | Create `.claude/skills/code-loop/SKILL.md` | pending | 1 created |
| 9 | `task-9.md` | Create `.claude/skills/system-review/SKILL.md` | pending | 1 created |
| 10 | `task-10.md` | Create `.claude/skills/commit/SKILL.md` | pending | 1 created |
| 11 | `task-11.md` | Create `.claude/skills/pr/SKILL.md` | pending | 1 created |
