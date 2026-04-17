// Package apiversion exposes API version parsing utilities for use outside the cli module.
package apiversion

import (
	"github.com/getkin/kin-openapi/openapi3"
	"github.com/mongodb/openapi/tools/cli/internal/apiversion"
)

// APIVersion is a parsed Atlas API version with its stability level.
type APIVersion = apiversion.APIVersion

const (
	StableStabilityLevel   = apiversion.StableStabilityLevel
	PreviewStabilityLevel  = apiversion.PreviewStabilityLevel
	UpcomingStabilityLevel = apiversion.UpcomingStabilityLevel
)

// ParseVersionFromContentType parses a versioned Atlas media type string (e.g. application/vnd.atlas.2024-01-01+json)
// and its OpenAPI media type value into an APIVersion. Handles stable dates, preview, and upcoming stability levels.
func ParseVersionFromContentType(contentType string, mediaType *openapi3.MediaType) (*APIVersion, error) {
	return apiversion.New(apiversion.WithFullContent(contentType, mediaType))
}

func IsPreviewStabilityLevel(version string) bool {
	return apiversion.IsPreviewStabilityLevel(version)
}

func IsUpcomingStabilityLevel(version string) bool {
	return apiversion.IsUpcomingStabilityLevel(version)
}
