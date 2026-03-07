/**
 * Command Model Router Hook
 * 
 * Intercepts slash commands and routes to the model specified in command frontmatter.
 * 
 * When a user runs `/prime`, this hook:
 * 1. Detects the slash command in the message
 * 2. Loads the command's frontmatter from .opencode/commands/prime.md
 * 3. Parses the `model:` field (e.g., "ollama/glm-4.7:cloud")
 * 4. Overrides the session model to use that model
 * 
 * This ensures commands run on their intended model tier:
 * - /prime -> Haiku (cheap retrieval)
 * - /planning -> Opus (expensive planning)
 * - /code-review -> Sonnet (balanced review)
 */

import { detectSlashCommand } from "./detector"
import { loadCommandMetadataCached, clearCommandCache } from "./loader"
import type { ChatMessageInput, ChatMessageOutput } from "./types"
import { log } from "../../shared/logger"

/**
 * Session-processed command tracking to avoid double-processing.
 */
const sessionProcessedCommands = new Map<string, Set<string>>()

/**
 * Clear processed commands for a session.
 */
export function clearSessionState(sessionID: string): void {
  sessionProcessedCommands.delete(sessionID)
}

/**
 * Create the command model router hook.
 */
export function createCommandModelRouterHook(workspaceDir: string = process.cwd()) {
  return {
    "chat.message": async (
      input: ChatMessageInput,
      output: ChatMessageOutput
    ): Promise<void> => {
      const { sessionID } = input
      
      // Detect slash command from message parts
      const parsed = detectSlashCommand(output.parts)
      
      if (!parsed) {
        return
      }
      
      // Check if we've already processed this command for this session
      let processed = sessionProcessedCommands.get(sessionID)
      if (!processed) {
        processed = new Set()
        sessionProcessedCommands.set(sessionID, processed)
      }
      
      const commandKey = `${sessionID}:${parsed.command}`
      if (processed.has(commandKey)) {
        return
      }
      processed.add(commandKey)
      
      // Load command metadata (with caching)
      const metadata = loadCommandMetadataCached(parsed.command, workspaceDir)
      
      if (!metadata) {
        log("[command-model-router] Command not found", {
          sessionID,
          command: parsed.command,
        })
        return
      }
      
      // Check if command has a model field
      if (!metadata.model) {
        log("[command-model-router] Command has no model field", {
          sessionID,
          command: parsed.command,
        })
        return
      }
      
      // Parse the model string: "provider/model" format
      const slashIndex = metadata.model.indexOf("/")
      if (slashIndex <= 0) {
        log("[command-model-router] Invalid model format (expected provider/model)", {
          sessionID,
          command: parsed.command,
          model: metadata.model,
        })
        return
      }
      
      const providerID = metadata.model.slice(0, slashIndex)
      const modelID = metadata.model.slice(slashIndex + 1)
      
      if (!providerID || !modelID) {
        log("[command-model-router] Failed to parse provider/model", {
          sessionID,
          command: parsed.command,
          model: metadata.model,
        })
        return
      }
      
      // Override the model in the output
      output.message.model = {
        providerID,
        modelID,
      }
      
      log("[command-model-router] Model override applied", {
        sessionID,
        command: parsed.command,
        providerID,
        modelID,
      })
    },
    
    "event": async ({ event }: { event: { type: string; properties?: unknown } }): Promise<void> => {
      // Clean up session state on session deletion
      if (event.type === "session.deleted") {
        const props = event.properties as { info?: { id?: string } } | undefined
        if (props?.info?.id) {
          clearSessionState(props.info.id)
        }
      }
    },
  }
}

// Export for testing
export { clearCommandCache }