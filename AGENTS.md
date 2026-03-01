# OpenCode AI Coding System

This repository contains an AI-assisted development framework with structured workflows, slash commands, agents, and context engineering methodology.

## Core Methodology

@.opencode/sections/01_core_principles.md

## PIV Loop (Plan → Implement → Validate)

@.opencode/sections/02_piv_loop.md

## Context Engineering (4 Pillars)

@.opencode/sections/03_context_engineering.md

## Git Save Points

@.opencode/sections/04_git_save_points.md

## Decision Framework

@.opencode/sections/05_decision_framework.md

## Archon Integration

@.opencode/sections/06_archon_workflow.md

---

## Project Structure

### Dynamic Content (`.agents/`)
All generated/dynamic content lives at project root:
- `.agents/features/{name}/` — All artifacts for one feature (plan, report, review, loop reports)
  - `plan.md` / `plan.done.md` — Feature plan (marked done after execution)
  - `plan-master.md` — Master plan for multi-phase features
  - `plan-phase-{N}.md` — Sub-plans for each phase
  - `report.md` / `report.done.md` — Execution report (marked done after commit)
  - `review.md` / `review.done.md` — Code review (marked done when addressed)
  - `review-{N}.md` — Numbered reviews from `/code-loop` iterations
  - `loop-report-{N}.md` — Loop iteration reports
  - `checkpoint-{N}.md` — Loop checkpoints
  - `fixes-{N}.md` — Fix plans from `/code-loop`
- `.agents/specs/` — BUILD_ORDER, PILLARS, build-state.json
- `.agents/context/` — Session context

#### `.done.md` Lifecycle

| Artifact | Created by | Marked `.done.md` by | Trigger |
|----------|-----------|---------------------|---------|
| `plan.md` | `/planning` | `/execute` | All plan tasks completed |
| `plan-master.md` | `/planning` | `/execute` | All phases completed |
| `plan-phase-{N}.md` | `/planning` | `/execute` | Phase fully executed |
| `report.md` | `/execute` | `/commit` | Changes committed to git |
| `review.md` | `/code-review` | `/commit` or `/code-loop` | All findings addressed |
| `review-{N}.md` | `/code-loop` | `/code-loop` | Clean exit |
| `loop-report-{N}.md` | `/code-loop` | `/code-loop` | Clean exit |
| `fixes-{N}.md` | `/code-loop` | `/code-loop` | Fixes fully applied |

### Static Configuration (`.opencode/`)
System configuration and reusable assets:
- `.opencode/commands/` — Slash commands
- `.opencode/agents/` — Custom subagents
- `.opencode/templates/` — Plan and document templates
- `.opencode/reference/` — On-demand guides (loaded when needed)
- `.opencode/sections/` — Auto-loaded rules (always loaded)
- `.opencode/skills/` — Planning methodology and workflows

---

## Key Commands

| Command | Purpose |
|---------|---------|
| `/prime` | Load codebase context at session start |
| `/planning {feature}` | Create structured implementation plan |
| `/execute {plan}` | Implement from plan |
| `/build` | Guided feature implementation with /pillars |
| `/code-review` | Technical code review |
| `/code-loop` | Automated review → fix → commit cycle |
| `/system-review` | Divergence analysis (plan vs implementation) |
| `/commit` | Conventional git commit |
| `/sync` | Check Archon sync status |

---

## On-Demand Reference Guides

Load these when needed for specific tasks:

| Guide | When to Load |
|-------|--------------|
| `reference/piv-loop-practice.md` | Deep dive on PIV methodology |
| `reference/validation-discipline.md` | 5-level validation pyramid |
| `reference/implementation-discipline.md` | Execute command patterns |
| `reference/command-design-framework.md` | Creating new commands |
| `reference/system-foundations.md` | Core system architecture |
| `reference/layer1-guide.md` | Building CLAUDE.md/AGENTS.md |
