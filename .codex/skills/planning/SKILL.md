---
name: planning
description: Interactive discovery session that produces a structured implementation plan.
             Use when the user wants to plan a feature or break down work into task briefs.
             Trigger phrases include: "plan a feature", "create implementation plan",
             "break down a feature", "plan this", "help me plan", "create task briefs",
             "plan the implementation", "write a plan for".
---

# Planning: Interactive Feature Planning

## When to Use This Skill

Use this skill when the user wants to plan implementation of a feature. Planning produces:
1. `plan.md` — feature overview, context, task index
2. `task-N.md` briefs — self-contained execution briefs (one per session)

Planning is ALWAYS required before execution. No task brief = no execution.

## Discovery-First Discipline

Planning has two phases: discovery (conversation) then writing (artifact).

**Discovery phase** — ask questions to understand:
- What exactly needs to be built?
- What does the codebase look like where this feature will land?
- What patterns exist that the implementation should follow?
- What are the acceptance criteria?
- What could go wrong?

Don't start writing plan.md until you have clear answers. A plan written from ambiguous
intent produces ambiguous task briefs.

**Writing phase** — produce artifacts only after discovery is complete.

## Task Decomposition Quality

Good task decomposition:
- Each task is ONE file created or ONE behavior changed
- Each task brief can be executed in a single session (≤700 lines)
- Task N's handoff notes tell Task N+1 exactly what was done
- No task depends on runtime state that isn't verifiable from files

Bad task decomposition:
- "Task 1: Implement the auth system" (too broad — multiple files, multiple behaviors)
- "Task 1: Set up project" (too vague — set up what, exactly?)
- Tasks that can't be validated without running the full system

## Brief Writing Standards

Each task brief must be self-contained — the execution agent reads ONLY the brief:

- **OBJECTIVE**: One sentence. The test for "done."
- **CONTEXT REFERENCES**: Paste the relevant file sections inline (not "see file X")
- **PATTERNS TO FOLLOW**: Paste actual code snippets (not "follow the pattern in Y")
- **STEP-BY-STEP TASKS**: Each step has IMPLEMENT + VALIDATE
- **ACCEPTANCE CRITERIA**: Checkboxes the executor verifies

**The inline content rule**: If the brief says "read file X to understand pattern Y",
the executor will read the wrong version of file X in their session. Paste the content.

## Pipeline Handoff

After producing plan.md and all task briefs, write the handoff:
```
- Last Command: /planning
- Feature: {feature}
- Next Command: /execute .agents/features/{feature}/plan.md
- Status: awaiting-execution
```

## Key Rules

1. **Discovery before writing** — don't write plan.md until you understand the feature
2. **One behavior per task** — briefs cover one file or one behavior, not multiple
3. **Inline content** — paste code, don't reference it
4. **Handoff after planning** — always write next-command.md pointing to /execute
5. **No task brief = no execution** — execution without a plan is a process violation

## Related Commands

- `/planning` — The planning workflow this skill supports
- `/execute` — Consumes the task briefs this skill produces
- `/prd` — Precedes planning; provides product spec that planning translates to tasks
