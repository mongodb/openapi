package tools

import (
	"context"

	"github.com/modelcontextprotocol/go-sdk/mcp"
	"github.com/mongodb/openapi/tools/mcp-server/internal/registry"
)

// Register registers all tool handlers with the server.
func Register(server *mcp.Server, reg *registry.Registry) {
	// Register load tool
	loadTool := &mcp.Tool{
		Name: "load",
		Description: "Load an OpenAPI specification file (JSON or YAML) into memory. " +
			"Assigns an alias for easy reference in other commands. " +
			"Validates the spec and makes it available for searching, exporting, and inspection. " +
			"Required before using search or export tools on a spec.",
	}
	mcp.AddTool(server, loadTool, makeLoadHandler(reg))

	// Register unload tool
	unloadTool := &mcp.Tool{
		Name: "unload",
		Description: "Remove a previously loaded OpenAPI specification from memory by its alias. " +
			"Frees up resources and removes the spec from the available list. " +
			"Use this to clean up specs you no longer need to search or reference.",
	}
	mcp.AddTool(server, unloadTool, makeUnloadHandler(reg))

	// Register export tool
	exportTool := &mcp.Tool{
		Name: "export",
		Description: "Export a loaded OpenAPI specification to a file in JSON or YAML format. " +
			"Useful for converting between formats, saving modified specs, or creating copies. " +
			"Specify the output path and desired format (json/yaml).",
	}
	mcp.AddTool(server, exportTool, makeExportHandler(reg))

	// Register search tool
	searchTool := &mcp.Tool{
		Name: "search",
		Description: "Search across OpenAPI specifications using regex patterns. " +
			"Searches operations, schemas, parameters, responses, tags, and paths. " +
			"Returns matches grouped by category with details on what matched (operationId, schema name, property names, etc.). " +
			"Supports case-sensitive/insensitive search, category filtering, and per-category result limits. " +
			"Use this to find specific endpoints, data structures, or API components by name or pattern.",
	}
	mcp.AddTool(server, searchTool, makeSearchHandler(reg))

	// Register slice tool
	sliceTool := &mcp.Tool{
		Name: "slice",
		Description: "Create a filtered subset of an OpenAPI specification by selecting specific operations. " +
			"Filter by tags, operation IDs, or path patterns. " +
			"Uses OR logic: operations matching ANY of the specified criteria are included. " +
			"Automatically includes all schemas, parameters, and components referenced by the selected operations. " +
			"Requires a 'saveAs' alias chosen by the agent to name the resulting virtual spec (e.g. 'atlas-api-users'). " +
			"The same source spec can be sliced multiple times with different aliases for different subsets. " +
			"Returns the alias and updated list of available specs. " +
			"Useful for creating API subsets, generating client SDKs for specific features, or analyzing specific API areas.",
	}
	mcp.AddTool(server, sliceTool, makeSliceHandler(reg))
}

// makeLoadHandler creates the handler for the load tool.
func makeLoadHandler(reg *registry.Registry) mcp.ToolHandlerFor[LoadParams, LoadResult] {
	return func(_ context.Context, _ *mcp.CallToolRequest, params LoadParams) (*mcp.CallToolResult, LoadResult, error) {
		result, err := handleLoad(reg, params)
		return nil, result, err
	}
}

// makeUnloadHandler creates the handler for the unload tool.
func makeUnloadHandler(reg *registry.Registry) mcp.ToolHandlerFor[UnloadParams, UnloadResult] {
	return func(_ context.Context, _ *mcp.CallToolRequest, params UnloadParams) (*mcp.CallToolResult, UnloadResult, error) {
		result, err := handleUnload(reg, params)
		return nil, result, err
	}
}

// makeExportHandler creates the handler for the export tool.
func makeExportHandler(reg *registry.Registry) mcp.ToolHandlerFor[ExportParams, ExportResult] {
	return func(_ context.Context, _ *mcp.CallToolRequest, params ExportParams) (*mcp.CallToolResult, ExportResult, error) {
		result, err := handleExport(reg, params)
		return nil, result, err
	}
}

// makeSearchHandler creates the handler for the search tool.
func makeSearchHandler(reg *registry.Registry) mcp.ToolHandlerFor[SearchParams, SearchResult] {
	return func(_ context.Context, _ *mcp.CallToolRequest, params SearchParams) (*mcp.CallToolResult, SearchResult, error) {
		result, err := handleSearch(reg, params)
		return nil, result, err
	}
}

// makeSliceHandler creates the handler for the slice tool.
func makeSliceHandler(reg *registry.Registry) mcp.ToolHandlerFor[SliceParams, SliceResult] {
	return func(_ context.Context, _ *mcp.CallToolRequest, params SliceParams) (*mcp.CallToolResult, SliceResult, error) {
		result, err := handleSlice(reg, &params)
		return nil, result, err
	}
}
