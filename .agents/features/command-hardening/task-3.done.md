# Task 3: Rebuild /pillars Command + Create Skill

## Objective

Recreate `.claude/commands/pillars.md` and create `.claude/skills/pillars/SKILL.md` from scratch,
then mirror both to `.opencode/`. The command was deleted in a prior session; it must be rebuilt
with the updated pipeline (pointing to `/decompose {pillar-N}` instead of `/build`).

---

## Scope

**Files created** (4 total):
- `.claude/commands/pillars.md` — command workflow (create fresh)
- `.claude/skills/pillars/SKILL.md` — quality framework (create fresh)
- `.opencode/commands/pillars.md` — mirror of command
- `.opencode/skills/pillars/SKILL.md` — mirror of skill (create dir + file)

**Out of scope:**
- `.claude/commands/mvp.md` and `prd.md` — handled in Tasks 1-2
- `.claude/commands/decompose.md` — handled in Task 4
- `.agents/specs/PILLARS.md` — the output of /pillars (not modified here, created at runtime)

**Depends on:** Nothing (Tasks 1-4 all touch different files, no code dependency)

---

## Prior Task Context

Tasks 1 and 2 hardened the MVP and PRD commands. The pipeline is now:
```
/mvp → /prd → /pillars → /decompose {pillar-N} → /planning → /execute → /commit → /pr
```

Pillars is Step 3. It reads `PRD.md` (from `/prd`) and outputs `.agents/specs/PILLARS.md`.
The key change from the deleted version: `/pillars` no longer feeds `/build` or `/ship`.
It feeds `/decompose {pillar-N}` which processes ONE pillar per session.

---

## Context References

### Recovered .claude/commands/pillars.md (from git history — full structure)

The deleted version had this structure (recovered via `git show HEAD~4:.claude/commands/pillars.md`):

```markdown
---
description: Analyze PRD and identify infrastructure pillars with dependency order and gate criteria
---

# Pillars: Infrastructure Layer Analysis

Analyze the PRD and identify the fundamental infrastructure layers (pillars) that must be built
in order. Each pillar is a coherent phase of work with clear gate criteria that must pass before
the next pillar begins. Produces `.agents/specs/PILLARS.md`.

## Usage
/pillars [focus area or pillar to re-analyze]
$ARGUMENTS — Optional: focus on a specific area, or name a pillar to re-analyze mid-project.

## Pipeline Position
OLD: /mvp → /prd → /pillars (layers) → /decompose (build order) → /build next → /ship
NEW: /mvp → /prd → /pillars (layers) → /decompose {pillar-N} (per-pillar spec) → /planning

## Step 1: Read Inputs
- Look for PRD file (PRD.md, docs/PRD.md, or *-prd.md)
- If no PRD: stop — "No PRD found. Run /prd first."
- Also read mvp.md (high-level vision and priority signals)
- Scan codebase for existing infrastructure
- Check .agents/specs/PILLARS.md if exists (preserve completed pillar status on re-run)

## Step 2: Propose Pillar Structure
Pillar 0 Rule (Mandatory): always the data/infrastructure foundation
Typical pillar order: 0=Data, 1=Core Services, 2=Integration, 3=Interface, 4=Observability
Pillar count: let PRD dictate (typically 4-7)

## Step 3: Present Pillars for Approval
Format:
  Infrastructure Pillars: {N} pillars identified
  Pillar 0 ({Name}): {brief description} — ~{N} specs
    → Enables: {what Pillar 1 can do}
  ...
  Dependency order: 0 → 1 → 2 → ...
  Approve? (yes / adjust: ...)

## Step 4: Write PILLARS.md
Per-pillar sections: scope, not-included, enables, breaks-without, gate criteria, gate checks

## Step 5: Confirm and Advance
OLD: Run /decompose to create the full build roadmap
NEW: Run /decompose {pillar-0-name} to spec out the first pillar
```

### Existing SKILL.md pattern (from .claude/skills/mvp/SKILL.md)

Frontmatter:
```yaml
---
name: {command-name}
description: Knowledge framework for {description}
license: MIT
compatibility: claude-code
---
```

Sections: When This Skill Applies, [Core Methodology / Quality Standards], Anti-Patterns, Key Rules, Related Commands

### What PILLARS.md output looks like

From the old decompose.md, `/pillars` produces a PILLARS.md like:

```markdown
# Infrastructure Pillars — {Project Name}

Generated: {date} | Source: PRD.md | Pillars: {N}

## Pillar 0: {Name}

**Scope**: {what's in this pillar}
**Not included**: {what's explicitly out of scope for this pillar}
**Depends on**: nothing (first pillar)
**What this unlocks**: {what Pillar 1 can do because Pillar 0 exists}
**What breaks without it**: {what can't be built if Pillar 0 is missing}
**Gate criteria**:
- [ ] {measurable pass/fail criterion}
- [ ] {measurable criterion}

## Pillar 1: {Name}

**Scope**: {what's in this pillar}
**Not included**: {exclusions}
**Depends on**: Pillar 0 ({specific dependency — what it needs from Pillar 0})
**What this unlocks**: {what Pillar 2 can do}
**What breaks without it**: {what can't be built}
**Gate criteria**:
- [ ] {criterion}

(repeat for each pillar)
```

### Pillar 0 rule (from old pillars.md, mandatory)

```
Pillar 0 is ALWAYS the data/infrastructure foundation. No project skips this.

- For database-backed projects: schema, storage, core models, migrations, connection setup
- For service/API projects: config, core types, shared contracts, project scaffold
- For CLI/tool projects: config, core types, input/output contracts
- For "no database" projects: Pillar 0 is still config + core types + project scaffold

This is non-negotiable. If the PRD doesn't call out a data layer explicitly,
create one from the data models in PRD Section 8.
```

---

## Patterns to Follow

### Command gate pattern (from prd.md after hardening in Task 2)

Every gate must have:
1. Formatted confirmation prompt
2. "**HARD STOP** — Do NOT proceed until the user confirms." immediately after

### Command advance pattern (from mvp.md Step 4)

The final step shows what was written (with file path and summary stats) then says exactly what to run next:
```
PILLARS.md written to: .agents/specs/PILLARS.md
Pillars identified: {N} | Total estimated specs: ~{M}

Next: /decompose {pillar-0-name} — research and spec out the first pillar.
Run /decompose {name of Pillar 0} to continue.
```

### Re-run handling pattern

If PILLARS.md already exists, respect completed pillars. From the old version:
```
If PILLARS.md exists:
  - Mark pillars where all specs in BUILD_ORDER are [x] as: status: complete
  - Re-analyze only incomplete pillars
  - Preserve completed pillar sections unchanged
```
New version: Preserve pillars where the pillar file `.agents/specs/pillar-N-{name}.md`
is fully complete (all specs checked off).

---

## Full Command File to Write

Write `.claude/commands/pillars.md` with this content:

```markdown
---
description: Analyze PRD and identify infrastructure pillars with dependency order and gate criteria
model: claude-opus-4-6
argument-hint: [focus area or pillar name]
---

# Pillars: Infrastructure Layer Analysis

Analyze the PRD and identify the fundamental infrastructure layers (pillars) that must be built
in order. Each pillar is a coherent phase of work with clear gate criteria that must pass before
the next pillar begins. Produces `.agents/specs/PILLARS.md`.

## Usage

```
/pillars [focus area or pillar to re-analyze]
```

`$ARGUMENTS` — Optional: focus on a specific area, or name a pillar to re-analyze mid-project.

---

## Pipeline Position

```
/mvp (big idea) → /prd (full spec) → /pillars (layers) → /decompose {pillar-N} (per-pillar spec) → /planning → /execute → /commit → /pr
```

This is Step 3. Requires `PRD.md` (produced by `/prd`). Output feeds `/decompose`, which specs
out one pillar per session.

---

## Step 1: Read Inputs

1. Look for a PRD file (`PRD.md`, `docs/PRD.md`, or any file matching `*-prd.md`).
   - If no PRD found: stop and report "No PRD found. Run `/prd` first." Do not proceed.
2. Read `mvp.md` if present — provides high-level vision and priority signals.
3. Scan the codebase for existing infrastructure:
   - Check `.agents/specs/PILLARS.md` if it exists — preserve completed pillar status on re-run.
   - Check `.agents/specs/pillar-*.md` — note which pillars are already fully decomposed.
   - Scan top-level directories to understand what already exists in the codebase.

Extract from the PRD:
- Core capabilities and feature groups
- Technical architecture decisions
- Integration points and dependencies
- Implementation phases (Section 12)
- Data models (Section 8a) — used to define Pillar 0 scope
- Service contracts (Section 8b) — used to define later pillar scope

**If `$ARGUMENTS` is provided**: Focus re-analysis on the named pillar or area.
All other pillars retain their current status unchanged.

---

## Step 2: Propose Pillar Structure

Analyze the PRD and propose infrastructure pillars. Each pillar must be:

- **Cohesive** — a single infrastructure concern (data, services, API, etc.)
- **Sequential** — later pillars genuinely depend on earlier ones
- **Scoped** — 1-2 weeks of focused work, roughly 3-8 specs per pillar
- **Gated** — has concrete pass/fail criteria before the next pillar starts

### Pillar 0 Rule (MANDATORY)

**Pillar 0 is ALWAYS the data/infrastructure foundation. No project skips this.**

- For database-backed projects: schema, storage, core models, migrations, connection setup
- For service/API projects: config, core types, shared contracts, project scaffold
- For CLI/tool projects: config, core types, input/output contracts
- For "no database" projects: Pillar 0 is still config + core types + project scaffold

If the PRD doesn't explicitly call out a data layer, create one from the data models in
PRD Section 8. If no data models exist, Pillar 0 is: scaffold + config + core types.

### Typical Pillar Order

Adapt to the PRD — don't force this structure:

| Layer | Example Pillar Name | What It Establishes |
|-------|--------------------|--------------------|
| 0 | Data Infrastructure (required) | Schema, storage, core models, config |
| 1 | Core Services | Business logic, processing pipelines |
| 2 | Integration Layer | External APIs, auth, cross-cutting concerns |
| 3 | Interface Layer | API endpoints, CLI, UI components |
| 4 | Observability | Logging, metrics, monitoring |

**Pillar count:** Let the PRD dictate. Typically 4-7 for a medium project.
Do not add pillars that aren't warranted by the PRD.

---

## Step 3: Present Pillars for Approval

Present the proposed pillars to the user as a structured summary:

```
Infrastructure Pillars: {N} pillars identified

Pillar 0 ({Name}): {brief description} — ~{N} specs
  → Enables: {what Pillar 1 can do}
Pillar 1 ({Name}): {brief description} — ~{N} specs
  → Enables: {what Pillar 2 can do}
Pillar 2 ({Name}): {brief description} — ~{N} specs
  → Enables: {what Pillar 3 can do}
...

Dependency order: 0 → 1 → 2 → ...

Key gate criteria:
- Pillar 0: {1-2 key gate criteria}
- Pillar 1: {1-2 key gate criteria}

Approve this pillar structure? (yes / adjust: ...)
```

**HARD STOP** — Do NOT write PILLARS.md until the user explicitly approves the structure.
If the user asks to adjust pillar scope or order, update and re-present before proceeding.

---

## Step 4: Write PILLARS.md

Write `.agents/specs/PILLARS.md`:

```markdown
# Infrastructure Pillars — {Project Name}
<!-- Generated: {date} | Source: PRD.md | Pillars: {N} -->

## Pillar 0: {Name}

**Scope**: {what's in this pillar — specific, not abstract}
**Not included**: {what's explicitly out of scope for this pillar}
**Depends on**: nothing (first pillar)
**What this unlocks**: {what Pillar 1 can do because Pillar 0 exists}
**What breaks without it**: {what can't be built if Pillar 0 is missing}
**Gate criteria**:
- [ ] {measurable pass/fail criterion — not "works" but "all migrations run without errors"}
- [ ] {measurable criterion}

## Pillar 1: {Name}

**Scope**: {what's in this pillar}
**Not included**: {exclusions}
**Depends on**: Pillar 0 ({specific dependency — exactly what it needs from Pillar 0})
**What this unlocks**: {what Pillar 2 can do}
**What breaks without it**: {what can't be built}
**Gate criteria**:
- [ ] {criterion}
- [ ] {criterion}

(repeat for each pillar)
```

**Re-run behavior**: If PILLARS.md already exists:
- Read existing content
- Preserve any pillars where `.agents/specs/pillar-N-{name}.md` exists and is fully complete
- Re-analyze and overwrite only incomplete pillars (or all if re-running from scratch)
- Do NOT overwrite completed pillar sections without explicit user confirmation

---

## Step 5: Confirm and Advance

After writing PILLARS.md:

```
PILLARS.md written to: .agents/specs/PILLARS.md
Pillars identified: {N}
Total estimated specs: ~{M} (across all pillars)

Pillar overview:
  Pillar 0 ({Name}): {brief} — start here
  Pillar 1 ({Name}): {brief} — after Pillar 0 gate passes
  ...

Next: /decompose {pillar-0-name} — research and spec out the first pillar.
/decompose processes one pillar per session and outputs .agents/specs/pillar-0-{name}.md
which feeds /planning.

Run /decompose {name of Pillar 0} to continue.
```

---

## Notes

- **Pillar 0 is non-negotiable.** If someone argues it's unnecessary, the project doesn't have
  a clear foundation — that's the argument for Pillar 0, not against it.
- **Gate criteria must be concrete.** "Everything works" is not a gate criterion.
  "All database migrations run without errors and 3/3 core model unit tests pass" is.
- **Pillar count from the PRD, not intuition.** Count the distinct infrastructure concerns
  in the PRD's implementation phases and architecture section.
- **Re-runs are safe.** PILLARS.md can be regenerated at any time. Completed pillar files
  are preserved; only incomplete pillars are re-analyzed.
- **$ARGUMENTS focus mode**: If a pillar name is given, re-analyze only that pillar.
  Use this when a pillar's scope needs adjusting mid-project without touching others.
```

### Full Skill File to Write

Write `.claude/skills/pillars/SKILL.md` with this content:

```markdown
---
name: pillars
description: Knowledge framework for infrastructure pillar identification, sequencing, and gate criteria quality
license: MIT
compatibility: claude-code
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
```

---

## Step-by-Step Tasks

### Step 1: Create .claude/skills/pillars/ directory and SKILL.md

Create directory `.claude/skills/pillars/` if it doesn't exist.
Write the full SKILL.md content above to `.claude/skills/pillars/SKILL.md`.

GOTCHA: The skills directory for pillars doesn't exist yet — verify with ls before writing.

VALIDATE: `ls .claude/skills/pillars/SKILL.md` — should exist

### Step 2: Create .claude/commands/pillars.md

Write the full command file content above to `.claude/commands/pillars.md`.

GOTCHA: This file was deleted — it does not exist. Do not try to Edit a non-existent file;
use Write to create it from scratch with the full content above.

VALIDATE: `wc -l .claude/commands/pillars.md` — should be ~150+ lines

### Step 3: Create opencode mirrors

**For `.opencode/commands/pillars.md`:**
Write identical content to `.opencode/commands/pillars.md`.

**For `.opencode/skills/pillars/SKILL.md`:**
Create directory `.opencode/skills/pillars/`.
Write identical content to `.opencode/skills/pillars/SKILL.md`.

VALIDATE:
```bash
diff .claude/commands/pillars.md .opencode/commands/pillars.md && echo "COMMAND MIRROR OK"
diff .claude/skills/pillars/SKILL.md .opencode/skills/pillars/SKILL.md && echo "SKILL MIRROR OK"
```

---

## Testing Strategy

**Unit (per-file):**
- Command: Pipeline Position correct; Pillar 0 Rule section present; HARD STOP at Step 3; PILLARS.md template complete; Step 5 says "Run /decompose"
- Skill: Pillar 0 Rule section present; Gate Criteria Quality section present; Key Rules numbered correctly; Related Commands includes /decompose

**Integration:**
- All 4 files have balanced code fence markers
- SKILL.md frontmatter is valid YAML

**Edge cases:**
- Command file has nested code blocks (the PILLARS.md template). Verify they are properly fenced.

---

## Validation Commands

**L1 Syntax:**
```bash
grep -c '^\`\`\`' .claude/commands/pillars.md    # count code fences (should be even)
grep -c '^\`\`\`' .claude/skills/pillars/SKILL.md
```

**L2 Structure:**
```bash
grep -n "Pipeline Position\|Pillar 0 Rule\|HARD STOP\|Step 5" .claude/commands/pillars.md
grep -n "Pillar 0 Rule\|Gate Criteria Quality\|Key Rules\|Related Commands" .claude/skills/pillars/SKILL.md
```

**L3 Gate enforcement:**
```bash
grep -n "HARD STOP\|Do NOT write" .claude/commands/pillars.md
```

**L4 Mirror sync:**
```bash
diff .claude/commands/pillars.md .opencode/commands/pillars.md && echo "COMMAND OK"
diff .claude/skills/pillars/SKILL.md .opencode/skills/pillars/SKILL.md && echo "SKILL OK"
```

**L5 Pipeline references:**
```bash
grep -n "decompose\|/build\|/ship" .claude/commands/pillars.md
# "decompose" should appear; "/build" and "/ship" should NOT appear
```

---

## Acceptance Criteria

### Implementation

- [ ] `.claude/commands/pillars.md` exists with Pipeline Position referencing `/decompose {pillar-N}`
- [ ] `.claude/commands/pillars.md` has "Pillar 0 Rule (MANDATORY)" section in Step 2
- [ ] `.claude/commands/pillars.md` has "HARD STOP" in Step 3 approval gate
- [ ] `.claude/commands/pillars.md` has complete PILLARS.md template in Step 4
- [ ] `.claude/commands/pillars.md` Step 5 says "Run /decompose {name of Pillar 0}"
- [ ] `.claude/skills/pillars/SKILL.md` exists with frontmatter (name, description, license, compatibility)
- [ ] `.claude/skills/pillars/SKILL.md` has "Pillar 0 Rule" section
- [ ] `.claude/skills/pillars/SKILL.md` has "Gate Criteria Quality" section with good/bad examples
- [ ] `.claude/skills/pillars/SKILL.md` has "Anti-Patterns" section (6+ patterns)
- [ ] `.claude/skills/pillars/SKILL.md` has "Key Rules" section (7 numbered rules)
- [ ] `.opencode/commands/pillars.md` is identical to `.claude/commands/pillars.md`
- [ ] `.opencode/skills/pillars/SKILL.md` is identical to `.claude/skills/pillars/SKILL.md`

### Runtime

- [ ] L1: All 4 files have even code fence count
- [ ] L2: All required sections present in command and skill
- [ ] L3: HARD STOP language present in Step 3 of command
- [ ] L4: Both mirror diffs produce zero output
- [ ] L5: No `/build` or `/ship` references in command

---

## Handoff Notes

Task 4 creates `.claude/commands/decompose.md` and `.claude/skills/decompose/SKILL.md`.
The decompose command takes a pillar argument and processes ONE pillar per session.
Its pipeline position: Step 4, after /pillars. Its output: `.agents/specs/pillar-N-{name}.md`.
It should reference "PILLARS.md" (the file /pillars produces) as its primary input.

---

## Completion Checklist

- [ ] Created `.claude/skills/pillars/` directory
- [ ] Created `.claude/skills/pillars/SKILL.md` with full content
- [ ] Created `.claude/commands/pillars.md` with full content
- [ ] Created `.opencode/skills/pillars/` directory
- [ ] Created `.opencode/skills/pillars/SKILL.md` (identical copy)
- [ ] Created `.opencode/commands/pillars.md` (identical copy)
- [ ] All validation commands pass
- [ ] All acceptance criteria checked off
