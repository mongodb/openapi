// Copyright 2024 MongoDB Inc
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package openapi

//go:generate mockgen -destination=../openapi/mock_oasdiff_result.go -package=openapi github.com/mongodb/openapi/tools/cli/internal/openapi DiffGetter
import (
	"github.com/getkin/kin-openapi/openapi3"
	"github.com/tufin/oasdiff/diff"
	"github.com/tufin/oasdiff/flatten/allof"
	"github.com/tufin/oasdiff/load"
)

type OasDiffResult struct {
	Report       *diff.Diff
	SourceMap    *diff.OperationsSourcesMap
	SpecInfoPair *load.SpecInfoPair
	Config       *diff.Config
}

// DiffGetter defines an interface for getting diffs.
type DiffGetter interface {
	Get(config *diff.Config, base, revision *openapi3.T) (*diff.Diff, error)
	GetWithOperationsSourcesMap(config *diff.Config, base, revision *load.SpecInfo) (*diff.Diff, *diff.OperationsSourcesMap, error)
}

// GetSimpleDiff returns the diff between two OpenAPI specs.
func (o OasDiff) GetSimpleDiff(base, revision *load.SpecInfo) (*OasDiffResult, error) {
	diffReport, err := o.diffGetter.Get(o.config, base.Spec, revision.Spec)
	if err != nil {
		return nil, err
	}

	return &OasDiffResult{
		Report:       diffReport,
		SourceMap:    nil,
		SpecInfoPair: load.NewSpecInfoPair(base, revision),
		Config:       o.config,
	}, nil
}

// GetFlattenedDiff returns the diff between two OpenAPI specs after flattening them.
func (o OasDiff) GetFlattenedDiff(base, revision *load.SpecInfo) (*OasDiffResult, error) {
	flattenBaseSpec, err := allof.MergeSpec(base.Spec)
	if err != nil {
		return nil, err
	}

	baseSpecInfo := &load.SpecInfo{
		Spec:    flattenBaseSpec,
		Url:     base.Url,
		Version: base.GetVersion(),
	}

	flattenExternalSpec, err := allof.MergeSpec(revision.Spec)
	if err != nil {
		return nil, err
	}

	revisionSpecInfo := &load.SpecInfo{
		Spec:    flattenExternalSpec,
		Url:     revision.Url,
		Version: revision.GetVersion(),
	}

	diffReport, operationsSources, err := o.diffGetter.GetWithOperationsSourcesMap(o.config, baseSpecInfo, revisionSpecInfo)
	if err != nil {
		return nil, err
	}

	return &OasDiffResult{
		Report:       diffReport,
		SourceMap:    operationsSources,
		SpecInfoPair: load.NewSpecInfoPair(baseSpecInfo, revisionSpecInfo),
		Config:       o.config,
	}, nil
}

// GetDiffWithConfig returns the diff between two OpenAPI specs with a custom config.
func (o OasDiff) GetDiffWithConfig(base, revision *load.SpecInfo, config *diff.Config) (*OasDiffResult, error) {
	diffReport, err := o.diffGetter.Get(config, base.Spec, revision.Spec)
	if err != nil {
		return nil, err
	}

	return &OasDiffResult{
		Report:       diffReport,
		SourceMap:    nil,
		SpecInfoPair: load.NewSpecInfoPair(base, revision),
		Config:       config,
	}, nil
}
