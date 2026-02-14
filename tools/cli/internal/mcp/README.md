# OpenAPI MCP Server

The OpenAPI MCP (Model Context Protocol) server enables AI agents to load, filter, and explore OpenAPI specifications. It provides tools and resources that allow agents to work with API definitions programmatically.

## Overview

This MCP server exposes:
- **Tools**: Actions the agent can perform (load specs, filter, export)
- **Resources**: Read-only data the agent can access (manifests, operations, schemas)

## Building

```bash
cd tools/cli
make build-mcp
```

The binary will be created at `./bin/openapi-mcp`.

## Configuration

### Claude Desktop

Add to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "openapi": {
      "command": "/absolute/path/to/openapi-mcp"
    }
  }
}
```

### Cursor

Add to your Cursor MCP settings (`.cursor/mcp.json` in your project or global settings):

```json
{
  "mcpServers": {
    "openapi": {
      "command": "/absolute/path/to/openapi-mcp"
    }
  }
}
```

### VS Code with Continue

Add to your Continue configuration (`~/.continue/config.json`):

```json
{
  "experimental": {
    "modelContextProtocolServers": [
      {
        "name": "openapi",
        "command": "/absolute/path/to/openapi-mcp"
      }
    ]
  }
}
```

### Generic MCP Client

The server communicates over stdio using JSON-RPC 2.0. Start it directly:

```bash
./bin/openapi-mcp
```

## Available Tools

### `load_spec`
Load an OpenAPI specification from disk.

**Input:**
- `file_path` (required): Absolute path to the OpenAPI/Swagger file
- `alias` (required): Short name to refer to this spec

**Example prompt:** "Load the API spec from /path/to/openapi.yaml as 'myapi'"

### `filter_spec`
Filter a loaded spec by tags, operation IDs, or paths.

**Input:**
- `source_alias` (required): The alias of the loaded spec to filter
- `save_as` (optional): Name to save the filtered view as
- `tags` (optional): List of tags to keep
- `operation_ids` (optional): List of operation IDs to keep
- `paths` (optional): List of path patterns to keep

**Example prompt:** "Filter 'myapi' to only include operations tagged with 'users'"

### `export_spec`
Export a spec to a file.

**Input:**
- `alias` (required): The alias of the spec to export
- `file_path` (required): Path to save the spec to
- `format` (optional): Output format - `json` or `yaml` (default: json)

**Example prompt:** "Export the filtered spec to /tmp/users-api.yaml"

### `unload_spec`
Remove a spec from memory.

**Input:**
- `alias` (required): The alias of the spec to unload

### `list_specs`
List all currently loaded specs.

## Available Resources

Resources are accessed via URI patterns:

### List Resources

| Resource | URI Pattern | Description |
|----------|-------------|-------------|
| Operations | `openapi://{alias}/operations` | List all operations with IDs, methods, paths, summaries |
| Tags | `openapi://{alias}/tags` | List all tags with descriptions |
| Paths | `openapi://{alias}/paths` | List all paths with available methods |
| Schemas | `openapi://{alias}/schemas` | List all component schema names |

### Detail Resources

| Resource | URI Pattern | Description |
|----------|-------------|-------------|
| Operation | `openapi://{alias}/operations/{operationId}` | Full details for a specific operation |
| Tag | `openapi://{alias}/tags/{tagName}` | All operations for a specific tag |
| Path | `openapi://{alias}/paths/{path}` | All operations for a specific path |
| Schema | `openapi://{alias}/schemas/{schemaName}` | Full JSON Schema for a component |

## Example Workflow

1. **Load a spec:**
   > "Load the OpenAPI spec from ./openapi/v2.yaml as 'atlas'"

2. **Explore the manifest:**
   > "Show me the manifest for 'atlas'"

3. **Filter to specific operations:**
   > "Filter 'atlas' to only include operations with tag 'Clusters' and save as 'clusters'"

4. **Get operation details:**
   > "Show me the details for operation 'createCluster' in 'clusters'"

5. **Export the filtered spec:**
   > "Export 'clusters' to ./clusters-api.json"

## Architecture

```
cmd/mcp/
└── main.go              # Entry point, server setup

internal/mcp/
├── registry/
│   └── registry.go      # In-memory spec storage
├── tools/
│   └── tools.go         # MCP tool implementations
└── resources/
    └── resources.go     # MCP resource implementations
```

## Development

Run tests:
```bash
cd tools/cli
go test ./internal/mcp/... -v
```

## Limitations

- Maximum 50 specs can be loaded simultaneously
- Specs are stored in memory (not persisted across restarts)
- File paths must be absolute or relative to the server's working directory

