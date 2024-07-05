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
	"fmt"
	"regexp"
	"sort"

	"github.com/getkin/kin-openapi/openapi3"
)

// ExtractVersions extracts version strings from an OpenAPI specification.
func ExtractVersions(oas *openapi3.T) []string {
	versions := make(map[string]struct{})

	for _, pathItem := range oas.Paths.Map() {
		if pathItem == nil {
			continue
		}
		operations := []*openapi3.Operation{
			pathItem.Get, pathItem.Put, pathItem.Post,
			pathItem.Delete, pathItem.Options, pathItem.Head,
			pathItem.Patch, pathItem.Trace,
		}
		for _, op := range operations {
			if op == nil {
				continue
			}
			for _, response := range op.Responses.Map() {
				if response.Value.Content == nil {
					continue
				}
				for contentType := range response.Value.Content {
					version, err := parseVersion(contentType)
					if err == nil {
						versions[version] = struct{}{}
					}
				}
			}
		}
	}

	return mapKeysToSortedSlice(versions)
}

// parseVersion extracts the version date from the content type.
func parseVersion(contentType string) (string, error) {
	const pattern = `application/vnd\.atlas\.(\d{4})-(\d{2})-(\d{2})\+(.+)`
	re := regexp.MustCompile(pattern)
	matches := re.FindStringSubmatch(contentType)
	if matches == nil {
		return "", fmt.Errorf("invalid content type")
	}
	return fmt.Sprintf("%s-%s-%s", matches[1], matches[2], matches[3]), nil
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
