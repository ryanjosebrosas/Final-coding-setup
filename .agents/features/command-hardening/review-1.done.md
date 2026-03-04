# Code Review: command-hardening

## Stats
- Files Modified: 23 (commands + skills)
- Files Added: 16 (new feature directory, agents, sections, skills, templates)
- Files Deleted: 6 (build.md, ship.md, sync.md in both .claude and .opencode)
- Total scope: 4 commands + 4 skills (mvp, prd, pillars, decompose)

---

## Critical (blocks commit)

None found.

---

## Major (fix soon)

None found.

---

## Minor (consider)

### MIN-1: Trailing newline inconsistency in prd SKILL.md mirror

**File**: `.opencode/skills/prd/SKILL.md:157`
**Issue**: Missing trailing newline compared to `.claude/skills/prd/SKILL.md`

**Why**: The `.claude` version ends with a newline, but `.opencode` version does not. This causes a diff in mirror validation.

**Fix**: Add trailing newline to `.opencode/skills/prd/SKILL.md`

```
# Fix command:
echo "" >> .opencode/skills/prd/SKILL.md
```

**Severity rationale**: Minor because it doesn't affect functionality — it's a whitespace consistency issue only visible in diff tools.

---

## Validation Results

### L1 (Syntax) — PASS
All files have even code fence counts:
- `.claude/commands/pillars.md`: 10 ✓
- `.claude/commands/decompose.md`: 12 ✓
- `.claude/skills/pillars/SKILL.md`: 0 ✓
- `.claude/skills/decompose/SKILL.md`: 8 ✓
- `.claude/commands/mvp.md`: 16 ✓
- `.claude/commands/prd.md`: 20 ✓
- `.claude/skills/mvp/SKILL.md`: 0 ✓
- `.claude/skills/prd/SKILL.md`: 4 ✓

### L2 (Structure) — PASS
Required sections present in all files:
- Command files have `## Pipeline Position` ✓
- Command files have `HARD STOP` gates ✓
- Skill files have `## Key Rules` ✓
- Skill files have `## Anti-Patterns` ✓

### L3 (Content: Gate Enforcement) — PASS
All commands have explicit gate enforcement:
- `mvp.md:114` — "**HARD STOP** — Do NOT write `mvp.md` until the user explicitly confirms"
- `prd.md:58` — "**HARD STOP** — Do NOT write the PRD until the user confirms"
- `pillars.md:119` — "**HARD STOP** — Do NOT write PILLARS.md until the user explicitly approves"
- `decompose.md:139` — "**HARD STOP** — Do NOT write the pillar file until the user approves"

### L4 (Mirror Sync) — 1 ISSUE
- `pillars.md` — SYNC OK ✓
- `decompose.md` — SYNC OK ✓
- `pillars SKILL.md` — SYNC OK ✓
- `decompose SKILL.md` — SYNC OK ✓
- `mvp.md` — SYNC OK ✓
- `prd.md` — SYNC OK ✓
- `mvp SKILL.md` — SYNC OK ✓
- `prd SKILL.md` — DIFF DETECTED (trailing newline) ⚠️

### L5 (Pipeline References) — PASS
No old pipeline references found:
- No `/build`, `/ship`, `/sync`, or `BUILD_ORDER` in new/modified files ✓

---

## RAG-Informed

No RAG sources applicable — this is a markdown documentation project.

---

## Deep Review Pass

**Security angle**: N/A — no executable code, only markdown documentation
**Performance angle**: N/A — no runtime components
**Architecture angle**: Pipeline design is consistent:
- All 4 commands follow the same step pattern (1-5)
- All 4 skills have the same section structure
- Pipeline position is correctly updated (no `/build`, `/ship`)

---

## Summary

- **Critical**: 0
- **Major**: 0
- **Minor**: 1 (trailing newline in prd SKILL.md mirror)

## Recommendation

**PASS with minor fix recommended**

The command-hardening feature is complete and all critical structural validation passes. The single minor issue (trailing newline) is cosmetic and does not block commit.

Options:
1. Fix the minor issue with: `echo "" >> .opencode/skills/prd/SKILL.md`
2. Proceed to `/commit` — the diff is cosmetic and doesn't affect functionality