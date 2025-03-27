import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';
// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Base directory for resources
const BASE_DIR = path.resolve(__dirname, '..');
const RESOURCES_DIR = path.join(BASE_DIR, "resources");
const CODE_EXAMPLES_DIR = path.join(RESOURCES_DIR, "code-examples");
// Create server instance
const server = new McpServer({
    name: "bluestoneapps-react-native",
    version: "0.2.1",
    capabilities: {
        tools: {},
    },
});
// Helper function to get standard content
function getStandardContent(category, standardId) {
    const standardPath = path.join(RESOURCES_DIR, category, `${standardId}.md`);
    if (!fs.existsSync(standardPath)) {
        return { error: `Standard ${standardId} not found` };
    }
    try {
        const content = fs.readFileSync(standardPath, 'utf8');
        return { content };
    }
    catch (err) {
        console.error(`Error reading standard ${standardId}:`, err);
        return { error: `Error reading standard ${standardId}` };
    }
}
// Helper function to find file in subdirectories
function findFileInSubdirectories(baseDir, fileName, extensions = ['.js', '.jsx', '.ts', '.tsx']) {
    // First, try with exact filename match
    let files = glob.sync(`${baseDir}/**/${fileName}`);
    if (files.length > 0) {
        return files[0];
    }
    // Then try with file name + extensions
    for (const ext of extensions) {
        const fileWithExt = `${fileName}${ext}`;
        files = glob.sync(`${baseDir}/**/${fileWithExt}`);
        if (files.length > 0) {
            return files[0];
        }
    }
    return null;
}
// Helper function to get example content
function getExampleContent(subcategory, filename) {
    const searchDir = path.join(CODE_EXAMPLES_DIR, "react-native", subcategory);
    const filePath = findFileInSubdirectories(searchDir, filename);
    if (!filePath || !fs.existsSync(filePath)) {
        return { error: `Example ${filename} not found` };
    }
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return {
            content: [content],
            path: path.relative(BASE_DIR, filePath)
        };
    }
    catch (err) {
        console.error(`Error reading example ${filename}:`, err);
        return { error: `Error reading example ${filename}` };
    }
}
// Find closest match implementation
function findClosestMatch(directory, searchName, extensions = ['.js', '.jsx', '.ts', '.tsx']) {
    if (!fs.existsSync(directory))
        return null;
    let closestMatch = null;
    for (const ext of extensions) {
        const files = glob.sync(`${directory}/**/*${ext}`);
        for (const filePath of files) {
            const fileName = path.basename(filePath);
            const fileNameNoExt = path.basename(fileName, path.extname(fileName));
            if (fileNameNoExt.toLowerCase().includes(searchName.toLowerCase())) {
                closestMatch = fileNameNoExt;
                break;
            }
        }
        if (closestMatch)
            break;
    }
    return closestMatch;
}
// List all available examples
function listAvailableExamples() {
    const examples = {
        components: [],
        hooks: [],
        services: [],
        screens: [],
        themes: []
    };
    const categories = [
        { key: "components", dir: "components" },
        { key: "hooks", dir: "hooks" },
        { key: "services", dir: "helper" },
        { key: "screens", dir: "screens" },
        { key: "themes", dir: "theme" }
    ];
    const extensions = ['.js', '.jsx', '.ts', '.tsx'];
    for (const category of categories) {
        const dirPath = path.join(CODE_EXAMPLES_DIR, "react-native", category.dir);
        if (fs.existsSync(dirPath)) {
            for (const ext of extensions) {
                const files = glob.sync(`${dirPath}/**/*${ext}`);
                for (const filePath of files) {
                    const fileName = path.basename(filePath);
                    const fileNameNoExt = path.basename(fileName, path.extname(fileName));
                    examples[category.key].push(fileNameNoExt);
                }
            }
        }
    }
    return examples;
}
// Register tools
// 1. Get project structure
server.tool("get_project_structure", "Get project structure standards for React Native development", {}, async () => {
    const result = getStandardContent("standards", "project_structure");
    return {
        content: [
            {
                type: "text",
                text: result.content ?? result.error ?? "Error: No content or error message available",
            },
        ],
    };
});
// 2. Get API communication
server.tool("get_api_communication", "Get API communication standards for React Native development", {}, async () => {
    const result = getStandardContent("standards", "api_communication");
    return {
        content: [
            {
                type: "text",
                text: result.content ?? result.error ?? "Error: No content or error message available",
            },
        ],
    };
});
// 3. Get component design
server.tool("get_component_design", "Get component design standards for React Native development", {}, async () => {
    const result = getStandardContent("standards", "component_design");
    return {
        content: [
            {
                type: "text",
                text: result.content ?? result.error ?? "Error: No content or error message available",
            },
        ],
    };
});
// 4. Get state management
server.tool("get_state_management", "Get state management standards for React Native development", {}, async () => {
    const result = getStandardContent("standards", "state_management");
    return {
        content: [
            {
                type: "text",
                text: result.content ?? result.error ?? "Error: No content or error message available",
            },
        ],
    };
});
// 5. Get component example
server.tool("get_component_example", "Get a React Native component example", {
    component_name: z.string().describe("Component Name"),
}, async ({ component_name }) => {
    if (!component_name) {
        return {
            content: [
                {
                    type: "text",
                    text: "Component name not specified",
                },
            ],
        };
    }
    try {
        // First try exact match
        const result = getExampleContent("components", component_name);
        if (result.error) {
            // Try to find by fuzzy match
            const componentsDir = path.join(CODE_EXAMPLES_DIR, "react-native", "components");
            const closestMatch = findClosestMatch(componentsDir, component_name);
            if (closestMatch) {
                const fuzzyResult = getExampleContent("components", closestMatch);
                return {
                    content: [
                        {
                            type: "text",
                            text: fuzzyResult.content?.[0] ?? fuzzyResult.error ?? "Error: No content available",
                        },
                    ],
                };
            }
            else {
                return {
                    content: [
                        {
                            type: "text",
                            text: `Component ${component_name} not found`,
                        },
                    ],
                };
            }
        }
        return {
            content: [
                {
                    type: "text",
                    text: result.content?.[0] ?? result.error ?? "Error: No content available",
                },
            ],
        };
    }
    catch (err) {
        console.error(`Error getting component example ${component_name}:`, err);
        return {
            content: [
                {
                    type: "text",
                    text: `Error getting component example: ${err}`,
                },
            ],
        };
    }
});
// 6. Get hook example
server.tool("get_hook_example", "Get a React Native hook example", {
    hook_name: z.string().describe("Hook Name"),
}, async ({ hook_name }) => {
    if (!hook_name) {
        return {
            content: [
                {
                    type: "text",
                    text: "Hook name not specified",
                },
            ],
        };
    }
    try {
        // First try exact match
        const result = getExampleContent("hooks", hook_name);
        if (result.error) {
            // Try to find by fuzzy match
            const hooksDir = path.join(CODE_EXAMPLES_DIR, "react-native", "hooks");
            const closestMatch = findClosestMatch(hooksDir, hook_name);
            if (closestMatch) {
                const fuzzyResult = getExampleContent("hooks", closestMatch);
                return {
                    content: [
                        {
                            type: "text",
                            text: fuzzyResult.content?.[0] ?? fuzzyResult.error ?? "Error: No content available",
                        },
                    ],
                };
            }
            else {
                return {
                    content: [
                        {
                            type: "text",
                            text: `Hook ${hook_name} not found`,
                        },
                    ],
                };
            }
        }
        return {
            content: [
                {
                    type: "text",
                    text: result.content?.[0] ?? result.error ?? "Error: No content available",
                },
            ],
        };
    }
    catch (err) {
        console.error(`Error getting hook example ${hook_name}:`, err);
        return {
            content: [
                {
                    type: "text",
                    text: `Error getting hook example: ${err}`,
                },
            ],
        };
    }
});
// 7. Get service example
server.tool("get_service_example", "Get a React Native service example", {
    service_name: z.string().describe("Service Name"),
}, async ({ service_name }) => {
    if (!service_name) {
        return {
            content: [
                {
                    type: "text",
                    text: "Service name not specified",
                },
            ],
        };
    }
    try {
        // First try exact match
        const result = getExampleContent("helper", service_name);
        if (result.error) {
            // Try to find by fuzzy match
            const servicesDir = path.join(CODE_EXAMPLES_DIR, "react-native", "helper");
            const closestMatch = findClosestMatch(servicesDir, service_name);
            if (closestMatch) {
                const fuzzyResult = getExampleContent("helper", closestMatch);
                return {
                    content: [
                        {
                            type: "text",
                            text: fuzzyResult.content?.[0] ?? fuzzyResult.error ?? "Error: No content available",
                        },
                    ],
                };
            }
            else {
                return {
                    content: [
                        {
                            type: "text",
                            text: `Service ${service_name} not found`,
                        },
                    ],
                };
            }
        }
        return {
            content: [
                {
                    type: "text",
                    text: result.content?.[0] ?? result.error ?? "Error: No content available",
                },
            ],
        };
    }
    catch (err) {
        console.error(`Error getting service example ${service_name}:`, err);
        return {
            content: [
                {
                    type: "text",
                    text: `Error getting service example: ${err}`,
                },
            ],
        };
    }
});
// 8. Get screen example
server.tool("get_screen_example", "Get a React Native screen example", {
    screen_name: z.string().describe("Screen Name"),
}, async ({ screen_name }) => {
    if (!screen_name) {
        return {
            content: [
                {
                    type: "text",
                    text: "Screen name not specified",
                },
            ],
        };
    }
    try {
        // First try exact match
        const result = getExampleContent("screens", screen_name);
        if (result.error) {
            // Try to find by fuzzy match
            const screensDir = path.join(CODE_EXAMPLES_DIR, "react-native", "screens");
            const closestMatch = findClosestMatch(screensDir, screen_name);
            if (closestMatch) {
                const fuzzyResult = getExampleContent("screens", closestMatch);
                return {
                    content: [
                        {
                            type: "text",
                            text: fuzzyResult.content?.[0] ?? fuzzyResult.error ?? "Error: No content available",
                        },
                    ],
                };
            }
            else {
                return {
                    content: [
                        {
                            type: "text",
                            text: `Screen ${screen_name} not found`,
                        },
                    ],
                };
            }
        }
        return {
            content: [
                {
                    type: "text",
                    text: result.content?.[0] ?? result.error ?? "Error: No content available",
                },
            ],
        };
    }
    catch (err) {
        console.error(`Error getting screen example ${screen_name}:`, err);
        return {
            content: [
                {
                    type: "text",
                    text: `Error getting screen example: ${err}`,
                },
            ],
        };
    }
});
// 9. Get theme example
server.tool("get_theme_example", "Get a React Native theme example", {
    theme_name: z.string().describe("Theme Name"),
}, async ({ theme_name }) => {
    if (!theme_name) {
        return {
            content: [
                {
                    type: "text",
                    text: "Theme name not specified",
                },
            ],
        };
    }
    try {
        // First try exact match
        const result = getExampleContent("theme", theme_name);
        if (result.error) {
            // Try to find by fuzzy match
            const themesDir = path.join(CODE_EXAMPLES_DIR, "react-native", "theme");
            const closestMatch = findClosestMatch(themesDir, theme_name);
            if (closestMatch) {
                const fuzzyResult = getExampleContent("theme", closestMatch);
                return {
                    content: [
                        {
                            type: "text",
                            text: fuzzyResult.content?.[0] ?? fuzzyResult.error ?? "Error: No content available",
                        },
                    ],
                };
            }
            else {
                return {
                    content: [
                        {
                            type: "text",
                            text: `Theme ${theme_name} not found`,
                        },
                    ],
                };
            }
        }
        return {
            content: [
                {
                    type: "text",
                    text: result.content?.[0] ?? result.error ?? "Error: No content available",
                },
            ],
        };
    }
    catch (err) {
        console.error(`Error getting theme example ${theme_name}:`, err);
        return {
            content: [
                {
                    type: "text",
                    text: `Error getting theme example: ${err}`,
                },
            ],
        };
    }
});
// 10. List available examples
server.tool("list_available_examples", "List all available code examples by category", {}, async () => {
    try {
        const examples = listAvailableExamples();
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(examples, null, 2),
                },
            ],
        };
    }
    catch (err) {
        console.error("Error listing available examples:", err);
        return {
            content: [
                {
                    type: "text",
                    text: `Error listing available examples: ${err}`,
                },
            ],
        };
    }
});
// Run the server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("BluestoneApps MCP Server running on stdio");
}
main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
