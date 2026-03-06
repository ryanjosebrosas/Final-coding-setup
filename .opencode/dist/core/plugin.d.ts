/**
 * Plugin factory for OhMyOpenCode
 * Creates the main plugin interface with hooks, tools, and handlers
 */
import type { Plugin } from "@opencode-ai/plugin";
import type { OhMyOpenCodeConfig } from "./types";
/**
 * Main plugin factory
 * Entry point for OpenCode to initialize the plugin
 */
export declare function createPlugin(defaultConfig: OhMyOpenCodeConfig): Plugin;
