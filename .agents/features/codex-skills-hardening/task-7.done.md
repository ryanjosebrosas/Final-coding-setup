# Task 7: Create PR Skill (Codex)

## Objective

Create `.codex/skills/pr/SKILL.md` — a Codex CLI skill for creating pull requests that adds
reasoning depth: branch isolation guarantee, scope verification, commit dirty-state gate,
PR body quality criteria, and the cherry-pick discipline.

## Scope

- **File to create**: `.codex/skills/pr/SKILL.md`
- **Out of scope**: Do NOT modify `.opencode/commands/pr.md`
- **Dependencies**: None

## Prior Task Context

Task 6 created `.codex/skills/system-review/SKILL.md` — a process analysis skill.
PR skill is a git workflow skill. Same frontmatter pattern but the body focuses on what
makes a PR safe to merge: isolated branch, correct commit scope, clean diff for reviewers.

## Context References

### Reference: Source Command — `.opencode/commands/pr.md` (key sections)

```markdown
---
description: Create feature branch, push, and open PR
---

## Prerequisites
- Commit must already exist (run /commit first)
- If working tree is dirty, report and exit

## Step 2: Determine Branch Name and Scope

Branch naming convention: feat/<short-name>, fix/<short-name>, chore/<short-name>

## Step 4: Create Isolated Feature Branch and Push

Critical: The feature branch must contain ONLY the PR's commits — not the full local history.

# 1. Branch from remote main (not local HEAD) — clean base with no extra commits
git checkout -b <branch-name> {REMOTE}/{MAIN_BRANCH}

# 2. Cherry-pick only the selected feature commits (oldest first)
git cherry-pick <commit-sha-1> <commit-sha-2> ...

# 3. Push only this branch
git push {REMOTE} <branch-name> -u

# 4. Return to original branch
git checkout <original-branch>

If cherry-pick conflicts:
- Report which commit conflicted and which files
- Do NOT auto-resolve — stop and surface to user

## Step 5: Generate PR Title and Body

Title format: type(scope): description (conventional commit format, max 72 chars)

Body format:
## What
- {2-4 bullets: what changed, specific and concrete}

## Why
{1-2 sentences: why this was needed}

## Changes
{Files changed grouped by area with 1-line description each}

## Testing
{Test results, validation commands run, pass/fail}

## Notes
{Breaking changes, migration steps, known skips — or "None"}

## Notes
- Branch from {REMOTE}/{MAIN_BRANCH}, not from local HEAD
- Never push local master/main to remote
- One PR per feature/slice
```

### Reference: Codex skill frontmatter pattern

```yaml
---
name: code-review-fix
description: Fix issues identified in a code review report, processing findings by severity
             and applying fixes systematically. Use when the user wants to fix code review
             findings, address review issues, process a review report, or fix bugs from a
             review. Trigger phrases include: "fix review findings", "address the review",
             "code review fix", "fix the issues from review", "process review findings",
             "fix critical issues", "code-review-fix".
---
```

## Patterns to Follow

### Pattern: Branch isolation — WHY remote main, not local HEAD

Command says: "Branch from remote main (not local HEAD)."
Skill explains: WHY this matters. If you branch from local HEAD and local master has
10 other commits from other features, your PR branch will contain ALL those commits —
polluting the PR with changes you didn't intend to include.

Branching from `{REMOTE}/{MAIN_BRANCH}` guarantees a clean base: only cherry-picked
commits appear in the diff.

### Pattern: Dirty state gate

Running `/pr` with uncommitted changes is dangerous because git status shows a misleading
picture — you think you're capturing "what you built" but you're missing uncommitted work.
The dirty state gate exists to protect the user from accidentally opening a PR that doesn't
include their latest changes.

### Pattern: PR body quality

Bad PR body: "Fixed some bugs and added features"
Good PR body: Uses the What/Why/Changes/Testing/Notes format with specific bullet points,
concrete evidence of tests passing, and explicit notes about breaking changes or deferreds.

Reviewers use the PR body to decide whether to approve. A vague body forces them to read
every line of diff. A good body tells them what to focus on.

## Step-by-Step Tasks

### IMPLEMENT: Create `.codex/skills/pr/SKILL.md`

```markdown
---
name: pr
description: Create an isolated feature branch, cherry-pick the feature's commits, push,
             and open a pull request. Use when the user wants to create a PR, push a feature
             branch, open a pull request, or share work for review. Trigger phrases include:
             "create PR", "open a pull request", "push and PR", "create a pull request",
             "make a PR", "pr", "push for review".
---

# PR: Create Branch and Pull Request

## When to Use This Skill

Use this skill when:
- `/pr [feature-name]` is invoked
- A commit exists and needs to be turned into a pull request
- The user wants to open work for review without polluting the main branch

## Prerequisite Gate (Non-Skippable)

Before any git work:

1. **Clean working tree check**:
   ```bash
   git status
   ```
   If any uncommitted changes exist: stop and report "Uncommitted changes detected. Run
   `/commit` first."

   **Why:** Uncommitted changes mean the PR won't capture all your work. You'll open a PR
   that's missing the latest changes — reviewers will see an incomplete implementation.
   Never open a PR from a dirty working tree.

2. **Commit exists check**: Verify there is at least one unpushed commit on the current branch.
   If not: "No unpushed commits found. Nothing to PR."

## Branch Isolation Guarantee

**Critical rule: branch from `{REMOTE}/{MAIN_BRANCH}`, NOT from local HEAD.**

**Why this matters:**
If you branch from local HEAD, your local master may have N other commits from other features
that aren't ready to merge. Your "feature branch" would then contain ALL those commits —
and your PR diff would show all that unrelated work.

Branching from remote main guarantees the base is clean. Cherry-picking brings ONLY the
selected feature commits. The PR diff shows exactly and only what this feature changed.

**The isolation sequence:**
```bash
# 1. Branch from remote main — clean base
git checkout -b feat/feature-name origin/main

# 2. Cherry-pick only the feature's commits (oldest first)
git cherry-pick <sha1> <sha2> ...

# 3. Push this isolated branch
git push origin feat/feature-name -u

# 4. Return to your working branch
git checkout master  # or wherever you were
```

**Result:** Remote branch contains exactly the feature commits on top of main. Nothing else.

## Cherry-Pick Conflicts

If cherry-pick conflicts occur:
- Stop immediately
- Report which commit conflicted and which files are conflicting
- Do NOT auto-resolve — surface to user

**Why not auto-resolve:** Auto-resolving conflicts silently makes assumptions about what
"your intent" was. A conflict means git can't determine the right answer — the human must
decide. Auto-resolution in a PR branch can corrupt the feature's changes.

## Branch Naming Convention

Follow the type prefix pattern:
- `feat/<short-name>` — new feature or capability
- `fix/<short-name>` — bug fix
- `chore/<short-name>` — maintenance, refactoring, tooling

Short-name format: lowercase, hyphens only, max 30 chars.
Examples: `feat/user-auth`, `fix/null-session-check`, `chore/update-deps`

If arguments provide a feature name, use it directly. Otherwise derive from the commit
message: `feat(auth): add session management` → `feat/auth-session-management`.

## PR Body Quality

The PR body is the first thing reviewers read. It determines whether they understand
what to focus on before diving into the diff.

**Required format:**
```
## What
- {2-4 bullets: what changed, specific and concrete — "Added null check for user.session
  in auth.ts:45" not "Fixed auth bug"}

## Why
{1-2 sentences: why this was needed — link to issue, user story, or technical reason}

## Changes
{Files changed grouped by area:
  Auth: auth.ts, auth.test.ts
  Types: types/user.ts}

## Testing
{Test results: "All 47 tests pass. New tests in auth.test.ts cover session expiry."}

## Notes
{Breaking changes, migration steps, or "None"}
```

**Bad PR body (DO NOT generate):**
"Fixed some issues and improved the codebase."

**Good PR body:**
```
## What
- Added null check for user.session before accessing session.token (auth.ts:45)
- Added test coverage for expired session scenario (auth.test.ts:88)

## Why
Null session caused TypeError crash when users had expired tokens — #234

## Changes
Auth: src/auth.ts, src/auth.test.ts

## Testing
47/47 tests pass. New: session expiry test (auth.test.ts:88-102)

## Notes
None
```

## Key Rules

1. **Clean working tree first** — dirty state → stop, run `/commit` first
2. **Branch from remote main, not local HEAD** — isolation guarantee
3. **Cherry-pick only feature commits** — never push unrelated commits to the PR branch
4. **Do NOT auto-resolve conflicts** — stop and surface to user
5. **Return to original branch** after pushing feature branch
6. **Never push local master/main** — always use an isolated feature branch
7. **PR body must use the structured format** — What/Why/Changes/Testing/Notes
```

### VALIDATE

```bash
grep -c "name: pr" .codex/skills/pr/SKILL.md
grep -c "When to Use This Skill" .codex/skills/pr/SKILL.md
grep -c "Key Rules" .codex/skills/pr/SKILL.md
grep -c "Trigger phrases" .codex/skills/pr/SKILL.md
grep -c "isolation" .codex/skills/pr/SKILL.md
```

## Testing Strategy

No unit tests — markdown. L1 grep + manual review that skill covers branch isolation
rationale (WHY remote main not local HEAD), dirty state gate (WHY), cherry-pick conflict
handling, and PR body quality criteria with examples.

## Validation Commands

```bash
# L1
grep -c "name: pr" .codex/skills/pr/SKILL.md
grep -c "When to Use This Skill" .codex/skills/pr/SKILL.md
grep -c "Key Rules" .codex/skills/pr/SKILL.md
grep -c "Trigger phrases" .codex/skills/pr/SKILL.md
grep -c "Cherry-Pick" .codex/skills/pr/SKILL.md

# L2-L5: N/A
```

## Acceptance Criteria

### Implementation
- [ ] `.codex/skills/pr/SKILL.md` exists
- [ ] Frontmatter has `name: pr` and trigger phrases
- [ ] Has `## When to Use This Skill` section
- [ ] Has prerequisite gate with dirty state check explanation
- [ ] Has branch isolation guarantee section (WHY remote main, not local HEAD)
- [ ] Has cherry-pick conflict handling (stop, don't auto-resolve)
- [ ] Has PR body quality section with good/bad examples
- [ ] Has `## Key Rules` section

### Runtime
- [ ] Codex matches this skill when user says "create PR" or "push for review"

## Handoff Notes

Task 8 creates `.codex/skills/final-review/SKILL.md`. Final review is the pre-commit
approval gate. Focus: read-only discipline (no fixes in final-review), acceptance criteria
verification, verdict standards, and the "ask, don't auto-commit" rule.

## Completion Checklist

- [ ] `.codex/skills/pr/SKILL.md` created
- [ ] All grep validations pass
- [ ] `task-7.md` → `task-7.done.md` rename completed
