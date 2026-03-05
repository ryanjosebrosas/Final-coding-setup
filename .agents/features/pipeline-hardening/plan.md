# pipeline-hardening — Plan

## Feature Description

Close all gaps in the AI coding system's commands, skills, and infrastructure. This includes adding missing Pipeline Position sections to commands, creating missing skill files for orphan commands, mirroring skills to OpenCode platform, fixing compatibility fields, removing deprecated references, and creating a missing reference document.

## User Story

As a developer using this AI coding system, I want every command to have complete documentation (Pipeline Position section), every command to have a corresponding skill file (quality framework), both platforms (Claude and OpenCode) to have full skill coverage, and all deprecated references removed — so that the system is consistent, complete, and maintainable.

## Problem Statement

The system has accumulated gaps:
- 12 commands missing the standard `## Pipeline Position` section
- 5 commands without corresponding skill files (final-review, validation/*)
- 9 skills missing from `.opencode/skills/` (platform coverage gap)
- 4 skills in `.opencode` with incorrect `compatibility` field
- 1 deprecated `/build` reference in planning-methodology skill
- 1 missing reference file (`model-strategy.md`)

These gaps create inconsistency, reduce discoverability, and break platform parity.

## Solution Statement

Systematic hardening in 6 tasks:
1. Add Pipeline Position section to all commands missing it
2. Create skill files for orphan commands (final-review, validation/*)
3. Mirror all skills from `.claude` to `.opencode` for platform parity
4. Fix compatibility fields in OpenCode skills
5. Remove deprecated `/build` references
6. Create missing `model-strategy.md` reference document

---

## Feature Metadata

- **Feature Slug**: `pipeline-hardening`
- **Pipeline Position**: Standalone maintenance (not in feature pipeline)
- **Task Count**: 6
- **Execution Model**: Sonnet inline (documentation changes, no code)
- **Confidence**: 9/10

### Slice Guardrails

- Scope IN: `.claude/commands/`, `.opencode/commands/`, `.claude/skills/`, `.opencode/skills/`, `.claude/reference/`
- Scope OUT: `.claude/templates/`, `.claude/agents/`, `.claude/sections/`, any source code files
- If any task touches files outside the scope list → STOP and flag divergence

---

## Context References

### Commands Missing Pipeline Position (12 files)

From research agent findings:
- `.claude/commands/prime.md` — Has "Step 0: Dirty State Check" as first section, no Pipeline Position
- `.claude/commands/commit.md` — Has "Files to Commit" as first section, no Pipeline Position
- `.claude/commands/council.md` — Has "How It Works" section, no Pipeline Position
- `.claude/commands/execute.md` — Has "Hard Entry Gate" section, no Pipeline Position
- `.claude/commands/code-loop.md` — Has "Purpose" section, no Pipeline Position
- `.claude/commands/final-review.md` — Has "Workflow position" text but not formatted as section
- `.claude/commands/pr.md` — Needs verification
- `.claude/commands/system-review.md` — Has "Purpose" section, no Pipeline Position
- `.claude/commands/validation/code-review.md` — Has "Core Principles", no Pipeline Position
- `.claude/commands/validation/code-review-fix.md` — No Pipeline Position
- `.claude/commands/validation/system-review.md` — Has "Purpose" section, no Pipeline Position
- `.claude/commands/validation/execution-report.md` — No Pipeline Position

Mirror files exist in `.opencode/commands/` — all must be updated identically.

### Commands Without Skills (5 files)

- `.claude/commands/final-review.md` — No `.claude/skills/final-review/SKILL.md`
- `.claude/commands/validation/code-review.md` — No corresponding skill
- `.claude/commands/validation/code-review-fix.md` — No corresponding skill
- `.claude/commands/validation/system-review.md` — No corresponding skill
- `.claude/commands/validation/execution-report.md` — No corresponding skill

### Skills Missing in OpenCode (9 files)

From `.claude/skills/` that have no counterpart in `.opencode/skills/`:
- `prime/SKILL.md`
- `council/SKILL.md`
- `execute/SKILL.md`
- `code-review/SKILL.md`
- `code-review-fix/SKILL.md`
- `code-loop/SKILL.md`
- `system-review/SKILL.md`
- `commit/SKILL.md`
- `pr/SKILL.md`

### OpenCode Skills with Wrong Compatibility (4 files)

From `.opencode/skills/*/SKILL.md`:
- `mvp/SKILL.md` — Has `compatibility: claude-code`, should be `compatibility: opencode`
- `prd/SKILL.md` — Has `compatibility: claude-code`, should be `compatibility: opencode`
- `pillars/SKILL.md` — Has `compatibility: claude-code`, should be `compatibility: opencode`
- `decompose/SKILL.md` — Has `compatibility: claude-code`, should be `compatibility: opencode`

### Deprecated Reference

- `.claude/skills/planning-methodology/SKILL.md:223` — References `/build [spec]` as Related Commands
- `.claude/commands/prime.md:201` — Status value "build-loop-continuing" references deprecated `/build`

### Missing Reference File

- `.claude/reference/model-strategy.md` — Listed in `file-structure.md` but file does not exist

---

## Patterns to Follow

### Pattern 1: Pipeline Position Section Format

From `.claude/commands/code-review.md:38`:

```markdown
## Pipeline Position

```
/prime → /planning → /execute → /code-review (this) → /code-loop → /commit → /pr
```

This command runs after implementation to review code quality. Reads changed files from git diff. Output feeds `/code-review-fix` for issue resolution.
```

**Apply this pattern**: Every command needs a `## Pipeline Position` section with:
1. A code block showing the pipeline flow with `(this)` marking the current command
2. A one-sentence description of when it runs and what it does
3. What it reads and what it outputs

### Pattern 2: Skill File Structure

From `.claude/skills/mvp/SKILL.md`:

```yaml
---
name: mvp
description: Knowledge framework for big-idea discovery using Socratic questioning and scope discipline
license: MIT
compatibility: claude-code
---

# MVP Discovery — Socratic Methodology

This skill provides the reasoning framework for running effective big-idea discovery sessions.
It complements the `/mvp` command — the command provides the workflow steps, this skill
provides the quality standards and thinking discipline behind them.

## When This Skill Applies

- User says "I have an idea", "help me define my product", "what should I build"
- `/mvp` command is invoked
- Existing `mvp.md` needs revision or validation
- Discovery conversation needs grounding before `/prd` can run

## Discovery Quality Standards
...

## Anti-Patterns
...

## Key Rules
...

## Related Commands
...
```

**Apply this pattern**: Every skill needs:
1. YAML frontmatter with `name`, `description`, `license`, `compatibility`
2. Title with em-dash subtitle
3. Introduction paragraph explaining command vs skill relationship
4. `## When This Skill Applies` section
5. Core methodology sections
6. `## Anti-Patterns` section
7. `## Key Rules` section (numbered list)
8. `## Related Commands` section

### Pattern 3: OpenCode Skill Compatibility

From `.opencode/skills/planning-methodology/SKILL.md`:

```yaml
---
name: planning-methodology
description: Guide for systematic interactive planning with template-driven output and confidence scoring
license: MIT
compatibility: opencode
---
```

**Apply this pattern**: All `.opencode/skills/` files must have `compatibility: opencode`, NOT `compatibility: claude-code`.

---

## Implementation Plan

### Phase 1: Command Standardization (Tasks 1)
Add Pipeline Position section to 12 commands in both `.claude` and `.opencode` directories.

### Phase 2: Skill Coverage (Tasks 2-4)
Create missing skill files, mirror to OpenCode, fix compatibility fields.

### Phase 3: Cleanup (Tasks 5-6)
Remove deprecated references, create missing reference document.

---

## Step-by-Step Tasks

### Task 1: Add Pipeline Position to Commands

**ACTION**: UPDATE
**TARGET**: 24 files (12 in `.claude/commands/`, 12 in `.opencode/commands/`)
**SCOPE**: Add `## Pipeline Position` section to commands missing it

For each command file missing Pipeline Position:
1. Determine where in the pipeline the command fits
2. Add `## Pipeline Position` section after frontmatter, before first content section
3. Include code block with pipeline flow showing `(this)` marker
4. Add one-sentence description of command's role
5. Mirror the change to the corresponding `.opencode/commands/` file

**VALIDATE**:
```bash
# L1: All modified files are valid markdown
grep -c '```' .claude/commands/prime.md .claude/commands/commit.md .claude/commands/council.md .claude/commands/execute.md .claude/commands/code-loop.md .claude/commands/final-review.md .claude/commands/pr.md .claude/commands/system-review.md .claude/commands/validation/code-review.md .claude/commands/validation/code-review-fix.md .claude/commands/validation/system-review.md .claude/commands/validation/execution-report.md

# L2: Pipeline Position section present in all modified files
grep -l "## Pipeline Position" .claude/commands/prime.md .claude/commands/commit.md .claude/commands/council.md .claude/commands/execute.md .claude/commands/code-loop.md .claude/commands/final-review.md .claude/commands/pr.md .claude/commands/system-review.md .claude/commands/validation/*.md

# L4: Mirror sync - .opencode files match .claude files
diff .claude/commands/prime.md .opencode/commands/prime.md
diff .claude/commands/commit.md .opencode/commands/commit.md
# ... repeat for all 12 files
```

---

### Task 2: Create Missing Skill Files

**ACTION**: CREATE
**TARGET**: 5 new skill directories in `.claude/skills/`
**SCOPE**: Create SKILL.md for final-review and validation subdirectory commands

Create skill files for:
1. `.claude/skills/final-review/SKILL.md` — Knowledge framework for pre-commit approval gate
2. `.claude/skills/validation/code-review/SKILL.md` — Knowledge framework for validation code review
3. `.claude/skills/validation/code-review-fix/SKILL.md` — Knowledge framework for validation fix command
4. `.claude/skills/validation/system-review/SKILL.md` — Knowledge framework for validation system review
5. `.claude/skills/validation/execution-report/SKILL.md` — Knowledge framework for execution report generation

Each skill file follows Pattern 2 (see above) with appropriate content for the command.

**VALIDATE**:
```bash
# L1: All skill files are valid markdown
for f in .claude/skills/final-review/SKILL.md .claude/skills/validation/*/SKILL.md; do echo "$f: $(grep -c '```' $f) code fences"; done

# L2: All skill files have required sections
for f in .claude/skills/final-review/SKILL.md .claude/skills/validation/*/SKILL.md; do echo "=== $f ==="; grep "^## " $f | head -6; done

# L3: All skill files have correct frontmatter
for f in .claude/skills/final-review/SKILL.md .claude/skills/validation/*/SKILL.md; do echo "$f:"; head -6 $f; done
```

---

### Task 3: Mirror Skills to OpenCode

**ACTION**: CREATE
**TARGET**: 9 new skill directories in `.opencode/skills/`
**SCOPE**: Copy skills from `.claude/skills/` to `.opencode/skills/`

Mirror these skill directories:
1. `prime/` — Context loading skill
2. `council/` — Multi-perspective reasoning skill
3. `execute/` — Plan execution skill
4. `code-review/` — Code review skill
5. `code-review-fix/` — Fix discipline skill
6. `code-loop/` — Review-fix loop skill
7. `system-review/` — Meta-analysis skill
8. `commit/` — Conventional commit skill
9. `pr/` — PR creation skill

For each skill:
1. Create the directory in `.opencode/skills/`
2. Copy SKILL.md from `.claude/skills/{name}/SKILL.md` to `.opencode/skills/{name}/SKILL.md`
3. Change `compatibility: claude-code` to `compatibility: opencode` in the copied file

**VALIDATE**:
```bash
# L2: All 9 skill directories exist in .opencode/skills/
ls -d .opencode/skills/prime .opencode/skills/council .opencode/skills/execute .opencode/skills/code-review .opencode/skills/code-review-fix .opencode/skills/code-loop .opencode/skills/system-review .opencode/skills/commit .opencode/skills/pr

# L3: All copied skills have compatibility: opencode
grep -l "compatibility: opencode" .opencode/skills/prime/SKILL.md .opencode/skills/council/SKILL.md .opencode/skills/execute/SKILL.md .opencode/skills/code-review/SKILL.md .opencode/skills/code-review-fix/SKILL.md .opencode/skills/code-loop/SKILL.md .opencode/skills/system-review/SKILL.md .opencode/skills/commit/SKILL.md .opencode/skills/pr/SKILL.md
```

---

### Task 4: Fix Compatibility Fields

**ACTION**: UPDATE
**TARGET**: 4 files in `.opencode/skills/`
**SCOPE**: Change `compatibility: claude-code` to `compatibility: opencode`

Fix these files:
1. `.opencode/skills/mvp/SKILL.md` — Line 5
2. `.opencode/skills/prd/SKILL.md` — Line 5
3. `.opencode/skills/pillars/SKILL.md` — Line 5
4. `.opencode/skills/decompose/SKILL.md` — Line 5

**VALIDATE**:
```bash
# L3: All 4 files have correct compatibility
grep "compatibility:" .opencode/skills/mvp/SKILL.md .opencode/skills/prd/SKILL.md .opencode/skills/pillars/SKILL.md .opencode/skills/decompose/SKILL.md
# Expected: all should show "compatibility: opencode"
```

---

### Task 5: Remove Deprecated References

**ACTION**: UPDATE
**TARGET**: 2 files
**SCOPE**: Remove or update references to deprecated `/build` command

1. `.claude/skills/planning-methodology/SKILL.md:223` — Related Commands section lists `/build [spec]`
   - Remove the `/build [spec]` line from Related Commands
   - Keep other related commands (`/planning`, `/execute`, `/prime`)

2. `.claude/commands/prime.md:201` — Status value "build-loop-continuing"
   - This status value references the deprecated `/build` loop
   - Replace with appropriate status or remove if no longer needed
   - The `/build` automation has been replaced by standard PIV loop

Mirror changes to `.opencode/` equivalents if they exist.

**VALIDATE**:
```bash
# L3: No deprecated command references
grep -rn "/build" .claude/skills/ .claude/commands/ .opencode/skills/ .opencode/commands/ 2>/dev/null || echo "CLEAN - no /build references"

# L3: No deprecated status values
grep -n "build-loop-continuing" .claude/commands/prime.md .opencode/commands/prime.md || echo "CLEAN - no build-loop-continuing"
```

---

### Task 6: Create Model Strategy Reference

**ACTION**: CREATE
**TARGET**: `.claude/reference/model-strategy.md`
**SCOPE**: Create reference document explaining model tier strategy

Create a reference document explaining the model tier strategy used in this project:
- Opus (`claude-opus-4-6`) → thinking & planning: `/mvp`, `/prd`, `/planning`, `/council`, architecture decisions
- Sonnet (`claude-sonnet-4-6`) → review & validation: `/code-review`, `/code-loop`, `/system-review`, `/pr`, `/final-review`
- Haiku (`claude-haiku-4-5-20251001`) → retrieval & light tasks: `/prime`, RAG queries, `/commit`, quick checks

The document should include:
- Model tier mapping table
- When to use each tier
- Rationale for the assignment
- How to override in commands

**VALIDATE**:
```bash
# L1: File exists and is valid markdown
test -f .claude/reference/model-strategy.md && echo "File exists"
grep -c "## " .claude/reference/model-strategy.md
```

---

## Testing Strategy

Since this is a documentation-only change, testing is structural validation:

### L1: Syntax
- All markdown files have even number of code fence markers
- All files are valid markdown

### L2: Structure
- All commands have `## Pipeline Position` section
- All skills have required sections (When This Skill Applies, Anti-Patterns, Key Rules, Related Commands)
- All skills have correct frontmatter

### L3: Content
- Pipeline Position sections show correct pipeline flow
- No deprecated command references remain
- Compatibility fields are correct

### L4: Mirror Sync
- All `.claude/commands/` files match `.opencode/commands/` files
- All `.claude/skills/` files have corresponding `.opencode/skills/` files

### L5: Coverage
- Every command has a corresponding skill file
- Every skill has `compatibility` field set correctly

---

## Validation Commands

```bash
# L1: Syntax - check for unclosed code fences
for f in .claude/commands/*.md .opencode/commands/*.md; do
  count=$(grep -c '```' "$f" 2>/dev/null || echo 0)
  if [ $((count % 2)) -ne 0 ]; then
    echo "UNCLOSED: $f ($count fences)"
  fi
done

# L2: Structure - Pipeline Position in all commands
echo "=== Commands missing Pipeline Position ==="
for f in .claude/commands/*.md .claude/commands/validation/*.md; do
  if ! grep -q "## Pipeline Position" "$f" 2>/dev/null; then
    echo "MISSING: $f"
  fi
done

# L2: Structure - Required sections in skills
echo "=== Skills missing required sections ==="
for d in .claude/skills/*/; do
  f="$d/SKILL.md"
  for section in "When This Skill Applies" "Anti-Patterns" "Key Rules" "Related Commands"; do
    if ! grep -q "## $section" "$f" 2>/dev/null; then
      echo "MISSING '$section' in $f"
    fi
  done
done

# L3: Content - No deprecated references
echo "=== Deprecated command references ==="
grep -rn "/build\|/ship\|/sync" .claude/skills/ .claude/commands/ 2>/dev/null | grep -v "BUILD_ORDER" || echo "CLEAN"

# L3: Content - Compatibility field check
echo "=== Wrong compatibility in .opencode/skills ==="
grep -l "compatibility: claude-code" .opencode/skills/*/SKILL.md 2>/dev/null || echo "ALL CORRECT"

# L4: Mirror sync - command count
claude_count=$(ls .claude/commands/*.md .claude/commands/validation/*.md 2>/dev/null | wc -l)
opencode_count=$(ls .opencode/commands/*.md .opencode/commands/validation/*.md 2>/dev/null | wc -l)
echo "Claude commands: $claude_count, OpenCode commands: $opencode_count"

# L4: Mirror sync - skill count
claude_skills=$(ls -d .claude/skills/*/ 2>/dev/null | wc -l)
opencode_skills=$(ls -d .opencode/skills/*/ 2>/dev/null | wc -l)
echo "Claude skills: $claude_skills, OpenCode skills: $opencode_skills"

# L5: Coverage - every command has a skill
echo "=== Commands without skills ==="
for cmd in .claude/commands/*.md .claude/commands/validation/*.md; do
  name=$(basename "$cmd" .md)
  if [ ! -d ".claude/skills/$name" ] && [ ! -d ".claude/skills/validation/$name" ]; then
    echo "NO SKILL: $cmd"
  fi
done
```

---

## Acceptance Criteria

### Implementation

- [ ] All 12 commands have `## Pipeline Position` section added
- [ ] All 24 command files (12 in `.claude`, 12 in `.opencode`) are updated identically
- [ ] 5 new skill files created in `.claude/skills/` (final-review, validation/*)
- [ ] 9 skills mirrored to `.opencode/skills/` with correct compatibility
- [ ] 4 existing `.opencode` skills have compatibility field fixed
- [ ] All deprecated `/build` references removed
- [ ] `model-strategy.md` reference document created

### Runtime

- [ ] L1: All markdown files have balanced code fences
- [ ] L2: All commands have Pipeline Position section
- [ ] L2: All skills have required sections
- [ ] L3: No deprecated command references in commands/skills
- [ ] L3: All `.opencode` skills have `compatibility: opencode`
- [ ] L4: Command count matches between `.claude` and `.opencode`
- [ ] L4: Skill count matches between `.claude` and `.opencode`
- [ ] L5: Every command has a corresponding skill file

---

## Completion Checklist

- [ ] Task 1 complete: Pipeline Position added to all commands
- [ ] Task 2 complete: Missing skills created
- [ ] Task 3 complete: Skills mirrored to OpenCode
- [ ] Task 4 complete: Compatibility fields fixed
- [ ] Task 5 complete: Deprecated references removed
- [ ] Task 6 complete: model-strategy.md created
- [ ] All validation commands pass
- [ ] All acceptance criteria met
- [ ] `.agents/context/next-command.md` updated

---

## Notes

**Key decisions:**
- Validation subdirectory commands get their own skills (not merged with root commands)
- All skills use same structure regardless of command complexity
- Platform parity: every skill in `.claude` must exist in `.opencode`

**Key risk:**
- Low risk — all changes are documentation/markdown, no code
- Blast radius is limited to documentation accuracy, not runtime behavior

**Confidence**: 9/10 — All tasks follow established patterns from prior hardening work (command-hardening, claude-skills-hardening). The gap inventory is complete. Validation is structural (grep-based checks).

---

## TASK INDEX

| Task | Brief Path | Scope | Status | Files |
|------|-----------|-------|--------|-------|
| 1 | `task-1.md` | Add Pipeline Position to 12 commands (24 files total with mirrors) | pending | 0 created, 24 modified |
| 2 | `task-2.md` | Create 5 missing skill files for final-review and validation commands | pending | 5 created, 0 modified |
| 3 | `task-3.md` | Mirror 9 skills from .claude to .opencode with compatibility fix | pending | 9 created, 0 modified |
| 4 | `task-4.md` | Fix compatibility field in 4 existing .opencode skills | pending | 0 created, 4 modified |
| 5 | `task-5.md` | Remove deprecated /build references from 2 files | pending | 0 created, 2 modified |
| 6 | `task-6.md` | Create model-strategy.md reference document | pending | 1 created, 0 modified |