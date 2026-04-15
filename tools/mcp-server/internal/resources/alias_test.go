package resources

import (
	"encoding/json"
	"testing"

	"github.com/mongodb/openapi/tools/mcp-server/internal/registry"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// TestHandleAlias_Overview verifies that the spec overview contains title, stats, and version info.
func TestHandleAlias_Overview(t *testing.T) {
	result, err := handleAlias(newTestRegistry(t), makeRequest("openapi://specs/test-api"))
	require.NoError(t, err)

	var body SpecOverview
	require.NoError(t, json.Unmarshal([]byte(result.Contents[0].Text), &body))

	assert.Equal(t, "test-api", body.Alias)
	assert.Equal(t, "Test API", body.Title)
	assert.Equal(t, registry.SourceTypeFile, body.SourceType)
	assert.Equal(t, 3, body.Stats.Paths)
	assert.Equal(t, 4, body.Stats.Operations)
	assert.Equal(t, 1, body.Stats.Tags)
	assert.Equal(t, 1, body.Stats.Schemas)
	assert.Equal(t, "2025-01-01", body.LatestStableVersion)
	assert.Equal(t, []string{"2024-01-01", "2025-01-01"}, body.AvailableVersions)
	assert.True(t, body.HasPreview)
	assert.False(t, body.HasUpcoming)
}

// TestHandleAlias_NotFound verifies that reading a non-existent alias returns an error.
func TestHandleAlias_NotFound(t *testing.T) {
	_, err := handleAlias(registry.New(), makeRequest("openapi://specs/nonexistent"))
	require.Error(t, err)
}

// TestHandleAlias_URIMissingAlias verifies that a URI without an alias segment returns an error.
func TestHandleAlias_URIMissingAlias(t *testing.T) {
	_, err := handleAlias(registry.New(), makeRequest("not-a-valid-uri"))
	require.Error(t, err)
}

// TestHandleAlias_URIExtraSegments verifies that a URI with extra path segments is rejected.
func TestHandleAlias_URIExtraSegments(t *testing.T) {
	_, err := handleAlias(registry.New(), makeRequest("openapi://specs/test-api/tags/Clusters"))
	require.Error(t, err)
}
