# Task 4: Fix Compatibility Fields in OpenCode Skills

## OBJECTIVE

Change the `compatibility` field from `claude-code` to `opencode` in the 4 existing OpenCode skills that have the wrong value.

## SCOPE

**Files to modify:**
- `.opencode/skills/mvp/SKILL.md` — Line 5
- `.opencode/skills/prd/SKILL.md` — Line 5
- `.opencode/skills/pillars/SKILL.md` — Line 5
- `.opencode/skills/decompose/SKILL.md` — Line 5

**Total: 4 files**

**Out of scope:**
- Any `.claude/skills/` files (those correctly use `claude-code`)
- Skills created in Task 3 (already have correct compatibility)
- Any command files

**Dependencies: Task 3 (ensures all skills exist in .opencode)**

## PRIOR TASK CONTEXT

Task 3 created 9 new skill directories in `.opencode/skills/` with the correct `compatibility: opencode` field. This task fixes the 4 skills that already existed but have the wrong compatibility value.

## CONTEXT REFERENCES

### Current State

**OpenCode skills with wrong compatibility (4):**

From the research findings:
| Skill | Current | Should Be |
|-------|---------|-----------|
| mvp | `compatibility: claude-code` | `compatibility: opencode` |
| prd | `compatibility: claude-code` | `compatibility: opencode` |
| pillars | `compatibility: claude-code` | `compatibility: opencode` |
| decompose | `compatibility: claude-code` | `compatibility: opencode` |

### Current Content (example from mvp/SKILL.md lines 1-6):

```yaml
---
name: mvp
description: Knowledge framework for big-idea discovery using Socratic questioning and scope discipline
license: MIT
compatibility: claude-code
---
```

### Expected Content (fixed):

```yaml
---
name: mvp
description: Knowledge framework for big-idea discovery using Socratic questioning and scope discipline
license: MIT
compatibility: opencode
---
```

## PATTERNS TO FOLLOW

### Single-line Change Pattern

For each file:
- Line 5 contains `compatibility: claude-code`
- Change to `compatibility: opencode`
- No other changes needed

## STEP-BY-STEP IMPLEMENTATION

### Step 1: Fix mvp/SKILL.md

**ACTION**: UPDATE
**TARGET**: `.opencode/skills/mvp/SKILL.md`

**Current (line 5):**
```yaml
compatibility: claude-code
```

**Replace with:**
```yaml
compatibility: opencode
```

### Step 2: Fix prd/SKILL.md

**ACTION**: UPDATE
**TARGET**: `.opencode/skills/prd/SKILL.md`

**Current (line 5):**
```yaml
compatibility: claude-code
```

**Replace with:**
```yaml
compatibility: opencode
```

### Step 3: Fix pillars/SKILL.md

**ACTION**: UPDATE
**TARGET**: `.opencode/skills/pillars/SKILL.md`

**Current (line 5):**
```yaml
compatibility: claude-code
```

**Replace with:**
```yaml
compatibility: opencode
```

### Step 4: Fix decompose/SKILL.md

**ACTION**: UPDATE
**TARGET**: `.opencode/skills/decompose/SKILL.md`

**Current (line 5):**
```yaml
compatibility: claude-code
```

**Replace with:**
```yaml
compatibility: opencode
```

## TESTING STRATEGY

### Unit Tests
- Each file has `compatibility: opencode` on line 5
- Each file has valid YAML frontmatter
- No file has `compatibility: claude-code` anywhere

### Integration Tests
- All OpenCode skills have consistent compatibility field
- Content matches Claude version except for compatibility

## VALIDATION COMMANDS

```bash
# L3: Verify all 4 files have correct compatibility
echo "=== Checking compatibility field ==="
for skill in mvp prd pillars decompose; do
  f=".opencode/skills/$skill/SKILL.md"
  if grep -q "compatibility: opencode" "$f" 2>/dev/null; then
    echo "OK: $skill has opencode compatibility"
  else
    echo "WRONG: $skill"
  fi
done

# L3: Verify no claude-code remains
echo "=== Checking for claude-code in OpenCode skills ==="
grep -l "compatibility: claude-code" .opencode/skills/*/SKILL.md 2>/dev/null || echo "CLEAN - no claude-code found"

# L3: Show line 5 of each file
echo "=== Line 5 of each file (should be compatibility: opencode) ==="
for skill in mvp prd pillars decompose; do
  f=".opencode/skills/$skill/SKILL.md"
  echo "$skill: $(sed -n '5p' "$f")"
done
```

## ACCEPTANCE CRITERIA

### Implementation
- [ ] `.opencode/skills/mvp/SKILL.md` has `compatibility: opencode`
- [ ] `.opencode/skills/prd/SKILL.md` has `compatibility: opencode`
- [ ] `.opencode/skills/pillars/SKILL.md` has `compatibility: opencode`
- [ ] `.opencode/skills/decompose/SKILL.md` has `compatibility: opencode`

### Runtime
- [ ] L3: All 4 files have `compatibility: opencode` on line 5
- [ ] L3: No OpenCode skills have `compatibility: claude-code`

## HANDOFF NOTES

After this task, all skills in `.opencode/skills/` will have the correct `compatibility: opencode` field. Task 5 will address deprecated command references.

## COMPLETION CHECKLIST

- [ ] Fixed mvp/SKILL.md compatibility field
- [ ] Fixed prd/SKILL.md compatibility field
- [ ] Fixed pillars/SKILL.md compatibility field
- [ ] Fixed decompose/SKILL.md compatibility field
- [ ] Verified L3 validation (correct compatibility)
- [ ] Verified L3 validation (no claude-code in OpenCode skills)