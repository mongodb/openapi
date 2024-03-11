package openapi

import (
	"log"

	"github.com/mongodb/openapi/tools/cli/internal/openapi/errors"

	"github.com/tufin/oasdiff/diff"
	"github.com/tufin/oasdiff/load"
)

type OasDiff struct {
	base     *load.SpecInfo
	external *load.SpecInfo
	config   *diff.Config
	specDiff *diff.Diff
	parser   Parser
}

func NewOasDiff(base string) (*OasDiff, error) {
	parser := NewOpenAPI3()
	baseSpec, err := parser.CreateOpenAPISpecFromPath(base)
	if err != nil {
		return nil, err
	}

	return &OasDiff{
		base:   baseSpec,
		parser: parser,
		config: &diff.Config{
			IncludePathParams: true,
		},
	}, nil
}

func (o *OasDiff) MergeOpenAPISpecs(paths []string) (*load.SpecInfo, error) {
	for _, p := range paths {
		spec, err := o.parser.CreateOpenAPISpecFromPath(p)
		if err != nil {
			return nil, err
		}

		specDiff, err := diff.Get(o.config, o.base.Spec, spec.Spec)
		if err != nil {
			log.Fatalf("error in calculating the diff of the specs: %s", err)
			return nil, err
		}

		o.specDiff = specDiff
		o.external = spec
		err = o.mergeSpecIntoBase()
		if err != nil {
			return nil, err
		}
	}

	return o.base, nil
}

func (o OasDiff) mergeSpecIntoBase() error {
	return o.mergePaths()
}

func (o OasDiff) mergePaths() error {
	pathsToMerge := o.external.Spec.Paths
	basePaths := o.base.Spec.Paths
	for k, v := range pathsToMerge.Map() {
		if ok := basePaths.Value(k); ok == nil {
			basePaths.Set(k, v)
		} else {
			return errors.PathConflictError{
				Entry: k,
			}
		}
	}

	o.base.Spec.Paths = basePaths
	return nil
}
