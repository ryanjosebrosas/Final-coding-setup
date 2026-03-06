// ============================================================================
// AGENT INDEX
// ============================================================================
// 
// Central export for all agent modules and utilities.
//

// ============================================================================
// REGISTRY
// ============================================================================

export {
  AGENT_REGISTRY,
  AGENT_NAMES,
  PERMISSIONS,
  FALLBACK_CHAINS,
  getAgentByName,
  getAllAgentNames,
  getAgentsByMode,
  getAgentsByCategory,
  getReadOnlyAgents,
  getDelegatingAgents,
  type AgentMetadata,
  type AgentPermissions,
  type AgentName,
} from "./registry"

// ============================================================================
// TYPES
// ============================================================================

export {
  type AgentMode,
  type AgentRole,
  type AgentConfig,
  type AgentFactory,
  type ModelRequirement,
  type AgentModelRequirements,
  type AgentCapabilities,
  getCapabilities,
} from "./types"

// ============================================================================
// PROMPT BUILDER UTILITIES
// ============================================================================

export {
  type AgentPromptContext,
  type BuiltPrompt,
  type PromptSection,
  buildSystemPrompt,
  buildPermissionContext,
  buildSkillsPrompt,
  buildSectionsPrompt,
  buildCompletePrompt,
  buildApproachSteps,
  buildDecisionTree,
  buildRules,
  buildToolList,
  buildInvocationExample,
  escapeMarkdown,
} from "./prompt-builder"

// ============================================================================
// AGENT PROMPT BUILDERS
// ============================================================================

// Sisyphus — Main Orchestrator
export {
  SISYPHUS_METADATA,
  createSisyphusPrompt,
  createSisyphusAgent,
} from "./sisyphus"

// Oracle — Architecture Consultant
export {
  ORACLE_METADATA,
  createOraclePrompt,
  createOracleAgent,
} from "./oracle"

// Hephaestus — Deep Autonomous Worker
export {
  HEPHAESTUS_METADATA,
  createHephaestusPrompt,
  createHephaestusAgent,
} from "./hephaestus"

// Librarian — External Documentation Search
export {
  LIBRARIAN_METADATA,
  createLibrarianPrompt,
  createLibrarianAgent,
} from "./librarian"

// Explore — Internal Codebase Grep
export {
  EXPLORE_METADATA,
  createExplorePrompt,
  createExploreAgent,
} from "./explore"

// ============================================================================
// AGENT BUILDER (for compatibility)
// ============================================================================

export {
  type AgentFactoryWithMode,
  createAllAgentFactories,
  AGENT_FACTORIES,
} from "./agent-builder"

// ============================================================================
// PERMISSIONS
// ============================================================================

export {
  type PermissionLevel,
  type DetailedPermissions,
  PERMISSION_PRESETS,
  AGENT_PERMISSIONS,
  getPermissionLevel,
  getPermissions,
  canUseTool,
  getDeniedToolsList,
  isReadOnly,
  canDelegate,
  enforcePermission,
  filterAvailableTools,
} from "./permissions"

// ============================================================================
// DYNAMIC PROMPT BUILDER
// ============================================================================

export {
  type AvailableSkill,
  buildAvailableAgentsSummary,
  buildCategorySkillsDelegationGuide,
  buildAgentPrompt,
  getAgentPromptTemplate,
} from "./dynamic-prompt-builder"