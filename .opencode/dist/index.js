/**
 * OhMyOpenCode Plugin Entry Point
 *
 * This is the main entry point for OpenCode to load the plugin.
 * It exports a default function matching OpenCode's Plugin type.
 */
import { createPlugin } from "./core/plugin";
/**
 * Default plugin export
 * OpenCode will call this function to initialize the plugin
 */
const OhMyOpenCodePlugin = async (ctx) => {
    console.log("[OhMyOpenCode] Plugin entry point called");
    console.log("[OhMyOpenCode] Directory:", ctx.directory);
    // Create plugin factory with default empty config
    // Configuration is loaded inside the factory from oh-my-opencode.jsonc
    const pluginFactory = createPlugin({});
    // Initialize and return the plugin hooks
    return pluginFactory(ctx);
};
export default OhMyOpenCodePlugin;
//# sourceMappingURL=index.js.map