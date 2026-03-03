# Task 4: Create .codex/skills/commit/SKILL.md

<!--
USAGE: codex "execute task-4 for codex-integration feature"
ONE session = ONE task brief. This is the FINAL task.
-->

---

## OBJECTIVE

Create `.codex/skills/commit/SKILL.md` — a Codex CLI skill that teaches Codex how to create
a conventional git commit: review current state, generate the commit message, run the artifact
completion sweep, stage relevant files (never `git add -A`), commit, update the pipeline
handoff file, and append a session note to memory.md.

---

## SCOPE

**Files touched:**
- `.codex/skills/commit/SKILL.md` — CREATE (new directory + new file)

**Out of scope:**
- Do NOT modify `.claude/commands/commit.md`
- Do NOT touch other skill files
- This is the final task — after completion, rename plan.md → plan.done.md

**Depends on:** Task 1 (AGENTS.md), Task 2 (execute skill), Task 3 (prime skill)

---

## PRIOR TASK CONTEXT

Tasks 1-3 have created:
- Updated `AGENTS.md` with inline sections (no @ includes)
- `.codex/skills/execute/SKILL.md` — execution skill
- `.codex/skills/prime/SKILL.md` — context loading skill

This is the final task. After it completes, all four tasks are done and the feature is
ready for review via `/code-loop codex-integration`.

---

## CONTEXT REFERENCES

### Commit Command Reference (`.claude/commands/commit.md` — full content)

```markdown
## Commit Process

### 1. Review Current State
git status
git diff HEAD

### 2. Generate Commit Message
Format: `type(scope): short description` (imperative mood, max 50 chars)
Types: feat, fix, refactor, docs, test, chore, perf, style, plan
Optional body: 3 bullet points max — what and why, not how

### 3. Stage and Commit

Before staging, run artifact completion sweep:
- Scan .agents/features/*/ for completed artifacts:
  - report.md → report.done.md (execution report — commit means it's final)
  - review.md → review.done.md (if all findings addressed in this commit)

git add {specific files}  # NEVER git add -A
git commit -m "{generated message}"

### 4. Confirm Success
git log -1 --oneline
git show --stat

### 5. Update Memory
Append to memory.md: session note, lessons/gotchas/decisions. 1-2 lines each.
Skip if memory.md doesn't exist.

### 5.5. Pipeline Handoff Write
After successful commit, write .agents/context/next-command.md:

# Pipeline Handoff
- **Last Command**: /commit
- **Feature**: {feature}
- **Next Command**: /pr {feature}
- **Timestamp**: {ISO 8601}
- **Status**: ready-for-pr

Derive feature from: commit scope → handoff file → most recent report.md

If commit FAILS:
- **Last Command**: /commit (failed)
- **Status**: blocked
- **Next Command**: /commit
Report the error clearly.
```

### Conventional Commit Types Reference

| Type | When to use |
|------|-------------|
| `feat` | New feature or capability |
| `fix` | Bug fix |
| `refactor` | Code restructuring without behavior change |
| `docs` | Documentation changes only |
| `test` | Adding or updating tests |
| `chore` | Build, tooling, config, dependency updates |
| `perf` | Performance improvement |
| `style` | Formatting, whitespace |
| `plan` | Planning artifacts (plan.md, task briefs) |

### Artifact Completion Sweep Reference

Before every commit, scan `.agents/features/{feature}/`:

| File | Rename to | When |
|------|-----------|------|
| `report.md` | `report.done.md` | When committing the feature's implementation |
| `review.md` | `review.done.md` | When all review findings addressed |
| `review-{N}.md` | `review-{N}.done.md` | When code-loop review is resolved |
| `loop-report-{N}.md` | `loop-report-{N}.done.md` | When loop is complete |

Never rename:
- `plan.md` → that's done by the execute skill
- `task-{N}.md` → that's done by the execute skill

### Pipeline Handoff Formats

**Success:**
```markdown
# Pipeline Handoff
<!-- Auto-updated by pipeline commands. Read by /prime. Do not edit manually. -->

- **Last Command**: /commit
- **Feature**: {feature}
- **Next Command**: /pr {feature}
- **Timestamp**: {ISO 8601 timestamp}
- **Status**: ready-for-pr
```

**Failure:**
```markdown
# Pipeline Handoff
<!-- Auto-updated by pipeline commands. Read by /prime. Do not edit manually. -->

- **Last Command**: /commit (failed)
- **Feature**: {feature}
- **Next Command**: /commit
- **Timestamp**: {ISO 8601 timestamp}
- **Status**: blocked
```

---

## PATTERNS TO FOLLOW

### Skill Frontmatter Pattern

```yaml
---
name: commit
description: Create a conventional git commit for the current changes. Use when the
             user asks to commit, save changes, create a commit, or push a commit.
             Trigger phrases: "commit my changes", "commit the changes", "save my work",
             "create a commit", "commit and push", "git commit".
---
```

### Scoped Staging Pattern (from commit command)

```bash
# CORRECT — scope to relevant files
git add src/auth.ts tests/auth.test.ts

# CORRECT — scope to directory
git add src/features/auth/

# WRONG — never use these
git add -A
git add .
git add --all
```

### Memory Update Pattern

```markdown
## Session Notes
- 2026-03-04: Implemented codex-integration — inlined AGENTS.md sections, created 3 Codex skills
```

---

## STEP-BY-STEP TASKS

### Step 1: Create the directory

```bash
mkdir -p .codex/skills/commit
```

### Step 2: Write the SKILL.md file

Create `.codex/skills/commit/SKILL.md` with the following exact content:

```markdown
---
name: commit
description: Create a conventional git commit for the current changes. Use when the user
             asks to commit, save changes, create a commit, finalize work, or wrap up a
             session. Trigger phrases: "commit my changes", "commit the changes",
             "save my work", "create a commit", "commit and push", "git commit",
             "wrap up", "finalize".
---

# Commit: Create Conventional Git Commit

## When to Use This Skill

Use this skill when you are ready to commit completed implementation work. This runs the
artifact completion sweep, stages relevant files (never the entire repo), creates a
conventional commit message, updates the pipeline handoff, and appends a session note
to memory.

**This skill does NOT push to remote.** Push is a separate step.

## Step 1: Review Current State

```bash
git status
git diff HEAD
```

Identify:
- Which files were modified as part of this feature/task
- Whether any `.agents/features/` artifacts need renaming (completion sweep)
- The feature name (from `.agents/context/next-command.md` Feature field, or from
  the most recent `.agents/features/*/report.md` path, or from git diff scope)

## Step 2: Artifact Completion Sweep

Before staging, rename completed artifacts in `.agents/features/{feature}/`:

- `report.md` → `report.done.md` (if this commit finalizes the execution report)
- `review.md` → `review.done.md` (if all review findings were addressed in this commit)
- `review-{N}.md` → `review-{N}.done.md` (if code-loop review is resolved)

Do NOT rename:
- `plan.md` or `task-{N}.md` — those are managed by the execute skill
- Any file that is not yet fully resolved

## Step 3: Generate Commit Message

Format: `type(scope): short description`
- `type`: feat / fix / refactor / docs / test / chore / perf / style / plan
- `scope`: feature name or module name (e.g., `auth`, `codex-integration`, `api`)
- `description`: imperative mood, max 50 chars (e.g., "add execute skill for Codex CLI")
- Optional body: 3 bullet points max — what and why, not how

Examples:
```
feat(codex-integration): add Codex CLI skills and inline AGENTS.md

- Add .codex/skills/ with execute, prime, and commit skills
- Inline 6 @ includes in AGENTS.md for Codex compatibility
- Skills auto-match user intent via description field
```

```
fix(auth): handle expired token refresh edge case
```

```
docs(readme): update pipeline diagram with Codex integration
```

**NEVER include `Co-Authored-By` lines.** Commits are authored solely by the user.

## Step 4: Stage Relevant Files

Stage ONLY files relevant to this feature/task. Never use `git add -A` or `git add .`

```bash
# Stage specific files
git add {file1} {file2} ...

# Or stage a specific directory
git add {directory}/

# NEVER do this:
# git add -A
# git add .
```

If unsure which files to stage: run `git status` again and include only files
that belong to the current feature. Skip unrelated modifications.

## Step 5: Commit

```bash
git commit -m "{generated message}"
```

If using a multi-line message:
```bash
git commit -m "feat(scope): short description

- Bullet 1
- Bullet 2
- Bullet 3"
```

## Step 6: Confirm Success

```bash
git log -1 --oneline
git show --stat
```

If commit FAILS (pre-commit hooks, merge conflict, empty commit):
- Report the error clearly: what failed, why, what to do
- Write failure handoff (Status: blocked, Next Command: /commit)
- Do NOT retry automatically — surface the error for the user

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

## Step 8: Update Memory (if memory.md exists)

Append to `memory.md` under `## Session Notes`:
```
- {YYYY-MM-DD}: {brief description of what was done — 1-2 sentences}
```

Do not repeat existing entries. Do not create memory.md if it doesn't exist.

## Output Report

```
Commit Hash: {hash}
Message:     {full message}
Files:       {list with change stats}
Summary:     X files changed, Y insertions(+), Z deletions(-)

Next: Push to remote (git push) then /pr {feature} to create a pull request.
```

## Key Rules

- NEVER use `git add -A` or `git add .` — always scope to relevant files
- NEVER include `Co-Authored-By` in commit messages
- Run artifact completion sweep BEFORE staging
- If commit fails, report error and write blocked handoff — do not retry silently
- Memory update is optional (skip if memory.md doesn't exist)
```

### Step 3: Verify the file

```bash
test -f .codex/skills/commit/SKILL.md && echo "OK" || echo "MISSING"
grep "name: commit" .codex/skills/commit/SKILL.md
grep "git add -A" .codex/skills/commit/SKILL.md  # should appear in the NEVER section
grep "Artifact Completion" .codex/skills/commit/SKILL.md
```

---

## TESTING STRATEGY

**Manual verification:**
1. Open Codex CLI in this project directory
2. Say: "commit my changes"
3. Verify: Codex loads the commit skill, runs git status, stages only relevant files
4. Verify: Codex generates a conventional commit message (type(scope): description format)
5. Verify: Codex does NOT use `git add -A`

**Edge cases:**
- Empty commit (nothing staged): Codex should report "nothing to commit" not error
- Pre-commit hook failure: Codex should report the hook error, not retry
- No memory.md: Codex should skip memory update without error

---

## VALIDATION COMMANDS

- **L1**: `test -f .codex/skills/commit/SKILL.md && echo OK`
- **L2**: `grep "name: commit" .codex/skills/commit/SKILL.md`
- **L3**: `grep "Artifact Completion" .codex/skills/commit/SKILL.md`
- **L4**: `grep "ready-for-pr" .codex/skills/commit/SKILL.md`
- **L5 Manual**: Read the skill — confirm it covers: git review, artifact sweep,
  message generation (type(scope): format), scoped staging, handoff write, memory update

---

## ACCEPTANCE CRITERIA

### Implementation
- [ ] `.codex/skills/commit/SKILL.md` exists
- [ ] Frontmatter has `name: commit` and trigger phrases in `description`
- [ ] Conventional commit message format documented (type(scope): description)
- [ ] `git add -A` explicitly forbidden
- [ ] Artifact completion sweep instructions present
- [ ] Pipeline handoff write present (success + failure formats)
- [ ] Memory update instructions present
- [ ] `Co-Authored-By` explicitly forbidden

### Runtime
- [ ] Codex auto-invokes this skill when asked to "commit changes"
- [ ] Codex generates type(scope): format messages
- [ ] Codex never stages unrelated files
- [ ] Codex updates handoff after commit

---

## HANDOFF NOTES

This is the FINAL task. After completing this task:
1. Rename `task-4.md` → `task-4.done.md`
2. Rename `plan.md` → `plan.done.md` (all 4 tasks complete)
3. Write final pipeline handoff:
   ```markdown
   # Pipeline Handoff
   <!-- Auto-updated by pipeline commands. Read by /prime. Do not edit manually. -->

   - **Last Command**: /execute (task 4 of 4)
   - **Feature**: codex-integration
   - **Next Command**: /code-loop codex-integration
   - **Task Progress**: 4/4 complete
   - **Timestamp**: {ISO 8601 timestamp}
   - **Status**: awaiting-review
   ```

The feature is now ready for Claude to run `/code-loop codex-integration` for review.

---

## COMPLETION CHECKLIST

- [ ] `.codex/skills/commit/` directory created
- [ ] `SKILL.md` written with full content
- [ ] Frontmatter verified (`name: commit`)
- [ ] `git add -A` forbidden rule present
- [ ] Artifact completion sweep documented
- [ ] Validation commands pass
- [ ] Rename: `task-4.md` → `task-4.done.md`
- [ ] Rename: `plan.md` → `plan.done.md` (ALL 4 tasks done)
- [ ] Write FINAL pipeline handoff to `.agents/context/next-command.md` (Status: awaiting-review)
