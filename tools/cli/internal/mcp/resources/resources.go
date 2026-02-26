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

// Package resources provides MCP resource implementations for OpenAPI specs.
package resources

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/modelcontextprotocol/go-sdk/mcp"
	"github.com/mongodb/openapi/tools/cli/internal/mcp/registry"
	"github.com/mongodb/openapi/tools/cli/internal/mcp/tools"
)

// OperationSummary represents a summary of an operation.
type OperationSummary struct {
	ID      string   `json:"id"`
	Method  string   `json:"method"`
	Path    string   `json:"path"`
	Summary string   `json:"summary,omitempty"`
	Tags    []string `json:"tags,omitempty"`
}

// TagSummary represents a tag with its description.
type TagSummary struct {
	Name        string `json:"name"`
	Description string `json:"description,omitempty"`
}

// PathSummary represents a path with its available methods.
type PathSummary struct {
	Path    string   `json:"path"`
	Methods []string `json:"methods"`
}

// SchemaSummary represents a schema name.
type SchemaSummary struct {
	Name string `json:"name"`
	Type string `json:"type,omitempty"`
}

// RegisterResources registers resource templates with the MCP server.
func RegisterResources(server *mcp.Server, reg *registry.Registry) {
	// List resources
	server.AddResourceTemplate(&mcp.ResourceTemplate{
		URITemplate: "openapi://{alias}/operations",
		Name:        "List Operations",
		Description: "List all operations in the spec with their IDs, methods, paths, and summaries.",
		MIMEType:    "application/json",
	}, OperationsListHandler(reg))

	server.AddResourceTemplate(&mcp.ResourceTemplate{
		URITemplate: "openapi://{alias}/tags",
		Name:        "List Tags",
		Description: "List all tags defined in the spec.",
		MIMEType:    "application/json",
	}, TagsListHandler(reg))

	server.AddResourceTemplate(&mcp.ResourceTemplate{
		URITemplate: "openapi://{alias}/paths",
		Name:        "List Paths",
		Description: "List all paths in the spec with their available methods.",
		MIMEType:    "application/json",
	}, PathsListHandler(reg))

	server.AddResourceTemplate(&mcp.ResourceTemplate{
		URITemplate: "openapi://{alias}/schemas",
		Name:        "List Schemas",
		Description: "List all component schemas defined in the spec.",
		MIMEType:    "application/json",
	}, SchemasListHandler(reg))

	// Detail resources
	server.AddResourceTemplate(&mcp.ResourceTemplate{
		URITemplate: "openapi://{alias}/operations/{operationId}",
		Name:        "Get Operation",
		Description: "Get the full details for a specific operation by ID.",
		MIMEType:    "application/json",
	}, OperationDetailHandler(reg))

	server.AddResourceTemplate(&mcp.ResourceTemplate{
		URITemplate: "openapi://{alias}/tags/{tagName}",
		Name:        "Get Tag Operations",
		Description: "Get all operations for a specific tag.",
		MIMEType:    "application/json",
	}, TagDetailHandler(reg))

	server.AddResourceTemplate(&mcp.ResourceTemplate{
		URITemplate: "openapi://{alias}/paths/{path}",
		Name:        "Get Path",
		Description: "Get all operations for a specific path.",
		MIMEType:    "application/json",
	}, PathDetailHandler(reg))

	server.AddResourceTemplate(&mcp.ResourceTemplate{
		URITemplate: "openapi://{alias}/schemas/{schemaName}",
		Name:        "Get Schema",
		Description: "Get the full JSON Schema for a specific component.",
		MIMEType:    "application/json",
	}, SchemaDetailHandler(reg))
}

// OperationsListHandler returns all operations in the spec.
func OperationsListHandler(reg *registry.Registry) mcp.ResourceHandler {
	return func(ctx context.Context, req *mcp.ReadResourceRequest) (*mcp.ReadResourceResult, error) {
		alias := extractParam(req.Params.URI, "openapi://", "/operations")
		entry, err := reg.Get(alias)
		if err != nil {
			return nil, fmt.Errorf("spec '%s' not found", alias)
		}

		operations := make([]OperationSummary, 0)
		if entry.Spec.Paths != nil {
			for path, pathItem := range entry.Spec.Paths.Map() {
				for method, op := range pathItem.Operations() {
					if op != nil {
						operations = append(operations, OperationSummary{
							ID:      op.OperationID,
							Method:  method,
							Path:    path,
							Summary: op.Summary,
							Tags:    op.Tags,
						})
					}
				}
			}
		}

		return jsonResponse(req.Params.URI, operations)
	}
}

// TagsListHandler returns all tags in the spec.
func TagsListHandler(reg *registry.Registry) mcp.ResourceHandler {
	return func(ctx context.Context, req *mcp.ReadResourceRequest) (*mcp.ReadResourceResult, error) {
		alias := extractParam(req.Params.URI, "openapi://", "/tags")
		entry, err := reg.Get(alias)
		if err != nil {
			return nil, fmt.Errorf("spec '%s' not found", alias)
		}

		tags := make([]TagSummary, 0)
		for _, tag := range entry.Spec.Tags {
			tags = append(tags, TagSummary{
				Name:        tag.Name,
				Description: tag.Description,
			})
		}

		return jsonResponse(req.Params.URI, tags)
	}
}

// PathsListHandler returns all paths in the spec.
func PathsListHandler(reg *registry.Registry) mcp.ResourceHandler {
	return func(ctx context.Context, req *mcp.ReadResourceRequest) (*mcp.ReadResourceResult, error) {
		alias := extractParam(req.Params.URI, "openapi://", "/paths")
		entry, err := reg.Get(alias)
		if err != nil {
			return nil, fmt.Errorf("spec '%s' not found", alias)
		}

		paths := make([]PathSummary, 0)
		if entry.Spec.Paths != nil {
			for path, pathItem := range entry.Spec.Paths.Map() {
				methods := make([]string, 0)
				for method := range pathItem.Operations() {
					methods = append(methods, method)
				}
				paths = append(paths, PathSummary{
					Path:    path,
					Methods: methods,
				})
			}
		}

		return jsonResponse(req.Params.URI, paths)
	}
}

// SchemasListHandler returns all schemas in the spec.
func SchemasListHandler(reg *registry.Registry) mcp.ResourceHandler {
	return func(ctx context.Context, req *mcp.ReadResourceRequest) (*mcp.ReadResourceResult, error) {
		alias := extractParam(req.Params.URI, "openapi://", "/schemas")
		entry, err := reg.Get(alias)
		if err != nil {
			return nil, fmt.Errorf("spec '%s' not found", alias)
		}

		schemas := make([]SchemaSummary, 0)
		if entry.Spec.Components != nil && entry.Spec.Components.Schemas != nil {
			for name, schemaRef := range entry.Spec.Components.Schemas {
				schemaType := ""
				if schemaRef.Value != nil && schemaRef.Value.Type != nil {
					schemaType = strings.Join(*schemaRef.Value.Type, ",")
				}
				schemas = append(schemas, SchemaSummary{
					Name: name,
					Type: schemaType,
				})
			}
		}

		return jsonResponse(req.Params.URI, schemas)
	}
}

// OperationDetailHandler returns details for a specific operation.
func OperationDetailHandler(reg *registry.Registry) mcp.ResourceHandler {
	return func(ctx context.Context, req *mcp.ReadResourceRequest) (*mcp.ReadResourceResult, error) {
		alias, operationID := extractTwoParams(req.Params.URI, "openapi://", "/operations/")
		entry, err := reg.Get(alias)
		if err != nil {
			return nil, fmt.Errorf("spec '%s' not found", alias)
		}

		path, method, op := tools.GetOperationByID(entry.Spec, operationID)
		if op == nil {
			return nil, fmt.Errorf("operation '%s' not found", operationID)
		}

		result := map[string]any{
			"operationId": operationID,
			"path":        path,
			"method":      method,
			"operation":   op,
		}

		return jsonResponse(req.Params.URI, result)
	}
}

// TagDetailHandler returns all operations for a specific tag.
func TagDetailHandler(reg *registry.Registry) mcp.ResourceHandler {
	return func(ctx context.Context, req *mcp.ReadResourceRequest) (*mcp.ReadResourceResult, error) {
		alias, tagName := extractTwoParams(req.Params.URI, "openapi://", "/tags/")
		entry, err := reg.Get(alias)
		if err != nil {
			return nil, fmt.Errorf("spec '%s' not found", alias)
		}

		operations := make([]OperationSummary, 0)
		if entry.Spec.Paths != nil {
			for path, pathItem := range entry.Spec.Paths.Map() {
				for method, op := range pathItem.Operations() {
					if op != nil && containsTag(op.Tags, tagName) {
						operations = append(operations, OperationSummary{
							ID:      op.OperationID,
							Method:  method,
							Path:    path,
							Summary: op.Summary,
							Tags:    op.Tags,
						})
					}
				}
			}
		}

		if len(operations) == 0 {
			return nil, fmt.Errorf("tag '%s' not found or has no operations", tagName)
		}

		return jsonResponse(req.Params.URI, operations)
	}
}

// PathDetailHandler returns all operations for a specific path.
func PathDetailHandler(reg *registry.Registry) mcp.ResourceHandler {
	return func(ctx context.Context, req *mcp.ReadResourceRequest) (*mcp.ReadResourceResult, error) {
		alias, pathParam := extractTwoParams(req.Params.URI, "openapi://", "/paths/")
		entry, err := reg.Get(alias)
		if err != nil {
			return nil, fmt.Errorf("spec '%s' not found", alias)
		}

		if entry.Spec.Paths == nil {
			return nil, fmt.Errorf("no paths found in spec '%s'", alias)
		}

		// URL decode the path (replace %2F with /)
		decodedPath := strings.ReplaceAll(pathParam, "%2F", "/")
		if !strings.HasPrefix(decodedPath, "/") {
			decodedPath = "/" + decodedPath
		}

		pathItem := entry.Spec.Paths.Find(decodedPath)
		if pathItem == nil {
			return nil, fmt.Errorf("path '%s' not found", decodedPath)
		}

		result := map[string]any{
			"path":       decodedPath,
			"operations": pathItem.Operations(),
		}

		return jsonResponse(req.Params.URI, result)
	}
}

// SchemaDetailHandler returns a specific schema.
func SchemaDetailHandler(reg *registry.Registry) mcp.ResourceHandler {
	return func(ctx context.Context, req *mcp.ReadResourceRequest) (*mcp.ReadResourceResult, error) {
		alias, schemaName := extractTwoParams(req.Params.URI, "openapi://", "/schemas/")
		entry, err := reg.Get(alias)
		if err != nil {
			return nil, fmt.Errorf("spec '%s' not found", alias)
		}

		if entry.Spec.Components == nil || entry.Spec.Components.Schemas == nil {
			return nil, fmt.Errorf("no schemas found in spec '%s'", alias)
		}

		schemaRef, exists := entry.Spec.Components.Schemas[schemaName]
		if !exists {
			return nil, fmt.Errorf("schema '%s' not found", schemaName)
		}

		return jsonResponse(req.Params.URI, schemaRef)
	}
}

// extractParam extracts a single parameter from a URI.
func extractParam(uri, prefix, suffix string) string {
	// Remove prefix and suffix to get the parameter
	s := uri[len(prefix):]
	if idx := len(s) - len(suffix); idx > 0 {
		return s[:idx]
	}
	return s
}

// extractTwoParams extracts alias and second param from URI like openapi://{alias}/operation/{id}.
func extractTwoParams(uri, prefix, middle string) (string, string) {
	s := uri[len(prefix):]
	// Find the middle separator
	for i := 0; i < len(s); i++ {
		if i+len(middle) <= len(s) && s[i:i+len(middle)] == middle {
			return s[:i], s[i+len(middle):]
		}
	}
	return s, ""
}

// jsonResponse creates a JSON response for a resource.
func jsonResponse(uri string, data any) (*mcp.ReadResourceResult, error) {
	jsonData, err := json.MarshalIndent(data, "", "  ")
	if err != nil {
		return nil, err
	}

	return &mcp.ReadResourceResult{
		Contents: []*mcp.ResourceContents{{
			URI:      uri,
			MIMEType: "application/json",
			Text:     string(jsonData),
		}},
	}, nil
}

// containsTag checks if a tag is in the list of tags.
func containsTag(tags []string, tag string) bool {
	for _, t := range tags {
		if strings.EqualFold(t, tag) {
			return true
		}
	}
	return false
}
