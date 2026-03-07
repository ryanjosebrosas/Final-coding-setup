---
name: pillars
description: Knowledge framework for infrastructure pillar identification, sequencing, and gate criteria quality
license: MIT
compatibility: opencode
---

# Pillars Methodology — Infrastructure Layer Analysis

This skill provides the quality standards for identifying and defining infrastructure pillars
that sequence a project's build order. It complements the `/pillars` command — the command
provides the workflow, this skill provides the quality criteria.

## When This Skill Applies

- `/pillars` command is invoked
- PRD.md exists and needs to be analyzed into infrastructure layers
- PILLARS.md needs to be created or updated
- A specific pillar's scope needs re-analysis (with $ARGUMENTS)

## Pillar Identification Quality

A well-defined pillar set has these properties:

**Cohesive** — Each pillar owns exactly one infrastructure concern:
Good: "Data Infrastructure" — owns schema, migrations, core models, DB connection
Bad: "Data and Services" — two concerns, should be two pillars

**Sequential** — Dependencies run in one direction only:
Good: Pillar 1 (Services) depends on Pillar 0 (Data) — services use data models
Bad: Pillar 0 depends on Pillar 1 — circular dependency, wrong sequencing

**Scoped** — A pillar should represent 1-2 weeks of work (roughly 3-8 specs):
If a pillar has 12+ specs, consider splitting it
If a pillar has 1-2 specs, consider merging with an adjacent pillar

**Gated** — Gate criteria are measurable pass/fail tests, not subjective assessments:
Good: "All database migrations run without errors; core model unit tests pass 3/3"
Bad: "Data layer is working"

## Pillar 0 Rule

**Pillar 0 is ALWAYS the data/infrastructure foundation. No exceptions.**

Why this rule exists: every subsequent pillar depends on data models, config, and types
that Pillar 0 establishes. Building services before the data layer means either:
(a) re-defining data models multiple times, or
(b) building services against imaginary interfaces that change.

The Pillar 0 rule prevents both failure modes.

**When users push back** ("we don't have a database"):
Even without a database, Pillar 0 = project scaffold + config + core types.
The pattern holds regardless of persistence technology.

## Gate Criteria Quality

Gate criteria are the hardest part of pillar definition to get right.

**Measurable gate criteria:**
- "All {N} database migrations apply without errors on a clean schema"
- "AuthService.login() returns valid JWT for correct credentials"
- "API server starts and responds 200 to /health"

**Unmeasurable (bad) gate criteria:**
- "Data layer is complete" — complete by whose measure?
- "Services are implemented" — how many? which ones?
- "Integration is working" — working for what?

**The test:** Can a developer run a command or check a state and know in 30 seconds
whether the gate passes or fails? If not, the criterion is not measurable.

## Anti-Patterns

**Skipping Pillar 0** — "We'll set up the data layer as part of the service work."
Result: data models are defined ad hoc, inconsistently, and have to be refactored.
The data foundation is always Pillar 0, even if it's just config + types.

**Over-pillaring** — Creating 10+ pillars for a medium project.
Result: too many gates, too much context switching between pillar contexts.
4-7 pillars is typical. If you have more, merge adjacent pillars with similar concerns.

**Under-pillaring** — One pillar called "Core Implementation" covering everything.
Result: no real sequencing, no gate enforcement, defeats the purpose of /pillars.
If a pillar has 15+ specs, it needs to be split.

**Vague pillar scope** — "Pillar 2: Various integrations and stuff"
Result: /decompose can't research the pillar effectively because scope is undefined.
Each pillar must have explicit "Scope" and "Not included" sections.

**Aspirational gate criteria** — "Pillar 0: Production-ready data layer"
Result: the gate never passes because "production-ready" is undefined.
Gate criteria must reflect the pillar's actual deliverables, not future aspirations.

**Ignoring PRD section 12** — Not using the implementation phases from the PRD to
inform pillar structure. Section 12 is the PRD author's decomposition of the build —
use it as the primary input for pillar identification.

## Key Rules

1. **Pillar 0 is mandatory** — Always the data/infrastructure foundation, no exceptions
2. **Gate criteria must be measurable** — Can pass/fail be determined in 30 seconds?
3. **HARD STOP at approval gate** — Do not write PILLARS.md without explicit user approval
4. **Scope from PRD, not intuition** — Pillar scope comes from PRD sections, not assumptions
5. **4-7 pillars is typical** — Too few = no sequencing; too many = overhead
6. **Re-runs are safe** — Completed pillar files are preserved; only re-analyze incomplete ones
7. **$ARGUMENTS = focused re-analysis** — Named pillar only; preserve others unchanged

## Related Commands

- `/prd` — Produces PRD.md which /pillars reads as primary input
- `/pillars [area]` — The infrastructure analysis workflow this skill supports
- `/decompose {pillar-N}` — Specs out one pillar per session; reads PILLARS.md as input
- `/planning {spec}` — Uses per-pillar spec files produced by /decompose