package openapi

import (
	"encoding/json"
	"github.com/getkin/kin-openapi/openapi3"
	"github.com/tufin/oasdiff/load"
)

func NewSpecInfo(path string) (*load.SpecInfo, error) {
	loader := openapi3.NewLoader()
	loader.IsExternalRefsAllowed = true
	openapi3.CircularReferenceCounter = 10

	spec, err := load.LoadSpecInfo(loader, load.NewSource(path))
	if err != nil {
		return nil, err
	}

	return spec, nil
}

// MarshalJSON returns the JSON encoding of T.
func MarshalJSON(doc *openapi3.T) ([]byte, error) {
	m := make(map[string]interface{}, 4+len(doc.Extensions))
	for k, v := range doc.Extensions {
		m[k] = v
	}
	m["openapi"] = doc.OpenAPI
	if x := doc.Components; x != nil {
		m["components"] = x
	}
	m["info"] = doc.Info
	m["paths"] = doc.Paths
	if x := doc.Security; len(x) != 0 {
		m["security"] = x
	}
	if x := doc.Servers; len(x) != 0 {
		m["servers"] = x
	}
	if x := doc.Tags; len(x) != 0 {
		m["tags"] = x
	}
	if x := doc.ExternalDocs; x != nil {
		m["externalDocs"] = x
	}
	return json.MarshalIndent(m, "", "		")
}
