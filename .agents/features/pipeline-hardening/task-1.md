# Task 1: Add Pipeline Position to Commands

## OBJECTIVE

Add `## Pipeline Position` section to all commands missing it, ensuring consistent documentation structure across the command suite.

## SCOPE

**Files to modify:**
- `.claude/commands/prime.md` (and mirror in `.opencode/commands/`)
- `.claude/commands/commit.md` (and mirror)
- `.claude/commands/council.md` (and mirror)
- `.claude/commands/execute.md` (and mirror)
- `.claude/commands/code-loop.md` (and mirror)
- `.claude/commands/final-review.md` (and mirror)
- `.claude/commands/pr.md` (and mirror)
- `.claude/commands/system-review.md` (and mirror)
- `.claude/commands/validation/code-review.md` (and mirror)
- `.claude/commands/validation/code-review-fix.md` (and mirror)
- `.claude/commands/validation/system-review.md` (and mirror)
- `.claude/commands/validation/execution-report.md` (and mirror)

**Total: 24 files** (12 in `.claude/commands/`, 12 mirrors in `.opencode/commands/`)

**Out of scope:**
- Commands that already have Pipeline Position (mvp, prd, planning, pillars, decompose, code-review, code-review-fix)
- Any skill files
- Any template or reference files

**Dependencies: None (first task)**

## PRIOR TASK CONTEXT

None — this is Task 1.

## CONTEXT REFERENCES

### Current Pipeline Flow

The standard pipeline is:
```
/prime → /mvp → /prd → /pillars → /decompose → /planning → /execute → /code-review → /code-loop → /commit → /pr
```

Additional commands and their positions:
- `/council` — Architecture decisions, can be called at any point for multi-model input
- `/system-review` — Meta-analysis, runs after feature completion
- `/final-review` — Pre-commit approval gate, runs between `/code-loop` and `/commit`
- `/validation/*` — Validation-specific commands, standalone utilities

### Pattern: Pipeline Position Section

From `.claude/commands/code-review.md`:

```markdown
## Pipeline Position

```
/prime → /planning → /execute → /code-review (this) → /code-loop → /commit → /pr
```

This command runs after implementation to review code quality. Reads changed files from git diff. Output feeds `/code-review-fix` for issue resolution.
```

### Current Command Files (need Pipeline Position added)

#### prime.md current structure (first 20 lines):

```markdown
---
description: Prime agent with project context and auto-detect tech stack
model: claude-haiku-4-5-20251001
---

# Prime: Load Project Context + Stack Detection

Quick context load with automatic tech stack detection. No agents, no bloat. Direct commands and file reads.

## Step 0: Dirty State Check
...
```

**Needs**: Pipeline Position section between frontmatter and "## Step 0"

#### commit.md current structure:

```markdown
---
description: Create git commit with conventional message format
---

# Commit: Create Commit

## Files to Commit
...
```

**Needs**: Pipeline Position section between frontmatter and "## Files to Commit"

#### council.md current structure:

```markdown
---
description: Run a multi-perspective council discussion on the given topic
---

# Council: Multi-Perspective Reasoning

## How It Works
...
```

**Needs**: Pipeline Position section between frontmatter and "## How It Works"

#### execute.md current structure:

```markdown
---
description: Execute an implementation plan
model: claude-sonnet-4-6
---

# Execute: Implement from Plan

## Hard Entry Gate

**DO NOT START EXECUTION until these conditions are met:**
...
```

**Needs**: Pipeline Position section between frontmatter and "## Hard Entry Gate"

#### code-loop.md current structure:

```markdown
---
description: Automated review → fix → review loop until clean
model: claude-sonnet-4-6
---

# Code Loop: Automated Fix Loop

## Purpose

Automates the fix loop workflow:
...
```

**Needs**: Pipeline Position section between frontmatter and "## Purpose"

#### final-review.md current structure:

```markdown
---
description: Final review gate — summarize all changes, verify acceptance criteria, get human approval before commit
model: claude-sonnet-4-6
---

# Final Review: Pre-Commit Approval Gate

## Purpose

Final checkpoint between `/code-loop` (or `/code-review`) and `/commit`. Aggregates all review findings, shows what changed, verifies acceptance criteria from the plan, and asks for explicit human approval before committing.

**Workflow position:**
```
/execute → /code-loop → /final-review → /commit
```
...
```

**Note**: final-review.md has "Workflow position" as inline text, not a `## Pipeline Position` section. Needs to be reformatted.

#### pr.md current structure:

```markdown
---
description: Create feature branch, push, and open PR
---

# PR: Create Pull Request

## Prerequisites
...
```

**Needs**: Pipeline Position section between frontmatter and "## Prerequisites"

#### system-review.md current structure:

```markdown
---
description: Analyze implementation against plan with auto-diff, code-review integration, and memory suggestions
---

# System Review: Meta-Analysis

## Purpose
...
```

**Needs**: Pipeline Position section between frontmatter and "## Purpose"

#### validation/code-review.md current structure:

```markdown
---
description: Technical code review for quality and bugs — runs pre-commit
---

# Validation: Code Review

## Core Principles
...
```

**Needs**: Pipeline Position section between frontmatter and "## Core Principles"

#### validation/code-review-fix.md (need to read current structure)

This file needs Pipeline Position added. Position is standalone validation utility.

#### validation/system-review.md (need to read current structure)

This file needs Pipeline Position added. Position is standalone validation utility.

#### validation/execution-report.md (need to read current structure)

This file needs Pipeline Position added. Position is standalone validation utility.

## PATTERNS TO FOLLOW

### Pattern 1: Pipeline Position Section Format

```markdown
## Pipeline Position

```
/command-a → /command-b (this) → /command-c → /command-d
```

One-sentence description of when this runs, what it reads, and what it outputs.
```

**Key elements:**
1. `## Pipeline Position` heading (exactly this format)
2. Code block (triple backticks) with pipeline flow
3. `(this)` marker showing the current command's position
4. One sentence describing: when it runs, what it reads, what it outputs

### Pattern 2: Position for Commands Outside Main Pipeline

For commands like `/council`, `/validation/*` that aren't in the main flow:

```markdown
## Pipeline Position

```
Standalone utility — can be invoked at any point
```

This command provides {functionality} for {purpose}. Does not read from or write to pipeline artifacts directly.
```

## STEP-BY-STEP IMPLEMENTATION

### Step 1: Add Pipeline Position to prime.md

**Current content (lines 1-10):**
```markdown
---
description: Prime agent with project context and auto-detect tech stack
model: claude-haiku-4-5-20251001
---

# Prime: Load Project Context + Stack Detection

Quick context load with automatic tech stack detection. No agents, no bloat. Direct commands and file reads.

## Step 0: Dirty State Check
```

**Replace with:**
```markdown
---
description: Prime agent with project context and auto-detect tech stack
model: claude-haiku-4-5-20251001
---

# Prime: Load Project Context + Stack Detection

## Pipeline Position

```
/prime (this) → /mvp → /prd → /pillars → /decompose → /planning → /execute → /code-review → /code-loop → /commit → /pr
```

First command in any session. Reads project files and git state. Outputs context summary for session.

Quick context load with automatic tech stack detection. No agents, no bloat. Direct commands and file reads.

## Step 0: Dirty State Check
```

**PATTERN**: Add Pipeline Position after the H1 title, before the description paragraph.

### Step 2: Add Pipeline Position to commit.md

**Current content (lines 1-10):**
```markdown
---
description: Create git commit with conventional message format
---

# Commit: Create Commit

## Files to Commit
```

**Replace with:**
```markdown
---
description: Create git commit with conventional message format
---

# Commit: Create Commit

## Pipeline Position

```
/prime → /mvp → /prd → /pillars → /decompose → /planning → /execute → /code-review → /code-loop → /commit (this) → /pr
```

Commits completed work. Reads changed files from git status. Outputs commit hash and feeds `/pr`.

## Files to Commit
```

### Step 3: Add Pipeline Position to council.md

**Current content (lines 1-10):**
```markdown
---
description: Run a multi-perspective council discussion on the given topic
---

# Council: Multi-Perspective Reasoning

## How It Works
```

**Replace with:**
```markdown
---
description: Run a multi-perspective council discussion on the given topic
---

# Council: Multi-Perspective Reasoning

## Pipeline Position

```
Standalone utility — invoke at any point for architecture decisions
```

Provides multi-model perspective on complex decisions. Reads topic from user input. Outputs synthesized recommendation.

## How It Works
```

### Step 4: Add Pipeline Position to execute.md

**Current content (lines 1-15):**
```markdown
---
description: Execute an implementation plan
model: claude-sonnet-4-6
---

# Execute: Implement from Plan

## Hard Entry Gate

**DO NOT START EXECUTION until these conditions are met:**
```

**Replace with:**
```markdown
---
description: Execute an implementation plan
model: claude-sonnet-4-6
---

# Execute: Implement from Plan

## Pipeline Position

```
/prime → /mvp → /prd → /pillars → /decompose → /planning → /execute (this) → /code-review → /code-loop → /commit → /pr
```

Implements planned tasks. Reads plan from `.agents/features/{feature}/plan.md`. Outputs modified files.

## Hard Entry Gate

**DO NOT START EXECUTION until these conditions are met:**
```

### Step 5: Add Pipeline Position to code-loop.md

**Current content (lines 1-20):**
```markdown
---
description: Automated review → fix → review loop until clean
model: claude-sonnet-4-6
---

# Code Loop: Automated Fix Loop

## Purpose

Automates the fix loop workflow:
```

**Replace with:**
```markdown
---
description: Automated review → fix → review loop until clean
model: claude-sonnet-4-6
---

# Code Loop: Automated Fix Loop

## Pipeline Position

```
/prime → /mvp → /prd → /pillars → /decompose → /planning → /execute → /code-review → /code-loop (this) → /commit → /pr
```

Automated review-fix cycle. Reads review artifacts. Outputs clean code ready for commit.

## Purpose

Automates the fix loop workflow:
```

### Step 6: Add Pipeline Position to final-review.md

**Current content (lines 1-20):**
```markdown
---
description: Final review gate — summarize all changes, verify acceptance criteria, get human approval before commit
model: claude-sonnet-4-6
---

# Final Review: Pre-Commit Approval Gate

## Purpose

Final checkpoint between `/code-loop` (or `/code-review`) and `/commit`. Aggregates all review findings, shows what changed, verifies acceptance criteria from the plan, and asks for explicit human approval before committing.

**Workflow position:**
```
/execute → /code-loop → /final-review → /commit
```
...
```

**Replace with:**
```markdown
---
description: Final review gate — summarize all changes, verify acceptance criteria, get human approval before commit
model: claude-sonnet-4-6
---

# Final Review: Pre-Commit Approval Gate

## Pipeline Position

```
/prime → /mvp → /prd → /pillars → /decompose → /planning → /execute → /code-review → /code-loop → /final-review (this) → /commit → /pr
```

Final approval gate before commit. Reads changed files and review artifacts. Outputs approval decision.

## Purpose

Final checkpoint between `/code-loop` (or `/code-review`) and `/commit`. Aggregates all review findings, shows what changed, verifies acceptance criteria from the plan, and asks for explicit human approval before committing.
```

**Note**: Remove the old "Workflow position" inline text since we now have proper Pipeline Position section.

### Step 7: Add Pipeline Position to pr.md

**Current content (lines 1-10):**
```markdown
---
description: Create feature branch, push, and open PR
---

# PR: Create Pull Request

## Prerequisites
```

**Replace with:**
```markdown
---
description: Create feature branch, push, and open PR
---

# PR: Create Pull Request

## Pipeline Position

```
/prime → /mvp → /prd → /pillars → /decompose → /planning → /execute → /code-review → /code-loop → /commit → /pr (this)
```

Creates pull request for committed work. Reads commit history from git. Outputs PR URL.

## Prerequisites
```

### Step 8: Add Pipeline Position to system-review.md

**Current content (lines 1-10):**
```markdown
---
description: Analyze implementation against plan with auto-diff, code-review integration, and memory suggestions
---

# System Review: Meta-Analysis

## Purpose
```

**Replace with:**
```markdown
---
description: Analyze implementation against plan with auto-diff, code-review integration, and memory suggestions
---

# System Review: Meta-Analysis

## Pipeline Position

```
/prime → /mvp → /prd → /pillars → /decompose → /planning → /execute → /code-review → /code-loop → /commit → /pr → /system-review (this)
```

Post-PR meta-analysis. Reads plan artifacts and git diff. Outputs process improvement suggestions.

## Purpose
```

### Step 9-12: Add Pipeline Position to validation/* commands

For each validation command, the position is:

```markdown
## Pipeline Position

```
Standalone validation utility — invoked directly by user
```

This command provides {specific validation function}. Reads {inputs}. Outputs {outputs}.
```

**validation/code-review.md:**
- Add after frontmatter, before "## Core Principles"
- Position: Standalone validation utility
- Function: Deep technical code review before commit
- Reads: Changed files from git
- Outputs: Review artifact with severity-classified findings

**validation/code-review-fix.md:**
- Add after frontmatter, before first content section
- Position: Standalone validation utility
- Function: Process and fix review findings
- Reads: Review artifact
- Outputs: Fixed code files

**validation/system-review.md:**
- Add after frontmatter, before first content section
- Position: Standalone validation utility
- Function: Process and fix system review findings
- Reads: System review artifact
- Outputs: Process improvement suggestions

**validation/execution-report.md:**
- Add after frontmatter, before first content section
- Position: Standalone validation utility
- Function: Generate implementation report for system review
- Reads: Plan and execution artifacts
- Outputs: Execution report

### Step 13-24: Mirror all changes to .opencode/commands/

For each of the 12 files modified in `.claude/commands/`:
1. Copy the exact same content to the corresponding file in `.opencode/commands/`
2. Ensure identical content including frontmatter, Pipeline Position section, and all other sections

## TESTING STRATEGY

### Unit Tests
- Each file should have balanced code fences (even count of ```)
- Each file should have exactly one `## Pipeline Position` section
- The section should appear after frontmatter and H1 title

### Integration Tests
- Running `grep "## Pipeline Position"` on all commands should return 20+ matches (one per command file)
- Comparing `.claude/commands/` files to `.opencode/commands/` should show no differences

### Edge Cases
- Files with inline "Workflow position" text (final-review.md) should have it removed/replaced
- Files with "Purpose" section before Pipeline Position should have Pipeline Position added before Purpose

## VALIDATION COMMANDS

```bash
# L1: Check for balanced code fences in all modified files
for f in .claude/commands/prime.md .claude/commands/commit.md .claude/commands/council.md .claude/commands/execute.md .claude/commands/code-loop.md .claude/commands/final-review.md .claude/commands/pr.md .claude/commands/system-review.md .claude/commands/validation/code-review.md .claude/commands/validation/code-review-fix.md .claude/commands/validation/system-review.md .claude/commands/validation/execution-report.md; do
  count=$(grep -c '```' "$f" 2>/dev/null || echo 0)
  if [ $((count % 2)) -ne 0 ]; then
    echo "UNCLOSED FENCES: $f ($count)"
  else
    echo "OK: $f ($count fences)"
  fi
done

# L2: Verify Pipeline Position section exists in all target files
echo "=== Checking Pipeline Position section ==="
for f in .claude/commands/prime.md .claude/commands/commit.md .claude/commands/council.md .claude/commands/execute.md .claude/commands/code-loop.md .claude/commands/final-review.md .claude/commands/pr.md .claude/commands/system-review.md .claude/commands/validation/code-review.md .claude/commands/validation/code-review-fix.md .claude/commands/validation/system-review.md .claude/commands/validation/execution-report.md; do
  if grep -q "## Pipeline Position" "$f" 2>/dev/null; then
    echo "OK: $f"
  else
    echo "MISSING: $f"
  fi
done

# L3: Verify Pipeline Position contains "(this)" marker
for f in .claude/commands/prime.md .claude/commands/commit.md .claude/commands/council.md .claude/commands/execute.md .claude/commands/code-loop.md .claude/commands/final-review.md .claude/commands/pr.md .claude/commands/system-review.md .claude/commands/validation/*.md; do
  if grep -A5 "## Pipeline Position" "$f" 2>/dev/null | grep -q "(this)"; then
    echo "OK (has marker): $f"
  else
    echo "NO MARKER: $f"
  fi
done

# L4: Mirror sync - verify .opencode files match .claude files
echo "=== Checking mirror sync ==="
for f in prime commit council execute code-loop final-review pr system-review; do
  diff -q ".claude/commands/$f.md" ".opencode/commands/$f.md" && echo "OK: $f.md" || echo "DIFF: $f.md"
done
for f in code-review code-review-fix system-review execution-report; do
  diff -q ".claude/commands/validation/$f.md" ".opencode/commands/validation/$f.md" && echo "OK: validation/$f.md" || echo "DIFF: validation/$f.md"
done
```

## ACCEPTANCE CRITERIA

### Implementation
- [ ] `prime.md` has `## Pipeline Position` section with `(this)` marker
- [ ] `commit.md` has `## Pipeline Position` section with `(this)` marker
- [ ] `council.md` has `## Pipeline Position` section (standalone utility format)
- [ ] `execute.md` has `## Pipeline Position` section with `(this)` marker
- [ ] `code-loop.md` has `## Pipeline Position` section with `(this)` marker
- [ ] `final-review.md` has `## Pipeline Position` section with `(this)` marker
- [ ] `pr.md` has `## Pipeline Position` section with `(this)` marker
- [ ] `system-review.md` has `## Pipeline Position` section with `(this)` marker
- [ ] `validation/code-review.md` has `## Pipeline Position` section (standalone utility format)
- [ ] `validation/code-review-fix.md` has `## Pipeline Position` section (standalone utility format)
- [ ] `validation/system-review.md` has `## Pipeline Position` section (standalone utility format)
- [ ] `validation/execution-report.md` has `## Pipeline Position` section (standalone utility format)
- [ ] All 12 `.opencode/commands/` mirrors updated identically

### Runtime
- [ ] L1: All modified files have balanced code fences
- [ ] L2: All target files have `## Pipeline Position` section
- [ ] L3: Pipeline Position sections contain `(this)` marker or "Standalone utility" text
- [ ] L4: `.opencode` mirrors are byte-identical to `.claude` originals

## HANDOFF NOTES

Task 2 depends on this task being complete to understand the skill file structure pattern. The Pipeline Position sections added here will be referenced when creating skills for commands that don't have them yet.

## COMPLETION CHECKLIST

- [ ] Read all 12 target command files
- [ ] Added Pipeline Position section to all 12 `.claude/commands/` files
- [ ] Mirrored all 12 changes to `.opencode/commands/` files
- [ ] Verified L1 validation (balanced code fences)
- [ ] Verified L2 validation (section presence)
- [ ] Verified L3 validation (marker presence)
- [ ] Verified L4 validation (mirror sync)
- [ ] No deprecated command references introduced