# Task 1 of 1: Implement reverse() function and create tests

> **Feature**: `string-reverse`
> **Brief Path**: `.agents/features/string-reverse/task-1.md`
> **Plan Overview**: `.agents/features/string-reverse/plan.md`
> **Spec ID**: P1-01 (light)
> **Pillar**: P1 — Core String Utilities

---

## OBJECTIVE

> What this task delivers. One precise sentence — the test for "done."

Implement the `reverse()` function in `src/strings.ts` using the split-reverse-join pattern and create `src/strings.test.ts` with vitest tests covering all acceptance criteria, then mark this brief done.

---

## SCOPE

**Files This Task Touches:**

| File | Action | What Changes |
|------|--------|-------------|
| `src/strings.ts` | UPDATE | Add `reverse()` function implementation and export |
| `src/strings.test.ts` | CREATE | New test file with vitest tests for reverse() |
| `package.json` | CREATE | Minimal package.json with vitest dependency and test script |

**Out of Scope:**
- `capitalize()` function (handled by P1-02)
- Additional string utilities (future specs)
- ESLint or other linting configuration (not needed for this light spec)
- TypeScript configuration (assumed to exist or not required for this simple case)

**Dependencies:**
- None — this is the first task in the first spec

---

## PRIOR TASK CONTEXT

### For Task 1

This is the first task — no prior work. Start fresh from the codebase state.

**Current State**:
- `src/strings.ts` exists as empty stub (4 lines with `export {}`)
- `src/strings.test.ts` does not exist
- `package.json` does not exist at project root
- No test framework configured
- No established patterns (we are setting the foundation)

**State Carried Forward**:
- N/A — first task

**Known Issues or Deferred Items**:
- N/A — no prior issues

---

## CONTEXT REFERENCES

> IMPORTANT: Read ALL files listed here before implementing. They are not optional.
> All relevant content MUST be pasted inline in this section or in the Steps below.
> The executing model reads this instead of opening the file.

### Files to Read

> List files with line ranges for the executing model to verify against.
> Then paste the actual content inline in code blocks below each reference.

- `src/strings.ts` (all 4 lines) — Why: This is the target file to modify. Need to see the current empty state.
- `.agents/specs/BUILD_ORDER.md` (lines 1-18) — Why: Contains the authoritative spec definition and acceptance criteria.
- `.agents/specs/build-state.json` (all 10 lines) — Why: Confirms build state and current step.

### Current Content: src/strings.ts (All 4 lines)

> Paste the exact content from the file in a code block. This is NOT optional.

```typescript
// String utility functions — Build Test Project
// This file will be populated by /build specs

export {};
```

**Analysis**: The file is an empty TypeScript module. The comment header establishes the file's purpose. The `export {}` is a TypeScript idiom for an empty module. We will replace `export {}` with actual function exports. The comment header should be preserved.

### Current Content: BUILD_ORDER.md (Lines 1-18)

```markdown
# Build Order — Build Test Project

Generated: 2026-03-01
Status: 0/2 complete

---

## Pillar 1: Core String Utilities

- [ ] `P1-01` **string-reverse** (light) — Create reverse() function that reverses a string
  - depends: none
  - touches: src/strings.ts, src/strings.test.ts
  - acceptance: reverse("hello") returns "olleh", reverse("") returns ""

- [ ] `P1-02` **string-capitalize** (light) — Create capitalize() function that capitalizes first letter of each word
  - depends: P1-01
  - touches: src/strings.ts, src/strings.test.ts
  - acceptance: capitalize("hello world") returns "Hello World", capitalize("") returns ""
```

**Analysis**: Clear acceptance criteria for this spec. Two test cases required:
1. `reverse("hello")` must return `"olleh"`
2. `reverse("")` must return `""`

Next spec (P1-02) depends on this one completing successfully.

### Current Content: build-state.json (All 10 lines)

```json
{
  "lastSpec": null,
  "completed": [],
  "currentPillar": 1,
  "totalSpecs": 2,
  "currentSpec": "string-reverse",
  "currentStep": "planning",
  "patternsEstablished": [],
  "decisionsLog": []
}
```

**Analysis**: Confirms this is the first spec (`lastSpec: null`, `completed: []`). Current step is "planning". After execution, build-state.json should be updated to reflect progress. No patterns established yet — we're creating the foundation.

### Patterns to Follow

> This section is NOT optional. Every task has at least one pattern to follow.
> Include COMPLETE code snippets from the codebase — copy-pasteable, not summaries.
> If the task creates a new file, the pattern is the closest existing analog.
> If the task modifies a file, the pattern is the established style in that file.

**Pattern 1: TypeScript Function Export** (from `src/strings.ts:1-4`):

Since this is the first spec, we're establishing the pattern rather than following one. The pattern will be:

```typescript
// String utility functions — Build Test Project
// This file will be populated by /build specs

export function reverse(str: string): string {
  // Implementation
}
```

- Why this pattern: Standard TypeScript ESM export syntax, preserves the comment header, clear and idiomatic.
- How to apply: Replace `export {}` with the actual function export.
- Common gotchas: Don't remove the comment header. Ensure function signature is correct (string in, string out).

**Pattern 2: Vitest Test Structure** (to be established):

```typescript
import { describe, it, expect } from 'vitest';
import { reverse } from './strings';

describe('reverse', () => {
  it('should reverse a string', () => {
    expect(reverse('hello')).toBe('olleh');
  });
});
```

- Why this pattern: Standard vitest structure with describe/it blocks, clear test names that describe behavior.
- How to apply: Use this structure for all reverse() tests.
- Common gotchas: Import path must be correct (`./strings` not `./strings.ts`). Test names should be descriptive.

**Pattern 3: split-reverse-join Implementation** (standard JavaScript pattern):

```typescript
export function reverse(str: string): string {
  return str.split('').reverse().join('');
}
```

- Why this pattern: Idiomatic JavaScript/TypeScript string reversal using built-in array methods.
- How to apply: This is the exact implementation for reverse().
- Common gotchas: Works correctly for empty strings (returns empty string). No edge case handling needed.

---

## STEP-BY-STEP TASKS

> Execute every step in order. Each step is atomic and independently verifiable.

---

### Step 1: CREATE `package.json`

**What**: Create minimal package.json with vitest dependency for test running.

**IMPLEMENT**:

Create a new file at the project root with the following content:

```json
{
  "name": "build-test-project",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "devDependencies": {
    "vitest": "^1.0.0"
  }
}
```

**PATTERN**: N/A — first package.json in project

**IMPORTS**: N/A

**GOTCHA**: Ensure `"type": "module"` is set for ESM compatibility with vitest. Without this, vitest may not work correctly with ES module imports.

**VALIDATE**:
```bash
# Verify package.json is valid JSON
node -e "console.log(JSON.parse(require('fs').readFileSync('package.json', 'utf8')))"

# Install dependencies
npm install
```

---

### Step 2: UPDATE `src/strings.ts`

**What**: Add the reverse() function implementation to the strings module.

**IMPLEMENT**:

Current (all 4 lines of `src/strings.ts`):
```typescript
// String utility functions — Build Test Project
// This file will be populated by /build specs

export {};
```

Replace with:
```typescript
// String utility functions — Build Test Project
// This file will be populated by /build specs

/**
 * Reverses a string.
 * @param str - The string to reverse
 * @returns The reversed string
 */
export function reverse(str: string): string {
  return str.split('').reverse().join('');
}
```

**PATTERN**: `src/strings.ts:1-4` — preserves comment header, replaces empty export with function

**IMPORTS**: N/A — no imports needed for this pure function

**GOTCHA**: Preserve the comment header exactly as-is. The JSDoc comment is optional but recommended for documentation. The function must be exported (use `export` keyword).

**VALIDATE**:
```bash
# Check TypeScript compilation (if tsconfig exists)
npx tsc --noEmit src/strings.ts

# Or verify syntax with Node
node -e "console.log('Syntax OK')"
```

---

### Step 3: CREATE `src/strings.test.ts`

**What**: Create test file with vitest tests covering all acceptance criteria.

**IMPLEMENT**:

Create a new file at `src/strings.test.ts` with the following content:

```typescript
import { describe, it, expect } from 'vitest';
import { reverse } from './strings';

describe('reverse', () => {
  it('should reverse a string', () => {
    expect(reverse('hello')).toBe('olleh');
  });

  it('should return empty string for empty input', () => {
    expect(reverse('')).toBe('');
  });

  it('should handle single character', () => {
    expect(reverse('a')).toBe('a');
  });

  it('should handle palindrome', () => {
    expect(reverse('radar')).toBe('radar');
  });

  it('should handle string with spaces', () => {
    expect(reverse('hello world')).toBe('dlrow olleh');
  });
});
```

**PATTERN**: Vitest standard structure (describe/it blocks with descriptive names)

**IMPORTS**: 
```typescript
import { describe, it, expect } from 'vitest';
import { reverse } from './strings';
```

**GOTCHA**: Import path is `./strings` NOT `./strings.ts` — vitest resolves the extension automatically. All test cases must use the exact acceptance criteria values.

**VALIDATE**:
```bash
# Run tests to verify
npx vitest run
```

---

### Step 4: RUN VALIDATION COMMANDS

**What**: Execute all validation levels to verify the implementation.

**IMPLEMENT**:

Run each validation command in order and verify all pass:

```bash
# Level 1: Syntax & Style
# Verify files exist and are well-formed
ls -la src/strings.ts src/strings.test.ts package.json

# Level 2: Type Safety
npx tsc --noEmit

# Level 3: Unit Tests
npx vitest run

# Level 5: Manual Validation
# Read the files and verify structure
# Already done via automated tests
```

**PATTERN**: Validation pyramid (L1-L5)

**IMPORTS**: N/A

**GOTCHA**: If vitest is not installed, run `npm install` first. If TypeScript is not configured, L2 may be skipped (N/A for this simple case).

**VALIDATE**:
```bash
# All tests must pass
npx vitest run
# Expected output: "Test Files  1 passed (1)"
```

---

### Step 5: UPDATE BUILD STATE

**What**: Update `.agents/specs/build-state.json` to reflect completion.

**IMPLEMENT**:

Current content of `.agents/specs/build-state.json`:
```json
{
  "lastSpec": null,
  "completed": [],
  "currentPillar": 1,
  "totalSpecs": 2,
  "currentSpec": "string-reverse",
  "currentStep": "planning",
  "patternsEstablished": [],
  "decisionsLog": []
}
```

Replace with:
```json
{
  "lastSpec": "string-reverse",
  "completed": ["P1-01"],
  "currentPillar": 1,
  "totalSpecs": 2,
  "currentSpec": "string-capitalize",
  "currentStep": "planning",
  "patternsEstablished": ["vitest-testing", "function-export-pattern"],
  "decisionsLog": [
    {
      "spec": "P1-01",
      "decision": "Use vitest as test framework",
      "rationale": "Modern, fast, ESM-native, works well with TypeScript"
    },
    {
      "spec": "P1-01",
      "decision": "split-reverse-join pattern for string reversal",
      "rationale": "Idiomatic JavaScript/TypeScript approach"
    }
  ]
}
```

**PATTERN**: N/A — first build state update

**IMPORTS**: N/A

**GOTCHA**: Ensure JSON is valid (no trailing commas, proper quoting). The `currentStep` should be "planning" for the NEXT spec (string-capitalize), indicating readiness for the next planning cycle.

**VALIDATE**:
```bash
# Verify JSON is valid
node -e "console.log(JSON.parse(require('fs').readFileSync('.agents/specs/build-state.json', 'utf8')))"
```

---

### Step 6: UPDATE PIPELINE HANDOFF

**What**: Update `.agents/context/next-command.md` to reflect completion and next step.

**IMPLEMENT**:

Current handoff (from prior command):
```markdown
# Pipeline Handoff
<!-- Auto-updated by pipeline commands. Read by /prime. Do not edit manually. -->

- **Last Command**: /planning
- **Feature**: string-reverse
- **Next Command**: /execute .agents/features/string-reverse/plan.md
- **Task Progress**: 0/1 complete
- **Timestamp**: 2026-03-02T...
- **Status**: awaiting-execution
```

Replace with:
```markdown
# Pipeline Handoff
<!-- Auto-updated by pipeline commands. Read by /prime. Do not edit manually. -->

- **Last Command**: /execute (task 1 of 1)
- **Feature**: string-reverse
- **Next Command**: /code-loop string-reverse
- **Task Progress**: 1/1 complete
- **Timestamp**: 2026-03-02T...
- **Status**: awaiting-review
```

**PATTERN**: Pipeline handoff format

**IMPORTS**: N/A

**GOTCHA**: Use current ISO 8601 timestamp. Status must be `awaiting-review` to trigger code-loop in the next session. Task progress shows 1/1 complete.

**VALIDATE**:
```bash
# Verify handoff file exists and has correct status
grep "awaiting-review" .agents/context/next-command.md
```

---

### Step 7: MARK TASK BRIEF DONE

**What**: Rename task brief to indicate completion.

**IMPLEMENT**:

After all steps complete and validation passes:

```bash
# Rename task brief to mark done
mv .agents/features/string-reverse/task-1.md .agents/features/string-reverse/task-1.done.md
```

On Windows:
```bash
# Rename task brief to mark done (Windows)
move .agents/features/string-reverse/task-1.md .agents/features/string-reverse/task-1.done.md
```

**PATTERN**: `.done.md` lifecycle convention

**IMPORTS**: N/A

**GOTCHA**: Only mark done after ALL validation commands pass and acceptance criteria are verified. The `.done.md` suffix signals to `/prime` and `/execute` that this task is complete.

**VALIDATE**:
```bash
# Verify file was renamed
ls .agents/features/string-reverse/task-1.done.md
```

---

## TESTING STRATEGY

> Every brief must include a testing strategy, even for configuration/doc changes.
> For markdown/config changes, manual testing IS the strategy — describe it precisely.

### Unit Tests

**Location**: `src/strings.test.ts`

**Test Cases** (5 total):
1. Normal case: `reverse("hello")` returns `"olleh"` — acceptance criteria
2. Empty string: `reverse("")` returns `""` — acceptance criteria
3. Single character: `reverse("a")` returns `"a"` — edge case
4. Palindrome: `reverse("radar")` returns `"radar"` — edge case
5. With spaces: `reverse("hello world")` returns `"dlrow olleh"` — edge case

**Coverage Goal**: 100% of reverse() function (trivial for single function)

### Integration Tests

N/A — No integration points exist yet. This is a standalone utility function.

### Edge Cases

- **Empty string** (required by acceptance criteria) — naturally handled by split-reverse-join
- **Single character** (boundary case) — returns same character
- **Palindrome** (returns same string) — validates reversal is correct
- **String with spaces** — validates spaces are treated as characters
- **Unicode characters** — not tested for this light spec, future consideration

---

## VALIDATION COMMANDS

> Execute every level that applies. Full depth is required — one signal is not enough.
> For markdown/config changes: L1 is file existence check, L5 is manual walkthrough.

### Level 1: Syntax & Style
```bash
# Files exist and are well-formed
ls -la src/strings.ts src/strings.test.ts package.json

# Verify package.json is valid JSON
node -e "console.log(JSON.parse(require('fs').readFileSync('package.json', 'utf8')))"
```

### Level 2: Type Safety
```bash
# TypeScript type check (if tsconfig exists)
npx tsc --noEmit

# If no tsconfig, this level is N/A
# N/A — no TypeScript configuration yet
```

### Level 3: Unit Tests
```bash
# Run vitest
npx vitest run

# Expected output:
# Test Files  1 passed (1)
# Tests  5 passed (5)
```

### Level 4: Integration Tests
```bash
# N/A — no integration tests for this spec
# Covered by Level 5 manual validation
```

### Level 5: Manual Validation

> Precise walkthrough. Not "test it" — exact steps that produce evidence.

1. Read `src/strings.ts` and verify `reverse()` function is exported with correct signature
2. Read `src/strings.test.ts` and verify all 5 test cases exist
3. Run `npx vitest run` and verify output shows "5 passed"
4. Verify `package.json` has vitest in devDependencies
5. Verify BUILD_ORDER.md spec P1-01 is now complete (update mentally for next planning)

**What success looks like**: All files exist, all tests pass, no TypeScript errors.

**What failure looks like**: Test failures indicate implementation error. Check the error message and fix the reverse() implementation.

### Level 6: Cross-Check (Optional)

N/A — this task has no cross-task dependencies (first task).

---

## ACCEPTANCE CRITERIA

> Implementation items: verify during execution and check off.
> Runtime items: verify during manual testing after execution.
>
> DO NOT check off an item unless you have concrete evidence from this run.

### Implementation (verify during execution)

- [ ] `reverse()` function implemented in `src/strings.ts`
- [ ] Function uses split-reverse-join pattern (`str.split('').reverse().join('')`)
- [ ] Function is exported from `src/strings.ts` (uses `export` keyword)
- [ ] `src/strings.test.ts` created with vitest tests
- [ ] Test for `reverse("hello")` === `"olleh"` exists and passes
- [ ] Test for `reverse("")` === `""` exists and passes
- [ ] `package.json` created with vitest dependency
- [ ] `npx vitest run` passes with all 5 tests green
- [ ] Build state updated (`.agents/specs/build-state.json`)
- [ ] Pipeline handoff updated (`.agents/context/next-command.md`)
- [ ] Task brief marked done (`task-1.md` → `task-1.done.md`)

### Runtime (verify after testing)

- [ ] `npx vitest run` passes with exit code 0
- [ ] No TypeScript errors in strings.ts or strings.test.ts
- [ ] Function can be imported: `import { reverse } from './strings'` works
- [ ] Empty string returns empty string (verified by test)

---

## HANDOFF NOTES

> What the NEXT task needs to know. Written AFTER execution completes.
> These feed into Task N+1's "Prior Task Context" section.

### Files Created/Modified

- `src/strings.ts` — Added `reverse()` function with JSDoc comment, exported
- `src/strings.test.ts` — Created with 5 vitest test cases
- `package.json` — Created with vitest devDependency and test scripts

### Patterns Established

- **vitest-testing** — Use vitest for unit tests, describe/it structure, import from 'vitest'
- **function-export-pattern** — Export functions with JSDoc comments, TypeScript types
- **split-reverse-join** — Idiomatic string reversal pattern for future reference

### State to Carry Forward

- Test framework is now vitest (use for all future specs)
- Test file naming: `{module}.test.ts`
- Test structure: describe/module name, it/should behavior
- Build state updated: P1-01 complete, ready for P1-02

### Known Issues or Deferred Items

- No TypeScript configuration (tsconfig.json) — may be needed for L2 validation in future specs
- No ESLint configuration — may be needed for L1 validation in future specs
- Unicode handling not tested — defer to future spec if needed

---

## COMPLETION CHECKLIST

> Final gate before marking this brief done. All boxes must be checked.

- [ ] All steps completed in order (Step 1 through Step 7)
- [ ] Step 1 VALIDATE: package.json is valid JSON and dependencies installed
- [ ] Step 2 VALIDATE: strings.ts has correct implementation
- [ ] Step 3 VALIDATE: strings.test.ts has all 5 test cases
- [ ] Step 4 VALIDATE: All validation levels run and passed
- [ ] Step 5 VALIDATE: build-state.json updated correctly
- [ ] Step 6 VALIDATE: next-command.md updated with awaiting-review status
- [ ] Step 7 VALIDATE: task-1.md renamed to task-1.done.md
- [ ] All validation levels run (L1, L2 if applicable, L3, L5)
- [ ] Manual testing confirms expected behavior (all tests pass)
- [ ] Implementation acceptance criteria all checked (11 items above)
- [ ] No regressions in adjacent files (no adjacent files to regress)
- [ ] Handoff notes written (section above)
- [ ] Brief marked done: rename `task-1.md` → `task-1.done.md`

---

## NOTES

### Key Design Decisions (This Task)

1. **Vitest as test framework**: Chosen for modern ESM support, speed, and TypeScript compatibility. Sets pattern for all future specs.

2. **split-reverse-join implementation**: Standard JavaScript pattern, more readable than manual iteration. Naturally handles empty strings.

3. **Single task for implementation + tests**: For a light spec with 2 files, combining into one task reduces overhead. Files are tightly coupled (tests depend on implementation).

4. **5 test cases**: Covers both acceptance criteria plus 3 edge cases (single char, palindrome, spaces) for robustness.

### Trade-offs Accepted

- Added package.json overhead for a 1-function feature — but establishes testing foundation for all future specs
- No tsconfig.json yet — acceptable for this light spec, may be needed later
- No ESLint yet — acceptable for this light spec, may be added in future specs

### Implementation Notes

- The split-reverse-join pattern works correctly for ALL strings including empty strings
- No error handling needed — function accepts any string input
- JSDoc comment is optional but recommended for IDE autocomplete
- Test file imports from `./strings` (no .ts extension) — vitest resolves automatically

### What to Check First If Validation Fails

1. **Tests fail**: Check the error message — likely implementation error in reverse()
2. **Import error**: Verify import path is `./strings` not `./strings.ts`
3. **vitest not found**: Run `npm install` first
4. **TypeScript errors**: Check function signature matches `reverse(str: string): string`

---

> **Reminder**: Mark this brief done after execution:
> Rename `task-1.md` → `task-1.done.md`
> This signals to `/execute` (via artifact scan) that this task is complete.
