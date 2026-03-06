# Task 4: Todo-Continuation Hook Tests

## Objective

Create integration tests for the todo-continuation hook, verifying event handling, state management, and continuation reminder injection.

## Scope

**Files touched**:
- CREATE: `.opencode/tests/integration/hooks/todo-continuation.test.ts`

**Out of scope**: AI calls, other hooks (tested separately)

## Prior Task Context

Tasks 1-3 tested category routing, skill loading, and agent resolution. This task tests the first hook (continuation tier).

## Context References

### Hook Factory (from research)

```typescript
// File: .opencode/hooks/todo-continuation/index.ts

export function createTodoContinuationEnforcer(
  ctx: PluginContext,
  options?: TodoContinuationEnforcerOptions
): HookDefinition {
  return {
    name: "todo-continuation-enforcer",
    tier: "continuation",
    description: "Enforces todo completion before session ends",
    eventTypes: ["session.idle", "session.error", "session.deleted"],
    enabled: true,
    handler: async (event) => {
      // Check for incomplete todos
      // Inject continuation reminder if needed
    }
  }
}
```

### Types (from research)

```typescript
// File: .opencode/hooks/todo-continuation/types.ts

export interface SessionStateStore {
  getState: (sessionId: string) => SessionState | null
  setState: (sessionId: string, state: SessionState) => void
  cancelCountdown: (sessionId: string) => void
  cleanup: (sessionId: string) => void
}

export interface Todo {
  id: string
  content: string
  status: "pending" | "in_progress" | "completed"
}
```

## Patterns to Follow

### Mock Context Pattern

```typescript
const createMockContext = (): PluginContext => ({
  client: {
    session: {
      todo: jest.fn().mockResolvedValue({ data: [] }),
      prompt: jest.fn().mockResolvedValue({}),
    }
  },
  directory: "/test"
})
```

## Step-by-Step Implementation

### Step 1: Create test file

```typescript
// File: .opencode/tests/integration/hooks/todo-continuation.test.ts

import { describe, it, expect, beforeEach } from "bun:test"
import { createTodoContinuationEnforcer } from "../../../hooks/todo-continuation"
import { createSessionStateStore } from "../../../hooks/todo-continuation/session-state"

describe("Todo-Continuation Hook", () => {
  describe("Hook Creation", () => {
    it("should create hook with correct event types", () => {
      const mockCtx = createMockContext()
      const hook = createTodoContinuationEnforcer(mockCtx)
      
      expect(hook.name).toBe("todo-continuation-enforcer")
      expect(hook.tier).toBe("continuation")
      expect(hook.eventTypes).toContain("session.idle")
      expect(hook.eventTypes).toContain("session.error")
      expect(hook.eventTypes).toContain("session.deleted")
    })
  })

  describe("Session State Management", () => {
    it("should track session state", () => {
      const store = createSessionStateStore()
      store.setState("session-1", { isRecovering: false, lastInjectedAt: 0, inFlight: false })
      
      const state = store.getState("session-1")
      expect(state).not.toBeNull()
      expect(state!.isRecovering).toBe(false)
    })
  })

  describe("Event Handling", () => {
    it("should check for incomplete todos on session.idle", async () => {
      const mockCtx = createMockContext({
        todos: [{ id: "1", content: "Test", status: "pending" }]
      })
      const hook = createTodoContinuationEnforcer(mockCtx)
      
      await hook.handler({ type: "session.idle", properties: { sessionID: "test" } })
      
      expect(mockCtx.client.session.prompt).toHaveBeenCalled()
    })
  })
})
```

**VALIDATE**: `bun test tests/integration/hooks/todo-continuation.test.ts`

## Acceptance Criteria

- [ ] Hook creation verified
- [ ] Event types correct
- [ ] State management tested
- [ ] Injection logic verified

## Handoff Notes

Proceed to **Task 5: Atlas Hook Tests**.