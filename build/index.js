import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import fs from 'fs';
import { glob } from 'glob';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from "zod";
// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Server configuration
const DEFAULT_PORT = 8082;
const SERVER_HOST = process.env.HOST || 'localhost';
const SERVER_PORT = parseInt(process.env.PORT || DEFAULT_PORT.toString(), 10);
// Base directory for resources
const BASE_DIR = path.resolve(__dirname, '..');
const RESOURCES_DIR = path.join(BASE_DIR, "resources");
const CODE_EXAMPLES_DIR = path.join(RESOURCES_DIR, "code-examples");
// HTTP Transport class for direct JSON-RPC over HTTP
class HTTPTransport {
    _response = null;
    _request = null;
    onclose;
    onerror;
    onmessage;
    setResponse(res) {
        this._response = res;
    }
    setRequest(req) {
        this._request = req;
    }
    async start() {
        // For HTTP transport, start is handled when the request comes in
        logDebug('HTTPTransport started');
    }
    async send(message) {
        if (this._response && !this._response.headersSent) {
            try {
                logDebug('Sending HTTP response:', JSON.stringify(message));
                this._response.writeHead(200, {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type'
                });
                this._response.end(JSON.stringify(message));
            }
            catch (error) {
                logError('Error sending HTTP response:', error);
                if (this.onerror) {
                    this.onerror(error);
                }
            }
        }
    }
    async close() {
        if (this._response && !this._response.headersSent) {
            this._response.end();
        }
        this._response = null;
        this._request = null;
        if (this.onclose) {
            this.onclose();
        }
    }
}
// Create server instance optimized for VSCode GitHub Copilot
const server = new McpServer({
    name: "bluestoneapps-copilot",
    version: "1.0.0",
    capabilities: {
        tools: {},
        resources: {},
        logging: {},
    },
});
// Enhanced logging for VSCode integration
function logInfo(message, ...args) {
    console.error(`[INFO] ${message}`, ...args);
}
function logError(message, error) {
    console.error(`[ERROR] ${message}`, error);
}
function logDebug(message, ...args) {
    if (process.env.DEBUG) {
        console.error(`[DEBUG] ${message}`, ...args);
    }
}
// Helper function to get standard content with enhanced error handling
function getStandardContent(category, standardId) {
    try {
        const standardPath = path.join(RESOURCES_DIR, category, `${standardId}.md`);
        logDebug(`Looking for standard at: ${standardPath}`);
        if (!fs.existsSync(standardPath)) {
            logError(`Standard file not found: ${standardPath}`);
            return { error: `Standard ${standardId} not found` };
        }
        const content = fs.readFileSync(standardPath, 'utf8');
        logDebug(`Successfully read standard ${standardId}, length: ${content.length}`);
        return { content };
    }
    catch (err) {
        logError(`Error reading standard ${standardId}:`, err);
        return { error: `Error reading standard ${standardId}: ${err}` };
    }
}
// Helper function to find file in subdirectories with enhanced logging
function findFileInSubdirectories(baseDir, fileName, extensions = ['.js', '.jsx', '.ts', '.tsx']) {
    try {
        logDebug(`Searching for ${fileName} in ${baseDir}`);
        // First, try with exact filename match
        let files = glob.sync(`${baseDir}/**/${fileName}`);
        if (files.length > 0) {
            logDebug(`Found exact match: ${files[0]}`);
            return files[0];
        }
        // Then try with file name + extensions
        for (const ext of extensions) {
            const fileWithExt = `${fileName}${ext}`;
            files = glob.sync(`${baseDir}/**/${fileWithExt}`);
            if (files.length > 0) {
                logDebug(`Found with extension ${ext}: ${files[0]}`);
                return files[0];
            }
        }
        logDebug(`No file found for ${fileName}`);
        return null;
    }
    catch (err) {
        logError(`Error searching for file ${fileName}:`, err);
        return null;
    }
}
// Helper function to get example content with enhanced error handling
function getExampleContent(subcategory, filename) {
    try {
        const searchDir = path.join(CODE_EXAMPLES_DIR, "react-native", subcategory);
        logDebug(`Getting example content from ${searchDir} for ${filename}`);
        const filePath = findFileInSubdirectories(searchDir, filename);
        if (!filePath || !fs.existsSync(filePath)) {
            logError(`Example file not found: ${filename} in ${subcategory}`);
            return { error: `Example ${filename} not found in ${subcategory}` };
        }
        const content = fs.readFileSync(filePath, 'utf8');
        const relativePath = path.relative(BASE_DIR, filePath);
        logDebug(`Successfully read example ${filename}, length: ${content.length}`);
        return {
            content: [content],
            path: relativePath
        };
    }
    catch (err) {
        logError(`Error reading example ${filename}:`, err);
        return { error: `Error reading example ${filename}: ${err}` };
    }
}
// Find closest match implementation with enhanced error handling
function findClosestMatch(directory, searchName, extensions = ['.js', '.jsx', '.ts', '.tsx']) {
    try {
        if (!fs.existsSync(directory)) {
            logError(`Directory does not exist: ${directory}`);
            return null;
        }
        logDebug(`Finding closest match for ${searchName} in ${directory}`);
        for (const ext of extensions) {
            const files = glob.sync(`${directory}/**/*${ext}`);
            for (const filePath of files) {
                const fileName = path.basename(filePath);
                const fileNameNoExt = path.basename(fileName, path.extname(fileName));
                if (fileNameNoExt.toLowerCase().includes(searchName.toLowerCase())) {
                    logDebug(`Found closest match: ${fileNameNoExt} for ${searchName}`);
                    return fileNameNoExt;
                }
            }
        }
        logDebug(`No closest match found for ${searchName}`);
        return null;
    }
    catch (err) {
        logError(`Error finding closest match for ${searchName}:`, err);
        return null;
    }
}
// List all available examples with enhanced error handling
function listAvailableExamples() {
    const examples = {
        components: [],
        hooks: [],
        services: [],
        screens: [],
        themes: []
    };
    try {
        const categories = [
            { key: "components", dir: "components" },
            { key: "hooks", dir: "hooks" },
            { key: "services", dir: "services" },
            { key: "screens", dir: "screens" },
            { key: "themes", dir: "theme" }
        ];
        const extensions = ['.js', '.jsx', '.ts', '.tsx'];
        for (const category of categories) {
            const dirPath = path.join(CODE_EXAMPLES_DIR, "react-native", category.dir);
            logDebug(`Scanning directory: ${dirPath}`);
            if (fs.existsSync(dirPath)) {
                for (const ext of extensions) {
                    const files = glob.sync(`${dirPath}/**/*${ext}`);
                    for (const filePath of files) {
                        const fileName = path.basename(filePath);
                        const fileNameNoExt = path.basename(fileName, path.extname(fileName));
                        if (!examples[category.key].includes(fileNameNoExt)) {
                            examples[category.key].push(fileNameNoExt);
                        }
                    }
                }
                logDebug(`Found ${examples[category.key].length} examples in ${category.key}`);
            }
            else {
                logError(`Directory does not exist: ${dirPath}`);
            }
        }
        return examples;
    }
    catch (err) {
        logError("Error listing available examples:", err);
        return examples;
    }
}
// Register tools optimized for VSCode GitHub Copilot
// 1. Get project structure
server.tool("get_project_structure", "Retrieve React Native project structure standards and best practices for organizing files and directories", {
    format: z.enum(["markdown", "json"]).optional().describe("Output format - markdown (default) or json"),
}, async ({ format = "markdown" }) => {
    logInfo("Getting project structure standards");
    const result = getStandardContent("standards", "project_structure");
    if (result.error) {
        logError("Failed to get project structure standards:", result.error);
        return {
            content: [{
                    type: "text",
                    text: `Error: ${result.error}`,
                }],
            isError: true,
        };
    }
    return {
        content: [{
                type: "text",
                text: result.content ?? "No content available",
            }],
    };
});
// 2. Get API communication standards
server.tool("get_api_communication", "Retrieve API communication standards and patterns for React Native applications, including HTTP requests, error handling, and data management", {
    format: z.enum(["markdown", "json"]).optional().describe("Output format - markdown (default) or json"),
}, async ({ format = "markdown" }) => {
    logInfo("Getting API communication standards");
    const result = getStandardContent("standards", "api_communication");
    if (result.error) {
        logError("Failed to get API communication standards:", result.error);
        return {
            content: [{
                    type: "text",
                    text: `Error: ${result.error}`,
                }],
            isError: true,
        };
    }
    return {
        content: [{
                type: "text",
                text: result.content ?? "No content available",
            }],
    };
});
// 3. Get component design standards
server.tool("get_component_design", "Retrieve component design standards and patterns for React Native development, including styling, props, and composition patterns", {
    format: z.enum(["markdown", "json"]).optional().describe("Output format - markdown (default) or json"),
}, async ({ format = "markdown" }) => {
    logInfo("Getting component design standards");
    const result = getStandardContent("standards", "component_design");
    if (result.error) {
        logError("Failed to get component design standards:", result.error);
        return {
            content: [{
                    type: "text",
                    text: `Error: ${result.error}`,
                }],
            isError: true,
        };
    }
    return {
        content: [{
                type: "text",
                text: result.content ?? "No content available",
            }],
    };
});
// 4. Get state management standards
server.tool("get_state_management", "Retrieve state management standards and patterns for React Native applications, including Redux, Context API, and local state management", {
    format: z.enum(["markdown", "json"]).optional().describe("Output format - markdown (default) or json"),
}, async ({ format = "markdown" }) => {
    logInfo("Getting state management standards");
    const result = getStandardContent("standards", "state_management");
    if (result.error) {
        logError("Failed to get state management standards:", result.error);
        return {
            content: [{
                    type: "text",
                    text: `Error: ${result.error}`,
                }],
            isError: true,
        };
    }
    return {
        content: [{
                type: "text",
                text: result.content ?? "No content available",
            }],
    };
});
// 5. Get component example
server.tool("get_component_example", "Retrieve a React Native component example with complete implementation including TypeScript types, styling, and usage patterns", {
    component_name: z.string().describe("Name of the React Native component (e.g., 'Button', 'Modal', 'LoadingSpinner')"),
    include_usage: z.boolean().optional().describe("Include usage examples (default: true)"),
    include_types: z.boolean().optional().describe("Include TypeScript type definitions (default: true)"),
}, async ({ component_name, include_usage = true, include_types = true }) => {
    if (!component_name) {
        logError("Component name not provided");
        return {
            content: [{
                    type: "text",
                    text: "Error: Component name is required",
                }],
            isError: true,
        };
    }
    logInfo(`Getting component example: ${component_name}`);
    try {
        // First try exact match
        const result = getExampleContent("components", component_name);
        if (result.error) {
            // Try to find by fuzzy match
            const componentsDir = path.join(CODE_EXAMPLES_DIR, "react-native", "components");
            const closestMatch = findClosestMatch(componentsDir, component_name);
            if (closestMatch) {
                logInfo(`Found closest match: ${closestMatch} for ${component_name}`);
                const fuzzyResult = getExampleContent("components", closestMatch);
                if (fuzzyResult.content) {
                    return {
                        content: [{
                                type: "text",
                                text: `// Found closest match: ${closestMatch}\n// File: ${fuzzyResult.path}\n\n${fuzzyResult.content[0]}`,
                            }],
                    };
                }
            }
            logError(`Component not found: ${component_name}`);
            return {
                content: [{
                        type: "text",
                        text: `Component '${component_name}' not found. Use 'list_available_examples' to see available components.`,
                    }],
                isError: true,
            };
        }
        return {
            content: [{
                    type: "text",
                    text: `// Component: ${component_name}\n// File: ${result.path}\n\n${result.content?.[0] ?? "No content available"}`,
                }],
        };
    }
    catch (err) {
        logError(`Error getting component example ${component_name}:`, err);
        return {
            content: [{
                    type: "text",
                    text: `Error retrieving component example: ${err}`,
                }],
            isError: true,
        };
    }
});
// 6. Get hook example
server.tool("get_hook_example", "Retrieve a React Native custom hook example with complete implementation including TypeScript types, dependencies, and usage patterns", {
    hook_name: z.string().describe("Name of the React Native hook (e.g., 'useAppUpdate', 'useForm', 'useApiCall')"),
    include_usage: z.boolean().optional().describe("Include usage examples (default: true)"),
}, async ({ hook_name, include_usage = true }) => {
    if (!hook_name) {
        logError("Hook name not provided");
        return {
            content: [{
                    type: "text",
                    text: "Error: Hook name is required",
                }],
            isError: true,
        };
    }
    logInfo(`Getting hook example: ${hook_name}`);
    try {
        // First try exact match
        const result = getExampleContent("hooks", hook_name);
        if (result.error) {
            // Try to find by fuzzy match
            const hooksDir = path.join(CODE_EXAMPLES_DIR, "react-native", "hooks");
            const closestMatch = findClosestMatch(hooksDir, hook_name);
            if (closestMatch) {
                logInfo(`Found closest match: ${closestMatch} for ${hook_name}`);
                const fuzzyResult = getExampleContent("hooks", closestMatch);
                if (fuzzyResult.content) {
                    return {
                        content: [{
                                type: "text",
                                text: `// Found closest match: ${closestMatch}\n// File: ${fuzzyResult.path}\n\n${fuzzyResult.content[0]}`,
                            }],
                    };
                }
            }
            logError(`Hook not found: ${hook_name}`);
            return {
                content: [{
                        type: "text",
                        text: `Hook '${hook_name}' not found. Use 'list_available_examples' to see available hooks.`,
                    }],
                isError: true,
            };
        }
        return {
            content: [{
                    type: "text",
                    text: `// Hook: ${hook_name}\n// File: ${result.path}\n\n${result.content?.[0] ?? "No content available"}`,
                }],
        };
    }
    catch (err) {
        logError(`Error getting hook example ${hook_name}:`, err);
        return {
            content: [{
                    type: "text",
                    text: `Error retrieving hook example: ${err}`,
                }],
            isError: true,
        };
    }
});
// 7. Get service example
// 7. Get service example
server.tool("get_service_example", "Retrieve a React Native service example with complete implementation including API calls, error handling, and data processing patterns", {
    service_name: z.string().describe("Name of the React Native service (e.g., 'apiService', 'authService', 'storageService')"),
    include_types: z.boolean().optional().describe("Include TypeScript type definitions (default: true)"),
}, async ({ service_name, include_types = true }) => {
    if (!service_name) {
        logError("Service name not provided");
        return {
            content: [{
                    type: "text",
                    text: "Error: Service name is required",
                }],
            isError: true,
        };
    }
    logInfo(`Getting service example: ${service_name}`);
    try {
        // First try exact match
        const result = getExampleContent("services", service_name);
        if (result.error) {
            // Try to find by fuzzy match
            const servicesDir = path.join(CODE_EXAMPLES_DIR, "react-native", "services");
            const closestMatch = findClosestMatch(servicesDir, service_name);
            if (closestMatch) {
                logInfo(`Found closest match: ${closestMatch} for ${service_name}`);
                const fuzzyResult = getExampleContent("services", closestMatch);
                if (fuzzyResult.content) {
                    return {
                        content: [{
                                type: "text",
                                text: `// Found closest match: ${closestMatch}\n// File: ${fuzzyResult.path}\n\n${fuzzyResult.content[0]}`,
                            }],
                    };
                }
            }
            logError(`Service not found: ${service_name}`);
            return {
                content: [{
                        type: "text",
                        text: `Service '${service_name}' not found. Use 'list_available_examples' to see available services.`,
                    }],
                isError: true,
            };
        }
        return {
            content: [{
                    type: "text",
                    text: `// Service: ${service_name}\n// File: ${result.path}\n\n${result.content?.[0] ?? "No content available"}`,
                }],
        };
    }
    catch (err) {
        logError(`Error getting service example ${service_name}:`, err);
        return {
            content: [{
                    type: "text",
                    text: `Error retrieving service example: ${err}`,
                }],
            isError: true,
        };
    }
});
// 8. Get screen example
server.tool("get_screen_example", "Retrieve a React Native screen example with complete implementation including navigation, state management, and UI components", {
    screen_name: z.string().describe("Name of the React Native screen (e.g., 'LoginScreen', 'HomeScreen', 'ProfileScreen')"),
    include_navigation: z.boolean().optional().describe("Include navigation setup (default: true)"),
    include_styles: z.boolean().optional().describe("Include styling examples (default: true)"),
}, async ({ screen_name, include_navigation = true, include_styles = true }) => {
    if (!screen_name) {
        logError("Screen name not provided");
        return {
            content: [{
                    type: "text",
                    text: "Error: Screen name is required",
                }],
            isError: true,
        };
    }
    logInfo(`Getting screen example: ${screen_name}`);
    try {
        // First try exact match
        const result = getExampleContent("screens", screen_name);
        if (result.error) {
            // Try to find by fuzzy match
            const screensDir = path.join(CODE_EXAMPLES_DIR, "react-native", "screens");
            const closestMatch = findClosestMatch(screensDir, screen_name);
            if (closestMatch) {
                logInfo(`Found closest match: ${closestMatch} for ${screen_name}`);
                const fuzzyResult = getExampleContent("screens", closestMatch);
                if (fuzzyResult.content) {
                    return {
                        content: [{
                                type: "text",
                                text: `// Found closest match: ${closestMatch}\n// File: ${fuzzyResult.path}\n\n${fuzzyResult.content[0]}`,
                            }],
                    };
                }
            }
            logError(`Screen not found: ${screen_name}`);
            return {
                content: [{
                        type: "text",
                        text: `Screen '${screen_name}' not found. Use 'list_available_examples' to see available screens.`,
                    }],
                isError: true,
            };
        }
        return {
            content: [{
                    type: "text",
                    text: `// Screen: ${screen_name}\n// File: ${result.path}\n\n${result.content?.[0] ?? "No content available"}`,
                }],
        };
    }
    catch (err) {
        logError(`Error getting screen example ${screen_name}:`, err);
        return {
            content: [{
                    type: "text",
                    text: `Error retrieving screen example: ${err}`,
                }],
            isError: true,
        };
    }
});
// 9. Get theme example
server.tool("get_theme_example", "Retrieve React Native theme and styling examples including colors, typography, spacing, and component styles", {
    theme_name: z.string().describe("Name of the theme or style component (e.g., 'colors', 'typography', 'theme')"),
    include_usage: z.boolean().optional().describe("Include usage examples (default: true)"),
}, async ({ theme_name, include_usage = true }) => {
    if (!theme_name) {
        logError("Theme name not provided");
        return {
            content: [{
                    type: "text",
                    text: "Error: Theme name is required",
                }],
            isError: true,
        };
    }
    logInfo(`Getting theme example: ${theme_name}`);
    try {
        // First try exact match
        const result = getExampleContent("theme", theme_name);
        if (result.error) {
            // Try to find by fuzzy match
            const themesDir = path.join(CODE_EXAMPLES_DIR, "react-native", "theme");
            const closestMatch = findClosestMatch(themesDir, theme_name);
            if (closestMatch) {
                logInfo(`Found closest match: ${closestMatch} for ${theme_name}`);
                const fuzzyResult = getExampleContent("theme", closestMatch);
                if (fuzzyResult.content) {
                    return {
                        content: [{
                                type: "text",
                                text: `// Found closest match: ${closestMatch}\n// File: ${fuzzyResult.path}\n\n${fuzzyResult.content[0]}`,
                            }],
                    };
                }
            }
            logError(`Theme not found: ${theme_name}`);
            return {
                content: [{
                        type: "text",
                        text: `Theme '${theme_name}' not found. Use 'list_available_examples' to see available themes.`,
                    }],
                isError: true,
            };
        }
        return {
            content: [{
                    type: "text",
                    text: `// Theme: ${theme_name}\n// File: ${result.path}\n\n${result.content?.[0] ?? "No content available"}`,
                }],
        };
    }
    catch (err) {
        logError(`Error getting theme example ${theme_name}:`, err);
        return {
            content: [{
                    type: "text",
                    text: `Error retrieving theme example: ${err}`,
                }],
            isError: true,
        };
    }
});
// 10. List available examples
server.tool("list_available_examples", "List all available code examples organized by category (components, hooks, services, screens, themes) for React Native development", {
    category: z.enum(["components", "hooks", "services", "screens", "themes", "all"]).optional().describe("Filter by category, or 'all' for everything (default)"),
    format: z.enum(["json", "markdown"]).optional().describe("Output format - json (default) or markdown"),
}, async ({ category = "all", format = "json" }) => {
    logInfo(`Listing available examples for category: ${category}`);
    try {
        const examples = listAvailableExamples();
        if (category !== "all" && examples[category]) {
            const filtered = { [category]: examples[category] };
            if (format === "markdown") {
                const markdown = `# Available ${category.charAt(0).toUpperCase() + category.slice(1)} Examples\n\n${filtered[category].map(item => `- ${item}`).join('\n')}`;
                return {
                    content: [{
                            type: "text",
                            text: markdown,
                        }],
                };
            }
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify(filtered, null, 2),
                    }],
            };
        }
        if (format === "markdown") {
            let markdown = "# Available React Native Examples\n\n";
            for (const [cat, items] of Object.entries(examples)) {
                markdown += `## ${cat.charAt(0).toUpperCase() + cat.slice(1)} (${items.length})\n`;
                markdown += items.map(item => `- ${item}`).join('\n') + '\n\n';
            }
            return {
                content: [{
                        type: "text",
                        text: markdown,
                    }],
            };
        }
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify(examples, null, 2),
                }],
        };
    }
    catch (err) {
        logError("Error listing available examples:", err);
        return {
            content: [{
                    type: "text",
                    text: `Error listing available examples: ${err}`,
                }],
            isError: true,
        };
    }
});
// Add resource discovery for VSCode integration
server.resource("standards/project_structure", "React Native project structure standards", async () => {
    const result = getStandardContent("standards", "project_structure");
    return {
        contents: [{
                uri: "standards://project_structure",
                mimeType: "text/markdown",
                text: result.content ?? result.error ?? "Content not available",
            }],
    };
});
server.resource("standards/api_communication", "React Native API communication standards", async () => {
    const result = getStandardContent("standards", "api_communication");
    return {
        contents: [{
                uri: "standards://api_communication",
                mimeType: "text/markdown",
                text: result.content ?? result.error ?? "Content not available",
            }],
    };
});
server.resource("standards/component_design", "React Native component design standards", async () => {
    const result = getStandardContent("standards", "component_design");
    return {
        contents: [{
                uri: "standards://component_design",
                mimeType: "text/markdown",
                text: result.content ?? result.error ?? "Content not available",
            }],
    };
});
server.resource("standards/state_management", "React Native state management standards", async () => {
    const result = getStandardContent("standards", "state_management");
    return {
        contents: [{
                uri: "standards://state_management",
                mimeType: "text/markdown",
                text: result.content ?? result.error ?? "Content not available",
            }],
    };
});
// Health check and server validation
function validateServerSetup() {
    const errors = [];
    // Check if base directories exist
    if (!fs.existsSync(BASE_DIR)) {
        errors.push(`Base directory does not exist: ${BASE_DIR}`);
    }
    if (!fs.existsSync(RESOURCES_DIR)) {
        errors.push(`Resources directory does not exist: ${RESOURCES_DIR}`);
    }
    if (!fs.existsSync(CODE_EXAMPLES_DIR)) {
        errors.push(`Code examples directory does not exist: ${CODE_EXAMPLES_DIR}`);
    }
    // Check for standards files
    const standardsDir = path.join(RESOURCES_DIR, "standards");
    const requiredStandards = ["project_structure", "api_communication", "component_design", "state_management"];
    for (const standard of requiredStandards) {
        const standardPath = path.join(standardsDir, `${standard}.md`);
        if (!fs.existsSync(standardPath)) {
            errors.push(`Standard file missing: ${standardPath}`);
        }
    }
    return {
        isValid: errors.length === 0,
        errors
    };
}
// Run the server with enhanced error handling and health checks
async function main() {
    try {
        logInfo("Starting BluestoneApps MCP Server for VSCode GitHub Copilot");
        // Validate server setup
        const validation = validateServerSetup();
        if (!validation.isValid) {
            logError("Server setup validation failed:");
            validation.errors.forEach(error => logError(`  - ${error}`));
            process.exit(1);
        }
        logInfo("Server setup validation passed");
        // Determine transport type based on command line arguments
        const args = process.argv.slice(2);
        const useHttp = args.includes('--http') || args.includes('-h') || process.env.MCP_TRANSPORT === 'http';
        if (useHttp) {
            // HTTP JSON-RPC transport (for VSCode GitHub Copilot integration)
            const { createServer } = await import('http');
            const { parse } = await import('url');
            const httpServer = createServer(async (req, res) => {
                const parsedUrl = parse(req.url || '', true);
                const pathname = parsedUrl.pathname;
                // CORS headers
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
                res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
                if (req.method === 'OPTIONS') {
                    res.writeHead(200);
                    res.end();
                    return;
                }
                if (pathname === '/' && req.method === 'POST') {
                    // Handle JSON-RPC requests with proper MCP transport
                    let body = '';
                    req.on('data', chunk => body += chunk);
                    req.on('end', async () => {
                        try {
                            const jsonrpcRequest = JSON.parse(body);
                            logInfo(`Received JSON-RPC request: ${jsonrpcRequest.method}`);
                            // Create HTTP transport for this request
                            const transport = new HTTPTransport();
                            transport.setResponse(res);
                            transport.setRequest(req);
                            // Connect server with the transport
                            await server.connect(transport);
                            // Send the request to the server
                            if (transport.onmessage) {
                                transport.onmessage(jsonrpcRequest);
                            }
                            else {
                                logError('Transport onmessage handler not set');
                                res.writeHead(500, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({
                                    jsonrpc: '2.0',
                                    id: jsonrpcRequest.id || null,
                                    error: {
                                        code: -32603,
                                        message: 'Internal error: Transport not properly initialized'
                                    }
                                }));
                            }
                        }
                        catch (error) {
                            logError('Error processing JSON-RPC request:', error);
                            res.writeHead(400, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({
                                jsonrpc: '2.0',
                                id: null,
                                error: {
                                    code: -32700,
                                    message: 'Parse error'
                                }
                            }));
                        }
                    });
                }
                else if (pathname === '/status' || (pathname === '/' && req.method === 'GET')) {
                    // Status endpoint
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        status: 'running',
                        server: 'bluestoneapps-copilot',
                        version: '1.0.0',
                        port: SERVER_PORT,
                        host: SERVER_HOST,
                        transport: 'http-jsonrpc',
                        message: 'MCP Server running with HTTP JSON-RPC transport. POST JSON-RPC requests to /',
                        capabilities: {
                            tools: true,
                            resources: true,
                            logging: true
                        }
                    }));
                }
                else {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('Not Found');
                }
            });
            httpServer.listen(SERVER_PORT, SERVER_HOST, () => {
                logInfo(`BluestoneApps MCP Server running on HTTP at http://${SERVER_HOST}:${SERVER_PORT}`);
                logInfo(`JSON-RPC endpoint: http://${SERVER_HOST}:${SERVER_PORT}/`);
                logInfo(`Status endpoint: http://${SERVER_HOST}:${SERVER_PORT}/status`);
                logInfo('Ready for MCP JSON-RPC over HTTP requests');
            });
        }
        else {
            // Default: stdio transport (for VSCode integration)
            const transport = new StdioServerTransport();
            await server.connect(transport);
            logInfo("BluestoneApps MCP Server successfully connected and running on stdio");
        }
        logInfo("Server capabilities: tools, resources, logging");
        logInfo("Ready to assist with React Native development standards and examples");
        logInfo(`Server configuration: Port ${SERVER_PORT}, Host ${SERVER_HOST}`);
        // Log available examples summary
        try {
            const examples = listAvailableExamples();
            const totalExamples = Object.values(examples).reduce((sum, arr) => sum + arr.length, 0);
            logInfo(`Loaded ${totalExamples} code examples across ${Object.keys(examples).length} categories`);
        }
        catch (err) {
            logError("Failed to load examples summary:", err);
        }
    }
    catch (error) {
        logError("Failed to start server:", error);
        process.exit(1);
    }
}
// Enhanced error handling for the main process
main().catch((error) => {
    logError("Fatal error in main():", error);
    process.exit(1);
});
// Graceful shutdown handling
process.on('SIGINT', () => {
    logInfo("Received SIGINT, shutting down gracefully...");
    process.exit(0);
});
process.on('SIGTERM', () => {
    logInfo("Received SIGTERM, shutting down gracefully...");
    process.exit(0);
});
process.on('uncaughtException', (error) => {
    logError("Uncaught exception:", error);
    process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
    logError(`Unhandled rejection at: ${promise}, reason: ${reason}`);
    process.exit(1);
});
