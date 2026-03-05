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

## Execution Handoff

After /planning produces task briefs, hand to Codex:

```
codex /execute .agents/features/{feature}/task-1.md
codex /execute .agents/features/{feature}/task-2.md
...
```

The execution agent is a **swappable slot**. The task brief format (`.agents/features/{feature}/task-{N}.md`) is the universal interface — any CLI agent that can read a markdown file and execute instructions can be used.

## Archon (RAG + Task Tracking)

Archon MCP provides curated knowledge base and task tracking. Available to Claude during planning and review phases. See `.claude/reference/archon-workflow.md`.

| Tool | Purpose |
|------|---------|
| `rag_search_knowledge_base` | Search curated documentation (2-5 keyword queries) |
| `rag_search_code_examples` | Find reference code implementations |
| `rag_read_full_page` | Read full documentation pages |
| `rag_get_available_sources` | List indexed documentation sources |
| `manage_task` / `find_tasks` | Persistent task tracking across sessions |
| `manage_project` / `find_projects` | Project and version management |

**Status**: Optional — all commands degrade gracefully if unavailable.

## Related Resources

- `CLAUDE.md` — Core rules including model tier assignments
- `.claude/commands/*.md` — Individual command files with model frontmatter
- `.claude/reference/piv-loop-practice.md` — How models fit into the PIV loop

## Notes

- Model IDs may change as new versions are released — update this doc when IDs change
- The execution agent (Codex CLI) is a swappable slot — other CLI agents could fill this role
- Cost ratios are approximate and may vary by usage