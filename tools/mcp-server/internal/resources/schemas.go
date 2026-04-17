package resources

import (
	"encoding/json"
	"errors"
	"fmt"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/modelcontextprotocol/go-sdk/mcp"
	"github.com/mongodb/openapi/tools/mcp-server/internal/registry"
)

// SchemaDetail is the response body for the openapi://specs/{alias}/schemas/{schemaName} resource.
type SchemaDetail struct {
	Schema     *openapi3.SchemaRef `json:"schema"`
	UsedBy     SchemaUsage         `json:"usedBy"`
	References SchemaReferences    `json:"references"`
}

// SchemaUsage lists what references this schema.
type SchemaUsage struct {
	Operations []string `json:"operations"`
	Schemas    []string `json:"schemas"`
}

// SchemaReferences lists what this schema directly references.
type SchemaReferences struct {
	Schemas []string `json:"schemas"`
}

func handleSchema(reg *registry.Registry, req *mcp.ReadResourceRequest) (*mcp.ReadResourceResult, error) {
	alias, schemaName, err := aliasAndSchemaFromURI(req.Params.URI)
	if err != nil {
		return nil, err
	}

	entry, err := reg.GetByAlias(alias)
	if err != nil {
		return nil, fmt.Errorf("spec with alias %q not found", alias)
	}

	detail, err := buildSchemaDetail(entry.Spec, schemaName)
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

func buildSchemaDetail(spec *openapi3.T, schemaName string) (SchemaDetail, error) {
	if spec.Components == nil || spec.Components.Schemas == nil {
		return SchemaDetail{}, errors.New("spec has no components or schemas defined")
	}
	schemaRef, ok := spec.Components.Schemas[schemaName]
	if !ok || schemaRef == nil {
		return SchemaDetail{}, fmt.Errorf("schema %q not found", schemaName)
	}
	return SchemaDetail{
		Schema: schemaRef,
		UsedBy: SchemaUsage{
			Operations: operationsUsing(spec, schemaName),
			Schemas:    schemasUsing(spec, schemaName),
		},
		References: SchemaReferences{
			Schemas: schemaReferencesIn(schemaRef),
		},
	}, nil
}
