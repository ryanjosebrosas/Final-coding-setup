---
name: code-loop
description: Knowledge framework for automated review-fix loop discipline with checkpoints, escape hatch criteria, and clean exit standards
license: MIT
compatibility: opencode
---

# Code Loop — Automated Fix Loop Methodology

This skill provides the quality standards for running effective review-fix loops. It
complements the `/code-loop` command — the command provides the workflow, this skill
provides the reasoning for checkpoint discipline, escape hatch criteria, and loop exit
judgment.

## When This Skill Applies

- `/code-loop {feature}` is invoked
- An automated review-fix cycle needs to run to completion
- A fix loop is in progress and a decision point requires judgment
- The loop has been interrupted and needs to be resumed from a checkpoint

## Checkpoint Discipline

The checkpoint system exists to survive context compaction and session interrupts. Rules:

**Every iteration starts with a checkpoint:**
```
Checkpoint {N} — {timestamp}
Issues remaining: X (Critical: Y, Major: Z)
Last fix: {what was changed in previous iteration}
Validation: {last known L1/L2/L3 status}
```

**Checkpoints must be specific:**
Bad: "Checkpoint 2 — some issues remain"
Good: "Checkpoint 2 — 2026-03-04T03:00Z / Issues remaining: 2 (Critical: 1, Major: 1) /
Last fix: src/auth.ts:47 null dereference fixed / Validation: L1 PASS, L2 PASS, L3 2 failing"

**Checkpoints are written before doing anything in that iteration.** If the session
compacts mid-iteration, the checkpoint from the start of that iteration is the resume point.

**Why checkpoints matter:**
Without a checkpoint, a compacted session has no way to know what was fixed, what remains,
or where validation stands. The loop would have to restart from scratch, potentially
re-reviewing and re-fixing issues that were already addressed.

## Escape Hatch Criteria — When to Stop and Plan

The escape hatch (stopping the loop and escalating to `/planning` → `/execute`) triggers
when a fix cannot be applied by `/code-review-fix`. Specific criteria:

**Escalate when:**
- Fix requires changes to 5+ files (architectural scope, not isolated fix)
- Fix requires introducing a new abstraction (new interface, base class, service layer)
- Fix requires changing an API surface that other callers depend on
- Fix requires adding a new package dependency
- Fix requires restructuring data flow between modules

**Do NOT escalate for:**
- Null checks, type annotations, import fixes (isolated, 1-2 lines)
- Adding a logger call, wrapping in try/catch (isolated, 1-5 lines)
- Renaming a variable or function for clarity (surgical, contained to one file)
- Adding a missing test for existing logic (new file, no existing code changes)

**When escalating:**
1. Report clearly: "This fix requires architectural changes. Specifically:
   {what would need to change and why it's architectural}"
2. Stop the loop — do NOT apply a partial fix
3. Write blocked handoff
4. The user or next session creates a fix plan via `/planning`

**Why partial architectural fixes are worse than no fix:**
A partial fix that "kind of" addresses an architectural issue produces code that looks
fixed but has the same structural problem. The next review may not flag it again because
the surface symptom is gone, but the underlying problem remains.

## Loop Iteration Quality

Each iteration must complete fully before the next starts:

**Full iteration = review → fix → full validation → checkpoint**

Shortcutting this cycle:
- Skipping full validation after fixes ("the unit tests passed last time")
  → regression in a different test category goes undetected
- Running review without fixing ("let me see what's still there first")
  → produces a new review artifact without addressing the previous one; confusing state

**Iteration numbering:**
Review artifacts are numbered: `review-1.md`, `review-2.md`, etc.
Each number corresponds to one full iteration. Do not reuse numbers.
When a review is addressed, rename it: `review-1.md` → `review-1.done.md`.

## Loop Exit Conditions — Judgment Standards

**Clean exit (0 issues):**
The loop exits cleanly when `/code-review` returns 0 Critical and 0 Major findings,
AND the full validation pyramid passes. Both conditions are required.

Why both: A codebase can pass code review but have failing tests (logic error not
caught by static analysis). A codebase can pass tests but have a Critical security
finding (SQL injection doesn't fail tests until exploited).

**Minor-issues-only exit:**
When only Minor issues remain, ask the user. The options:
- Fix Minor issues (continue loop with scope `all`)
- Defer Minor issues (exit cleanly, note deferral in completion report)
- Neither is wrong — this is a judgment call for the user, not the loop

**Never exit with unfixed Critical/Major issues:**
If /code-review-fix cannot fix a Critical/Major issue, the loop must stop with a
blocked handoff — it cannot declare clean exit with unfixed Critical/Major findings.

## Completion Sweep Standards

The completion sweep marks all artifacts as done:

```
loop-report-{N}.md → loop-report-{N}.done.md
review-{N}.md → review-{N}.done.md (last review artifact only — earlier ones already done)
fixes-{N}.md → fixes-{N}.done.md (if any fix plans were applied)
```

**Do NOT rename on interrupted exit.** Only rename on clean exit (0 issues or user
accepted Minor). If the loop was stopped by an unfixable error or user interrupt,
the artifacts remain as `.md` so /prime can detect the unresolved state.

**Completion sweep is the signal to /prime:**
After the sweep, /prime sees all review and loop artifacts as `.done.md` and knows
the loop is complete. If the sweep is skipped or partial, /prime shows the feature
as still in the review phase.

## RAG Pre-Load Quality

If Archon MCP is connected, load context before the first review iteration:
- Search for patterns relevant to the feature's domain (2-5 keywords)
- Search for reference implementations of the patterns being reviewed
- Pass this context to the review step so it can compare against documented standards

If no RAG: proceed without it. RAG is an enhancement, not a requirement.

## Anti-Patterns

**Restarting without a checkpoint** — Running the loop again from scratch when it could
be resumed from the last checkpoint. Wastes time and re-reviews already-fixed issues.

**Short-circuiting validation** — "The unit tests passed in iteration 1 so I'll skip
L3 in iteration 2." Each iteration needs full validation because each fix could
introduce a regression at any level.

**Partial architectural fix** — Applying a shallow patch to a problem that needs deeper
fixing, just to keep the loop moving. Produces code that looks fixed but isn't.

**Exiting with unfixed Criticals** — Marking a loop as complete when Critical issues
remain because they're "too hard to fix right now." Critical issues block commit for
a reason.

**Not marking review artifacts .done.md** — Leaving review-N.md without the .done.md
suffix after addressing its findings. /prime will show the feature as still in review.

## Key Rules

1. **Checkpoint every iteration before doing anything** — Context compaction survival
2. **Full iteration = review → fix → full validation** — No shortcuts
3. **Escape hatch for architectural fixes** — 5+ files, new abstractions, API changes
4. **Clean exit requires 0 Critical/Major AND validation passing** — Both, not either
5. **Completion sweep only on clean exit** — Not on interrupted/blocked exit
6. **Minor-only exit is user's call** — Not the loop's decision
7. **Never apply partial architectural fixes** — Stop and escalate instead

## Related Commands

- `/code-loop {feature}` — The automated loop workflow this skill supports
- `/code-review` — The review step inside each iteration
- `/code-review-fix {review-file}` — The fix step inside each iteration
- `/planning {feature}` — Escalation target for architectural fixes the loop cannot handle
- `/commit` — Next step after clean loop exit