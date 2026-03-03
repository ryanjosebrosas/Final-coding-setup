---
name: commit
description: Create a conventional git commit for the current changes. Use when the user
             asks to commit, save changes, create a commit, finalize work, or wrap up a
             session. Trigger phrases: "commit my changes", "commit the changes",
             "save my work", "create a commit", "commit and push", "git commit",
             "wrap up the session", "finalize the work".
---

# Commit: Create Conventional Git Commit

## When to Use This Skill

Use this skill when implementation work is complete and ready to be committed. This skill:
1. Reviews what changed
2. Runs the artifact completion sweep (renaming .md → .done.md)
3. Stages only relevant files (never the entire repo)
4. Creates a conventional commit message
5. Updates the pipeline handoff file
6. Appends a session note to memory.md

**This skill does NOT push to remote.** Pushing is a separate step.

## Step 1: Review Current State

```bash
git status
git diff HEAD
```

Identify:
- Which files changed as part of the current feature/task
- The feature name — check `.agents/context/next-command.md` Feature field first,
  then fall back to the most recent `.agents/features/*/report.md` path

## Step 2: Artifact Completion Sweep

Before staging anything, rename completed artifacts in `.agents/features/{feature}/`:

| If this file exists... | And this does NOT exist... | Then rename... |
|------------------------|---------------------------|----------------|
| `report.md` | `report.done.md` | `report.md` → `report.done.md` |
| `review.md` | `review.done.md` | `review.md` → `review.done.md` |
| `review-{N}.md` | `review-{N}.done.md` | `review-{N}.md` → `review-{N}.done.md` |
| `loop-report-{N}.md` | `loop-report-{N}.done.md` | rename it |

Do NOT rename:
- `plan.md` or `task-{N}.md` — those are managed by the execute skill
- Any artifact not yet fully resolved

Only rename artifacts in feature folders relevant to this commit's changes.

## Step 3: Generate Commit Message

Format: `type(scope): short description`

**Types:**
| Type | When to use |
|------|-------------|
| `feat` | New feature or capability added |
| `fix` | Bug fix |
| `refactor` | Code restructuring without behavior change |
| `docs` | Documentation only changes |
| `test` | Adding or updating tests |
| `chore` | Build process, tooling, config, dependencies |
| `perf` | Performance improvement |
| `style` | Formatting, whitespace, missing semicolons |
| `plan` | Planning artifacts only (plan.md, task briefs) |

**Rules:**
- `scope` = feature name or module (e.g., `auth`, `codex-integration`, `api`)
- `description` = imperative mood, max 50 chars (e.g., "add execute skill for Codex CLI")
- Optional body: 3 bullet points max — what and why, not how

**Examples:**
```
feat(codex-integration): add Codex CLI skills and inline AGENTS.md

- Add .codex/skills/ with execute, prime, and commit skills
- Inline 6 @ includes in AGENTS.md for universal Codex compatibility
- Skills auto-match user intent via frontmatter description field
```

```
fix(auth): handle expired token refresh edge case
```

```
chore(deps): upgrade typescript to 5.4
```

**NEVER include `Co-Authored-By` lines.** Commits are authored solely by the user.

## Step 4: Stage Relevant Files

Stage ONLY files relevant to this feature/task. Never stage the entire repo.

```bash
# Stage specific files
git add path/to/file1 path/to/file2

# Or stage a specific directory
git add src/features/auth/

# Also include any renamed .done.md artifacts
git add .agents/features/{feature}/

# NEVER do any of these:
# git add -A
# git add .
# git add --all
```

If unsure which files to stage: run `git status` again and include only files
that belong to the current feature. Skip unrelated modifications.

## Step 5: Commit

```bash
git commit -m "type(scope): short description"
```

For a multi-line message:
```bash
git commit -m "feat(scope): short description

- Bullet point 1 — what and why
- Bullet point 2
- Bullet point 3"
```

## Step 6: Confirm Success

```bash
git log -1 --oneline
git show --stat
```

**If commit FAILS** (pre-commit hooks, merge conflict, empty commit):
- Report the error clearly: what failed, why, what the user should do
- Write failure handoff (see Step 7 failure format)
- Do NOT retry automatically — surface the error

## Step 7: Update Pipeline Handoff

Write `.agents/context/next-command.md`:

**On success:**
```
# Pipeline Handoff
<!-- Auto-updated by pipeline commands. Read by /prime. Do not edit manually. -->

- **Last Command**: /commit
- **Feature**: {feature}
- **Next Command**: /pr {feature}
- **Timestamp**: {ISO 8601 timestamp}
- **Status**: ready-for-pr
```

**On failure:**
```
# Pipeline Handoff
<!-- Auto-updated by pipeline commands. Read by /prime. Do not edit manually. -->

- **Last Command**: /commit (failed)
- **Feature**: {feature}
- **Next Command**: /commit
- **Timestamp**: {ISO 8601 timestamp}
- **Status**: blocked
```

Derive `{feature}` from (in priority order):
1. `.agents/context/next-command.md` Feature field
2. Commit scope (e.g., `feat(auth):` → `auth`)
3. Most recent `.agents/features/*/report.md` path

## Step 8: Update Memory (if memory.md exists)

Append to `memory.md` under `## Session Notes`:
```
- {YYYY-MM-DD}: {1-2 sentence description of what was done and any key decisions}
```

- Do not repeat existing entries
- Do not create `memory.md` if it doesn't exist — skip this step
- Keep each entry to 1-2 sentences

## Output

```
Commit Hash: {hash}
Message:     {full commit message}
Files:       {list with change stats}
Summary:     X files changed, Y insertions(+), Z deletions(-)

Next: Push to remote (git push), then /pr {feature} in Claude to create a pull request.
```

## Key Rules

- NEVER use `git add -A`, `git add .`, or `git add --all`
- NEVER include `Co-Authored-By` lines in commit messages
- Run artifact completion sweep BEFORE staging
- If commit fails: report error + write blocked handoff — do not retry silently
- Memory update is optional — skip if memory.md does not exist
- One commit per session is normal — don't batch unrelated changes
