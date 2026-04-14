package resources

import (
	"testing"

	"github.com/modelcontextprotocol/go-sdk/mcp"
	"github.com/mongodb/openapi/tools/mcp-server/internal/registry"
	"github.com/oasdiff/kin-openapi/openapi3"
)

// makeRequest builds a ReadResourceRequest for the given URI.
func makeRequest(uri string) *mcp.ReadResourceRequest {
	return &mcp.ReadResourceRequest{Params: &mcp.ReadResourceParams{URI: uri}}
}

// newTestRegistry returns a registry pre-loaded with the shared test spec under alias "test-api".
func newTestRegistry(t *testing.T) *registry.Registry {
	t.Helper()
	reg := registry.New()
	if err := reg.Add("test-api", "/test/api.yaml", newTestSpec(), nil); err != nil {
		t.Fatalf("newTestRegistry: failed to add spec: %v", err)
	}
	return reg
}

// newTestSpec creates a comprehensive OpenAPI spec shared across all resource tests.
// It includes multiple paths, tags, schemas, and versioned media types.
func newTestSpec() *openapi3.T {
	spec := &openapi3.T{
		Info: &openapi3.Info{
			Title:       "Test API",
			Version:     "2.0",
			Description: "A test API",
		},
		Paths: &openapi3.Paths{},
		Tags: openapi3.Tags{
			{Name: "Users", Description: "User operations"},
			{Name: "Clusters", Description: "Cluster operations"},
		},
		Components: &openapi3.Components{
			Schemas: map[string]*openapi3.SchemaRef{
				"User":    {Value: &openapi3.Schema{Type: &openapi3.Types{"object"}}},
				"Cluster": {Value: &openapi3.Schema{Type: &openapi3.Types{"object"}}},
			},
		},
	}

	newStableResp := func() *openapi3.Responses {
		return openapi3.NewResponses(openapi3.WithStatus(200, &openapi3.ResponseRef{
			Value: &openapi3.Response{
				Content: openapi3.Content{
					"application/vnd.atlas.2024-01-01+json": &openapi3.MediaType{},
					"application/vnd.atlas.2025-01-01+json": &openapi3.MediaType{},
				},
			},
		}))
	}
	newPreviewResp := func() *openapi3.Responses {
		return openapi3.NewResponses(openapi3.WithStatus(200, &openapi3.ResponseRef{
			Value: &openapi3.Response{
				Content: openapi3.Content{
					"application/vnd.atlas.preview+json": {
						Extensions: map[string]any{
							"x-xgen-preview": map[string]any{"public": "true"},
						},
					},
				},
			},
		}))
	}
	newUpcomingResp := func() *openapi3.Responses {
		return openapi3.NewResponses(openapi3.WithStatus(200, &openapi3.ResponseRef{
			Value: &openapi3.Response{
				Content: openapi3.Content{
					"application/vnd.atlas.2026-01-01.upcoming+json": &openapi3.MediaType{},
				},
			},
		}))
	}

	spec.Paths.Set("/users", &openapi3.PathItem{
		Get: &openapi3.Operation{
			OperationID: "getUsers",
			Summary:     "List users",
			Tags:        []string{"Users"},
			Responses:   newStableResp(),
		},
		Post: &openapi3.Operation{
			OperationID: "createUser",
			Summary:     "Create a user",
			Tags:        []string{"Users"},
			Responses:   newStableResp(),
		},
	})

	spec.Paths.Set("/users/{userId}", &openapi3.PathItem{
		Get: &openapi3.Operation{
			OperationID: "getUser",
			Summary:     "Get a user",
			Tags:        []string{"Users"},
			Responses:   newStableResp(),
		},
	})

	spec.Paths.Set("/clusters", &openapi3.PathItem{
		Get: &openapi3.Operation{
			OperationID: "listClusters",
			Summary:     "List clusters",
			Tags:        []string{"Clusters"},
			Responses:   newPreviewResp(),
		},
	})

	spec.Paths.Set("/clusters/{clusterId}/upcoming-feature", &openapi3.PathItem{
		Get: &openapi3.Operation{
			OperationID: "getUpcomingFeature",
			Summary:     "Get upcoming feature",
			Tags:        []string{"Clusters"},
			Responses:   newUpcomingResp(),
		},
	})

	return spec
}
