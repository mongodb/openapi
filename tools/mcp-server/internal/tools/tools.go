package tools

import (
	"context"

	"github.com/modelcontextprotocol/go-sdk/mcp"
	"github.com/mongodb/openapi/tools/mcp-server/internal/registry"
)

// Register registers all tool handlers with the server using the official SDK.
func Register(server *mcp.Server, reg *registry.Registry) {
	// Register load tool
	loadTool := &mcp.Tool{
		Name:        "load",
		Description: "Load an OpenAPI specification from a file into memory",
	}
	mcp.AddTool(server, loadTool, makeLoadHandler(reg))

	// Register unload tool
	unloadTool := &mcp.Tool{
		Name:        "unload",
		Description: "Remove a loaded OpenAPI specification from memory",
	}
	mcp.AddTool(server, unloadTool, makeUnloadHandler(reg))

	// Register export tool
	exportTool := &mcp.Tool{
		Name:        "export",
		Description: "Export a loaded OpenAPI specification to a file",
	}
	mcp.AddTool(server, exportTool, makeExportHandler(reg))
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
