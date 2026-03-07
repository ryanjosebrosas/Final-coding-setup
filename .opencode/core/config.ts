/**
 * Configuration loader for OhMyOpenCode plugin
 * Reads oh-my-opencode.jsonc from .opencode/ directory
 */

import * as fs from "fs"
import * as path from "path"
import { parse as parseJsonc, ParseError } from "jsonc-parser"
import type { OhMyOpenCodeConfig, PluginContext } from "./types"

/**
 * Parse JSONC content into configuration object
 */
function parseJsoncConfig(content: string): OhMyOpenCodeConfig | null {
  try {
    const errors: ParseError[] = []
    const result = parseJsonc(content, errors, {
      allowTrailingComma: true,
      allowEmptyContent: true,
    })

    if (errors.length > 0) {
      console.warn("[Config] JSONC parse errors:", errors)
      return null
    }

    return result as OhMyOpenCodeConfig
  } catch (error) {
    console.error("[Config] Failed to parse JSONC:", error)
    return null
  }
}

/**
 * Deep merge two configuration objects
 */
function deepMerge<T extends Record<string, unknown>>(
  base: T | undefined,
  override: T | undefined
): T | undefined {
  if (!base) return override
  if (!override) return base

  const result: Record<string, unknown> = { ...base }

  for (const key of Object.keys(override)) {
    const baseValue = base[key]
    const overrideValue = override[key]

    if (
      baseValue &&
      overrideValue &&
      typeof baseValue === "object" &&
      typeof overrideValue === "object" &&
      !Array.isArray(baseValue) &&
      !Array.isArray(overrideValue)
    ) {
      result[key] = deepMerge(
        baseValue as Record<string, unknown>,
        overrideValue as Record<string, unknown>
      )
    } else {
      result[key] = overrideValue
    }
  }

  return result as T
}

/**
 * Merge user config with project config
 */
function mergeConfigs(
  base: OhMyOpenCodeConfig,
  override: OhMyOpenCodeConfig
): OhMyOpenCodeConfig {
  return {
    ...base,
    ...override,
    agents: deepMerge(base.agents, override.agents),
    categories: deepMerge(base.categories, override.categories),
    disabled_agents: [
      ...new Set([
        ...(base.disabled_agents ?? []),
        ...(override.disabled_agents ?? []),
      ]),
    ],
    disabled_hooks: [
      ...new Set([
        ...(base.disabled_hooks ?? []),
        ...(override.disabled_hooks ?? []),
      ]),
    ],
    disabled_commands: [
      ...new Set([
        ...(base.disabled_commands ?? []),
        ...(override.disabled_commands ?? []),
      ]),
    ],
    disabled_skills: [
      ...new Set([
        ...(base.disabled_skills ?? []),
        ...(override.disabled_skills ?? []),
      ]),
    ],
    mcps: deepMerge(base.mcps, override.mcps),
    experimental: deepMerge(
      base.experimental as Record<string, unknown> | undefined,
      override.experimental as Record<string, unknown> | undefined
    ) as OhMyOpenCodeConfig["experimental"],
  }
}

/**
 * Detect and load config file from path (supports .jsonc and .json)
 */
function loadConfigFromPath(configPath: string): OhMyOpenCodeConfig | null {
  try {
    if (!fs.existsSync(configPath)) {
      return null
    }

    const content = fs.readFileSync(configPath, "utf-8")
    const config = parseJsoncConfig(content)

    if (config) {
      console.log(`[Config] Loaded config from ${configPath}`)
    }

    return config
  } catch (error) {
    console.error(`[Config] Error loading from ${configPath}:`, error)
    return null
  }
}

/**
 * Load plugin configuration
 * Priority: project config overrides user config
 */
export function loadPluginConfig(
  directory: string,
  _ctx: PluginContext
): OhMyOpenCodeConfig {
  // User-level config path (from OpenCode config directory)
  // For now, we'll use a simple approach - can be enhanced later
  const homeDir = process.env.HOME || process.env.USERPROFILE
  const userConfigPath = homeDir
    ? path.join(homeDir, ".config", "opencode", "oh-my-opencode.jsonc")
    : null

  // Project-level config path
  const projectConfigPathJsonc = path.join(directory, ".opencode", "oh-my-opencode.jsonc")
  const projectConfigPathJson = path.join(directory, ".opencode", "oh-my-opencode.json")

  // Load user config (base)
  let config: OhMyOpenCodeConfig =
    (userConfigPath ? loadConfigFromPath(userConfigPath) : null) ?? {}

  // Load project config (override)
  const projectConfig =
    loadConfigFromPath(projectConfigPathJsonc) ??
    loadConfigFromPath(projectConfigPathJson)

  if (projectConfig) {
    config = mergeConfigs(config, projectConfig)
  }

  console.log("[Config] Final merged config loaded", {
    hasAgents: !!config.agents,
    hasCategories: !!config.categories,
    disabledAgents: config.disabled_agents?.length ?? 0,
  })

  return config
}