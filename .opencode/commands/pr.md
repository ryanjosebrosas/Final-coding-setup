---
description: Create feature branch, push, and open PR
---

# PR: Create Branch and Pull Request

## Arguments

`$ARGUMENTS` — Optional: feature name for the branch (e.g., `supabase-provider`), or PR title override

(If no arguments, derive branch name from the latest commit message)

## Prerequisites

- Commit must already exist (run `/commit` first)
- If working tree is dirty, report and exit

---

## Step 1: Gather Context

```bash
git status
git log -5 --oneline
git remote -v
git branch --show-current
```

**If working tree is dirty (uncommitted changes):**
- Report: "Uncommitted changes detected. Run `/commit` first."
- Exit — do NOT commit automatically.

---

## Step 2: Determine Branch Name and Scope

Each PR gets its own branch. The branch name should reflect the specific feature/fix, not a long-lived epic branch.

**Branch naming convention**: `feat/<short-name>`, `fix/<short-name>`, `chore/<short-name>`

Derive the branch name:
1. If `$ARGUMENTS` contains a feature name → use it (e.g., `feat/supabase-provider`)
2. Otherwise → derive from the latest commit message:
   - `feat(memory): add Supabase provider` → `feat/supabase-provider`
   - `fix(rerank): handle empty results` → `fix/rerank-empty-results`

**Determine which commits belong to this PR:**
- Default: the latest commit only (1 commit = 1 PR, clean and focused)
- If user specifies a range or multiple related commits, include them all
- Ask if ambiguous: "Include just the latest commit, or the last N commits?"

---

## Step 3: Detect Remote and Main Branch

Auto-detect from git config (no hardcoded values):

```bash
# Detect remote name (prefer 'origin', fall back to first remote)
git remote | head -1

# Detect main branch
git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null || echo "main"
```

Store:
- `REMOTE` — the remote name (usually `origin`)
- `MAIN_BRANCH` — the main branch name (usually `main` or `master`)

If `.opencode/config.md` specifies these values, use those instead.

---

## Step 4: Create Feature Branch and Push

```bash
# Create new branch from current HEAD
git checkout -b <branch-name>

# Push the new branch to remote
git push {REMOTE} <branch-name> -u
```

After push, switch back to the original branch so it's not disrupted:
```bash
git checkout <original-branch>
```

If branch name already exists on remote:
- Report: "Branch `<name>` already exists on remote."
- Ask: create with a suffix (e.g., `feat/supabase-provider-2`), or use existing?

---

## Step 5: Generate PR Title and Body

```bash
# Gather context for PR description
git log --oneline {REMOTE}/{MAIN_BRANCH}..<branch-name>
git diff {REMOTE}/{MAIN_BRANCH}...<branch-name> --stat
git diff {REMOTE}/{MAIN_BRANCH}...<branch-name>
```

**If dispatch available:**
Dispatch to T1 for PR title + body generation with the git context.

**If dispatch unavailable:**
Generate directly:

**Title format:** `type(scope): description` (conventional commit format, max 72 chars)

**Body format:**
```markdown
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
```

---

## Step 6: Create Pull Request

```bash
gh pr create \
  --base {MAIN_BRANCH} \
  --head <branch-name> \
  --title "<pr-title>" \
  --body "$(cat <<'EOF'
{generated PR body}
EOF
)"
```

If `gh` CLI is not available or not authenticated:
- Report: "GitHub CLI not available. Install with `gh auth login` or create PR manually."
- Provide the branch name and suggested title/body for manual creation.

---

## Step 7: Report Completion

```
PR Created
==========

Branch:  <branch-name> (new, from <original-branch>)
PR:      <pr-url>
Title:   <pr-title>
Base:    {MAIN_BRANCH}
Commits: <N> commits
Current: Back on <original-branch>

Next: Wait for review, then merge or address feedback.
```

---

## Notes

- **One PR per feature/slice** — each `/pr` creates a fresh branch, not extending a prior PR
- Always auto-detect remote and main branch — no hardcoded repos
- After PR creation, return to the original branch so work can continue
- If `gh` CLI is not authenticated, report and suggest `gh auth login`
- Do NOT force-push unless explicitly asked
- If the current branch IS already a clean feature branch with only relevant commits, skip branch creation and push + PR directly
