package resources

import (
	"context"

	"github.com/modelcontextprotocol/go-sdk/mcp"
	"github.com/mongodb/openapi/tools/mcp-server/internal/registry"
)

const mimeTypeJSON = "application/json"

// Register registers all static resources and resource template handlers with the server.
func Register(server *mcp.Server, reg *registry.Registry) {
	server.AddResource(&mcp.Resource{
		URI:  "openapi://specs",
		Name: "specs",
		Description: "Start here. Lists all OpenAPI specifications currently loaded in the registry. " +
			"Each entry includes the alias (used to reference the spec in all other resources and tools), " +
			"sourceType ('file' for specs loaded from disk, 'virtual' for sliced subsets), " +
			"and filePath (empty for virtual specs). " +
			"Read this resource first to discover what aliases are available before using other resources or tools.",
		MIMEType: mimeTypeJSON,
	}, makeSpecsHandler(reg))

	server.AddResourceTemplate(&mcp.ResourceTemplate{
		URITemplate: "openapi://specs/{alias}",
		Name:        "spec-overview",
		Description: "Returns a structural overview of a single loaded spec identified by {alias}. " +
			"Includes title, description, and stats (path count, operation count, schema count, tag count). " +
			"For versioned APIs, also returns: " +
			"latestStableVersion (the most recent stable YYYY-MM-DD version), " +
			"availableVersions (all stable date-based versions in ascending order), " +
			"hasPreview (true if any preview operations exist), " +
			"hasUpcoming (true if any upcoming operations exist). " +
			"Use this to understand the scope of a spec before searching or slicing it.",
		MIMEType: mimeTypeJSON,
	}, makeAliasHandler(reg))

	server.AddResourceTemplate(&mcp.ResourceTemplate{
		URITemplate: "openapi://specs/{alias}/tags/{tagName}",
		Name:        "spec-tag",
		Description: "Lists all operations belonging to a tag in the spec identified by {alias}. " +
			"{tagName} must match the tag name exactly as it appears in the spec (case-sensitive). " +
			"Tag names containing spaces must be percent-encoded (e.g. 'Flex Clusters' → 'Flex%20Clusters'). " +
			"Returns operationId, method, path, and summary for each operation, sorted by path then method.",
		MIMEType: mimeTypeJSON,
	}, makeTagsHandler(reg))

	server.AddResourceTemplate(&mcp.ResourceTemplate{
		URITemplate: "openapi://specs/{alias}/operations/{operationId}",
		Name:        "spec-operation",
		Description: "Returns full detail for a single operation identified by {operationId} in the spec {alias}. " +
			"Includes method, path, summary, description, parameters, request body, and responses. " +
			"Version filtering applies to the 200 response and request body (the only places that carry versioned content types). " +
			"Non-200 responses (e.g. 202, 4xx, 5xx) are always included as-is with their raw content. " +
			"Use the optional ?version query parameter to control which versioned content is returned: " +
			"?version=latest (default) shows only the latest stable version's content types, " +
			"?version=all shows all available content types, " +
			"?version=preview shows only preview content types, " +
			"?version=upcoming shows only upcoming content types, " +
			"?version=YYYY-MM-DD shows only that specific date version's content types. " +
			"Also returns availableVersions, latestStableVersion, hasPreview, and hasUpcoming for the operation.",
		MIMEType: mimeTypeJSON,
	}, makeOperationHandler(reg))
}

// makeSpecsHandler creates the handler for the openapi://specs resource.
func makeSpecsHandler(reg *registry.Registry) mcp.ResourceHandler {
	return func(_ context.Context, req *mcp.ReadResourceRequest) (*mcp.ReadResourceResult, error) {
		return handleSpecs(reg, req)
	}
}

// makeAliasHandler creates the handler for the openapi://specs/{alias} resource template.
func makeAliasHandler(reg *registry.Registry) mcp.ResourceHandler {
	return func(_ context.Context, req *mcp.ReadResourceRequest) (*mcp.ReadResourceResult, error) {
		return handleAlias(reg, req)
	}
}

// makeTagsHandler creates the handler for the openapi://specs/{alias}/tags/{tagName} resource template.
func makeTagsHandler(reg *registry.Registry) mcp.ResourceHandler {
	return func(_ context.Context, req *mcp.ReadResourceRequest) (*mcp.ReadResourceResult, error) {
		return handleTags(reg, req)
	}
}

// makeOperationHandler creates the handler for the openapi://specs/{alias}/operations/{operationId} template.
func makeOperationHandler(reg *registry.Registry) mcp.ResourceHandler {
	return func(_ context.Context, req *mcp.ReadResourceRequest) (*mcp.ReadResourceResult, error) {
		return handleOperation(reg, req)
	}
}
