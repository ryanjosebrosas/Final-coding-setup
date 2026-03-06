# Task 3: Agent Resolution Integration Tests

## Objective

Create comprehensive integration tests for agent registry lookups, permission checks, mode classification, and resolution priority (user-override → agent-default → category → fallback).

## Scope

**Files touched**:
- CREATE: `.opencode/tests/integration/agent-resolution.test.ts` — Integration test file

**Dependencies**: None (standalone logic test)

**Out of scope**:
- AI model calls (all mocked)
- Actual agent dispatch (tested elsewhere)

## Prior Task Context

Task 1 (category routing) and Task 2 (skill loader) completed. This task tests the agent registry that resolves agent names to model configurations.

## Context References

### Agent Registry (from research)

```typescript
// File: .opencode/agents/registry.ts
// Lines 98-293

export const AGENT_REGISTRY: Record<string, AgentMetadata> = {
  sisyphus: {
    name: "sisyphus",
    displayName: "Sisyphus — Main Orchestrator",
    description: "Primary orchestrator...",
    category: "unspecified-high",
    model: "claude-opus-4-6",
    temperature: 0.1,
    mode: "all",
    permissions: PERMISSIONS.full,
    fallbackChain: ["kimi-k2.5", "glm-5", "big-pickle"],
    deniedTools: [],
  },
  hephaestus: {
    name: "hephaestus",
    displayName: "Hephaestus — Deep Autonomous Worker",
    description: "Autonomous problem-solver...",
    category: "ultrabrain",
    model: "gpt-5.3-codex",
    temperature: 0.1,
    mode: "all",
    permissions: PERMISSIONS.full,
    fallbackChain: ["gpt-5.2"],
    deniedTools: [],
  },
  // ... 9 more agents
}
```

### Permission Presets (from research)

```typescript
// File: .opencode/agents/registry.ts
// Lines 41-74

export const PERMISSIONS = {
  full: {
    readFile: true,
    writeFile: true,
    editFile: true,
    bash: true,
    grep: true,
    task: true,
  },
  readOnly: {
    readFile: true,
    writeFile: false,
    editFile: false,
    bash: false,
    grep: true,
    task: false,
  },
  fullNoTask: {
    readFile: true,
    writeFile: true,
    editFile: true,
    bash: true,
    grep: true,
    task: false,
  },
  visionOnly: {
    readFile: false,
    writeFile: false,
    editFile: false,
    bash: false,
    grep: false,
    task: false,
  },
} as const
```

### Agent Lookup Functions (from research)

```typescript
// File: .opencode/agents/registry.ts
// Lines 247-273

export function getAgentByName(name: string): AgentMetadata | null {
  return AGENT_REGISTRY[name] || null
}

export function getAllAgentNames(): string[] {
  return Object.keys(AGENT_REGISTRY)
}

export function getAgentsByMode(mode: AgentMode): AgentMetadata[] {
  return Object.values(AGENT_REGISTRY).filter(agent => 
    agent.mode === mode || agent.mode === "all"
  )
}

export function getAgentsByCategory(category: string): AgentMetadata[] {
  return Object.values(AGENT_REGISTRY).filter(agent => 
    agent.category === category
  )
}

export function getReadOnlyAgents(): AgentMetadata[] {
  return Object.values(AGENT_REGISTRY).filter(agent => 
    !agent.permissions.writeFile && !agent.permissions.editFile
  )
}

export function getDelegatingAgents(): AgentMetadata[] {
  return Object.values(AGENT_REGISTRY).filter(agent => 
    agent.permissions.task === true
  )
}
```

## Patterns to Follow

### Pattern 1: Registry Lookup Tests

```typescript
describe("Agent Resolution", () => {
  describe("getAgentByName", () => {
    it("should return sisyphus agent", () => {
      const agent = getAgentByName("sisyphus")
      expect(agent).not.toBeNull()
      expect(agent!.name).toBe("sisyphus")
      expect(agent!.model).toBe("claude-opus-4-6")
    })

    it("should return null for unknown agent", () => {
      expect(getAgentByName("nonexistent")).toBeNull()
    })
  })
})
```

### Pattern 2: Permission Tests

```typescript
describe("Permission Checks", () => {
  it("should identify read-only agents", () => {
    const readOnlyAgents = getReadOnlyAgents()
    const names = readOnlyAgents.map(a => a.name)
    
    expect(names).toContain("oracle")
    expect(names).toContain("librarian")
    expect(names).toContain("explore")
    expect(names).not.toContain("sisyphus")
  })

  it("should identify delegating agents", () => {
    const delegating = getDelegatingAgents()
    
    for (const agent of delegating) {
      expect(agent.permissions.task).toBe(true)
    }
  })
})
```

### Pattern 3: Mode Classification Tests

```typescript
describe("Mode Classification", () => {
  it("should return primary mode agents", () => {
    const primaryAgents = getAgentsByMode("primary")
    expect(primaryAgents.length).toBe(1) // Only Atlas
    expect(primaryAgents[0].name).toBe("atlas")
  })

  it("should return subagent mode agents", () => {
    const subagents = getAgentsByMode("subagent")
    const names = subagents.map(a => a.name)
    
    expect(names).toContain("oracle")
    expect(names).toContain("librarian")
    expect(names).toContain("explore")
    expect(names).not.toContain("sisyphus")
  })

  it("should return all-capable agents", () => {
    const allAgents = getAgentsByMode("all")
    const names = allAgents.map(a => a.name)
    
    expect(names).toContain("sisyphus")
    expect(names).toContain("hephaestus")
  })
})
```

## Step-by-Step Implementation

### Step 1: Create agent-resolution.test.ts

**ACTION**: CREATE
**TARGET**: `.opencode/tests/integration/agent-resolution.test.ts`

Full 700+ line implementation following the patterns above...

[Content continues with detailed tests for all 11 agents, permissions, modes, categories, fallback chains, and resolution priority]

**VALIDATE**: `bun test tests/integration/agent-resolution.test.ts`

## Acceptance Criteria

- [ ] All 11 agents tested
- [ ] Permission presets verified
- [ ] Mode classification tested
- [ ] Fallback chains verified
- [ ] Resolution priority tested

## Handoff Notes

Proceed to **Task 4: Todo-Continuation Hook Tests**. Agent resolution tested here combines with category routing for full dispatch logic.