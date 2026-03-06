# Task 5: Update README.md to Reflect Resolved Gaps

## Objective
Update `README.md` so it accurately reflects the now-resolved system utilization gaps —
removing or updating any stale language about unused agents, missing exports, or
disconnected Archon, and adding a brief "System Utilization" or updated agent section.

## Scope
- **Files modified**: `README.md` (1 file)
- **Files created**: none
- **Specific changes**: Update the "Agent architecture" section and any prose that
  implies hephaestus is unused or Archon is not connected
- **Out of scope**: Do NOT rewrite entire sections — surgical updates only
- **Dependencies**: Tasks 1-4 must complete first (Wave 2)

## Prior Task Context

Four Wave 1 tasks completed:
- **Task 1**: `pipeline-hook` is now exported from `hooks/index.ts` — session-start
  reminder fires automatically
- **Task 2**: `opencode.json` created at project root — Archon MCP at
  `http://159.195.45.47:8051/mcp` is now configured
- **Task 3**: `oh-my-opencode.jsonc` updated — `debug_logging: true`, comments added
  explaining the stdio vs remote MCP split
- **Task 4**: `AGENTS.md` Delegation Table updated — `hephaestus` has two explicit
  entries: "Complex implementation" and "Hard debugging (fix)"

## Context References

### Current README.md — Agent architecture section (lines 226-241)

```markdown
## Agent architecture

Agents are registered in TypeScript with explicit model assignments and permission levels.

| Agent | Model | Role | Permissions |
|---|---|---|---|
| Sisyphus | `claude-sonnet-4-6` | Main orchestrator, routing and workflow control | Full |
| Oracle | `claude-opus-4-6` | Read-only architecture consultant for hard decisions | Read-only |
| Metis | `claude-sonnet-4-6` | Pre-planning gap analyzer, finds hidden assumptions | Read-only |
| Momus | `claude-opus-4-6` | Plan quality reviewer, rejects vague plans | Read-only |
| Hephaestus | `gpt-5.3-codex` | Deep autonomous worker for logic-heavy tasks | Full |
| Sisyphus-Junior | `gpt-5.3-codex` | Category-dispatched executor for task() calls | Full (no delegation) |
| Atlas | `glm-5:cloud` | Todo and progress orchestration across sessions | Full (no delegation) |
| Explore | `glm-5:cloud` | Internal codebase grep and pattern discovery | Read-only |
| Librarian | `glm-5:cloud` | External documentation and OSS example search | Read-only |
| Multimodal-Looker | `gemini-3-flash-preview` | PDF, image, and diagram analysis | Vision-only |

Each agent is optimized for a specific job. Routing work to the right agent reduces token waste and improves output consistency. Explore and Librarian are cheap background agents — fire them in parallel for research. Oracle and Momus are expensive — use them for decisions, not grunt work.
```

Note: The current README doesn't explicitly say hephaestus is "unused" — but it doesn't
explain when to use it vs oracle. The agent table row is there but sparse. Update the
prose below the table to mention hephaestus explicitly.

### Current README.md — "How it all connects" section

This section (lines 384+) mentions all hooks and agents. The pipeline-hook description
(line 277) says it "fires at session start" — this was not actually true before the
fix but is now correct. No change needed here — the description was always accurate,
the bug was in the code, not the docs.

### README.md — Quick reference section (lines 666-685)

Current:
```text
Always first:      /prime

Project setup:     /mvp -> /prd -> /pillars -> /decompose

Per feature:
  Plan:            /planning {feature}
  Execute:         /execute .agents/features/{feature}/plan.md   (repeat per task)
  Review:          /code-loop {feature}
  Ship:            /commit  then  /pr

Quality tools:
  /code-review
  /code-review-fix {review.md}
  /final-review
  /system-review
  /council {topic}
```

This is accurate as-is. No change needed.

## What Needs Updating

### Change 1: Agent architecture prose — mention hephaestus routing

The closing paragraph of the Agent architecture section currently says:
> "Explore and Librarian are cheap background agents — fire them in parallel for research.
> Oracle and Momus are expensive — use them for decisions, not grunt work."

This is accurate but incomplete — it doesn't tell the user when to use hephaestus.
Extend with one sentence.

### Change 2: Add a brief "Archon MCP" mention near the hook system or a new integration note

The current README explains Archon is wired throughout but doesn't tell users it's
now configured. Add a short note that `opencode.json` at the project root configures
Archon automatically.

## Patterns to Follow

### Pattern: README prose style

The README uses short, declarative paragraphs. No bullet overload. Each section ends
with a 1-3 sentence summary paragraph. Match this style — no new H3 headers unless
necessary.

Example of the prose style:
> "Each agent is optimized for a specific job. Routing work to the right agent reduces
> token waste and improves output consistency."

### Pattern: No "fixed" or "was broken" language

Don't say "we fixed X" or "this was previously broken." Write as if the system always
worked this way — update the docs to reflect current accurate state, not the history
of getting there.

## Step-by-Step Implementation

### Step 1: Update agent architecture closing paragraph

**CURRENT** (end of agent architecture section, after table):
```markdown
Each agent is optimized for a specific job. Routing work to the right agent reduces token waste and improves output consistency. Explore and Librarian are cheap background agents — fire them in parallel for research. Oracle and Momus are expensive — use them for decisions, not grunt work.
```

**REPLACE WITH**:
```markdown
Each agent is optimized for a specific job. Routing work to the right agent reduces token waste and improves output consistency. Explore and Librarian are cheap background agents — fire them in parallel for research. Oracle and Momus are expensive consultants — use them for decisions, not implementation. Hephaestus is the heavy implementation worker — use it when oracle has diagnosed an issue and actual code changes need to be made, or when a task is too complex for category dispatch alone.
```

### Step 2: Add Archon integration note to the "What it is made of" or hook system section

Find the existing line in the hook system section:
> "`pipeline-hook` fires at session start, reads `next-command.md`, and emits a system
> reminder with the current pipeline state and next suggested command."

After the hook system section's closing `---`, add a brief Archon note. Find the end
of the hook system section and insert before the next `---` divider:

**CURRENT** (end of hook system section):
```markdown
`pipeline-hook` fires at session start, reads `.agents/context/next-command.md`, and emits a system reminder with the current pipeline state and next suggested command.

---
```

**REPLACE WITH**:
```markdown
`pipeline-hook` fires at session start, reads `.agents/context/next-command.md`, and emits a system reminder with the current pipeline state and next suggested command.

### Archon MCP integration

When `opencode.json` is present at the project root with an Archon remote MCP entry,
all commands that call `rag_search_knowledge_base`, `manage_task`, or other Archon tools
connect automatically. No manual setup is required beyond having the file in place.
The Archon endpoint is `http://159.195.45.47:8051/mcp`. All commands degrade gracefully
if Archon is unavailable.

---
```

### Step 3: Verify the two edits landed correctly

```bash
grep -n "Hephaestus is the heavy" README.md
grep -n "Archon MCP integration" README.md
```

Both should return line numbers.

## QA Scenarios

### Scenario 1: Hephaestus routing guidance present
**Tool**: Bash
**Steps**:
1. `grep "Hephaestus is the heavy\|hephaestus.*implementation" README.md`
**Expected**: Returns at least one match in the agent architecture section
**Evidence**: `.agents/features/system-utilization-gaps/evidence/task-5-hephaestus-mention.txt`

### Scenario 2: Archon MCP note present
**Tool**: Bash
**Steps**:
1. `grep -n "Archon MCP integration\|opencode.json" README.md`
**Expected**: Returns line numbers — Archon integration heading and opencode.json mention
**Evidence**: Terminal output

### Scenario 3: No stale "gap" language remains
**Tool**: Bash
**Steps**:
1. `grep -i "unused\|not connected\|never called\|orphaned" README.md`
**Expected**: No matches — no stale audit language in the README
**Evidence**: Terminal output (empty = pass)

### Scenario 4: README line count grew (not shrank)
**Tool**: Bash
**Steps**:
1. `wc -l README.md`
**Expected**: More lines than before (was 767 — should be 780+)
**Evidence**: Terminal output

## Validation Commands

```bash
# L1: Hephaestus mention in agent section
grep -n "Hephaestus is the heavy" README.md

# L2: Archon integration note present
grep -n "Archon MCP integration" README.md

# L3: No stale gap language
grep -ic "unused\|not connected\|never called" README.md

# L4: Line count grew
wc -l README.md
```

## Acceptance Criteria

### Implementation
- [ ] Agent architecture prose mentions hephaestus with routing guidance
- [ ] Archon MCP integration note added to hook system section
- [ ] `opencode.json` referenced in README for Archon configuration
- [ ] No stale "unused" or "not connected" language remains
- [ ] All existing content intact (no deletions)

### Runtime
- [ ] `grep "Hephaestus is the heavy" README.md` returns a match
- [ ] `grep "Archon MCP integration" README.md` returns a match
- [ ] `grep -ic "unused\|not connected\|never called" README.md` returns 0

## Parallelization
- **Wave**: 2 — depends on Tasks 1-4 completing first
- **Can Parallel**: NO — depends on all Wave 1 tasks
- **Blocks**: nothing (final task)
- **Blocked By**: Tasks 1, 2, 3, 4

## Handoff Notes
This is the final task. After completion, run the full validation suite:
```bash
cd .opencode && npm test
cd .opencode && npx tsc --noEmit
grep "createPipelineHook" .opencode/hooks/index.ts
grep "debug_logging.*true" .opencode/oh-my-opencode.jsonc
node -e "JSON.parse(require('fs').readFileSync('opencode.json','utf8')); console.log('opencode.json valid')"
grep "hephaestus" AGENTS.md | grep "→"
```

## Completion Checklist
- [ ] Agent architecture prose updated with hephaestus guidance
- [ ] Archon MCP integration note added
- [ ] Stale language check passes (0 matches)
- [ ] All 5 gap fixes confirmed via grep
- [ ] Full test suite passes
- [ ] Evidence saved
