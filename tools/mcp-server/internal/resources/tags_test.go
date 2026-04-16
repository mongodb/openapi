package resources

import (
	"encoding/json"
	"testing"

	"github.com/mongodb/openapi/tools/mcp-server/internal/registry"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type wantOp struct {
	operationID string
	method      string
	path        string
	summary     string
}

func assertOp(t *testing.T, got TagOperation, want wantOp) {
	t.Helper()
	assert.Equal(t, want.operationID, got.OperationID)
	assert.Equal(t, want.method, got.Method)
	assert.Equal(t, want.path, got.Path)
	assert.Equal(t, want.summary, got.Summary)
}

// TestHandleTags_Clusters verifies Clusters operations are returned sorted by path then method.
func TestHandleTags_Clusters(t *testing.T) {
	result, err := handleTags(newTestRegistry(t), makeRequest("openapi://specs/test-api/tags/Clusters"))
	require.NoError(t, err)

	var body TagsResource
	require.NoError(t, json.Unmarshal([]byte(result.Contents[0].Text), &body))
	assert.Equal(t, "Clusters", body.Tag)
	require.Equal(t, 4, body.Total)

	assertOp(t, body.Operations[0], wantOp{"listClusterDetails", "GET",
		"/api/atlas/v2/clusters", "Return All Authorized Clusters in All Projects"})
	assertOp(t, body.Operations[1], wantOp{"listGroupClusters", "GET",
		"/api/atlas/v2/groups/{groupId}/clusters", "Return All Clusters in One Project"})
	assertOp(t, body.Operations[2], wantOp{"createGroupCluster", "POST",
		"/api/atlas/v2/groups/{groupId}/clusters", "Create One Cluster in One Project"})
	assertOp(t, body.Operations[3], wantOp{"deleteGroupCluster", "DELETE",
		"/api/atlas/v2/groups/{groupId}/clusters/{clusterName}", "Remove One Cluster from One Project"})
}

// TestHandleTags_FlexClusters verifies that tag names containing spaces are resolved correctly.
// The server decodes the URI automatically so agents can use tag names as they appear in the spec.
func TestHandleTags_FlexClusters(t *testing.T) {
	result, err := handleTags(newTestRegistry(t), makeRequest("openapi://specs/test-api/tags/Flex%20Clusters"))
	require.NoError(t, err)

	var body TagsResource
	require.NoError(t, json.Unmarshal([]byte(result.Contents[0].Text), &body))
	assert.Equal(t, "Flex Clusters", body.Tag)
	require.Equal(t, 2, body.Total)

	// Sorted: GET before POST on the same path.
	assertOp(t, body.Operations[0], wantOp{"listGroupFlexClusters", "GET",
		"/api/atlas/v2/groups/{groupId}/flexClusters", "Return All Flex Clusters from One Project"})
	assertOp(t, body.Operations[1], wantOp{"createGroupFlexCluster", "POST",
		"/api/atlas/v2/groups/{groupId}/flexClusters", "Create One Flex Cluster in One Project"})
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
