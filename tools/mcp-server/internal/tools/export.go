package tools

import (
	"fmt"

	"github.com/mongodb/openapi/tools/cli/pkg/openapi"
	"github.com/mongodb/openapi/tools/mcp-server/internal/registry"
	"github.com/spf13/afero"
)

// ExportParams are the parameters for the export tool.
type ExportParams struct {
	Alias    string `json:"alias" jsonschema:"Alias of the spec to export"`
	FilePath string `json:"filePath" jsonschema:"Path where the file should be saved"`
	Format   string `json:"format,omitempty" jsonschema:"Output format: 'json' or 'yaml' (default: json)"`
}

// ExportResult is the result of an export operation.
type ExportResult struct {
	Success  bool   `json:"success"`
	Alias    string `json:"alias"`
	FilePath string `json:"filePath"`
	Format   string `json:"format"`
	Message  string `json:"message"`
}

// handleExport exports a spec from the registry to a file.
// The SDK handles parameter unmarshaling and validation automatically.
func handleExport(reg *registry.Registry, params ExportParams) (ExportResult, error) {
	if params.Format == "" {
		params.Format = "json"
	}

	if params.Format != "json" && params.Format != "yaml" {
		return ExportResult{Success: false}, fmt.Errorf("invalid format %q: must be 'json' or 'yaml'", params.Format)
	}

	entry, err := reg.GetByAlias(params.Alias)
	if err != nil {
		return ExportResult{Success: false}, err
	}

	fs := afero.NewOsFs()

	if err := openapi.SaveToFile(params.FilePath, params.Format, entry.Spec, fs); err != nil {
		return ExportResult{Success: false}, fmt.Errorf("failed to export spec: %w", err)
	}

	return ExportResult{
		Success:  true,
		Alias:    params.Alias,
		FilePath: params.FilePath,
		Format:   params.Format,
		Message:  fmt.Sprintf("Exported '%s' to %s", params.Alias, params.FilePath),
	}, nil
}
