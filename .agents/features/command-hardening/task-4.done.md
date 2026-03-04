# Task 4: Rebuild /decompose Command + Create Skill (One-Pillar-Per-Session)

## Objective

Create `.claude/commands/decompose.md` (redesigned as one-pillar-per-session) and
`.claude/skills/decompose/SKILL.md`, then mirror both to `.opencode/`. The command was deleted
in a prior session. The new design processes ONE pillar per run, outputs a per-pillar spec file,
and feeds `/planning` directly — no BUILD_ORDER.md, no `/build` automation.

---

## Scope

**Files created** (4 total):
- `.claude/commands/decompose.md` — command workflow (create fresh, new design)
- `.claude/skills/decompose/SKILL.md` — quality framework (create fresh)
- `.opencode/commands/decompose.md` — mirror of command
- `.opencode/skills/decompose/SKILL.md` — mirror of skill (create dir + file)

**Out of scope:**
- `.agents/specs/BUILD_ORDER.md` — the old output format; NOT produced by the new design
- `.claude/commands/pillars.md` — handled in Task 3
- Any source code files

**Depends on:** Nothing (all tasks touch different files, no code dependency)

---

## Prior Task Context

Task 3 created `.claude/commands/pillars.md`. That command produces `.agents/specs/PILLARS.md`,
which `/decompose` reads as its primary structural input.

The new pipeline is:
```
/pillars → PILLARS.md → /decompose {pillar-N} → .agents/specs/pillar-N-{name}.md → /planning
```

`/decompose` takes ONE pillar argument per session, does deep research on that pillar's scope,
and writes a spec file for that pillar. The user then runs `/planning` using the spec.

User-confirmed design constraints:
- One pillar per run (not all pillars in one session)
- No BUILD_ORDER.md, no /build, no /ship
- Deep research per pillar: RAG + PRD cross-ref + dependency analysis
- Output: `.agents/specs/pillar-N-{name}.md`
- Standard PIV loop continues: /planning → /execute → /commit → /pr

---

## Context References

### Old /decompose design (recovered from git history — for reference, NOT the new design)

The old command processed ALL pillars sequentially, wrote per-pillar files AND BUILD_ORDER.md,
and fed `/build next`. This design is REPLACED by the new one-pillar-per-session approach.

Old output files:
- `.agents/specs/pillar-N-{name}.md` — per-pillar spec (KEPT in new design)
- `.agents/specs/BUILD_ORDER.md` — flat index of all specs (NOT produced in new design)

New output:
- `.agents/specs/pillar-N-{name}.md` — per-pillar spec for the specified pillar only

### Per-pillar file format (from old decompose.md — preserved in new design)

```markdown
# Pillar {N}: {Name}
<!-- Generated: {date} | Source: PRD.md + PILLARS.md | Research: RAG + PRD cross-ref -->

## Pillar Context

- **Scope**: {from PILLARS.md}
- **Not included**: {from PILLARS.md}
- **Depends on**: {prior pillars}
- **What this unlocks**: {from PILLARS.md}
- **What breaks without it**: {from PILLARS.md}
- **Gate criteria**:
  - [ ] {criterion from PILLARS.md}

## Research Findings

### PRD Coverage
{Which PRD sections map to this pillar, and which requirements must be covered by specs}

### Dependency Analysis
{What this pillar needs from prior pillars; what later pillars need from this one}

### RAG / External Research
{Patterns, best practices, or pitfalls found during research — with source references}
{If no RAG available: "RAG not available — proceeding with PRD cross-ref + dependency analysis"}

## Spec List

- [ ] `P{N}-01` **{spec-name}** ({depth}) — {description}
  - depends: {prior spec IDs or "none"}
  - touches: {files/modules}
  - enables: {what this spec unlocks}
  - acceptance: {measurable test}

- [ ] `P{N}-02` **{spec-name}** ({depth}) — {description}
  - depends: P{N}-01
  - touches: {files/modules}
  - enables: {what this unlocks}
  - acceptance: {measurable test}

...

- [ ] `P{N}-GATE` **pillar-{N}-gate** (light) — Run gate criteria
  - depends: all specs in this pillar
  - acceptance: All gate criteria from PILLARS.md Pillar {N} pass

## PRD Coverage Map

| PRD Requirement | Covered by Spec | Notes |
|----------------|----------------|-------|
| {requirement from PRD Section 8 or 12} | P{N}-01 | {notes} |
| {requirement} | P{N}-02 | |
| {uncovered requirement} | MISSING | {action: create spec or flag for next pillar} |

Coverage: {X}/{Y} PRD requirements for this pillar covered
```

### Spec ID format

Specs use pillar-prefixed IDs: `P{N}-{NN}` (e.g., P0-01, P1-03) and `P{N}-GATE`.
This allows `/planning` to identify which pillar a spec belongs to.

### Research degradation table (from old decompose.md — preserved)

| Research Step | Available | Degraded |
|---------------|-----------|----------|
| RAG Knowledge Base | Search for domain patterns | Skip — note "RAG not available" in output |
| PRD Cross-Reference | Always available | Always runs — mandatory |
| Dependency Analysis | Always available | Always runs — mandatory |

PRD cross-reference and dependency analysis are MANDATORY even when RAG is unavailable.

### Existing SKILL.md pattern (from .claude/skills/commit/SKILL.md style)

```yaml
---
name: {command-name}
description: Knowledge framework for {description}
license: MIT
compatibility: claude-code
---
```

Sections: When This Skill Applies, [Core Methodology], Anti-Patterns, Key Rules, Related Commands.

---

## Patterns to Follow

### One-session, one-pillar pattern

Each `/decompose` run = one pillar. The user runs it once per pillar, in order:
```
/decompose data-infrastructure     → .agents/specs/pillar-0-data-infrastructure.md
/decompose core-services           → .agents/specs/pillar-1-core-services.md
/decompose integration-layer       → .agents/specs/pillar-2-integration-layer.md
```

This allows deep research per pillar without overwhelming context. Each run is focused.

### Argument parsing pattern

`$ARGUMENTS` is the pillar identifier. It can be:
- Pillar number: `0`, `1`, `2`
- Pillar name (slug): `data-infrastructure`, `core-services`
- Pillar number + name: `0-data-infrastructure`

The command reads PILLARS.md to find the matching pillar section.

### Deep research per pillar (three steps, two mandatory)

1. **RAG search** (optional — if available): Search for patterns relevant to THIS pillar's domain.
   Keep queries 2-5 keywords. Example for Pillar 0 (data): "database schema migration patterns"
2. **PRD cross-reference** (MANDATORY): For every requirement in PRD that falls in this pillar's scope,
   verify a spec covers it. Track coverage in PRD Coverage Map.
3. **Dependency analysis** (MANDATORY): Verify all spec `depends_on` targets exist in prior specs/pillars.
   Verify no circular dependencies. Verify this pillar provides what the next pillar needs.

### Gate spec pattern (terminal spec in every pillar)

Every pillar ends with a gate spec:
```
- [ ] `P{N}-GATE` **pillar-{N}-gate** (light) — Run gate criteria
  - depends: all specs in this pillar (P{N}-01, P{N}-02, ...)
  - acceptance: All gate criteria from PILLARS.md Pillar {N} pass
```

---

## Full Command File to Write

Write `.claude/commands/decompose.md` with this content:

```markdown
---
description: Deep-research one infrastructure pillar and produce a spec file for /planning
model: claude-opus-4-6
argument-hint: <pillar-name-or-number>
---

# Decompose: Research and Spec One Pillar

Deep-research a single infrastructure pillar — using PRD cross-referencing, dependency analysis,
and RAG (if available) — then produce a spec file that feeds `/planning`.

Run once per pillar, in dependency order (Pillar 0 first, then 1, then 2, etc.).

## Usage

```
/decompose <pillar-name-or-number>
```

`$ARGUMENTS` — Required: the pillar to decompose. Can be a number (`0`), a name slug
(`data-infrastructure`), or both (`0-data-infrastructure`).

Example: `/decompose 0` or `/decompose data-infrastructure` or `/decompose 0-data-infrastructure`

---

## Pipeline Position

```
/mvp → /prd → /pillars → /decompose {pillar-N} (this) → /planning → /execute → /commit → /pr
```

This is Step 4. Requires `PILLARS.md` (produced by `/pillars`). Processes ONE pillar per run.
Output: `.agents/specs/pillar-{N}-{name}.md` — feeds `/planning` for each spec in the pillar.

---

## Step 1: Read Inputs

1. Check `$ARGUMENTS`. If empty: stop and report:
   ```
   /decompose requires a pillar argument.
   Usage: /decompose <pillar-name-or-number>
   Example: /decompose 0 or /decompose data-infrastructure
   Run /pillars first to see the pillar list, then decompose each one.
   ```

2. Read `.agents/specs/PILLARS.md`.
   - If not found: stop — "No PILLARS.md found. Run `/pillars` first."
   - Find the pillar matching `$ARGUMENTS` (by number or name slug).
   - If no match: list available pillars from PILLARS.md and ask which to use.

3. Extract for the target pillar:
   - Scope (what's included)
   - Not included (boundary)
   - Depends on (prior pillars)
   - What this unlocks (for next pillar)
   - Gate criteria (what must pass before next pillar starts)

4. Look for a PRD file (`PRD.md`, `docs/PRD.md`, or `*-prd.md`).
   - If found: read sections relevant to this pillar's scope.
   - If not found: proceed with PILLARS.md only — note "PRD not available" in output.

5. Check if `.agents/specs/pillar-{N}-{name}.md` already exists.
   - If exists: present existing content and ask: "Pillar {N} was already decomposed.
     Overwrite, extend, or cancel? (overwrite / extend / cancel)"

---

## Step 2: Research the Pillar

Process these three research steps for the target pillar:

### 2a. RAG Knowledge Base (optional)

If a RAG knowledge base MCP is available:
- Search for architecture patterns relevant to this pillar's domain:
  - Example (Pillar 0, data): `rag_search_knowledge_base(query="database schema migrations")`
  - Example (Pillar 1, services): `rag_search_knowledge_base(query="service layer patterns")`
  - Example (Pillar 2, integration): `rag_search_knowledge_base(query="API integration auth")`
- Keep queries SHORT — 2-5 keywords. Longer queries degrade vector search quality.
- Read top results in full with `rag_read_full_page()` if available.
- Record findings for the Research Findings section of the output file.

If no RAG available: note "RAG not available — proceeding with PRD cross-ref + dependency analysis."

### 2b. PRD Cross-Reference (MANDATORY)

For each requirement in the PRD that falls within this pillar's scope:
- Identify which spec in the initial draft covers it.
- If a requirement has no covering spec: create one.
- Track coverage for the PRD Coverage Map table.

Cross-reference these PRD sections:
- Section 8a (Data Models) → typically Pillar 0 or 1
- Section 8b (Service Contracts) → typically Pillar 1 or 2
- Section 9 (API Spec) → typically Pillar 3
- Section 12 (Implementation Phases) → cross-reference which phase this pillar corresponds to

PRD requirements with no covering spec are GAPS — add a spec or flag for next pillar.

### 2c. Dependency Analysis (MANDATORY)

For each proposed spec in this pillar:
- Verify all `depends_on` targets exist in prior specs (within this pillar) or prior pillars.
- Verify no circular dependencies (spec A depends on spec B which depends on spec A).
- Verify spec order: dependencies must appear earlier in the list.

Cross-pillar check:
- Read the prior pillar's spec file (if it exists) to verify dependencies are met.
- Verify this pillar's output (what it provides) covers what the NEXT pillar needs.

---

## Step 3: Draft Spec List and Present for Approval

Based on research findings, draft the spec list for this pillar. Present to the user:

```
Pillar {N}: {Name}

Research summary:
  RAG: {hits found / not available}
  PRD coverage: {X}/{Y} requirements covered
  Dependency issues: {count or "none"}

Proposed specs:
  P{N}-01 {name} ({depth}) — {description}
  P{N}-02 {name} ({depth}) — {description}
  ...
  P{N}-GATE — gate criteria check (depends on all above)

PRD gaps found: {list or "none found"}
Dependency issues: {list or "none found"}

Approve this spec list? (yes / adjust: ...)
```

**HARD STOP** — Do NOT write the pillar file until the user approves the spec list.
If the user requests adjustments, update and re-present before writing.

Spec depth tags: `light` (simple file, single concern), `standard` (moderate complexity),
`heavy` (complex logic, multiple integrations, or significant design decisions).

---

## Step 4: Write Pillar Spec File

Write `.agents/specs/pillar-{N}-{name}.md`:

```markdown
# Pillar {N}: {Name}
<!-- Generated: {date} | Source: PRD.md + PILLARS.md | Research: {RAG / PRD cross-ref / deps} -->

## Pillar Context

- **Scope**: {from PILLARS.md — what's in this pillar}
- **Not included**: {from PILLARS.md — explicit boundaries}
- **Depends on**: {prior pillars or "none (first pillar)"}
- **What this unlocks**: {from PILLARS.md — what next pillar can do}
- **What breaks without it**: {from PILLARS.md — downstream impact}
- **Gate criteria**:
  - [ ] {criterion from PILLARS.md — measurable}
  - [ ] {criterion}

## Research Findings

### RAG / External Research
{Patterns or best practices found — with source references. If RAG unavailable: "Not available."}

### PRD Coverage
{Which PRD sections map to this pillar; which requirements drive the spec list}

### Dependency Analysis
{What prior pillars provide; what this pillar provides to next pillars; any issues found}

## Spec List

- [ ] `P{N}-01` **{spec-name}** ({depth}) — {description}
  - depends: none (first spec in pillar)
  - touches: {files or modules this spec creates/modifies}
  - enables: {what this spec unlocks for later specs}
  - acceptance: {measurable test — how to verify this spec is done}

- [ ] `P{N}-02` **{spec-name}** ({depth}) — {description}
  - depends: P{N}-01
  - touches: {files}
  - enables: {what this unlocks}
  - acceptance: {measurable test}

(continue for each spec)

- [ ] `P{N}-GATE` **pillar-{N}-gate** (light) — Run pillar gate criteria
  - depends: {list all spec IDs in this pillar, comma-separated}
  - acceptance: All gate criteria from PILLARS.md Pillar {N} pass

## PRD Coverage Map

| PRD Requirement | Spec | Notes |
|----------------|------|-------|
| {requirement from PRD} | P{N}-01 | |
| {requirement} | P{N}-02 | |
| {requirement with no spec} | MISSING | {action taken or flagged} |

Coverage: {X}/{Y} PRD requirements for this pillar
```

Create `.agents/specs/` directory if it doesn't exist.

---

## Step 5: Confirm and Advance

After writing the pillar file:

```
.agents/specs/pillar-{N}-{name}.md written.
Specs: {count} + gate | PRD coverage: {X}/{Y} | Depth: {L}L + {S}S + {H}H

Spec order for /planning:
  /planning P{N}-01    → {spec name}
  /planning P{N}-02    → {spec name}
  ...
  /planning P{N}-GATE  → gate criteria check

Next steps:
  This pillar: run /planning P{N}-01 to start implementation.
  After this pillar: run /decompose {next-pillar-name} to spec out Pillar {N+1}.
  (Run pillar gate before moving to next pillar)
```

---

## Notes

- **One pillar per session.** Deep research is more effective when scoped to one concern.
  Running all pillars in one session produces shallow research and spec lists.
- **PRD cross-reference is non-negotiable.** Every requirement in the PRD that belongs to
  this pillar must map to a spec. Uncovered requirements become missed features.
- **Dependency analysis prevents rework.** A spec that depends on something not yet built
  produces blocked implementation. Catch this before writing the spec file.
- **Gate spec is mandatory.** Every pillar ends with a gate spec. Without it, there is no
  clear signal that the pillar is done and the next one can start.
- **Re-decompose safely.** If a pillar file exists, the command asks before overwriting.
  Existing specs can be extended (add new specs) without losing previous work.
- **RAG is optional but valuable.** The two mandatory steps (PRD cross-ref + dependency analysis)
  ensure minimum quality without RAG. RAG adds domain-specific patterns and pitfalls.
```

---

## Full Skill File to Write

Write `.claude/skills/decompose/SKILL.md` with this content:

```markdown
---
name: decompose
description: Knowledge framework for one-pillar-per-session research, spec atomicity, and dependency analysis discipline
license: MIT
compatibility: claude-code
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
```

---

## Step-by-Step Tasks

### Step 1: Create .claude/skills/decompose/ directory and SKILL.md

Create directory `.claude/skills/decompose/` if it doesn't exist.
Write the full SKILL.md content above to `.claude/skills/decompose/SKILL.md`.

GOTCHA: This directory does not exist — must create it before writing the file.

VALIDATE: `ls .claude/skills/decompose/SKILL.md` — should exist

### Step 2: Create .claude/commands/decompose.md

Write the full command file content above to `.claude/commands/decompose.md`.

GOTCHA: This file was deleted — do NOT try to Edit a non-existent file.
Use Write to create it from scratch with the full content specified above.

VALIDATE: `wc -l .claude/commands/decompose.md` — should be ~200+ lines

### Step 3: Create opencode mirrors

**For `.opencode/commands/decompose.md`:**
Write identical content to `.opencode/commands/decompose.md`.

**For `.opencode/skills/decompose/SKILL.md`:**
Create directory `.opencode/skills/decompose/`.
Write identical content to `.opencode/skills/decompose/SKILL.md`.

VALIDATE:
```bash
diff .claude/commands/decompose.md .opencode/commands/decompose.md && echo "COMMAND MIRROR OK"
diff .claude/skills/decompose/SKILL.md .opencode/skills/decompose/SKILL.md && echo "SKILL MIRROR OK"
```

---

## Testing Strategy

**Unit (per-file):**
- Command: Pipeline Position correct; $ARGUMENTS required; Step 2 has PRD cross-ref and dependency analysis as MANDATORY; HARD STOP at Step 3; Step 5 shows both /planning and /decompose next steps
- Skill: One-Pillar-Per-Session section present; PRD Cross-Reference Discipline present; Dependency Analysis section present; Key Rules has 8 rules; Related Commands includes /planning

**Integration:**
- All 4 files have balanced code fence markers
- SKILL.md frontmatter is valid YAML

**Edge cases:**
- The command file contains the full pillar spec file template (with nested code fences).
  Verify all code fences are properly balanced.
- Verify no references to BUILD_ORDER.md, /build, or /ship in the new command.

---

## Validation Commands

**L1 Syntax:**
```bash
grep -c '^\`\`\`' .claude/commands/decompose.md     # even count
grep -c '^\`\`\`' .claude/skills/decompose/SKILL.md  # even count
```

**L2 Structure:**
```bash
grep -n "Pipeline Position\|Step 1\|Step 2\|Step 3\|Step 4\|Step 5\|HARD STOP" .claude/commands/decompose.md
grep -n "One-Pillar\|PRD Cross-Reference\|Dependency Analysis\|Key Rules\|Related Commands" .claude/skills/decompose/SKILL.md
```

**L3 Gate enforcement:**
```bash
grep -n "HARD STOP\|Do NOT write" .claude/commands/decompose.md
grep -n "MANDATORY" .claude/commands/decompose.md    # PRD cross-ref and dependency analysis
```

**L4 Mirror sync:**
```bash
diff .claude/commands/decompose.md .opencode/commands/decompose.md && echo "COMMAND OK"
diff .claude/skills/decompose/SKILL.md .opencode/skills/decompose/SKILL.md && echo "SKILL OK"
```

**L5 Old pipeline references — must be absent:**
```bash
grep -n "BUILD_ORDER\|/build\|/ship\|/sync" .claude/commands/decompose.md || echo "CLEAN — no old refs"
```

---

## Acceptance Criteria

### Implementation

- [ ] `.claude/commands/decompose.md` exists with one-pillar-per-session design
- [ ] `.claude/commands/decompose.md` has `$ARGUMENTS` required (not optional) with error message if missing
- [ ] `.claude/commands/decompose.md` Pipeline Position shows `/decompose {pillar-N}` feeding `/planning`
- [ ] `.claude/commands/decompose.md` Step 2 marks PRD cross-reference and dependency analysis as MANDATORY
- [ ] `.claude/commands/decompose.md` Step 3 has "HARD STOP" before writing the file
- [ ] `.claude/commands/decompose.md` Step 5 shows both "run /planning P{N}-01" and "run /decompose {next-pillar}"
- [ ] `.claude/commands/decompose.md` has NO references to BUILD_ORDER.md, /build, or /ship
- [ ] `.claude/commands/decompose.md` has per-pillar spec file template in Step 4
- [ ] `.claude/skills/decompose/SKILL.md` exists with correct frontmatter
- [ ] `.claude/skills/decompose/SKILL.md` has "One-Pillar-Per-Session Discipline" section
- [ ] `.claude/skills/decompose/SKILL.md` has "PRD Cross-Reference Discipline" section
- [ ] `.claude/skills/decompose/SKILL.md` has "Dependency Analysis Discipline" section
- [ ] `.claude/skills/decompose/SKILL.md` has "Anti-Patterns" section (6+ patterns)
- [ ] `.claude/skills/decompose/SKILL.md` has "Key Rules" with 8 numbered rules
- [ ] `.opencode/commands/decompose.md` is identical to `.claude/commands/decompose.md`
- [ ] `.opencode/skills/decompose/SKILL.md` is identical to `.claude/skills/decompose/SKILL.md`

### Runtime

- [ ] L1: All 4 files have even code fence count
- [ ] L2: All required sections present in command and skill
- [ ] L3: "HARD STOP" present in Step 3; "MANDATORY" present for PRD cross-ref and dependency analysis
- [ ] L4: Both mirror diffs produce zero output
- [ ] L5: `grep "BUILD_ORDER\|/build\|/ship" .claude/commands/decompose.md` returns empty (no old refs)

---

## Handoff Notes

This is the last task (Task 4 of 4). After completion, all 8 files exist:
- `.claude/commands/{mvp,prd,pillars,decompose}.md`
- `.claude/skills/{mvp,prd,pillars,decompose}/SKILL.md`
- `.opencode` mirrors of all 8

Next: run full validation suite, then `/commit` for the command-hardening feature.

The executor should update `.agents/context/next-command.md` after completion:
```markdown
- Last Command: /execute (task-4.md)
- Feature: command-hardening
- Next Command: /commit
- Task Progress: 4/4 complete
- Status: awaiting-commit
```

---

## Completion Checklist

- [ ] Created `.claude/skills/decompose/` directory
- [ ] Created `.claude/skills/decompose/SKILL.md` with full content
- [ ] Created `.claude/commands/decompose.md` with full content (new one-pillar design)
- [ ] Created `.opencode/skills/decompose/` directory
- [ ] Created `.opencode/skills/decompose/SKILL.md` (identical copy)
- [ ] Created `.opencode/commands/decompose.md` (identical copy)
- [ ] Verified no BUILD_ORDER.md, /build, /ship references in command
- [ ] All validation commands pass
- [ ] All acceptance criteria checked off
- [ ] Updated `.agents/context/next-command.md` to awaiting-commit
