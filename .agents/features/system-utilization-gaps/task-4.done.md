# Task 4: Add hephaestus to AGENTS.md Delegation Table

## Objective
Add `hephaestus` to the Delegation Table in `AGENTS.md` with explicit trigger criteria,
so the orchestrator knows when to route to it versus oracle, versus category dispatch.

## Scope
- **Files modified**: `AGENTS.md` (1 file)
- **Files created**: none
- **Specific change**: Add 2 hephaestus entries to the Delegation Table section only
- **Out of scope**: Do NOT modify the "Quick Reference Table", "When to Use Each Agent"
  table (lines 463+), or "Fallback Chains" — those already have hephaestus correctly
- **Dependencies**: none — Wave 1, fully independent

## Prior Task Context
None. Wave 1 task.

## Context References

### Target section: AGENTS.md Delegation Table (lines 397-407, full current content)

```markdown
### Delegation Table:

- **Architecture decisions** → `oracle` — Multi-system tradeoffs, unfamiliar patterns
- **Self-review** → `oracle` — After completing significant implementation
- **Hard debugging** → `oracle` — After 2+ failed fix attempts
- **Librarian** → `librarian` — Unfamiliar packages / libraries, struggles at weird behaviour (to find existing implementation of opensource)
- **Explore** → `explore` — Find existing codebase structure, patterns and styles
- **Pre-planning analysis** → `metis` — Complex task requiring scope clarification, ambiguous requirements
- **Plan review** → `momus` — Evaluate work plans for clarity, verifiability, and completeness
- **Quality assurance** → `momus` — Catch gaps, ambiguities, and missing context before implementation
```

### Reference: "When to Use Each Agent" table (AGENTS.md lines 463-464)

This table already correctly documents hephaestus — the Delegation Table must be
consistent with it:

```markdown
| **hephaestus** | Complex algorithm implementation, architecture refactoring, hard debugging | Trivial changes (use quick), UI work (use visual-engineering) |
```

### Reference: hephaestus registry entry (agents/registry.ts lines 117-128)

```typescript
hephaestus: {
  name: "hephaestus",
  displayName: "Hephaestus — Deep Autonomous Worker",
  description: "Autonomous problem-solver for genuinely difficult, logic-heavy tasks. Takes clear goals and works autonomously without hand-holding.",
  category: "ultrabrain",
  model: "openai/gpt-5.3-codex",
  temperature: 0.1,
  mode: "all",
  permissions: PERMISSIONS.full,
  ...
},
```

Key traits: `category: "ultrabrain"`, `PERMISSIONS.full` (can read, write, edit, bash),
`mode: "all"` (can be primary or subagent). It is a full implementation agent — unlike
oracle (read-only) or metis/momus (read-only consultants).

### The key distinction to encode in the Delegation Table

| Scenario | Use oracle | Use hephaestus |
|---|---|---|
| Stuck on architecture | ✅ oracle consults | ❌ |
| Architecture diagnosis done, need to implement fix | ❌ | ✅ hephaestus implements |
| Hard debugging — understanding the root cause | ✅ oracle diagnoses | ❌ |
| Hard debugging — need the actual code fix applied | ❌ | ✅ hephaestus fixes |
| Complex multi-file algorithm | ❌ | ✅ hephaestus builds |
| Performance-critical logic | ❌ | ✅ hephaestus optimizes |

Hephaestus fills the gap between "oracle told me what to do" and "category dispatch
for simple tasks" — it handles the hard implementation work that's too complex for
sisyphus-junior but doesn't need oracle-level consultation.

## Patterns to Follow

### Pattern: Delegation Table entry format (existing entries)

```markdown
- **Architecture decisions** → `oracle` — Multi-system tradeoffs, unfamiliar patterns
- **Self-review** → `oracle` — After completing significant implementation
- **Hard debugging** → `oracle` — After 2+ failed fix attempts
```

Format: `- **{trigger}** → \`{agent}\` — {when/what}`

Keep entries to one line. Use backticks for agent names. Bold the trigger phrase.
Dash before agent name, em-dash after.

### Pattern: Grouping convention

Current groupings (implied):
- Lines 399-401: oracle entries (3 entries)
- Lines 402-403: research agents (librarian, explore)
- Lines 404-406: planning agents (metis, momus x2)

Hephaestus entries logically belong near oracle since they're related (oracle consults,
hephaestus implements). Insert after the oracle entries.

## Step-by-Step Implementation

### Step 1: Apply the edit — insert two hephaestus entries after oracle block

**CURRENT** (AGENTS.md lines 397-407):
```markdown
### Delegation Table:

- **Architecture decisions** → `oracle` — Multi-system tradeoffs, unfamiliar patterns
- **Self-review** → `oracle` — After completing significant implementation
- **Hard debugging** → `oracle` — After 2+ failed fix attempts
- **Librarian** → `librarian` — Unfamiliar packages / libraries, struggles at weird behaviour (to find existing implementation of opensource)
- **Explore** → `explore` — Find existing codebase structure, patterns and styles
- **Pre-planning analysis** → `metis` — Complex task requiring scope clarification, ambiguous requirements
- **Plan review** → `momus` — Evaluate work plans for clarity, verifiability, and completeness
- **Quality assurance** → `momus` — Catch gaps, ambiguities, and missing context before implementation
```

**REPLACE WITH**:
```markdown
### Delegation Table:

- **Architecture decisions** → `oracle` — Multi-system tradeoffs, unfamiliar patterns
- **Self-review** → `oracle` — After completing significant implementation
- **Hard debugging (diagnosis)** → `oracle` — After 2+ failed fix attempts, need root cause
- **Complex implementation** → `hephaestus` — Multi-file logic, algorithms, hard autonomous work needing full permissions
- **Hard debugging (fix)** → `hephaestus` — Oracle diagnosed the issue, now needs code actually fixed
- **Librarian** → `librarian` — Unfamiliar packages / libraries, struggles at weird behaviour (to find existing implementation of opensource)
- **Explore** → `explore` — Find existing codebase structure, patterns and styles
- **Pre-planning analysis** → `metis` — Complex task requiring scope clarification, ambiguous requirements
- **Plan review** → `momus` — Evaluate work plans for clarity, verifiability, and completeness
- **Quality assurance** → `momus` — Catch gaps, ambiguities, and missing context before implementation
```

**Changes made**:
1. Renamed "Hard debugging" to "Hard debugging (diagnosis)" — clarifies oracle's read-only role
2. Added "Complex implementation" → `hephaestus` entry
3. Added "Hard debugging (fix)" → `hephaestus` entry
4. All other entries unchanged

### Step 2: Verify hephaestus now appears in Delegation Table

```bash
grep -n "hephaestus" AGENTS.md | head -10
```

Expected: Shows hephaestus at line ~400 (in Delegation Table) PLUS the existing line
~417 (Quick Reference Table) and line ~464 (When to Use table). Three references total.

### Step 3: Verify existing entries still present

```bash
grep "oracle\|librarian\|explore\|metis\|momus" AGENTS.md | grep "→" | head -10
```

Expected: All 8 original entries still present (oracle x3, librarian, explore, metis,
momus x2) plus the 2 new hephaestus entries = 10 delegation entries total.

## QA Scenarios

### Scenario 1: hephaestus appears in Delegation Table
**Tool**: Bash
**Steps**:
1. `grep -n "hephaestus" AGENTS.md`
**Expected**: At least one match in the 397-410 line range (Delegation Table section)
**Evidence**: `.agents/features/system-utilization-gaps/evidence/task-4-delegation-grep.txt`

### Scenario 2: Delegation Table has 10 entries total
**Tool**: Bash
**Steps**:
1. Count lines matching the delegation pattern between the table header and next `---`:
   `awk '/Delegation Table/,/^---/' AGENTS.md | grep "^- \*\*" | wc -l`
**Expected**: `10` (8 original + 2 new hephaestus entries)
**Evidence**: Terminal output

### Scenario 3: Surrounding content unchanged
**Tool**: Bash
**Steps**:
1. `grep -n "Quick Reference Table\|When to Use Each Agent" AGENTS.md`
**Expected**: Both headings still exist at their original line numbers (approximately 412, 462)
**Evidence**: Terminal output

## Validation Commands

```bash
# L1: hephaestus in delegation table area
grep -n "hephaestus" AGENTS.md | head -10

# L2: Entry count in delegation table
awk '/Delegation Table/,/^---/' AGENTS.md | grep "^- \*\*" | wc -l

# L3: All agents still present in table
grep "oracle\|librarian\|explore\|metis\|momus" AGENTS.md | grep "→" | wc -l

# L4: Hephaestus entries have correct format
grep "hephaestus" AGENTS.md | grep "→"
```

## Acceptance Criteria

### Implementation
- [ ] `AGENTS.md` Delegation Table contains a "Complex implementation" → `hephaestus` entry
- [ ] `AGENTS.md` Delegation Table contains a "Hard debugging (fix)" → `hephaestus` entry
- [ ] All 8 original Delegation Table entries still present
- [ ] "Hard debugging" oracle entry renamed to "Hard debugging (diagnosis)" for clarity
- [ ] "When to Use Each Agent" table and "Quick Reference Table" unchanged

### Runtime
- [ ] `grep "hephaestus" AGENTS.md | grep "→"` returns 2 lines
- [ ] Total delegation entries = 10

## Parallelization
- **Wave**: 1 — no dependencies
- **Can Parallel**: YES — independent of Tasks 1, 2, 3
- **Blocks**: Task 5 (README)
- **Blocked By**: nothing

## Handoff Notes
Task 5 (README) needs to reference the hephaestus delegation entry as resolved.
Pass: "hephaestus is now in the Delegation Table with trigger criteria."

## Completion Checklist
- [ ] Two hephaestus entries added to Delegation Table
- [ ] Oracle "Hard debugging" renamed to "Hard debugging (diagnosis)"
- [ ] Grep confirms entries present
- [ ] Entry count = 10
- [ ] Evidence saved
