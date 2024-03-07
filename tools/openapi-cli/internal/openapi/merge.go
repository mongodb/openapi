package openapi

import (
	"fmt"
	"github.com/tufin/oasdiff/diff"
	"github.com/tufin/oasdiff/load"
	"os"
)

type Merger interface {
	Merge([]string) (*load.SpecInfo, error)
}

func (o OasDiffMerge) Merge(paths []string) (*load.SpecInfo, error) {
	for _, p := range paths {
		spec, err := NewSpecInfo(p)
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
