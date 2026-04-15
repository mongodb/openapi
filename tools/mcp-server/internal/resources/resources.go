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
		Name:        "spec-tag-operations",
		Description: "Lists all operations for a specific tag in the spec identified by {alias}. " +
			"{tagName} is case-sensitive and must match a tag name exactly as defined in the spec. " +
			"Use the tag name as it appears in the spec — URI encoding is handled automatically. " +
			"Each operation includes operationId, HTTP method, path, summary, and tags. " +
			"Results are sorted by path then method. " +
			"Returns an error if the alias or tag does not exist.",
		MIMEType: mimeTypeJSON,
	}, makeTagsHandler(reg))
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
