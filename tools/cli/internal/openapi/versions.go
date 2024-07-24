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
package openapi

import (
	"sort"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/mongodb/openapi/tools/cli/internal/apiversion"
	"github.com/mongodb/openapi/tools/cli/internal/openapi/filter"
)

// ExtractVersions extracts version strings from an OpenAPI specification.
func ExtractVersions(oas *openapi3.T, env string) ([]string, error) {
	// We need to remove the version that are hidden for the given environment
	if err := filter.ApplyFiltersWithInit(oas, filter.NewMetadata(nil, env), func(oas *openapi3.T, metadata *filter.Metadata) []filter.Filter {
		return []filter.Filter{
			filter.InitHiddenEnvsFilter(oas, metadata),
		}
	}); err != nil {
		return nil, nil
	}

	versions := make(map[string]struct{})
	for _, pathItem := range oas.Paths.Map() {
		if pathItem == nil {
			continue
		}
		for _, op := range pathItem.Operations() {
			if op == nil {
				continue
			}
			for _, response := range op.Responses.Map() {
				if response.Value == nil || response.Value.Content == nil {
					continue
				}
				for contentType := range response.Value.Content {
					version, err := apiversion.Parse(contentType)
					if err == nil {
						versions[version] = struct{}{}
					}
				}
			}
		}
	}
	return mapKeysToSortedSlice(versions), nil
}

// mapKeysToSortedSlice converts map keys to a sorted slice.
func mapKeysToSortedSlice(m map[string]struct{}) []string {
	keys := make([]string, 0, len(m))
	for key := range m {
		keys = append(keys, key)
	}
	sort.Strings(keys)
	return keys
}
