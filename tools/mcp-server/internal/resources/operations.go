package resources

import (
	"encoding/json"
	"fmt"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/modelcontextprotocol/go-sdk/mcp"
	"github.com/mongodb/openapi/tools/mcp-server/internal/registry"
)

// OperationParam represents a single parameter (path, query, header, or cookie).
type OperationParam struct {
	Name        string `json:"name"`
	In          string `json:"in"`
	Description string `json:"description,omitempty"`
	Required    bool   `json:"required"`
}

// ContentEntry represents a single versioned content type present in a request body or response.
type ContentEntry struct {
	ContentType string              `json:"contentType"`
	Version     string              `json:"version"`
	Schema      *openapi3.SchemaRef `json:"schema,omitempty"`
}

// OperationResponseDetail describes a single HTTP response with its versioned content types.
type OperationResponseDetail struct {
	StatusCode  string         `json:"statusCode"`
	Description string         `json:"description,omitempty"`
	Content     []ContentEntry `json:"content"`
}

// RequestBodyDetail describes the request body with its versioned content types.
type RequestBodyDetail struct {
	Required bool           `json:"required"`
	Content  []ContentEntry `json:"content"`
}

// OperationDetail is the response body for the openapi://specs/{alias}/operations/{operationId} resource.
type OperationDetail struct {
	OperationID         string                    `json:"operationId"`
	Method              string                    `json:"method"`
	Path                string                    `json:"path"`
	Summary             string                    `json:"summary"`
	Description         string                    `json:"description,omitempty"`
	LatestStableVersion string                    `json:"latestStableVersion"`
	AvailableVersions   []string                  `json:"availableVersions"`
	HasPreview          bool                      `json:"hasPreview"`
	HasUpcoming         bool                      `json:"hasUpcoming"`
	Parameters          []OperationParam          `json:"parameters"`
	RequestBody         *RequestBodyDetail        `json:"requestBody,omitempty"`
	Responses           []OperationResponseDetail `json:"responses"`
}

func handleOperation(reg *registry.Registry, req *mcp.ReadResourceRequest) (*mcp.ReadResourceResult, error) {
	alias, operationID, versionFilter, err := aliasAndOperationFromURI(req.Params.URI)
	if err != nil {
		return nil, err
	}

	entry, err := reg.GetByAlias(alias)
	if err != nil {
		return nil, fmt.Errorf("spec with alias %q not found", alias)
	}

	method, path, op, err := findOperation(entry.Spec, operationID)
	if err != nil {
		return nil, err
	}

	detail, err := buildOperationDetail(op, method, path, versionFilter)
	if err != nil {
		return nil, err
	}

	data, err := json.Marshal(detail)
	if err != nil {
		return nil, err
	}

	return &mcp.ReadResourceResult{
		Contents: []*mcp.ResourceContents{
			{URI: req.Params.URI, MIMEType: mimeTypeJSON, Text: string(data)},
		},
	}, nil
}

// findOperation searches all paths in the spec for an operation matching operationID.
// Returns the HTTP method (uppercase), path string, and operation pointer.
func findOperation(spec *openapi3.T, operationID string) (method, path string, op *openapi3.Operation, err error) {
	if spec == nil || spec.Paths == nil {
		return "", "", nil, fmt.Errorf("operation %q not found", operationID)
	}

	for p, item := range spec.Paths.Map() {
		if item == nil {
			continue
		}
		for m, o := range item.Operations() {
			if o != nil && o.OperationID == operationID {
				return m, p, o, nil
			}
		}
	}

	return "", "", nil, fmt.Errorf("operation %q not found", operationID)
}
