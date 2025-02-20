package apiversion

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestIsPreviewSabilityLevel(t *testing.T) {
	assert.True(t, IsPreviewSabilityLevel("preview"))
	assert.True(t, IsPreviewSabilityLevel("PREVIEW"))
	assert.True(t, IsPreviewSabilityLevel("prEvIEW"))
	assert.True(t, IsPreviewSabilityLevel("private-preview"))
	assert.True(t, IsPreviewSabilityLevel("public-preview"))
	assert.False(t, IsPreviewSabilityLevel("stable"))
	assert.False(t, IsPreviewSabilityLevel("invalid"))
}

func TestIsPrivatePreviewSabilityLevel(t *testing.T) {
	assert.True(t, IsPrivatePreviewSabilityLevel("private-preview"))
	assert.False(t, IsPrivatePreviewSabilityLevel("public-preview"))
	assert.False(t, IsPrivatePreviewSabilityLevel("preview"))
	assert.False(t, IsPrivatePreviewSabilityLevel("stable"))
	assert.False(t, IsPrivatePreviewSabilityLevel("invalid"))
}

func TestIsPublicPreviewSabilityLevel(t *testing.T) {
	assert.True(t, IsPublicPreviewSabilityLevel("public-preview"))
	assert.True(t, IsPublicPreviewSabilityLevel("preview"))
	assert.False(t, IsPublicPreviewSabilityLevel("private-preview"))
	assert.False(t, IsPublicPreviewSabilityLevel("stable"))
	assert.False(t, IsPublicPreviewSabilityLevel("invalid"))
}

func TestIsStableSabilityLevel(t *testing.T) {
	assert.True(t, IsStableSabilityLevel("stable"))
	assert.False(t, IsStableSabilityLevel("preview"))
	assert.False(t, IsStableSabilityLevel("private-preview"))
	assert.False(t, IsStableSabilityLevel("public-preview"))
	assert.False(t, IsStableSabilityLevel("invalid"))
}

func TestValidateStabilityLevel(t *testing.T) {
	require.NoError(t, ValidateStabilityLevel("stable"))
	require.NoError(t, ValidateStabilityLevel("preview"))
	require.NoError(t, ValidateStabilityLevel("private-preview"))
	require.NoError(t, ValidateStabilityLevel("public-preview"))
	assert.Error(t, ValidateStabilityLevel("invalid"))
}
