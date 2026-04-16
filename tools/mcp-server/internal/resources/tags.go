package resources

import (
	"encoding/json"
	"fmt"
	"sort"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/modelcontextprotocol/go-sdk/mcp"
	"github.com/mongodb/openapi/tools/mcp-server/internal/registry"
)

// TagOperation represents a single operation belonging to a tag.
type TagOperation struct {
	OperationID string `json:"operationId"`
	Method      string `json:"method"`
	Path        string `json:"path"`
	Summary     string `json:"summary"`
}

// TagsResource is the response body for the openapi://specs/{alias}/tags/{tagName} resource.
type TagsResource struct {
	Tag        string         `json:"tag"`
	Total      int            `json:"total"`
	Operations []TagOperation `json:"operations"`
}

func handleTags(reg *registry.Registry, req *mcp.ReadResourceRequest) (*mcp.ReadResourceResult, error) {
	alias, tagName, err := aliasAndTagFromURI(req.Params.URI)
	if err != nil {
		return nil, err
	}

	entry, err := reg.GetByAlias(alias)
	if err != nil {
		return nil, fmt.Errorf("spec with alias %q not found", alias)
	}

	ops, err := operationsByTag(entry.Spec, tagName)
	if err != nil {
		return nil, err
	}

	resource := TagsResource{
		Tag:        tagName,
		Total:      len(ops),
		Operations: ops,
	}

	data, err := json.Marshal(resource)
	if err != nil {
		return nil, err
	}

	return &mcp.ReadResourceResult{
		Contents: []*mcp.ResourceContents{
			{URI: req.Params.URI, MIMEType: mimeTypeJSON, Text: string(data)},
		},
	}, nil
}

// operationsByTag returns all operations in the spec tagged with tagName,
// sorted by path then method for deterministic output.
// Returns an error if no operations are found for the given tag.
func operationsByTag(spec *openapi3.T, tagName string) ([]TagOperation, error) {
	if spec == nil || spec.Paths == nil {
		return nil, fmt.Errorf("tag %q not found in spec", tagName)
	}

	var ops []TagOperation
	for path, item := range spec.Paths.Map() {
		if item == nil {
			continue
		}
		for method, op := range item.Operations() {
			if op == nil {
				continue
			}
			for _, t := range op.Tags {
				if t == tagName {
					ops = append(ops, TagOperation{
						OperationID: op.OperationID,
						Method:      method,
						Path:        path,
						Summary:     op.Summary,
					})
					break
				}
			}
		}
	}

	if len(ops) == 0 {
		return nil, fmt.Errorf("tag %q not found in spec", tagName)
	}

	sort.Slice(ops, func(i, j int) bool {
		if ops[i].Path != ops[j].Path {
			return ops[i].Path < ops[j].Path
		}
		return ops[i].Method < ops[j].Method
	})

	return ops, nil
}
