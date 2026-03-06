# Task 4: Delete Legacy Markdown Agents

## Objective

Delete the legacy markdown agent definition files that are no longer needed now that commands use the TypeScript registry via `task()` invocations.

## Scope

### Files Touched
- `.opencode/agents/research-codebase.md` — DELETE
- `.opencode/agents/research-external.md` — DELETE
- `.opencode/agents/planning-research.md` — DELETE
- `.opencode/agents/plan-writer.md` — DELETE
- `.opencode/agents/code-review.md` — DELETE

### What's Out of Scope
- TypeScript files in `.opencode/agents/` — KEEP
- Agent skill directories (explore/, librarian/, etc.) — KEEP
- `README.md` — UPDATE (in task 5)

### Dependencies
- Task 2 complete — Planning command no longer references these files
- Task 3 complete — Code-review command no longer references these files

## Prior Task Context

Task 2 updated `/planning` to use `task(subagent_type="explore")` and `task(subagent_type="librarian")` instead of "Agent tool to invoke research-codebase".

Task 3 updated `/code-review` similarly (or confirmed no agent references existed).

These legacy files are now orphaned and should be deleted:
- `research-codebase.md` — Replaced by `explore` agent
- `research-external.md` — Replaced by `librarian` agent
- `planning-research.md` — Replaced by `explore` agent
- `plan-writer.md` — Replaced by category dispatch
- `code-review.md` — Replaced by category dispatch with code-review skill

---

## Context References

### Files to Delete

#### `.opencode/agents/research-codebase.md`
Legacy codebase research agent definition. Functionality now provided by `explore` agent in registry.

#### `.opencode/agents/research-external.md`
Legacy external documentation search agent. Functionality now provided by `librarian` agent in registry.

#### `.opencode/agents/planning-research.md`
Legacy past-plan search agent. Functionality now provided by `explore` agent searching `.agents/features/*/plan.done.md`.

#### `.opencode/agents/plan-writer.md`
Legacy plan writing agent. Functionality now provided by `task(category="writing", load_skills=["planning-methodology"], ...)`.

#### `.opencode/agents/code-review.md`
Legacy code review agent. Functionality now provided by `task(category="deep", load_skills=["code-review"], ...)`.

### Files to KEEP

These files are NOT being deleted:
- `registry.ts` — The authoritative agent registry
- `types.ts` — TypeScript type definitions
- `permissions.ts` — Permission constants
- `*.ts` files — TypeScript implementations
- `explore/`, `librarian/`, `oracle/`, etc. — Agent skill directories

---

## Patterns to Follow

### Pattern: Verify Before Delete

Before deleting each file, verify no remaining references:

```bash
# Check for references to the file being deleted
grep -r "research-codebase" .opencode/commands/
grep -r "research-codebase" .opencode/skills/
grep -r "research-codebase" AGENTS.md

# If all return 0 results, safe to delete
rm .opencode/agents/research-codebase.md
```

### Pattern: Git Staging

Stage deletions for the commit:

```bash
git rm .opencode/agents/research-codebase.md
git rm .opencode/agents/research-external.md
git rm .opencode/agents/planning-research.md
git rm .opencode/agents/plan-writer.md
git rm .opencode/agents/code-review.md
```

---

## Step-by-Step Tasks

### Step 4.1: Verify No References to research-codebase.md

**IMPLEMENT**: Check for remaining references

```bash
grep -rn "research-codebase" .opencode/
grep -rn "research-codebase" AGENTS.md
```

**VALIDATE**: All greps return 0 results or only return the file itself

**GOTCHA**: README.md in agents/ may reference these — will be updated in task 5

### Step 4.2: Verify No References to research-external.md

**IMPLEMENT**: Check for remaining references

```bash
grep -rn "research-external" .opencode/
grep -rn "research-external" AGENTS.md
```

**VALIDATE**: All greps return 0 results or only return the file itself

### Step 4.3: Verify No References to planning-research.md

**IMPLEMENT**: Check for remaining references

```bash
grep -rn "planning-research" .opencode/
grep -rn "planning-research" AGENTS.md
```

**VALIDATE**: All greps return 0 results or only return the file itself

### Step 4.4: Verify No References to plan-writer.md

**IMPLEMENT**: Check for remaining references

```bash
grep -rn "plan-writer" .opencode/
grep -rn "plan-writer" AGENTS.md
```

**VALIDATE**: All greps return 0 results or only return the file itself

### Step 4.5: Verify No References to code-review.md (in agents/)

**IMPLEMENT**: Check for remaining references

```bash
grep -rn "agents/code-review" .opencode/
grep -rn "agents/code-review" AGENTS.md
```

**VALIDATE**: All greps return 0 results or only return the file itself

**GOTCHA**: Make sure to search for "agents/code-review" not just "code-review" to avoid matching the skill or command

### Step 4.6: Delete Legacy Files

**IMPLEMENT**: Delete all 5 files

```bash
rm .opencode/agents/research-codebase.md
rm .opencode/agents/research-external.md
rm .opencode/agents/planning-research.md
rm .opencode/agents/plan-writer.md
rm .opencode/agents/code-review.md
```

Or with git:
```bash
git rm .opencode/agents/research-codebase.md
git rm .opencode/agents/research-external.md
git rm .opencode/agents/planning-research.md
git rm .opencode/agents/plan-writer.md
git rm .opencode/agents/code-review.md
```

**VALIDATE**: Files no longer exist

```bash
ls .opencode/agents/*.md
# Should only show README.md (and any other non-legacy .md files)
```

---

## Testing Strategy

### Manual Verification
- Confirm each file is deleted
- Confirm no errors when running commands that previously referenced these files

### Regression Check
- Run `/planning test-feature` and verify it works without the deleted files
- Run `/code-review` and verify it works without the deleted files

---

## Validation Commands

```bash
# Verify files are deleted
ls .opencode/agents/*.md
# Should NOT include: research-codebase.md, research-external.md, 
#                     planning-research.md, plan-writer.md, code-review.md

# Verify no dangling references
grep -rn "research-codebase\|research-external\|planning-research\|plan-writer" .opencode/commands/
# Should return 0 results
```

---

## Acceptance Criteria

### Implementation
- [ ] research-codebase.md deleted
- [ ] research-external.md deleted
- [ ] planning-research.md deleted
- [ ] plan-writer.md deleted
- [ ] code-review.md deleted
- [ ] No remaining references in commands

### Runtime
- [ ] Commands that previously referenced these files still work
- [ ] No "file not found" or similar errors

---

## Handoff Notes

Task 4 deletes 5 legacy markdown files. After this task:
- Only TypeScript and skill files remain in `.opencode/agents/`
- Commands use `task()` with registry agents
- The README.md in `.opencode/agents/` may need updating (task 5)

Task 5 will update AGENTS.md to reflect the consolidated agent system.

---

## Completion Checklist

- [ ] Verified no references to research-codebase.md
- [ ] Verified no references to research-external.md
- [ ] Verified no references to planning-research.md
- [ ] Verified no references to plan-writer.md
- [ ] Verified no references to code-review.md
- [ ] Deleted all 5 legacy files
- [ ] Confirmed deletion via ls
- [ ] No dangling references remain
