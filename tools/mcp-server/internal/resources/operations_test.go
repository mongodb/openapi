package resources

import (
	"encoding/json"
	"testing"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/mongodb/openapi/tools/mcp-server/internal/registry"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// TestHandleOperation covers all happy-path scenarios for handleOperation.
func TestHandleOperation(t *testing.T) {
	clusterSchema := &openapi3.SchemaRef{Ref: "#/components/schemas/Cluster"}
	flexClusterSchema := &openapi3.SchemaRef{Ref: "#/components/schemas/FlexCluster"}
	groupIDParam := OperationParam{
		Name: "groupId", In: "path",
		Description: "Unique 24-hexadecimal digit string that identifies your project.",
		Required:    true,
	}

	listClusters := func(content []ContentEntry) OperationDetail {
		return OperationDetail{
			OperationID:         "listGroupClusters",
			Method:              "GET",
			Path:                "/api/atlas/v2/groups/{groupId}/clusters",
			Summary:             "Return All Clusters in One Project",
			LatestStableVersion: "2025-01-01",
			AvailableVersions:   []string{"2023-02-01", "2024-01-01", "2025-01-01"},
			Parameters:          []OperationParam{groupIDParam},
			Responses:           []OperationResponseDetail{{StatusCode: "200", Content: content}},
		}
	}

	tests := []struct {
		name string
		uri  string
		want OperationDetail
	}{
		{
			name: "listGroupClusters default",
			uri:  "openapi://specs/test-api/operations/listGroupClusters",
			want: listClusters([]ContentEntry{
				{ContentType: "application/vnd.atlas.2025-01-01+json", Version: "2025-01-01", Schema: clusterSchema},
			}),
		},
		{
			name: "listGroupClusters latest",
			uri:  "openapi://specs/test-api/operations/listGroupClusters?version=latest",
			want: listClusters([]ContentEntry{
				{ContentType: "application/vnd.atlas.2025-01-01+json", Version: "2025-01-01", Schema: clusterSchema},
			}),
		},
		{
			name: "listGroupClusters all",
			uri:  "openapi://specs/test-api/operations/listGroupClusters?version=all",
			want: listClusters([]ContentEntry{
				{ContentType: "application/vnd.atlas.2023-02-01+json", Version: "2023-02-01", Schema: clusterSchema},
				{ContentType: "application/vnd.atlas.2024-01-01+json", Version: "2024-01-01", Schema: clusterSchema},
				{ContentType: "application/vnd.atlas.2025-01-01+json", Version: "2025-01-01", Schema: clusterSchema},
			}),
		},
		{
			name: "listGroupClusters 2023-02-01",
			uri:  "openapi://specs/test-api/operations/listGroupClusters?version=2023-02-01",
			want: listClusters([]ContentEntry{
				{ContentType: "application/vnd.atlas.2023-02-01+json", Version: "2023-02-01", Schema: clusterSchema},
			}),
		},
		{
			name: "listGroupClusters 2024-01-01",
			uri:  "openapi://specs/test-api/operations/listGroupClusters?version=2024-01-01",
			want: listClusters([]ContentEntry{
				{ContentType: "application/vnd.atlas.2024-01-01+json", Version: "2024-01-01", Schema: clusterSchema},
			}),
		},
		{
			name: "listGroupClusters 2025-01-01",
			uri:  "openapi://specs/test-api/operations/listGroupClusters?version=2025-01-01",
			want: listClusters([]ContentEntry{
				{ContentType: "application/vnd.atlas.2025-01-01+json", Version: "2025-01-01", Schema: clusterSchema},
			}),
		},
		{
			name: "getGroupCluster preview",
			uri:  "openapi://specs/test-api/operations/getGroupCluster?version=preview",
			want: OperationDetail{
				OperationID:       "getGroupCluster",
				Method:            "GET",
				Path:              "/api/atlas/v2/groups/{groupId}/clusters/{clusterName}",
				Summary:           "Return One Cluster from One Project",
				AvailableVersions: []string{},
				HasPreview:        true,
				Parameters: []OperationParam{
					{Name: "groupId", In: "path", Description: "Unique 24-hexadecimal digit string that identifies your project.", Required: true},
					{Name: "clusterName", In: "path", Description: "Human-readable label that identifies the cluster.", Required: true},
				},
				Responses: []OperationResponseDetail{
					{StatusCode: "200", Content: []ContentEntry{
						{ContentType: "application/vnd.atlas.preview+json", Version: "preview"},
					}},
				},
			},
		},
		{
			name: "deleteGroupCluster",
			uri:  "openapi://specs/test-api/operations/deleteGroupCluster",
			want: OperationDetail{
				OperationID:       "deleteGroupCluster",
				Method:            "DELETE",
				Path:              "/api/atlas/v2/groups/{groupId}/clusters/{clusterName}",
				Summary:           "Remove One Cluster from One Project",
				AvailableVersions: []string{},
				Parameters: []OperationParam{
					{Name: "groupId", In: "path", Description: "Unique 24-hexadecimal digit string that identifies your project.", Required: true},
					{Name: "clusterName", In: "path", Description: "Human-readable label that identifies the cluster.", Required: true},
				},
				Responses: []OperationResponseDetail{
					{StatusCode: "204", Description: "No Content", Content: []ContentEntry{}},
					{StatusCode: "400", Description: "Bad Request", Content: []ContentEntry{
						{ContentType: "application/json", Schema: &openapi3.SchemaRef{Ref: "#/components/schemas/Error"}},
					}},
				},
			},
		},
		{
			name: "createGroupFlexCluster upcoming",
			uri:  "openapi://specs/test-api/operations/createGroupFlexCluster?version=upcoming",
			want: OperationDetail{
				OperationID:       "createGroupFlexCluster",
				Method:            "POST",
				Path:              "/api/atlas/v2/groups/{groupId}/flexClusters",
				Summary:           "Create One Flex Cluster in One Project",
				AvailableVersions: []string{},
				HasUpcoming:       true,
				Parameters:        []OperationParam{},
				Responses: []OperationResponseDetail{
					{StatusCode: "200", Content: []ContentEntry{
						{ContentType: "application/vnd.atlas.2026-01-01.upcoming+json", Version: "2026-01-01.upcoming"},
					}},
				},
			},
		},
		{
			name: "createGroupCluster all",
			uri:  "openapi://specs/test-api/operations/createGroupCluster?version=all",
			want: OperationDetail{
				OperationID:         "createGroupCluster",
				Method:              "POST",
				Path:                "/api/atlas/v2/groups/{groupId}/clusters",
				Summary:             "Create One Cluster in One Project",
				LatestStableVersion: "2025-01-01",
				AvailableVersions:   []string{"2024-01-01", "2025-01-01"},
				Parameters:          []OperationParam{groupIDParam},
				RequestBody: &RequestBodyDetail{
					Required: true,
					Content: []ContentEntry{
						{ContentType: "application/vnd.atlas.2024-01-01+json", Version: "2024-01-01", Schema: clusterSchema},
						{ContentType: "application/vnd.atlas.2025-01-01+json", Version: "2025-01-01", Schema: clusterSchema},
					},
				},
				Responses: []OperationResponseDetail{
					{StatusCode: "200", Content: []ContentEntry{
						{ContentType: "application/vnd.atlas.2024-01-01+json", Version: "2024-01-01", Schema: flexClusterSchema},
						{ContentType: "application/vnd.atlas.2025-01-01+json", Version: "2025-01-01", Schema: flexClusterSchema},
					}},
				},
			},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			result, err := handleOperation(newTestRegistry(t), makeRequest(tc.uri))
			require.NoError(t, err)
			wantJSON, err := json.Marshal(tc.want)
			require.NoError(t, err)
			assert.JSONEq(t, string(wantJSON), result.Contents[0].Text)
		})
	}
}

// TestHandleOperation_NotFound verifies that a non-existent operationId returns an error.
func TestHandleOperation_NotFound(t *testing.T) {
	_, err := handleOperation(newTestRegistry(t), makeRequest("openapi://specs/test-api/operations/nonExistentOp"))
	require.Error(t, err)
}

// TestHandleOperation_AliasNotFound verifies that a non-existent alias returns an error.
func TestHandleOperation_AliasNotFound(t *testing.T) {
	_, err := handleOperation(registry.New(), makeRequest("openapi://specs/nonexistent/operations/listGroupClusters"))
	require.Error(t, err)
}

// TestHandleOperation_URIInvalid verifies that a malformed URI returns an error.
func TestHandleOperation_URIInvalid(t *testing.T) {
	_, err := handleOperation(registry.New(), makeRequest("openapi://specs/test-api/tags/Clusters"))
	require.Error(t, err)
}

// TestHandleOperation_VersionNotFound verifies that requesting a date version absent from the spec returns an error.
func TestHandleOperation_VersionNotFound(t *testing.T) {
	_, err := handleOperation(newTestRegistry(t), makeRequest("openapi://specs/test-api/operations/listGroupClusters?version=2022-01-01"))
	require.Error(t, err)
	assert.ErrorContains(t, err, "2022-01-01")
}
