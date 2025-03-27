# BluestoneApps React Native MCP Server

This is a Node.js implementation of the BluestoneApps React Native coding standards and examples MCP server. It provides standardized access to React Native best practices, code examples, and development patterns through the Model Context Protocol (MCP).

## Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)
- TypeScript (installed globally)

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/lallen30/mcp-remote-server.git
   cd mcp-remote-server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Install TypeScript globally (if not already installed):
   ```bash
   npm install -g typescript
   ```

4. Build the project:
   ```bash
   tsc
   ```

## Usage

Start the server:

```bash
node build/index.js
```

## Available Tools

The server provides the following tools:

- `get_project_structure`: Get React Native project structure standards
- `get_api_communication`: Get API communication best practices
- `get_component_design`: Get component design patterns and standards
- `get_state_management`: Get state management guidelines
- `get_component_example`: Get example React Native components
- `get_hook_example`: Get example custom React hooks
- `get_service_example`: Get example service implementations
- `get_screen_example`: Get example screen implementations
- `get_theme_example`: Get example theme configurations
- `list_available_examples`: List all available code examples by category

## Configuring with Windsurf IDE

1. Locate your Windsurf IDE configuration file:
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`

2. Add the server configuration:

```json
{
  "mcpServers": {
    "bluestoneapps-react-native": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-remote-server/build/index.js"],
      "description": "BluestoneApps React Native Development Standards and Examples",
      "displayName": "BluestoneApps React Native MCP Server",
      "timeout": 30000
    }
  }
}
```

Make sure to replace `/absolute/path/to` with the actual path to your cloned repository.

## Development

To modify or extend the server:

1. Make changes in the `src` directory
2. Rebuild the project:
   ```bash
   tsc
   ```
3. Restart the server

## Project Structure

```
├── src/                 # Source code
├── build/               # Compiled JavaScript
├── resources/           # Code examples and standards
│   ├── code-examples/   # React Native code examples
│   └── standards/       # Development standards
└── package.json         # Project configuration
```

## Contributing

Feel free to submit issues and pull requests to improve the server or add more examples and standards.

## License

MIT
