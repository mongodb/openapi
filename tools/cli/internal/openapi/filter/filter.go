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
	"errors"

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

var filters = map[string]Filter{}

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

	if metadata.targetVersion == nil {
		return errors.New("target version is nil")
	}

	return nil
}

func initFilters(oas *openapi3.T, metadata *Metadata) error {
	if oas == nil {
		return errors.New("openapi document is nil")
	}

	if err := validateMetadata(metadata); err != nil {
		return err
	}

	filters["path"] = &PathFilter{
		oas:      oas,
		metadata: metadata,
	}

	filters["info"] = &InfoFilter{
		oas:      oas,
		metadata: metadata,
	}

	filters["hidden_envs"] = &HiddenEnvsFilter{
		oas:      oas,
		metadata: metadata,
	}

	return nil
}

func ApplyFilters(doc *openapi3.T, metadata *Metadata) error {
	if err := initFilters(doc, metadata); err != nil {
		return err
	}

	for _, filter := range filters {
		if err := filter.Apply(); err != nil {
			return err
		}
	}
	return nil
}
