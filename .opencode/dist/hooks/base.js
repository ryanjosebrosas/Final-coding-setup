/**
 * Hook infrastructure base types and interfaces.
 *
 * Hooks are modular pieces of logic that respond to events in the OpenCode system.
 * They are organized into tiers based on execution priority and purpose.
 */
/**
 * Hook tier execution order (lower = earlier).
 */
export const HOOK_TIER_ORDER = {
    continuation: 1, // Run first to enforce completion guarantees
    session: 2, // Session lifecycle management
    "tool-guard": 3, // Pre/post tool execution
    transform: 4, // Message transformation
    skill: 5, // Skill-specific hooks (last)
};
/**
 * Get the execution order for a hook tier.
 */
export function getHookTierOrder(tier) {
    return HOOK_TIER_ORDER[tier];
}
/**
 * Create a new hook registry.
 */
export function createHookRegistry() {
    const hooks = new Map();
    function register(hook) {
        hooks.set(hook.name, hook);
    }
    function unregister(hookName) {
        hooks.delete(hookName);
    }
    function getEnabledHooks() {
        return Array.from(hooks.values())
            .filter((h) => h.enabled)
            .sort((a, b) => {
            const tierDiff = getHookTierOrder(a.tier) - getHookTierOrder(b.tier);
            if (tierDiff !== 0)
                return tierDiff;
            return a.priority - b.priority;
        });
    }
    function getHooksByTier(tier) {
        return getEnabledHooks().filter((h) => h.tier === tier);
    }
    function getHooksForEvent(eventType) {
        return getEnabledHooks().filter((h) => h.eventTypes.includes(eventType));
    }
    return {
        register,
        unregister,
        getEnabledHooks,
        getHooksByTier,
        getHooksForEvent,
    };
}
//# sourceMappingURL=base.js.map