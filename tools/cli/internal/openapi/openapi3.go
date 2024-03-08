package openapi

import (
	"github.com/getkin/kin-openapi/openapi3"
	"github.com/tufin/oasdiff/load"
)

type OpenAPI3 struct {
	IsExternalRefsAllowed    bool
	CircularReferenceCounter int
}

func NewOpenAPI3() *OpenAPI3 {
	return &OpenAPI3{
		IsExternalRefsAllowed:    true,
		CircularReferenceCounter: 10,
	}
}

func (o *OpenAPI3) CreateOpenAPISpecFromPath(path string) (*load.SpecInfo, error) {
	loader := openapi3.NewLoader()
	loader.IsExternalRefsAllowed = true
	openapi3.CircularReferenceCounter = 10

	spec, err := load.LoadSpecInfo(loader, load.NewSource(path))
	if err != nil {
		return nil, err
	}

	return spec, nil
}
