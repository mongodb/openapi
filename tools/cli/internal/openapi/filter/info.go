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
	"fmt"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/mongodb/openapi/tools/cli/internal/apiversion"
)

// Filter: InfoFilter is a filter that modifies the Info object in the OpenAPI spec.
type InfoFilter struct {
	oas      *openapi3.T
	metadata *Metadata
}

func (f *InfoFilter) Apply() error {
	if f.oas.Info == nil {
		return nil
	}

	if f.oas.Info.Description != "" {
		f.oas.Info.Description = replaceVersion(f.oas.Info.Description, f.metadata.targetVersion)
	}

	return nil
}

func replaceVersion(input string, v *apiversion.APIVersion) string {
	matches := apiversion.ContentPattern.FindStringSubmatch(input)
	if matches == nil {
		return input // No match found, return the original string
	}

	replacement := fmt.Sprintf("application/vnd.atlas.%s+%s", v.String(), matches[4])
	return apiversion.ContentPattern.ReplaceAllString(input, replacement)
}
