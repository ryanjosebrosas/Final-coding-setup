# Task 6: Create Model Strategy Reference Document

## OBJECTIVE

Create the missing `model-strategy.md` reference document that explains the model tier strategy used in this AI coding system.

## SCOPE

**Files to create:**
- `.claude/reference/model-strategy.md`

**Total: 1 new file**

**Out of scope:**
- Modifying `file-structure.md` (already lists this file)
- Any other reference files
- Any command or skill files

**Dependencies: None (independent of other tasks)**

## PRIOR TASK CONTEXT

None — this task is independent and can run in parallel with Tasks 1-5.

## CONTEXT REFERENCES

### Model Tier Strategy (from CLAUDE.md)

From the project's core rules:

```markdown
**MODEL TIERS — Use the right Claude model for the task:**
- **Opus** (`claude-opus-4-6`) → thinking & planning: `/mvp`, `/prd`, `/planning`, `/council`, architecture decisions
- **Sonnet** (`claude-sonnet-4-6`) → review & validation: `/code-review`, `/code-loop`, `/system-review`, `/pr`, `/final-review`
- **Haiku** (`claude-haiku-4-5-20251001`) → retrieval & light tasks: `/prime`, RAG queries, `/commit`, quick checks
- **Codex CLI** → execution: `codex /execute {task-brief-path}`
```

### Reference Document Pattern

From existing reference files like `.claude/reference/piv-loop-practice.md`:

```markdown
# Title — Subtitle

Brief introduction paragraph explaining what this document covers.

## Section 1

Content...

## Section 2

Content...

## Related Resources

- Links to related documents
```

### Current Command Model Assignments

| Command | Model | Tier | Rationale |
|---------|-------|------|-----------|
| `/mvp` | Opus | Thinking | Big-idea discovery requires deep reasoning |
| `/prd` | Opus | Thinking | Product spec requires comprehensive analysis |
| `/planning` | Opus | Thinking | Plan creation requires strategic thinking |
| `/council` | Opus | Thinking | Multi-perspective reasoning |
| `/pillars` | Opus | Thinking | Infrastructure analysis |
| `/decompose` | Opus | Thinking | Spec decomposition |
| `/code-review` | Sonnet | Review | Quality review with judgment |
| `/code-loop` | Sonnet | Review | Review-fix cycle |
| `/system-review` | Sonnet | Review | Meta-analysis |
| `/pr` | Sonnet | Review | PR creation with judgment |
| `/final-review` | Sonnet | Review | Final approval gate |
| `/code-review-fix` | Sonnet | Review | Fix judgment calls |
| `/prime` | Haiku | Retrieval | Context loading, no complex reasoning |
| `/commit` | Haiku | Light | Conventional commit formatting |
| `/execute` | Sonnet | Review | Plan execution with judgment |

## PATTERNS TO FOLLOW

### Reference Document Structure

1. **Title** — Clear, descriptive title with em-dash subtitle
2. **Introduction** — Brief paragraph explaining purpose
3. **Main Sections** — Organized by topic
4. **Examples/Tables** — Concrete model assignments
5. **Rationale** — Why each tier is appropriate
6. **Related Resources** — Links to other docs

## STEP-BY-STEP IMPLEMENTATION

### Step 1: Create the model-strategy.md file

**ACTION**: CREATE
**TARGET**: `.claude/reference/model-strategy.md`

**Content:**
```markdown
# Model Strategy — Tier-Based Model Selection

This document explains the model tier strategy used in the AI coding system. Each command is assigned a specific Claude model based on the cognitive demands of the task, optimizing for both cost and quality.

## Overview

The system uses three Claude model tiers:

| Tier | Model | Best For |
|------|-------|----------|
| **Thinking** | Claude Opus 4.6 | Deep reasoning, planning, architecture decisions |
| **Review** | Claude Sonnet 4.6 | Quality judgment, validation, implementation |
| **Retrieval** | Claude Haiku 4.5 | Context loading, quick checks, formatting |

Additionally, **Codex CLI** handles execution tasks (writing and modifying files).

## Tier Assignments

### Opus (Thinking) — Deep Reasoning Tasks

Commands that require strategic thinking, comprehensive analysis, or creative problem-solving:

| Command | Purpose | Why Opus |
|---------|---------|----------|
| `/mvp` | Big-idea discovery | Socratic questioning requires nuanced reasoning |
| `/prd` | Product spec creation | Comprehensive analysis of requirements |
| `/planning` | Implementation planning | Strategic decomposition and task design |
| `/council` | Multi-perspective reasoning | Synthesis of multiple viewpoints |
| `/pillars` | Infrastructure analysis | System-level thinking about dependencies |
| `/decompose` | Spec decomposition | Deep research and spec design |

**Characteristics of Opus tasks:**
- Open-ended reasoning
- Creative problem-solving
- Multi-step planning
- Architecture decisions
- Complex synthesis

### Sonnet (Review) — Quality Judgment Tasks

Commands that require evaluation, validation, or implementation with judgment:

| Command | Purpose | Why Sonnet |
|---------|---------|------------|
| `/code-review` | Code quality review | Judgment on severity and suggestions |
| `/code-loop` | Review-fix cycle | Iterative judgment calls |
| `/code-review-fix` | Fix implementation | Judgment on minimal changes |
| `/system-review` | Meta-analysis | Evaluation of process quality |
| `/final-review` | Approval gate | Judgment on commit readiness |
| `/pr` | PR creation | Judgment on description quality |
| `/execute` | Plan implementation | Judgment on code quality during execution |

**Characteristics of Sonnet tasks:**
- Quality judgment
- Severity classification
- Implementation decisions
- Validation checks
- Iterative refinement

### Haiku (Retrieval) — Light Tasks

Commands that require fast execution with minimal reasoning:

| Command | Purpose | Why Haiku |
|---------|---------|-----------|
| `/prime` | Context loading | Fast reads, no complex reasoning |
| `/commit` | Commit formatting | Structured output, no reasoning |

**Characteristics of Haiku tasks:**
- File reading and summarization
- Structured formatting
- Quick checks
- Context aggregation
- No complex decisions

### Codex CLI — Execution

The execution agent handles file writing and modification:

| Command | Purpose | Why Codex |
|---------|---------|-----------|
| `/execute` (via Codex) | File modification | Dedicated execution agent |

**Characteristics of Codex tasks:**
- Writing new files
- Modifying existing files
- Running shell commands
- Following task briefs

## Overriding Model Assignments

### In Command Files

Model assignment is specified in the frontmatter:

```yaml
---
description: Command description
model: claude-sonnet-4-6
---
```

To change the model:
1. Edit the `model` field in the frontmatter
2. Use the exact model ID: `claude-opus-4-6`, `claude-sonnet-4-6`, or `claude-haiku-4-5-20251001`

### When to Override

**Upgrade to Opus:**
- Task is more complex than expected
- Architecture decisions are needed
- Multiple valid approaches need evaluation

**Downgrade to Haiku:**
- Task is simpler than expected
- No judgment calls needed
- Speed is critical

## Cost Considerations

Approximate relative costs (Haiku = 1x):

| Tier | Relative Cost | When to Use |
|------|---------------|-------------|
| Haiku | 1x | Light tasks, high volume |
| Sonnet | ~3x | Review tasks, moderate complexity |
| Opus | ~15x | Thinking tasks, high stakes |

**Guidelines:**
- Use Haiku when possible (lowest cost)
- Use Sonnet for judgment tasks (good balance)
- Use Opus only when deep reasoning is required (highest cost, highest quality)

## Quality vs Speed Tradeoffs

| Tier | Quality | Speed | Best For |
|------|---------|-------|----------|
| Opus | Highest | Slowest | Critical decisions, architecture |
| Sonnet | High | Fast | Most tasks, good balance |
| Haiku | Good | Fastest | Light tasks, high volume |

## Related Resources

- `CLAUDE.md` — Core rules including model tier assignments
- `.claude/commands/*.md` — Individual command files with model frontmatter
- `.claude/reference/piv-loop-practice.md` — How models fit into the PIV loop

## Notes

- Model IDs may change as new versions are released — update this doc when IDs change
- The execution agent (Codex CLI) is a swappable slot — other CLI agents could fill this role
- Cost ratios are approximate and may vary by usage
```

## TESTING STRATEGY

### Unit Tests
- File exists at the expected path
- File is valid markdown with proper sections
- File contains all required information

### Integration Tests
- File is linked from file-structure.md (already exists)
- Content matches the model assignments in command frontmatter

## VALIDATION COMMANDS

```bash
# L1: File exists
test -f .claude/reference/model-strategy.md && echo "OK: File exists" || echo "MISSING: File not found"

# L2: File has expected sections
echo "=== Checking sections ==="
for section in "Overview" "Tier Assignments" "Opus" "Sonnet" "Haiku" "Cost Considerations"; do
  if grep -q "## $section" .claude/reference/model-strategy.md 2>/dev/null; then
    echo "OK: $section section found"
  else
    echo "MISSING: $section section"
  fi
done

# L2: File contains model IDs
echo "=== Checking model IDs ==="
for model in "claude-opus-4-6" "claude-sonnet-4-6" "claude-haiku-4-5-20251001"; do
  if grep -q "$model" .claude/reference/model-strategy.md 2>/dev/null; then
    echo "OK: $model mentioned"
  else
    echo "MISSING: $model not mentioned"
  fi
done

# L3: File referenced in file-structure.md
if grep -q "model-strategy" .claude/reference/file-structure.md 2>/dev/null; then
  echo "OK: Referenced in file-structure.md"
else
  echo "WARNING: Not referenced in file-structure.md"
fi
```

## ACCEPTANCE CRITERIA

### Implementation
- [ ] `.claude/reference/model-strategy.md` created with complete content
- [ ] Document includes Overview section
- [ ] Document includes Tier Assignments with tables
- [ ] Document includes Rationale for each tier
- [ ] Document includes Cost Considerations
- [ ] Document includes Related Resources

### Runtime
- [ ] L1: File exists at `.claude/reference/model-strategy.md`
- [ ] L2: File has all expected sections
- [ ] L2: File mentions all three model IDs
- [ ] L3: File is referenced in file-structure.md

## HANDOFF NOTES

This is the final task in the pipeline-hardening feature. After this task, all validation commands should pass and the feature is complete.

## COMPLETION CHECKLIST

- [ ] Created model-strategy.md with complete content
- [ ] Verified L1 validation (file exists)
- [ ] Verified L2 validation (sections present)
- [ ] Verified L2 validation (model IDs present)
- [ ] Verified L3 validation (referenced in file-structure.md)
- [ ] Document is well-formatted and readable