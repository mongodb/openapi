package openapi

import (
	"fmt"
	"mongodb/openapi/tools/cli/internal/openapi/errors"
	"os"

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

func NewOasDiff(base *load.SpecInfo) *OasDiff {
	return &OasDiff{
		base:   base,
		parser: NewOpenAPI3(),
	}
}

func (o *OasDiff) MergeOpenAPISpecs(paths []string) (*load.SpecInfo, error) {
	for _, p := range paths {
		spec, err := o.parser.CreateOpenAPISpecFromPath(p)
		if err != nil {
			return nil, err
		}

		o.config = &diff.Config{
			IncludePathParams: true,
		}

		specDiff, err := diff.Get(o.config, o.base.Spec, spec.Spec)
		if err != nil {
			_, _ = fmt.Fprintf(os.Stderr, "error in calculating the diff of the specs: %s", err)
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
	for k, v := range pathsToMerge {
		if _, ok := basePaths[k]; !ok {
			basePaths[k] = v
		} else {
			return errors.PathConflictError{
				Entry: k,
			}
		}
	}

	o.base.Spec.Paths = basePaths
	return nil
}
