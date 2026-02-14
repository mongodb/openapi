// Copyright 2025 MongoDB Inc
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//	http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Package tools provides MCP tool implementations for OpenAPI operations.
package tools

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"os"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/modelcontextprotocol/go-sdk/mcp"
	"github.com/mongodb/openapi/tools/cli/internal/mcp/registry"
	"github.com/mongodb/openapi/tools/cli/internal/openapi"
	"github.com/mongodb/openapi/tools/cli/internal/openapi/slice"
	"github.com/spf13/afero"
)

// LoadSpecInput is the input for the load_spec tool.
type LoadSpecInput struct {
	FilePath string `json:"file_path" jsonschema:"Absolute path to the OpenAPI/Swagger file on disk"`
	Alias    string `json:"alias" jsonschema:"Short name to refer to this spec (e.g. 'users' or 'main')"`
}

// textResult creates a CallToolResult with text content.
func textResult(text string) *mcp.CallToolResult {
	return &mcp.CallToolResult{
		Content: []mcp.Content{&mcp.TextContent{Text: text}},
	}
}

// errorResult creates a CallToolResult with an error.
func errorResult(text string) *mcp.CallToolResult {
	return &mcp.CallToolResult{
		Content: []mcp.Content{&mcp.TextContent{Text: text}},
		IsError: true,
	}
}

// LoadSpecHandler creates a handler for the load_spec tool.
func LoadSpecHandler(reg *registry.Registry) func(ctx context.Context, req *mcp.CallToolRequest, input LoadSpecInput) (*mcp.CallToolResult, any, error) {
	return func(ctx context.Context, req *mcp.CallToolRequest, input LoadSpecInput) (*mcp.CallToolResult, any, error) {
		// Check if file exists
		if _, err := os.Stat(input.FilePath); os.IsNotExist(err) {
			return errorResult(fmt.Sprintf("File at path %s does not exist", input.FilePath)), nil, nil
		}

		// Load and parse the spec
		loader := openapi.NewOpenAPI3()
		specInfo, err := loader.CreateOpenAPISpecFromPath(input.FilePath)
		if err != nil {
			return errorResult(fmt.Sprintf("Failed to parse spec: %v", err)), nil, nil
		}

		// Add to registry
		if err := reg.Load(input.Alias, specInfo.Spec, input.FilePath); err != nil {
			if errors.Is(err, registry.ErrRegistryFull) {
				return errorResult("Registry full. Please unload specs before adding new ones."), nil, nil
			}
			if errors.Is(err, registry.ErrAliasExists) {
				return errorResult(fmt.Sprintf("Alias '%s' already exists", input.Alias)), nil, nil
			}
			return errorResult(fmt.Sprintf("Failed to load spec: %v", err)), nil, nil
		}

		// Build response with available resources
		response := fmt.Sprintf("✅ Loaded '%s'.\n\nAvailable Resources:\n"+
			"- Manifest: openapi://%s/manifest\n"+
			"- Root Index: openapi://%s/root\n"+
			"- Info: openapi://%s/info",
			input.Alias, input.Alias, input.Alias, input.Alias)

		return textResult(response), nil, nil
	}
}

// FilterSpecInput is the input for the filter_spec tool.
type FilterSpecInput struct {
	SourceAlias  string   `json:"source_alias" jsonschema:"The alias of the loaded spec to filter"`
	SaveAs       string   `json:"save_as,omitempty" jsonschema:"Optional name to save this filtered view as"`
	Tags         []string `json:"tags,omitempty" jsonschema:"List of tags to keep"`
	OperationIDs []string `json:"operation_ids,omitempty" jsonschema:"List of operation IDs to keep"`
	Paths        []string `json:"paths,omitempty" jsonschema:"List of path patterns to keep"`
}

// FilterSpecHandler creates a handler for the filter_spec tool.
func FilterSpecHandler(reg *registry.Registry) func(ctx context.Context, req *mcp.CallToolRequest, input FilterSpecInput) (*mcp.CallToolResult, any, error) {
	return func(ctx context.Context, req *mcp.CallToolRequest, input FilterSpecInput) (*mcp.CallToolResult, any, error) {
		// Get the source spec
		entry, err := reg.Get(input.SourceAlias)
		if err != nil {
			return errorResult(fmt.Sprintf("Spec '%s' not found", input.SourceAlias)), nil, nil
		}

		// Duplicate the spec to avoid modifying the original
		specCopy, err := registry.Duplicate(entry.Spec)
		if err != nil {
			return errorResult(fmt.Sprintf("Failed to copy spec: %v", err)), nil, nil
		}

		// Apply slice criteria
		criteria := &slice.Criteria{
			Tags:         input.Tags,
			OperationIDs: input.OperationIDs,
			Paths:        input.Paths,
		}

		if err := slice.Slice(specCopy, criteria); err != nil {
			return errorResult(fmt.Sprintf("Failed to filter spec: %v", err)), nil, nil
		}

		// If save_as is provided, save to registry
		if input.SaveAs != "" {
			if err := reg.LoadVirtual(input.SaveAs, specCopy); err != nil {
				return errorResult(fmt.Sprintf("Failed to save filtered spec: %v", err)), nil, nil
			}
		}

		// Serialize the filtered spec
		data, err := json.MarshalIndent(specCopy, "", "  ")
		if err != nil {
			return errorResult(fmt.Sprintf("Failed to serialize spec: %v", err)), nil, nil
		}

		return textResult(string(data)), nil, nil
	}
}

// ExportSpecInput is the input for the export_spec tool.
type ExportSpecInput struct {
	Alias    string `json:"alias" jsonschema:"The alias of the spec to export"`
	FilePath string `json:"file_path" jsonschema:"Path to save the spec to"`
	Format   string `json:"format,omitempty" jsonschema:"Output format: json or yaml (default: json)"`
}

// ExportSpecHandler creates a handler for the export_spec tool.
func ExportSpecHandler(reg *registry.Registry) func(ctx context.Context, req *mcp.CallToolRequest, input ExportSpecInput) (*mcp.CallToolResult, any, error) {
	return func(ctx context.Context, req *mcp.CallToolRequest, input ExportSpecInput) (*mcp.CallToolResult, any, error) {
		entry, err := reg.Get(input.Alias)
		if err != nil {
			return errorResult(fmt.Sprintf("Spec '%s' not found", input.Alias)), nil, nil
		}

		format := input.Format
		if format == "" {
			format = openapi.JSON
		}

		if err := openapi.Save(input.FilePath, entry.Spec, format, afero.NewOsFs()); err != nil {
			return errorResult(fmt.Sprintf("Failed to save spec: %v", err)), nil, nil
		}

		return textResult(fmt.Sprintf("✅ Exported '%s' to %s", input.Alias, input.FilePath)), nil, nil
	}
}

// UnloadSpecInput is the input for the unload_spec tool.
type UnloadSpecInput struct {
	Alias string `json:"alias" jsonschema:"The alias of the spec to unload"`
}

// UnloadSpecHandler creates a handler for the unload_spec tool.
func UnloadSpecHandler(reg *registry.Registry) func(ctx context.Context, req *mcp.CallToolRequest, input UnloadSpecInput) (*mcp.CallToolResult, any, error) {
	return func(ctx context.Context, req *mcp.CallToolRequest, input UnloadSpecInput) (*mcp.CallToolResult, any, error) {
		if err := reg.Unload(input.Alias); err != nil {
			return errorResult(fmt.Sprintf("Spec '%s' not found", input.Alias)), nil, nil
		}
		return textResult(fmt.Sprintf("✅ Unloaded '%s'", input.Alias)), nil, nil
	}
}

// ListSpecsHandler creates a handler for the list_specs tool.
func ListSpecsHandler(reg *registry.Registry) func(ctx context.Context, req *mcp.CallToolRequest, input struct{}) (*mcp.CallToolResult, any, error) {
	return func(ctx context.Context, req *mcp.CallToolRequest, input struct{}) (*mcp.CallToolResult, any, error) {
		aliases := reg.List()
		if len(aliases) == 0 {
			return textResult("No specs loaded."), nil, nil
		}

		result := fmt.Sprintf("Loaded specs (%d):\n", len(aliases))
		for _, alias := range aliases {
			entry, _ := reg.Get(alias)
			specType := "file"
			if entry.IsVirtual {
				specType = "virtual"
			}
			result += fmt.Sprintf("- %s (%s)\n", alias, specType)
		}
		return textResult(result), nil, nil
	}
}

// RegisterTools registers all MCP tools with the server.
func RegisterTools(server *mcp.Server, reg *registry.Registry) {
	mcp.AddTool(server, &mcp.Tool{
		Name:        "load_spec",
		Description: "Load an OpenAPI spec from disk into memory. Assign it an alias for future use.",
	}, LoadSpecHandler(reg))

	mcp.AddTool(server, &mcp.Tool{
		Name:        "filter_spec",
		Description: "Filter a loaded spec to keep only specific operations by tags, operation IDs, or paths. Can optionally save the result as a new 'virtual' spec for reuse.",
	}, FilterSpecHandler(reg))

	mcp.AddTool(server, &mcp.Tool{
		Name:        "export_spec",
		Description: "Save a loaded or filtered spec to a physical file. Use for external tools (e.g. code generation).",
	}, ExportSpecHandler(reg))

	mcp.AddTool(server, &mcp.Tool{
		Name:        "unload_spec",
		Description: "Remove a spec from memory to free up space.",
	}, UnloadSpecHandler(reg))

	mcp.AddTool(server, &mcp.Tool{
		Name:        "list_specs",
		Description: "List all currently loaded specs.",
	}, ListSpecsHandler(reg))
}

// GetOperationByID finds an operation by its ID in a spec.
func GetOperationByID(spec *openapi3.T, operationID string) (path, method string, op *openapi3.Operation) {
	if spec.Paths == nil {
		return "", "", nil
	}
	for p, pathItem := range spec.Paths.Map() {
		for m, operation := range pathItem.Operations() {
			if operation != nil && operation.OperationID == operationID {
				return p, m, operation
			}
		}
	}
	return "", "", nil
}
