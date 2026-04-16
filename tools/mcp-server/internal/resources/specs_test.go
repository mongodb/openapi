package resources

import (
	"encoding/json"
	"testing"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/mongodb/openapi/tools/mcp-server/internal/registry"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// TestHandleSpecs_EmptyRegistry verifies that an empty registry returns an empty list.
func TestHandleSpecs_EmptyRegistry(t *testing.T) {
	result, err := handleSpecs(registry.New(), makeRequest("openapi://specs"))
	require.NoError(t, err)

	var body SpecsResource
	require.NoError(t, json.Unmarshal([]byte(result.Contents[0].Text), &body))
	assert.Equal(t, 0, body.Total)
	assert.Empty(t, body.Specs)
}

// TestHandleSpecs_WithEntries verifies that loaded specs are returned with alias, sourceType, and filePath.
func TestHandleSpecs_WithEntries(t *testing.T) {
	result, err := handleSpecs(newTestRegistry(t), makeRequest("openapi://specs"))
	require.NoError(t, err)

	var body SpecsResource
	require.NoError(t, json.Unmarshal([]byte(result.Contents[0].Text), &body))
	require.Equal(t, 1, body.Total)

	s := body.Specs[0]
	assert.Equal(t, "test-api", s.Alias)
	assert.Equal(t, registry.SourceTypeFile, s.SourceType)
	assert.Equal(t, "/test/api.yaml", s.FilePath)
}

// TestHandleSpecs_VirtualSpecHasNoFilePath verifies that virtual specs omit filePath.
func TestHandleSpecs_VirtualSpecHasNoFilePath(t *testing.T) {
	reg := registry.New()
	require.NoError(t, reg.Add("virtual-api", "", &openapi3.T{Info: &openapi3.Info{Title: "Virtual"}}, nil))

	result, err := handleSpecs(reg, makeRequest("openapi://specs"))
	require.NoError(t, err)

	var body SpecsResource
	require.NoError(t, json.Unmarshal([]byte(result.Contents[0].Text), &body))
	assert.Empty(t, body.Specs[0].FilePath)
	assert.Equal(t, registry.SourceTypeVirtual, body.Specs[0].SourceType)
}
