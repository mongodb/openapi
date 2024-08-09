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

package changelog

import (
	"github.com/mongodb/openapi/tools/cli/internal/changelog/outputfilter"
	"github.com/mongodb/openapi/tools/cli/internal/openapi"
	"github.com/tufin/oasdiff/checker"
	"github.com/tufin/oasdiff/diff"
	"github.com/tufin/oasdiff/load"
)

const (
	deprecationDaysStable = 365 //  min days required between deprecating a stable resource and removing it
	deprecationDaysBeta   = 365 //  min days required between deprecating a beta resource and removing it
)

var breakingChangesAdditionalCheckers = []string{
	"response-non-success-status-removed",
	"api-operation-id-removed",
	"api-tag-removed",
	"response-property-enum-value-removed",
	"response-mediatype-enum-value-removed",
	"request-body-enum-value-removed",
	"api-schema-removed",
}

type Metadata struct {
	Base              *load.SpecInfo
	Revision          *load.SpecInfo //  the new spec to compare against the base
	Config            *checker.Config
	OasDiff           *openapi.OasDiff
	ExemptionFilePath string
}

func NewMetadata(base, revision, exemptionFilePath string) (*Metadata, error) {
	baseSpec, err := openapi.CreateNormalizedOpenAPISpecFromPath(base)
	if err != nil {
		return nil, err
	}

	revisionSpec, err := openapi.CreateNormalizedOpenAPISpecFromPath(revision)
	if err != nil {
		return nil, err
	}

	changelogConfig := checker.NewConfig(
		checker.GetAllChecks()).WithOptionalChecks(breakingChangesAdditionalCheckers).WithDeprecation(deprecationDaysBeta, deprecationDaysStable)

	return &Metadata{
		Base:              baseSpec,
		Revision:          revisionSpec,
		ExemptionFilePath: exemptionFilePath,
		Config:            changelogConfig,
		OasDiff: openapi.NewOasDiffWithSpecInfo(baseSpec, revisionSpec, &diff.Config{
			IncludePathParams: true,
		}),
	}, nil
}

func (s *Metadata) Check() ([]*outputfilter.Entry, error) {
	diffResult, err := s.OasDiff.NewDiffResult()
	if err != nil {
		return nil, err
	}

	changes := checker.CheckBackwardCompatibilityUntilLevel(
		s.Config,
		diffResult.Report,
		diffResult.SourceMap,
		checker.INFO)

	return outputfilter.NewChangelogEntries(changes, diffResult.SpecInfoPair, s.ExemptionFilePath)
}
