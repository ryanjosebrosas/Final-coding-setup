---
name: code-review
description: Run a technical code review on uncommitted changes, a specific file, or the last
             commit. Use when the user asks to review code, check for bugs, run a pre-commit
             review, or audit a file. Trigger phrases: "review my code", "code review",
             "check for bugs", "review these changes", "review last commit", "audit this file",
             "review before commit", "find issues".
---

# Code Review: Find Bugs, Security Issues, and Quality Problems

## When to Use This Skill

Use this skill to review code for quality, bugs, and security issues before committing. This
skill is **read-only** — it reports findings but does NOT implement fixes.

For automated fix loops, use the `code-loop` skill instead.

## Step 1: Determine Scope

Identify what to review from the user's request:

**No target specified (default):**
```bash
git diff --name-only
git diff --cached --name-only
```
Review all changed (unstaged + staged) files.

**Specific file path provided:**
Review that file only.

**"last-commit" requested:**
```bash
git diff HEAD~1 --name-only
```
Review files changed in the most recent commit.

If no changes found: report "No changes to review." and stop.

## Step 2: Determine Feature Name

Derive the feature name for saving the review artifact (priority order):
1. `--feature {name}` argument if provided by user
2. Read `.agents/context/next-command.md` — use the **Feature** field if it exists
3. Scan `.agents/features/*/report.md` (non-done) — use the most recently modified feature
4. Fall back to the primary changed file's module/directory name

## Step 3: Gather Context

Read the following for project standards:
- `AGENTS.md` — project methodology and conventions
- `.claude/config.md` — validation commands and stack info (if it exists)

Read EACH changed file in its entirety (not just the diff) — context matters for:
- How the change fits into the larger module
- Existing patterns that should be followed
- Potential side effects

If Archon MCP is connected:
- `rag_search_knowledge_base(query="...", match_count=5)` — 2-5 keywords relevant to the changed files
- Keep queries short for best vector search results

## Step 4: Review

Check for issues at three severity levels:

### Critical (blocks commit)
- Security vulnerabilities (SQL injection, XSS, hardcoded secrets)
- Logic errors (null dereference, off-by-one, race conditions)
- Type safety issues (unsafe casts, missing null checks)

### Major (fix soon)
- Performance issues (N+1 queries, O(n²), memory leaks)
- Architecture violations (layer breaches, tight coupling)
- Error handling gaps (uncaught exceptions, silent failures)
- Documentation mismatches with known best practices

### Minor (consider fixing)
- Code quality (DRY violations, unclear naming)
- Missing tests for new functionality
- Documentation gaps

## Step 5: Save Review Report

Save the review to `.agents/features/{feature}/review.md`.
Create the directory if it doesn't exist.

Report format:
```
CODE REVIEW: {scope description}
================================

Stats:
- Files Modified: {N}
- Files Added: {N}
- Files Deleted: {N}
- New lines: +{N}
- Deleted lines: -{N}

Critical (blocks commit):
- `{file:line}` — {issue}
  Why: {explanation}
  Fix: {specific suggestion}

Major (fix soon):
- `{file:line}` — {issue}
  Why: {explanation}
  Fix: {suggestion}

Minor (consider):
- `{file:line}` — {issue}
  Why: {explanation}
  Fix: {suggestion}

RAG-Informed:
- {findings backed by documentation, or "No RAG sources applicable"}

Summary: {X} critical, {Y} major, {Z} minor
Recommendation: {PASS / FIX CRITICAL / FIX MAJOR}
```

## Step 6: Write Pipeline Handoff

Write `.agents/context/next-command.md`:

**If issues found (Critical or Major):**
```markdown
# Pipeline Handoff
<!-- Auto-updated by pipeline commands. Read by /prime. Do not edit manually. -->

- **Last Command**: /code-review
- **Feature**: {feature}
- **Next Command**: /code-review-fix .agents/features/{feature}/review.md critical+major
- **Timestamp**: {ISO 8601 timestamp}
- **Status**: awaiting-fixes
```

**If 0 issues (clean):**
```markdown
# Pipeline Handoff
<!-- Auto-updated by pipeline commands. Read by /prime. Do not edit manually. -->

- **Last Command**: /code-review
- **Feature**: {feature}
- **Next Command**: /commit
- **Timestamp**: {ISO 8601 timestamp}
- **Status**: ready-to-commit
```

## Step 7: Report Next Steps

- **All clear**: "No issues found. Ready to commit."
- **Minor only**: "Minor issues found. Commit at your discretion, or ask me to fix with: `codex \"fix minor issues in the review\"`"
- **Major/Critical**: "Found issues. Run `codex \"fix code review issues\"` to fix them, then re-review."

## Key Rules

- This skill is READ-ONLY — it does not modify any files
- Always read the full file, not just the diff
- Save review to `.agents/features/{feature}/review.md` — this is consumed by code-loop and commit
- The review is NOT marked `.done.md` by this skill — it is marked done by `/commit` or `code-loop` after fixes are applied
