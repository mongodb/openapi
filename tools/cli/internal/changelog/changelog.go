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
	"encoding/json"
	"os"
	"time"

	"github.com/mongodb/openapi/tools/cli/internal/openapi"
	"github.com/tufin/oasdiff/checker"
	"github.com/tufin/oasdiff/diff"
	"github.com/tufin/oasdiff/load"
)

const (
	deprecationDaysStable = 365 //  min days required between deprecating a stable resource and removing it
	deprecationDaysBeta   = 365 //  min days required between deprecating a beta resource and removing it
	stabilityLevelStable  = "stable"
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
	Base              *load.SpecInfo //  the base spec to compare against the revision
	Revision          *load.SpecInfo //  the new spec to compare against the base
	Config            *checker.Config
	OasDiff           *openapi.OasDiff
	BaseChangelog     []*Entry //  the base changelog entries
	RunDate           string
	ExemptionFilePath string
}

type Entry struct {
	Date  string  `json:"date"`
	Paths []*Path `json:"paths"`
}

type Path struct {
	URI            string     `json:"path"`
	HTTPMethod     string     `json:"httpMethod"`
	StabilityLevel string     `json:"stabilityLevel"`
	ChangeType     string     `json:"changeType"`
	OperationID    string     `json:"operationId"`
	Tag            string     `json:"tag"`
	Versions       []*Version `json:"versions,omitempty"`
	Changes        []Change   `json:"changes,omitempty"`
}

type Version struct {
	Version        string    `json:"version"`
	StabilityLevel string    `json:"stabilityLevel"`
	ChangeType     string    `json:"changeType"`
	Changes        []*Change `json:"changes"`
}

type Change struct {
	Description        string `json:"change"`
	Code               string `json:"changeCode"`
	BackwardCompatible bool   `json:"backwardCompatible"`
	HideFromChangelog  bool   `json:"hideFromChangelog,omitempty"`
}

func NewMetadata(base, revision, exemptionFilePath string, baseChangelog []*Entry) (*Metadata, error) {
	loader := openapi.NewOpenAPI3().WithExcludedPrivatePaths()
	baseSpec, err := loader.CreateOpenAPISpecFromPath(base)
	if err != nil {
		return nil, err
	}

	revisionSpec, err := loader.CreateOpenAPISpecFromPath(revision)
	if err != nil {
		return nil, err
	}

	changelogConfig := checker.NewConfig(
		checker.GetAllChecks()).WithOptionalChecks(breakingChangesAdditionalCheckers).WithDeprecation(deprecationDaysBeta, deprecationDaysStable)

	return &Metadata{
		RunDate:           time.Now().Format("2006-01-02"),
		Base:              baseSpec,
		Revision:          revisionSpec,
		ExemptionFilePath: exemptionFilePath,
		Config:            changelogConfig,
		BaseChangelog:     baseChangelog,
		OasDiff: openapi.NewOasDiffWithSpecInfo(baseSpec, revisionSpec, &diff.Config{
			IncludePathParams: true,
		}),
	}, nil
}

func NewChangelogEntries(path string) ([]*Entry, error) {
	contents, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	var entries []*Entry
	if err := json.Unmarshal(contents, &entries); err != nil {
		return nil, err
	}

	return entries, nil
}

func NewMetadataWithNormalizedSpecs(base, revision, exemptionFilePath string, baseChangelog []*Entry) (*Metadata, error) {
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
		RunDate:           time.Now().Format("2006-01-02"),
		Base:              baseSpec,
		Revision:          revisionSpec,
		ExemptionFilePath: exemptionFilePath,
		Config:            changelogConfig,
		BaseChangelog:     baseChangelog,
		OasDiff: openapi.NewOasDiffWithSpecInfo(baseSpec, revisionSpec, &diff.Config{
			IncludePathParams: true,
		}),
	}, nil
}
