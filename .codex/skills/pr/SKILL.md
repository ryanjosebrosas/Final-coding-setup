---
name: pr
description: Create an isolated feature branch and pull request with evidence-based body.
             Use when the user wants to open a pull request for a completed feature.
             Trigger phrases include: "create PR", "open pull request", "push and create PR",
             "create a pull request", "open a PR", "submit PR", "make a pull request",
             "push feature branch".
---

# PR: Pull Request Creation

## When to Use This Skill

Use this skill after a feature is committed and ready for review. The PR creation
process isolates the feature commits onto a clean branch from remote main.

## Branch Isolation — Why Cherry-Pick

Local main accumulates commits from ALL features across ALL sessions. Pushing local main
as a feature PR includes unrelated commits in the diff.

**Correct approach:**
1. `git checkout -b feat/{feature} {REMOTE}/{MAIN}` — fresh branch from remote main
2. `git cherry-pick {commits}` — oldest first, only this feature's commits
3. `git push {REMOTE} feat/{feature} -u`
4. `git checkout {original-branch}` — return to original branch

**Result:** The PR diff shows exactly what changed for this feature. Nothing else.

## Cherry-Pick Scoping — Three-Step Identification

The hardest part: which commits belong to this feature?

1. **Identify feature name** — from argument, latest `report.done.md`, or latest commit scope
2. **Parse files touched** — read `.agents/features/{feature}/report.done.md` Meta Information
3. **Intersect with unpushed commits**:
   ```bash
   git log {REMOTE}/{MAIN}..HEAD --oneline -- {feature-files}
   ```

**Cherry-pick order**: always oldest first (ascending date). Reverse order causes
conflicts that don't exist chronologically.

**Empty intersection**: show all unpushed commits and ask the user which belong to the feature.

## PR Body Quality

Build the PR body from the execution report, not from the commit message:

**## What (2-4 bullets)** — specific, not generic:
Good: "Add .codex/skills/ with mvp, prd, planning, council, code-review-fix, system-review, pr, final-review skills"
Bad: "Add skill files"

**## Why (1-2 sentences)** — the problem solved:
Good: "Codex CLI lacked quality reasoning for 8 pipeline commands — skills provide the
  judgment criteria that command files don't contain"
Bad: "This improves the system"

**## Changes** — files grouped by area with one-line descriptions

**## Testing** — actual validation results, not intentions:
Good: "L1: grep validations pass — all 8 skill files present, correct frontmatter"
Bad: "Tested manually"

**## Notes** — breaking changes, migration steps, or "None"

## Conflict Handling

If cherry-pick conflicts:
1. `git cherry-pick --abort`
2. `git branch -D {branch-name}`
3. Report: "Cherry-pick conflict on {commit} in {files}. Resolve manually."

Never auto-resolve conflicts.

## Key Rules

1. **Branch from remote main** — never push local main as a feature branch
2. **Cherry-pick oldest first** — chronological order avoids unnecessary conflicts
3. **Scope from execution report** — read report.done.md before deciding what to include
4. **One PR per feature** — don't mix features in one PR
5. **PR body from artifacts** — report.done.md, not just the commit message
6. **Conflict = abort and report** — never auto-resolve cherry-pick conflicts
7. **Return to original branch** — always checkout master/main after push

## Related Commands

- `/pr` — The PR creation workflow this skill supports
- `/commit` — Creates the commits this skill cherry-picks
- `/code-loop` — Produces the clean state that /commit and /pr operate on
