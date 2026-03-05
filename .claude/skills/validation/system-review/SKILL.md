---
name: validation/system-review
description: Knowledge framework for process-level meta-analysis with actionable improvement suggestions
license: MIT
compatibility: claude-code
---

# Validation: System Review — Process Meta-Analysis

This skill provides the quality framework for meta-level review of the development process. It complements the `/validation/system-review` command — the command provides the workflow, this skill provides the analysis methodology.

## When This Skill Applies

- User runs `/validation/system-review` for process analysis
- Post-PR review of how the feature was developed
- Identifying systemic issues in the development workflow
- Suggesting process improvements based on observed patterns

## What System Review Analyzes

Unlike code review (which analyzes code), system review analyzes the PROCESS:

**Plan Quality**
- Was the plan followed or did implementation diverge?
- Were acceptance criteria met or changed mid-stream?
- Did task breakdown match actual work done?

**Execution Quality**
- Were there unexpected blockers that better planning would catch?
- Did the implementation require significant rework?
- Were validation issues caught late that could have been caught early?

**Review Quality**
- Did code review find issues that should have been caught earlier?
- Were there patterns in the findings (e.g., repeated type errors)?
- Did fixes introduce new issues?

**Process Issues**
- Handoff failures between planning and execution
- Context loss between sessions
- Repeated mistakes across features

## Analysis Methodology

1. **Read the plan artifacts** — What was intended
2. **Read the execution artifacts** — What actually happened
3. **Compare plan vs reality** — Where did divergence occur?
4. **Identify patterns** — What systemic issues caused problems?
5. **Suggest improvements** — What process changes would help?

## Improvement Categories

**Planning Improvements**
- Better task breakdown
- More explicit acceptance criteria
- Clearer dependency identification
- Risk identification upfront

**Execution Improvements**
- Better validation during implementation
- More frequent check-ins with plan
- Earlier escalation of blockers
- Clearer handoff documentation

**Review Improvements**
- Earlier code review (smaller batches)
- Specific focus areas based on findings
- Pre-commit hooks for common issues
- Automated checks for patterns found

**Process Improvements**
- Memory updates to capture learnings
- Template updates for plan quality
- New validation steps for recurring issues

## Anti-Patterns

**Code-level feedback** — This is not code review. Focus on process, not specific code issues.

**Blame assignment** — System review is about improving the process, not assigning fault. Frame findings as "the process allowed X" not "person Y did X".

**Vague suggestions** — "Be more careful" is not actionable. "Add a pre-commit hook to check for console.log statements" is actionable.

**Ignoring patterns** — Treating each finding as isolated. If type errors appear in every review, the fix is a type-checking pre-commit hook, not "be more careful with types."

## Key Rules

1. **Process focus, not code focus** — Analyze how work was done, not what code was written
2. **Patterns over incidents** — One issue is an incident; repeated issues are a pattern
3. **Actionable suggestions** — Every finding has a concrete improvement suggestion
4. **Memory updates** — Capture learnings in memory.md for future sessions
5. **No blame** — Frame as process issues, not personal failings

## Related Commands

- `/system-review` — Main pipeline system review command
- `/validation/code-review` — Provides findings that system review analyzes
- `/prime` — Reads memory.md where process learnings are stored