# BluestoneApps MCP Server for VSCode GitHub Copilot

A Model Context Protocol (MCP) server specifically designed for VSCode GitHub Copilot integration, providing React Native coding standards, examples, and best practices.

## Features

### 🏗️ **Standards & Best Practices**
- **Project Structure**: Complete React Native project organization guidelines
- **API Communication**: HTTP request patterns, error handling, and data management
- **Component Design**: Styling, props, and composition patterns
- **State Management**: Redux, Context API, and local state management patterns

### 📚 **Code Examples**
- **Components**: Reusable UI components with TypeScript types
- **Hooks**: Custom React hooks for common functionality
- **Services**: API services, authentication, and data processing
- **Screens**: Complete screen implementations with navigation
- **Themes**: Styling systems, colors, and typography

### 🔧 **Enhanced Features**
- **Fuzzy Matching**: Find examples even with partial names
- **Enhanced Logging**: Detailed debug information for development
- **Error Handling**: Comprehensive error management and reporting
- **Resource Discovery**: VSCode-compatible resource endpoints
- **Health Checks**: Server validation and diagnostics

## Installation

1. **Build the server**:
   ```bash
   npm run build
   ```

2. **Start the server**:
   ```bash
   npm start
   ```

3. **Development mode** (with debug logging):
   ```bash
   DEBUG=true npm run dev
   ```

## Available Tools

### Standards Tools
- `get_project_structure` - React Native project structure standards
- `get_api_communication` - API communication patterns and best practices
- `get_component_design` - Component design standards and patterns
- `get_state_management` - State management patterns and practices

### Example Tools
- `get_component_example` - Get specific component implementations
- `get_hook_example` - Get custom hook examples
- `get_service_example` - Get service layer implementations
- `get_screen_example` - Get complete screen examples
- `get_theme_example` - Get theme and styling examples

### Discovery Tools
- `list_available_examples` - List all available code examples by category

## Tool Parameters

All example tools support enhanced parameters:

```typescript
{
  // Required
  component_name: string    // Name of the component/hook/service/screen/theme
  
  // Optional
  include_usage?: boolean   // Include usage examples (default: true)
  include_types?: boolean   // Include TypeScript types (default: true)
  format?: "markdown" | "json"  // Output format (default: depends on tool)
}
```

## Usage Examples

### Get a Component Example
```typescript
// Get Button component
await server.request("get_component_example", {
  component_name: "Button",
  include_usage: true,
  include_types: true
});
```

### List Available Examples
```typescript
// Get all examples
await server.request("list_available_examples", {
  category: "all",
  format: "json"
});

// Get only components
await server.request("list_available_examples", {
  category: "components",
  format: "markdown"
});
```

### Get Standards
```typescript
// Get project structure standards
await server.request("get_project_structure", {
  format: "markdown"
});
```

## File Structure

```
mcp-remote-server/
├── src/
│   └── index.ts                 # Main server implementation
├── resources/
│   ├── standards/              # Development standards
│   │   ├── project_structure.md
│   │   ├── api_communication.md
│   │   ├── component_design.md
│   │   └── state_management.md
│   └── code-examples/
│       └── react-native/       # React Native examples
│           ├── components/     # UI components
│           ├── hooks/         # Custom hooks
│           ├── services/      # API services
│           ├── screens/       # Screen implementations
│           └── theme/         # Styling and themes
├── build/                     # Compiled output
├── .vscode/                   # VSCode configuration
├── package.json
├── tsconfig.json
└── README.md
```

## VSCode Integration

The server is optimized for VSCode GitHub Copilot with:

- **Enhanced Error Reporting**: Detailed error messages with context
- **Resource Endpoints**: VSCode-compatible resource discovery
- **Logging Integration**: Proper logging for development and debugging
- **Health Checks**: Server validation and diagnostics
- **Fuzzy Matching**: Intelligent example discovery

## Development

### Prerequisites
- Node.js 18+
- TypeScript 5.7+
- VSCode with GitHub Copilot extension

### Scripts
- `npm run build` - Compile TypeScript
- `npm run start` - Start the server
- `npm run dev` - Development mode with debug logging
- `npm run clean` - Clean build directory
- `npm run rebuild` - Clean and rebuild

### Debugging
1. Set `DEBUG=true` environment variable
2. Use VSCode debugger with provided launch configuration
3. Monitor logs for detailed information

## Server Configuration

The server runs with the following capabilities:
- **Name**: `bluestoneapps-copilot`
- **Version**: `1.0.0`
- **Capabilities**: `tools`, `resources`, `logging`
- **Transport**: `stdio` (for VSCode integration)

## Error Handling

The server provides comprehensive error handling:
- **Validation Errors**: Invalid parameters and missing data
- **File System Errors**: Missing files or directories
- **Runtime Errors**: Unexpected exceptions with full stack traces
- **Graceful Shutdown**: Clean process termination

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all builds pass
5. Submit a pull request

## License

ISC License - see LICENSE file for details.

## Support

For issues and questions:
- Check the debug logs with `DEBUG=true`
- Use the health check validation
- Review the available examples with `list_available_examples`
- Check VSCode GitHub Copilot integration logs
