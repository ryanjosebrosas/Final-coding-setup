# Feature Plan: codex-integration

## Feature Description

Add a `.codex/` folder with native Codex CLI skills so OpenAI Codex CLI becomes a first-class
execution agent in this system. Additionally, fix `AGENTS.md` so all system instructions are
inlined (Codex cannot expand `@` includes — they appear as literal text, making sections invisible).

## User Story

As a developer using this system, I want to type `codex "execute the task brief"` or
`codex "prime me"` and have Codex CLI automatically load the right skill, understand the
PIV loop, Archon integration, and pipeline handoff conventions — so it acts as a reliable
execution agent without manual instruction.

## Problem Statement

1. Root `AGENTS.md` uses `@.claude/sections/...` syntax — this is Claude Code-specific.
   Codex reads `AGENTS.md` but does NOT expand `@` includes. The 6 core sections
   (architecture, PIV loop, context engineering, git save points, decision framework,
   Archon workflow) are invisible to Codex — it only sees the literal `@` strings.

2. No `.codex/skills/` folder exists. Codex has no skills for `execute`, `prime`, or
   `commit` — it must be told from scratch each session what the conventions are.

## Solution Statement

1. Replace the 6 `@` includes in `AGENTS.md` with inlined content from each section file.
   This makes `AGENTS.md` universally readable by Claude Code, OpenCode, AND Codex CLI.

2. Create `.codex/skills/` with three skills following the OpenAI Codex skill format
   (YAML frontmatter + markdown instructions):
   - `execute/SKILL.md` — read a task brief, implement it, mark done, update handoff
   - `prime/SKILL.md` — load project context, detect stack, surface pending work
   - `commit/SKILL.md` — create conventional commit, update handoff, update memory

## Feature Metadata

- **Type**: Infrastructure / DX improvement
- **Complexity**: Low-Medium (4 files, 1 modify + 3 create)
- **Risk**: Low — no source code touched, all config/instruction files
- **Mode**: Task Brief (4 tasks, 4 briefs)

### Slice Guardrails

- Do NOT modify any files in `.claude/` or `.opencode/` — they are separate tools
- Do NOT modify project source files
- Do NOT create `.codex/config.toml` — model config belongs in `~/.codex/config.toml` (global)
- Do NOT add Archon task tracking to skills — keep skills focused on execution workflow

---

## Context References

### File Being Modified

**`AGENTS.md`** (project root, 166 lines)
- Lines 1-28: Title + Core Methodology header with 6 @ includes
- Lines 30-132: Project Structure (Dynamic Content, Pipeline Handoff, Session Model)
- Lines 134-166: Manual Pipeline + Model Assignment + Key Commands table
- The 6 @ includes (lines 7, 11, 15, 19, 23, 27) reference:
  - `.claude/sections/01_core_principles.md` — 29 lines
  - `.claude/sections/02_piv_loop.md` — 36 lines
  - `.claude/sections/03_context_engineering.md` — 17 lines
  - `.claude/sections/04_git_save_points.md` — 9 lines
  - `.claude/sections/05_decision_framework.md` — 8 lines
  - `.claude/sections/06_archon_workflow.md` — 58 lines

### Section Files (content to inline)

**`01_core_principles.md`**: Architecture rule (Claude plans, Codex executes), hard rule
(planning before all implementation), model tiers (Opus/Sonnet/Haiku/Codex), YAGNI/KISS/DRY.

**`02_piv_loop.md`**: PIV loop definition, granularity principle, Layer 1+2 planning,
implementation rules (hand to Codex, mandatory planning), validation pyramid.

**`03_context_engineering.md`**: 4 pillars (Memory, RAG, Prompt Engineering, Task Management)
+ pillar-to-plan-section mapping table.

**`04_git_save_points.md`**: Commit plan before implementation, git stash on failure,
NEVER include Co-Authored-By in commits.

**`05_decision_framework.md`**: Proceed autonomously vs ask user criteria.

**`06_archon_workflow.md`**: RAG workflow (get sources, search, read), task tracking
(create project, create/update tasks), query optimization (2-5 keywords), fallback.

### Reference: Codex Skill Format (from openai/codex repo)

Skills live in `.codex/skills/{name}/SKILL.md` with YAML frontmatter:

```markdown
---
name: skill-name
description: When to auto-invoke this skill. Used by Codex to match user intent.
---

# Skill Title

## Objective
...

## Steps
...
```

Real examples from openai/codex:
- `.codex/skills/babysit-pr/SKILL.md` — complex multi-step skill with scripts
- `.codex/skills/test-tui/SKILL.md` — simple guidance skill

Key pattern: description field is the trigger — Codex reads it to decide when to auto-invoke
the skill. Keep description precise and action-verb-forward.

### Reference: Current Execute Command

`.claude/commands/execute.md` contains the full execute workflow (400 lines):
- Hard entry gate: verify plan file exists in `.agents/features/`
- Step 0.5: detect plan type (task brief / master plan / legacy)
- Step 1: read and understand the plan
- Step 1.5: RAG retrieval (Archon if connected)
- Step 2: execute tasks in order (with divergence classification)
- Step 2.6: task brief completion (mark done, write handoff)
- Steps 3-4: testing + validation
- Step 5: self-review (SELF-REVIEW SUMMARY format)
- Step 6.6: execution report (`report.md`)
- Step 6.7: pipeline handoff write (`next-command.md`)

### Reference: Current Prime Command

`.claude/commands/prime.md` (320 lines):
- Dirty state check (git status --short)
- Context mode detection (System vs Codebase)
- Stack auto-detection (package.json, pyproject.toml, Cargo.toml etc.)
- Config write/update (`.claude/config.md`)
- Pending work detection (handoff file + artifact scan)
- Report assembly

### Reference: Current Commit Command

`.claude/commands/commit.md` (110 lines):
- Review current state (git status, git diff HEAD)
- Generate conventional commit message (type(scope): description)
- Artifact completion sweep (rename .md → .done.md)
- Stage and commit (scoped, never git add -A)
- Pipeline handoff write (ready-for-pr status)
- Memory update (append session note)

---

## Patterns to Follow

### Codex Skill Frontmatter Pattern (from openai/codex)

```yaml
---
name: babysit-pr
description: Babysit a GitHub pull request after creation by continuously polling CI checks/workflow runs...
---
```

Rules:
- `name` = folder name (kebab-case)
- `description` = when to invoke (verb-forward, specific triggers listed)
- No other frontmatter fields needed

### AGENTS.md Inline Pattern

Replace:
```markdown
## Core Methodology

@.claude/sections/01_core_principles.md
```

With:
```markdown
## Core Methodology

**ARCHITECTURE — Claude Plans, Codex Executes** — ...
[full section content]
```

No `@` prefix, no file reference — just the raw content from the section file.

---

## Implementation Plan

### Phase 1: Fix AGENTS.md (Task 1)

Replace 6 `@` includes with inlined section content. The result is a single self-contained
markdown file that works identically for Claude Code (which reads inline content fine),
OpenCode, and Codex CLI.

### Phase 2: Create Codex Skills (Tasks 2-4)

Three skills in `.codex/skills/`:
- `execute/` — task brief execution skill
- `prime/` — context loading skill
- `commit/` — conventional commit skill

Each follows the OpenAI Codex skill format. Skills are distilled from the corresponding
`.claude/commands/` files but adapted for Codex's execution context (Codex uses shell
commands natively, is file-capable, runs in the repo).

---

## Step-by-Step Tasks

### Task 1: Inline AGENTS.md sections
- **ACTION**: UPDATE
- **TARGET**: `AGENTS.md` (project root)
- **IMPLEMENT**: Replace lines 5-27 (6 `@` include lines with section headers) with
  the full inlined content of all 6 section files. Preserve the rest of AGENTS.md
  (Project Structure, Pipeline, Model Assignment, Key Commands).
  Add a new section at the bottom referencing the `.codex/skills/` folder.
- **VALIDATE**: Read AGENTS.md and confirm no `@` characters remain in section headers.
  Confirm Archon workflow section is present inline.

### Task 2: Create execute skill
- **ACTION**: CREATE
- **TARGET**: `.codex/skills/execute/SKILL.md`
- **IMPLEMENT**: Codex skill that: (1) verifies plan file exists in `.agents/features/`,
  (2) detects plan type (task brief / master / legacy), (3) reads and executes ONE task
  brief per session, (4) runs validation commands, (5) writes `report.md`, (6) marks
  task as `task-N.done.md`, (7) updates pipeline handoff.
- **VALIDATE**: File exists at correct path. Frontmatter has `name: execute` and
  descriptive trigger in `description`.

### Task 3: Create prime skill
- **ACTION**: CREATE
- **TARGET**: `.codex/skills/prime/SKILL.md`
- **IMPLEMENT**: Codex skill that: (1) checks git dirty state, (2) reads `memory.md`
  if present, (3) reads `.claude/config.md` for validation commands, (4) scans
  `.agents/context/next-command.md` for pending work, (5) scans `.agents/features/`
  for artifact state, (6) reports current state + next action.
- **VALIDATE**: File exists. Frontmatter present with correct name and description.

### Task 4: Create commit skill
- **ACTION**: CREATE
- **TARGET**: `.codex/skills/commit/SKILL.md`
- **IMPLEMENT**: Codex skill that: (1) reviews `git status` + `git diff HEAD`,
  (2) generates conventional commit message (type(scope): description),
  (3) runs artifact completion sweep, (4) stages relevant files (never `git add -A`),
  (5) commits, (6) writes pipeline handoff with `ready-for-pr` status,
  (7) appends session note to `memory.md`.
- **VALIDATE**: File exists. Frontmatter present. Commit message format documented.

---

## Testing Strategy

**Manual (L5)** — no automated tests for markdown/instruction files:

1. After Task 1: Run `grep -n "@" AGENTS.md` — should return zero matches in section headers
2. After Task 2: Run `codex "execute the task brief at .agents/features/test/task-1.md"` —
   Codex should pick up the execute skill automatically
3. After Task 3: Run `codex "prime me"` — Codex should load context and show pending work
4. After Task 4: Run `codex "commit my changes"` — Codex should generate conventional commit

---

## Validation Commands

- **L1 Lint**: N/A — markdown files, no linter configured
- **L1 Format**: N/A
- **L2 Types**: N/A
- **L3 Unit Tests**: N/A
- **L4 Integration Tests**: Manual — invoke Codex CLI with each skill trigger phrase
- **L5 Manual**:
  - `grep -c "@\\.claude" AGENTS.md` → should output `0`
  - `test -f .codex/skills/execute/SKILL.md && echo OK`
  - `test -f .codex/skills/prime/SKILL.md && echo OK`
  - `test -f .codex/skills/commit/SKILL.md && echo OK`

---

## Acceptance Criteria

### Implementation

- [x] AGENTS.md contains no `@.claude/sections/` include references
- [x] AGENTS.md contains all 6 section contents inline (verify: grep for "ARCHITECTURE", "PIV", "Archon", "Git Save", "Decision Framework", "Context Engineering")
- [x] `.codex/skills/execute/SKILL.md` exists with valid YAML frontmatter
- [x] `.codex/skills/prime/SKILL.md` exists with valid YAML frontmatter
- [x] `.codex/skills/commit/SKILL.md` exists with valid YAML frontmatter
- [ ] `.codex/` folder is added to repo (not gitignored) — deferred to commit step

### Runtime

- [ ] Codex CLI reads AGENTS.md and understands the PIV loop + execution model
- [ ] `codex "execute the task brief"` auto-invokes the execute skill
- [ ] `codex "prime me"` auto-invokes the prime skill
- [ ] `codex "commit changes"` auto-invokes the commit skill
- [ ] Archon workflow instructions are visible to Codex (inline in AGENTS.md)

---

## Completion Checklist

- [x] Task 1 executed: AGENTS.md updated with inline sections
- [x] Task 2 executed: `.codex/skills/execute/SKILL.md` created
- [x] Task 3 executed: `.codex/skills/prime/SKILL.md` created
- [x] Task 4 executed: `.codex/skills/commit/SKILL.md` created
- [x] All acceptance criteria met
- [x] `plan.md` renamed to `plan.done.md` after all tasks done
- [x] Pipeline handoff updated

---

## Notes

- **Key decision**: Inline over `@` includes. Claude Code handles inline identically.
  The only downside is AGENTS.md grows from ~166 to ~280 lines — acceptable.
- **Confidence**: 9/10 — all files are instruction/config markdown, no code compilation
  or runtime dependencies. Risk is minimal.
- **Key risk**: Codex skill description matching — if descriptions are too vague, Codex
  may not auto-invoke. Mitigation: list multiple trigger phrases in the description.
- **Archon in skills**: Skills reference Archon but don't require it. "If Archon MCP
  connected, call rag_search_knowledge_base() first" pattern matches the existing system.

---

## TASK INDEX

| Task | Brief Path | Scope | Status | Files |
|------|-----------|-------|--------|-------|
| 1 | `task-1.md` | Inline 6 @ sections into AGENTS.md | pending | 0 created, 1 modified |
| 2 | `task-2.md` | Create .codex/skills/execute/SKILL.md | pending | 1 created, 0 modified |
| 3 | `task-3.md` | Create .codex/skills/prime/SKILL.md | pending | 1 created, 0 modified |
| 4 | `task-4.md` | Create .codex/skills/commit/SKILL.md | pending | 1 created, 0 modified |
