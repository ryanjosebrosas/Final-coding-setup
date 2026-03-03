---
name: code-loop
description: Run an automated review → fix → review loop until all Critical and Major issues
             are resolved. Use when the user asks to run a fix loop, fix all review issues,
             loop until clean, or auto-fix code review findings. Trigger phrases: "code loop",
             "fix loop", "run code loop", "loop until clean", "fix all review issues",
             "auto-fix the review", "review and fix", "fix critical and major issues".
---

# Code Loop: Automated Fix Loop

## When to Use This Skill

Use this skill to automate the review → fix → review cycle. It runs until all Critical and
Major issues are resolved (or an unfixable error is hit).

Slice completion rule: A slice is complete only when code review returns 0 Critical/Major issues,
or the user explicitly accepts remaining minor issues.

## Step 0: Load Context

**Determine feature name** (priority order):
1. Feature name provided by user
2. Read `.agents/context/next-command.md` — use the **Feature** field
3. Scan `.agents/features/*/report.md` (non-done) — use the most recently modified

**If Archon MCP is connected:**
- `rag_search_knowledge_base(query="...", match_count=5)` — 2-5 keywords for the feature
- Pass context to review steps for cross-referencing against documentation

## Step 1: Initialize Loop

Create loop report: `.agents/features/{feature}/loop-report-1.md`

Start iteration counter N = 1.

## Step 2: Checkpoint (Start of Each Iteration)

At the start of each iteration, save progress:
```markdown
**Checkpoint {N}** - {timestamp}
- Issues remaining: X (Critical: Y, Major: Z)
- Last fix: {what was fixed in previous iteration, or "none — first iteration"}
- Validation: {last known lint/test results}
```

This enables recovery if context compacts or session is interrupted.

## Step 3: Run Code Review

Review all uncommitted changes and save to:
`.agents/features/{feature}/review-{N}.md`

Apply the same review methodology as the `code-review` skill:
- Read AGENTS.md for project conventions
- Read each changed file in its entirety
- Check Critical / Major / Minor severity levels
- Save structured report to the review file

## Step 4: Check Findings

**If 0 issues:** → Exit loop cleanly (go to Step 7)

**If only Minor issues:** → Ask user: "Only minor issues remain. Fix them or skip to commit?"
- User says fix: continue to Step 5 with scope `all`
- User says skip: exit cleanly (go to Step 7)

**If Critical/Major issues:** → Continue to Step 5

## Step 5: Fix Issues

Fix Critical and Major issues found in the review artifact:

For each Critical/Major finding in `.agents/features/{feature}/review-{N}.md`:
1. Read the affected file
2. Apply the fix described in the review
3. Verify the fix with a targeted validation command

**Fix scope** (default): Critical + Major
**Escalation rule**: If a fix requires changes to 5+ files, introduces new abstractions, or
changes API surfaces → STOP the loop and report: "This fix requires architectural changes.
Run `/planning` in Claude with the review artifact as input, then `/execute` the fix plan."

After all fixes applied: mark the source review file done by renaming:
`.agents/features/{feature}/review-{N}.md` → `.agents/features/{feature}/review-{N}.done.md`

## Step 6: Run Full Validation

After fixes, run the full validation pyramid:
- L1: Lint/style (from `.claude/config.md` if available, otherwise auto-detect)
- L2: Type check
- L3: Unit tests
- L4: Integration tests (if applicable)

**If validation passes:** Increment N, return to Step 2 for next iteration.

**If unfixable error detected** (command not found, missing deps, syntax error blocking analysis,
circular deps, broken imports):
- Stop the loop
- Report: "Loop stopped — unfixable error: {description}. Manual intervention required."
- Write blocked handoff (see Step 8 failure format)
- Do NOT retry

## Step 7: Clean Exit

Loop exited with 0 Critical/Major issues (or user accepted minor issues).

**Completion sweep** (required before commit):
1. Rename loop report: `loop-report-{N}.md` → `loop-report-{N}.done.md`
2. Rename last review file (if not already done): `review-{N}.md` → `review-{N}.done.md`
3. Rename any fix plan artifacts that were fully applied: `fixes-{N}.md` → `fixes-{N}.done.md`

**Report:**
```
Code loop complete

Iterations: {N}
Issues fixed: {X total} (Critical: {Y}, Major: {Z}, Minor: {W})
Status: Ready for commit
```

## Step 8: Write Pipeline Handoff

**On clean exit:**
```markdown
# Pipeline Handoff
<!-- Auto-updated by pipeline commands. Read by /prime. Do not edit manually. -->

- **Last Command**: /code-loop
- **Feature**: {feature}
- **Next Command**: /commit
- **Timestamp**: {ISO 8601 timestamp}
- **Status**: ready-to-commit
```

**On unfixable error / loop stopped:**
```markdown
# Pipeline Handoff
<!-- Auto-updated by pipeline commands. Read by /prime. Do not edit manually. -->

- **Last Command**: /code-loop (stopped)
- **Feature**: {feature}
- **Next Command**: [manual intervention required]
- **Timestamp**: {ISO 8601 timestamp}
- **Status**: blocked
```

**On user interrupt (Ctrl+C):**
1. Save current checkpoint to `.agents/features/{feature}/interrupted-{N}.md`
2. Report progress and remaining issues
3. Clean exit — do NOT commit partial fixes
4. Write blocked handoff

## Loop Exit Conditions

| Condition | Action |
|-----------|--------|
| 0 issues + validation passes | Exit clean → ready for `/commit` |
| Only Minor issues | Ask user: fix or defer? |
| Unfixable error detected | Stop, report, blocked handoff |
| User interrupt (Ctrl+C) | Save checkpoint, blocked handoff |

## Key Rules

- One loop per feature — do not mix unrelated domains in one loop
- Never commit inside the loop — `/commit` is a separate step after loop exits
- Never skip validation after fixes
- Escape hatch for architectural fixes: stop and tell user to run `/planning` → `/execute` in Claude
- Completion sweep is mandatory before handing off to `/commit`
