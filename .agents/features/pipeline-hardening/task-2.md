# Task 2: Create Missing Skill Files

## OBJECTIVE

Create SKILL.md files for the 5 commands that currently lack corresponding skill documentation: final-review and the 4 validation subdirectory commands.

## SCOPE

**Files to create:**
- `.claude/skills/final-review/SKILL.md`
- `.claude/skills/validation/code-review/SKILL.md`
- `.claude/skills/validation/code-review-fix/SKILL.md`
- `.claude/skills/validation/system-review/SKILL.md`
- `.claude/skills/validation/execution-report/SKILL.md`

**Total: 5 new skill directories with SKILL.md files**

**Out of scope:**
- Modifying any command files
- Creating skills in `.opencode/skills/` (Task 3)
- Any template or reference files

**Dependencies: Task 1 (Pipeline Position sections provide context for skill content)**

## PRIOR TASK CONTEXT

Task 1 added Pipeline Position sections to all commands. The pipeline flow is now documented:
```
/prime → /mvp → /prd → /pillars → /decompose → /planning → /execute → /code-review → /code-loop → /commit → /pr
```

Additional positions:
- `/final-review` — Between `/code-loop` and `/commit`
- `/council` — Standalone utility for architecture decisions
- `/system-review` — After `/pr` for meta-analysis
- `/validation/*` — Standalone validation utilities

## CONTEXT REFERENCES

### Pattern: Skill File Structure

From `.claude/skills/mvp/SKILL.md`:

```yaml
---
name: mvp
description: Knowledge framework for big-idea discovery using Socratic questioning and scope discipline
license: MIT
compatibility: claude-code
---

# MVP Discovery — Socratic Methodology

This skill provides the reasoning framework for running effective big-idea discovery sessions.
It complements the `/mvp` command — the command provides the workflow steps, this skill
provides the quality standards and thinking discipline behind them.

## When This Skill Applies

- User says "I have an idea", "help me define my product", "what should I build"
- `/mvp` command is invoked
- Existing `mvp.md` needs revision or validation
- Discovery conversation needs grounding before `/prd` can run

## Discovery Quality Standards
...

## Anti-Patterns
...

## Key Rules
...

## Related Commands
...
```

### Command Files (source for skill content)

#### final-review.md content (full file for reference):

```markdown
---
description: Final review gate — summarize all changes, verify acceptance criteria, get human approval before commit
model: claude-sonnet-4-6
---

# Final Review: Pre-Commit Approval Gate

## Purpose

Final checkpoint between `/code-loop` (or `/code-review`) and `/commit`. Aggregates all review findings, shows what changed, verifies acceptance criteria from the plan, and asks for explicit human approval before committing.

## Usage

```
/final-review [plan-path]
```

- `plan-path` (optional): Path to the plan file (e.g., `.agents/plans/retrieval-trace.md`). If provided, acceptance criteria are pulled from the plan. If omitted, criteria check is skipped and only the summary + diff is shown.

---

## Step 1: Gather Context

Run these commands to understand the current state:

```bash
git status
git diff --stat HEAD
git diff HEAD
git log -5 --oneline
```

Also check for review artifacts:

```bash
ls .agents/reviews/ 2>/dev/null || echo "No code review artifacts"
ls .agents/reports/loops/ 2>/dev/null || echo "No code loop artifacts"
```

---

## Step 2: Change Summary

Present a concise summary of everything that changed:

### Files Changed

| File | Status | Lines +/- |
|------|--------|-----------|
| {path} | {added/modified/deleted} | +X / -Y |

### Change Overview

For each changed file, write 1-2 sentences describing WHAT changed and WHY:

- `path/to/file.py` — {what changed and why}
- `path/to/test.py` — {what changed and why}

---

## Step 3: Validation Results

Run the full validation pyramid using project-configured commands and report results:

### Level 1: Syntax & Style
```bash
{configured lint command}
{configured format check command}
```

### Level 2: Type Safety
```bash
{configured type check command}
```

### Level 3: Tests
```bash
{configured test command}
```

Report the results as a table:

| Check | Status | Details |
|-------|--------|---------|
| Linting | PASS/FAIL | {details if fail} |
| Formatting | PASS/FAIL | {details if fail} |
| Type checking | PASS/FAIL | {details if fail} |
| Tests | PASS/FAIL | X passed, Y failed |

**If any Level 1-3 checks FAIL**: Stop here. Report failures and recommend running `/code-loop` or `/execute` to fix before retrying `/final-review`.

---

## Step 4: Review Findings Summary

If code review artifacts exist in `.agents/reviews/` or `.agents/reports/loops/`, summarize:

### Review History

| Review | Critical | Major | Minor | Status |
|--------|----------|-------|-------|--------|
| Review #1 | X | Y | Z | {Fixed/Open} |
| Review #2 | X | Y | Z | {Fixed/Open} |

### Outstanding Issues

List any remaining issues from reviews that were NOT fixed:

- **{severity}**: `file:line` — {description} — Reason not fixed: {reason}

If no outstanding issues: "All review findings have been addressed."

---

## Step 5: Acceptance Criteria Check

**If plan-path was provided**, read the plan file and locate the `## ACCEPTANCE CRITERIA` section.

For each criterion, verify whether it is met:

### Implementation Criteria

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | {criterion text} | MET/NOT MET | {how verified} |
| 2 | {criterion text} | MET/NOT MET | {how verified} |

### Runtime Criteria

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | {criterion text} | MET/NOT MET/DEFERRED | {how verified or why deferred} |

**If plan-path was NOT provided**: Skip this section and note "No plan provided — acceptance criteria check skipped."

---

## Step 6: Final Verdict

Summarize the readiness assessment:

```
FINAL REVIEW SUMMARY
====================

Changes:     X files changed, +Y/-Z lines
Tests:       A passed, B failed
Lint/Types:  CLEAN / X issues remaining
Reviews:     N iterations, M issues fixed, P outstanding
Criteria:    X/Y met (Z deferred)

VERDICT:     READY TO COMMIT / NOT READY
```

**READY TO COMMIT** when:
- All validation levels pass (lint, types, tests)
- No Critical or Major review findings outstanding
- All Implementation acceptance criteria met (if plan provided)

**NOT READY** when:
- Any validation level fails
- Critical or Major review findings still open
- Implementation acceptance criteria not met

---

## Step 7: Ask for Approval

**If READY TO COMMIT:**

Ask the user:

```
Ready to commit. Suggested message:

  {type}({scope}): {description}

Proceed with /commit? (yes / modify message / abort)
```

Wait for explicit user response. Do NOT auto-commit.

**If NOT READY:**

Report what needs to be fixed and suggest next action:

```
Not ready to commit. Outstanding issues:

1. {issue}
2. {issue}

Recommended: Run /code-loop to address remaining issues, then retry /final-review.
```
```

#### validation/code-review.md content (full file for reference):

```markdown
---
description: Technical code review for quality and bugs — runs pre-commit
---

# Validation: Code Review

Perform a thorough technical code review on recently changed files. This is the validation-focused review — deeper than a quick `/code-review`, designed to run before committing.

## Core Principles

Review Philosophy:

- Simplicity is the ultimate sophistication — every line should justify its existence
- Code is read far more often than it's written — optimize for readability
- The best code is often the code you don't write
- Elegance emerges from clarity of intent and economy of expression

## What to Review

Start by gathering codebase context to understand standards and patterns.

### 1. Read Project Context

- `memory.md` — gotchas, decisions, patterns
- `.claude/config.md` — validation commands, stack info
- Key files in the main source directory
- Documented standards in docs/ or similar

### 2. Examine Changes

Run these commands:

```bash
git status
git diff HEAD
git diff --stat HEAD
```

Then check the list of new files:

```bash
git ls-files --others --exclude-standard
```

Read each new file in its entirety. Read each changed file in its entirety (not just the diff) to understand full context.

### 3. Analyze Each File

For each changed file or new file, analyze for:

**Logic Errors**
- Off-by-one errors
- Incorrect conditionals
- Missing error handling
- Race conditions
- Null/undefined access

**Security Issues**
- SQL injection vulnerabilities
- XSS vulnerabilities
- Insecure data handling
- Exposed secrets or API keys
- Missing input validation

**Performance Problems**
- N+1 queries
- Inefficient algorithms (O(n^2) where O(n) possible)
- Memory leaks
- Unnecessary computations
- Blocking operations in async contexts

**Code Quality**
- Violations of DRY principle
- Overly complex functions (high cyclomatic complexity)
- Poor naming (variables, functions, types)
- Missing type hints/annotations
- Dead code

**Adherence to Codebase Standards**
- Adherence to documented project patterns
- Linting, typing, and formatting standards
- Logging standards
- Testing standards
- Existing code conventions in the same module

## Verify Issues Are Real

Before reporting any issue:
- Run specific tests related to the concern
- Confirm type errors are legitimate (not false positives from stubs)
- Validate security concerns with full context
- Check if the pattern is intentional (used elsewhere in the codebase)

Do NOT report:
- Pre-existing issues not introduced by this change
- Intentional patterns used consistently across the project
- Style preferences that contradict project conventions

## Output Format

Save a new file to `.agents/reviews/{appropriate-name}.md`

**Stats:**

- Files Modified: {N}
- Files Added: {N}
- Files Deleted: {N}
- New lines: +{N}
- Deleted lines: -{N}

**For each issue found:**

```
severity: critical|high|medium|low
file: path/to/file
line: 42
issue: [one-line description]
detail: [explanation of why this is a problem]
suggestion: [how to fix it]
```

If no issues found: "Code review passed. No technical issues detected."

**Summary:**

```
VALIDATION CODE REVIEW
======================
Critical: {N}
High:     {N}
Medium:   {N}
Low:      {N}

Verdict: PASS / FAIL (fix critical/high first)
```

## Important

- Be specific (line numbers, not vague complaints)
- Focus on real bugs, not style preferences
- Suggest fixes, don't just complain
- Flag security issues as CRITICAL
- This command is **read-only** — it reports findings, does NOT fix them
- Use `/validation/code-review-fix` to process and fix the findings
```

## PATTERNS TO FOLLOW

### Skill Frontmatter Pattern

```yaml
---
name: {command-name}
description: Knowledge framework for {purpose}
license: MIT
compatibility: claude-code
---
```

**Required fields:**
- `name` — Command name (matches directory name)
- `description` — One-line description starting with "Knowledge framework for"
- `license` — Always "MIT"
- `compatibility` — "claude-code" for `.claude/skills/`

### Skill Structure Pattern

Every skill MUST have these sections in order:
1. Title with em-dash subtitle
2. Introduction paragraph (command vs skill relationship)
3. `## When This Skill Applies` — bullet list of trigger conditions
4. Core methodology sections (varies by skill)
5. `## Anti-Patterns` — what NOT to do
6. `## Key Rules` — numbered list of rules
7. `## Related Commands` — links to related commands

## STEP-BY-STEP IMPLEMENTATION

### Step 1: Create final-review skill directory and file

**ACTION**: CREATE directory and file

**Target**: `.claude/skills/final-review/SKILL.md`

**Content**:
```yaml
---
name: final-review
description: Knowledge framework for pre-commit approval gates with change summary and acceptance criteria verification
license: MIT
compatibility: claude-code
---

# Final Review — Approval Gate Methodology

This skill provides the quality framework for the final checkpoint before commit. It complements the `/final-review` command — the command provides the workflow, this skill provides the standards for what makes a commit-ready state.

## When This Skill Applies

- User runs `/final-review` before committing
- User wants to verify all changes are intentional and reviewed
- Acceptance criteria from a plan need verification
- Human approval is required before proceeding to `/commit`
- After `/code-loop` or `/code-review` when ready to commit

## Readiness Standards

A commit is ready when ALL of these are true:

**Validation Clean**
- Lint passes with zero errors
- Type check passes with zero errors
- All tests pass (unit + integration)
- No unaddressed Critical or Major review findings

**Change Understanding**
- Every changed file has been reviewed
- Change summary accurately reflects what changed
- No accidental changes (debug code, commented code, stray files)

**Criteria Verification** (if plan provided)
- All Implementation criteria are MET
- Runtime criteria are MET or explicitly DEFERRED with reason
- No criteria are NOT MET without documented justification

## Approval Gate Quality

The approval gate exists because:
- Code review finds issues but doesn't require them to be fixed
- Tests pass but may not cover edge cases
- Lint passes but may miss logical errors
- The human makes the final call on acceptable risk

**What counts as explicit approval:**
- "Yes", "Approved", "Proceed", "Commit it"
- Modification of commit message followed by approval
- Clear affirmative statement

**What does NOT count as approval:**
- Silence or no response
- Vague acknowledgment ("ok", "sure", "go ahead")
- Changing the subject without explicitly approving

## Verdict Standards

**READY TO COMMIT requires:**
1. All Level 1-3 validation passes
2. Zero Critical review findings outstanding
3. Zero Major review findings outstanding
4. All Implementation acceptance criteria MET (if plan provided)
5. Explicit human approval

**NOT READY triggers:**
1. Any validation failure → fix first
2. Critical or Major findings open → address first
3. Implementation criteria not met → complete work first
4. No explicit approval → wait for it

## Anti-Patterns

**Skipping validation** — Running `/final-review` without lint/tests. The validation pyramid exists to catch issues before human review. Skipping it defeats the purpose.

**Rubber-stamp approval** — Asking for approval but accepting vague responses. "Sure, go ahead" is not explicit approval when significant changes are involved.

**Ignoring deferred criteria** — Deferring a Runtime criterion "until later" without a ticket or tracking mechanism. Deferred means tracked, not forgotten.

**Reviewing only the diff** — For new files, the diff is the entire file. For changed files, context matters. Read the full file, not just changed lines.

**Skipping acceptance criteria** — Not providing a plan-path to skip criteria verification. If there's a plan, use it. Criteria are promises made in the plan.

## Key Rules

1. **Validation first, approval second** — Run all validation before asking for approval
2. **Explicit approval required** — Silence is not approval; vague acknowledgment is not approval
3. **No Critical/Major outstanding** — These severities block commit; Minor can be deferred
4. **Acceptance criteria verified** — If a plan exists, its criteria must be checked
5. **Human makes the final call** — All automation passes, but human decides acceptable risk
6. **Read-only gate** — This command never modifies files, only reports and asks

## Related Commands

- `/code-loop` — Runs before final-review to clean up issues
- `/code-review` — Provides the review artifacts final-review summarizes
- `/commit` — Runs after approval to create the commit
- `/pr` — Runs after commit to create the pull request
```

### Step 2: Create validation/code-review skill

**ACTION**: CREATE directory and file

**Target**: `.claude/skills/validation/code-review/SKILL.md`

**Content**:
```yaml
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
```

### Step 3: Create validation/code-review-fix skill

**ACTION**: CREATE directory and file

**Target**: `.claude/skills/validation/code-review-fix/SKILL.md`

**Content**:
```yaml
---
name: validation/code-review-fix
description: Knowledge framework for minimal-change fix discipline with severity ordering and per-fix verification
license: MIT
compatibility: claude-code
---

# Validation: Code Review Fix — Minimal Change Discipline

This skill provides the quality framework for fixing code review findings. It complements the `/validation/code-review-fix` command — the command provides the workflow, this skill provides the fix discipline.

## When This Skill Applies

- User runs `/validation/code-review-fix` after a code review
- Review findings need to be addressed
- User wants structured fix discipline
- Fixes should be minimal and verified

## Fix Discipline

**Minimal Change Principle** — Each fix should be the smallest possible change that addresses the finding. No refactoring, no "while I'm here" improvements.

**Why minimal:**
- Smaller changes are easier to review
- Less risk of introducing new bugs
- Clearer git history
- Faster to revert if needed

**What minimal means:**
- Fix ONLY the reported issue
- No style improvements in the same change
- No refactoring adjacent code
- No adding "nice to have" features
- No updating comments unless the finding is about comments

## Severity Ordering

Always fix in severity order:

1. **CRITICAL** — Fix first, verify, commit
2. **HIGH** — Fix second, verify, commit
3. **MEDIUM** — Fix third (or defer with documentation)
4. **LOW** — Defer to backlog (fix when convenient)

**Why order matters:**
- Critical issues may invalidate the fix approach for lower severity
- Fixing low-severity first creates noise in git history
- Higher severity = higher risk = more careful review needed

## Per-Fix Verification

After EACH fix:

1. **Run the affected test** — Does the fix work?
2. **Run the linter** — Is the fix syntactically correct?
3. **Run the type checker** — Is the fix type-safe?
4. **Re-read the finding** — Did it address the specific issue?

**Only then move to the next fix.**

Do NOT:
- Fix multiple findings in one change
- Skip verification because "it's simple"
- Move on without confirming the fix worked

## Fix Quality Standards

**A good fix:**
- Addresses the specific finding
- Is minimal (no extra changes)
- Passes all tests
- Passes lint and type check
- Doesn't introduce new issues
- Has clear commit message referencing the finding

**A bad fix:**
- Addresses the finding BUT also refactors nearby code
- Passes tests but fails type check
- Changes behavior beyond what the finding required
- Mixes multiple findings in one change

## Anti-Patterns

**Kitchen sink fixing** — Fixing a bug AND refactoring AND updating comments in one change. Each fix should be atomic.

**Skip-the-verification** — Making the fix and moving on without running tests/lint/types. This is how regressions happen.

**Severity skipping** — Fixing LOW issues while CRITICAL issues remain. This wastes time and creates noise.

**Finding expansion** — "While I'm here, I'll also fix..." No. Fix what was found, nothing more.

**Defer without tracking** — Marking MEDIUM issues as "deferred" without creating a ticket or tracking mechanism. Deferred means tracked.

## Key Rules

1. **One finding, one fix** — Never bundle multiple findings in one change
2. **Critical first** — Always fix in severity order
3. **Minimal change** — The fix is exactly what addresses the finding, nothing more
4. **Verify after each fix** — Run tests, lint, types after EVERY fix
5. **Reference the finding** — Commit messages should mention what was fixed
6. **Defer responsibly** — Deferred issues are tracked, not forgotten

## Related Commands

- `/validation/code-review` — Produces the findings this command fixes
- `/code-review-fix` — Main pipeline fix command (different from validation variant)
- `/final-review` — Verifies all fixes before commit
```

### Step 4: Create validation/system-review skill

**ACTION**: CREATE directory and file

**Target**: `.claude/skills/validation/system-review/SKILL.md`

**Content**:
```yaml
---
name: validation/system-review
description: Knowledge framework for process-level meta-analysis with actionable improvement suggestions
license: MIT
compatibility: claude-code
---

# Validation: System Review — Process Meta-Analysis

This skill provides the quality framework for meta-level review of the development process. It complements the `/validation/system-review` command — the command provides the workflow, this skill provides the analysis methodology.

## When This Skill Applies

- User runs `/validation/system-review` for process analysis
- Post-PR review of how the feature was developed
- Identifying systemic issues in the development workflow
- Suggesting process improvements based on observed patterns

## What System Review Analyzes

Unlike code review (which analyzes code), system review analyzes the PROCESS:

**Plan Quality**
- Was the plan followed or did implementation diverge?
- Were acceptance criteria met or changed mid-stream?
- Did task breakdown match actual work done?

**Execution Quality**
- Were there unexpected blockers that better planning would catch?
- Did the implementation require significant rework?
- Were validation issues caught late that could have been caught early?

**Review Quality**
- Did code review find issues that should have been caught earlier?
- Were there patterns in the findings (e.g., repeated type errors)?
- Did fixes introduce new issues?

**Process Issues**
- Handoff failures between planning and execution
- Context loss between sessions
- Repeated mistakes across features

## Analysis Methodology

1. **Read the plan artifacts** — What was intended
2. **Read the execution artifacts** — What actually happened
3. **Compare plan vs reality** — Where did divergence occur?
4. **Identify patterns** — What systemic issues caused problems?
5. **Suggest improvements** — What process changes would help?

## Improvement Categories

**Planning Improvements**
- Better task breakdown
- More explicit acceptance criteria
- Clearer dependency identification
- Risk identification upfront

**Execution Improvements**
- Better validation during implementation
- More frequent check-ins with plan
- Earlier escalation of blockers
- Clearer handoff documentation

**Review Improvements**
- Earlier code review (smaller batches)
- Specific focus areas based on findings
- Pre-commit hooks for common issues
- Automated checks for patterns found

**Process Improvements**
- Memory updates to capture learnings
- Template updates for plan quality
- New validation steps for recurring issues

## Anti-Patterns

**Code-level feedback** — This is not code review. Focus on process, not specific code issues.

**Blame assignment** — System review is about improving the process, not assigning fault. Frame findings as "the process allowed X" not "person Y did X".

**Vague suggestions** — "Be more careful" is not actionable. "Add a pre-commit hook to check for console.log statements" is actionable.

**Ignoring patterns** — Treating each finding as isolated. If type errors appear in every review, the fix is a type-checking pre-commit hook, not "be more careful with types."

## Key Rules

1. **Process focus, not code focus** — Analyze how work was done, not what code was written
2. **Patterns over incidents** — One issue is an incident; repeated issues are a pattern
3. **Actionable suggestions** — Every finding has a concrete improvement suggestion
4. **Memory updates** — Capture learnings in memory.md for future sessions
5. **No blame** — Frame as process issues, not personal failings

## Related Commands

- `/system-review` — Main pipeline system review command
- `/validation/code-review` — Provides findings that system review analyzes
- `/prime` — Reads memory.md where process learnings are stored
```

### Step 5: Create validation/execution-report skill

**ACTION**: CREATE directory and file

**Target**: `.claude/skills/validation/execution-report/SKILL.md`

**Content**:
```yaml
---
name: validation/execution-report
description: Knowledge framework for implementation report generation with plan alignment and artifact documentation
license: MIT
compatibility: claude-code
---

# Validation: Execution Report — Implementation Documentation

This skill provides the quality framework for documenting what was implemented. It complements the `/validation/execution-report` command — the command provides the workflow, this skill provides the documentation standards.

## When This Skill Applies

- User runs `/validation/execution-report` after implementation
- Documentation of what was done is needed for system review
- Handoff documentation between execution and review phases
- Record of plan-to-reality alignment

## Report Structure

A complete execution report includes:

**Summary**
- What was implemented (high level)
- How it aligns with the plan
- Any deviations and why

**Task Completion**
- Which tasks were completed as planned
- Which tasks were modified and why
- Which tasks were skipped and why

**Files Changed**
- List of all modified/created/deleted files
- Purpose of each change

**Validation Results**
- Test results
- Lint results
- Type check results

**Acceptance Criteria Status**
- Which criteria were met
- Which criteria were not met (with explanation)
- Which criteria were modified (with justification)

**Learnings**
- What went well
- What could have been better
- Process improvements for next time

## Documentation Quality

**Good documentation:**
- Specific about what changed and why
- Links to plan tasks by number
- Explains deviations honestly
- Includes validation evidence
- Captures learnings for future

**Bad documentation:**
- Vague about what was done
- No link to original plan
- Deviations hidden or not mentioned
- No validation evidence
- No learnings captured

## Anti-Patterns

**Copy-paste from plan** — The report should reflect reality, not just repeat the plan. Document what actually happened.

**Skipping deviations** — Hiding that something was done differently than planned. Honest documentation builds trust.

**No validation evidence** — Claiming "tests pass" without showing output. Evidence makes the report credible.

**No learnings** — Missing the opportunity to improve future work. Learnings are often the most valuable part.

## Key Rules

1. **Honest alignment** — Document what actually happened, not what was supposed to happen
2. **Plan references** — Link to specific tasks by number
3. **Validation evidence** — Include actual test/lint/type output
4. **Deviation explanation** — Every deviation has a reason documented
5. **Learnings captured** — At least one thing to improve for next time

## Related Commands

- `/execute` — Produces the implementation this report documents
- `/system-review` — Uses this report for process analysis
- `/final-review` — Uses this report for acceptance criteria verification
```

## TESTING STRATEGY

### Unit Tests
- Each skill file has valid YAML frontmatter
- Each skill file has all required sections
- Each skill file has correct compatibility field

### Integration Tests
- Skill files can be loaded by the command system
- Skill descriptions match command descriptions

### Edge Cases
- Validation skills are in subdirectory (validation/)
- File paths use forward slashes even on Windows

## VALIDATION COMMANDS

```bash
# L1: Check for balanced code fences
for d in final-review validation/code-review validation/code-review-fix validation/system-review validation/execution-report; do
  f=".claude/skills/$d/SKILL.md"
  count=$(grep -c '```' "$f" 2>/dev/null || echo 0)
  if [ $((count % 2)) -ne 0 ]; then
    echo "UNCLOSED: $f ($count fences)"
  else
    echo "OK: $f ($count fences)"
  fi
done

# L2: Check for required sections
for d in final-review validation/code-review validation/code-review-fix validation/system-review validation/execution-report; do
  f=".claude/skills/$d/SKILL.md"
  echo "=== $d ==="
  for section in "When This Skill Applies" "Anti-Patterns" "Key Rules" "Related Commands"; do
    if grep -q "## $section" "$f" 2>/dev/null; then
      echo "  OK: $section"
    else
      echo "  MISSING: $section"
    fi
  done
done

# L3: Check frontmatter
for d in final-review validation/code-review validation/code-review-fix validation/system-review validation/execution-report; do
  f=".claude/skills/$d/SKILL.md"
  echo "=== $d frontmatter ==="
  head -6 "$f"
done

# L3: Check compatibility field
for d in final-review validation/code-review validation/code-review-fix validation/system-review validation/execution-report; do
  f=".claude/skills/$d/SKILL.md"
  if grep -q "compatibility: claude-code" "$f" 2>/dev/null; then
    echo "OK: $d has correct compatibility"
  else
    echo "WRONG: $d missing or wrong compatibility"
  fi
done
```

## ACCEPTANCE CRITERIA

### Implementation
- [ ] `.claude/skills/final-review/SKILL.md` created with all required sections
- [ ] `.claude/skills/validation/code-review/SKILL.md` created with all required sections
- [ ] `.claude/skills/validation/code-review-fix/SKILL.md` created with all required sections
- [ ] `.claude/skills/validation/system-review/SKILL.md` created with all required sections
- [ ] `.claude/skills/validation/execution-report/SKILL.md` created with all required sections

### Runtime
- [ ] L1: All skill files have balanced code fences
- [ ] L2: All skill files have required sections (When This Skill Applies, Anti-Patterns, Key Rules, Related Commands)
- [ ] L3: All skill files have correct frontmatter (name, description, license, compatibility)
- [ ] L3: All skill files have `compatibility: claude-code`

## HANDOFF NOTES

Task 3 will mirror these skills to `.opencode/skills/` with the compatibility field changed to `opencode`.

## COMPLETION CHECKLIST

- [ ] Created final-review/SKILL.md with complete content
- [ ] Created validation/code-review/SKILL.md with complete content
- [ ] Created validation/code-review-fix/SKILL.md with complete content
- [ ] Created validation/system-review/SKILL.md with complete content
- [ ] Created validation/execution-report/SKILL.md with complete content
- [ ] Verified L1 validation (balanced code fences)
- [ ] Verified L2 validation (required sections)
- [ ] Verified L3 validation (frontmatter and compatibility)