# Task 10: Create Commit Skill

## Objective

Create `.claude/skills/commit/SKILL.md` — a knowledge framework for commit quality:
type/scope selection guidance, artifact completion sweep discipline, scoped staging
rationale, and conventional message standards.

## Scope

- **File to create**: `.claude/skills/commit/SKILL.md`
- **Out of scope**: Do NOT modify `.claude/commands/commit.md`
- **Dependencies**: None

## Prior Task Context

Tasks 1-9 complete. Task 10 begins the delivery phase skills. Commit is the first
delivery step — it finalizes the implementation into git history.

## Context References

### Reference: .claude/commands/commit.md (full content)

```markdown
---
description: Create git commit with conventional message format
model: claude-haiku-4-5-20251001
---

## Step 1: Review Current State
git status, git diff HEAD.

## Step 2: Generate Commit Message
Format: type(scope): short description (imperative, max 50 chars)
Types: feat, fix, refactor, docs, test, chore, perf, style, plan
Optional body: 3 bullets max — what and why, not how

## Step 3: Artifact Completion Sweep
Scan .agents/features/*/ for completed artifacts.
Rename: report.md → report.done.md, review.md → review.done.md, etc.

## Step 3 (continued): Stage and Commit
git add {specific files} — NEVER git add -A, git add ., or git add --all
git commit -m "{message}"

## Step 4: Confirm Success
git log -1 --oneline && git show --stat

## Step 5: Update memory.md
Append session note if memory.md exists. Skip if absent.

## Step 5.5: Pipeline Handoff Write
Status: ready-for-pr, Next Command: /pr {feature}

## Key Rules
- Never git add -A
- Stage only relevant files
- No Co-Authored-By lines
```

## Step-by-Step Tasks

### IMPLEMENT: Create `.claude/skills/commit/SKILL.md`

```markdown
---
name: commit
description: Knowledge framework for conventional commit quality, artifact sweep discipline, and scoped staging
license: MIT
compatibility: claude-code
---

# Commit — Conventional Commit Methodology

This skill provides the quality standards for creating meaningful, well-scoped git commits.
It complements the `/commit` command — the command provides the workflow, this skill
provides the criteria for type/scope selection, artifact sweep completeness, and staging discipline.

## When This Skill Applies

- `/commit` is invoked to finalize implementation work
- Changes need to be committed after review-fix cycle completes
- Artifact completion sweep needs to run before staging
- Conventional commit message needs to be generated

## Commit Type Selection

Choosing the wrong commit type degrades the git log's signal value. Selection guide:

| Type | Use when | NOT when |
|------|----------|----------|
| `feat` | New capability added that didn't exist before | Improving existing capability |
| `fix` | A bug that caused incorrect behavior is corrected | Improving code style or readability |
| `refactor` | Code restructured WITHOUT behavior change | Code restructured AND behavior changed |
| `docs` | ONLY documentation changed | Docs changed alongside code (use feat/fix) |
| `test` | ONLY test files changed | Tests added alongside feature (use feat) |
| `chore` | Tooling, config, dependencies, build scripts | Actual product functionality |
| `perf` | Performance improvement WITH measurable evidence | Speculative optimization |
| `style` | Whitespace, formatting, missing semicolons | Logic changes |
| `plan` | Planning artifacts ONLY (plan.md, task briefs) | Any code file changed |

**The ambiguous cases:**

`feat` vs `chore` — Adding a new skill file or command is `feat`, not `chore`.
`chore` is for maintenance work: dependency upgrades, CI config, gitignore changes.

`fix` vs `refactor` — If the code was wrong before (incorrect behavior), it's `fix`.
If the code was correct but structured poorly, it's `refactor`. When in doubt: did
the behavior change? Yes → `fix` or `feat`. No → `refactor`.

`docs` vs `feat` — If the documentation describes a NEW capability that was also
implemented in this commit, use `feat` (the feature is the primary change, docs are secondary).
Use `docs` ONLY when the commit contains documentation changes with zero code changes.

## Scope Selection

Scope identifies the affected module or feature:
- For feature work: use the feature slug (e.g., `codex-integration`, `user-auth`)
- For module work: use the module name (e.g., `api`, `auth`, `db`)
- For system-wide changes: use the system name (e.g., `pipeline`, `config`)
- For project root changes: scope is optional (omit it if nothing better applies)

Scope must be consistent across commits for the same feature. If the last commit
was `feat(codex-integration):`, the follow-up is also `(codex-integration):`, not `(codex):`.

## Commit Message Quality

The short description (max 50 chars) must be:
- **Imperative mood**: "add", "fix", "remove" — not "added", "fixed", "removes"
- **Specific**: "add execute skill for Codex CLI" not "add skill"
- **Honest about scope**: "add 3 Codex CLI skills" not "add skills" (if 3 is the count)
- **Under 50 characters**: git log --oneline truncates longer messages; important context is lost

**Body bullets (when needed):**
Use a body when the short description can't capture the "why":
```
feat(codex-integration): add Codex CLI skills and inline AGENTS.md

- Add .codex/skills/ with execute, prime, and commit skills
- Inline 6 @ includes in AGENTS.md for universal Codex compatibility
- Skills auto-match user intent via frontmatter description field
```

Body bullets answer: what did we do, and why was it necessary? Not: how did we do it
(that's in the code). Max 3 bullets.

**Never include:** Co-Authored-By lines. The commit is authored by the user.

## Artifact Completion Sweep Discipline

The sweep runs BEFORE staging. Purpose: ensure `.agents/features/{feature}/` artifacts
accurately reflect completion state before they enter git history.

**What to rename:**
- `report.md` → `report.done.md` — execution is committed, report is final
- `review.md` → `review.done.md` — if all review findings were addressed
- `review-{N}.md` → `review-{N}.done.md` — if this review cycle is complete

**What NOT to rename:**
- `plan.md` / `task-{N}.md` — managed by /execute; should already be `.done.md` if complete
- Any artifact where findings are NOT yet resolved
- Artifacts for features OTHER than the one being committed

**Why the sweep matters:**
The `.done.md` suffix is how `/prime` detects pipeline state. If `report.md` is committed
without renaming, `/prime` in the next session will show the feature as "awaiting commit"
even after the commit ran — a stale state that confuses the pipeline.

## Scoped Staging Discipline

The rule: stage ONLY files relevant to the current feature's commit.

**Why `git add -A` is forbidden:**
The working directory often contains unrelated changes — WIP on other features,
experimental files, debug additions, generated files. `git add -A` commits all of them
into the current feature's history, mixing unrelated work and making future bisects or
reverts much harder.

**Staged files should pass the relevance test:**
"Does this file change as a direct result of the feature being committed?"
- Yes → stage it
- Maybe → stage it and note it in the commit message
- No → do NOT stage it

**Typical commit staging scope:**
```bash
git add .agents/features/{feature}/          # all feature artifacts
git add {source files changed by the feature}
git add AGENTS.md                            # if modified as part of the feature
```

**Not:** `git add .`

## Handoff Write Standards

After a successful commit, the handoff must reflect the actual state:
```markdown
- Last Command: /commit
- Feature: {feature}  ← derived from commit scope or previous handoff
- Next Command: /pr {feature}
- Status: ready-for-pr
```

If the commit failed (pre-commit hook, empty commit, conflict):
```markdown
- Last Command: /commit (failed)
- Status: blocked
- Next Command: /commit
```

The blocked handoff preserves the feature name so /prime can show the exact next step.

## Anti-Patterns

**`git add -A`** — Stages all files in the working tree regardless of relevance.
Contaminates the feature's commit with unrelated changes.

**Wrong commit type** — Using `chore` for feature work, or `feat` for documentation-only
changes. Degrades the git log's usefulness for future contributors.

**Vague message** — "fix stuff", "updates", "wip" — provides zero signal in git log.

**Skipping the artifact sweep** — Committing with `report.md` still named as such.
/prime will show the feature as still in progress in the next session.

**Adding Co-Authored-By** — The commit is the user's work. Attribution lines add noise.

## Key Rules

1. **Artifact sweep before staging** — Rename .md → .done.md for completed artifacts
2. **Stage only relevant files** — Never git add -A, git add ., git add --all
3. **Imperative mood in description** — "add" not "added"
4. **Type accuracy matters** — feat vs chore vs refactor have different semantic meanings
5. **Under 50 chars in description** — git log truncates longer messages
6. **Handoff after every commit** — Success or failure, update next-command.md
7. **No Co-Authored-By** — The commit is authored by the user

## Related Commands

- `/commit` — The git commit workflow this skill supports
- `/code-loop {feature}` — Runs before /commit; produces the clean state to commit
- `/pr {feature}` — Creates the pull request from commits this skill helps create
- `/prime` — Reads the pipeline handoff written after each commit
```

### VALIDATE

```bash
grep -c "name: commit" .claude/skills/commit/SKILL.md
grep -c "When This Skill Applies" .claude/skills/commit/SKILL.md
grep -c "Key Rules" .claude/skills/commit/SKILL.md
grep -c "Anti-Patterns" .claude/skills/commit/SKILL.md
```

## Validation Commands

```bash
# L1
grep -c "name: commit" .claude/skills/commit/SKILL.md
grep -c "compatibility: claude-code" .claude/skills/commit/SKILL.md
grep -c "When This Skill Applies" .claude/skills/commit/SKILL.md
grep -c "Key Rules" .claude/skills/commit/SKILL.md
# L2-L5: N/A
```

## Acceptance Criteria

### Implementation
- [ ] `.claude/skills/commit/SKILL.md` exists
- [ ] Covers commit type selection with examples
- [ ] Covers artifact sweep discipline
- [ ] Covers scoped staging with rationale
- [ ] Has Anti-Patterns and Key Rules sections

## Handoff Notes

Task 11 (final) creates `.claude/skills/pr/SKILL.md`. Focus: branch isolation rationale,
cherry-pick scoping, PR body quality from execution report, report-driven scope detection.

## Completion Checklist

- [ ] `.claude/skills/commit/SKILL.md` created
- [ ] All grep validations pass
- [ ] `task-10.md` → `task-10.done.md` rename completed
