# Task 6: Session-Recovery Hook Tests

## Objective

Create integration tests for the session-recovery hook, verifying error detection, recovery callbacks, and session abort behavior.

## Scope

**Files touched**:
- CREATE: `.opencode/tests/integration/hooks/session-recovery.test.ts`

## Prior Task Context

Tasks 4-5 tested continuation tier hooks. This task tests session-recovery (continuation tier).

## Context References

```typescript
// File: .opencode/hooks/session-recovery/hook.ts

export function createSessionRecoveryHook(
  ctx: PluginContext,
  options?: SessionRecoveryOptions
): HookDefinition {
  return {
    name: "session-recovery",
    tier: "continuation",
    description: "Resume from errors",
    eventTypes: ["chat.message"],
    handler: async (event) => {
      // Detect error types
      // Abort session if recoverable
      // Show toast notification
    }
  }
}

export type RecoveryErrorType = 
  | "tool_result_missing"
  | "unavailable_tool"
  | "thinking_block_order"
  | "rate_limit"
  | "context_window_exceeded"
```

## Step-by-Step Implementation

```typescript
// File: .opencode/tests/integration/hooks/session-recovery.test.ts

import { describe, it, expect } from "bun:test"
import { createSessionRecoveryHook } from "../../../hooks/session-recovery"

describe("Session-Recovery Hook", () => {
  describe("Error Detection", () => {
    it("should detect tool_result_missing errors", async () => {
      // Test implementation
    })

    it("should detect unavailable_tool errors", async () => {
      // Test implementation
    })

    it("should detect thinking_block_order errors", async () => {
      // Test implementation
    })

    it("should detect rate_limit errors", async () => {
      // Test implementation
    })
  })

  describe("Recovery Behavior", () => {
    it("should abort session for recoverable errors", async () => {
      // Test implementation
    })

    it("should call onAbortCallback when set", async () => {
      // Test implementation
    })

    it("should show toast notification", async () => {
      // Test implementation
    })
  })
})
```

**VALIDATE**: `bun test tests/integration/hooks/session-recovery.test.ts`

## Acceptance Criteria

- [ ] Error type detection tested
- [ ] Recovery callbacks verified
- [ ] Session abort behavior tested
- [ ] Toast notification verified

## Handoff Notes

Proceed to **Task 7: Hook Ordering Tests**.