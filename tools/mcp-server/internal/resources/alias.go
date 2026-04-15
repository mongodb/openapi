package resources

import (
	"encoding/json"
	"fmt"

	"github.com/modelcontextprotocol/go-sdk/mcp"
	"github.com/mongodb/openapi/tools/cli/pkg/apiversion"
	"github.com/mongodb/openapi/tools/cli/pkg/openapi"
	"github.com/mongodb/openapi/tools/mcp-server/internal/registry"
	"github.com/oasdiff/kin-openapi/openapi3"
)

// SpecStats holds counts of the spec's top-level components.
type SpecStats struct {
	Paths      int `json:"paths"`
	Operations int `json:"operations"`
	Schemas    int `json:"schemas"`
	Tags       int `json:"tags"`
}

// SpecOverview is the response body for the openapi://specs/{alias} resource.
type SpecOverview struct {
	Alias               string              `json:"alias"`
	SourceType          registry.SourceType `json:"sourceType"`
	Title               string              `json:"title,omitempty"`
	Description         string              `json:"description,omitempty"`
	Stats               SpecStats           `json:"stats"`
	LatestStableVersion string              `json:"latestStableVersion"`
	AvailableVersions   []string            `json:"availableVersions"`
	HasPreview          bool                `json:"hasPreview"`
	HasUpcoming         bool                `json:"hasUpcoming"`
}

func handleAlias(reg *registry.Registry, req *mcp.ReadResourceRequest) (*mcp.ReadResourceResult, error) {
	alias, err := aliasFromURI(req.Params.URI)
	if err != nil {
		return nil, err
	}

	entry, err := reg.GetByAlias(alias)
	if err != nil {
		return nil, fmt.Errorf("spec with alias %q not found", alias)
	}

	overview := buildSpecOverview(entry)

	data, err := json.Marshal(overview)
	if err != nil {
		return nil, err
	}

	return &mcp.ReadResourceResult{
		Contents: []*mcp.ResourceContents{
			{URI: req.Params.URI, MIMEType: mimeTypeJSON, Text: string(data)},
		},
	}, nil
}

func buildSpecOverview(entry *registry.Entry) SpecOverview {
	overview := SpecOverview{
		Alias:      entry.Alias,
		SourceType: entry.SourceType,
	}

	if entry.Spec == nil {
		return overview
	}

	if entry.Spec.Info != nil {
		overview.Title = entry.Spec.Info.Title
		overview.Description = entry.Spec.Info.Description
	}

	if entry.Spec.Paths != nil {
		overview.Stats.Paths = len(entry.Spec.Paths.Map())
		overview.Stats.Operations = countOperations(entry.Spec)
	}

	if entry.Spec.Components != nil {
		overview.Stats.Schemas = len(entry.Spec.Components.Schemas)
	}

	overview.Stats.Tags = len(entry.Spec.Tags)

	stable, hasPreview, hasUpcoming := extractVersions(entry.Spec)
	overview.HasPreview = hasPreview
	overview.HasUpcoming = hasUpcoming
	// ExtractVersions returns versions sorted ascending by date string (YYYY-MM-DD).
	overview.AvailableVersions = stable
	if len(stable) > 0 {
		overview.LatestStableVersion = stable[len(stable)-1]
	}

	return overview
}

func countOperations(spec *openapi3.T) int {
	count := 0
	for _, item := range spec.Paths.Map() {
		count += len(item.Operations())
	}
	return count
}

func extractVersions(spec *openapi3.T) (stable []string, hasPreview, hasUpcoming bool) {
	stable = []string{}
	all, err := openapi.ExtractVersions(spec)
	if err != nil || len(all) == 0 {
		return stable, false, false
	}
	for _, v := range all {
		switch {
		case apiversion.IsPreviewStabilityLevel(v):
			hasPreview = true
		case apiversion.IsUpcomingStabilityLevel(v):
			hasUpcoming = true
		default:
			stable = append(stable, v)
		}
	}
	return stable, hasPreview, hasUpcoming
}
