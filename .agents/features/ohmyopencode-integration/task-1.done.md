# Task 1: Category Routing Integration Tests

## Objective

Create comprehensive integration tests for category routing logic, verifying that category names correctly resolve to model/provider combinations and selection gates validate category appropriateness.

## Scope

**Files touched**:
- CREATE: `.opencode/tests/integration/category-routing.test.ts` — Integration test file

**Dependencies**: None (standalone logic test)

**Out of scope**:
- Agent dispatch tests (Task 3)
- Skill loader tests (Task 2)
- AI model calls (all mocked)

## Prior Task Context

None — this is the first task.

## Context References

### Category Definitions (from research)

```typescript
// File: .opencode/tools/delegate-task/constants.ts
// Lines 13-92

export const CATEGORY_PROMPT_APPENDS = {
  "visual-engineering": `You are a frontend specialist focused on visual excellence. Prioritize:
- Pixel-perfect implementation
- Responsive design patterns
- Accessibility (WCAG standards)
- Performance optimization
- Modern CSS/animation techniques

Deliver clean, maintainable UI code.`,

  "ultrabrain": `You are solving a genuinely difficult problem that requires exceptional reasoning capability.

Approach:
1. Break down the problem systematically
2. Identify all edge cases and constraints
3. Consider multiple solution approaches
4. Evaluate tradeoffs explicitly
5. Implement the optimal solution

Think step by step. Quality over speed.`,

  "artistry": `You are a creative problem-solver approaching challenges with unconventional thinking.

Permission to:
- Challenge assumptions
- Explore non-obvious solutions
- Combine ideas from different domains
- Propose novel approaches

Creativity welcome. Standard solutions discouraged.`,

  "quick": `Quick task mode. Focus on:
- Speed
- Accuracy
- Minimal changes
- No over-engineering

Get in, make the change, get out.`,

  "deep": `You are on a deep investigation mission.

Protocol:
1. Research thoroughly before acting
2. Use all available tools (grep, read, search)
3. Consider multiple hypotheses
4. Verify findings with evidence
5. Document your reasoning

Take the time needed to be thorough.`,

  "unspecified-low": `General-purpose execution. Focus on:
- Clear implementation
- Following existing patterns
- Clean code
- Proper error handling

Straightforward, reliable execution.`,

  "unspecified-high": `High-stakes general task requiring careful execution.

Prioritize:
- Thoroughness
- Correctness
- Edge case handling
- Clear documentation
- Maintainability

Take time to get it right.`,

  "writing": `You are a technical writer.

Focus on:
- Clarity and readability
- Proper structure and organization
- Accurate technical content
- Audience-appropriate language
- Complete coverage

Write documentation that developers actually want to read.`,
} as const
```

### Category Model Routes (from research)

```typescript
// File: .opencode/tools/delegate-task/constants.ts
// Lines 244-289

export const CATEGORY_MODEL_ROUTES: Record<string, {
  provider: string
  model: string
  label: string
}> = {
  "visual-engineering": {
    provider: "ollama-cloud",
    model: "gemini-3-pro-preview",
    label: "GEMINI-3-PRO"
  },
  "ultrabrain": {
    provider: "openai",
    model: "gpt-5.3-codex",
    label: "GPT-5.3-CODEX"
  },
  "artistry": {
    provider: "ollama-cloud",
    model: "gemini-3-pro-preview",
    label: "GEMINI-3-PRO"
  },
  "quick": {
    provider: "anthropic",
    model: "claude-haiku-4-5-20251001",
    label: "CLAUDE-HAIKU-4-5"
  },
  "deep": {
    provider: "bailian-coding-plan-test",
    model: "qwen3.5-plus",
    label: "QWEN3.5-PLUS"
  },
  "unspecified-low": {
    provider: "anthropic",
    model: "claude-sonnet-4-6",
    label: "CLAUDE-SONNET-4-6"
  },
  "unspecified-high": {
    provider: "anthropic",
    model: "claude-opus-4-6",
    label: "CLAUDE-OPUS-4-6"
  },
  "writing": {
    provider: "bailian-coding-plan-test",
    model: "kimi-k2.5",
    label: "KIMI-K2.5"
  }
}
```

### Selection Gates (from research)

```typescript
// File: .opencode/tools/delegate-task/constants.ts
// Lines 109-233

export interface SelectionGateResult {
  valid: boolean
  reason?: string
  suggestion?: string
}

export function quickCategoryGate(taskDescription: string): SelectionGateResult {
  const complexKeywords = [
    "architecture", "design", "refactor", "multiple files",
    "complex", "security", "encryption", "authentication",
    "database", "migration", "performance", "optimize",
    "algorithm", "implement feature", "integrate"
  ]
  
  const hasComplexKeywords = complexKeywords.some(kw => 
    taskDescription.toLowerCase().includes(kw)
  )
  
  if (hasComplexKeywords) {
    return {
      valid: false,
      reason: "Task appears too complex for 'quick' category",
      suggestion: "Consider using 'deep' or 'unspecified-high' category instead"
    }
  }
  
  return { valid: true }
}

export function ultrabrainCategoryGate(taskDescription: string): SelectionGateResult {
  const hardKeywords = [
    "algorithm", "architecture", "compiler", "distributed",
    "optimization", "security", "encryption", "design system",
    "complex", "reasoning", "analysis", "pattern"
  ]
  
  const hasHardKeywords = hardKeywords.some(kw => 
    taskDescription.toLowerCase().includes(kw)
  )
  
  if (!hasHardKeywords) {
    return {
      valid: false,
      reason: "Task does not appear to require 'ultrabrain' level reasoning",
      suggestion: "Consider using 'deep' or 'unspecified-high' category instead"
    }
  }
  
  return { valid: true }
}

export function artistryCategoryGate(taskDescription: string): SelectionGateResult {
  const creativeKeywords = [
    "creative", "innovative", "unconventional", "novel",
    "outside the box", "unique", "original", "alternative"
  ]
  
  const hasCreativeKeywords = creativeKeywords.some(kw => 
    taskDescription.toLowerCase().includes(kw)
  )
  
  if (!hasCreativeKeywords) {
    return {
      valid: true,
      reason: "Task appears conventional - 'artistry' may produce unexpected approaches"
    }
  }
  
  return { valid: true }
}

export function deepCategoryGate(taskDescription: string): SelectionGateResult {
  const researchKeywords = [
    "investigate", "research", "explore", "analyze", "find",
    "debug", "trace", "understand", "figure out", "why"
  ]
  
  const hasResearchKeywords = researchKeywords.some(kw => 
    taskDescription.toLowerCase().includes(kw)
  )
  
  if (!hasResearchKeywords) {
    return {
      valid: true,
      reason: "Consider if this task really needs 'deep' investigation vs simpler category"
    }
  }
  
  return { valid: true }
}

export function validateCategorySelection(
  category: string,
  taskDescription: string
): SelectionGateResult {
  switch (category) {
    case "quick":
      return quickCategoryGate(taskDescription)
    case "ultrabrain":
      return ultrabrainCategoryGate(taskDescription)
    case "artistry":
      return artistryCategoryGate(taskDescription)
    case "deep":
      return deepCategoryGate(taskDescription)
    default:
      return { valid: true }
  }
}
```

### Category Selector (from research)

```typescript
// File: .opencode/tools/delegate-task/category-selector.ts
// Lines 1-150

import { CATEGORY_MODEL_ROUTES, CATEGORY_PROMPT_APPENDS } from "./constants"

export interface CategoryRoute {
  category: string
  provider: string
  model: string
  label: string
  promptAppend: string
}

export function isValidCategory(category: string): boolean {
  return category in CATEGORY_MODEL_ROUTES
}

export function resolveCategory(category: string): CategoryRoute | null {
  if (!isValidCategory(category)) {
    return null
  }
  
  const route = CATEGORY_MODEL_ROUTES[category]
  const promptAppend = CATEGORY_PROMPT_APPENDS[category] || ""
  
  return {
    category,
    provider: route.provider,
    model: route.model,
    label: route.label,
    promptAppend
  }
}

export function getAvailableCategories(): string[] {
  return Object.keys(CATEGORY_MODEL_ROUTES)
}

export function getCategoryPromptAppend(category: string): string {
  return CATEGORY_PROMPT_APPENDS[category] || ""
}
```

### Existing Test Pattern (from research)

```typescript
// File: .opencode/tools/delegate-task/category-selector.test.ts
// Pattern to follow for integration tests

import { describe, it, expect } from "bun:test"
import { resolveCategory, isValidCategory, getAvailableCategories } from "./category-selector"

describe("category-selector", () => {
  describe("isValidCategory", () => {
    it("should return true for valid categories", () => {
      expect(isValidCategory("quick")).toBe(true)
      expect(isValidCategory("ultrabrain")).toBe(true)
      expect(isValidCategory("visual-engineering")).toBe(true)
    })

    it("should return false for invalid categories", () => {
      expect(isValidCategory("nonexistent")).toBe(false)
      expect(isValidCategory("invalid-category")).toBe(false)
    })
  })

  describe("resolveCategory", () => {
    it("should resolve valid categories to model routes", () => {
      const result = resolveCategory("ultrabrain")
      expect(result).toEqual({
        category: "ultrabrain",
        provider: "openai",
        model: "gpt-5.3-codex",
        label: "GPT-5.3-CODEX",
        promptAppend: expect.any(String)
      })
    })

    it("should return null for invalid categories", () => {
      expect(resolveCategory("nonexistent")).toBeNull()
    })
  })

  describe("getAvailableCategories", () => {
    it("should return all 8 categories", () => {
      const categories = getAvailableCategories()
      expect(categories.length).toBe(8)
      expect(categories).toContain("quick")
      expect(categories).toContain("ultrabrain")
    })
  })
})
```

## Patterns to Follow

### Pattern 1: Integration Test Structure

```typescript
// Create in: .opencode/tests/integration/category-routing.test.ts
// Follow this structure for all integration tests

import { describe, it, expect, beforeEach, afterEach } from "bun:test"
import { 
  resolveCategory, 
  isValidCategory, 
  getAvailableCategories,
  getCategoryPromptAppend 
} from "../../tools/delegate-task/category-selector"
import { 
  validateCategorySelection,
  quickCategoryGate,
  ultrabrainCategoryGate,
  artistryCategoryGate,
  deepCategoryGate 
} from "../../tools/delegate-task/constants"

describe("Category Routing Integration", () => {
  // Tests go here
})
```

### Pattern 2: Nested Describe Blocks for Organization

```typescript
describe("Category Routing Integration", () => {
  describe("Category Resolution", () => {
    describe("resolveCategory", () => {
      describe("when category is valid", () => {
        it("should return complete route for visual-engineering", () => {
          // Test implementation
        })
      })

      describe("when category is invalid", () => {
        it("should return null for unknown category", () => {
          // Test implementation
        })
      })
    })
  })

  describe("Selection Gates", () => {
    describe("quickCategoryGate", () => {
      // Tests for quick category validation
    })

    describe("ultrabrainCategoryGate", () => {
      // Tests for ultrabrain category validation
    })
  })
})
```

### Pattern 3: Table-Driven Tests for Multiple Categories

```typescript
describe("Category Model Routes", () => {
  const categoryRoutes = [
    { category: "visual-engineering", expectedProvider: "ollama-cloud", expectedModel: "gemini-3-pro-preview" },
    { category: "ultrabrain", expectedProvider: "openai", expectedModel: "gpt-5.3-codex" },
    { category: "artistry", expectedProvider: "ollama-cloud", expectedModel: "gemini-3-pro-preview" },
    { category: "quick", expectedProvider: "anthropic", expectedModel: "claude-haiku-4-5-20251001" },
    { category: "deep", expectedProvider: "bailian-coding-plan-test", expectedModel: "qwen3.5-plus" },
    { category: "unspecified-low", expectedProvider: "anthropic", expectedModel: "claude-sonnet-4-6" },
    { category: "unspecified-high", expectedProvider: "anthropic", expectedModel: "claude-opus-4-6" },
    { category: "writing", expectedProvider: "bailian-coding-plan-test", expectedModel: "kimi-k2.5" },
  ]

  for (const { category, expectedProvider, expectedModel } of categoryRoutes) {
    it(`should route ${category} to ${expectedModel}`, () => {
      const result = resolveCategory(category)
      expect(result).not.toBeNull()
      expect(result!.provider).toBe(expectedProvider)
      expect(result!.model).toBe(expectedModel)
    })
  }
})
```

### Pattern 4: Gate Validation Tests

```typescript
describe("Selection Gates", () => {
  describe("quickCategoryGate", () => {
    it("should reject architecture tasks", () => {
      const result = quickCategoryGate("refactor the architecture")
      expect(result.valid).toBe(false)
      expect(result.reason).toContain("complex")
      expect(result.suggestion).toContain("deep")
    })

    it("should accept typo fixes", () => {
      const result = quickCategoryGate("fix a typo in the README")
      expect(result.valid).toBe(true)
    })

    it("should reject authentication implementation", () => {
      const result = quickCategoryGate("implement authentication")
      expect(result.valid).toBe(false)
    })
  })

  describe("ultrabrainCategoryGate", () => {
    it("should accept algorithm tasks", () => {
      const result = ultrabrainCategoryGate("optimize the sorting algorithm")
      expect(result.valid).toBe(true)
    })

    it("should reject simple tasks", () => {
      const result = ultrabrainCategoryGate("fix a typo")
      expect(result.valid).toBe(false)
    })
  })
})
```

### Pattern 5: Prompt Append Content Tests

```typescript
describe("Category Prompt Appends", () => {
  describe("getCategoryPromptAppend", () => {
    it("should return prompt content for visual-engineering", () => {
      const append = getCategoryPromptAppend("visual-engineering")
      expect(append).toContain("frontend specialist")
      expect(append).toContain("pixel-perfect")
      expect(append).toContain("accessibility")
    })

    it("should return prompt content for ultrabrain", () => {
      const append = getCategoryPromptAppend("ultrabrain")
      expect(append).toContain("difficult problem")
      expect(append).toContain("step by step")
    })

    it("should return empty string for unknown category", () => {
      const append = getCategoryPromptAppend("nonexistent")
      expect(append).toBe("")
    })
  })

  describe("All categories have prompt appends", () => {
    const categories = getAvailableCategories()
    
    for (const category of categories) {
      it(`should have prompt append for ${category}`, () => {
        const append = getCategoryPromptAppend(category)
        expect(append.length).toBeGreaterThan(50)
      })
    }
  })
})
```

## Step-by-Step Implementation

### Step 1: Create test directory structure

**ACTION**: CREATE
**TARGET**: `.opencode/tests/integration/`

```bash
mkdir -p .opencode/tests/integration
mkdir -p .opencode/tests/integration/hooks
mkdir -p .opencode/tests/integration/wisdom
```

**GOTCHA**: The `.opencode/tests/` directory may need to be created if it doesn't exist. Integration tests go in a separate `integration/` subdirectory to distinguish from unit tests.

### Step 2: Create category-routing.test.ts

**ACTION**: CREATE
**TARGET**: `.opencode/tests/integration/category-routing.test.ts`

```typescript
/**
 * Category Routing Integration Tests
 * 
 * Tests verify:
 * - Category name → model/provider resolution
 * - Selection gate validation
 * - Prompt append content
 * - Full routing flow
 */

import { describe, it, expect } from "bun:test"
import { 
  resolveCategory, 
  isValidCategory, 
  getAvailableCategories,
  getCategoryPromptAppend 
} from "../../tools/delegate-task/category-selector"
import { 
  validateCategorySelection,
  quickCategoryGate,
  ultrabrainCategoryGate,
  artistryCategoryGate,
  deepCategoryGate,
  CATEGORY_MODEL_ROUTES,
  CATEGORY_PROMPT_APPENDS
} from "../../tools/delegate-task/constants"

// ============================================================
// CATEGORY RESOLUTION TESTS
// ============================================================

describe("Category Routing Integration", () => {
  describe("Category Resolution", () => {
    describe("resolveCategory", () => {
      // ============================================================
      // VALID CATEGORY TESTS
      // ============================================================
      
      describe("when category is valid", () => {
        it("should resolve visual-engineering to Gemini 3 Pro", () => {
          const result = resolveCategory("visual-engineering")
          expect(result).not.toBeNull()
          expect(result).toEqual({
            category: "visual-engineering",
            provider: "ollama-cloud",
            model: "gemini-3-pro-preview",
            label: "GEMINI-3-PRO",
            promptAppend: expect.any(String)
          })
          expect(result!.promptAppend).toContain("frontend specialist")
        })

        it("should resolve ultrabrain to GPT-5.3 Codex", () => {
          const result = resolveCategory("ultrabrain")
          expect(result).not.toBeNull()
          expect(result).toEqual({
            category: "ultrabrain",
            provider: "openai",
            model: "gpt-5.3-codex",
            label: "GPT-5.3-CODEX",
            promptAppend: expect.any(String)
          })
          expect(result!.promptAppend).toContain("difficult problem")
        })

        it("should resolve artistry to Gemini 3 Pro", () => {
          const result = resolveCategory("artistry")
          expect(result).not.toBeNull()
          expect(result!.provider).toBe("ollama-cloud")
          expect(result!.model).toBe("gemini-3-pro-preview")
        })

        it("should resolve quick to Claude Haiku", () => {
          const result = resolveCategory("quick")
          expect(result).not.toBeNull()
          expect(result).toEqual({
            category: "quick",
            provider: "anthropic",
            model: "claude-haiku-4-5-20251001",
            label: "CLAUDE-HAIKU-4-5",
            promptAppend: expect.any(String)
          })
          expect(result!.promptAppend).toContain("Quick task mode")
        })

        it("should resolve deep to Qwen 3.5 Plus", () => {
          const result = resolveCategory("deep")
          expect(result).not.toBeNull()
          expect(result!.provider).toBe("bailian-coding-plan-test")
          expect(result!.model).toBe("qwen3.5-plus")
        })

        it("should resolve unspecified-low to Claude Sonnet", () => {
          const result = resolveCategory("unspecified-low")
          expect(result).not.toBeNull()
          expect(result!.provider).toBe("anthropic")
          expect(result!.model).toBe("claude-sonnet-4-6")
        })

        it("should resolve unspecified-high to Claude Opus", () => {
          const result = resolveCategory("unspecified-high")
          expect(result).not.toBeNull()
          expect(result!.provider).toBe("anthropic")
          expect(result!.model).toBe("claude-opus-4-6")
        })

        it("should resolve writing to Kimi K2.5", () => {
          const result = resolveCategory("writing")
          expect(result).not.toBeNull()
          expect(result!.provider).toBe("bailian-coding-plan-test")
          expect(result!.model).toBe("kimi-k2.5")
        })
      })

      // ============================================================
      // INVALID CATEGORY TESTS
      // ============================================================

      describe("when category is invalid", () => {
        it("should return null for unknown category", () => {
          expect(resolveCategory("nonexistent")).toBeNull()
        })

        it("should return null for empty string", () => {
          expect(resolveCategory("")).toBeNull()
        })

        it("should return null for null-like values", () => {
          expect(resolveCategory("fake-category")).toBeNull()
        })

        it("should be case-sensitive", () => {
          expect(resolveCategory("QUICK")).toBeNull()
          expect(resolveCategory("UltraBrain")).toBeNull()
        })
      })
    })

    // ============================================================
    // VALIDATION TESTS
    // ============================================================

    describe("isValidCategory", () => {
      it("should return true for all 8 valid categories", () => {
        expect(isValidCategory("visual-engineering")).toBe(true)
        expect(isValidCategory("ultrabrain")).toBe(true)
        expect(isValidCategory("artistry")).toBe(true)
        expect(isValidCategory("quick")).toBe(true)
        expect(isValidCategory("deep")).toBe(true)
        expect(isValidCategory("unspecified-low")).toBe(true)
        expect(isValidCategory("unspecified-high")).toBe(true)
        expect(isValidCategory("writing")).toBe(true)
      })

      it("should return false for invalid categories", () => {
        expect(isValidCategory("invalid")).toBe(false)
        expect(isValidCategory("")).toBe(false)
        expect(isValidCategory("frontend")).toBe(false)
        expect(isValidCategory("backend")).toBe(false)
      })
    })

    // ============================================================
    // TABLE-DRIVEN TESTS FOR ALL MODEL ROUTES
    // ============================================================

    describe("All category model routes", () => {
      const categoryRoutes = [
        { category: "visual-engineering", expectedProvider: "ollama-cloud", expectedModel: "gemini-3-pro-preview", expectedLabel: "GEMINI-3-PRO" },
        { category: "ultrabrain", expectedProvider: "openai", expectedModel: "gpt-5.3-codex", expectedLabel: "GPT-5.3-CODEX" },
        { category: "artistry", expectedProvider: "ollama-cloud", expectedModel: "gemini-3-pro-preview", expectedLabel: "GEMINI-3-PRO" },
        { category: "quick", expectedProvider: "anthropic", expectedModel: "claude-haiku-4-5-20251001", expectedLabel: "CLAUDE-HAIKU-4-5" },
        { category: "deep", expectedProvider: "bailian-coding-plan-test", expectedModel: "qwen3.5-plus", expectedLabel: "QWEN3.5-PLUS" },
        { category: "unspecified-low", expectedProvider: "anthropic", expectedModel: "claude-sonnet-4-6", expectedLabel: "CLAUDE-SONNET-4-6" },
        { category: "unspecified-high", expectedProvider: "anthropic", expectedModel: "claude-opus-4-6", expectedLabel: "CLAUDE-OPUS-4-6" },
        { category: "writing", expectedProvider: "bailian-coding-plan-test", expectedModel: "kimi-k2.5", expectedLabel: "KIMI-K2.5" },
      ]

      for (const { category, expectedProvider, expectedModel, expectedLabel } of categoryRoutes) {
        it(`should route ${category} to ${expectedModel} via ${expectedProvider}`, () => {
          const result = resolveCategory(category)
          expect(result).not.toBeNull()
          expect(result!.category).toBe(category)
          expect(result!.provider).toBe(expectedProvider)
          expect(result!.model).toBe(expectedModel)
          expect(result!.label).toBe(expectedLabel)
        })
      }
    })
  })

  // ============================================================
  // AVAILABILITY TESTS
  // ============================================================

  describe("Category Availability", () => {
    describe("getAvailableCategories", () => {
      it("should return exactly 8 categories", () => {
        const categories = getAvailableCategories()
        expect(categories.length).toBe(8)
      })

      it("should include all expected categories", () => {
        const categories = getAvailableCategories()
        expect(categories).toContain("visual-engineering")
        expect(categories).toContain("ultrabrain")
        expect(categories).toContain("artistry")
        expect(categories).toContain("quick")
        expect(categories).toContain("deep")
        expect(categories).toContain("unspecified-low")
        expect(categories).toContain("unspecified-high")
        expect(categories).toContain("writing")
      })

      it("should match CATEGORY_MODEL_ROUTES keys", () => {
        const categories = getAvailableCategories()
        const routesKeys = Object.keys(CATEGORY_MODEL_ROUTES)
        expect(categories.sort()).toEqual(routesKeys.sort())
      })
    })
  })

  // ============================================================
  // PROMPT APPEND TESTS
  // ============================================================

  describe("Category Prompt Appends", () => {
    describe("getCategoryPromptAppend", () => {
      describe("visual-engineering", () => {
        it("should contain frontend specialist guidance", () => {
          const append = getCategoryPromptAppend("visual-engineering")
          expect(append).toContain("frontend specialist")
          expect(append).toContain("visual excellence")
        })

        it("should contain accessibility mention", () => {
          const append = getCategoryPromptAppend("visual-engineering")
          expect(append).toContain("Accessibility")
          expect(append).toContain("WCAG")
        })

        it("should contain pixel-perfect implementation guidance", () => {
          const append = getCategoryPromptAppend("visual-engineering")
          expect(append).toContain("Pixel-perfect")
          expect(append).toContain("responsive design")
        })
      })

      describe("ultrabrain", () => {
        it("should contain difficult problem context", () => {
          const append = getCategoryPromptAppend("ultrabrain")
          expect(append).toContain("difficult problem")
          expect(append).toContain("exceptional reasoning")
        })

        it("should contain step-by-step approach", () => {
          const append = getCategoryPromptAppend("ultrabrain")
          expect(append).toContain("step by step")
          expect(append).toContain("Quality over speed")
        })

        it("should contain systematic approach requirements", () => {
          const append = getCategoryPromptAppend("ultrabrain")
          expect(append).toContain("Break down")
          expect(append).toContain("edge cases")
          expect(append).toContain("tradeoffs")
        })
      })

      describe("artistry", () => {
        it("should contain creative problem-solving context", () => {
          const append = getCategoryPromptAppend("artistry")
          expect(append).toContain("creative")
          expect(append).toContain("unconventional")
        })

        it("should give permission to explore", () => {
          const append = getCategoryPromptAppend("artistry")
          expect(append).toContain("Permission to")
          expect(append).toContain("Challenge assumptions")
        })

        it("should discourage standard solutions", () => {
          const append = getCategoryPromptAppend("artistry")
          expect(append).toContain("Standard solutions discouraged")
        })
      })

      describe("quick", () => {
        it("should emphasize speed and minimalism", () => {
          const append = getCategoryPromptAppend("quick")
          expect(append).toContain("Speed")
          expect(append).toContain("Minimal changes")
          expect(append).toContain("No over-engineering")
        })

        it("should contain get in get out metaphor", () => {
          const append = getCategoryPromptAppend("quick")
          expect(append).toContain("Get in, make the change, get out")
        })
      })

      describe("deep", () => {
        it("should emphasize investigation", () => {
          const append = getCategoryPromptAppend("deep")
          expect(append).toContain("investigation mission")
          expect(append).toContain("Research thoroughly")
        })

        it("should require evidence", () => {
          const append = getCategoryPromptAppend("deep")
          expect(append).toContain("Verify findings")
          expect(append).toContain("evidence")
        })

        it("should mention tool usage", () => {
          const append = getCategoryPromptAppend("deep")
          expect(append).toContain("grep, read, search")
        })
      })

      describe("unspecified-low", () => {
        it("should emphasize clear implementation", () => {
          const append = getCategoryPromptAppend("unspecified-low")
          expect(append).toContain("Clear implementation")
          expect(append).toContain("existing patterns")
        })

        it("should mention proper error handling", () => {
          const append = getCategoryPromptAppend("unspecified-low")
          expect(append).toContain("error handling")
        })
      })

      describe("unspecified-high", () => {
        it("should emphasize thoroughness", () => {
          const append = getCategoryPromptAppend("unspecified-high")
          expect(append).toContain("Thoroughness")
          expect(append).toContain("Correctness")
        })

        it("should mention edge cases", () => {
          const append = getCategoryPromptAppend("unspecified-high")
          expect(append).toContain("Edge case handling")
        })

        it("should emphasize documentation", () => {
          const append = getCategoryPromptAppend("unspecified-high")
          expect(append).toContain("documentation")
        })
      })

      describe("writing", () => {
        it("should identify as technical writer", () => {
          const append = getCategoryPromptAppend("writing")
          expect(append).toContain("technical writer")
        })

        it("should emphasize clarity", () => {
          const append = getCategoryPromptAppend("writing")
          expect(append).toContain("Clarity")
          expect(append).toContain("readability")
        })

        it("should mention audience-appropriate language", () => {
          const append = getCategoryPromptAppend("writing")
          expect(append).toContain("Audience-appropriate")
        })
      })

      describe("invalid category", () => {
        it("should return empty string for unknown category", () => {
          const append = getCategoryPromptAppend("nonexistent")
          expect(append).toBe("")
        })

        it("should return empty string for empty string", () => {
          const append = getCategoryPromptAppend("")
          expect(append).toBe("")
        })
      })
    })

    describe("All categories have substantial prompts", () => {
      const categories = getAvailableCategories()

      for (const category of categories) {
        it(`should have prompt append with minimum 50 characters for ${category}`, () => {
          const append = getCategoryPromptAppend(category)
          expect(append.length).toBeGreaterThan(50)
        })
      }
    })
  })

  // ============================================================
  // SELECTION GATE TESTS
  // ============================================================

  describe("Selection Gates", () => {
    describe("quickCategoryGate", () => {
      describe("rejection cases", () => {
        it("should reject architecture tasks", () => {
          const result = quickCategoryGate("refactor the architecture for better scalability")
          expect(result.valid).toBe(false)
          expect(result.reason).toContain("complex")
          expect(result.suggestion).toContain("deep")
        })

        it("should reject security-related tasks", () => {
          const result = quickCategoryGate("implement security authentication")
          expect(result.valid).toBe(false)
        })

        it("should reject database migration tasks", () => {
          const result = quickCategoryGate("create database migration for users table")
          expect(result.valid).toBe(false)
        })

        it("should reject performance optimization tasks", () => {
          const result = quickCategoryGate("optimize performance of the API")
          expect(result.valid).toBe(false)
        })

        it("should reject multi-file refactoring", () => {
          const result = quickCategoryGate("refactor multiple files for consistency")
          expect(result.valid).toBe(false)
        })

        it("should reject feature implementation", () => {
          const result = quickCategoryGate("implement feature for user dashboard")
          expect(result.valid).toBe(false)
        })

        it("should reject complex keyword: design", () => {
          const result = quickCategoryGate("design new component library")
          expect(result.valid).toBe(false)
        })

        it("should reject complex keyword: encryption", () => {
          const result = quickCategoryGate("add encryption to sensitive data")
          expect(result.valid).toBe(false)
        })

        it("should reject complex keyword: algorithm", () => {
          const result = quickCategoryGate("fix algorithm complexity issue")
          expect(result.valid).toBe(false)
        })
      })

      describe("acceptance cases", () => {
        it("should accept typo fixes", () => {
          const result = quickCategoryGate("fix a typo in the README")
          expect(result.valid).toBe(true)
        })

        it("should accept simple variable renames", () => {
          const result = quickCategoryGate("rename variable xyz to abc")
          expect(result.valid).toBe(true)
        })

        it("should accept comment fixes", () => {
          const result = quickCategoryGate("update comment in utils.ts")
          expect(result.valid).toBe(true)
        })

        it("should accept log statement additions", () => {
          const result = quickCategoryGate("add logging statement for debug")
          expect(result.valid).toBe(true)
        })

        it("should accept simple configuration changes", () => {
          const result = quickCategoryGate("change timeout from 30 to 60 seconds")
          expect(result.valid).toBe(true)
        })
      })
    })

    describe("ultrabrainCategoryGate", () => {
      describe("acceptance cases (genuinely hard)", () => {
        it("should accept algorithm tasks", () => {
          const result = ultrabrainCategoryGate("optimize sorting algorithm for large datasets")
          expect(result.valid).toBe(true)
        })

        it("should accept architecture design tasks", () => {
          const result = ultrabrainCategoryGate("design distributed system architecture")
          expect(result.valid).toBe(true)
        })

        it("should accept compiler-related tasks", () => {
          const result = ultrabrainCategoryGate("implement compiler optimization pass")
          expect(result.valid).toBe(true)
        })

        it("should accept security encryption tasks", () => {
          const result = ultrabrainCategoryGate("design secure encryption protocol")
          expect(result.valid).toBe(true)
        })

        it("should accept complex reasoning tasks", () => {
          const result = ultrabrainCategoryGate("complex reasoning for constraint satisfaction")
          expect(result.valid).toBe(true)
        })

        it("should accept design system tasks", () => {
          const result = ultrabrainCategoryGate("create extensible design system architecture")
          expect(result.valid).toBe(true)
        })

        it("should accept pattern recognition tasks", () => {
          const result = ultrabrainCategoryGate("implement pattern recognition for anomaly detection")
          expect(result.valid).toBe(true)
        })
      })

      describe("rejection cases (simple tasks)", () => {
        it("should reject simple typo fixes", () => {
          const result = ultrabrainCategoryGate("fix a typo in the code")
          expect(result.valid).toBe(false)
        })

        it("should reject simple styling tasks", () => {
          const result = ultrabrainCategoryGate("change button color to blue")
          expect(result.valid).toBe(false)
        })

        it("should reject simple text changes", () => {
          const result = ultrabrainCategoryGate("update text content")
          expect(result.valid).toBe(false)
        })
      })
    })

    describe("artistryCategoryGate", () => {
      describe("creative task acceptance", () => {
        it("should accept creative tasks", () => {
          const result = artistryCategoryGate("implement creative solution for UX")
          expect(result.valid).toBe(true)
        })

        it("should accept innovative tasks", () => {
          const result = artistryCategoryGate("design innovative approach to data visualization")
          expect(result.valid).toBe(true)
        })

        it("should accept unconventional tasks", () => {
          const result = artistryCategoryGate("use unconventional pattern for this problem")
          expect(result.valid).toBe(true)
        })

        it("should accept novel tasks", () => {
          const result = artistryCategoryGate("implement novel caching strategy")
          expect(result.valid).toBe(true)
        })
      })

      describe("conventional task warnings", () => {
        it("should warn for conventional tasks", () => {
          const result = artistryCategoryGate("implement standard CRUD operations")
          expect(result.valid).toBe(true) // Still valid, but with warning
          expect(result.reason).toContain("conventional")
        })

        it("should warn but accept routine tasks", () => {
          const result = artistryCategoryGate("update configuration file")
          expect(result.valid).toBe(true)
          expect(result.reason).toBeDefined()
        })
      })
    })

    describe("deepCategoryGate", () => {
      describe("research task acceptance", () => {
        it("should accept investigate tasks", () => {
          const result = deepCategoryGate("investigate the memory leak issue")
          expect(result.valid).toBe(true)
        })

        it("should accept research tasks", () => {
          const result = deepCategoryGate("research best practices for caching")
          expect(result.valid).toBe(true)
        })

        it("should accept explore tasks", () => {
          const result = deepCategoryGate("explore the codebase for unused dependencies")
          expect(result.valid).toBe(true)
        })

        it("should accept analyze tasks", () => {
          const result = deepCategoryGate("analyze the performance bottleneck")
          expect(result.valid).toBe(true)
        })

        it("should accept debug tasks", () => {
          const result = deepCategoryGate("debug the connection timeout issue")
          expect(result.valid).toBe(true)
        })

        it("should accept understand tasks", () => {
          const result = deepCategoryGate("understand how the auth flow works")
          expect(result.valid).toBe(true)
        })
      })

      describe("non-research task warnings", () => {
        it("should warn for simple implementation tasks", () => {
          const result = deepCategoryGate("implement a button component")
          expect(result.valid).toBe(true) // Still valid, but with warning
          expect(result.reason).toBeDefined()
        })
      })
    })

    describe("validateCategorySelection", () => {
      it("should route quick tasks to quickCategoryGate", () => {
        const result = validateCategorySelection("quick", "refactor architecture")
        expect(result.valid).toBe(false)
      })

      it("should route ultrabrain tasks to ultrabrainCategoryGate", () => {
        const result = validateCategorySelection("ultrabrain", "simple fix")
        expect(result.valid).toBe(false)
      })

      it("should route artistry tasks to artistryCategoryGate", () => {
        const result = validateCategorySelection("artistry", "creative design")
        expect(result.valid).toBe(true)
      })

      it("should route deep tasks to deepCategoryGate", () => {
        const result = validateCategorySelection("deep", "investigate issue")
        expect(result.valid).toBe(true)
      })

      it("should pass through for other categories", () => {
        const result = validateCategorySelection("visual-engineering", "build UI")
        expect(result.valid).toBe(true)
      })

      it("should pass through for writing category", () => {
        const result = validateCategorySelection("writing", "write documentation")
        expect(result.valid).toBe(true)
      })
    })
  })

  // ============================================================
  // CATEGORY CONSTANTS INTEGRITY TESTS
  // ============================================================

  describe("Category Constants Integrity", () => {
    it("should have matching keys between CATEGORY_MODEL_ROUTES and CATEGORY_PROMPT_APPENDS", () => {
      const routeKeys = Object.keys(CATEGORY_MODEL_ROUTES).sort()
      const appendKeys = Object.keys(CATEGORY_PROMPT_APPENDS).sort()
      expect(routeKeys).toEqual(appendKeys)
    })

    it("should have 8 categories defined", () => {
      expect(Object.keys(CATEGORY_MODEL_ROUTES).length).toBe(8)
      expect(Object.keys(CATEGORY_PROMPT_APPENDS).length).toBe(8)
    })

    it("should have non-empty model for each category", () => {
      for (const [category, route] of Object.entries(CATEGORY_MODEL_ROUTES)) {
        expect(route.model).toBeTruthy()
        expect(route.model.length).toBeGreaterThan(0)
      }
    })

    it("should have non-empty provider for each category", () => {
      for (const [category, route] of Object.entries(CATEGORY_MODEL_ROUTES)) {
        expect(route.provider).toBeTruthy()
        expect(route.provider.length).toBeGreaterThan(0)
      }
    })

    it("should have non-empty label for each category", () => {
      for (const [category, route] of Object.entries(CATEGORY_MODEL_ROUTES)) {
        expect(route.label).toBeTruthy()
        expect(route.label.length).toBeGreaterThan(0)
      }
    })
  })
})
```

**GOTCHA**: Import paths use `../../tools/delegate-task/` from `.opencode/tests/integration/` directory. Make sure the relative path is correct.

### Step 3: Validate tests pass

**ACTION**: RUN
**TARGET**: Run tests to verify

```bash
cd .opencode && bun test tests/integration/category-routing.test.ts
```

**VALIDATE**: All tests pass with `bun test --grep "Category Routing"` 

## Testing Strategy

### Unit Tests

All tests in this file are unit tests for routing logic. No AI calls, no network requests, pure function testing.

### Integration Tests

This file tests the integration between:
- Category definitions (`constants.ts`)
- Category resolution (`category-selector.ts`)
- Selection gates (`constants.ts`)

### Edge Cases

- Unknown category returns null
- Empty string category returns null/empty
- Case-sensitive category names
- Gate validation for quick, ultrabrain, artistry, deep
- All 8 categories have model routes and prompt appends

## Validation Commands

```bash
# L1: Lint (not configured for .opencode)
# L2: Types
cd .opencode && bun run tsc --noEmit

# L3: Unit Tests
bun test tests/integration/category-routing.test.ts

# L4: Integration Tests
bun test --grep "Category Routing"

# L5: Manual verification
# Check test output for all pass/fail details
```

## Acceptance Criteria

### Implementation

- [ ] Test file created at `.opencode/tests/integration/category-routing.test.ts`
- [ ] All 8 category model routes tested
- [ ] All selection gates tested (quick, ultrabrain, artistry, deep)
- [ ] Prompt append content verified for all categories
- [ ] Invalid category handling tested
- [ ] Gate validation edge cases covered

### Runtime

- [ ] All tests pass with `bun test`
- [ ] No TypeScript errors
- [ ] Tests run in under 5 seconds (pure function tests)

## Completion Checklist

- [ ] All tests implemented and passing
- [ ] Category resolution tested for all 8 categories
- [ ] Selection gates tested with acceptance and rejection cases
- [ ] Prompt appends verified for content
- [ ] Constant integrity verified
- [ ] No lint errors

## Handoff Notes

After completing this task, proceed to **Task 2: Skill Loader Integration Tests**. The skill loader tests will verify that skills are discovered from `.opencode/skills/` and correctly formatted for prompt injection. The category routing tested here will be combined with skill loading in the full dispatch flow.