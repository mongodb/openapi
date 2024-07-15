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
	"github.com/getkin/kin-openapi/openapi3"
	"github.com/mongodb/openapi/tools/cli/internal/apiversion"
)

//go:generate mockgen -destination=../filter/mock_filter.go -package=filter github.com/mongodb/openapi/tools/cli/internal/openapi/filter Filter
type Filter interface {
	Apply(doc *openapi3.T, metadata *Metadata) error
}

type Metadata struct {
	targetVersion *apiversion.APIVersion
	targetEnv     string
}

var filters = map[string]Filter{
	"path":       &PathFilter{},
	"hiddenEnvs": &HiddenEnvsFilter{},
}

func NewMetadata(targetVersion *apiversion.APIVersion, targetEnv string) *Metadata {
	return &Metadata{
		targetVersion: targetVersion,
		targetEnv:     targetEnv,
	}
}

func ApplyFilters(doc *openapi3.T, metadata *Metadata) error {
	for _, filter := range filters {
		if err := filter.Apply(doc, metadata); err != nil {
			return err
		}
	}
	return nil
}
