# Task 3: Mirror Skills to OpenCode

## OBJECTIVE

Copy all skills from `.claude/skills/` that don't exist in `.opencode/skills/` to ensure platform parity. Change the compatibility field from `claude-code` to `opencode` in the copied files.

## SCOPE

**Files to create (9 skill directories):**
- `.opencode/skills/prime/SKILL.md`
- `.opencode/skills/council/SKILL.md`
- `.opencode/skills/execute/SKILL.md`
- `.opencode/skills/code-review/SKILL.md`
- `.opencode/skills/code-review-fix/SKILL.md`
- `.opencode/skills/code-loop/SKILL.md`
- `.opencode/skills/system-review/SKILL.md`
- `.opencode/skills/commit/SKILL.md`
- `.opencode/skills/pr/SKILL.md`

**Total: 9 new skill directories with SKILL.md files**

**Out of scope:**
- Modifying the original `.claude/skills/` files
- Creating validation subdirectory skills (Task 2 handles those)
- Any command files

**Dependencies: Task 2 (ensures all skills exist in .claude)**

## PRIOR TASK CONTEXT

Task 2 created 5 new skill files in `.claude/skills/`:
- `final-review/SKILL.md`
- `validation/code-review/SKILL.md`
- `validation/code-review-fix/SKILL.md`
- `validation/system-review/SKILL.md`
- `validation/execution-report/SKILL.md`

These will be mirrored in a future task (not this one). This task mirrors the 9 skills that already exist in `.claude/skills/` but are missing from `.opencode/skills/`.

## CONTEXT REFERENCES

### Current State

**Skills in `.claude/skills/` (14):**
- planning-methodology/
- prime/
- council/
- execute/
- code-review/
- code-review-fix/
- code-loop/
- system-review/
- commit/
- pr/
- mvp/
- prd/
- pillars/
- decompose/
- final-review/ (new from Task 2)
- validation/ (new from Task 2)

**Skills in `.opencode/skills/` (5):**
- planning-methodology/
- mvp/
- prd/
- pillars/
- decompose/

**Missing from `.opencode/skills/` (9):**
- prime/
- council/
- execute/
- code-review/
- code-review-fix/
- code-loop/
- system-review/
- commit/
- pr/

### Pattern: OpenCode Skill Format

From `.opencode/skills/planning-methodology/SKILL.md`:

```yaml
---
name: planning-methodology
description: Guide for systematic interactive planning with template-driven output and confidence scoring
license: MIT
compatibility: opencode
---
```

**Key difference from Claude skills:**
- `compatibility: opencode` instead of `compatibility: claude-code`

## PATTERNS TO FOLLOW

### Mirroring Pattern

For each skill directory in `.claude/skills/` that doesn't exist in `.opencode/skills/`:

1. Create the directory: `mkdir -p .opencode/skills/{name}/`
2. Copy the SKILL.md file
3. Change line 5 from `compatibility: claude-code` to `compatibility: opencode`

## STEP-BY-STEP IMPLEMENTATION

### Step 1: Mirror prime skill

**ACTION**: CREATE directory and file

**Source**: `.claude/skills/prime/SKILL.md`
**Target**: `.opencode/skills/prime/SKILL.md`

**Changes**: Copy entire file, change `compatibility: claude-code` to `compatibility: opencode`

### Step 2: Mirror council skill

**ACTION**: CREATE directory and file

**Source**: `.claude/skills/council/SKILL.md`
**Target**: `.opencode/skills/council/SKILL.md`

**Changes**: Copy entire file, change `compatibility: claude-code` to `compatibility: opencode`

### Step 3: Mirror execute skill

**ACTION**: CREATE directory and file

**Source**: `.claude/skills/execute/SKILL.md`
**Target**: `.opencode/skills/execute/SKILL.md`

**Changes**: Copy entire file, change `compatibility: claude-code` to `compatibility: opencode`

### Step 4: Mirror code-review skill

**ACTION**: CREATE directory and file

**Source**: `.claude/skills/code-review/SKILL.md`
**Target**: `.opencode/skills/code-review/SKILL.md`

**Changes**: Copy entire file, change `compatibility: claude-code` to `compatibility: opencode`

### Step 5: Mirror code-review-fix skill

**ACTION**: CREATE directory and file

**Source**: `.claude/skills/code-review-fix/SKILL.md`
**Target**: `.opencode/skills/code-review-fix/SKILL.md`

**Changes**: Copy entire file, change `compatibility: claude-code` to `compatibility: opencode`

### Step 6: Mirror code-loop skill

**ACTION**: CREATE directory and file

**Source**: `.claude/skills/code-loop/SKILL.md`
**Target**: `.opencode/skills/code-loop/SKILL.md`

**Changes**: Copy entire file, change `compatibility: claude-code` to `compatibility: opencode`

### Step 7: Mirror system-review skill

**ACTION**: CREATE directory and file

**Source**: `.claude/skills/system-review/SKILL.md`
**Target**: `.opencode/skills/system-review/SKILL.md`

**Changes**: Copy entire file, change `compatibility: claude-code` to `compatibility: opencode`

### Step 8: Mirror commit skill

**ACTION**: CREATE directory and file

**Source**: `.claude/skills/commit/SKILL.md`
**Target**: `.opencode/skills/commit/SKILL.md`

**Changes**: Copy entire file, change `compatibility: claude-code` to `compatibility: opencode`

### Step 9: Mirror pr skill

**ACTION**: CREATE directory and file

**Source**: `.claude/skills/pr/SKILL.md`
**Target**: `.opencode/skills/pr/SKILL.md`

**Changes**: Copy entire file, change `compatibility: claude-code` to `compatibility: opencode`

## TESTING STRATEGY

### Unit Tests
- Each skill file exists in `.opencode/skills/`
- Each skill file has `compatibility: opencode`
- Each skill file has balanced code fences

### Integration Tests
- Skill count in `.opencode/skills/` equals skill count in `.claude/skills/` (minus the new ones from Task 2 which will be mirrored separately)
- Content is identical except for compatibility field

### Edge Cases
- Ensure no trailing whitespace differences
- Ensure line endings are consistent

## VALIDATION COMMANDS

```bash
# L2: Verify all 9 directories exist
for skill in prime council execute code-review code-review-fix code-loop system-review commit pr; do
  if [ -d ".opencode/skills/$skill" ]; then
    echo "OK: $skill directory exists"
  else
    echo "MISSING: $skill directory"
  fi
done

# L3: Verify compatibility field is opencode
for skill in prime council execute code-review code-review-fix code-loop system-review commit pr; do
  f=".opencode/skills/$skill/SKILL.md"
  if grep -q "compatibility: opencode" "$f" 2>/dev/null; then
    echo "OK: $skill has correct compatibility"
  else
    echo "WRONG: $skill missing or wrong compatibility"
  fi
done

# L3: Verify no claude-code in copied files
echo "=== Checking for claude-code in copied files ==="
for skill in prime council execute code-review code-review-fix code-loop system-review commit pr; do
  f=".opencode/skills/$skill/SKILL.md"
  if grep -q "compatibility: claude-code" "$f" 2>/dev/null; then
    echo "ERROR: $skill still has claude-code compatibility"
  fi
done

# L4: Verify content matches (except compatibility)
for skill in prime council execute code-review code-review-fix code-loop system-review commit pr; do
  claude=".claude/skills/$skill/SKILL.md"
  opencode=".opencode/skills/$skill/SKILL.md"
  # Compare excluding the compatibility line
  diff <(grep -v "compatibility:" "$claude") <(grep -v "compatibility:" "$opencode") > /dev/null 2>&1
  if [ $? -eq 0 ]; then
    echo "OK: $skill content matches"
  else
    echo "DIFF: $skill content differs"
  fi
done
```

## ACCEPTANCE CRITERIA

### Implementation
- [ ] `.opencode/skills/prime/SKILL.md` created with `compatibility: opencode`
- [ ] `.opencode/skills/council/SKILL.md` created with `compatibility: opencode`
- [ ] `.opencode/skills/execute/SKILL.md` created with `compatibility: opencode`
- [ ] `.opencode/skills/code-review/SKILL.md` created with `compatibility: opencode`
- [ ] `.opencode/skills/code-review-fix/SKILL.md` created with `compatibility: opencode`
- [ ] `.opencode/skills/code-loop/SKILL.md` created with `compatibility: opencode`
- [ ] `.opencode/skills/system-review/SKILL.md` created with `compatibility: opencode`
- [ ] `.opencode/skills/commit/SKILL.md` created with `compatibility: opencode`
- [ ] `.opencode/skills/pr/SKILL.md` created with `compatibility: opencode`

### Runtime
- [ ] L2: All 9 directories exist in `.opencode/skills/`
- [ ] L3: All 9 files have `compatibility: opencode`
- [ ] L3: No files have `compatibility: claude-code`
- [ ] L4: Content matches `.claude/skills/` except for compatibility line

## HANDOFF NOTES

Task 4 will fix the compatibility field in the 4 existing OpenCode skills (mvp, prd, pillars, decompose) that already have the wrong value.

## COMPLETION CHECKLIST

- [ ] Created prime skill in .opencode
- [ ] Created council skill in .opencode
- [ ] Created execute skill in .opencode
- [ ] Created code-review skill in .opencode
- [ ] Created code-review-fix skill in .opencode
- [ ] Created code-loop skill in .opencode
- [ ] Created system-review skill in .opencode
- [ ] Created commit skill in .opencode
- [ ] Created pr skill in .opencode
- [ ] Verified L2 validation (directories exist)
- [ ] Verified L3 validation (compatibility field)
- [ ] Verified L4 validation (content match)