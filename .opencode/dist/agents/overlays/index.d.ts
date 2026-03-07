import type { AgentConfig } from "../types";
export { applyGeminiOverlay, applyGPTOverlay, } from "./gemini-overlays";
/**
 * Apply appropriate overlay based on model family.
 */
export declare function applyOverlayForModel(agentName: string, config: AgentConfig, modelHint?: string): AgentConfig;
