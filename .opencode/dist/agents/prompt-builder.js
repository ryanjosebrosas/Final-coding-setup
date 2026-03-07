// ============================================================================
// PROMPT BUILDER UTILITIES
// ============================================================================
// 
// Shared utilities for building agent prompts dynamically.
// Used by individual agent prompt builders.
//
// ============================================================================
// PROMPT BUILDING UTILITIES
// ============================================================================
/**
 * Build the system prompt for an agent from metadata.
 */
export function buildSystemPrompt(agentName, metadata, roleContext) {
    let prompt = `# ${metadata.displayName}\n\n`;
    // Role description
    prompt += `${metadata.description}\n\n`;
    // Mode-specific context
    if (metadata.mode === "subagent") {
        prompt += `**Mode**: Subagent with own model selection and fallback chain.\n\n`;
    }
    else if (metadata.mode === "all") {
        prompt += `**Mode**: Available as both primary orchestrator and subagent.\n\n`;
    }
    else if (metadata.mode === "primary") {
        prompt += `**Mode**: Primary orchestrator only.\n\n`;
    }
    // Permission context
    prompt += buildPermissionContext(metadata);
    // Custom role context
    if (roleContext) {
        prompt += `\n${roleContext}\n\n`;
    }
    // Fallback chain
    if (metadata.fallbackChain.length > 0) {
        prompt += `## Fallback Chain\n\n`;
        prompt += `If the primary model fails: ${metadata.fallbackChain.join(" → ")}\n\n`;
    }
    return prompt;
}
/**
 * Build permission context section.
 */
export function buildPermissionContext(metadata) {
    const sections = [];
    // Read-only warning
    if (!metadata.permissions.writeFile && !metadata.permissions.editFile) {
        sections.push(`**READ-ONLY**: You cannot modify files. Analyze and advise only.`);
    }
    // No delegation warning
    if (!metadata.permissions.task) {
        sections.push(`**NO DELEGATION**: You cannot delegate to other agents. Complete the task directly.`);
    }
    // Vision-only
    if (!metadata.permissions.readFile && !metadata.permissions.grep) {
        sections.push(`**VISION-ONLY**: You can only analyze visual content. No file or command access.`);
    }
    // Archon enabled
    if (metadata.archonEnabled) {
        sections.push(`**RAG Enabled**: You can search the knowledge base for documentation and code examples.`);
    }
    if (sections.length === 0) {
        return "";
    }
    return `## Restrictions\n\n${sections.join("\n\n")}\n\n`;
}
/**
 * Build skills injection prompt.
 */
export function buildSkillsPrompt(skills, skillsContent) {
    if (skills.length === 0) {
        return "";
    }
    let prompt = "## Loaded Skills\n\n";
    for (const name of skills) {
        prompt += `### Skill: ${name}\n\n`;
        if (skillsContent?.has(name)) {
            prompt += skillsContent.get(name);
        }
        else {
            prompt += `[Skill content would be injected by skill-loader]\n`;
        }
        prompt += "\n\n";
    }
    return prompt;
}
/**
 * Build sections prompt from prompt sections.
 */
export function buildSectionsPrompt(sections) {
    return sections
        .map(section => `## ${section.title}\n\n${section.content}`)
        .join("\n\n");
}
/**
 * Build a complete prompt from context and agent metadata.
 */
export function buildCompletePrompt(context, metadata, customPrompt) {
    // Build skills prompt
    const skillsPrompt = buildSkillsPrompt(context.loadSkills, context.skillsContent);
    // Combine all parts
    let fullPrompt = "";
    if (skillsPrompt) {
        fullPrompt += skillsPrompt + "\n---\n\n";
    }
    if (context.category) {
        fullPrompt += `**Category**: ${context.category}\n\n---\n\n`;
    }
    fullPrompt += context.taskDescription;
    return {
        systemPrompt: customPrompt,
        skillsPrompt,
        categoryPrompt: context.category ? `Category: ${context.category}` : "",
        fullPrompt,
    };
}
/**
 * Build approach steps as formatted list.
 */
export function buildApproachSteps(steps) {
    return steps.map((step, i) => `${i + 1}. ${step}`).join("\n");
}
/**
 * Build decision tree as mermaid-like text.
 */
export function buildDecisionTree(branches) {
    let tree = "```\n";
    for (const [condition, action] of Object.entries(branches)) {
        tree += `${condition} → ${action}\n`;
    }
    tree += "```";
    return tree;
}
/**
 * Build rules list.
 */
export function buildRules(rules) {
    return rules.map((rule, i) => `${i + 1}. **${rule.split(":")[0]}** — ${rule.split(":")[1]?.trim() || rule}`).join("\n");
}
/**
 * Build tool list.
 */
export function buildToolList(tools) {
    let list = "";
    if (tools.allowed.length > 0) {
        list += `### Available Tools\n\n`;
        for (const tool of tools.allowed) {
            list += `- ${tool}\n`;
        }
        list += "\n";
    }
    if (tools.denied.length > 0) {
        list += `### Denied Tools\n\n`;
        list += `**BLOCKED**: ${tools.denied.join(", ")}\n\n`;
    }
    return list;
}
/**
 * Build example invocation.
 */
export function buildInvocationExample(categoryOrAgent, prompt, loadSkills = []) {
    let example = "```typescript\n";
    example += `task(\n`;
    // Determine if this is a category or subagent_type
    if (["visual-engineering", "ultrabrain", "deep", "artistry", "quick", "writing", "unspecified-low", "unspecified-high"].includes(categoryOrAgent)) {
        example += `  category: "${categoryOrAgent}",\n`;
    }
    else {
        example += `  subagent_type: "${categoryOrAgent}",\n`;
    }
    example += `  prompt: "${prompt}",\n`;
    if (loadSkills.length > 0) {
        example += `  load_skills: [${loadSkills.map(s => `"${s}"`).join(", ")}]\n`;
    }
    example += `)\n`;
    example += "```";
    return example;
}
/**
 * Escape special characters for markdown code blocks.
 */
export function escapeMarkdown(text) {
    return text
        .replace(/\\/g, "\\\\")
        .replace(/`/g, "\\`")
        .replace(/\$/g, "\\$");
}
//# sourceMappingURL=prompt-builder.js.map