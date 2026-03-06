import type { AgentConfig } from "../types";
/**
 * Sisyphus overlay for Gemini.
 * Focus on: clear delegation, concise summaries, structured decisions.
 */
export declare function applyGeminiOverlayToSisyphus(config: AgentConfig): AgentConfig;
/**
 * Hephaestus overlay for Gemini.
 * Focus on: autonomous focus, avoiding over-engineering.
 */
export declare function applyGeminiOverlayToHephaestus(config: AgentConfig): AgentConfig;
/**
 * Oracle overlay for Gemini.
 * Focus on: structured recommendations, avoid waffle.
 */
export declare function applyGeminiOverlayToOracle(config: AgentConfig): AgentConfig;
/**
 * Momus overlay for Gemini.
 * Focus on: concise rejections, actionable fixes.
 */
export declare function applyGeminiOverlayToMomus(config: AgentConfig): AgentConfig;
/**
 * Apply Gemini-specific overlays to an agent config.
 */
export declare function applyGeminiOverlay(agentName: string, config: AgentConfig): AgentConfig;
/**
 * Apply GPT-specific overlays to an agent config.
 */
export declare function applyGPTOverlay(agentName: string, config: AgentConfig): AgentConfig;
