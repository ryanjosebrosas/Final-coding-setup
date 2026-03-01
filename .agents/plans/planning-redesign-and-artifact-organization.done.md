# Feature: Planning Redesign and Artifact Organization

## Feature Description

Reorganize the `.agents/` directory from flat per-type folders (`plans/`, `reports/`, `reviews/`) to per-feature folders (`.agents/features/{name}/`) so all artifacts for a single feature live together. Standardize the `.done.md` lifecycle across every command that produces artifacts. Add a `planning-research` sub-agent and rewire `/planning` Phase 2 to dispatch three parallel Task agents (research-codebase, research-external, planning-research) so research doesn't consume main context window.

## User Story

As a developer using this AI coding system, I want all artifacts for one feature grouped in a single folder with clear completion markers, so that I can instantly see what's active vs done, and I want planning research offloaded to sub-agents so my main conversation context stays clean.

## Problem Statement

Three problems exist today:

1. **Flat folder chaos**: Plans go to `.agents/plans/`, reports to `.agents/reports/`, reviews to `.agents/reviews/`. When you have 10+ features, finding all artifacts for one feature requires scanning three directories. Files with similar names across directories are easy to confuse.

2. **Inconsistent `.done.md` lifecycle**: `/execute` renames reviews and loop reports to `.done.md`. `/code-loop` renames its own artifacts. `/commit` renames completed artifacts. But `/code-review` doesn't mark anything done, and `/planning` never marks plans as done. The rules are scattered and inconsistent.

3. **Context window bloat during planning**: `/planning` Phase 2 (Explore) runs codebase searches, Archon RAG lookups, and dispatch queries inline in the main conversation. Every file read and search result consumes tokens. The existing `research-codebase` and `research-external` agents exist but aren't wired into `/planning`.

## Solution Statement

- **Decision 1**: Move to `.agents/features/{feature-name}/` as the grouping unit — because all artifacts for one feature belong together, and `ls .agents/features/` gives an instant project overview.
- **Decision 2**: Standardize `.done.md` lifecycle with a clear ownership table — because every artifact should have exactly one command responsible for marking it done.
- **Decision 3**: Create a `planning-research` agent and wire all three research agents into `/planning` Phase 2 via parallel Task tool calls — because Task agents run in their own context window and return only a summary.

## Feature Metadata

- **Feature Type**: Refactor + Enhancement
- **Estimated Complexity**: Medium
- **Primary Systems Affected**: All slash commands (`planning`, `execute`, `code-review`, `code-loop`, `commit`), plan templates (3), AGENTS.md, agent definitions
- **Dependencies**: None (this is the template/framework repo — no runtime code)

### Slice Guardrails (Required)

- **Single Outcome**: All commands write to and read from `.agents/features/{name}/` with standardized `.done.md` lifecycle
- **Expected Files Touched**: 10 files (5 commands, 3 templates, 1 agent, 1 AGENTS.md)
- **Scope Boundary**: Does NOT change the plan content format (7-field tasks, 700-1000 line requirement). Does NOT change how dispatch or council work. Does NOT create the `.agents/features/` directory itself (commands create it on first write).
- **Split Trigger**: If any command modification requires changing the template format (not just paths), split that into a follow-up.

---

## CONTEXT REFERENCES

### Relevant Codebase Files

> IMPORTANT: The execution agent MUST read these files before implementing!

- `.opencode/commands/planning.md` (all 310 lines) — Why: PRIMARY target. Phase 2 research logic needs sub-agent rewiring. Output paths at lines 221-234 need updating.
- `.opencode/commands/execute.md` (all 261 lines) — Why: Report output paths at lines 174-198, completion sweep at lines 188-192, plan input path detection at lines 13-16 and 40-50.
- `.opencode/commands/code-review.md` (all 199 lines) — Why: Review output path at line 179. Currently has NO `.done.md` handling — needs it added.
- `.opencode/commands/code-loop.md` (lines 215-228) — Why: Already has `.done.md` sweep. Output paths at line 217 and checkpoint paths at line 247-249 need updating.
- `.opencode/commands/commit.md` (lines 43-45) — Why: Completion sweep references old paths. Must update to `.agents/features/` scan.
- `.opencode/agents/research-codebase.md` (56 lines) — Why: Existing agent to wire into /planning. Read to understand its output format.
- `.opencode/agents/research-external.md` (53 lines) — Why: Existing agent to wire into /planning. Read to understand its output format.
- `.opencode/templates/STRUCTURED-PLAN-TEMPLATE.md` (line 4) — Why: Contains old save path `.agents/plans/{feature}.md` that needs updating.
- `.opencode/templates/MASTER-PLAN-TEMPLATE.md` — Why: Contains old save paths for master + sub-plan mode.
- `.opencode/templates/SUB-PLAN-TEMPLATE.md` — Why: Contains old save paths for phase plans.
- `AGENTS.md` (lines referencing `.agents/` structure) — Why: Documents the project structure. Must reflect new layout.

### New Files to Create

- `.opencode/agents/planning-research.md` — New sub-agent that orchestrates Archon RAG search + completed plan reference lookup

### Related Memories (from memory.md)

No relevant memories found in memory.md (memory.md does not exist in this repo).

### Relevant Documentation

- [Claude Code Task tool documentation](https://docs.anthropic.com/en/docs/claude-code) — Why: Task tool is the mechanism for sub-agent dispatch; need to verify parallel invocation works as expected.

### Patterns to Follow

**Agent definition pattern** (from `.opencode/agents/research-codebase.md:1-56`):
```markdown
# Research Codebase Agent

Parallel codebase exploration agent. Finds files, extracts patterns, and reports findings.

## Purpose
{one paragraph}

## Capabilities
- **{capability}**: {description}

## Instructions
When invoked:
1. {step}
2. {step}

## Output Format
```
## Findings: {topic}
### Files Found
### Patterns Identified
### Conventions
### Integration Points
### Gotchas
```

## Rules
- {rule}
```
- Why this pattern: All agents follow the same structure (Purpose, Capabilities, Instructions, Output Format, Rules). The new planning-research agent must match this format.
- Common gotchas: Agents are markdown files, not code. They are prompt templates consumed by the Task tool.

**Completion sweep pattern** (from `.opencode/commands/execute.md:188-192`):
```markdown
Completion sweep (required):
- Before finishing `/execute`, rename any same-feature artifacts:
  - `.agents/reviews/{feature}*.md` -> `.agents/reviews/{feature}*.done.md`
  - `.agents/reports/loops/{feature}*.md` -> `.agents/reports/loops/{feature}*.done.md`
- Never leave a completed same-feature review/loop artifact without the `.done.md` suffix.
```
- Why this pattern: This is the existing convention. We need to generalize it from specific paths to the per-feature folder pattern.
- Common gotchas: The sweep uses glob patterns with feature name prefix. In the new structure, the feature folder IS the grouping, so the sweep is simpler.

**Sub-agent dispatch pattern** (implicit from `/planning` Phase 2 and `/build`):
```markdown
Phase 2 currently does research inline:
- Archon RAG: `rag_search_knowledge_base(query="...", match_count=5)`
- Codebase: Glob/Grep/Read for patterns
- Dispatch: tiered research queries

Phase 2 should instead:
- Launch 3 parallel Task agents
- Collect summaries
- Continue design with summaries only (no raw search results in main context)
```
- Why this pattern: Task tool agents run in their own context. Only the final summary returns to the main conversation.
- Common gotchas: Task agents can't communicate with each other. Each must be self-contained with a clear prompt.

---

## IMPLEMENTATION PLAN

### Phase 1: Foundation — New Agent + Folder Structure Rules

Create the new planning-research agent. Define the canonical folder structure and `.done.md` lifecycle rules that all other tasks reference.

**Tasks:**
- Create `planning-research.md` agent
- Update AGENTS.md to document new `.agents/features/` structure

### Phase 2: Core — Update All Commands

Update every command that writes to or reads from `.agents/` to use the new per-feature folder structure and consistent `.done.md` lifecycle.

**Tasks:**
- Update `/planning` command (Phase 2 rewiring + output paths)
- Update `/execute` command (input paths + report paths + completion sweep)
- Update `/code-review` command (output path + add `.done.md` handling)
- Update `/code-loop` command (all artifact paths)
- Update `/commit` command (completion sweep paths)

### Phase 3: Integration — Update Templates

Update all plan templates to reference new save paths.

**Tasks:**
- Update STRUCTURED-PLAN-TEMPLATE.md
- Update MASTER-PLAN-TEMPLATE.md
- Update SUB-PLAN-TEMPLATE.md

### Phase 4: Validation

Manual verification of all changes for consistency.

---

## STEP-BY-STEP TASKS

### Task 1: CREATE `.opencode/agents/planning-research.md`

- **ACTION**: CREATE
- **TARGET**: `.opencode/agents/planning-research.md`
- **IMPLEMENT**: Create a new sub-agent following the agent pattern from `research-codebase.md`. The agent's purpose is to:
  1. Search Archon RAG knowledge base for architecture patterns and code examples relevant to the planning topic
  2. Scan `.agents/features/*/plan.done.md` files to find completed plans with similar patterns, structure, or technologies
  3. Return a structured research summary combining RAG findings + plan references

  Content:

  ```markdown
  # Planning Research Agent

  Knowledge base search and completed plan reference agent for `/planning`.

  ## Purpose

  Search the Archon RAG knowledge base and scan completed plans in `.agents/features/` to provide
  research context for planning sessions. Returns structured findings that inform plan design
  without consuming main conversation context.

  ## Capabilities

  - **RAG knowledge search**: Query Archon RAG for architecture patterns, code examples, and best practices
  - **Completed plan mining**: Scan `.agents/features/*/plan.done.md` for reusable patterns, task structures, and lessons learned
  - **Pattern synthesis**: Combine RAG and plan findings into actionable planning context

  ## Instructions

  When invoked with a feature description:

  1. **Search Archon RAG** (if available):
     - `rag_search_knowledge_base(query="{2-5 keyword query}", match_count=5)` for architecture patterns
     - `rag_search_code_examples(query="{2-5 keyword query}", match_count=3)` for similar implementations
     - Read top hits in full with `rag_read_full_page()` for detailed context
     - If Archon unavailable, skip this step and note "RAG not available"

  2. **Scan completed plans**:
     - Use Glob to find `.agents/features/*/plan.done.md` files
     - Read each completed plan's Feature Description, Solution Statement, and Patterns to Follow sections
     - Identify plans that share similar technologies, patterns, or architectural concerns
     - Extract reusable task structures and lessons from Notes sections

  3. **Synthesize findings**:
     - Combine RAG results with plan references
     - Prioritize findings most relevant to the current feature
     - Flag any conflicting patterns between RAG docs and actual plan implementations

  ## Output Format

  ```
  ## Planning Research: {feature topic}

  ### RAG Findings
  - **{Pattern/topic}**: {summary} (Source: {url or document title})
  - **{Pattern/topic}**: {summary} (Source: {url or document title})
  - (If no RAG available: "Archon RAG not connected")

  ### Completed Plan References
  - **{feature-name}/plan.done.md**: {what's relevant — patterns used, lessons noted}
  - **{feature-name}/plan.done.md**: {what's relevant}
  - (If no completed plans found: "No completed plans in .agents/features/")

  ### Recommended Patterns
  - {Pattern to follow with source reference}
  - {Pattern to follow with source reference}

  ### Warnings
  - {Any conflicts, deprecated patterns, or lessons from past plans}
  ```

  ## Rules

  - Never modify files — this is a read-only research agent
  - Keep RAG queries SHORT (2-5 keywords) for best vector search results
  - Only reference completed plans (`.done.md`) — active plans are in-progress and unreliable
  - If both RAG and completed plans are empty, return "No prior research available" — don't fabricate
  - Always cite sources (RAG page URLs or plan file paths)
  ```

- **PATTERN**: Follow agent structure from `.opencode/agents/research-codebase.md:1-56` — same sections (Purpose, Capabilities, Instructions, Output Format, Rules)
- **IMPORTS**: N/A (markdown file, not code)
- **GOTCHA**: The output format uses nested markdown fences. Make sure the agent file itself uses proper escaping or indentation so the fences don't break.
- **VALIDATE**: Verify file exists and follows the agent pattern: `head -5 .opencode/agents/planning-research.md` should show `# Planning Research Agent`

---

### Task 2: UPDATE `AGENTS.md` — Document New Structure

- **ACTION**: UPDATE
- **TARGET**: `AGENTS.md`
- **IMPLEMENT**: Replace the `.agents/` directory description in the "Project Structure" section.

  **Current** (in the `### Dynamic Content` section):
  ```markdown
  ### Dynamic Content (`.agents/`)
  All generated/dynamic content lives at project root:
  - `.agents/plans/` — Feature plans from `/planning`
  - `.agents/reviews/` — Code reviews from `/code-review`
  - `.agents/reports/` — Execution reports from `/execute`
  - `.agents/reports/system-reviews/` — System reviews from `/system-review`
  - `.agents/specs/` — BUILD_ORDER, PILLARS, build-state.json
  - `.agents/context/` — Session context
  ```

  **Replace with**:
  ```markdown
  ### Dynamic Content (`.agents/`)
  All generated/dynamic content lives at project root:
  - `.agents/features/{name}/` — All artifacts for one feature (plan, report, review, loop reports)
    - `plan.md` / `plan.done.md` — Feature plan (marked done after execution)
    - `plan-master.md` — Master plan for multi-phase features
    - `plan-phase-{N}.md` — Sub-plans for each phase
    - `report.md` / `report.done.md` — Execution report (marked done after commit)
    - `review.md` / `review.done.md` — Code review (marked done when addressed)
    - `review-{N}.md` — Numbered reviews from `/code-loop` iterations
    - `loop-report-{N}.md` — Loop iteration reports
    - `checkpoint-{N}.md` — Loop checkpoints
    - `fixes-{N}.md` — Fix plans from `/code-loop`
  - `.agents/specs/` — BUILD_ORDER, PILLARS, build-state.json
  - `.agents/context/` — Session context

  #### `.done.md` Lifecycle

  | Artifact | Created by | Marked `.done.md` by | Trigger |
  |----------|-----------|---------------------|---------|
  | `plan.md` | `/planning` | `/execute` | All plan tasks completed |
  | `plan-master.md` | `/planning` | `/execute` | All phases completed |
  | `plan-phase-{N}.md` | `/planning` | `/execute` | Phase fully executed |
  | `report.md` | `/execute` | `/commit` | Changes committed to git |
  | `review.md` | `/code-review` | `/commit` or `/code-loop` | All findings addressed |
  | `review-{N}.md` | `/code-loop` | `/code-loop` | Clean exit |
  | `loop-report-{N}.md` | `/code-loop` | `/code-loop` | Clean exit |
  | `fixes-{N}.md` | `/code-loop` | `/code-loop` | Fixes fully applied |
  ```

- **PATTERN**: Follow existing AGENTS.md structure (`.opencode/` section uses the same bullet + dash format)
- **IMPORTS**: N/A
- **GOTCHA**: AGENTS.md is the root configuration file loaded by the AI system. Changes here affect how every session understands the project. Keep the table format clean.
- **VALIDATE**: Read `AGENTS.md` and verify the `.agents/features/` section is present and the lifecycle table is complete.

---

### Task 3: UPDATE `.opencode/commands/planning.md` — Sub-Agent Research + New Output Paths

- **ACTION**: UPDATE
- **TARGET**: `.opencode/commands/planning.md`
- **IMPLEMENT**: Two changes to this file:

  **Change 3a — Phase 2 sub-agent dispatch:**

  **Current** (lines 82-121):
  ```markdown
  ## Phase 2: Explore (Codebase Intelligence)

  Once the direction is clear, explore both the codebase and available knowledge:

  **2a. Archon RAG Knowledge Base (if available):**
  If Archon MCP is connected:
  - `rag_search_knowledge_base(query="...", match_count=5)` — architecture patterns
  - `rag_search_code_examples(query="...", match_count=3)` — similar implementations
  - Keep queries SHORT (2-5 keywords) for best vector search results
  - Read top hits in full for detailed context

  **2b. Codebase exploration:**
  1. **Find relevant files** — patterns to follow, code to integrate with
  2. **Check existing patterns** — naming, error handling, testing conventions
  3. **Map integration points** — what files need to change, what's new
  4. **Identify gotchas** — from `memory.md`, prior specs, or codebase inspection

  **2c. Pillar research context (if pillar file exists):**
  If the spec has a pillar ID and a matching pillar file was found in Phase 1:
  - Read the Research Findings section — these are pre-researched RAG results and council feedback
    specific to this pillar's domain
  - Read the PRD Coverage table — see which PRD requirements this spec covers
  - Read the Dependency Verification — see cross-pillar dependencies
  - Use these findings as starting context — don't re-research what /decompose already found
  - Focus /planning research on implementation details, not architectural gaps (those were caught in /decompose)

  Share findings as you go:
  - "Found this pattern in `file.py:42` — we should follow it."
  - "There's a gotcha here — `deps.py` uses lazy init, we need to match that."

  **Dispatch for research** (when local exploration isn't enough, and dispatch is available):

  | Need | Tier | Approach |
  |------|------|----------|
  | Quick factual check | T1 | Dispatch quick-check |
  | API/pattern question | T1 | Dispatch api-analysis |
  | Library comparison | T2 | Dispatch research |
  | Documentation lookup | T1 | Dispatch docs-lookup |

  If dispatch unavailable, use Archon RAG or web search.
  ```

  **Replace with**:
  ```markdown
  ## Phase 2: Explore (Sub-Agent Research)

  Once the direction is clear, offload research to sub-agents running in parallel. This keeps the main conversation context clean — only research summaries come back, not raw search results.

  ### 2a. Pillar context (inline — read directly, small and pre-curated):
  If the spec has a pillar ID and a matching pillar file was found in Phase 1:
  - Read the Research Findings section — pre-researched RAG results and council feedback
  - Read the PRD Coverage table — which PRD requirements this spec covers
  - Read the Dependency Verification — cross-pillar dependencies
  - Use these as starting context — don't re-research what /decompose already found

  ### 2b. Launch parallel research agents:

  Launch ALL three agents in a single message (parallel Task tool calls). Each runs in its own context and returns a summary.

  **Agent 1: research-codebase** (Task tool, subagent_type: "explore")
  ```
  Prompt: "Thorough exploration for planning context.

  Feature: {feature description from Phase 1}
  
  Find:
  1. Files with patterns we should follow for this feature
  2. Integration points — where new code connects to existing code  
  3. Naming conventions, error handling patterns, testing patterns
  4. Gotchas from the codebase (inconsistencies, non-obvious behavior)
  
  Return: structured findings with exact file:line references."
  ```

  **Agent 2: research-external** (Task tool, subagent_type: "explore")
  ```
  Prompt: "Research external documentation and best practices.

  Feature: {feature description}
  Technologies: {languages, frameworks, libraries involved}
  
  Find:
  1. Official documentation for relevant APIs
  2. Best practices and recommended patterns
  3. Version compatibility notes
  4. Common pitfalls in the documentation
  
  Use Archon RAG first (rag_search_knowledge_base, rag_search_code_examples with 2-5 keyword queries).
  If RAG unavailable, use WebFetch for official docs.
  
  Return: findings with source URLs/citations."
  ```

  **Agent 3: planning-research** (Task tool, subagent_type: "explore")
  ```
  Prompt: "Search for planning context from knowledge base and completed plans.

  Feature: {feature description}
  
  Find:
  1. Archon RAG: architecture patterns and code examples (2-5 keyword queries)
  2. Completed plans: scan .agents/features/*/plan.done.md for similar features
  3. Lessons and patterns from past implementations
  
  Return: structured findings with sources."
  ```

  ### 2c. Collect and share findings:

  When all three agents return:
  1. Read each agent's summary
  2. Share key findings with the user: "Research found these patterns..." / "Past plan for {X} used this approach..."
  3. Merge findings into the working context for Phase 3

  **Fallback**: If Task tool is unavailable, do research inline (original behavior). The agents' prompts above serve as a checklist for what to cover.

  ### 2d. Dispatch for deep research (optional, when agents aren't enough):

  | Need | Tier | Approach |
  |------|------|----------|
  | Quick factual check | T1 | Dispatch quick-check |
  | API/pattern question | T1 | Dispatch api-analysis |
  | Library comparison | T2 | Dispatch research |
  | Documentation lookup | T1 | Dispatch docs-lookup |

  If dispatch unavailable, use Archon RAG or web search.
  ```

  **Change 3b — Output paths:**

  **Current** (lines 221-271):
  ```markdown
  ## Output

  **Single Plan Mode:**
  ```
  .agents/plans/{feature}.md
  ```

  **Master + Sub-Plan Mode:**
  ```
  .agents/plans/{feature}-master.md
  .agents/plans/{feature}-phase-1.md
  .agents/plans/{feature}-phase-2.md
  ...
  ```

  ### Archon Task Sync (if connected)

  After writing the plan, sync to Archon:
  1. Call `list_projects()` to find or create project for this codebase
  2. Call `manage_task("create", ...)` for each task in the plan
  3. Store Archon task IDs in plan metadata for `/execute` to update

  ---

  ## After Writing

  **Single Plan Mode:**
  ```
  Plan written: .agents/plans/{feature}.md
  Tasks: {N} tasks across {phases} phases
  Pillar: {N} — {name} (from {pillar-file-path})   <- omit if no pillar context
  PRD requirements covered: {list from pillar file PRD Coverage}   <- omit if no pillar context
  Confidence: {X}/10 for one-pass success
  Key risk: {top risk}
  Archon: {synced N tasks / not connected}

  Next: /execute .agents/plans/{feature}.md
  ```

  **Master + Sub-Plan Mode:**
  ```
  Master plan: .agents/plans/{feature}-master.md
  Sub-plans:   .agents/plans/{feature}-phase-1.md
               .agents/plans/{feature}-phase-2.md
               .agents/plans/{feature}-phase-3.md
  Total:       {N} tasks across {M} phases
  Confidence:  {X}/10 for one-pass success
  Key risk:    {top risk}
  Archon:      {synced N tasks / not connected}

  Next: /execute .agents/plans/{feature}-master.md
  ```
  ```

  **Replace with**:
  ```markdown
  ## Output

  Create the feature directory if it doesn't exist: `.agents/features/{feature}/`

  **Single Plan Mode:**
  ```
  .agents/features/{feature}/plan.md
  ```

  **Master + Sub-Plan Mode:**
  ```
  .agents/features/{feature}/plan-master.md
  .agents/features/{feature}/plan-phase-1.md
  .agents/features/{feature}/plan-phase-2.md
  ...
  ```

  ### Archon Task Sync (if connected)

  After writing the plan, sync to Archon:
  1. Call `list_projects()` to find or create project for this codebase
  2. Call `manage_task("create", ...)` for each task in the plan
  3. Store Archon task IDs in plan metadata for `/execute` to update

  ---

  ## After Writing

  **Single Plan Mode:**
  ```
  Plan written: .agents/features/{feature}/plan.md
  Tasks: {N} tasks across {phases} phases
  Pillar: {N} — {name} (from {pillar-file-path})   <- omit if no pillar context
  PRD requirements covered: {list from pillar file PRD Coverage}   <- omit if no pillar context
  Confidence: {X}/10 for one-pass success
  Key risk: {top risk}
  Archon: {synced N tasks / not connected}

  Next: /execute .agents/features/{feature}/plan.md
  ```

  **Master + Sub-Plan Mode:**
  ```
  Master plan: .agents/features/{feature}/plan-master.md
  Sub-plans:   .agents/features/{feature}/plan-phase-1.md
               .agents/features/{feature}/plan-phase-2.md
               .agents/features/{feature}/plan-phase-3.md
  Total:       {N} tasks across {M} phases
  Confidence:  {X}/10 for one-pass success
  Key risk:    {top risk}
  Archon:      {synced N tasks / not connected}

  Next: /execute .agents/features/{feature}/plan-master.md
  ```
  ```

- **PATTERN**: Follows existing `/planning` command structure. Sub-agent prompts follow the pattern used by `/build` for dispatch.
- **IMPORTS**: N/A
- **GOTCHA**: The three Task agents must be launched in a SINGLE message with three tool calls (parallel, not sequential). If you launch them sequentially, you lose the context-saving benefit. Also: pillar context stays inline because pillar files are small and pre-curated — no need to offload.
- **VALIDATE**: Read `planning.md` and verify: (1) Phase 2 contains "Sub-Agent Research" heading, (2) Three agent prompts are present, (3) Output paths use `.agents/features/{feature}/plan.md`.

---

### Task 4: UPDATE `.opencode/commands/execute.md` — New Paths + Completion Sweep

- **ACTION**: UPDATE
- **TARGET**: `.opencode/commands/execute.md`
- **IMPLEMENT**: Four changes:

  **Change 4a — Hard Entry Gate (line 13):**

  **Current**:
  ```markdown
  1. Verify `$ARGUMENTS` is provided and points to an existing markdown file under `.agents/plans/`.
  ```

  **Replace with**:
  ```markdown
  1. Verify `$ARGUMENTS` is provided and points to an existing markdown file under `.agents/features/`.
  ```

  **Change 4b — Master plan detection (line 44):**

  **Current**:
  ```markdown
  **If file path contains `-master.md`**: Extract phase sub-plan paths from the SUB-PLAN INDEX table at the bottom of the master plan. Report: "Detected master plan with N phases." Proceed to Series Mode (Step 2.5).
  ```

  **Replace with**:
  ```markdown
  **If file path contains `plan-master.md`**: Extract phase sub-plan paths from the SUB-PLAN INDEX table at the bottom of the master plan. Report: "Detected master plan with N phases." Proceed to Series Mode (Step 2.5).
  ```

  **Change 4c — Feature name derivation (lines 56-58):**

  **Current**:
  ```markdown
  - **Derive feature name** from the plan path: strip directory prefix and `.md` suffix.
    Example: `.agents/plans/user-auth.md` -> `user-auth`. For plan series: `.agents/plans/big-feature-master.md` -> `big-feature`.
    Store this — you'll use it when saving the execution report.
  ```

  **Replace with**:
  ```markdown
  - **Derive feature name** from the plan path: extract the feature directory name from `.agents/features/{feature}/`.
    Example: `.agents/features/user-auth/plan.md` -> `user-auth`. For plan series: `.agents/features/big-feature/plan-master.md` -> `big-feature`.
    Store this — you'll use it for all artifact paths within `.agents/features/{feature}/`.
  ```

  **Change 4d — Report path + completion sweep (lines 174-198):**

  **Current**:
  ```markdown
  ### 6.6. Execution Report

  After successful execution, save the execution report using the template:
  - **Template**: `.opencode/templates/EXECUTION-REPORT-TEMPLATE.md`
  - **Path**: `.agents/reports/{feature}-report.md`

  **Required sections:**
  - Meta Information (plan file, files added/modified, lines changed)
  - Completed Tasks (count/total with status)
  - Divergences from Plan (with Good/Bad classification + root cause for each)
  - Skipped Items (what from plan was not implemented + why)
  - Validation Results (L1-L5 pass/fail with output)
  - Tests Added (files created, pass/fail status)
  - Issues & Notes (challenges, recommendations)
  - Ready for Commit (yes/no + blockers)

  Completion sweep (required):
  - Before finishing `/execute`, rename any same-feature artifacts:
    - `.agents/reviews/{feature}*.md` -> `.agents/reviews/{feature}*.done.md`
    - `.agents/reports/loops/{feature}*.md` -> `.agents/reports/loops/{feature}*.done.md`
  - Never leave a completed same-feature review/loop artifact without the `.done.md` suffix.

  ## Output Report

  Save this report to: `.agents/reports/{feature}-report.md`

  Use the feature name derived in Step 1. Create the `.agents/reports/` directory if it doesn't exist.
  ```

  **Replace with**:
  ```markdown
  ### 6.6. Execution Report

  After successful execution, save the execution report using the template:
  - **Template**: `.opencode/templates/EXECUTION-REPORT-TEMPLATE.md`
  - **Path**: `.agents/features/{feature}/report.md`

  **Required sections:**
  - Meta Information (plan file, files added/modified, lines changed)
  - Completed Tasks (count/total with status)
  - Divergences from Plan (with Good/Bad classification + root cause for each)
  - Skipped Items (what from plan was not implemented + why)
  - Validation Results (L1-L5 pass/fail with output)
  - Tests Added (files created, pass/fail status)
  - Issues & Notes (challenges, recommendations)
  - Ready for Commit (yes/no + blockers)

  Completion sweep (required):
  - Before finishing `/execute`, rename completed artifacts within `.agents/features/{feature}/`:
    - `plan.md` -> `plan.done.md` (plan fully executed)
    - `plan-phase-{N}.md` -> `plan-phase-{N}.done.md` (for each completed phase)
    - `plan-master.md` -> `plan-master.done.md` (only when ALL phases are done)
    - `review.md` -> `review.done.md` (if a review exists and all findings were addressed)
    - `review-{N}.md` -> `review-{N}.done.md` (code-loop reviews)
    - `loop-report-{N}.md` -> `loop-report-{N}.done.md` (code-loop reports)
  - Never leave a completed artifact without the `.done.md` suffix.

  ## Output Report

  Save this report to: `.agents/features/{feature}/report.md`

  Use the feature name derived in Step 1. Create the `.agents/features/{feature}/` directory if it doesn't exist.
  ```

  **Change 4e — Index update (lines 166-171):**

  **Current**:
  ```markdown
  ### 6.5 Update .agents Index (if present)

  If `.agents/INDEX.md` exists, update plan status entry:
  - Mark executed plan as done with strike + done tag:
    - `[done] ~~{plan-filename}~~`
  - Add reference to execution report path on the same line.
  - Do not create `.agents/INDEX.md` if it does not exist.
  ```

  **Replace with**:
  ```markdown
  ### 6.5 Update .agents Index (if present)

  If `.agents/INDEX.md` exists, update plan status entry:
  - Mark executed plan as done with strike + done tag:
    - `[done] ~~{feature}/plan.md~~`
  - Add reference to execution report path: `.agents/features/{feature}/report.md`
  - Do not create `.agents/INDEX.md` if it does not exist.
  ```

- **PATTERN**: Follows existing execute.md completion sweep convention (lines 188-192)
- **IMPORTS**: N/A
- **GOTCHA**: The plan input path at line 13 (`$ARGUMENTS`) now points to `.agents/features/` not `.agents/plans/`. Old plans in `.agents/plans/` would be rejected — this is intentional (clean break for the template repo).
- **VALIDATE**: Read `execute.md` and verify: (1) Entry gate references `.agents/features/`, (2) Report saves to `.agents/features/{feature}/report.md`, (3) Completion sweep renames within the feature folder.

---

### Task 5: UPDATE `.opencode/commands/code-review.md` — New Output Path + `.done.md` Handling

- **ACTION**: UPDATE
- **TARGET**: `.opencode/commands/code-review.md`
- **IMPLEMENT**: Two changes:

  **Change 5a — Output path (line 179):**

  **Current**:
  ```markdown
  **Output file**: Save review to `.agents/reviews/{feature}-review.md`
  ```

  **Replace with**:
  ```markdown
  **Output file**: Save review to `.agents/features/{feature}/review.md`
  Create the `.agents/features/{feature}/` directory if it doesn't exist.
  Derive `{feature}` from the most relevant context: if reviewing changes from a plan execution, use the plan's feature name. If reviewing standalone changes, derive from the primary file's module/directory name.
  ```

  **Change 5b — Add `.done.md` note to the Notes section at the end (after line 199):**

  Append after the existing Notes section:

  ```markdown

  ### `.done.md` Lifecycle

  `/code-review` does NOT mark its own output as done. The review is marked `.done.md` by:
  - `/commit` — when committing changes that address the review findings
  - `/code-loop` — when the loop exits clean after all findings are addressed

  This is intentional: a review is only "done" when its findings are acted upon, not when the review is written.
  ```

- **PATTERN**: Follows the same `.done.md` convention from `/execute` (completion sweep marks done, not the creating command)
- **IMPORTS**: N/A
- **GOTCHA**: Feature name derivation is ambiguous for `/code-review` since it can review any changes (not just plan-bound ones). The implementation should use the most specific context available — plan feature name if in a loop, or directory name if standalone.
- **VALIDATE**: Read `code-review.md` and verify: (1) Output path is `.agents/features/{feature}/review.md`, (2) `.done.md` lifecycle section exists at the end.

---

### Task 6: UPDATE `.opencode/commands/code-loop.md` — New Artifact Paths

- **ACTION**: UPDATE
- **TARGET**: `.opencode/commands/code-loop.md`
- **IMPLEMENT**: Update all artifact paths from the old flat structure to per-feature folders. Specific changes:

  **Change 6a — Working filename (line 217):**

  **Current**:
  ```markdown
  Working filename: `.agents/reports/loops/{feature}-loop-report-{N}.md`
  ```

  **Replace with**:
  ```markdown
  Working filename: `.agents/features/{feature}/loop-report-{N}.md`
  ```

  **Change 6b — Completion sweep renames (lines 224-227):**

  **Current**:
  ```markdown
    1. Rename the loop report: `{feature}-loop-report-{N}.md` -> `{feature}-loop-report-{N}.done.md`
    2. Rename the last review file: `{feature}-review-{N}.md` -> `{feature}-review-{N}.done.md`
    3. Rename any fix plan artifacts that were fully applied: `.md` -> `.done.md`
  ```

  **Replace with**:
  ```markdown
    1. Rename the loop report: `.agents/features/{feature}/loop-report-{N}.md` -> `.agents/features/{feature}/loop-report-{N}.done.md`
    2. Rename the last review file: `.agents/features/{feature}/review-{N}.md` -> `.agents/features/{feature}/review-{N}.done.md`
    3. Rename any fix plan artifacts that were fully applied: `.agents/features/{feature}/fixes-{N}.md` -> `.agents/features/{feature}/fixes-{N}.done.md`
  ```

  **Change 6c — Checkpoint paths (lines 247-249):**

  **Current**:
  ```markdown
  - `.agents/reports/loops/{feature}-checkpoint-1.md` — Iteration 1 progress
  - ...
  - **If interrupted:** `.agents/reports/loops/{feature}-interrupted-{N}.md` — Resume point
  ```

  **Replace with**:
  ```markdown
  - `.agents/features/{feature}/checkpoint-1.md` — Iteration 1 progress
  - ...
  - **If interrupted:** `.agents/features/{feature}/interrupted-{N}.md` — Resume point
  ```

  Also update any other path references found in the file (review output paths, fix plan paths) to use `.agents/features/{feature}/` prefix.

- **PATTERN**: Same per-feature grouping as all other commands
- **IMPORTS**: N/A
- **GOTCHA**: `/code-loop` generates the most artifacts of any command (loop reports, checkpoints, reviews, fix plans). Make sure ALL paths are updated, not just the ones listed above. Do a full scan of the file.
- **VALIDATE**: Grep `code-loop.md` for `.agents/reports/` and `.agents/reviews/` — should find zero matches. All paths should use `.agents/features/`.

---

### Task 7: UPDATE `.opencode/commands/commit.md` — New Completion Sweep Paths

- **ACTION**: UPDATE
- **TARGET**: `.opencode/commands/commit.md`
- **IMPLEMENT**:

  **Current** (lines 43-45):
  ```markdown
  Before staging, run artifact completion sweep (required):
  - For completed artifacts in `.agents/plans/`, `.agents/reviews/`, and `.agents/reports/`, rename `.md` -> `.done.md`.
  - Keep filenames as the source of completion status; do not rely on title edits.
  ```

  **Replace with**:
  ```markdown
  Before staging, run artifact completion sweep (required):
  - Scan `.agents/features/*/` for completed artifacts and rename `.md` -> `.done.md`:
    - `report.md` -> `report.done.md` (execution report — commit means it's final)
    - `review.md` -> `review.done.md` (if all findings were addressed in this commit)
    - Any other active artifacts that are fully resolved
  - Keep filenames as the source of completion status; do not rely on title edits.
  - Only rename artifacts in feature folders relevant to this commit's changes.
  ```

- **PATTERN**: Same `.done.md` lifecycle as `/execute` completion sweep
- **IMPORTS**: N/A
- **GOTCHA**: `/commit` should only sweep features relevant to the current commit, not ALL features. Derive relevant features from the git diff file paths or from the execution context.
- **VALIDATE**: Read `commit.md` and verify the sweep references `.agents/features/*/`.

---

### Task 8: UPDATE `.opencode/templates/STRUCTURED-PLAN-TEMPLATE.md` — New Save Path

- **ACTION**: UPDATE
- **TARGET**: `.opencode/templates/STRUCTURED-PLAN-TEMPLATE.md`
- **IMPLEMENT**:

  **Current** (line 4):
  ```markdown
  > Save to `.agents/plans/{feature}.md` and fill in every section.
  ```

  **Replace with**:
  ```markdown
  > Save to `.agents/features/{feature}/plan.md` and fill in every section.
  ```

- **PATTERN**: Consistent with new `/planning` output paths
- **IMPORTS**: N/A
- **GOTCHA**: This is the template header comment — it's instructional, not functional. But it guides anyone manually using the template.
- **VALIDATE**: `head -5 .opencode/templates/STRUCTURED-PLAN-TEMPLATE.md` should show the new path.

---

### Task 9: UPDATE `.opencode/templates/MASTER-PLAN-TEMPLATE.md` — New Save Path

- **ACTION**: UPDATE
- **TARGET**: `.opencode/templates/MASTER-PLAN-TEMPLATE.md`
- **IMPLEMENT**: Find the save path instruction in the template header and update:

  **Current**: Any reference to `.agents/plans/{feature}-master.md`

  **Replace with**: `.agents/features/{feature}/plan-master.md`

  Also update any sub-plan path references from `.agents/plans/{feature}-phase-{N}.md` to `.agents/features/{feature}/plan-phase-{N}.md`.

- **PATTERN**: Consistent with new `/planning` output paths
- **IMPORTS**: N/A
- **GOTCHA**: The master template may reference sub-plan paths in its SUB-PLAN INDEX section. Update those too.
- **VALIDATE**: Grep the file for `.agents/plans/` — should find zero matches.

---

### Task 10: UPDATE `.opencode/templates/SUB-PLAN-TEMPLATE.md` — New Save Path

- **ACTION**: UPDATE
- **TARGET**: `.opencode/templates/SUB-PLAN-TEMPLATE.md`
- **IMPLEMENT**: Find the save path instruction and update:

  **Current**: Any reference to `.agents/plans/{feature}-phase-{N}.md`

  **Replace with**: `.agents/features/{feature}/plan-phase-{N}.md`

  Also update any master plan path references from `.agents/plans/{feature}-master.md` to `.agents/features/{feature}/plan-master.md`.

- **PATTERN**: Consistent with new `/planning` output paths
- **IMPORTS**: N/A
- **GOTCHA**: The sub-plan template references the master plan and "prior phase" paths. All path references need updating.
- **VALIDATE**: Grep the file for `.agents/plans/` — should find zero matches.

---

### Task 11: UPDATE `.opencode/skills/planning-methodology/SKILL.md` — New Save Path

- **ACTION**: UPDATE
- **TARGET**: `.opencode/skills/planning-methodology/SKILL.md`
- **IMPLEMENT**: Update the output path reference:

  **Current**:
  ```markdown
  Save to: `.agents/plans/{feature}.md`
  (For master plans: `.agents/plans/{feature}-master.md` + `.agents/plans/{feature}-phase-{N}.md`)
  ```

  **Replace with**:
  ```markdown
  Save to: `.agents/features/{feature}/plan.md`
  (For master plans: `.agents/features/{feature}/plan-master.md` + `.agents/features/{feature}/plan-phase-{N}.md`)
  ```

- **PATTERN**: Consistent with all other path updates
- **IMPORTS**: N/A
- **GOTCHA**: The skill file is loaded on-demand by the planning-methodology skill loader. It needs to be consistent with the command file.
- **VALIDATE**: Grep `SKILL.md` for `.agents/plans/` — should find zero matches.

---

### Task 12: VERIFY — Full Consistency Check

- **ACTION**: VERIFY
- **TARGET**: All modified files
- **IMPLEMENT**: Run a comprehensive consistency check:

  1. Grep the entire `.opencode/` directory for `.agents/plans/` — should find zero matches (all replaced with `.agents/features/`)
  2. Grep the entire `.opencode/` directory for `.agents/reports/` — should find zero matches (except system-reviews if that still uses old path)
  3. Grep the entire `.opencode/` directory for `.agents/reviews/` — should find zero matches
  4. Grep for `.agents/features/` — should find matches in all 10 modified files
  5. Verify the new planning-research agent exists and follows the agent pattern
  6. Verify AGENTS.md contains the lifecycle table
  7. Read each modified command file's output/path section to confirm consistency

- **PATTERN**: N/A (verification task)
- **IMPORTS**: N/A
- **GOTCHA**: There may be other files referencing old paths (e.g., `system-review` command, `build` command, `decompose` command). This task should flag any missed references, but those are out of scope for this slice (follow-up if found).
- **VALIDATE**: All greps return expected results. No old paths remain in modified files.

---

## TESTING STRATEGY

### Unit Tests

N/A — these are markdown configuration files, not code. No test runner applies.

### Integration Tests

N/A — configuration files tested via manual verification.

### Edge Cases

- **Edge case 1**: Feature name with special characters or spaces. Mitigation: feature names should be kebab-case (e.g., `auth-system`, `user-metrics`). Document this convention.
- **Edge case 2**: Multi-phase plan where only some phases are done. Mitigation: each phase file gets `.done.md` independently; master only gets `.done.md` when ALL phases are done.
- **Edge case 3**: `/code-review` run standalone (not from a plan). Mitigation: derive feature name from file module/directory name when no plan context exists.
- **Edge case 4**: Old plans in `.agents/plans/` from other repos using this system. Mitigation: this is a template repo — no old plans exist. For existing repos that adopt this change, a one-time migration script could be provided (out of scope for this slice).

---

## VALIDATION COMMANDS

### Level 1: Syntax & Style
```bash
# Verify all markdown files are valid (no broken fences, no syntax errors)
# Manual check: open each modified file and scan for formatting issues
```

### Level 2: Type Safety
```
N/A — markdown files, no type system
```

### Level 3: Unit Tests
```
N/A — no test runner for markdown configurations
```

### Level 4: Integration Tests
```
N/A — manual verification only
```

### Level 5: Manual Validation

1. Read `AGENTS.md` — verify `.agents/features/` structure is documented with lifecycle table
2. Read `planning.md` — verify Phase 2 has sub-agent dispatch and output paths use `.agents/features/`
3. Read `execute.md` — verify entry gate, report path, and completion sweep use `.agents/features/`
4. Read `code-review.md` — verify output path and `.done.md` lifecycle documentation
5. Read `code-loop.md` — verify all artifact paths use `.agents/features/`
6. Read `commit.md` — verify completion sweep references `.agents/features/`
7. Read all three templates — verify save paths use `.agents/features/`
8. Read `SKILL.md` — verify output path uses `.agents/features/`
9. Read `planning-research.md` — verify it follows agent pattern and references correct paths
10. Grep `.opencode/` for `.agents/plans/`, `.agents/reports/`, `.agents/reviews/` — should find zero matches in modified files

### Level 6: Additional Validation

```bash
# Grep for old paths across all commands and templates
grep -r ".agents/plans/" .opencode/commands/ .opencode/templates/ .opencode/skills/
grep -r ".agents/reports/" .opencode/commands/ .opencode/templates/ .opencode/skills/
grep -r ".agents/reviews/" .opencode/commands/ .opencode/templates/ .opencode/skills/
# All three should return empty (no matches)
```

---

## ACCEPTANCE CRITERIA

### Implementation (verify during execution)

- [x] New `planning-research.md` agent exists at `.opencode/agents/planning-research.md`
- [x] Agent follows the same structure as `research-codebase.md` (Purpose, Capabilities, Instructions, Output Format, Rules)
- [x] `AGENTS.md` documents `.agents/features/{name}/` structure with lifecycle table
- [x] `/planning` Phase 2 uses parallel Task tool calls for three research agents
- [x] `/planning` output paths use `.agents/features/{feature}/plan.md`
- [x] `/execute` entry gate checks `.agents/features/` not `.agents/plans/`
- [x] `/execute` report saves to `.agents/features/{feature}/report.md`
- [x] `/execute` completion sweep renames within feature folder
- [x] `/code-review` output saves to `.agents/features/{feature}/review.md`
- [x] `/code-review` documents `.done.md` lifecycle (not self-marking)
- [x] `/code-loop` all artifact paths use `.agents/features/{feature}/`
- [x] `/commit` completion sweep scans `.agents/features/*/`
- [x] All three plan templates reference `.agents/features/` paths
- [x] `SKILL.md` references `.agents/features/` paths
- [x] No references to `.agents/plans/`, `.agents/reports/`, or `.agents/reviews/` remain in modified files

### Runtime (verify after testing/deployment)

- [ ] Running `/planning` creates plans in `.agents/features/{feature}/plan.md`
- [ ] Running `/execute` reads from and writes reports to `.agents/features/{feature}/`
- [ ] Running `/code-review` saves reviews to `.agents/features/{feature}/review.md`
- [ ] Running `/commit` correctly sweeps `.agents/features/` for done markers
- [ ] Sub-agent research in `/planning` actually runs in parallel and returns summaries
- [ ] No old-path references cause errors at runtime

---

## COMPLETION CHECKLIST

- [x] All 12 tasks completed in order
- [x] Each task validation passed
- [x] All validation commands executed successfully (grep checks)
- [x] Manual testing confirms all paths are consistent
- [x] No old paths remain in any modified file
- [x] Acceptance criteria all met

---

## NOTES

### Key Design Decisions
- **Per-feature folders over status-based folders**: `.agents/features/{name}/` groups by feature, not by artifact type or status. This makes it trivial to see all work for one feature. Status is tracked via `.done.md` suffix, not folder location.
- **`.done.md` ownership is explicit**: Each artifact has exactly one command responsible for marking it done. The creating command is NEVER the one that marks done (e.g., `/planning` creates `plan.md` but `/execute` marks it `plan.done.md`). This ensures done means "consumed and verified", not just "written".
- **Sub-agent research is additive, not replacing**: If Task tool is unavailable, `/planning` falls back to inline research. The sub-agent approach is the preferred path but not mandatory.
- **Clean break for paths**: Old `.agents/plans/`, `.agents/reports/`, `.agents/reviews/` paths are fully replaced. No backward compatibility layer. This is a template repo — no migration needed.

### Risks
- **Risk 1**: Other commands not in this slice (`/build`, `/decompose`, `/system-review`, `/ship`) may reference old paths. **Mitigation**: Task 12 greps for residual references and flags them for a follow-up slice.
- **Risk 2**: Feature name derivation in `/code-review` is ambiguous when not plan-bound. **Mitigation**: The implementation specifies a fallback (derive from module/directory name) and the agent using the command should use best judgment.

### Confidence Score: 8/10
- **Strengths**: Clear design, all target files identified, exact content blocks provided, consistent pattern across all commands
- **Uncertainties**: Other commands outside this slice may need updates (found during Task 12). Feature name derivation edge cases in standalone `/code-review`.
- **Mitigations**: Task 12 catches residual references. Edge cases documented for the execution agent to handle.
