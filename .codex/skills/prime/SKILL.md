---
name: prime
description: Load project context at the start of a Codex session. Use when the user
             asks to prime, load context, start a session, check status, or find out
             what to work on next. Trigger phrases: "prime me", "load context",
             "what's the status", "start a new session", "what should I work on next",
             "check pending work", "prime the session", "show me what's pending".
---

# Prime: Load Project Context

## When to Use This Skill

Use this skill at the START of every Codex session before doing any implementation work.
It surfaces pending tasks, git state, memory context, and Archon connection status so you
know exactly what to work on. This system follows ABP — Always Be Priming.

## Step 0: Check Git State

```bash
git status --short
```

If dirty (uncommitted changes exist):
```
⚠️  WARNING: Uncommitted changes detected
{list files from git status --short}
Consider committing these before starting new work, or proceed knowing there are uncommitted files.
```

If clean: proceed without warning.

## Step 1: Load Recent History

```bash
git log -10 --oneline
git status
```

## Step 2: Read Memory and Config

Read these files if they exist (do not error if absent):
- `memory.md` — past decisions, gotchas, architecture patterns, session notes
- `.claude/config.md` — project stack and validation commands (L1-L5)

From `memory.md` extract (if present):
- Last Session date (most recent entry under Session Notes)
- Key Decisions
- Active Patterns
- Gotchas

From `.claude/config.md` extract (if present):
- Language + Framework
- L1 Lint command
- L3 Unit Test command

## Step 3: Check Archon Connection (Optional)

If Archon MCP is connected:
```python
rag_get_available_sources()  # check available knowledge sources
```
Report: "Archon connected — {N} knowledge sources available"
If not connected or call fails: "Archon not connected — using local exploration"

## Step 4: Detect Pending Work

**Source 1 — Read `.agents/context/next-command.md`** (if it exists):

Extract these fields:
- Last Command
- Feature
- Next Command
- Status
- Task Progress (if present — format: "N/M complete")
- Phase Progress (if present)

Status values and what they mean:
- `awaiting-execution` — plan written, execution not started
- `executing-tasks` — task brief mode in progress (some briefs done, more remain)
- `executing-series` — master plan phase mode in progress
- `awaiting-review` — all execution done, needs `/code-loop` in Claude
- `awaiting-fixes` — review found issues, needs `/code-review-fix` in Claude
- `awaiting-re-review` — fixes applied, needs re-review in Claude
- `ready-to-commit` — review clean, needs `/commit`
- `ready-for-pr` — committed, needs `/pr` in Claude
- `pr-open` — pipeline complete
- `blocked` — manual intervention required

**Source 2 — Scan `.agents/features/*/`** (fallback + cross-check):

For each directory found under `.agents/features/`:
- `plan.md` exists but `plan.done.md` does NOT:
  - Check for `task-{N}.md` files → count which have `.done.md` pairs
  - If task files found: task brief mode, N/total done
  - If no task files: legacy plan awaiting execution
- `plan-master.md` exists but `plan-master.done.md` does NOT:
  - Count `plan-phase-{N}.done.md` vs total phases from master plan index
  - Report: master plan mode, N/total phases done
- `report.md` exists but `report.done.md` does NOT → execution done, awaiting commit
- `review.md` exists but `review.done.md` does NOT → review open with findings

**Merge rule**:
- Handoff file exists AND artifact scan agrees → use handoff (has exact next command)
- Handoff contradicts artifacts (e.g., says awaiting-execution but plan.done.md exists)
  → artifact scan wins, note "Handoff stale — overridden by artifact state"
- No handoff file → use artifact scan only
- Neither finds pending work → "No pending work found"

## Step 5: Report

Output this report:

```
## Current State
- **Branch**: {current branch name}
- **Status**: {clean / dirty — N files modified}
- **Recent Work**:
  - `{hash}` {commit message}
  - `{hash}` {commit message}
  ... (last 10)

## Memory Context
{If memory.md found:}
- **Last Session**: {date from most recent Session Notes entry}
- **Key Decisions**: {bullet list}
- **Active Patterns**: {bullet list}
- **Gotchas**: {bullet list}
{If not found: "No memory.md found — first session or memory not yet created"}

## Config
{If .claude/config.md found:}
- **Stack**: {Language} / {Framework}
- **L1 Lint**: {command}
- **L3 Tests**: {command}
{If not found: "No .claude/config.md — run /prime in Claude to generate it"}

## Archon
{Connected — {N} sources available / Not connected}

## Pending Work
{For each item found, show only applicable lines:}
- **[handoff]** {Next Command} ← from last session ({Last Command} → {feature})
- **[tasks]**   {feature} — task {N}/{total} done
                Next: `codex "execute the task brief at .agents/features/{feature}/plan.md"`
- **[master]**  {feature} — phase {N}/{total} done
                Next: `codex "execute .agents/features/{feature}/plan-master.md"`
- **[review]**  {feature} — review open
                Next: Run /code-review-fix in Claude
- **[commit]**  {feature} — ready to commit
                Next: `codex "commit my changes"`
- **[pr]**      {feature} — committed, create PR
                Next: Run /pr in Claude
- **[done]**    {feature} — pipeline complete ✓
- **[blocked]** {feature} — blocked: {reason}

{If nothing found: "No pending work found — ready to start a new feature with /planning in Claude"}
```

## Key Notes

- This skill is READ-ONLY — it does not modify files, commit, or start implementation
- Always run at session start before any work (ABP — Always Be Priming)
- If `.claude/config.md` is missing, note it but do not create it — that is Claude's job
- The handoff file's "Next Command" is the authoritative source for what to do next
- If Archon is connected, RAG search (2-5 keywords) is available during execution
