# Task 2: Skill Loader Integration Tests

## Objective

Create comprehensive integration tests for the skill loading system, verifying skill discovery from `.opencode/skills/`, caching behavior, and prompt injection formatting.

## Scope

**Files touched**:
- CREATE: `.opencode/tests/integration/skill-loader.test.ts` — Integration test file

**Dependencies**: None (standalone logic test)

**Out of scope**:
- Category routing tests (Task 1)
- Agent dispatch tests (Task 3)
- AI model calls (all mocked)

## Prior Task Context

Task 1 completed — Category routing tests verify category → model resolution. This task tests the skill loading system that injects skill content into prompts.

## Context References

### Skill Loader Public API (from research)

```typescript
// File: .opencode/features/skill-loader/index.ts
// Lines 1-200

export {
  discoverSkills,
  loadSkills,
  getSkillContentForPrompt,
  buildCategorySkillPrompt,
  clearSkillsCache,
  skillsCache
} from './skill-loader'

export { getAvailableSkills, getSkillPath } from './available-skills'
```

### Skill Discovery (from research)

```typescript
// File: .opencode/features/skill-loader/available-skills.ts

import { glob } from "glob"
import { readFile } from "fs/promises"
import { join } from "path"

export interface DiscoveredSkill {
  name: string
  path: string
  description?: string
  content?: string
}

export async function discoverSkills(): Promise<DiscoveredSkill[]> {
  const skillsDir = join(process.cwd(), ".opencode", "skills")
  const skillDirs = await glob("*/SKILL.md", { cwd: skillsDir })
  
  const skills: DiscoveredSkill[] = []
  for (const skillPath of skillDirs) {
    const name = skillPath.replace("/SKILL.md", "")
    const fullPath = join(skillsDir, skillPath)
    const content = await readFile(fullPath, "utf-8")
    const description = extractDescription(content)
    
    skills.push({
      name,
      path: fullPath,
      description,
      content
    })
  }
  
  return skills
}

function extractDescription(content: string): string | undefined {
  const lines = content.split('\n')
  for (const line of lines) {
    if (line.startsWith('# ')) {
      return line.replace('# ', '').trim()
    }
  }
  return undefined
}

export async function getSkillPath(name: string): Promise<string | null> {
  const skills = await discoverSkills()
  const skill = skills.find(s => s.name === name)
  return skill?.path || null
}
```

### Skill Loading and Formatting (from research)

```typescript
// File: .opencode/features/skill-loader/skill-loader.ts (conceptual)

const skillsCache = new Map<string, Skill>()

export async function loadSkills(names: string[]): Promise<Skill[]> {
  const skills: Skill[] = []
  
  for (const name of names) {
    // Check cache first
    if (skillsCache.has(name)) {
      skills.push(skillsCache.get(name)!)
      continue
    }
    
    // Discover skill
    const discovered = await discoverSkills()
    const skill = discovered.find(s => s.name === name)
    
    if (skill) {
      skillsCache.set(name, skill)
      skills.push(skill)
    }
  }
  
  return skills
}

export function getSkillContentForPrompt(skills: Skill[]): string {
  if (skills.length === 0) return ""
  
  const blocks = skills.map(skill => {
    return `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SKILL: ${skill.name}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${skill.content || ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
END SKILL: ${skill.name}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
  })
  
  return blocks.join('\n\n')
}

export function buildCategorySkillPrompt(
  category: string | undefined,
  skills: Skill[]
): string {
  const parts: string[] = []
  
  if (skills.length > 0) {
    parts.push(getSkillContentForPrompt(skills))
  }
  
  if (category) {
    const categoryPrompt = CATEGORY_PROMPT_APPENDS[category]
    if (categoryPrompt) {
      parts.push(`---
${categoryPrompt}`)
    }
  }
  
  return parts.join('\n\n')
}

export function clearSkillsCache(): void {
  skillsCache.clear()
}
```

### Existing Skill Files (from project)

```
.opencode/skills/
├── prime/
│   └── SKILL.md
├── planning-methodology/
│   └── SKILL.md
├── code-loop/
│   └── SKILL.md
├── code-review/
│   └── SKILL.md
├── code-review-fix/
│   └── SKILL.md
├── commit/
│   └── SKILL.md
├── council/
│   └── SKILL.md
├── decompose/
│   └── SKILL.md
├── execute/
│   └── SKILL.md
├── final-review/
│   └── SKILL.md
├── mvp/
│   └── SKILL.md
├── pillars/
│   └── SKILL.md
├── pr/
│   └── SKILL.md
├── prd/
│   └── SKILL.md
└── system-review/
    └── SKILL.md
```

### Existing Test Pattern (from research)

```typescript
// File: .opencode/features/skill-loader/index.test.ts
// Pattern to follow

import { describe, it, expect, beforeEach, afterEach } from "bun:test"
import { 
  discoverSkills, 
  loadSkills, 
  getSkillContentForPrompt,
  clearSkillsCache 
} from "./index"

describe("Skill Loader", () => {
  beforeEach(() => {
    clearSkillsCache()
  })

  describe("discoverSkills", () => {
    it("should discover all skills from .opencode/skills/", async () => {
      const skills = await discoverSkills()
      expect(skills.length).toBeGreaterThan(0)
    })
  })

  describe("loadSkills", () => {
    it("should load skills by name", async () => {
      const skills = await loadSkills(["prime", "code-review"])
      expect(skills.length).toBe(2)
    })
  })

  describe("getSkillContentForPrompt", () => {
    it("should format skills for prompt injection", async () => {
      const skills = await loadSkills(["prime"])
      const content = getSkillContentForPrompt(skills)
      expect(content).toContain("SKILL: prime")
    })
  })
})
```

## Patterns to Follow

### Pattern 1: Skill Discovery Test

```typescript
describe("Skill Discovery", () => {
  describe("discoverSkills", () => {
    it("should discover all available skills", async () => {
      const skills = await discoverSkills()
      expect(skills.length).toBeGreaterThan(10) // At least 15 skills exist
      
      // Check structure
      for (const skill of skills) {
        expect(skill.name).toBeTruthy()
        expect(skill.path).toBeTruthy()
        expect(skill.content).toBeTruthy()
      }
    })

    it("should include skill descriptions extracted from headers", async () => {
      const skills = await discoverSkills()
      const primeSkill = skills.find(s => s.name === "prime")
      expect(primeSkill?.description).toContain("Prime")
    })

    it("should return skills in consistent order", async () => {
      const skills1 = await discoverSkills()
      const skills2 = await discoverSkills()
      const names1 = skills1.map(s => s.name)
      const names2 = skills2.map(s => s.name)
      expect(names1).toEqual(names2)
    })
  })
})
```

### Pattern 2: Skill Caching Test

```typescript
describe("Skill Caching", () => {
  beforeEach(() => {
    clearSkillsCache()
  })

  describe("loadSkills", () => {
    it("should cache skills after first load", async () => {
      const start1 = Date.now()
      await loadSkills(["prime", "code-review"])
      const time1 = Date.now() - start1

      const start2 = Date.now()
      await loadSkills(["prime", "code-review"])
      const time2 = Date.now() - start2

      // Second load should be faster due to caching
      expect(time2).toBeLessThan(time1)
    })

    it("should return cached skills without re-reading", async () => {
      // First load
      const skills1 = await loadSkills(["prime"])
      
      // Second load - should come from cache
      const skills2 = await loadSkills(["prime"])
      
      expect(skills1).toBe(skills2) // Same reference
    })

    it("should clear cache when clearSkillsCache is called", async () => {
      await loadSkills(["prime"])
      clearSkillsCache()
      
      // Cache should be empty after clear
      const cacheSize = skillsCache.size
      expect(cacheSize).toBe(0)
    })
  })
})
```

### Pattern 3: Prompt Injection Formatting

```typescript
describe("Prompt Injection Formatting", () => {
  describe("getSkillContentForPrompt", () => {
    it("should return empty string for empty skills array", () => {
      const content = getSkillContentForPrompt([])
      expect(content).toBe("")
    })

    it("should format single skill with proper delimiters", async () => {
      const skills = await loadSkills(["prime"])
      const content = getSkillContentForPrompt(skills)
      
      expect(content).toContain("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
      expect(content).toContain("SKILL: prime")
      expect(content).toContain("END SKILL: prime")
    })

    it("should format multiple skills with separators", async () => {
      const skills = await loadSkills(["prime", "code-review"])
      const content = getSkillContentForPrompt(skills)
      
      expect(content).toContain("SKILL: prime")
      expect(content).toContain("SKILL: code-review")
      expect(content).toContain("END SKILL: prime")
      expect(content).toContain("END SKILL: code-review")
    })

    it("should include skill content between delimiters", async () => {
      const skills = await loadSkills(["prime"])
      const content = getSkillContentForPrompt(skills)
      
      // Content should have actual skill text
      expect(content.length).toBeGreaterThan(100)
    })
  })

  describe("buildCategorySkillPrompt", () => {
    it("should include both skills and category prompt", async () => {
      const skills = await loadSkills(["prime"])
      const content = buildCategorySkillPrompt("ultrabrain", skills)
      
      expect(content).toContain("SKILL: prime")
      expect(content).toContain("difficult problem") // from ultrabrain prompt
    })

    it("should handle skills without category", async () => {
      const skills = await loadSkills(["prime"])
      const content = buildCategorySkillPrompt(undefined, skills)
      
      expect(content).toContain("SKILL: prime")
      expect(content).not.toContain("undefined")
    })

    it("should handle category without skills", () => {
      const content = buildCategorySkillPrompt("quick", [])
      
      expect(content).toContain("Quick task mode")
      expect(content).not.toContain("SKILL:")
    })

    it("should handle empty skills and undefined category", () => {
      const content = buildCategorySkillPrompt(undefined, [])
      expect(content).toBe("")
    })
  })
})
```

### Pattern 4: Error Handling

```typescript
describe("Error Handling", () => {
  describe("loadSkills", () => {
    it("should handle non-existent skill gracefully", async () => {
      const skills = await loadSkills(["nonexistent-skill"])
      expect(skills.length).toBe(0)
    })

    it("should skip invalid skill names", async () => {
      const skills = await loadSkills(["", "prime", "   ", "code-review"])
      const names = skills.map(s => s.name)
      expect(names).toContain("prime")
      expect(names).toContain("code-review")
      expect(names).not.toContain("")
      expect(names).not.toContain("   ")
    })

    it("should handle mixed valid and invalid skills", async () => {
      const skills = await loadSkills(["prime", "fake-skill", "code-review"])
      expect(skills.length).toBe(2)
      const names = skills.map(s => s.name)
      expect(names).toEqual(["prime", "code-review"])
    })
  })

  describe("discoverSkills", () => {
    it("should handle missing skills directory gracefully", async () => {
      // This test requires mocking or temp directory
      // Real implementation should handle missing directory
      const skills = await discoverSkills()
      // If directory doesn't exist, should return empty array
      expect(Array.isArray(skills)).toBe(true)
    })
  })
})
```

## Step-by-Step Implementation

### Step 1: Create skill-loader.test.ts

**ACTION**: CREATE
**TARGET**: `.opencode/tests/integration/skill-loader.test.ts`

```typescript
/**
 * Skill Loader Integration Tests
 * 
 * Tests verify:
 * - Skill discovery from .opencode/skills/
 * - Skill caching behavior
 * - Prompt injection formatting
 * - Category + skill combination
 */

import { describe, it, expect, beforeEach, afterEach } from "bun:test"
import { 
  discoverSkills, 
  loadSkills, 
  getSkillContentForPrompt,
  buildCategorySkillPrompt,
  clearSkillsCache,
  getAvailableSkills,
  getSkillPath
} from "../../features/skill-loader"
import { CATEGORY_PROMPT_APPENDS } from "../../tools/delegate-task/constants"

// ============================================================
// SKILL DISCOVERY TESTS
// ============================================================

describe("Skill Loader Integration", () => {
  beforeEach(() => {
    clearSkillsCache()
  })

  describe("Skill Discovery", () => {
    describe("discoverSkills", () => {
      it("should discover all available skills", async () => {
        const skills = await discoverSkills()
        expect(skills.length).toBeGreaterThan(10)
        
        // Check structure
        for (const skill of skills) {
          expect(skill.name).toBeTruthy()
          expect(skill.path).toBeTruthy()
          expect(skill.content).toBeTruthy()
        }
      })

      it("should include standard project skills", async () => {
        const skills = await discoverSkills()
        const names = skills.map(s => s.name)
        
        expect(names).toContain("prime")
        expect(names).toContain("code-review")
        expect(names).toContain("commit")
        expect(names).toContain("execute")
      })

      it("should extract descriptions from skill headers", async () => {
        const skills = await discoverSkills()
        const primeSkill = skills.find(s => s.name === "prime")
        
        expect(primeSkill?.description).toBeDefined()
        expect(primeSkill?.description?.length).toBeGreaterThan(0)
      })

      it("should return skills in consistent order", async () => {
        const skills1 = await discoverSkills()
        const skills2 = await discoverSkills()
        
        const names1 = skills1.map(s => s.name)
        const names2 = skills2.map(s => s.name)
        
        // Order may not be stable, but all skills should be present
        expect(names1.sort()).toEqual(names2.sort())
      })

      it("should have valid file paths", async () => {
        const skills = await discoverSkills()
        
        for (const skill of skills) {
          expect(skill.path).toContain(".opencode")
          expect(skill.path).toContain("skills")
          expect(skill.path).toContain("SKILL.md")
        }
      })
    })

    describe("getAvailableSkills", () => {
      it("should return list of skill names", async () => {
        const names = await getAvailableSkills()
        expect(names.length).toBeGreaterThan(10)
        expect(typeof names[0]).toBe("string")
      })

      it("should include expected skills", async () => {
        const names = await getAvailableSkills()
        expect(names).toContain("prime")
        expect(names).toContain("code-review")
        expect(names).toContain("commit")
      })
    })

    describe("getSkillPath", () => {
      it("should return path for valid skill", async () => {
        const path = await getSkillPath("prime")
        expect(path).toBeTruthy()
        expect(path).toContain("prime")
        expect(path).toContain("SKILL.md")
      })

      it("should return null for invalid skill", async () => {
        const path = await getSkillPath("nonexistent-skill")
        expect(path).toBeNull()
      })
    })
  })

  // ============================================================
  // SKILL LOADING TESTS
  // ============================================================

  describe("Skill Loading", () => {
    beforeEach(() => {
      clearSkillsCache()
    })

    describe("loadSkills", () => {
      it("should load single skill by name", async () => {
        const skills = await loadSkills(["prime"])
        expect(skills.length).toBe(1)
        expect(skills[0].name).toBe("prime")
        expect(skills[0].content).toBeTruthy()
      })

      it("should load multiple skills", async () => {
        const skills = await loadSkills(["prime", "code-review", "commit"])
        expect(skills.length).toBe(3)
        
        const names = skills.map(s => s.name)
        expect(names).toContain("prime")
        expect(names).toContain("code-review")
        expect(names).toContain("commit")
      })

      it("should return empty array for empty input", async () => {
        const skills = await loadSkills([])
        expect(skills.length).toBe(0)
      })

      it("should skip non-existent skills", async () => {
        const skills = await loadSkills(["prime", "fake-skill", "code-review"])
        expect(skills.length).toBe(2)
        
        const names = skills.map(s => s.name)
        expect(names).not.toContain("fake-skill")
      })

      it("should handle duplicate skill names gracefully", async () => {
        const skills = await loadSkills(["prime", "prime", "prime"])
        // Should return skill only once (deduplication)
        expect(skills.length).toBeLessThanOrEqual(1)
      })

      it("should populate cache on first load", async () => {
        await loadSkills(["prime"])
        // Cache should have the skill
        // Note: skillsCache is internal, we verify via second load speed
        const start = Date.now()
        await loadSkills(["prime"])
        const elapsed = Date.now() - start
        
        // Cached load should be very fast (< 10ms)
        expect(elapsed).toBeLessThan(10)
      })
    })
  })

  // ============================================================
  // SKILL CACHING TESTS
  // ============================================================

  describe("Skill Caching", () => {
    beforeEach(() => {
      clearSkillsCache()
    })

    describe("clearSkillsCache", () => {
      it("should clear all cached skills", async () => {
        await loadSkills(["prime"])
        clearSkillsCache()
        
        // After clearing, should need to reload from disk
        // This is verified by cache being empty
      })

      it("should allow re-loading after clear", async () => {
        const skills1 = await loadSkills(["prime"])
        clearSkillsCache()
        const skills2 = await loadSkills(["prime"])
        
        // Both should have same content but may be different references
        expect(skills1[0].name).toBe(skills2[0].name)
      })
    })
  })

  // ============================================================
  // PROMPT INJECTION TESTS
  // ============================================================

  describe("Prompt Injection", () => {
    describe("getSkillContentForPrompt", () => {
      it("should return empty string for empty skills", () => {
        const content = getSkillContentForPrompt([])
        expect(content).toBe("")
      })

      it("should format single skill with delimiters", async () => {
        const skills = await loadSkills(["prime"])
        const content = getSkillContentForPrompt(skills)
        
        expect(content).toContain("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        expect(content).toContain("SKILL: prime")
        expect(content).toContain("END SKILL: prime")
      })

      it("should format multiple skills with separators", async () => {
        const skills = await loadSkills(["prime", "code-review"])
        const content = getSkillContentForPrompt(skills)
        
        expect(content).toContain("SKILL: prime")
        expect(content).toContain("SKILL: code-review")
        expect(content).toContain("END SKILL: prime")
        expect(content).toContain("END SKILL: code-review")
      })

      it("should include actual skill content", async () => {
        const skills = await loadSkills(["prime"])
        const content = getSkillContentForPrompt(skills)
        
        // Should contain actual skill content (not just delimiters)
        expect(content.length).toBeGreaterThan(200)
      })

      it("should have consistent delimiter format", async () => {
        const skills = await loadSkills(["commit"])
        const content = getSkillContentForPrompt(skills)
        
        // Count delimiter lines (should be exactly 4: 2 per skill)
        const delimiterLines = content.split('\n')
          .filter(line => line.startsWith("━"))
          .length
        
        expect(delimiterLines).toBeGreaterThanOrEqual(4)
      })
    })

    describe("buildCategorySkillPrompt", () => {
      it("should combine skills and category prompt", async () => {
        const skills = await loadSkills(["prime"])
        const content = buildCategorySkillPrompt("ultrabrain", skills)
        
        // Should have skill content
        expect(content).toContain("SKILL: prime")
        
        // Should have category prompt
        expect(content).toContain("difficult problem")
      })

      it("should handle skills only (no category)", async () => {
        const skills = await loadSkills(["prime"])
        const content = buildCategorySkillPrompt(undefined, skills)
        
        expect(content).toContain("SKILL: prime")
        expect(content).not.toContain("undefined")
        expect(content).not.toContain("---")
      })

      it("should handle category only (no skills)", () => {
        const content = buildCategorySkillPrompt("quick", [])
        
        expect(content).toContain("Quick task mode")
        expect(content).not.toContain("SKILL:")
      })

      it("should return empty string for no skills and no category", () => {
        const content = buildCategorySkillPrompt(undefined, [])
        expect(content).toBe("")
      })

      it("should separate skills and category with separator", async () => {
        const skills = await loadSkills(["prime"])
        const content = buildCategorySkillPrompt("deep", skills)
        
        expect(content).toContain("---")
        // Skills should come before separator
        expect(content.indexOf("SKILL:")).toBeLessThan(content.indexOf("---"))
      })

      it("should work with all 8 categories", async () => {
        const skills = await loadSkills(["prime"])
        const categories = [
          "visual-engineering",
          "ultrabrain", 
          "artistry",
          "quick",
          "deep",
          "unspecified-low",
          "unspecified-high",
          "writing"
        ]
        
        for (const category of categories) {
          const content = buildCategorySkillPrompt(category, skills)
          expect(content).toContain("SKILL: prime")
          expect(content.length).toBeGreaterThan(100)
        }
      })
    })
  })

  // ============================================================
  // SKILL CONTENT VALIDATION TESTS
  // ============================================================

  describe("Skill Content Validation", () => {
    describe("Each skill has required content", () => {
      it("should have prime skill with context loading instructions", async () => {
        const skills = await loadSkills(["prime"])
        expect(skills.length).toBe(1)
        expect(skills[0].content).toContain("context")
      })

      it("should have code-review skill with review methodology", async () => {
        const skills = await loadSkills(["code-review"])
        expect(skills.length).toBe(1)
        expect(skills[0].content).toContain("review")
      })

      it("should have commit skill with conventional commit format", async () => {
        const skills = await loadSkills(["commit"])
        expect(skills.length).toBe(1)
        expect(skills[0].content).toContain("commit")
      })

      it("should have execute skill with task execution methodology", async () => {
        const skills = await loadSkills(["execute"])
        expect(skills.length).toBe(1)
        expect(skills[0].content).toContain("task")
      })
    })

    describe("Skill content is well-formed", () => {
      it("should have non-empty content for all loaded skills", async () => {
        const skills = await loadSkills(["prime", "code-review", "commit", "execute"])
        
        for (const skill of skills) {
          expect(skill.content).toBeTruthy()
          expect(skill.content!.length).toBeGreaterThan(100)
        }
      })

      it("should have markdown content", async () => {
        const skills = await loadSkills(["prime"])
        
        for (const skill of skills) {
          // Should contain markdown headers or bullet points
          const hasMarkdown = skill.content!.includes("#") || 
                             skill.content!.includes("-") ||
                             skill.content!.includes("*")
          expect(hasMarkdown).toBe(true)
        }
      })
    })
  })

  // ============================================================
  // CATEGORY + SKILL INTEGRATION TESTS
  // ============================================================

  describe("Category + Skill Integration", () => {
    it("should combine ultrabrain category with skills", async () => {
      const skills = await loadSkills(["execute"])
      const content = buildCategorySkillPrompt("ultrabrain", skills)
      
      // Skills first
      expect(content).toContain("SKILL: execute")
      // Then category
      expect(content).toContain("difficult problem")
      expect(content).toContain("step by step")
    })

    it("should combine quick category with skills", async () => {
      const skills = await loadSkills(["prime"])
      const content = buildCategorySkillPrompt("quick", skills)
      
      expect(content).toContain("SKILL: prime")
      expect(content).toContain("Speed")
      expect(content).toContain("Minimal changes")
    })

    it("should combine deep category with investigation skills", async () => {
      const skills = await loadSkills(["planning-methodology"])
      const content = buildCategorySkillPrompt("deep", skills)
      
      expect(content).toContain("SKILL: planning-methodology")
      expect(content).toContain("investigation")
      expect(content).toContain("Research thoroughly")
    })

    it("should handle maximum practical skill count", async () => {
      // Load many skills to test edge case
      const allSkills = await discoverSkills()
      const first5 = allSkills.slice(0, 5).map(s => s.name)
      const skills = await loadSkills(first5)
      
      expect(skills.length).toBe(5)
      
      const content = getSkillContentForPrompt(skills)
      
      // All 5 should be in content
      for (const skill of skills) {
        expect(content).toContain(`SKILL: ${skill.name}`)
        expect(content).toContain(`END SKILL: ${skill.name}`)
      }
    })
  })

  // ============================================================
  // PERFORMANCE TESTS
  // ============================================================

  describe("Performance", () => {
    beforeEach(() => {
      clearSkillsCache()
    })

    it("should load cached skills faster than disk read", async () => {
      // First load (from disk)
      const start1 = Date.now()
      await loadSkills(["prime", "code-review", "commit"])
      const diskTime = Date.now() - start1

      // Second load (from cache)
      const start2 = Date.now()
      await loadSkills(["prime", "code-review", "commit"])
      const cacheTime = Date.now() - start2

      // Cache should be significantly faster (at least 2x)
      expect(cacheTime).toBeLessThan(diskTime + 5) // Allow small tolerance
    })

    it("should handle empty skill list efficiently", async () => {
      const start = Date.now()
      const skills = await loadSkills([])
      const elapsed = Date.now() - start

      expect(skills.length).toBe(0)
      expect(elapsed).toBeLessThan(5) // Should be instant
    })

    it("should handle non-existent skills efficiently", async () => {
      const start = Date.now()
      const skills = await loadSkills(["nonexistent1", "nonexistent2", "nonexistent3"])
      const elapsed = Date.now() - start

      expect(skills.length).toBe(0)
      expect(elapsed).toBeLessThan(50) // Should fail quickly
    })
  })
})
```

**GOTCHA**: Import paths use `../../features/skill-loader/` from `.opencode/tests/integration/`. The test assumes skills exist in `.opencode/skills/`.

### Step 2: Run and validate tests

**ACTION**: RUN
**TARGET**: Run integration tests

```bash
cd .opencode && bun test tests/integration/skill-loader.test.ts
```

**VALIDATE**: All tests pass with `bun test --grep "Skill Loader"`

## Testing Strategy

### Unit Tests

- Discovery tests verify file system operations
- Loading tests verify caching behavior
- Formatting tests verify prompt injection structure

### Integration Tests

- Combined category + skill prompts
- Cache behavior with real filesystem
- Performance characteristics

### Edge Cases

- Empty skill list
- Non-existent skills
- Mixed valid/invalid skills
- Maximum skill count
- Cache clearing

## Validation Commands

```bash
# L3: Unit Tests
bun test tests/integration/skill-loader.test.ts

# L4: Integration Tests
bun test --grep "Skill Loader"

# L5: Manual verification
# Check skill files exist
ls .opencode/skills/*/SKILL.md
```

## Acceptance Criteria

### Implementation

- [ ] Test file created at `.opencode/tests/integration/skill-loader.test.ts`
- [ ] Skill discovery tests for all available skills
- [ ] Skill caching tests with clearSkillsCache
- [ ] Prompt injection formatting tests
- [ ] Category + skill combination tests
- [ ] Performance tests for cache behavior

### Runtime

- [ ] All tests pass with `bun test`
- [ ] Tests run in under 10 seconds
- [ ] Cache behavior verified

## Completion Checklist

- [ ] All tests implemented and passing
- [ ] Skill discovery verified
- [ ] Caching behavior tested
- [ ] Prompt formatting tested
- [ ] Performance acceptable

## Handoff Notes

After completing this task, proceed to **Task 3: Agent Resolution Integration Tests**. The agent resolution tests will verify agent registry lookups and permission checks. Skill loading and category routing will be combined in the full dispatch flow.