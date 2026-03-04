# Task 2: Harden /prd Command + Skill

## Objective

Harden `.claude/commands/prd.md` and `.claude/skills/prd/SKILL.md` to enforce gate language
explicitly, set the correct default PRD depth, and update next-step references to point to
`/pillars` — then sync both files to `.opencode/` mirrors.

---

## Scope

**Files modified** (4 total):
- `.claude/commands/prd.md` — command workflow (405 lines, exists)
- `.claude/skills/prd/SKILL.md` — quality framework (144 lines, exists)
- `.opencode/commands/prd.md` — mirror of command (sync after edit)
- `.opencode/skills/prd/SKILL.md` — mirror of skill (create dir + file if needed)

**Out of scope:**
- `.claude/commands/mvp.md` — handled in Task 1
- `.claude/commands/pillars.md` — handled in Task 3
- Any other files

**Depends on:** Nothing (parallel with Task 1, different files)

---

## Prior Task Context

Task 1 hardened `.claude/commands/mvp.md` and `.claude/skills/mvp/SKILL.md`:
- Added HARD STOP language to Phase C gate
- Made Out of Scope section mandatory
- Added file-written confirmation to Step 4
- Created `.opencode/skills/mvp/` directory and mirrored files

This task follows the same hardening pattern: enforce gate language explicitly, ensure defaults
are stated clearly, update pipeline references. Different files, no code dependency on Task 1.

---

## Context References

### Current content of .claude/commands/prd.md (full file — 405 lines)

Note: The full file is 405 lines. Key sections pasted for editing context:

**Frontmatter and header:**
```markdown
---
description: Create a full Product Requirements Document with architecture, tech specs, and backend design
model: claude-opus-4-6
argument-hint: [output-filename]
---

# PRD: Product Requirements Document

The detailed build blueprint. Takes the vision from `/mvp` and expands it into a complete product specification: product requirements, system architecture, tech stack, backend design, API contracts, data models, and implementation phases.

## Usage

```
/prd [output-filename]
```

`$ARGUMENTS` — Optional: output filename. Default: `PRD.md`.
```

**Pipeline Position (current — needs updating):**
```markdown
## Pipeline Position

```
/mvp (big idea) → /prd (full spec) → /planning {feature} → /execute → /code-review → /commit → /pr
```

This is Step 2. Reads `mvp.md` as primary input. Output feeds `/planning` for each feature.
```

**Step 0: Spec Lock (has gate but enforcement is implicit):**
```markdown
## Step 0: Spec Lock (before drafting)

Read `mvp.md` first. Then lock these items — restate what you found and ask for explicit confirmation before writing anything:

```
Spec Lock:
- Product: {name from mvp.md}
- Big Idea: {one sentence}
- Tech Direction: {from mvp.md Tech Direction section}
- Implementation Mode: {docs-only | code implementation | both}
- Target Path: {PRD.md or custom path}
- Maturity Target: {alpha | MVP | production}
- PRD Depth: {lightweight (skip optional sections) | full (all sections)}

Confirm? (yes / adjust: ...)
```

Do NOT write the PRD until the user confirms.
```

(Note: "Do NOT write the PRD until the user confirms." IS present in Step 0 — it just needs
to be made more prominent and actionable.)

**Step 0.5: Direction Preview (explicit approval required — good):**
```markdown
## Step 0.5: PRD Direction Preview

Generate a concise preview before writing the full file:

```
PRD Direction:

Problem framing: {1 sentence on the problem this solves}
Scope in:        {3-5 bullet points of what's included}
Scope out:       {2-3 explicit exclusions}
Architecture:    {1-sentence approach: "REST API + PostgreSQL + React" or similar}
Key assumptions: {list any assumptions made due to missing info}
Tech stack:      {from mvp.md + any inferences}

Approve this direction before I write the full PRD? (yes / adjust: ...)
```

Only write the PRD after explicit approval.
```

**Instructions — Section Depth (current — default is unclear):**
```markdown
### 3. Section Depth

- Full PRD: all sections, full detail
- Lightweight PRD: Sections 1-6, 11-12 only — skip detailed API spec, backend design depth, appendix
- For agent/tool projects: emphasize Section 8 (backend design) and tool contracts
- For user-facing apps: emphasize Section 5 (user stories) and Section 9 (API spec)
```

**Output Confirmation (next step references /planning — needs to say /pillars):**
```markdown
## Output Confirmation

After writing the PRD:
1. Confirm file path
2. Summary: sections written, key architecture decision, tech stack chosen
3. List any assumptions made
4. Next step:

```
PRD written to {path}.

Key decisions:
- Stack: {language + framework + DB}
- Architecture: {pattern}
- Phases: {N phases, Phase 1 = {name}}

Next: /planning {feature} — create an implementation plan for each capability.
Run /planning {first-capability} to continue.
```
```

**Notes section (current):**
```markdown
## Notes

- Never skip the Spec Lock and Direction Preview gates
- The backend design section (Section 8) is what makes a PRD useful for planning — vague service descriptions produce vague plans
- Tech stack in Section 7 must be concrete: specific languages, frameworks, and versions — not "modern web stack"
- Implementation phases in Section 12 become the input for individual `/planning` sessions — one phase or capability per session
- For existing codebases: scan the repo first, extract actual patterns and stack from the code rather than inventing
```

### Current content of .claude/skills/prd/SKILL.md (full file — 144 lines)

```markdown
---
name: prd
description: Knowledge framework for producing actionable PRDs with binding tech decisions and deep backend design
license: MIT
compatibility: claude-code
---

# PRD Methodology — Binding Decisions + Backend Depth

This skill provides the quality standards and depth criteria for producing PRDs that are
genuinely useful for downstream planning. It complements the `/prd` command — the command
provides the workflow, this skill provides the quality bar.

## When This Skill Applies

- User invokes `/prd` or asks to "write the product spec" / "create the PRD"
- `mvp.md` exists and needs to be expanded into a full technical specification
- An existing PRD needs revision or quality assessment

## The Two Gates (Non-Negotiable)

Every PRD session must pass through two gates before writing:

**Gate 1: Spec Lock (Step 0)**
Lock these before drafting: Product name, Big Idea, Tech Direction, Implementation Mode,
Target Path, Maturity Target, PRD Depth. Get explicit confirmation.
Why: Writing a PRD on a misunderstood foundation wastes hours and produces a document
nobody uses.

**Gate 2: Direction Preview (Step 0.5)**
Show a one-page preview: problem framing, scope in/out, architecture, assumptions, tech stack.
Get explicit approval.
Why: Architecture is the hardest thing to change after the PRD is written. Catch it here.

## Section Depth Standards

**Section 7 (Technology Stack) — Must Be Binding**
This section flows directly into `/planning`. It must be specific:

Good: `| Language | TypeScript | 5.4 | Type safety + existing team familiarity |`
Bad:  `| Language | Modern web language | latest | good for web |`

Every row in the tech stack table must have: technology name, specific version, one-line reason.
"TBD" in all fields means Section 7 is decoration, not a decision.

**Section 8 (Backend Design) — The Technical Heart**

Section 8 is what separates a useful PRD from a decorative one. Quality standard:

Data models must have actual field names:
```
Good:
Entity: User
Fields:
  - id: UUID — primary key, auto-generated
  - email: string — unique, validated on write
  - created_at: timestamp — set on insert, never updated

Bad:
Entity: User
Fields: user data fields
```

Service contracts must specify interface:
```
Good:
Service: AuthService
Interface:
  login(email: string, password: string): Promise<AuthToken | AuthError>
  refresh(token: string): Promise<AuthToken | ExpiredError>

Bad:
Service: AuthService
Responsibility: handles authentication
```

**Section 12 (Implementation Phases) — Must Enable /pillars**

Each phase must specify:
- Concrete deliverables (not "implement authentication" but "create AuthService with
  login, logout, refresh methods + JWT token generation + Redis session store")
- Validation: how to know this phase is done
- Enables: what the next phase can do because this phase exists

A phase that says "implement core features" is not a phase — it is a placeholder.

## Depth by PRD Type

**Default: Full PRD** (all sections 1-15).
Use lightweight only when explicitly requested by the user.

**Lightweight PRD** (Sections 1-6, 11-12 only):
Use when: internal tools, prototypes, or user explicitly requests lightweight
Skip: detailed API spec, deep backend service contracts, appendix

**Full PRD** (all 15 sections):
Use when: new products, external APIs, anything with non-trivial auth or data models
Required: complete Section 8 with data models + service contracts

**Agent/Tool projects** — Emphasize Section 8 (tool contracts, I/O specs)
**User-facing apps** — Emphasize Section 5 (user stories) + Section 9 (API spec)

## Assumption Labeling

Every assumption must be labeled explicitly:
`Assumption: Users will be authenticated before accessing the API — Rationale: mvp.md
specifies auth as a core capability`

Unlabeled assumptions are invisible risks. When they turn out to be wrong, the PRD
has to be rewritten.

## Gate Refusal

If the user refuses to confirm the Spec Lock or Direction Preview:
1. Ask what specifically they want to change
2. Update the spec lock / preview with the change
3. Re-present and ask for confirmation again
Do NOT proceed to write the PRD until confirmed. If the user keeps saying "just write it",
explain that the gates catch architecture mistakes that are costly to fix after writing.

## Anti-Patterns

**Decorative PRD** — Has all 15 sections but makes no binding decisions. Every section
says what to consider rather than what was decided.
Detection: If someone could write a completely different system from this PRD, it is decorative.

**Generic architecture** — "REST API + database" without specifying which database,
which ORM, which auth approach. Section 6 must draw the actual system.

**Vague success criteria** — "performs well", "users are satisfied", "scales appropriately"
are not success criteria. Each criterion must be measurable:
Good: "Responds in <200ms for typical queries at 100 concurrent users"
Bad: "Performs well under load"

**Skipping the gates** — Writing the PRD without Spec Lock or Direction Preview produces
a document that may be based on wrong assumptions about product or architecture.

**Section 12 without enablement** — Each phase must explicitly state what it enables.
Without this, `/planning` sessions don't know their dependencies.

## Key Rules

1. **Two gates are non-negotiable** — Spec Lock + Direction Preview before writing
2. **Section 7 must be binding** — Specific tech, specific versions, specific reasons
3. **Section 8 is the heart** — Data models with field names, service contracts with types
4. **Section 12 enables /pillars** — Each phase must be concrete and specify what it enables
5. **Label every assumption** — Unlabeled assumptions are invisible failures
6. **Out of Scope needs reasons** — "Feature X deferred: complexity, needs user feedback first"
7. **For existing codebases**: scan the repo first, extract actual patterns rather than inventing

## Related Commands

- `/mvp` — Creates `mvp.md` which `/prd` reads as primary input
- `/prd [filename]` — The full PRD workflow this skill supports
- `/pillars` — Analyzes the PRD to identify infrastructure layers and build order
- `/planning {feature}` — Each implementation phase in Section 12 becomes one `/planning` session
```

---

## Patterns to Follow

### Gate enforcement pattern (already partially present in prd.md)

Step 0 already has "Do NOT write the PRD until the user confirms." — this is correct.
The hardening needed is:
1. Clarify what "confirm" means (not silence, not "yeah sure")
2. Step 0 enforcement language should be as strong as Step 0.5

Step 0.5 says "Only write the PRD after explicit approval." — good, keep as is.

### Default depth explicit statement pattern

Currently Instructions Step 3 lists options without stating the default. Add:
"The default is **Full PRD** (all sections). Only use Lightweight when the user explicitly requests it."

### Pipeline update pattern

Old: `/prd (full spec) → /planning {feature}`
New: `/prd (full spec) → /pillars (layers) → /decompose (per pillar) → /planning`

Update in: Pipeline Position block, Output Confirmation next step, and any Notes references.

---

## Step-by-Step Tasks

### Step 1: Edit .claude/commands/prd.md

IMPLEMENT: Apply four targeted hardening edits:

**Edit 1 — Update Pipeline Position block**

CURRENT:
```markdown
## Pipeline Position

```
/mvp (big idea) → /prd (full spec) → /planning {feature} → /execute → /code-review → /commit → /pr
```

This is Step 2. Reads `mvp.md` as primary input. Output feeds `/planning` for each feature.
```

REPLACE WITH:
```markdown
## Pipeline Position

```
/mvp (big idea) → /prd (full spec) → /pillars (layers) → /decompose (per-pillar spec) → /planning → /execute → /code-review → /commit → /pr
```

This is Step 2. Reads `mvp.md` as primary input. Output feeds `/pillars`.
```

**Edit 2 — Strengthen Step 0 gate enforcement**

CURRENT (end of Step 0 Spec Lock section):
```markdown
Do NOT write the PRD until the user confirms.
```

REPLACE WITH:
```markdown
**HARD STOP** — Do NOT write the PRD until the user confirms. "Sure" or silence is not
confirmation. If the user says "just write it", explain that the Spec Lock catches
foundation mismatches that cost hours to fix after the PRD is written. Re-present and
wait for explicit "yes" or specific adjustments.
```

**Edit 3 — Explicit default depth in Instructions Step 3**

CURRENT:
```markdown
### 3. Section Depth

- Full PRD: all sections, full detail
- Lightweight PRD: Sections 1-6, 11-12 only — skip detailed API spec, backend design depth, appendix
- For agent/tool projects: emphasize Section 8 (backend design) and tool contracts
- For user-facing apps: emphasize Section 5 (user stories) and Section 9 (API spec)
```

REPLACE WITH:
```markdown
### 3. Section Depth

**Default: Full PRD** (all 15 sections, full detail). Use Lightweight only when the user
explicitly requests it — do not default to Lightweight to save time.

- **Full PRD** (default): all sections, full detail
- **Lightweight PRD** (user-requested only): Sections 1-6, 11-12 only — skip detailed API spec, backend design depth, appendix
- For agent/tool projects: emphasize Section 8 (backend design) and tool contracts
- For user-facing apps: emphasize Section 5 (user stories) and Section 9 (API spec)
```

**Edit 4 — Update Output Confirmation next step**

CURRENT:
```markdown
Next: /planning {feature} — create an implementation plan for each capability.
Run /planning {first-capability} to continue.
```

REPLACE WITH:
```markdown
Next: /pillars — analyze this PRD to identify infrastructure layers and build order.
Run /pillars to continue.
```

Also update the Notes section — replace:
```markdown
- Implementation phases in Section 12 become the input for individual `/planning` sessions — one phase or capability per session
```
WITH:
```markdown
- Implementation phases in Section 12 become the input for `/pillars`, which identifies the build order — then `/decompose` per pillar, then `/planning`
```

VALIDATE: `grep -n "HARD STOP\|pillars\|Default: Full" .claude/commands/prd.md`

### Step 2: Edit .claude/skills/prd/SKILL.md

The SKILL.md was pre-written with hardened content during plan preparation. Compare against
current file and apply any remaining gaps:

**Edit 1 — Section 12 reference update**

CURRENT:
```markdown
**Section 12 (Implementation Phases) — Must Enable /planning**
```

REPLACE WITH:
```markdown
**Section 12 (Implementation Phases) — Must Enable /pillars**
```

**Edit 2 — Key Rule 4 update**

CURRENT:
```markdown
4. **Section 12 enables /planning** — Each phase must be concrete and specify what it enables
```

REPLACE WITH:
```markdown
4. **Section 12 enables /pillars** — Each phase must be concrete; /pillars uses these phases to define infrastructure layers
```

Check if "Gate Refusal" section exists. If not, add it between "Assumption Labeling" and "Anti-Patterns":

```markdown
## Gate Refusal

If the user refuses to confirm the Spec Lock or Direction Preview:
1. Ask what specifically they want to change
2. Update the spec lock / preview with the change
3. Re-present and ask for confirmation again
Do NOT proceed to write the PRD until confirmed. If the user keeps saying "just write it",
explain that the gates catch architecture mistakes that are costly to fix after writing.
```

Check if "Default: Full PRD" language exists in "Depth by PRD Type" section. If not, add it:
Insert at the start of the "Depth by PRD Type" section:
```markdown
**Default: Full PRD** (all sections 1-15).
Use lightweight only when explicitly requested by the user.
```

VALIDATE: `grep -n "pillars\|Gate Refusal\|Default: Full" .claude/skills/prd/SKILL.md`

### Step 3: Sync to opencode mirrors

**For .opencode/commands/prd.md:**
Read the updated `.claude/commands/prd.md` and write identical content to `.opencode/commands/prd.md`.

**For .opencode/skills/prd/SKILL.md:**
1. Create directory if not exists: `.opencode/skills/prd/`
2. Write identical content to `.opencode/skills/prd/SKILL.md`

VALIDATE:
```bash
diff .claude/commands/prd.md .opencode/commands/prd.md && echo "COMMAND MIRROR OK"
diff .claude/skills/prd/SKILL.md .opencode/skills/prd/SKILL.md && echo "SKILL MIRROR OK"
```

---

## Testing Strategy

**Unit (per-file):**
- `prd.md` command: Pipeline Position references /pillars; Step 0 has "HARD STOP"; Instructions has "Default: Full PRD"; Output Confirmation says "Run /pillars"
- `SKILL.md` skill: Section 12 references /pillars; Gate Refusal section present; Default depth stated

**Integration:**
- All 4 files open without markdown parse errors
- Code fence markers are balanced (even count) in both command files

**Edge cases:**
- prd.md has many nested code blocks (the PRD template sections contain code fences). Verify that
  the edit to Output Confirmation doesn't break any enclosing fence.

---

## Validation Commands

**L1 Syntax — verify even code fence count:**
```bash
python3 -c "
import re
for f in ['.claude/commands/prd.md', '.opencode/commands/prd.md']:
    content = open(f).read()
    count = len(re.findall(r'^` + '`' + `' + '`' + `', content, re.MULTILINE))
    print(f'{f}: {count} fences (even={count % 2 == 0})')
"
```

Or simpler:
```bash
grep -c '^\`\`\`' .claude/commands/prd.md   # count of ``` at line start (should be even)
```

**L2 Structure — required sections:**
```bash
grep -n "Pipeline Position\|Step 0\|Step 0.5\|Output Confirmation\|Notes" .claude/commands/prd.md
grep -n "The Two Gates\|Section Depth\|Gate Refusal\|Anti-Patterns\|Key Rules" .claude/skills/prd/SKILL.md
```

**L3 Gate enforcement:**
```bash
grep -n "HARD STOP\|Do NOT write\|explicit approval" .claude/commands/prd.md
```

**L4 Mirror sync:**
```bash
diff .claude/commands/prd.md .opencode/commands/prd.md && echo "COMMAND MIRROR OK"
diff .claude/skills/prd/SKILL.md .opencode/skills/prd/SKILL.md && echo "SKILL MIRROR OK"
```

**L5 Pipeline references — verify /pillars is present, old references updated:**
```bash
grep -n "pillars" .claude/commands/prd.md     # should appear in Pipeline Position + Output Confirmation
grep -n "pillars" .claude/skills/prd/SKILL.md # should appear in Section 12 + Key Rules + Related Commands
grep -n "/planning {feature}" .claude/commands/prd.md || echo "OLD REFERENCE CLEANED"
```

---

## Acceptance Criteria

### Implementation

- [ ] `.claude/commands/prd.md` Pipeline Position block references `/pillars`
- [ ] `.claude/commands/prd.md` Step 0 has "HARD STOP" enforcement text
- [ ] `.claude/commands/prd.md` Instructions Step 3 has "Default: Full PRD" explicit statement
- [ ] `.claude/commands/prd.md` Output Confirmation next step says "Run /pillars to continue"
- [ ] `.claude/commands/prd.md` Notes updated to reference /pillars pipeline
- [ ] `.claude/skills/prd/SKILL.md` Section 12 reference updated to "/pillars"
- [ ] `.claude/skills/prd/SKILL.md` Key Rule 4 updated to reference /pillars
- [ ] `.claude/skills/prd/SKILL.md` "Gate Refusal" section present
- [ ] `.claude/skills/prd/SKILL.md` "Default: Full PRD" stated in Depth by PRD Type section
- [ ] `.opencode/commands/prd.md` exists and is identical to `.claude/commands/prd.md`
- [ ] `.opencode/skills/prd/SKILL.md` exists and is identical to `.claude/skills/prd/SKILL.md`

### Runtime

- [ ] L1: Both command files have even number of code fence markers
- [ ] L2: All required sections present in both command and skill files
- [ ] L3: `grep "HARD STOP" .claude/commands/prd.md` returns at least 1 match
- [ ] L4: Both opencode mirrors produce zero diff against source files
- [ ] L5: No `/planning {feature}` reference remains in Output Confirmation

---

## Handoff Notes

Task 3 creates `.claude/commands/pillars.md` and `.claude/skills/pillars/SKILL.md` from scratch.
The pipeline positions in the pillars command should read:
- Prev step: `/prd (full spec)`
- Next step: `/decompose {pillar-N}` (one pillar at a time)

Task 3 has no code dependency on Tasks 1 or 2 (all different files). Can run in any order.

---

## Completion Checklist

- [ ] Read `.claude/commands/prd.md` before editing (full 405 lines)
- [ ] Read `.claude/skills/prd/SKILL.md` before editing (full 144 lines)
- [ ] Applied Pipeline Position update (references /pillars)
- [ ] Applied Step 0 HARD STOP enforcement
- [ ] Applied Default: Full PRD to Instructions Step 3
- [ ] Applied Output Confirmation next-step update (Run /pillars)
- [ ] Applied Notes update for new pipeline
- [ ] Applied Section 12 → /pillars update to skill
- [ ] Applied Key Rule 4 update to skill
- [ ] Added Gate Refusal section to skill (if not present)
- [ ] Added Default: Full PRD to skill Depth section (if not present)
- [ ] Synced `.opencode/commands/prd.md`
- [ ] Synced `.opencode/skills/prd/SKILL.md` (created dir if needed)
- [ ] All validation commands pass
- [ ] All acceptance criteria checked off
