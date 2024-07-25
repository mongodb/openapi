// Copyright 2024 MongoDB Inc
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//	http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
package filter

import (
	"encoding/json"
	"errors"
	"fmt"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/mongodb/openapi/tools/cli/internal/apiversion"
)

//go:generate mockgen -destination=../filter/mock_filter.go -package=filter github.com/mongodb/openapi/tools/cli/internal/openapi/filter Filter
type Filter interface {
	Apply() error
}

type Metadata struct {
	targetVersion *apiversion.APIVersion
	targetEnv     string
}

func NewMetadata(targetVersion *apiversion.APIVersion, targetEnv string) *Metadata {
	return &Metadata{
		targetVersion: targetVersion,
		targetEnv:     targetEnv,
	}
}

func validateMetadata(metadata *Metadata) error {
	if metadata == nil {
		return errors.New("metadata is nil")
	}

	return nil
}

func DefaultFilters(oas *openapi3.T, metadata *Metadata) []Filter {
	return []Filter{
		&SunsetFilter{oas: oas, metadata: metadata},
		&VersioningFilter{oas: oas, metadata: metadata},
		&InfoFilter{oas: oas, metadata: metadata},
		&HiddenEnvsFilter{oas: oas, metadata: metadata},
		&TagsFilter{oas: oas},
		&OperationsFilter{oas: oas},
	}
}

// FiltersToGetVersions returns a list of filters to apply to the OpenAPI document to get the versions.
func FiltersToGetVersions(oas *openapi3.T, metadata *Metadata) []Filter {
	return []Filter{
		&HiddenEnvsFilter{oas: oas, metadata: metadata},
	}
}

func ApplyFilters(doc *openapi3.T, metadata *Metadata, filters func(oas *openapi3.T, metadata *Metadata) []Filter) (*openapi3.T, error) {
	if doc == nil {
		return nil, errors.New("openapi document is nil")
	}

	if err := validateMetadata(metadata); err != nil {
		return nil, err
	}

	// make a copy of the oas to avoid modifying the original document when applying filters
	oas, err := duplicateOas(doc)
	if err != nil {
		return nil, err
	}

	for _, filter := range filters(oas, metadata) {
		if err := filter.Apply(); err != nil {
			return nil, err
		}
	}

	return oas, nil
}

func duplicateOas(doc *openapi3.T) (*openapi3.T, error) {
	// Marshal the original document to JSON
	jsonData, err := json.Marshal(doc)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal original OpenAPI specification: %w", err)
	}

	// Unmarshal the JSON data into a new OpenAPI document
	duplicateDoc := &openapi3.T{}
	err = json.Unmarshal(jsonData, duplicateDoc)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal duplicated OpenAPI specification: %w", err)
	}

	return duplicateDoc, nil
}
