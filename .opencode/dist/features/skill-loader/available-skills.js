// ============================================================================
// AVAILABLE SKILLS DISCOVERY
// ============================================================================
import { discoverSkills } from "./index";
/**
 * Get list of all available skill names.
 */
export function getAvailableSkillNames() {
    const skills = discoverSkills();
    return Array.from(skills.keys());
}
/**
 * Get detailed list of all available skills.
 */
export function getAvailableSkills() {
    const skills = discoverSkills();
    return Array.from(skills.values());
}
/**
 * Check if specific skills are available.
 * Returns map of skill name to availability status.
 */
export function checkSkillAvailability(skillNames) {
    const skills = discoverSkills();
    const results = [];
    for (const name of skillNames) {
        const skill = skills.get(name);
        results.push({
            name,
            available: !!skill,
            path: skill?.path,
            description: skill?.description,
        });
    }
    return results;
}
/**
 * Get skills by compatibility level.
 * Groups skills by their compatibility tag.
 */
export function getSkillsByCompatibility() {
    const skills = discoverSkills();
    const grouped = {};
    for (const skill of skills.values()) {
        const compat = skill.compatibility;
        if (!grouped[compat]) {
            grouped[compat] = [];
        }
        grouped[compat].push(skill);
    }
    return grouped;
}
/**
 * Search skills by keyword in description or name.
 */
export function searchSkills(keyword) {
    const skills = discoverSkills();
    const lowerKeyword = keyword.toLowerCase();
    return Array.from(skills.values()).filter(skill => skill.name.toLowerCase().includes(lowerKeyword) ||
        skill.description.toLowerCase().includes(lowerKeyword));
}
/**
 * Print a summary of available skills for logging/debugging.
 */
export function printSkillsSummary() {
    const skills = getAvailableSkills();
    const byCompat = getSkillsByCompatibility();
    let summary = `Available Skills (${skills.length} total):\n`;
    for (const [compat, skillList] of Object.entries(byCompat)) {
        summary += `\n  ${compat.toUpperCase()}:\n`;
        for (const skill of skillList) {
            summary += `    - ${skill.name}: ${skill.description.slice(0, 60)}...\n`;
        }
    }
    return summary;
}
//# sourceMappingURL=available-skills.js.map