// Package apiversion exposes API version parsing utilities for use outside the cli module.
package apiversion

import (
	"github.com/getkin/kin-openapi/openapi3"
	"github.com/mongodb/openapi/tools/cli/internal/apiversion"
)

// APIVersion represents a parsed Atlas API version with its stability level.
// Use ParseVersionFromContentType or FindLatestVersionInContent to create instances.
type APIVersion = apiversion.APIVersion

const (
	// StableStabilityLevel identifies a GA-stable API version.
	StableStabilityLevel = apiversion.StableStabilityLevel
	// PreviewStabilityLevel identifies a public-preview API version.
	PreviewStabilityLevel = apiversion.PreviewStabilityLevel
	// UpcomingStabilityLevel identifies an upcoming API version.
	UpcomingStabilityLevel = apiversion.UpcomingStabilityLevel
)

// ParseVersionFromContentType creates an APIVersion from a versioned media type string and its OpenAPI media type value.
// It correctly handles stable dates, public preview, and private preview (via the x-xgen-preview extension).
// Prefer this over Parse when you need stability-level checks (IsPreview, IsUpcoming, IsStable).
func ParseVersionFromContentType(contentType string, mediaType *openapi3.MediaType) (*APIVersion, error) {
	return apiversion.New(apiversion.WithFullContent(contentType, mediaType))
}

// IsPreviewStabilityLevel reports whether the given version string represents a preview release.
func IsPreviewStabilityLevel(version string) bool {
	return apiversion.IsPreviewStabilityLevel(version)
}

// IsUpcomingStabilityLevel reports whether the given version string represents an upcoming release.
func IsUpcomingStabilityLevel(version string) bool {
	return apiversion.IsUpcomingStabilityLevel(version)
}
