/**
 * OhMyOpenCode Plugin Entry Point
 *
 * This is the main entry point for OpenCode to load the plugin.
 * It exports a default function matching OpenCode's Plugin type.
 */
import type { Plugin } from "@opencode-ai/plugin";
/**
 * Default plugin export
 * OpenCode will call this function to initialize the plugin
 */
declare const OhMyOpenCodePlugin: Plugin;
export default OhMyOpenCodePlugin;
/**
 * Export types for external consumption
 */
export type { OhMyOpenCodeConfig } from "./core/types";
