package resources

import (
	"testing"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/modelcontextprotocol/go-sdk/mcp"
	"github.com/mongodb/openapi/tools/mcp-server/internal/registry"
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

// newTestSpec builds a synthetic OpenAPI spec whose paths, operation IDs, summaries, and tag names
// are modeled after the real Atlas v2 spec so that test assertions reflect realistic API data.
func newTestSpec() *openapi3.T {
	spec := &openapi3.T{
		Info: &openapi3.Info{
			Title:       "Test API",
			Description: "A test API",
		},
		Paths: &openapi3.Paths{},
		Tags: openapi3.Tags{
			{Name: "Clusters"},
			{Name: "Flex Clusters"}, // space in name → percent-encoded as "Flex%20Clusters" in URIs
		},
		Components: &openapi3.Components{
			Schemas: map[string]*openapi3.SchemaRef{
				"Cluster":     {Value: &openapi3.Schema{Type: &openapi3.Types{"object"}}},
				"FlexCluster": {Value: &openapi3.Schema{Type: &openapi3.Types{"object"}}},
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

	spec.Paths.Set("/api/atlas/v2/clusters", &openapi3.PathItem{
		Get: &openapi3.Operation{
			OperationID: "listClusterDetails",
			Summary:     "Return All Authorized Clusters in All Projects",
			Tags:        []string{"Clusters"},
			Responses:   newStableResp(),
		},
	})

	spec.Paths.Set("/api/atlas/v2/groups/{groupId}/clusters", &openapi3.PathItem{
		Get: &openapi3.Operation{
			OperationID: "listGroupClusters",
			Summary:     "Return All Clusters in One Project",
			Tags:        []string{"Clusters"},
			Responses:   newStableResp(),
		},
		Post: &openapi3.Operation{
			OperationID: "createGroupCluster",
			Summary:     "Create One Cluster in One Project",
			Tags:        []string{"Clusters"},
			Responses:   newStableResp(),
		},
	})

	spec.Paths.Set("/api/atlas/v2/groups/{groupId}/clusters/{clusterName}", &openapi3.PathItem{
		Delete: &openapi3.Operation{
			OperationID: "deleteGroupCluster",
			Summary:     "Remove One Cluster from One Project",
			Tags:        []string{"Clusters"},
			Responses:   newPreviewResp(),
		},
	})

	// Flex Clusters: tag name has a space, exercising percent-encoding in URIs.
	spec.Paths.Set("/api/atlas/v2/groups/{groupId}/flexClusters", &openapi3.PathItem{
		Get: &openapi3.Operation{
			OperationID: "listGroupFlexClusters",
			Summary:     "Return All Flex Clusters from One Project",
			Tags:        []string{"Flex Clusters"},
			Responses:   newStableResp(),
		},
		Post: &openapi3.Operation{
			OperationID: "createGroupFlexCluster",
			Summary:     "Create One Flex Cluster in One Project",
			Tags:        []string{"Flex Clusters"},
			Responses:   newUpcomingResp(),
		},
	})

	return spec
}
