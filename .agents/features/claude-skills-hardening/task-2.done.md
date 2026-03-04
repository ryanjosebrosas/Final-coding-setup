# Task 2: Create PRD Skill

## Objective

Create `.claude/skills/prd/SKILL.md` — a knowledge framework for producing high-quality PRDs,
adding quality gates, depth standards, and anti-patterns not present in the command file alone.

## Scope

- **File to create**: `.claude/skills/prd/SKILL.md`
- **Out of scope**: Do NOT modify `.claude/commands/prd.md`
- **Dependencies**: None (independent of task 1)

## Prior Task Context

Task 1 created `.claude/skills/mvp/SKILL.md` following the planning-methodology pattern:
YAML frontmatter (name, description, license, compatibility) + markdown with When/Anti-Patterns/
Key Rules/Related Commands sections. Each skill adds DEPTH beyond the command, not duplication.

## Context References

### Reference: .claude/commands/prd.md (source — key sections)

```markdown
---
description: Create a full Product Requirements Document with architecture, tech specs, and backend design
model: claude-opus-4-6
---

## Step 0: Spec Lock (before drafting)
Read mvp.md. Lock: Product, Big Idea, Tech Direction, Implementation Mode,
Target Path, Maturity Target, PRD Depth. Confirm before writing anything.

## Step 0.5: PRD Direction Preview
Generate preview: Problem framing, Scope in/out, Architecture, Assumptions, Tech stack.
Get approval before writing the full PRD.

## PRD Structure
15 sections:
1. Executive Summary
2. Mission and Principles
3. Target Users
4. MVP Scope
5. User Stories
6. System Architecture (ASCII diagram + approach + directory + patterns)
7. Technology Stack (binding — flows to /planning)
8. Backend Design (data models, service contracts, state mgmt, error handling)
9. API Specification
10. Security and Configuration
11. Success Criteria (measurable)
12. Implementation Phases (each becomes a /planning session)
13. Risks and Mitigations
14. Future Considerations
15. Appendix

## Notes
- Never skip Spec Lock and Direction Preview gates
- Section 8 (Backend Design) is what makes a PRD useful for planning
- Tech stack in Section 7 must be concrete (specific languages, frameworks, versions)
- Implementation phases in Section 12 become individual /planning sessions
```

### Reference: planning-methodology/SKILL.md (pattern template)

```yaml
---
name: planning-methodology
description: Guide for systematic interactive planning...
license: MIT
compatibility: claude-code
---
```

Sections: When This Skill Applies, Phase descriptions, Key Rules, Related Commands.

## Patterns to Follow

Skills add DEPTH (quality criteria, anti-patterns) beyond the command workflow:

```markdown
## PRD Quality Standards
Section 8 (Backend Design) is the technical heart. A weak Section 8 produces bad planning:
- Data models must have actual field names, not just entity names
- Service contracts must specify input type, output type, error conditions
- "User service handles users" is NOT a service contract
- "UserService.create(email: string, name: string): Promise<User | ValidationError>" IS

## Anti-Patterns
- Decorative PRD: writes all sections but makes no binding decisions
- Generic architecture: "REST API + database" without specifying the actual tech
- Vague success criteria: "performs well" instead of "responds in <200ms"
```

## Step-by-Step Tasks

### IMPLEMENT: Create `.claude/skills/prd/SKILL.md`

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

**Section 12 (Implementation Phases) — Must Enable /planning**

Each phase must specify:
- Concrete deliverables (not "implement authentication" but "create AuthService with
  login, logout, refresh methods + JWT token generation + Redis session store")
- Validation: how to know this phase is done
- Enables: what the next phase can do because this phase exists

A phase that says "implement core features" is not a phase — it is a placeholder.

## Depth by PRD Type

**Lightweight PRD** (Sections 1-6, 11-12 only):
Use when: internal tools, prototypes, or when the tech stack is already well-known
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
4. **Section 12 enables /planning** — Each phase must be concrete and specify what it enables
5. **Label every assumption** — Unlabeled assumptions are invisible failures
6. **Out of Scope needs reasons** — "Feature X deferred: complexity, needs user feedback first"
7. **For existing codebases**: scan the repo first, extract actual patterns rather than inventing

## Related Commands

- `/mvp` — Creates `mvp.md` which `/prd` reads as primary input
- `/prd [filename]` — The full PRD workflow this skill supports
- `/planning {feature}` — Each implementation phase in Section 12 becomes one `/planning` session
```

### VALIDATE

```bash
grep -c "name: prd" .claude/skills/prd/SKILL.md
grep -c "When This Skill Applies" .claude/skills/prd/SKILL.md
grep -c "Key Rules" .claude/skills/prd/SKILL.md
grep -c "Anti-Patterns" .claude/skills/prd/SKILL.md
```

## Validation Commands

```bash
# L1
grep -c "name: prd" .claude/skills/prd/SKILL.md
grep -c "compatibility: claude-code" .claude/skills/prd/SKILL.md
grep -c "When This Skill Applies" .claude/skills/prd/SKILL.md
grep -c "Key Rules" .claude/skills/prd/SKILL.md
# L2-L5: N/A
```

## Acceptance Criteria

### Implementation
- [ ] `.claude/skills/prd/SKILL.md` exists
- [ ] Frontmatter has all 4 fields
- [ ] Has "When This Skill Applies" section
- [ ] Has "Anti-Patterns" section
- [ ] Has "Key Rules" section
- [ ] Has "Related Commands" section
- [ ] Covers Section 8 depth standards explicitly
- [ ] Does NOT duplicate command steps

## Handoff Notes

Task 3 creates `.claude/skills/prime/SKILL.md`. Focus: dirty state awareness, stack
detection heuristics, handoff merge logic, config.md creation standards.

## Completion Checklist

- [ ] `.claude/skills/prd/SKILL.md` created
- [ ] All grep validations pass
- [ ] `task-2.md` → `task-2.done.md` rename completed
