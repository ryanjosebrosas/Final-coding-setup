---
name: validation/execution-report
description: Knowledge framework for implementation report generation with plan alignment and artifact documentation
license: MIT
compatibility: claude-code
---

# Validation: Execution Report — Implementation Documentation

This skill provides the quality framework for documenting what was implemented. It complements the `/validation/execution-report` command — the command provides the workflow, this skill provides the documentation standards.

## When This Skill Applies

- User runs `/validation/execution-report` after implementation
- Documentation of what was done is needed for system review
- Handoff documentation between execution and review phases
- Record of plan-to-reality alignment

## Report Structure

A complete execution report includes:

**Summary**
- What was implemented (high level)
- How it aligns with the plan
- Any deviations and why

**Task Completion**
- Which tasks were completed as planned
- Which tasks were modified and why
- Which tasks were skipped and why

**Files Changed**
- List of all modified/created/deleted files
- Purpose of each change

**Validation Results**
- Test results
- Lint results
- Type check results

**Acceptance Criteria Status**
- Which criteria were met
- Which criteria were not met (with explanation)
- Which criteria were modified (with justification)

**Learnings**
- What went well
- What could have been better
- Process improvements for next time

## Documentation Quality

**Good documentation:**
- Specific about what changed and why
- Links to plan tasks by number
- Explains deviations honestly
- Includes validation evidence
- Captures learnings for future

**Bad documentation:**
- Vague about what was done
- No link to original plan
- Deviations hidden or not mentioned
- No validation evidence
- No learnings captured

## Anti-Patterns

**Copy-paste from plan** — The report should reflect reality, not just repeat the plan. Document what actually happened.

**Skipping deviations** — Hiding that something was done differently than planned. Honest documentation builds trust.

**No validation evidence** — Claiming "tests pass" without showing output. Evidence makes the report credible.

**No learnings** — Missing the opportunity to improve future work. Learnings are often the most valuable part.

## Key Rules

1. **Honest alignment** — Document what actually happened, not what was supposed to happen
2. **Plan references** — Link to specific tasks by number
3. **Validation evidence** — Include actual test/lint/type output
4. **Deviation explanation** — Every deviation has a reason documented
5. **Learnings captured** — At least one thing to improve for next time

## Related Commands

- `/execute` — Produces the implementation this report documents
- `/system-review` — Uses this report for process analysis
- `/final-review` — Uses this report for acceptance criteria verification