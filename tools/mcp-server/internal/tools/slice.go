package tools

import (
	"fmt"
	"strings"

	"github.com/mongodb/openapi/tools/cli/pkg/openapi"
	"github.com/mongodb/openapi/tools/mcp-server/internal/registry"
	"github.com/oasdiff/kin-openapi/openapi3"
)

// SliceParams are the parameters for the slice tool.
type SliceParams struct {
	SourceAlias  string   `json:"sourceAlias" jsonschema:"Alias of the source spec to slice"`
	SaveAs       string   `json:"saveAs" jsonschema:"Alias for the resulting virtual spec (e.g. 'my-api-users')"`
	Tags         []string `json:"tags,omitempty" jsonschema:"Optional: filter by tags"`
	OperationIDs []string `json:"operationIds,omitempty" jsonschema:"Optional: filter by operation IDs"`
	Paths        []string `json:"paths,omitempty" jsonschema:"Optional: filter by path patterns"`
}

// SliceResult is the response from the slice tool.
type SliceResult struct {
	Success bool   `json:"success"`
	Message string `json:"message,omitempty"`
	Alias   string `json:"alias,omitempty"`
	Error   string `json:"error,omitempty"`
}

func handleSlice(reg *registry.Registry, params *SliceParams) (SliceResult, error) {
	if params.SaveAs == "" {
		return SliceResult{
			Success: false,
			Error:   "saveAs is required: provide an alias for the resulting virtual spec (e.g. 'my-api-users')",
		}, nil
	}

	if !isValidAlias(params.SaveAs) {
		return SliceResult{
			Success: false,
			Error:   fmt.Sprintf("invalid saveAs alias '%s': only lowercase letters, numbers, and hyphens allowed", params.SaveAs),
		}, nil
	}

	if len(params.Tags) == 0 && len(params.OperationIDs) == 0 && len(params.Paths) == 0 {
		return SliceResult{
			Success: false,
			Error:   "at least one of tags, operationIds, or paths must be specified",
		}, nil
	}

	if _, err := reg.GetByAlias(params.SaveAs); err == nil {
		return SliceResult{
			Success: false,
			Error:   fmt.Sprintf("alias '%s' is already in use, choose a different saveAs alias", params.SaveAs),
		}, nil
	}

	entry, err := reg.GetByAlias(params.SourceAlias)
	if err != nil {
		return SliceResult{
			Success: false,
			Error:   fmt.Sprintf("spec with alias '%s' not found", params.SourceAlias),
		}, nil
	}

	specCopy, err := copySpec(entry.Spec)
	if err != nil {
		return SliceResult{
			Success: false,
			Error:   fmt.Sprintf("failed to copy spec: %v", err),
		}, nil
	}

	criteria := &openapi.SliceCriteria{
		Tags:         params.Tags,
		OperationIDs: params.OperationIDs,
		Paths:        params.Paths,
	}

	if sliceErr := openapi.Slice(specCopy, criteria); sliceErr != nil {
		return SliceResult{
			Success: false,
			Error:   fmt.Sprintf("failed to slice spec: %v", sliceErr),
		}, nil
	}

	if addErr := reg.Add(params.SaveAs, "", specCopy, entry.Metadata); addErr != nil {
		return SliceResult{
			Success: false,
			Error:   fmt.Sprintf("failed to save virtual spec: %v", addErr),
		}, nil
	}

	return SliceResult{
		Success: true,
		Message: "Successfully created sliced spec filtered by " + buildFilterDescription(params),
		Alias:   params.SaveAs,
	}, nil
}

func buildFilterDescription(params *SliceParams) string {
	filters := []string{}
	if len(params.Tags) > 0 {
		filters = append(filters, fmt.Sprintf("tags: %v", params.Tags))
	}
	if len(params.OperationIDs) > 0 {
		filters = append(filters, fmt.Sprintf("operation IDs: %v", params.OperationIDs))
	}
	if len(params.Paths) > 0 {
		filters = append(filters, fmt.Sprintf("paths: %v", params.Paths))
	}

	return strings.Join(filters, ", ")
}

// copySpec creates a deep copy of an OpenAPI spec by marshaling and unmarshaling.
func copySpec(spec *openapi3.T) (*openapi3.T, error) {
	data, err := spec.MarshalJSON()
	if err != nil {
		return nil, fmt.Errorf("failed to marshal spec: %w", err)
	}

	specCopy, err := openapi3.NewLoader().LoadFromData(data)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal spec: %w", err)
	}

	return specCopy, nil
}
