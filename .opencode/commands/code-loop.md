---
description: Automated review → fix → review loop until clean
---

# Code Loop: Automated Fix Loop

## Purpose

Automates the fix loop workflow:
```
/code-review → /planning (fix-slice) → /execute (fix plan) → /code-review
```

Runs until all issues are fixed or unfixable error detected.

**Next step after clean exit:** Run `/final-review` to summarize all changes and get human approval, then `/commit`.

Slice completion rule:
- A slice is considered complete only when code review returns no Critical/Major issues (or user explicitly accepts remaining minor issues).
- Start the next slice only after this completion condition.

Incremental rule:
- Keep each loop focused on one concrete outcome.
- If fixes spread into unrelated domains, stop and split into a follow-up loop/plan.

## Usage

```
/code-loop [feature-name]
```

- `feature-name` (optional): Used for commit message and report file

---

## Pre-Loop: RAG Context Load (Optional)

Before starting the review loop, gather relevant documentation context:

**If RAG knowledge base MCP is available:**
1. Search for relevant patterns based on the feature/files being reviewed (2-5 keyword queries)
2. Search for reference implementations of similar patterns
3. Pass context to code-review steps so reviews can cross-reference against documentation

**If RAG unavailable:** Proceed without RAG context — the review steps have their own exploration capabilities.

---

## Multi-Model Dispatch in Loop (Optional)

The dispatch tool sends prompts to other AI models. In the code-loop context, use it for:

1. **Multi-model review** — get additional review perspectives beyond the primary review
2. **Fix delegation** — dispatch fix implementation to fast models while you orchestrate

**This is optional.** If dispatch is not available, skip all dispatch steps and run the loop with the primary model.

### Review Dispatch (during step 1 of each iteration)

After the primary `/code-review` runs, consider dispatching to a second model for additional findings:

**When to dispatch a second review:**
- First iteration (fresh code, worth getting a second perspective)
- When review finds security-sensitive issues (get confirmation)
- When review finds 0 issues (sanity check — did we miss something?)
- When changes touch multiple interconnected files

**When to skip dispatch review:**
- Later iterations with only minor fixes remaining
- When previous dispatch review added no new findings
- When changes are trivial (typos, formatting)

**Merging dispatch findings with primary review:**
- Deduplicate — if dispatch finds the same issue as primary review, note "confirmed by second model"
- Add new findings to the review artifact with source attribution
- Include in the fix plan so `/execute` addresses them

### Fix Dispatch (during step 4 of each iteration)

For simple, isolated fixes (e.g., "add missing null check at line 42", "rename variable X to Y"):
- Dispatch to T1 model for quick fix generation
- Only dispatch fixes you can verify (review the result before applying)
- Never dispatch architectural changes or multi-file refactors
- If the dispatched fix looks wrong, implement it yourself

### Model Routing for Loop Tasks (5-Tier)

| Task | Tier | When to Use |
|------|------|-------------|
| First code review | T2 | Standard review |
| Architecture audit | T2 | Complex structural changes |
| Logic review | T2 | Business logic changes |
| Code quality review | T1 | Style and convention checks |
| Security scan | T2 | Auth, crypto, data handling changes |
| Simple fix generation | T1 | Isolated, verifiable fixes |
| Complex fix generation | T2 | Multi-concern fixes |
| Near-final review | T3/T4 | Before commit |
| Final critical review | T5 | Last resort, stuck issues |

### Consensus-Gating Rule (when multiple reviewers available)

| Review Result | Action |
|--------------|--------|
| Majority say clean | Proceed to commit |
| Mixed results | Dispatch to T3/T4 as tiebreaker |
| Majority say issues | Fix → re-run review |

**Hard rule**: Security-critical code (auth, crypto, payments) ALWAYS goes through highest available tier regardless of consensus.

---

## Fix Loop

### Checkpoint System (Context Compaction)

At the start of EACH iteration, save progress checkpoint:
```markdown
**Checkpoint {N}** - {timestamp}
- Issues remaining: X (Critical: Y, Major: Z)
- Last fix: {what was fixed}
- Validation: {lint/test results}
```

**Why:** If context compacts or session interrupts, work can be recovered from last checkpoint.

### Iteration 1-N

1. **Run `/code-review`**
   - Save to: `.agents/features/{feature}/review-{N}.md`

2. **Check findings:**
   - **If 0 issues:** → Exit loop, go to commit
   - **If only Minor issues:** → Ask user: "Fix minor issues or skip to commit?"
   - **If Critical/Major issues:** → Continue to fix step

 3. **Create fix plan via `/planning` (required)**
     - Input: latest review artifact `.agents/features/{feature}/review-{N}.md`
     - Output: `.agents/features/{feature}/fixes-{N}.md`
     - The fix plan must define a single bounded fix slice (Critical/Major first)
     - If the review includes RAG-informed findings, include the RAG source references in the fix plan

 4. **Run `/execute` with the fix plan (required)**
    - Input: `.agents/features/{feature}/fixes-{N}.md`
    - Never run `/execute` directly on raw review findings
    - After this fix pass succeeds, mark the source review file `.done.md`

 5. **Run full validation for this slice:**
   - Run lint/style checks (project-configured)
   - Run type safety checks (project-configured)
   - Run unit tests (project-configured)
   - Run integration tests (project-configured)
   - Run manual verification steps from the active plan

6. **Check for unfixable errors:**
   - Command not found → Stop, report missing tool
   - Dependency errors → Stop, report missing dependencies
   - Syntax errors blocking analysis → Stop, report file:line
   - If no unfixable errors → Continue to next iteration

### Loop Exit Conditions

| Condition | Action |
|-----------|--------|
| 0 issues + validation passes | → Hand off to `/final-review` |
| Only Minor issues | → Fix if quick and safe; otherwise ask user whether to defer |
| Unfixable error detected | → Stop, report what's blocking |

### Alternative: Skip Steps 3–4 with `/code-review-fix`

For straightforward fixes, use the dedicated command instead of the full plan → execute cycle:

```
/code-review-fix .agents/features/{feature}/review-{N}.md {scope}
```

Where `{scope}` is:
- `all` — Fix all issues (default)
- `critical+major` — Fix Critical and Major only
- `critical` — Fix Critical only
- `{file-path}` — Fix issues only in specified file(s)

**When to use**: Simple, isolated fixes (null checks, imports, naming).
**When to use Steps 3–4 instead**: Architectural changes, multi-file refactors, or any fix requiring a plan.

### User Interruption Handling

**If user presses Ctrl+C during iteration:**
1. Save current checkpoint to `.agents/features/{feature}/interrupted-{N}.md`
2. Report progress and remaining issues
3. Clean exit (no partial commits)

**If context compacts (session memory limit):**
1. Last checkpoint is already saved (from checkpoint system)
2. Next iteration reads checkpoint and continues
3. Report: "Resumed from checkpoint {N}"

---

## Handoff (When Loop Exits Clean)

1. **Report completion:**
   ```
   Code loop complete

   Iterations: N
   Issues fixed: X (Critical: Y, Major: Z, Minor: W)
   Status: Ready for /final-review
   ```

2. **Next step:** Tell the user to run `/final-review` for a summary + approval gate, then `/commit`.
   - Do NOT auto-commit. The user must approve via `/final-review` first.

---

## Output Report

Working filename: `.agents/features/{feature}/loop-report-{N}.md`

Write the loop report to the working filename as the loop progresses. Do NOT use `.done.md` until the completion sweep.

Done marker rule:
- Mark done status in filenames only by appending `.done` before `.md`.
- Do not modify markdown H1/title text just to indicate completion.
- On clean exit (0 issues or user accepts), perform a **completion sweep** as the final step before commit:
  1. Rename the loop report: `.agents/features/{feature}/loop-report-{N}.md` → `.agents/features/{feature}/loop-report-{N}.done.md`
  2. Rename the last review file: `.agents/features/{feature}/review-{N}.md` → `.agents/features/{feature}/review-{N}.done.md`
  3. Rename any fix plan artifacts that were fully applied: `.agents/features/{feature}/fixes-{N}.md` → `.agents/features/{feature}/fixes-{N}.done.md`
- On interrupted/stopped exit, leave filenames as `.md` (not done).

### Loop Summary

- **Feature**: {feature-name}
- **Iterations**: N
- **Final Status**: Clean / Stopped (unfixable error) / Stopped (user interrupt) / Stopped (user choice)
- **Dispatch used**: {yes — N dispatches across M iterations / no}

### Issues Fixed by Iteration

| Iteration | Critical | Major | Minor | Total | Dispatches |
|-----------|----------|-------|-------|-------|------------|
| 1 | X | Y | Z | T | N |
| 2 | X | Y | Z | T | N |
| N (final) | X | Y | Z | T | N |

### Checkpoints Saved

- `.agents/features/{feature}/checkpoint-1.md` — Iteration 1 progress
- ...
- **If interrupted:** `.agents/features/{feature}/interrupted-{N}.md` — Resume point

### Validation Results

```bash
# Output from lint/typecheck/tests
```

### Commit Info

- **Hash**: {commit-hash}
- **Message**: {full message}
- **Files**: X changed, Y insertions, Z deletions

---

## Error Handling

**Distinguish Fixable vs Unfixable Errors:**

**Fixable (continue loop):**
- Code review finds issues → `/execute` fixes them
- Lint errors → `/execute` fixes formatting
- Type errors (simple) → `/execute` adds type annotations
- Test failures → `/execute` fixes logic

**Unfixable (stop loop, report to user):**
- Command not found (lint tool not installed)
- Missing dependencies (package install needed)
- Syntax errors preventing parsing
- Circular dependencies requiring refactor
- Missing files or broken imports
- Architecture-level changes needed

**If `/code-review` fails:** Retry once. If still fails: Stop, report error.
**If `/execute` (fix) fails:** Report which issues couldn't be fixed. If unfixable: Stop. If temporary: Continue.
**If `/commit` fails:** Report error (pre-commit hook?). Don't retry automatically.
**If user interrupts (Ctrl+C):** Save checkpoint, report progress, clean exit.
