# Task 5: Remove Deprecated Command References

## OBJECTIVE

Remove or update references to the deprecated `/build` command from skill and command files.

## SCOPE

**Files to modify:**
- `.claude/skills/planning-methodology/SKILL.md` — Line 223, Related Commands section
- `.claude/commands/prime.md` — Line 201, status value "build-loop-continuing"
- `.opencode/skills/planning-methodology/SKILL.md` — Mirror of the Claude skill
- `.opencode/commands/prime.md` — Mirror of the Claude command

**Total: 4 files (2 in .claude, 2 mirrors in .opencode)**

**Out of scope:**
- Any other deprecated references (if found, document for future cleanup)
- BUILD_ORDER.md references (those are file references, not command references)
- Any skill or command files not listed above

**Dependencies: None (independent of other tasks)**

## PRIOR TASK CONTEXT

None — this task is independent and can run in parallel with Tasks 1-4.

## CONTEXT REFERENCES

### Deprecated Command Background

The `/build` command was part of an older pipeline design:
```
Old: /mvp → /prd → /pillars → /decompose → /build → /ship
```

The current pipeline is:
```
New: /mvp → /prd → /pillars → /decompose → /planning → /execute → /code-review → /code-loop → /commit → /pr
```

The `/build` command has been removed. All references to it should be updated.

### Reference 1: planning-methodology/SKILL.md

**Current content (line 218-224):**
```markdown
## Related Commands

- `/planning [feature]` — The interactive discovery workflow that uses this methodology
- `/execute [plan-path]` — Implements the plan this methodology produces
- `/build [spec]` — Wraps planning + execution in an automated loop
- `/prime` — Load context before starting planning
```

**Issue:** Line 222 references `/build [spec]` which is deprecated.

**Fix:** Remove line 222 entirely.

### Reference 2: prime.md status value

**Current content (line 199-202):**
```markdown
- `ready-for-pr` — committed, awaiting `/pr`
- `pr-open` — PR created, pipeline complete (informational)
- `blocked` — manual intervention required
- `build-loop-continuing` — commit done in `/build` loop, continuing to next spec
```

**Issue:** Line 201 references `build-loop-continuing` status which is for the deprecated `/build` loop.

**Fix:** Remove line 201 entirely (the status is no longer valid).

## PATTERNS TO FOLLOW

### Clean Removal Pattern

When removing deprecated command references:
1. Remove the entire line containing the reference
2. Do not leave blank lines in lists
3. Preserve surrounding content

### Mirror Sync Pattern

Changes to `.claude/` files must be mirrored to `.opencode/` files:
1. Make the same change in the `.opencode/` mirror file
2. Ensure line numbers match (for easy diff comparison)

## STEP-BY-STEP IMPLEMENTATION

### Step 1: Remove /build from planning-methodology skill (Claude)

**ACTION**: UPDATE
**TARGET**: `.claude/skills/planning-methodology/SKILL.md`

**Current (lines 218-224):**
```markdown
## Related Commands

- `/planning [feature]` — The interactive discovery workflow that uses this methodology
- `/execute [plan-path]` — Implements the plan this methodology produces
- `/build [spec]` — Wraps planning + execution in an automated loop
- `/prime` — Load context before starting planning
```

**Replace with:**
```markdown
## Related Commands

- `/planning [feature]` — The interactive discovery workflow that uses this methodology
- `/execute [plan-path]` — Implements the plan this methodology produces
- `/prime` — Load context before starting planning
```

### Step 2: Remove /build from planning-methodology skill (OpenCode)

**ACTION**: UPDATE
**TARGET**: `.opencode/skills/planning-methodology/SKILL.md`

Make the same change as Step 1.

### Step 3: Remove build-loop-continuing status from prime.md (Claude)

**ACTION**: UPDATE
**TARGET**: `.claude/commands/prime.md`

**Current (lines 196-202):**
```markdown
- `ready-for-pr` — committed, awaiting `/pr`
- `pr-open` — PR created, pipeline complete (informational)
- `blocked` — manual intervention required
- `build-loop-continuing` — commit done in `/build` loop, continuing to next spec

If the file does not exist or is empty, skip to Source 2.
```

**Replace with:**
```markdown
- `ready-for-pr` — committed, awaiting `/pr`
- `pr-open` — PR created, pipeline complete (informational)
- `blocked` — manual intervention required

If the file does not exist or is empty, skip to Source 2.
```

### Step 4: Remove build-loop-continuing status from prime.md (OpenCode)

**ACTION**: UPDATE
**TARGET**: `.opencode/commands/prime.md`

Make the same change as Step 3.

## TESTING STRATEGY

### Unit Tests
- No `/build` references remain in any skill file
- No `build-loop-continuing` references remain in any command file
- YAML frontmatter is still valid

### Integration Tests
- Related Commands section is still well-formed
- Status values list is still well-formed
- Mirror files are identical

## VALIDATION COMMANDS

```bash
# L3: Check for deprecated /build command references
echo "=== Checking for /build references ==="
grep -rn "/build" .claude/skills/ .claude/commands/ .opencode/skills/ .opencode/commands/ 2>/dev/null | grep -v "BUILD_ORDER" || echo "CLEAN - no /build references"

# L3: Check for build-loop-continuing status
echo "=== Checking for build-loop-continuing ==="
grep -rn "build-loop-continuing" .claude/commands/ .opencode/commands/ 2>/dev/null || echo "CLEAN - no build-loop-continuing"

# L3: Check for other deprecated commands
echo "=== Checking for /ship and /sync references ==="
grep -rn "/ship\|/sync" .claude/skills/ .claude/commands/ .opencode/skills/ .opencode/commands/ 2>/dev/null | grep -v "github.com" || echo "CLEAN - no /ship or /sync references"

# L4: Verify mirror sync for modified files
echo "=== Checking mirror sync ==="
diff .claude/skills/planning-methodology/SKILL.md .opencode/skills/planning-methodology/SKILL.md && echo "OK: planning-methodology skills match" || echo "DIFF: planning-methodology skills differ"
diff .claude/commands/prime.md .opencode/commands/prime.md && echo "OK: prime commands match" || echo "DIFF: prime commands differ"
```

## ACCEPTANCE CRITERIA

### Implementation
- [ ] `.claude/skills/planning-methodology/SKILL.md` has no `/build` reference
- [ ] `.opencode/skills/planning-methodology/SKILL.md` has no `/build` reference
- [ ] `.claude/commands/prime.md` has no `build-loop-continuing` reference
- [ ] `.opencode/commands/prime.md` has no `build-loop-continuing` reference

### Runtime
- [ ] L3: No `/build` command references in skills or commands
- [ ] L3: No `build-loop-continuing` status in prime.md
- [ ] L3: No `/ship` or `/sync` command references
- [ ] L4: Mirror files are identical

## HANDOFF NOTES

This task removes deprecated references. Task 6 creates a new reference file for model strategy.

## COMPLETION CHECKLIST

- [ ] Removed /build from .claude/skills/planning-methodology/SKILL.md
- [ ] Removed /build from .opencode/skills/planning-methodology/SKILL.md
- [ ] Removed build-loop-continuing from .claude/commands/prime.md
- [ ] Removed build-loop-continuing from .opencode/commands/prime.md
- [ ] Verified L3 validation (no deprecated references)
- [ ] Verified L4 validation (mirror sync)