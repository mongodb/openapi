package openapi

import (
	"github.com/tufin/oasdiff/load"
)

type Merger interface {
	Merge([]string) (*load.SpecInfo, error)
}

type Parser interface {
	CreateOpenAPISpecFromPath(string) (*load.SpecInfo, error)
}
