# Task 5: Atlas Hook Tests

## Objective

Create integration tests for the Atlas hook (boulder state management), verifying boulder.json reading/writing and task orchestration.

## Scope

**Files touched**:
- CREATE: `.opencode/tests/integration/hooks/atlas.test.ts`

## Prior Task Context

Task 4 tested todo-continuation. This task tests Atlas (continuation tier).

## Context References

```typescript
// File: .opencode/hooks/atlas/index.ts

export function createAtlasHook(
  ctx: PluginContext,
  options?: AtlasHookOptions
): HookDefinition {
  return {
    name: "atlas",
    tier: "continuation",
    description: "Boulder pusher for task orchestration",
    eventTypes: ["tool.execute.before", "tool.execute.after"],
    handler: async (event) => {
      // Read boulder state
      // Execute next pending task
      // Write boulder state
    }
  }
}
```

## Step-by-Step Implementation

### Step 1: Create test file

```typescript
// File: .opencode/tests/integration/hooks/atlas.test.ts

import { describe, it, expect, beforeEach } from "bun:test"
import { createAtlasHook, readBoulderState, writeBoulderState } from "../../../hooks/atlas"

describe("Atlas Hook", () => {
  describe("Hook Creation", () => {
    it("should create hook with correct properties", () => {
      const mockCtx = createMockContext()
      const hook = createAtlasHook(mockCtx)
      
      expect(hook.name).toBe("atlas")
      expect(hook.tier).toBe("continuation")
      expect(hook.eventTypes).toContain("tool.execute.before")
      expect(hook.eventTypes).toContain("tool.execute.after")
    })
  })

  describe("Boulder State", () => {
    it("should read boulder state from file", async () => {
      const state = await readBoulderState("/test/path")
      expect(state).toBeDefined()
    })

    it("should write boulder state to file", async () => {
      await writeBoulderState("/test/path", { tasks: [] })
      // Verify file written
    })
  })

  describe("Task Orchestration", () => {
    it("should process pending tasks in order", async () => {
      // Test implementation
    })
  })
})
```

**VALIDATE**: `bun test tests/integration/hooks/atlas.test.ts`

## Acceptance Criteria

- [ ] Hook creation verified
- [ ] Boulder state read/write tested
- [ ] Task orchestration verified

## Handoff Notes

Proceed to **Task 6: Session-Recovery Hook Tests**.