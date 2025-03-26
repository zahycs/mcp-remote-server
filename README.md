# BluestoneApps MCP STDIO Server

This server implements the Model Context Protocol (MCP) over STDIO, providing access to BluestoneApps coding standards and code examples directly within Windsurf IDE.

## Features

- Implements MCP protocol over STDIO
- Provides access to coding standards and code examples
- Seamless integration with Windsurf IDE
- No manual server management required

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Configure Windsurf by adding the following to your MCP configuration file (`~/.codeium/windsurf/mcp_config.json`):
```json
{
  "defaultMcpServer": "bluestoneapps-stdio",
  "mcpServers": {
    "bluestoneapps-stdio": {
      "command": "/path/to/venv/bin/python",
      "args": [
        "/path/to/simple_mcp_stdio.py"
      ],
      "description": "BluestoneApps Coding Standards and Examples (STDIO)",
      "displayName": "BluestoneApps Development Standards (STDIO)"
    }
  }
}
```

Make sure to replace `/path/to/venv` and `/path/to/simple_mcp_stdio.py` with your actual paths.

## Usage

Once configured, the MCP server will automatically start when needed by Windsurf IDE. No manual server management is required.

## Available Tools

- `get_project_structure`: Get project structure standards for React Native development
- `get_api_communication`: Get API communication standards for React Native development
- `get_component_design`: Get component design standards for React Native development
- `get_state_management`: Get state management standards for React Native development
- `get_component_example`: Get a React Native component example
- `get_hook_example`: Get a React Native hook example
- `get_service_example`: Get a React Native service example
- `get_screen_example`: Get a React Native screen example
- `get_theme_example`: Get a React Native theme example
- `list_available_examples`: List all available code examples by category

## Troubleshooting

If you need to restart the MCP server:
1. Close Windsurf IDE completely
2. Reopen Windsurf IDE

The server will automatically start when needed.
