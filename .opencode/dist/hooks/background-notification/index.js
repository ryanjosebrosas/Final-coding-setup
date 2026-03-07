/**
 * Background Notification Hook
 *
 * Handles event routing to BackgroundManager for background task notifications.
 * Notifies when background tasks complete or need attention.
 */
import { log } from "../../shared/logger";
/**
 * Create the background notification hook.
 *
 * @param manager - Background task manager instance
 */
export function createBackgroundNotificationHook(manager) {
    /**
     * Handle events - route to background manager.
     */
    const event = async ({ event }) => {
        if (!manager)
            return;
        try {
            manager.handleEvent(event);
        }
        catch (err) {
            log("[background-notification] Error handling event", {
                eventType: event.type,
                error: String(err),
            });
        }
    };
    /**
     * Handle chat message - inject pending notifications.
     */
    const chatMessage = async (input, output) => {
        if (!manager)
            return;
        try {
            manager.injectPendingNotificationsIntoChatMessage(output, input.sessionID);
        }
        catch (err) {
            log("[background-notification] Error injecting notifications", {
                sessionID: input.sessionID,
                error: String(err),
            });
        }
    };
    return {
        "chat.message": chatMessage,
        event,
    };
}
//# sourceMappingURL=index.js.map