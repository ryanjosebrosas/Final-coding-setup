---
name: pr
description: Knowledge framework for isolated feature branch creation, cherry-pick scoping, and evidence-based PR body generation
license: MIT
compatibility: claude-code
---

# PR — Pull Request Creation Methodology

This skill provides the quality standards for creating pull requests that are cleanly
isolated to the feature they represent. It complements the `/pr` command — the command
provides the workflow, this skill provides the rationale for branch isolation, cherry-pick
scoping, and PR body quality.

## When This Skill Applies

- `/pr {feature}` is invoked after a feature is committed
- A pull request needs to be created from local commits
- A feature branch needs to be created from the main branch
- PR title and body need to be generated from execution artifacts

## Branch Isolation — Why It Matters

The core discipline of PR creation is branch isolation: the feature branch must contain
ONLY the commits that belong to the feature. This requires branching from remote main
and cherry-picking, not pushing local main.

**Why not push local main directly:**

Local main accumulates commits from ALL features and sessions. If local main contains:
- feat(user-auth): implement login flow
- chore: fix typo in README
- feat(codex-integration): add Codex CLI skills

And you push local main as the PR branch for `user-auth`, the PR includes all three
commits — even if only the first one belongs to user-auth.

**The correct approach:**
1. `git checkout -b feat/user-auth {REMOTE}/{MAIN_BRANCH}` — fresh branch from remote main
2. `git cherry-pick {user-auth-commits}` — bring only the user-auth commits
3. `git push {REMOTE} feat/user-auth -u` — isolated branch on remote
4. `git checkout master` — return to original branch

**Result:** The feature branch contains exactly the user-auth commits on top of remote main.
The PR diff shows exactly what changed for this feature. Nothing else.

## Cherry-Pick Scoping — Identifying the Right Commits

The hardest part of PR creation is correctly identifying which commits belong to the feature.
The /pr command uses a three-step approach to determine this:

**Step 1: Identify the feature name**
Priority: explicit argument → latest execution report file path → latest commit scope

**Step 2: Parse files touched from execution report**
Read `.agents/features/{feature}/report.done.md` Meta Information section.
Extract "Files added" and "Files modified" lists.

**Step 3: Intersect with unpushed commits**
```bash
git log {REMOTE}/{MAIN_BRANCH}..HEAD --oneline -- {feature-files}
```
This finds only commits that touched the feature's files.

**When the intersection is empty:**
The feature files may already be pushed, or the commit scope in git log may be different
from what the report listed. In this case, show all unpushed commits and ask the user
which ones belong to the feature before proceeding.

**Cherry-pick order matters:**
Always cherry-pick oldest commit first (ascending by date). Cherry-picking in reverse
order can cause conflicts that wouldn't exist in chronological order.

## PR Body Quality Standards

A PR body should help the reviewer understand the change without having to read every line of code.
Quality standard by section:

**## What (2-4 bullets):**
Each bullet must be specific and concrete:
Good: "Add .codex/skills/ with execute, prime, commit, code-review, and code-loop skills"
Bad: "Add skill files"

The bullets should cover: what was created, what was modified, what behavior changed.

**## Why (1-2 sentences):**
Answers: why was this change needed? What problem does it solve?
Good: "Codex CLI could not read .claude/ sections because it doesn't expand @ includes —
  inlining them and adding .codex/ skills enables full pipeline support from Codex CLI"
Bad: "This was needed to improve the system"

**## Changes (files grouped by area):**
Group modified files by area with one-line descriptions:
```
AGENTS.md — inlined 6 @ sections for universal compatibility
.codex/skills/execute/SKILL.md — entry gate + task brief execution
.codex/skills/prime/SKILL.md — context loading + pending work detection
```

**## Testing:**
Report actual validation results, not intentions:
Good: "L1: grep validations passed (0 @ includes in AGENTS.md, all 3 skill files present)"
Bad: "Tested manually"

**## Notes:**
Breaking changes, migration steps, known limitations:
"The .codex/ folder must not be in .gitignore for Codex CLI to find skills"
If none: "None"

## Execution Report as PR Body Source

The execution report (`.agents/features/{feature}/report.done.md`) contains everything
needed for a high-quality PR body:
- Meta Information → "## Changes" section (files added/modified)
- Completed Tasks → "## What" bullets (what was built)
- Validation Results → "## Testing" section
- Issues & Notes → "## Notes" section

Reading the report before writing the PR body produces a PR that is accurate and specific,
not generic. Generating the PR body without reading the report produces a PR that summarizes
the commit message, not the actual implementation.

## Conflict Handling

If cherry-pick conflicts:
1. Report which commit conflicted and which files
2. Do NOT auto-resolve — conflicts require human judgment about intent
3. Clean up the partial cherry-pick: `git cherry-pick --abort`
4. Delete the partially-created feature branch: `git branch -D {branch-name}`
5. Report to user: "Cherry-pick conflict on {commit} in {files}. Resolve manually
   or adjust the commit scope."

## One PR Per Feature Slice

This rule prevents PRs that are too large to review effectively:
- Each /pr invocation creates one feature branch for one feature/slice
- If multiple features were committed in the same session, create separate PRs
- If unsure about scope, err toward smaller PRs — they are faster to review and merge

## Anti-Patterns

**Pushing local main** — Local main contains all commits from all sessions. Pushing it
as a feature branch includes unrelated commits in the PR.

**Manual cherry-pick selection** — "I'll cherry-pick the important ones" without
intersecting with the feature's files. This produces inconsistent scoping.

**Generic PR body** — Generating a PR body from the commit message alone produces
one line of description for a change that may be 30 files. Read the execution report.

**Cherry-pick in reverse order** — Cherry-picking newest-first causes conflicts that
don't exist in chronological order.

**Not returning to original branch** — Forgetting `git checkout {original-branch}`
after pushing the feature branch leaves the session on the feature branch.

**Multiple features in one PR** — Mixing commits from different features makes
the PR harder to review, harder to revert if needed, and harder to understand.

## Key Rules

1. **Branch from remote main, not local HEAD** — Isolation guarantee
2. **Cherry-pick oldest first** — Chronological order avoids unnecessary conflicts
3. **Scope from execution report** — Read Meta Information before deciding what to include
4. **One PR per feature** — Don't mix features; keep PR diff focused
5. **PR body from execution artifacts** — report.done.md, not just the commit message
6. **Conflict = abort and report** — Never auto-resolve cherry-pick conflicts
7. **Return to original branch** — Always checkout master/main after push

## Related Commands

- `/pr {feature}` — The PR creation workflow this skill supports
- `/commit` — Creates the commits this skill cherry-picks into the feature branch
- `/code-loop {feature}` — Produces the clean state that /commit then /pr operate on
- `/prime` — Reads the pipeline handoff written after PR creation
