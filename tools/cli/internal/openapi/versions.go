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
	"errors"
	"fmt"
	"sort"
	"strings"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/mongodb/openapi/tools/cli/internal/apiversion"
	"github.com/mongodb/openapi/tools/cli/internal/openapi/filter"
)

// ExtractVersionsWithEnv extracts API version Content Type strings from the given OpenAPI specification and environment.
// When env is not set, the function returns the API Versions from all the environments.
func ExtractVersionsWithEnv(oas *openapi3.T, env string) ([]string, error) {
	if env == "" {
		return extractVersions(oas)
	}

	// We need to remove the version that are hidden for the given environment
	doc, err := filter.ApplyFilters(oas, filter.NewMetadata(nil, env), filter.FiltersToGetVersions)
	if err != nil {
		return nil, err
	}

	return extractVersions(doc)
}

// extractVersions extracts version strings from an OpenAPI specification.
func extractVersions(oas *openapi3.T) ([]string, error) {
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
				for contentType, contentTypeValue := range response.Value.Content {
					version, err := apiversion.Parse(contentType)
					if err != nil {
						continue
					}

					if apiversion.IsPreviewSabilityLevel(version) {
						// parse if it is public or not
						version, err = getPreviewVersionName(contentTypeValue)
						if err != nil {
							fmt.Printf("failed to parse preview version name: %v\n", err)
							continue
						}
					}

					versions[version] = struct{}{}
				}
			}
		}
	}

	return mapKeysToSortedSlice(versions), nil
}

func getPreviewVersionName(contentTypeValue *openapi3.MediaType) (name string, err error) {
	public, name, err := parsePreviewExtensionData(contentTypeValue)
	if err != nil {
		return "", err
	}

	if public {
		return "preview", nil
	}

	if !public && name != "" {
		return "private-preview-" + name, nil
	}

	return "", errors.New("no preview extension found")
}

func parsePreviewExtensionData(contentTypeValue *openapi3.MediaType) (public bool, name string, err error) {
	// Expected formats:
	//
	//   "x-xgen-preview": {
	// 		"name": "api-registry-private-preview"
	//   }
	//
	//   "x-xgen-preview": {
	// 		"public": "true"
	//   }

	name = ""
	public = false

	if contentTypeValue.Extensions == nil {
		return false, "", errors.New("no preview extension found")
	}

	previewExtension, ok := contentTypeValue.Extensions["x-xgen-preview"]
	if !ok {
		return false, "", errors.New("no preview extension found")
	}

	previewExtensionMap, ok := previewExtension.(map[string]any)
	if !ok {
		return false, "", errors.New("no preview extension found")
	}

	// Reading if it's public or not
	publicV, ok := previewExtensionMap["public"].(string)
	if ok {
		public = strings.EqualFold(publicV, "true")
	}

	// Reading the name
	nameV, ok := previewExtensionMap["name"].(string)
	if ok {
		name = nameV
	}

	return public, name, nil
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
