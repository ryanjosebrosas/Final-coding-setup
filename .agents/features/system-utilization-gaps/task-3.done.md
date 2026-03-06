# Task 3: Update oh-my-opencode.jsonc (debug_logging + mcps comment)

## Objective
Enable debug logging by flipping `experimental.debug_logging` to `true`, and add a
clarifying comment above `mcps` explaining that remote MCPs (like Archon) go in
`opencode.json`, not here — so future maintainers understand the split.

## Scope
- **Files modified**: `.opencode/oh-my-opencode.jsonc` (1 file)
- **Files created**: none
- **Out of scope**: Do NOT change any agent or category model assignments
- **Out of scope**: Do NOT add Archon to `mcps` — that's stdio-only, handled in Task 2
- **Dependencies**: none — Wave 1, fully independent

## Prior Task Context
Task 2 creates `opencode.json` with the Archon remote MCP config. This task adds a
comment to oh-my-opencode.jsonc explaining why `mcps: {}` stays empty (the distinction
between stdio and remote MCPs).

## Context References

### Target file: `.opencode/oh-my-opencode.jsonc` (full current content)

```jsonc
{
  "agents": {
    "sisyphus": {
      "model": "anthropic/claude-sonnet-4-6"
    },
    "hephaestus": {
      "model": "openai/gpt-5.3-codex"
    },
    "oracle": {
      "model": "anthropic/claude-opus-4-6"
    },
    "metis": {
      "model": "anthropic/claude-sonnet-4-6"
    },
    "momus": {
      "model": "anthropic/claude-opus-4-6"
    },
    "sisyphus-junior": {
      "model": "openai/gpt-5.3-codex"
    },
    "multimodal-looker": {
      "model": "ollama-cloud/gemini-3-flash-preview"
    },
    "librarian": {
      "model": "ollama/glm-5:cloud"
    },
    "explore": {
      "model": "ollama/glm-5:cloud"
    },
    "atlas": {
      "model": "ollama/glm-5:cloud"
    }
  },
  "categories": {
    "visual-engineering": {
      "model": "openai/gpt-5.3-codex",
      "provider": "openai"
    },
    "ultrabrain": {
      "model": "openai/gpt-5.3-codex",
      "provider": "openai"
    },
    "artistry": {
      "model": "openai/gpt-5.3-codex",
      "provider": "openai"
    },
    "quick": {
      "model": "openai/gpt-5.3-codex",
      "provider": "openai"
    },
    "deep": {
      "model": "openai/gpt-5.3-codex",
      "provider": "openai"
    },
    "unspecified-low": {
      "model": "openai/gpt-5.3-codex",
      "provider": "openai"
    },
    "unspecified-high": {
      "model": "openai/gpt-5.3-codex",
      "provider": "openai"
    },
    "writing": {
      "model": "openai/gpt-5.3-codex",
      "provider": "openai"
    }
  },
  "disabled_agents": [],
  "disabled_hooks": [],
  "disabled_commands": [],
  "disabled_skills": [],
  "mcps": {},
  "experimental": {
    "debug_logging": false
  },
  "_migrations": [
    "model-version:anthropic/claude-opus-4-5->anthropic/claude-opus-4-6",
    "model-version:anthropic/claude-opus-4-5->anthropic/claude-opus-4-6"
  ]
}
```

### Why this file supports comments (JSONC)

The `.jsonc` extension means JSON with Comments — `//` line comments and `/* */` block
comments are valid. This is already used in the `.opencode/oh-my-opencode.jsonc.example`
file. Do NOT add comments to a file named `.json` — only `.jsonc` files support this.

### The McpConfig type (core/types.ts:54-58) — for comment accuracy

```typescript
export interface McpConfig {
  command?: string      // stdio: executable to run
  args?: string[]       // stdio: arguments
  env?: Record<string, string>  // stdio: environment variables
}
```

This confirms `mcps` here is stdio-only. Remote MCPs (HTTP/SSE) are handled by OpenCode's
native `opencode.json` config, not this plugin config.

### disabled_* arrays — document when to use them

The `disabled_agents`, `disabled_hooks`, `disabled_commands`, `disabled_skills` arrays
are cost-control levers. Add a brief comment above them explaining their purpose.

## Patterns to Follow

### Pattern: JSONC comment style

```jsonc
// This is a valid comment in JSONC
{
  // Inline comments on fields are also valid
  "key": "value",
  
  // Section comment before a block
  "mcps": {}
}
```

Keep comments concise — 1-2 lines max per comment block. No multi-line `/* */` blocks
needed for this file.

## Step-by-Step Implementation

### Step 1: Apply two targeted edits to oh-my-opencode.jsonc

**Edit A — Enable debug_logging**

**CURRENT**:
```jsonc
  "experimental": {
    "debug_logging": false
  },
```

**REPLACE WITH**:
```jsonc
  "experimental": {
    "debug_logging": true
  },
```

**Edit B — Add comment above mcps explaining the stdio vs remote split**

**CURRENT**:
```jsonc
  "disabled_agents": [],
  "disabled_hooks": [],
  "disabled_commands": [],
  "disabled_skills": [],
  "mcps": {},
```

**REPLACE WITH**:
```jsonc
  // Cost-control levers: add agent/hook/command/skill names to disable them per-project
  "disabled_agents": [],
  "disabled_hooks": [],
  "disabled_commands": [],
  "disabled_skills": [],
  // stdio MCP servers only (command/args/env). Remote HTTP MCPs (e.g. Archon) go in opencode.json
  "mcps": {},
```

### Step 2: Verify the file is still valid JSONC

```bash
node -e "
const fs = require('fs');
const content = fs.readFileSync('.opencode/oh-my-opencode.jsonc', 'utf8');
// Strip jsonc comments for parsing
const stripped = content.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
JSON.parse(stripped);
console.log('valid JSONC');
"
```

Expected: `valid JSONC`

### Step 3: Verify debug_logging is true

```bash
node -e "
const fs = require('fs');
const content = fs.readFileSync('.opencode/oh-my-opencode.jsonc', 'utf8');
const stripped = content.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
const config = JSON.parse(stripped);
console.log('debug_logging:', config.experimental.debug_logging);
"
```

Expected: `debug_logging: true`

## QA Scenarios

### Scenario 1: File is valid after edits
**Tool**: Bash
**Steps**:
1. Strip comments and parse as JSON
2. Verify no parse errors
**Expected**: `valid JSONC` printed with no errors
**Evidence**: `.agents/features/system-utilization-gaps/evidence/task-3-jsonc-valid.txt`

### Scenario 2: debug_logging is enabled
**Tool**: Bash
**Steps**:
1. `grep "debug_logging" .opencode/oh-my-opencode.jsonc`
**Expected**: Line shows `"debug_logging": true`
**Evidence**: Terminal output

### Scenario 3: Agent/category assignments unchanged
**Tool**: Bash
**Steps**:
1. `grep -c '"model"' .opencode/oh-my-opencode.jsonc`
**Expected**: Same count as before (18 — 10 agents + 8 categories)
**Evidence**: Terminal output showing count

### Scenario 4: Comments visible in file
**Tool**: Bash  
**Steps**:
1. `grep "//" .opencode/oh-my-opencode.jsonc`
**Expected**: Two new comment lines visible — one for disabled_* and one for mcps
**Evidence**: Terminal output

## Validation Commands

```bash
# L1: debug_logging is true
grep "debug_logging" .opencode/oh-my-opencode.jsonc

# L2: JSONC is valid (strip comments then parse)
node -e "const s=require('fs').readFileSync('.opencode/oh-my-opencode.jsonc','utf8').replace(/\/\/.*$/gm,'');JSON.parse(s);console.log('ok')"

# L3: Model count unchanged (18 model entries = 10 agents + 8 categories)
grep -c '"model"' .opencode/oh-my-opencode.jsonc

# L4: Comments present
grep "//" .opencode/oh-my-opencode.jsonc
```

## Acceptance Criteria

### Implementation
- [ ] `experimental.debug_logging` is `true`
- [ ] Comment above `disabled_agents` explains their purpose
- [ ] Comment above `mcps` explains stdio vs remote split and references opencode.json
- [ ] All agent model assignments are unchanged
- [ ] All category model assignments are unchanged
- [ ] File is valid JSONC

### Runtime
- [ ] JSONC parses without error after stripping comments
- [ ] `debug_logging` value is `true` (not `false`)

## Parallelization
- **Wave**: 1 — no dependencies
- **Can Parallel**: YES — independent of Tasks 1, 2, 4
- **Blocks**: Task 5 (README)
- **Blocked By**: nothing

## Handoff Notes
Task 4 (AGENTS.md) is independent and can run concurrently. Task 5 waits for all of 1-4.

## Completion Checklist
- [ ] debug_logging flipped to true
- [ ] Two comments added (disabled_* and mcps)
- [ ] JSONC validity confirmed
- [ ] Agent/category assignments verified unchanged
- [ ] Evidence saved
