package resources

import (
	"encoding/json"

	"github.com/modelcontextprotocol/go-sdk/mcp"
	"github.com/mongodb/openapi/tools/mcp-server/internal/registry"
)

// SpecSummary is a summary of a single spec returned by the openapi://specs resource.
type SpecSummary struct {
	Alias      string              `json:"alias"`
	SourceType registry.SourceType `json:"sourceType"`
	FilePath   string              `json:"filePath,omitempty"`
}

// SpecsResource is the response body for the openapi://specs resource.
type SpecsResource struct {
	Specs []SpecSummary `json:"specs"`
	Total int           `json:"total"`
}

func handleSpecs(reg *registry.Registry, req *mcp.ReadResourceRequest) (*mcp.ReadResourceResult, error) {
	entries := reg.List()

	summaries := make([]SpecSummary, len(entries))
	for i, entry := range entries {
		summaries[i] = SpecSummary{
			Alias:      entry.Alias,
			SourceType: entry.SourceType,
			FilePath:   entry.FilePath,
		}
	}

	data, err := json.Marshal(SpecsResource{Specs: summaries, Total: len(summaries)})
	if err != nil {
		return nil, err
	}

	return &mcp.ReadResourceResult{
		Contents: []*mcp.ResourceContents{
			{URI: req.Params.URI, MIMEType: mimeTypeJSON, Text: string(data)},
		},
	}, nil
}
