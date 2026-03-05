---
name: validation/code-review
description: Knowledge framework for deep technical code review with severity classification and evidence-based findings
license: MIT
compatibility: claude-code
---

# Validation: Code Review — Deep Technical Analysis

This skill provides the quality framework for thorough code review. It complements the `/validation/code-review` command — the command provides the workflow, this skill provides the review standards and severity classification.

## When This Skill Applies

- User runs `/validation/code-review` for deep pre-commit review
- User needs thorough technical analysis beyond quick `/code-review`
- Validation-focused review is needed before important commits
- User wants comprehensive security and quality analysis

## Severity Classification

**CRITICAL** — Blocks commit. Must fix before proceeding.
- Security vulnerabilities (injection, auth bypass, data exposure)
- Data loss or corruption risk
- Breaking changes to public APIs
- Crash-causing bugs
- Data integrity violations

**HIGH** — Should fix before commit. Can defer with documented reason.
- Logic errors that cause incorrect behavior
- Performance issues affecting user experience
- Missing error handling that could crash
- Type safety violations
- Race conditions

**MEDIUM** — Fix soon. Can be committed with note.
- Code quality issues (DRY violations, complexity)
- Missing tests for new functionality
- Suboptimal patterns that work but could be better
- Inconsistent naming or style

**LOW** — Minor. Fix when convenient.
- Style preferences not covered by linter
- Comment improvements
- Minor refactoring opportunities
- Documentation gaps

## Evidence Standards

Every finding MUST include:
1. **File and line** — Exact location (`path/to/file:42`)
2. **Issue description** — One-line summary
3. **Why it's a problem** — Explanation of the impact
4. **How to fix it** — Specific suggestion

**Good finding:**
```
severity: HIGH
file: src/auth/login.ts:87
issue: Missing rate limiting on login endpoint
detail: The login endpoint has no rate limiting, allowing brute force attacks
suggestion: Add rate limiting middleware (e.g., express-rate-limit) with 5 attempts per minute
```

**Bad finding (vague):**
```
severity: MEDIUM
file: src/auth/login.ts
issue: Security issue
detail: Could be better
suggestion: Fix it
```

## Review Depth

This is a DEEP review, not a quick check. Analyze:

**Logic**
- All code paths (happy path, error paths, edge cases)
- Boundary conditions
- Error handling completeness
- Null/undefined handling

**Security**
- Input validation on all external inputs
- Authentication and authorization checks
- Sensitive data handling
- Secret management
- SQL/query injection prevention
- XSS prevention

**Performance**
- Algorithm complexity
- N+1 queries
- Unnecessary re-renders (frontend)
- Memory leaks
- Blocking operations in async code

**Quality**
- Code organization and structure
- Naming clarity
- DRY adherence
- Function size and complexity
- Test coverage

## Anti-Patterns

**Vague findings** — "This code is messy" without specific lines and suggestions. Every finding must be actionable.

**Style crusading** — Reporting issues that are intentional project patterns. Check existing code before reporting style issues.

**Pre-existing issue reporting** — Flagging issues that existed before this change. Focus on what THIS change introduces.

**False positive inflation** — Reporting type errors from incomplete stubs, or test failures from known flaky tests. Verify issues are real.

**Skipping context** — Reviewing only the diff. New files need full-file review; changed files need context-aware review.

**Severity inflation** — Marking everything CRITICAL to force attention. Reserve CRITICAL for actual blockers.

## Key Rules

1. **Evidence-based findings** — Every issue has file:line, description, explanation, and suggestion
2. **Severity consistency** — Use the classification standards, not gut feel
3. **Read-only review** — This command reports findings, it does NOT fix them
4. **Context matters** — Read full files, not just diffs
5. **Verify before reporting** — Run tests, check type errors, validate security concerns
6. **Focus on THIS change** — Don't report pre-existing issues

## Related Commands

- `/validation/code-review-fix` — Processes and fixes findings from this review
- `/code-review` — Quick review that runs in the main pipeline
- `/final-review` — Summarizes all reviews before commit