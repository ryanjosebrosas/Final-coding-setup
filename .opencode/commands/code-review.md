---
description: Technical code review for quality and bugs that runs pre-commit
---

# Code Review: Find Bugs, Security Issues, and Quality Problems

Run a comprehensive code review. Reports findings only — does NOT implement fixes.

## Core Principles

**Review Philosophy:**
- Simplicity is the ultimate sophistication — every line should justify its existence
- Code is read far more often than it's written — optimize for readability
- The best code is often the code you don't write
- Elegance emerges from clarity of intent and economy of expression

## Usage

```
/code-review [target]
```

`$ARGUMENTS` — What to review:
- Empty (default): review all uncommitted changes (`git diff` + `git diff --cached`)
- File path: review a specific file
- `last-commit`: review changes in the most recent commit

---

## Pipeline Position

Used manually, or inside the `/code-loop` automated review-fix cycle:

```
/code-review → /code-review-fix → /code-review (verify) → /commit
```

Alternatively: `/code-review` → `/code-review-fix {scope}` → `/code-review` → `/commit`

---

## Step 1: Determine Scope

**If no arguments:**
```bash
git diff --name-only
git diff --cached --name-only
```
Review all changed files.

**If file path provided:**
Review that specific file.

**If `last-commit`:**
```bash
git diff HEAD~1 --name-only
```
Review files changed in the last commit.

If no changes found, report: "No changes to review." and stop.

---

## Step 2: Gather Context

Before reviewing, gather supporting context:

### Codebase Context (Required)

Read these files to understand project standards and patterns:
1. **AGENTS.md** or **CLAUDE.md** — project methodology and conventions
2. **README.md** — project purpose and capabilities
3. **`.opencode/sections/`** — auto-loaded rules and patterns
4. **`.opencode/config.md`** — validation commands and stack info

### Affected Files (Required)

**Read each changed file in its entirety** — not just the diff. Context matters for understanding:
- How the change fits into the larger module
- Existing patterns that should be followed
- Potential side effects on other parts of the file

### Project Patterns

Check similar files in the project:
- How do other files handle the same concern?
- What naming conventions are used?
- What error handling patterns exist?

### RAG Integration (Optional)

If a RAG knowledge base MCP is available:
- Search for best practices related to the technologies in changed files (2-5 keyword queries)
- Search for reference implementations of similar patterns
- Keep queries SHORT for best vector search results

If RAG unavailable, proceed with local context only.

---

## Step 3: Review

Check for issues at three severity levels:

### Critical (blocks commit)
- Security vulnerabilities (SQL injection, XSS, hardcoded secrets)
- Logic errors (null dereference, off-by-one, race conditions)
- Type safety issues (unsafe casts, missing null checks)

### Major (fix soon)
- Performance issues (N+1 queries, O(n^2), memory leaks)
- Architecture violations (layer breaches, tight coupling)
- Error handling gaps (uncaught exceptions, silent failures)
- Documentation mismatches with known best practices

### Minor (consider fixing)
- Code quality (DRY violations, unclear naming)
- Missing tests for new functionality
- Documentation gaps

---

## Step 4: Dispatch for Second Opinions (Optional)

For security-sensitive or architecturally complex changes, get a second opinion:

**If dispatch available:**

| Concern | Tier | Approach |
|---------|------|----------|
| Security review | T2 | Dispatch security-focused review |
| Architecture | T2 | Dispatch architecture audit |
| Logic verification | T2 | Dispatch logic review |

**If dispatch unavailable:** Proceed with your own thorough review. Consider reviewing from multiple angles (security, performance, architecture) sequentially.

---

## Step 5: Report Findings

Present findings in this structured format:

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
  Why: {explanation of why this is a problem}
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

Second Opinions:
- {findings from dispatch, or "No dispatch used"}

Summary: {X} critical, {Y} major, {Z} minor
Recommendation: {PASS / FIX CRITICAL / FIX MAJOR}
```

**Output file**: Save review to `.agents/features/{feature}/review.md`
Create the `.agents/features/{feature}/` directory if it doesn't exist.
Derive `{feature}` from the most relevant context: if reviewing changes from a plan execution, use the plan's feature name. If reviewing standalone changes, derive from the primary file's module/directory name.

---

## Step 6: Next Steps

Based on severity:

- **All clear**: "No issues found. Ready to commit with `/commit`."
- **Minor only**: "Minor issues found. Commit at your discretion, or fix first with `/code-review-fix {review-file} minor`."
- **Major/Critical**: "Found issues that should be fixed."
  - Simple fixes: `Run /code-review-fix {review-file} critical+major` then re-review.
  - Complex/architectural fixes: Create a fix plan with `/planning`, then `/execute {fix-plan}`, then re-review.

---

## Notes

- This command is **read-only** — it does NOT modify any files
- For automated review-fix loops, use `/code-loop` instead
- Single sequential review — no parallel agents unless dispatch is available

### `.done.md` Lifecycle

`/code-review` does NOT mark its own output as done. The review is marked `.done.md` by:
- `/commit` — when committing changes that address the review findings
- `/code-loop` — when the loop exits clean after all findings are addressed

This is intentional: a review is only "done" when its findings are acted upon, not when the review is written.
