package utils

import (
	"fmt"
	"github.com/getkin/kin-openapi/openapi3"
	"github.com/tufin/oasdiff/load"
)

func loadSpec(loader *openapi3.Loader, path string) (*load.SpecInfo, error) {
	spec, err := load.NewSpecInfo(loader, load.NewSource(path))
	if err != nil {
		return nil, fmt.Errorf("failed to load spec %s: %v", path, err)
	}
	return spec, nil
}
