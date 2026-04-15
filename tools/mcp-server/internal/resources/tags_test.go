package resources

import (
	"encoding/json"
	"testing"

	"github.com/mongodb/openapi/tools/mcp-server/internal/registry"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// TestHandleTags_Clusters verifies Clusters operations are returned sorted by path then method.
// Operation IDs, paths, and summaries mirror the real Atlas v2 spec.
func TestHandleTags_Clusters(t *testing.T) {
	result, err := handleTags(newTestRegistry(t), makeRequest("openapi://specs/test-api/tags/Clusters"))
	require.NoError(t, err)

	var body TagsResource
	require.NoError(t, json.Unmarshal([]byte(result.Contents[0].Text), &body))

	assert.Equal(t, "Clusters", body.Tag)
	assert.Equal(t, 4, body.Total)
	require.Len(t, body.Operations, 4)

	// Sorted by path then method:
	// 1. GET    /api/atlas/v2/clusters
	// 2. GET    /api/atlas/v2/groups/{groupId}/clusters
	// 3. POST   /api/atlas/v2/groups/{groupId}/clusters
	// 4. DELETE /api/atlas/v2/groups/{groupId}/clusters/{clusterName}
	assert.Equal(t, "listClusterDetails", body.Operations[0].OperationID)
	assert.Equal(t, "GET", body.Operations[0].Method)
	assert.Equal(t, "listGroupClusters", body.Operations[1].OperationID)
	assert.Equal(t, "GET", body.Operations[1].Method)
	assert.Equal(t, "createGroupCluster", body.Operations[2].OperationID)
	assert.Equal(t, "POST", body.Operations[2].Method)
	assert.Equal(t, "deleteGroupCluster", body.Operations[3].OperationID)
	assert.Equal(t, "DELETE", body.Operations[3].Method)
}

// TestHandleTags_OperationFields verifies all fields are populated correctly.
// Uses listClusterDetails from the real Atlas v2 spec as the reference operation.
func TestHandleTags_OperationFields(t *testing.T) {
	result, err := handleTags(newTestRegistry(t), makeRequest("openapi://specs/test-api/tags/Clusters"))
	require.NoError(t, err)

	var body TagsResource
	require.NoError(t, json.Unmarshal([]byte(result.Contents[0].Text), &body))

	var op *TagOperation
	for i := range body.Operations {
		if body.Operations[i].OperationID == "listClusterDetails" {
			op = &body.Operations[i]
			break
		}
	}
	require.NotNil(t, op, "operation listClusterDetails not found")
	assert.Equal(t, "GET", op.Method)
	assert.Equal(t, "/api/atlas/v2/clusters", op.Path)
	assert.Equal(t, "Return All Authorized Clusters in All Projects", op.Summary)
}

// TestHandleTags_FlexClusters verifies that tag names containing spaces are resolved correctly.
// The server decodes the URI automatically so agents can use tag names as they appear in the spec.
func TestHandleTags_FlexClusters(t *testing.T) {
	result, err := handleTags(newTestRegistry(t), makeRequest("openapi://specs/test-api/tags/Flex%20Clusters"))
	require.NoError(t, err)

	var body TagsResource
	require.NoError(t, json.Unmarshal([]byte(result.Contents[0].Text), &body))

	assert.Equal(t, "Flex Clusters", body.Tag)
	assert.Equal(t, 2, body.Total)
	require.Len(t, body.Operations, 2)
	// Sorted: GET before POST on the same path
	assert.Equal(t, "listGroupFlexClusters", body.Operations[0].OperationID)
	assert.Equal(t, "createGroupFlexCluster", body.Operations[1].OperationID)
}

// TestHandleTags_TagNotFound verifies that a non-existent tag returns an error.
func TestHandleTags_TagNotFound(t *testing.T) {
	_, err := handleTags(newTestRegistry(t), makeRequest("openapi://specs/test-api/tags/NonExistent"))
	require.Error(t, err)
}

// TestHandleTags_TagCaseSensitive verifies that tag matching is case-sensitive.
func TestHandleTags_TagCaseSensitive(t *testing.T) {
	_, err := handleTags(newTestRegistry(t), makeRequest("openapi://specs/test-api/tags/clusters"))
	require.Error(t, err)
}

// TestHandleTags_AliasNotFound verifies that a non-existent alias returns an error.
func TestHandleTags_AliasNotFound(t *testing.T) {
	_, err := handleTags(registry.New(), makeRequest("openapi://specs/nonexistent/tags/Clusters"))
	require.Error(t, err)
}

// TestHandleTags_URIInvalid verifies that a URI missing the tag segment returns an error.
func TestHandleTags_URIInvalid(t *testing.T) {
	_, err := handleTags(registry.New(), makeRequest("openapi://specs/test-api"))
	require.Error(t, err)
}
