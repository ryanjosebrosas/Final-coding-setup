# command-hardening — Plan

## Feature Description

Harden the four top-of-pipeline commands (`/mvp`, `/prd`, `/pillars`, `/decompose`) so each one
has a command file + matching SKILL.md knowledge framework, mirrored to the opencode tool.
`/pillars` and `/decompose` were deleted in a prior cleanup and must be fully recreated.
`/decompose` is redesigned: instead of processing all pillars in one session and writing
BUILD_ORDER.md, it now processes ONE pillar per session with deep research, outputting
`.agents/specs/pillar-N.md` which feeds `/planning`. This aligns with the standard PIV loop
(no `/build` automation).

## User Story

As a developer using this AI coding system, I want each top-of-pipeline command to have
both a workflow script (command file) and a quality framework (SKILL.md), so that any
session running `/mvp`, `/prd`, `/pillars`, or `/decompose` is guided by explicit methodology
rather than implicit knowledge.

## Problem Statement

1. `/mvp` and `/prd` command files exist but lack alignment between the command workflow
   and their SKILL.md quality standards — minor gaps in hardening language, gate enforcement,
   and opencode mirroring.
2. `/pillars` command was deleted — no command file or SKILL.md exists anywhere.
3. `/decompose` command was deleted — the original processed all pillars at once and fed
   `/build`. The new design must process one pillar per session and feed `/planning`.

## Solution Statement

Produce four hardened command + skill pairs, each covering:
- `.claude/commands/{cmd}.md` — the step-by-step workflow (create or update)
- `.claude/skills/{cmd}/SKILL.md` — the quality framework (create or update)
- `.opencode/commands/{cmd}.md` — exact mirror of the claude command
- `.opencode/skills/{cmd}/SKILL.md` — exact mirror of the skill

MVP and PRD: targeted hardening of command file + SKILL.md (both already exist, minor gaps).
Pillars: full recreation of command file + skill from the deleted version (recovered from git history).
Decompose: full recreation of command file + skill with one-pillar-per-session design.

---

## Feature Metadata

- **Feature Slug**: `command-hardening`
- **Pipeline Position**: `/mvp` → `/prd` → `/pillars` → `/decompose` → `/planning` → `/execute` → `/commit` → `/pr`
- **Task Count**: 4
- **Execution Model**: Sonnet inline (no Codex CLI in this environment)
- **Confidence**: 8/10

### Slice Guardrails

- Scope IN: `.claude/commands/{mvp,prd,pillars,decompose}.md`, `.claude/skills/{mvp,prd,pillars,decompose}/SKILL.md`, `.opencode` mirrors
- Scope OUT: All other commands (`/planning`, `/execute`, `/commit`, etc.), `.codex/skills/`, `.codex/agents/`, any source code files
- If any brief tries to touch a command not in the list above → STOP and flag divergence

---

## Pillar Context

N/A — this is a meta-feature improving the pipeline commands themselves, not a product feature.
The pipeline this improves is: `/mvp` → `/prd` → `/pillars` → `/decompose` → `/planning` → `/execute` → `/commit` → `/pr`

---

## Context References

### .claude/commands/mvp.md (200 lines — exists, needs hardening)

Current content (key sections):
```
Step 1: Check Existing MVP — reads mvp.md, presents summary, asks if still direction
Step 2: Big Idea Discovery — Phase A (extract), Phase B (tech direction), Phase C (scope gate)
Step 3: Write mvp.md — template with Big Idea, Users, Capabilities, Tech, Out of Scope, Done When
Step 4: Confirm and Advance — show written file, point to /prd

Hardening gaps identified:
- Phase C gate language: "Does this capture it?" is weak — needs "Confirm? [yes/adjust]" with explicit block
- Step 4 output: doesn't confirm the file was actually written before showing next steps
- Revision mode: present in Notes but not as a formal step — could be tightened
- mvp.md template: "Out of Scope (MVP)" section is optional-feeling; should be mandatory
```

### .claude/skills/mvp/SKILL.md (113 lines — exists, needs minor hardening)

Current content (key sections):
```
Discovery Quality Standards, Scope Gate Quality, mvp.md Quality Standards,
Anti-Patterns (question flooding, tech-first, vague challenges, skipping Phase C, treating mvp as spec),
Revision Mode, Key Rules, Related Commands

Hardening gaps:
- Key Rules: all 6 rules listed but no enforcement callouts for anti-patterns
- Revision Mode: says "update only affected sections" but doesn't say what to check before updating
- Missing: explicit callout that Phase C is a HARD STOP (not optional)
```

### .claude/commands/prd.md (405 lines — exists, needs hardening)

Current content (key sections):
```
Step 0: Spec Lock (gate 1) — 7 fields, explicit confirmation required
Step 0.5: PRD Direction Preview (gate 2) — 6-field preview, explicit approval required
Sections 1-15: Full PRD structure with field-level detail
Instructions: Extract, Synthesize, Section Depth, Quality Checks
Output Confirmation: post-write summary + next steps

Hardening gaps:
- Step 0 Spec Lock: doesn't explicitly say "DO NOT write PRD until confirmed" — only implied
- Instructions Step 3 (Section Depth): mentions "lightweight" but the default is unclear
- Quality Checks: checklist exists but no instruction to run it before writing
- Output Confirmation: next step says "/planning {feature}" but should say "/pillars" (new pipeline)
```

### .claude/skills/prd/SKILL.md (144 lines — exists, needs minor hardening)

Current content (key sections):
```
The Two Gates (non-negotiable), Section Depth Standards (7, 8, 12), Depth by PRD Type,
Assumption Labeling, Anti-Patterns, Key Rules, Related Commands

Hardening gaps:
- Two Gates section: explains why but doesn't list what to do if user refuses to confirm (answer: stop, ask again)
- Section 8 depth: good examples but missing the "what breaks downstream" consequence
- Key Rules: rule 7 says "for existing codebases: scan the repo first" — but missing from command file
- Related Commands: still says "/planning {feature}" — should mention /pillars
```

### .claude/commands/pillars.md (DELETED — partial content recovered from git history)

Recovered structure:
```
Step 1: Read Inputs (look for PRD.md, read mvp.md, scan codebase for existing infrastructure)
Step 2: Propose Pillar Structure (Pillar 0 Rule mandatory, sequential pillar table, count from PRD)
Step 3: Present Pillars for Approval (structured summary, dependency order, key gate criteria)
Step 4: Write PILLARS.md (per-pillar sections: scope, not-included, enables, breaks-without, gate criteria, gate checks)
Step 5: Confirm and Advance (what next step is)

Old pipeline: → /decompose (build order)
New pipeline: → /decompose (one pillar at a time)

Needs recreation with correct next-step language pointing to /decompose one-pillar-per-session
```

### .claude/commands/decompose.md (DELETED — full content recovered from git history)

Old design:
```
- Processed ALL pillars sequentially in one session
- Ran RAG + council + PRD cross-ref for each pillar
- Wrote per-pillar files .agents/specs/pillar-N.md AND BUILD_ORDER.md
- Led to /build next → /ship
```

New design (user-approved):
```
- Processes ONE pillar per run/session
- Takes $ARGUMENTS: pillar number (or name) to decompose
- Reads PILLARS.md for that pillar's scope + gate criteria
- Reads PRD for that pillar's relevant sections
- Does deep research: RAG search + PRD cross-ref + dependency analysis
- Outputs .agents/specs/pillar-N-{name}.md with spec list for that pillar
- Tells user to run /planning using that spec
- No BUILD_ORDER.md, no /build automation
```

### Existing skill pattern (e.g., .claude/skills/commit/SKILL.md)

Frontmatter format:
```yaml
---
name: {command-name}
description: Knowledge framework for {description}
license: MIT
compatibility: claude-code
---
```

Skills have sections: When This Skill Applies, [Core Methodology], Anti-Patterns, Key Rules, Related Commands.

### opencode mirroring pattern

`.opencode/commands/` files are byte-for-byte identical to `.claude/commands/` files.
`.opencode/skills/` directories mirror `.claude/skills/` directories.
Only the frontmatter `compatibility: claude-code` would change to `compatibility: opencode`
(but currently `.opencode/skills/planning-methodology` uses same format — confirm per task).

---

## Patterns to Follow

### Pattern 1: Command file gate enforcement (from prd.md:42-58)

```markdown
## Step 0: Spec Lock (before drafting)

Read `mvp.md` first. Then lock these items — restate what you found and ask for explicit confirmation before writing anything:

```
Spec Lock:
- Product: {name from mvp.md}
...
Confirm? (yes / adjust: ...)
```

Do NOT write the PRD until the user confirms.
```

**Apply this pattern**: every gate in every command should have an explicit "Do NOT proceed until user confirms." line immediately after the confirmation prompt.

### Pattern 2: SKILL.md Key Rules (from skills/mvp/SKILL.md:99-106)

```markdown
## Key Rules

1. **One question at a time** — The Socratic method requires listening between questions
2. **Push back on scope** — An MVP that takes 6 months is not an MVP
3. **Tech direction is captured, not invented** — What the user says is what goes in
4. **Phase C confirmation is non-negotiable** — Never write without explicit approval
5. **Out of Scope is as important as In Scope** — Unnamed deferrals become scope creep
6. **Discovery conversation is the real work** — 10 minutes here saves days downstream
```

**Apply this pattern**: Key Rules are numbered, bold-titled, plain-sentence explanation. 5-8 rules max. Rules state the constraint and its reason.

### Pattern 3: Anti-Patterns section (from skills/prd/SKILL.md:109-127)

```markdown
## Anti-Patterns

**Decorative PRD** — Has all 15 sections but makes no binding decisions.
Detection: If someone could write a completely different system from this PRD, it is decorative.

**Generic architecture** — "REST API + database" without specifying which database...
```

**Apply this pattern**: Each anti-pattern has a bold title, explanation, and when possible a Detection line or a Good vs Bad example.

### Pattern 4: Command file pipeline position block (from commands/mvp.md:22-26)

```markdown
## Pipeline Position

```
/mvp (big idea) → /prd (full spec) → /planning (feature plan) → /execute → /code-review → /commit → /pr
```

This is Step N. Reads {input}. Output feeds {next step}.
```

**Apply this pattern**: every command starts with pipeline position showing updated pipeline (no /build, no /ship).

### Pattern 5: Pillar output format (from deleted decompose.md, recovered)

```markdown
# Pillar {N}: {Name}
<!-- Generated: {date} | Source: PRD.md + PILLARS.md | Research: RAG + PRD cross-ref -->

## Pillar Context
- **Scope**: {from PILLARS.md}
- **Gate criteria**: {list}

## Spec List
- [ ] `P{N}-01` **{name}** ({depth}) — {description}
  - depends: {prior specs}
  - acceptance: {test}
```

---

## Implementation Plan

### Phase 1: Harden MVP + PRD (Tasks 1-2)

Targeted hardening of existing commands and skills. Both command files and both SKILL.md files
exist — apply gap analysis from Context References above. Write opencode mirrors.

### Phase 2: Rebuild Pillars + Decompose (Tasks 3-4)

Full recreation of deleted commands. Task 3 (pillars) recreates the command and creates SKILL.md.
Task 4 (decompose) redesigns the command for one-pillar-per-session and creates SKILL.md.

---

## Step-by-Step Tasks

### Task 1: Harden /mvp command + skill

ACTION: UPDATE
TARGET: `.claude/commands/mvp.md`, `.claude/skills/mvp/SKILL.md`, `.opencode` mirrors
IMPLEMENT:
- Tighten Phase C gate: add explicit "Do NOT write mvp.md until the user confirms" line
- Make Out of Scope section mandatory (not optional-feeling) in Step 3 template
- Add "File written to mvp.md" confirmation in Step 4 before showing next steps
- SKILL.md: add Phase C HARD STOP callout, add "check existing content before updating sections" to Revision Mode
- Sync opencode mirrors (identical content to .claude versions)
VALIDATE: Both command files and skill files exist in both .claude and .opencode; content diff shows hardening applied

### Task 2: Harden /prd command + skill

ACTION: UPDATE
TARGET: `.claude/commands/prd.md`, `.claude/skills/prd/SKILL.md`, `.opencode` mirrors
IMPLEMENT:
- Step 0: add explicit "Do NOT write the PRD until the user confirms" line (currently only "Do NOT write" present in Step 0.5 but not Step 0)
- Step 0: add clarity about what "confirm" means (yes/adjust, not just silence)
- Instructions Step 3: default is "Full PRD" unless user requests lightweight
- Output Confirmation: update next step to say "/pillars" (pipeline updated)
- SKILL.md: update Related Commands to mention /pillars; add "what to do if user refuses gate" note
VALIDATE: Both command files and skill files updated and mirrored to opencode

### Task 3: Rebuild /pillars command + create skill

ACTION: CREATE
TARGET: `.claude/commands/pillars.md`, `.claude/skills/pillars/SKILL.md`, `.opencode` mirrors
IMPLEMENT:
- Recreate command from recovered git history content, updating:
  - Pipeline position: points to /decompose (one pillar at a time) not /build
  - Step 5 "Confirm and Advance": says "Run /decompose {pillar-N} for the first pillar"
  - PILLARS.md output format: same as original (per-pillar sections with gate criteria)
- Create SKILL.md with: pillar identification quality, Pillar 0 rule, gate criteria quality, anti-patterns
VALIDATE: Files created, content is complete, opencode mirrors present

### Task 4: Rebuild /decompose command + create skill (one-pillar-per-session)

ACTION: CREATE
TARGET: `.claude/commands/decompose.md`, `.claude/skills/decompose/SKILL.md`, `.opencode` mirrors
IMPLEMENT:
- New design: takes $ARGUMENTS = pillar number/name to decompose
- Step 1: read PILLARS.md + PRD for the specified pillar's scope
- Step 2: deep research for that pillar (RAG + PRD cross-ref + dependency analysis)
- Step 3: draft spec list for the pillar, present for approval
- Step 4: write `.agents/specs/pillar-N-{name}.md`
- Step 5: confirm and advance → "Run /planning pillar-N for the first spec"
- No BUILD_ORDER.md, no /build, no /ship references
- Create SKILL.md with: pillar research quality, spec atomicity standards, dependency analysis discipline
VALIDATE: Files created, new design correctly scopes to one pillar, opencode mirrors present

---

## Testing Strategy

These are markdown documents (no code). Validation is structural:

**L1 (Syntax)**: Files are valid markdown — no broken code blocks, no unclosed sections
**L2 (Structure)**: Required sections present in each file (see Acceptance Criteria)
**L3 (Content)**: Gate enforcement language present ("Do NOT proceed until user confirms")
**L4 (Mirror sync)**: `.opencode` mirrors are identical to `.claude` versions
**L5 (Pipeline)**: Pipeline position blocks in all commands reference the correct new pipeline
   (no `/build`, no `/ship`, no old BUILD_ORDER.md references)

---

## Validation Commands

**L1 Syntax** — verify markdown files are well-formed:
```bash
# Check for unclosed code fences (odd number of ``` markers)
grep -c '```' .claude/commands/mvp.md
grep -c '```' .claude/commands/prd.md
grep -c '```' .claude/commands/pillars.md
grep -c '```' .claude/commands/decompose.md
```

**L2 Structure** — verify required sections exist:
```bash
# Check Pipeline Position present in all commands
grep -l "Pipeline Position" .claude/commands/mvp.md .claude/commands/prd.md .claude/commands/pillars.md .claude/commands/decompose.md

# Check Key Rules present in all skills
grep -l "Key Rules" .claude/skills/mvp/SKILL.md .claude/skills/prd/SKILL.md .claude/skills/pillars/SKILL.md .claude/skills/decompose/SKILL.md
```

**L3 Gate enforcement** — verify hard gate language:
```bash
grep -n "Do NOT" .claude/commands/mvp.md .claude/commands/prd.md .claude/commands/pillars.md .claude/commands/decompose.md
```

**L4 Mirror sync** — verify opencode mirrors match:
```bash
diff .claude/commands/mvp.md .opencode/commands/mvp.md
diff .claude/commands/prd.md .opencode/commands/prd.md
diff .claude/commands/pillars.md .opencode/commands/pillars.md
diff .claude/commands/decompose.md .opencode/commands/decompose.md
```

**L5 Pipeline references** — verify no old pipeline commands:
```bash
grep -rn "/build\|/ship\|/sync\|BUILD_ORDER" .claude/commands/pillars.md .claude/commands/decompose.md || echo "CLEAN"
```

---

## Acceptance Criteria

### Implementation

- [ ] `.claude/commands/mvp.md` — Phase C gate has explicit "Do NOT write until confirmed" line; Out of Scope is mandatory; Step 4 confirms file written
- [ ] `.claude/skills/mvp/SKILL.md` — Phase C HARD STOP callout present; Revision Mode includes pre-update check guidance
- [ ] `.claude/commands/prd.md` — Step 0 has explicit confirmation block; default depth is Full PRD; Output Confirmation next step is "/pillars"
- [ ] `.claude/skills/prd/SKILL.md` — Related Commands mentions /pillars; gate refusal guidance added
- [ ] `.claude/commands/pillars.md` — Full recreation; pipeline correct (no /build); Step 5 says "/decompose {pillar-N}"
- [ ] `.claude/skills/pillars/SKILL.md` — Created with Pillar 0 rule, gate criteria quality, anti-patterns, key rules
- [ ] `.claude/commands/decompose.md` — One-pillar-per-session design; takes pillar argument; outputs pillar-N.md; no BUILD_ORDER or /build references
- [ ] `.claude/skills/decompose/SKILL.md` — Created with one-pillar research quality, spec atomicity standards, dependency analysis discipline
- [ ] All 8 files mirrored to `.opencode/` (commands + skills directories)

### Runtime

- [ ] L1: All command and skill files have even number of code fence markers (no unclosed blocks)
- [ ] L2: All command files have "Pipeline Position" section; all skill files have "Key Rules" section
- [ ] L3: All command files have at least one "Do NOT proceed until" gate enforcement line
- [ ] L4: All `.opencode` mirrors produce zero diff against `.claude` originals
- [ ] L5: No references to `/build`, `/ship`, `/sync`, or `BUILD_ORDER` in new pillars or decompose files

---

## Completion Checklist

- [ ] Task 1 complete: mvp command + skill hardened, opencode mirrors updated
- [ ] Task 2 complete: prd command + skill hardened, opencode mirrors updated
- [ ] Task 3 complete: pillars command + skill created, opencode mirrors created
- [ ] Task 4 complete: decompose command + skill created (new design), opencode mirrors created
- [ ] All validation commands pass
- [ ] All acceptance criteria met
- [ ] `.agents/context/next-command.md` updated

---

## Notes

**Key decisions:**
- `/decompose` is redesigned from "process all pillars once" to "process one pillar per session"
- The new pipeline is: /mvp → /prd → /pillars → /decompose → /planning → /execute → /commit → /pr
- `/build`, `/ship`, and `BUILD_ORDER.md` are out of scope — user confirmed standard PIV loop
- Opencode mirrors use identical content to .claude versions (no format difference observed)

**Key risk:**
- Pillars and decompose commands are being created fresh from git history recovery — content may
  not perfectly match original intent. The one-pillar redesign is confirmed by user but the exact
  command structure is being designed here. Task 3 and 4 executor must read this plan carefully.

**Confidence**: 8/10 — Tasks 1-2 are straightforward targeted edits. Tasks 3-4 require creating
complete new command files and skill files from scratch with a new design. The design is clear but
the output will be longer than tasks 1-2.

---

## TASK INDEX

| Task | Brief Path | Scope | Status | Files |
|------|-----------|-------|--------|-------|
| 1 | `task-1.md` | Harden /mvp command + skill + opencode mirrors | pending | 0 created, 4 modified |
| 2 | `task-2.md` | Harden /prd command + skill + opencode mirrors | pending | 0 created, 4 modified |
| 3 | `task-3.md` | Rebuild /pillars command + create skill + opencode mirrors | pending | 4 created, 0 modified |
| 4 | `task-4.md` | Rebuild /decompose (one-pillar-per-session) + create skill + opencode mirrors | pending | 4 created, 0 modified |
