/**
 * Background Notification Hook
 *
 * Handles event routing to BackgroundManager for background task notifications.
 * Notifies when background tasks complete or need attention.
 */
interface Event {
    type: string;
    properties?: Record<string, unknown>;
}
interface EventInput {
    event: Event;
}
interface ChatMessageInput {
    sessionID: string;
}
interface ChatMessageOutput {
    parts: Array<{
        type: string;
        text?: string;
        [key: string]: unknown;
    }>;
}
/**
 * BackgroundManager interface (stub for type checking).
 */
interface BackgroundManager {
    handleEvent(event: Event): void;
    injectPendingNotificationsIntoChatMessage(output: ChatMessageOutput, sessionID: string): void;
}
/**
 * Create the background notification hook.
 *
 * @param manager - Background task manager instance
 */
export declare function createBackgroundNotificationHook(manager: BackgroundManager | null): {
    "chat.message": (input: ChatMessageInput, output: ChatMessageOutput) => Promise<void>;
    event: (input: EventInput) => Promise<void>;
};
export {};
