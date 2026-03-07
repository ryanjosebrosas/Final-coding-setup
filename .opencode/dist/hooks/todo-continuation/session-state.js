/**
 * Session state store for managing todo continuation state per session.
 */
import { SESSION_STATE_TTL_MS, SESSION_STATE_PRUNE_INTERVAL_MS } from "./constants";
/**
 * Create a session state store for tracking continuation state.
 */
export function createSessionStateStore() {
    const sessions = new Map();
    // Periodic pruning of stale session states to prevent unbounded Map growth
    let pruneInterval;
    pruneInterval = setInterval(() => {
        const now = Date.now();
        for (const [sessionID, tracked] of sessions.entries()) {
            if (now - tracked.lastAccessedAt > SESSION_STATE_TTL_MS) {
                cancelCountdown(sessionID);
                sessions.delete(sessionID);
            }
        }
    }, SESSION_STATE_PRUNE_INTERVAL_MS);
    // Allow process to exit naturally even if interval is running
    if (typeof pruneInterval === "object" && "unref" in pruneInterval) {
        pruneInterval.unref();
    }
    function getState(sessionID) {
        const existing = sessions.get(sessionID);
        if (existing) {
            existing.lastAccessedAt = Date.now();
            return existing.state;
        }
        const state = {
            consecutiveFailures: 0,
        };
        sessions.set(sessionID, { state, lastAccessedAt: Date.now() });
        return state;
    }
    function getExistingState(sessionID) {
        const existing = sessions.get(sessionID);
        if (existing) {
            existing.lastAccessedAt = Date.now();
            return existing.state;
        }
        return undefined;
    }
    function cancelCountdown(sessionID) {
        const tracked = sessions.get(sessionID);
        if (!tracked)
            return;
        const state = tracked.state;
        if (state.countdownTimer) {
            clearTimeout(state.countdownTimer);
            state.countdownTimer = undefined;
        }
        if (state.countdownInterval) {
            clearInterval(state.countdownInterval);
            state.countdownInterval = undefined;
        }
        state.inFlight = false;
        state.countdownStartedAt = undefined;
    }
    function cleanup(sessionID) {
        cancelCountdown(sessionID);
        sessions.delete(sessionID);
    }
    function cancelAllCountdowns() {
        for (const sessionID of sessions.keys()) {
            cancelCountdown(sessionID);
        }
    }
    function shutdown() {
        if (pruneInterval)
            clearInterval(pruneInterval);
        cancelAllCountdowns();
        sessions.clear();
    }
    return {
        getState,
        getExistingState,
        cancelCountdown,
        cleanup,
        cancelAllCountdowns,
        shutdown,
    };
}
//# sourceMappingURL=session-state.js.map