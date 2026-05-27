package apiversion

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestIsPreviewStabilityLevel(t *testing.T) {
	assert.True(t, IsPreviewStabilityLevel("preview"))
	assert.True(t, IsPreviewStabilityLevel("PREVIEW"))
	assert.True(t, IsPreviewStabilityLevel("prEvIEW"))
	assert.True(t, IsPreviewStabilityLevel("private-preview"))
	assert.True(t, IsPreviewStabilityLevel("public-preview"))
	assert.False(t, IsPreviewStabilityLevel("stable"))
	assert.False(t, IsPreviewStabilityLevel("invalid"))
}

func TestIsPrivatePreviewStabilityLevel(t *testing.T) {
	assert.True(t, IsPrivatePreviewStabilityLevel("private-preview"))
	assert.False(t, IsPrivatePreviewStabilityLevel("public-preview"))
	assert.False(t, IsPrivatePreviewStabilityLevel("preview"))
	assert.False(t, IsPrivatePreviewStabilityLevel("stable"))
	assert.False(t, IsPrivatePreviewStabilityLevel("invalid"))
}

func TestIsPublicPreviewStabilityLevel(t *testing.T) {
	assert.True(t, IsPublicPreviewStabilityLevel("public-preview"))
	assert.True(t, IsPublicPreviewStabilityLevel("preview"))
	assert.False(t, IsPublicPreviewStabilityLevel("private-preview"))
	assert.False(t, IsPublicPreviewStabilityLevel("stable"))
	assert.False(t, IsPublicPreviewStabilityLevel("invalid"))
}

func TestIsStableStabilityLevel(t *testing.T) {
	assert.True(t, IsStableStabilityLevel("stable"))
	assert.False(t, IsStableStabilityLevel("preview"))
	assert.False(t, IsStableStabilityLevel("private-preview"))
	assert.False(t, IsStableStabilityLevel("public-preview"))
	assert.False(t, IsStableStabilityLevel("invalid"))
}

func TestValidateStabilityLevel(t *testing.T) {
	require.NoError(t, ValidateStabilityLevel("stable"))
	require.NoError(t, ValidateStabilityLevel("preview"))
	require.NoError(t, ValidateStabilityLevel("private-preview"))
	require.NoError(t, ValidateStabilityLevel("public-preview"))
	assert.Error(t, ValidateStabilityLevel("invalid"))
}
