# Task 3: Create .codex/skills/prime/SKILL.md

<!--
USAGE: codex "execute task-3 for codex-integration feature"
ONE session = ONE task brief.
-->

---

## OBJECTIVE

Create `.codex/skills/prime/SKILL.md` — a Codex CLI skill that teaches Codex how to load
project context at the start of a session: check git state, read memory, detect tech stack,
read config, scan for pending work from the pipeline handoff file, and report what to do next.

---

## SCOPE

**Files touched:**
- `.codex/skills/prime/SKILL.md` — CREATE (new directory + new file)

**Out of scope:**
- Do NOT modify `.claude/commands/prime.md`
- Do NOT touch other skill files (Tasks 2 and 4)
- Do NOT auto-write `.claude/config.md` — Codex reads it, Claude writes it

**Depends on:** Task 1 (AGENTS.md updated), Task 2 (`.codex/skills/` directory exists)

---

## PRIOR TASK CONTEXT

Task 1 inlined AGENTS.md sections. Task 2 created `.codex/skills/execute/SKILL.md` and
the `.codex/skills/` directory. This task adds the prime skill to the same directory.

---

## CONTEXT REFERENCES

### Prime Command Reference (`.claude/commands/prime.md` — key sections)

**Step 0 — Dirty state check:**
```bash
git status --short
# If dirty: warn "Uncommitted changes detected: {files}"
# If clean: proceed
```

**Step 1 — Context mode detection:**
```
Check for code directories: {src,app,frontend,backend,lib,api,server,client,cmd,pkg,internal}/**
If found → Codebase Mode
If not found → System Mode (this project is System Mode — no source code dirs)
```

**Step 2A — System Mode (applies to this repo):**
```bash
git log -10 --oneline
git status
```
Read: `memory.md`, `.claude/config.md`

**Step 3.5 — Detect pending work (two sources):**

Source 1 — Handoff file: `.agents/context/next-command.md`
```
Extract: Last Command, Feature, Next Command, Status, Task Progress
Statuses:
  awaiting-execution   → plan written, not started
  executing-tasks      → task brief mode in progress
  executing-series     → master plan phase mode in progress
  awaiting-review      → all execution done, needs /code-loop
  awaiting-fixes       → review found issues, needs /code-review-fix
  awaiting-re-review   → fixes applied, needs re-review
  ready-to-commit      → review clean, needs /commit
  ready-for-pr         → committed, needs /pr
  pr-open              → pipeline complete
  blocked              → manual intervention required
```

Source 2 — Artifact scan: `.agents/features/*/`
```
For each feature directory:
- plan.md exists + plan.done.md does NOT → check task-N.md files for progress
- plan-master.md exists + plan-master.done.md does NOT → phase mode in progress
- report.md exists + report.done.md does NOT → execution done, awaiting commit
- review.md exists + review.done.md does NOT → review open
```

Merge: handoff file wins unless artifact scan contradicts it (stale handoff).

**Step 4 — Report format (System Mode):**
```
## Current State
- **Branch**: {branch}
- **Status**: {clean/dirty}
- **Recent Work**: {last 10 commits}

## Memory Context
{from memory.md: Last Session, Key Decisions, Active Patterns, Gotchas}
{or: "No memory.md found"}

## Pending Work
[handoff] {Next Command} ← from last session ({Last Command} → {feature})
[tasks]   {feature} — task {N}/{total} done, next: codex "execute .agents/features/{f}/plan.md"
[plan]    {feature} — plan awaiting execution: codex "execute .agents/features/{f}/plan.md"
[review]  {feature} — review has open findings
[commit]  {feature} — ready to commit
[pr]      {feature} — committed, create PR
[done]    {feature} — pipeline complete
{or: "No pending work found."}
```

**Archon status check (if connected):**
```
rag_get_available_sources()  → list sources
# Report: Connected + source count
# Or: "Archon not connected"
```

---

## CONTEXT REFERENCES (continued)

### Pipeline Handoff File Format

`.agents/context/next-command.md` — singleton, overwritten by every pipeline command:

```markdown
# Pipeline Handoff
<!-- Auto-updated by pipeline commands. Read by /prime. Do not edit manually. -->

- **Last Command**: /execute (task 2 of 4)
- **Feature**: codex-integration
- **Next Command**: /execute .agents/features/codex-integration/plan.md
- **Task Progress**: 2/4 complete
- **Timestamp**: 2026-03-04T12:00:00Z
- **Status**: executing-tasks
```

### Memory File Format (`memory.md` — if present at project root)

```markdown
# Project Memory

## Key Decisions
- {decision 1}
- {decision 2}

## Architecture Patterns
- {pattern 1}

## Gotchas
- {gotcha 1}

## Session Notes
- {date}: {what happened}
```

---

## PATTERNS TO FOLLOW

### Codex Skill Frontmatter Pattern

```yaml
---
name: prime
description: Load project context at the start of a session. Use when the user asks to
             prime, load context, check status, or start a new session. Trigger phrases:
             "prime me", "load context", "what's the status", "start session",
             "what should I work on", "check pending work".
---
```

### Pending Work Output Pattern

From Claude prime command (System Mode report):
```
## Pending Work
- **[tasks]** codex-integration — task 2/4 done, next: `codex "execute .agents/features/codex-integration/plan.md"`
- **[handoff]** /execute .agents/features/codex-integration/plan.md ← from last session (/execute → codex-integration)
```

---

## STEP-BY-STEP TASKS

### Step 1: Create the directory

```bash
mkdir -p .codex/skills/prime
```

### Step 2: Write the SKILL.md file

Create `.codex/skills/prime/SKILL.md` with the following exact content:

```markdown
---
name: prime
description: Load project context at the start of a Codex session. Use when the user
             asks to prime, load context, start a session, check status, or find out
             what to work on next. Trigger phrases: "prime me", "load context",
             "what's the status", "start a new session", "what should I work on next",
             "check pending work", "prime the session".
---

# Prime: Load Project Context

## When to Use This Skill

Use this skill at the START of every Codex session before doing any implementation work.
It surfaces pending tasks, git state, memory, and Archon connection status so you know
exactly what to work on.

## Step 0: Check Git State

```bash
git status --short
```

If dirty (uncommitted changes exist):
```
⚠️  WARNING: Uncommitted changes detected
{list files from git status --short}
Consider: commit these changes first, or proceed knowing there are uncommitted files.
```

If clean: proceed without warning.

## Step 1: Load Recent History

```bash
git log -10 --oneline
git status
```

## Step 2: Read Memory and Config

Read these files if they exist:
- `memory.md` — past decisions, gotchas, architecture patterns
- `.claude/config.md` — project stack, validation commands (L1-L5)

From `memory.md` extract (if present):
- Last Session date
- Key Decisions
- Active Patterns
- Gotchas

## Step 3: Check Archon Connection (Optional)

If Archon MCP is connected:
```python
rag_get_available_sources()  # check available knowledge sources
```
Report: "Archon connected — {N} knowledge sources available"
If not connected: "Archon not connected — using local exploration"

## Step 4: Detect Pending Work

**Source 1 — Read `.agents/context/next-command.md`** (if exists):

Extract fields:
- Last Command
- Feature
- Next Command
- Status
- Task Progress (if present)
- Phase Progress (if present)

**Source 2 — Scan `.agents/features/*/`** (fallback + cross-check):

For each feature directory found:
- `plan.md` exists but `plan.done.md` does NOT:
  - Check for `task-{N}.md` files → if found, check which have `.done.md` pairs
  - Report: task brief mode, N/total done
- `plan-master.md` exists but `plan-master.done.md` does NOT:
  - Count `plan-phase-{N}.done.md` files vs total phases
  - Report: master plan mode, N/total phases done
- `report.md` exists but `report.done.md` does NOT → awaiting commit
- `review.md` exists but `review.done.md` does NOT → review open with findings

**Merge rule**: If handoff file exists AND artifact scan agrees → use handoff (has exact next command).
If handoff is stale (contradicts artifacts) → use artifact scan + note "Handoff stale".

## Step 5: Report

Output the following report:

```
## Current State
- **Branch**: {current branch}
- **Status**: {clean / dirty — N files modified}
- **Recent Work**:
  {last 10 commits as "- `hash` message"}

## Memory Context
{If memory.md found:
  - **Last Session**: {date}
  - **Key Decisions**: {bullet list}
  - **Active Patterns**: {bullet list}
  - **Gotchas**: {bullet list}
  Otherwise: "No memory.md found"}

## Config
{If .claude/config.md found:
  - **Stack**: {language} / {framework}
  - **L1 Lint**: {command}
  - **L3 Tests**: {command}
  Otherwise: "No .claude/config.md — run /prime (Claude) to generate it"}

## Archon
{Connected — {N} sources / Not connected}

## Pending Work
{For each pending item (most urgent first):}
- **[handoff]** {Next Command} ← from last session ({Last Command} → {feature})
- **[tasks]** {feature} — task {N}/{total} done
  Next: `codex "execute the task brief at .agents/features/{feature}/plan.md"`
- **[master]** {feature} — phase {N}/{total} done
  Next: `codex "execute .agents/features/{feature}/plan-master.md"`
- **[review]** {feature} — review open: `codex "fix the review findings in .agents/features/{feature}/review.md"`
- **[commit]** {feature} — ready to commit: `codex "commit my changes"`
- **[pr]** {feature} — ready for PR: `gh pr create` (Claude /pr command)
- **[done]** {feature} — pipeline complete
- **[blocked]** {feature} — blocked: {reason}
{If no pending work: "No pending work found — ready for new feature"}
```

## Key Notes

- This skill is READ-ONLY — it does not modify files, commit, or execute implementation
- Always run this at the start of a session before any implementation work (ABP — Always Be Priming)
- If `.claude/config.md` doesn't exist, note it but don't create it — that's Claude's job via /prime
- The "next command" from Archon task tracking is the authoritative source for what to do next
```

### Step 3: Verify the file

```bash
test -f .codex/skills/prime/SKILL.md && echo "OK" || echo "MISSING"
grep "name: prime" .codex/skills/prime/SKILL.md
grep "Pending Work" .codex/skills/prime/SKILL.md
```

---

## TESTING STRATEGY

**Manual verification:**
1. Open Codex CLI in this project directory
2. Say: "prime me"
3. Verify: Codex loads the prime skill and runs git status, reads memory.md, scans .agents/
4. Verify: Codex reports pending work from `.agents/context/next-command.md`

**Edge cases:**
- No memory.md: report should say "No memory.md found" (not error)
- No pending work: report should say "No pending work found"
- Stale handoff: report should note "Handoff stale — overridden by artifact state"

---

## VALIDATION COMMANDS

- **L1**: `test -f .codex/skills/prime/SKILL.md && echo OK`
- **L2**: `grep "name: prime" .codex/skills/prime/SKILL.md`
- **L3**: `grep "next-command.md" .codex/skills/prime/SKILL.md`
- **L4**: `grep "Pending Work" .codex/skills/prime/SKILL.md`
- **L5 Manual**: Read the skill — confirm it covers git state, memory, config, Archon,
  artifact scan, handoff file, and the full report format

---

## ACCEPTANCE CRITERIA

### Implementation
- [ ] `.codex/skills/prime/SKILL.md` exists
- [ ] Frontmatter has `name: prime` and trigger phrases in `description`
- [ ] Git state check (dirty warning) present
- [ ] Memory read instructions present
- [ ] `.agents/context/next-command.md` read instructions present
- [ ] Artifact scan instructions present (`.agents/features/*/`)
- [ ] Report format with all sections present
- [ ] Read-only note present (this skill does not write files)

### Runtime
- [ ] Codex auto-invokes this skill when asked to "prime" or "load context"
- [ ] Codex surfaces pending work correctly from handoff file
- [ ] Codex handles missing files gracefully (no errors if memory.md absent)

---

## HANDOFF NOTES

**For Task 4**: The `.codex/skills/` directory now has `execute/` and `prime/`. Task 4 creates
`.codex/skills/commit/SKILL.md`. No dependencies on prime skill content — independent.

---

## COMPLETION CHECKLIST

- [ ] `.codex/skills/prime/` directory created
- [ ] `SKILL.md` written with full content
- [ ] Frontmatter verified (`name: prime`)
- [ ] Pending work detection section present
- [ ] Validation commands pass
- [ ] Rename: `task-3.md` → `task-3.done.md`
- [ ] Update `.agents/context/next-command.md` with task 3/4 complete handoff
