# Task 7: Hook Ordering Tests

## Objective

Create tests verifying hook tier ordering (continuation → session → tool-guard → transform → skill) and registry behavior.

## Scope

**Files touched**:
- CREATE: `.opencode/tests/integration/hooks/hook-ordering.test.ts`

## Prior Task Context

Tasks 4-6 tested individual hooks. This task verifies hook execution order across tiers.

## Context References

```typescript
// File: .opencode/hooks/base.ts

export const HOOK_TIER_ORDER = {
  continuation: 1,
  session: 2,
  "tool-guard": 3,
  transform: 4,
  skill: 5,
} as const

export function getHookTierOrder(tier: HookTier): number {
  return HOOK_TIER_ORDER[tier]
}

export interface HookRegistry {
  register: (hook: HookDefinition) => void
  unregister: (name: string) => void
  getEnabledHooks: () => HookDefinition[]
  getHooksByTier: (tier: HookTier) => HookDefinition[]
  getHooksForEvent: (eventType: string) => HookDefinition[]
}
```

## Step-by-Step Implementation

```typescript
// File: .opencode/tests/integration/hooks/hook-ordering.test.ts

import { describe, it, expect } from "bun:test"
import { HOOK_TIER_ORDER, getHookTierOrder, createHookRegistry } from "../../../hooks/base"

describe("Hook Ordering", () => {
  describe("Tier Order Constants", () => {
    it("should have correct tier order", () => {
      expect(HOOK_TIER_ORDER.continuation).toBe(1)
      expect(HOOK_TIER_ORDER.session).toBe(2)
      expect(HOOK_TIER_ORDER["tool-guard"]).toBe(3)
      expect(HOOK_TIER_ORDER.transform).toBe(4)
      expect(HOOK_TIER_ORDER.skill).toBe(5)
    })

    it("should return tier order via function", () => {
      expect(getHookTierOrder("continuation")).toBe(1)
      expect(getHookTierOrder("skill")).toBe(5)
    })
  })

  describe("Hook Registry", () => {
    it("should register hooks", () => {
      const registry = createHookRegistry()
      registry.register({ name: "test", tier: "continuation", handler: async () => {}, eventTypes: ["session.idle"] })
      
      expect(registry.getEnabledHooks().length).toBe(1)
    })

    it("should unregister hooks", () => {
      const registry = createHookRegistry()
      registry.register({ name: "test", tier: "continuation", handler: async () => {}, eventTypes: [] })
      registry.unregister("test")
      
      expect(registry.getEnabledHooks().length).toBe(0)
    })

    it("should get hooks by tier", () => {
      const registry = createHookRegistry()
      registry.register({ name: "cont1", tier: "continuation", handler: async () => {}, eventTypes: [] })
      registry.register({ name: "sess1", tier: "session", handler: async () => {}, eventTypes: [] })
      
      const continuationHooks = registry.getHooksByTier("continuation")
      expect(continuationHooks.length).toBe(1)
      expect(continuationHooks[0].name).toBe("cont1")
    })

    it("should get hooks for event type", () => {
      const registry = createHookRegistry()
      registry.register({ name: "idle", tier: "continuation", handler: async () => {}, eventTypes: ["session.idle"] })
      registry.register({ name: "error", tier: "continuation", handler: async () => {}, eventTypes: ["session.error"] })
      
      const idleHooks = registry.getHooksForEvent("session.idle")
      expect(idleHooks.length).toBe(1)
      expect(idleHooks[0].name).toBe("idle")
    })

    it("should return hooks in tier order", () => {
      const registry = createHookRegistry()
      registry.register({ name: "skill", tier: "skill", handler: async () => {}, eventTypes: ["event"] })
      registry.register({ name: "cont", tier: "continuation", handler: async () => {}, eventTypes: ["event"] })
      registry.register({ name: "session", tier: "session", handler: async () => {}, eventTypes: ["event"] })
      
      const hooks = registry.getEnabledHooks()
      expect(hooks[0].tier).toBe("continuation")
      expect(hooks[1].tier).toBe("session")
      expect(hooks[2].tier).toBe("skill")
    })
  })
})
```

**VALIDATE**: `bun test tests/integration/hooks/hook-ordering.test.ts`

## Acceptance Criteria

- [ ] Tier order constants verified
- [ ] Registry operations tested
- [ ] Hook ordering by tier verified
- [ ] Event type filtering tested

## Handoff Notes

Proceed to **Task 8: Wisdom Extractor Tests**.