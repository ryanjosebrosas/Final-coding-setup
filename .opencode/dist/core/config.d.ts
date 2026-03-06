/**
 * Configuration loader for OhMyOpenCode plugin
 * Reads oh-my-opencode.jsonc from .opencode/ directory
 */
import type { OhMyOpenCodeConfig, PluginContext } from "./types";
/**
 * Load plugin configuration
 * Priority: project config overrides user config
 */
export declare function loadPluginConfig(directory: string, ctx: PluginContext): OhMyOpenCodeConfig;
