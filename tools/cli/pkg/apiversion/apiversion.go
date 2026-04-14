// Package apiversion exposes API version parsing utilities for use outside the cli module.
package apiversion

import (
	"github.com/mongodb/openapi/tools/cli/internal/apiversion"
)

// Parse extracts the API version string from a versioned media type
// (e.g. "application/vnd.atlas.2024-01-01+json" → "2024-01-01").
// Returns an error if the media type does not match the expected pattern.
func Parse(contentType string) (string, error) {
	return apiversion.Parse(contentType)
}

// IsPreviewStabilityLevel reports whether the given version string represents a preview release.
func IsPreviewStabilityLevel(version string) bool {
	return apiversion.IsPreviewStabilityLevel(version)
}

// IsUpcomingStabilityLevel reports whether the given version string represents an upcoming release.
func IsUpcomingStabilityLevel(version string) bool {
	return apiversion.IsUpcomingStabilityLevel(version)
}
