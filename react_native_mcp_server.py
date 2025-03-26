#!/usr/bin/env python3
"""
Simple MCP Server for BluestoneApps Coding Standards and Examples (stdio version)

This server implements the Model Context Protocol (MCP) over stdio,
allowing direct access to coding standards and code examples from tools like Windsurf.
"""

import os
import sys
import json
import glob
import logging
import asyncio
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv

# Set up logging to file
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    filename='/Users/lallen30/Documents/dev/mcp/compare/app/mcp_stdio.log'
)

# Load environment variables
load_dotenv()

# Base directory for resources
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
RESOURCES_DIR = os.path.join(BASE_DIR, "resources")
CODE_EXAMPLES_DIR = os.path.join(RESOURCES_DIR, "code-examples")

# MCP Server Info
SERVER_NAME = "bluestoneapps"
SERVER_VERSION = "0.2.1"
SERVER_DESCRIPTION = "BluestoneApps Coding Standards and Examples"

# Available tools
TOOLS = {
    "get_project_structure": {
        "description": "Get project structure standards for React Native development",
        "parameters": {}
    },
    "get_api_communication": {
        "description": "Get API communication standards for React Native development",
        "parameters": {}
    },
    "get_component_design": {
        "description": "Get component design standards for React Native development",
        "parameters": {}
    },
    "get_state_management": {
        "description": "Get state management standards for React Native development",
        "parameters": {}
    },
    "get_component_example": {
        "description": "Get a React Native component example",
        "parameters": {
            "component_name": {
                "title": "Component Name",
                "type": "string"
            }
        }
    },
    "get_hook_example": {
        "description": "Get a React Native hook example",
        "parameters": {
            "hook_name": {
                "title": "Hook Name",
                "type": "string"
            }
        }
    },
    "get_service_example": {
        "description": "Get a React Native service example",
        "parameters": {
            "service_name": {
                "title": "Service Name",
                "type": "string"
            }
        }
    },
    "get_screen_example": {
        "description": "Get a React Native screen example",
        "parameters": {
            "screen_name": {
                "title": "Screen Name",
                "type": "string"
            }
        }
    },
    "get_theme_example": {
        "description": "Get a React Native theme example",
        "parameters": {
            "theme_name": {
                "title": "Theme Name",
                "type": "string"
            }
        }
    },
    "list_available_examples": {
        "description": "List all available code examples by category",
        "parameters": {}
    }
}

def get_standard_content(category, standard_id):
    """Get the content of a coding standard"""
    standard_path = os.path.join(RESOURCES_DIR, category, "{}.md".format(standard_id))
    
    if not os.path.exists(standard_path):
        return {"error": f"Standard {standard_id} not found"}
    
    with open(standard_path, "r") as f:
        content = f.read()
    
    return {"content": content}

def get_project_structure(**kwargs):
    """Get project structure standards"""
    return get_standard_content("standards", "project_structure")

def get_api_communication(**kwargs):
    """Get API communication standards"""
    return get_standard_content("standards", "api_communication")

def get_component_design(**kwargs):
    """Get component design standards"""
    return get_standard_content("standards", "component_design")

def get_state_management(**kwargs):
    """Get state management standards"""
    return get_standard_content("standards", "state_management")

def find_file_in_subdirectories(base_dir, file_name, extensions=None):
    """Find a file in subdirectories based on name and possible extensions"""
    if extensions is None:
        extensions = [".js", ".jsx", ".ts", ".tsx"]
    
    # First, try with exact filename match
    for root, dirs, files in os.walk(base_dir):
        if file_name in files:
            return os.path.join(root, file_name)
    
    # Then try with file name + extensions
    for ext in extensions:
        file_with_ext = f"{file_name}{ext}"
        for root, dirs, files in os.walk(base_dir):
            if file_with_ext in files:
                return os.path.join(root, file_with_ext)
    
    return None

def get_example_content(subcategory, filename):
    """Get the content of a code example"""
    search_dir = os.path.join(CODE_EXAMPLES_DIR, "react-native", subcategory)
    
    file_path = find_file_in_subdirectories(search_dir, filename)
    
    if not file_path or not os.path.exists(file_path):
        return {"error": f"Example {filename} not found"}
    
    with open(file_path, "r") as f:
        content = f.read()
    
    return {
        "content": [content],
        "path": os.path.relpath(file_path, BASE_DIR)
    }

def get_component_example(component_name=None, **kwargs):
    """Get a component example"""
    if not component_name:
        return {"error": "Component name not specified"}
    
    try:
        # First try exact match
        return get_example_content("components", component_name)
    except Exception:
        # Try to find by fuzzy match
        components_dir = os.path.join(CODE_EXAMPLES_DIR, "react-native", "components")
        
        # List all component files
        component_files = []
        for ext in [".js", ".jsx", ".ts", ".tsx"]:
            component_files.extend(glob.glob(os.path.join(components_dir, f"*{ext}")))
        
        # Find closest match
        closest_match = None
        for file_path in component_files:
            file_name = os.path.basename(file_path)
            file_name_no_ext = os.path.splitext(file_name)[0]
            if component_name.lower() in file_name_no_ext.lower():
                closest_match = file_name_no_ext
                break
        
        if closest_match:
            return get_example_content("components", closest_match)
        else:
            return {"error": f"Component {component_name} not found"}

def get_hook_example(hook_name=None, **kwargs):
    """Get a hook example"""
    if not hook_name:
        return {"error": "Hook name not specified"}
    
    try:
        # First try exact match
        return get_example_content("hooks", hook_name)
    except Exception:
        # Try to find by fuzzy match
        hooks_dir = os.path.join(CODE_EXAMPLES_DIR, "react-native", "hooks")
        
        # List all hook files
        hook_files = []
        for ext in [".js", ".jsx", ".ts", ".tsx"]:
            hook_files.extend(glob.glob(os.path.join(hooks_dir, f"*{ext}")))
        
        # Find closest match
        closest_match = None
        for file_path in hook_files:
            file_name = os.path.basename(file_path)
            file_name_no_ext = os.path.splitext(file_name)[0]
            if hook_name.lower() in file_name_no_ext.lower():
                closest_match = file_name_no_ext
                break
        
        if closest_match:
            return get_example_content("hooks", closest_match)
        else:
            return {"error": f"Hook {hook_name} not found"}

def get_service_example(service_name=None, **kwargs):
    """Get a service example"""
    if not service_name:
        return {"error": "Service name not specified"}
    
    try:
        # First try exact match
        return get_example_content("helper", service_name)
    except Exception:
        # Try to find by fuzzy match
        services_dir = os.path.join(CODE_EXAMPLES_DIR, "react-native", "helper")
        
        # List all service files
        service_files = []
        for ext in [".js", ".jsx", ".ts", ".tsx"]:
            service_files.extend(glob.glob(os.path.join(services_dir, f"*{ext}")))
        
        # Find closest match
        closest_match = None
        for file_path in service_files:
            file_name = os.path.basename(file_path)
            file_name_no_ext = os.path.splitext(file_name)[0]
            if service_name.lower() in file_name_no_ext.lower():
                closest_match = file_name_no_ext
                break
        
        if closest_match:
            return get_example_content("helper", closest_match)
        else:
            return {"error": f"Service {service_name} not found"}

def get_screen_example(screen_name=None, **kwargs):
    """Get a screen example"""
    if not screen_name:
        return {"error": "Screen name not specified"}
    
    try:
        # First try exact match
        return get_example_content("screens", screen_name)
    except Exception:
        # Try to find by fuzzy match
        screens_dir = os.path.join(CODE_EXAMPLES_DIR, "react-native", "screens")
        
        # List all screen files
        screen_files = []
        for ext in [".js", ".jsx", ".ts", ".tsx"]:
            screen_files.extend(glob.glob(os.path.join(screens_dir, f"*{ext}")))
        
        # Find closest match
        closest_match = None
        for file_path in screen_files:
            file_name = os.path.basename(file_path)
            file_name_no_ext = os.path.splitext(file_name)[0]
            if screen_name.lower() in file_name_no_ext.lower():
                closest_match = file_name_no_ext
                break
        
        if closest_match:
            return get_example_content("screens", closest_match)
        else:
            return {"error": f"Screen {screen_name} not found"}

def get_theme_example(theme_name=None, **kwargs):
    """Get a theme example"""
    if not theme_name:
        return {"error": "Theme name not specified"}
    
    try:
        # First try exact match
        return get_example_content("theme", theme_name)
    except Exception:
        # Try to find by fuzzy match
        themes_dir = os.path.join(CODE_EXAMPLES_DIR, "react-native", "theme")
        
        # List all theme files
        theme_files = []
        for ext in [".js", ".jsx", ".ts", ".tsx"]:
            theme_files.extend(glob.glob(os.path.join(themes_dir, f"*{ext}")))
        
        # Find closest match
        closest_match = None
        for file_path in theme_files:
            file_name = os.path.basename(file_path)
            file_name_no_ext = os.path.splitext(file_name)[0]
            if theme_name.lower() in file_name_no_ext.lower():
                closest_match = file_name_no_ext
                break
        
        if closest_match:
            return get_example_content("theme", closest_match)
        else:
            return {"error": f"Theme {theme_name} not found"}

def list_available_examples(**kwargs):
    """List all available code examples by category"""
    examples = {
        "components": [],
        "hooks": [],
        "services": [],
        "screens": [],
        "themes": []
    }
    
    # Components
    components_dir = os.path.join(CODE_EXAMPLES_DIR, "react-native", "components")
    if os.path.exists(components_dir):
        for ext in [".js", ".jsx", ".ts", ".tsx"]:
            for file_path in glob.glob(os.path.join(components_dir, f"*{ext}")):
                file_name = os.path.basename(file_path)
                file_name_no_ext = os.path.splitext(file_name)[0]
                examples["components"].append(file_name_no_ext)
    
    # Hooks
    hooks_dir = os.path.join(CODE_EXAMPLES_DIR, "react-native", "hooks")
    if os.path.exists(hooks_dir):
        for ext in [".js", ".jsx", ".ts", ".tsx"]:
            for file_path in glob.glob(os.path.join(hooks_dir, f"*{ext}")):
                file_name = os.path.basename(file_path)
                file_name_no_ext = os.path.splitext(file_name)[0]
                examples["hooks"].append(file_name_no_ext)
    
    # Services
    services_dir = os.path.join(CODE_EXAMPLES_DIR, "react-native", "helper")
    if os.path.exists(services_dir):
        for ext in [".js", ".jsx", ".ts", ".tsx"]:
            for file_path in glob.glob(os.path.join(services_dir, f"*{ext}")):
                file_name = os.path.basename(file_path)
                file_name_no_ext = os.path.splitext(file_name)[0]
                examples["services"].append(file_name_no_ext)
    
    # Screens
    screens_dir = os.path.join(CODE_EXAMPLES_DIR, "react-native", "screens")
    if os.path.exists(screens_dir):
        for ext in [".js", ".jsx", ".ts", ".tsx"]:
            for file_path in glob.glob(os.path.join(screens_dir, f"*{ext}")):
                file_name = os.path.basename(file_path)
                file_name_no_ext = os.path.splitext(file_name)[0]
                examples["screens"].append(file_name_no_ext)
    
    # Themes
    themes_dir = os.path.join(CODE_EXAMPLES_DIR, "react-native", "theme")
    if os.path.exists(themes_dir):
        for ext in [".js", ".jsx", ".ts", ".tsx"]:
            for file_path in glob.glob(os.path.join(themes_dir, f"*{ext}")):
                file_name = os.path.basename(file_path)
                file_name_no_ext = os.path.splitext(file_name)[0]
                examples["themes"].append(file_name_no_ext)
    
    return examples

def handle_tools_list():
    """Handle tools/list method"""
    return {
        "tools": [
            {
                "name": name,  # Use the original tool name without prefix
                "description": info["description"],
                "parameters": {
                    "type": "object",
                    "properties": info.get("parameters", {})
                }
            }
            for name, info in TOOLS.items()
        ]
    }

def handle_tools_call(params: Dict[str, Any]):
    """Handle tools/call method"""
    tool_name = params.get("name", "")
    tool_params = params.get("arguments", {})
    
    if not tool_name:
        return {"error": "Tool name not specified"}
    
    # Strip mcp0_ prefix if present
    if tool_name.startswith("mcp0_"):
        tool_name = tool_name[5:]  # Remove 'mcp0_' prefix
    
    if tool_name not in TOOLS:
        return {"error": f"Tool {tool_name} not found"}
    
    # Dispatch to the appropriate handler function
    handler_function = globals().get(tool_name)
    if not handler_function or not callable(handler_function):
        return {"error": f"Handler for tool {tool_name} not implemented"}
    
    # Call the handler with the tool parameters
    try:
        result = handler_function(**tool_params)
        return result
    except Exception as e:
        logging.error(f"Error calling {tool_name}: {e}")
        return {"error": f"Error calling {tool_name}: {str(e)}"}

def process_jsonrpc_request(request_data: Dict[str, Any]) -> Dict[str, Any]:
    """Process a JSON-RPC request and return a response"""
    try:
        # Validate JSON-RPC request
        if not isinstance(request_data, dict):
            return {"jsonrpc": "2.0", "error": {"code": -32600, "message": "Invalid Request"}, "id": None}
        
        jsonrpc = request_data.get("jsonrpc")
        if jsonrpc != "2.0":
            return {"jsonrpc": "2.0", "error": {"code": -32600, "message": "Invalid JSON-RPC version"}, "id": request_data.get("id")}
        
        method = request_data.get("method")
        if not method:
            return {"jsonrpc": "2.0", "error": {"code": -32600, "message": "Method not specified"}, "id": request_data.get("id")}
        
        params = request_data.get("params", {})
        request_id = request_data.get("id")
        
        # Handle different methods
        if method == "tools/list":
            result = handle_tools_list()
        elif method == "tools/call":
            result = handle_tools_call(params)
        else:
            return {
                "jsonrpc": "2.0",
                "id": request_id,
                "error": {
                    "code": -32601,
                    "message": f"Method {method} not found"
                }
            }
        
        return {
            "jsonrpc": "2.0",
            "id": request_id,
            "result": result
        }
    except Exception as e:
        logging.error(f"Error processing JSON-RPC request: {e}")
        return {
            "jsonrpc": "2.0",
            "id": request_data.get("id"),
            "error": {
                "code": -32603,
                "message": f"Internal error: {str(e)}"
            }
        }

def main():
    """Main function to process JSON-RPC requests from stdin and write responses to stdout"""
    logging.info("Starting BluestoneApps MCP Server (stdio transport)")
    
    # Initialize the event loop
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    try:
        # Read input line by line
        for line in sys.stdin:
            try:
                # Parse JSON input
                request = json.loads(line)
                # Log detailed request info
                with open('/tmp/mcp_requests.log', 'a') as f:
                    f.write(f"\n=== New Request ===\n")
                    f.write(f"Raw input: {line}\n")
                    f.write(f"Parsed request: {json.dumps(request, indent=2)}\n")
                logging.info(f"Received request: {request}")
                
                # Process the request
                response = process_jsonrpc_request(request)
                logging.info(f"Sending response: {response}")
                
                # Write the response to stdout
                sys.stdout.write(json.dumps(response) + "\n")
                sys.stdout.flush()
            except json.JSONDecodeError as e:
                logging.error(f"Failed to parse JSON: {e}")
                error_response = {
                    "jsonrpc": "2.0",
                    "id": None,
                    "error": {
                        "code": -32700,
                        "message": "Parse error"
                    }
                }
                sys.stdout.write(json.dumps(error_response) + "\n")
                sys.stdout.flush()
    except KeyboardInterrupt:
        logging.info("Server interrupted, shutting down")
    except Exception as e:
        logging.error(f"Unhandled exception: {e}")
    finally:
        loop.close()
        logging.info("Server shutdown complete")

if __name__ == "__main__":
    main()
