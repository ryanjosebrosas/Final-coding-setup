---
name: decompose
description: Knowledge framework for one-pillar-per-session research, spec atomicity, and dependency analysis discipline
license: MIT
compatibility: opencode
---

# Decompose Methodology — One Pillar, Deep Research

This skill provides the quality standards for decomposing infrastructure pillars into
actionable, dependency-aware spec lists. It complements the `/decompose` command — the command
provides the workflow, this skill provides the depth criteria.

## When This Skill Applies

- `/decompose <pillar>` command is invoked
- A pillar from PILLARS.md needs to be researched and specced out
- A per-pillar spec file needs to be created or updated
- Spec list needs dependency analysis before being handed to /planning

## One-Pillar-Per-Session Discipline

**Each `/decompose` run processes exactly one pillar.** This is not a soft guideline.

Why this rule exists:
- Different pillars require different research (data layer needs schema patterns; API layer
  needs endpoint design patterns). Mixed research produces mixed, shallow output.
- Each pillar's findings inform the next one. Pillar 0's data models become the input for
  Pillar 1's service interfaces — this handoff requires the previous pillar to be complete.
- One pillar = one context window = focused, deep work.

**The correct pattern:**
```
Session 1: /decompose 0         → pillar-0-data.md complete
Session 2: /decompose 1         → pillar-1-services.md complete (informed by pillar-0)
Session 3: /decompose 2         → pillar-2-api.md complete (informed by pillar-1)
```

**Not:**
```
Single session: process all 5 pillars → shallow research, no handoff between pillars
```

## Spec Atomicity Standards

A well-defined spec is atomic: it has one clear deliverable, is independently testable,
and has no ambiguity about whether it's done.

**Atomic spec:**
```
P0-01 user-schema (standard) — Create users table migration with id, email, created_at fields
  - acceptance: migration applies to fresh DB; psql shows table with correct columns
```

**Non-atomic spec:**
```
P0-01 data-layer (heavy) — Set up all the data models and migrations
  - acceptance: data layer works
```

Tests for atomicity:
1. Can one developer complete this in 1-2 days? (If not, split it)
2. Is "done" measurable without ambiguity? (If not, rewrite the acceptance criterion)
3. Does it touch only one or two related files? (If it touches 5+ files, split it)

## PRD Cross-Reference Discipline

Every spec must trace back to a PRD requirement. The PRD Coverage Map is not decoration —
it is the evidence that the spec list is complete.

**What "covered" means:**
A spec covers a PRD requirement when implementing the spec would satisfy the requirement.
Not "loosely related to" but "directly implements."

**What a gap means:**
A PRD requirement with no covering spec is a missing feature. Either:
(a) Create a spec for it, or
(b) Explicitly assign it to a later pillar (note in PRD Coverage Map)

Silently ignoring a PRD gap means the feature will be discovered missing during implementation
— the worst time to find it.

**Coverage target:** 100% of PRD requirements for this pillar's scope.
Anything less requires explicit justification in the PRD Coverage Map.

## Dependency Analysis Discipline

Dependency errors are the most common source of blocked implementation. The dependency
analysis step exists to catch them before writing the plan.

**Common dependency errors:**

1. **Missing dependency** — Spec B depends on something that doesn't exist yet
   Fix: add the missing spec before spec B, or move spec B to a later pillar

2. **Wrong pillar** — Spec A depends on pillar 2, but pillar 2 hasn't been decomposed yet
   Fix: move spec A to pillar 2 or later, or decompose pillar 2 first

3. **Circular dependency** — Spec A depends on spec B, which depends on spec A
   Fix: extract the shared interface into a new spec that both A and B depend on

4. **Missing gate** — No gate spec at the end of the pillar
   Fix: always add P{N}-GATE as the last spec

**Dependency verification process:**
For each spec, trace the full dependency chain from leaf to root. Every node in the chain
must exist as a spec in this or a prior pillar. If any node is missing, it is an error.

## Anti-Patterns

**Processing multiple pillars in one session** — "I'll just do pillars 0, 1, and 2 while
I have the context." Results in shallow research for each pillar and no handoff between them.
Rule: one pillar per session.

**Spec without acceptance criterion** — "P0-01 database setup (heavy) — create the database."
If "done" isn't defined, the implementation can't be verified. Every spec needs measurable acceptance.

**Ignoring PRD gaps** — "I'll just skip that section, it's not important for this pillar."
PRD gaps are missing features. They MUST be covered or explicitly deferred to a later pillar.

**No gate spec** — Pillar has no P{N}-GATE. Without a gate, there is no clear completion signal.
The next pillar starts before the current one is actually done.

**Over-speccing** — Writing 15+ specs for a single pillar. Means the pillar scope is too wide.
Split the pillar (go back to /pillars) rather than writing an unmanageable spec list.

**Under-speccing** — Writing 1-2 specs for a pillar. Usually means some PRD requirements are
being ignored. Check the PRD Coverage Map.

**Vague depth tags** — Using `heavy` for everything to avoid judgment.
Light = simple file, single concern, <1 day. Standard = moderate, 1-2 days. Heavy = complex, 2-5 days.
Inflated depth tags produce inaccurate effort estimates.

## Key Rules

1. **One pillar per session** — Each /decompose run processes exactly one pillar
2. **PRD cross-reference is mandatory** — 100% coverage target; gaps require explicit justification
3. **Dependency analysis is mandatory** — Full chain verification before writing the file
4. **Every pillar ends with a gate spec** — P{N}-GATE is required, not optional
5. **HARD STOP at approval gate** — Do not write the spec file without explicit user approval
6. **Atomic specs** — One deliverable, measurable acceptance, 1-2 day scope
7. **RAG is optional** — PRD cross-ref + dependency analysis are mandatory; RAG adds depth
8. **Handoff to next pillar** — Step 5 always shows what to run next (both /planning and /decompose)

## Related Commands

- `/pillars` — Produces PILLARS.md which /decompose reads as structural input
- `/decompose <pillar>` — The one-pillar research workflow this skill supports
- `/planning {spec-id}` — Uses per-pillar spec files produced by /decompose
- `/council` — Optional: get multi-model gap detection on a complex pillar's spec list