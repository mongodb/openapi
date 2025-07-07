// Copyright 2025 MongoDB Inc
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

package sunset

import (
	"maps"
	"regexp"
	"slices"
	"sort"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/tufin/oasdiff/load"
)

const (
	sunsetExtensionName     = "x-sunset"
	apiVersionExtensionName = "x-xgen-version"
	teamExtensionName       = "x-xgen-owner-team"
)

type Sunset struct {
	Operation  string `json:"http_method" yaml:"http_method"`
	Path       string `json:"path" yaml:"path"`
	Version    string `json:"version" yaml:"version"`
	SunsetDate string `json:"sunset_date" yaml:"sunset_date"`
	Team       string `json:"team" yaml:"team"`
}

func NewListFromSpec(spec *load.SpecInfo) []*Sunset {
	var sunsets []*Sunset
	paths := spec.Spec.Paths

	for path, pathBody := range paths.Map() {
		for operationName, operationBody := range pathBody.Operations() {
			teamName := teamName(operationBody)
			extensions := successResponseExtensions(operationBody.Responses.Map())
			if extensions == nil {
				continue
			}

			apiVersion, ok := extensions[apiVersionExtensionName]
			if !ok {
				continue
			}

			sunsetExt, ok := extensions[sunsetExtensionName]
			if !ok {
				continue
			}

			sunset := Sunset{
				Operation:  operationName,
				Path:       path,
				SunsetDate: sunsetExt.(string),
				Version:    apiVersion.(string),
				Team:       teamName,
			}

			sunsets = append(sunsets, &sunset)
		}
	}

	return sunsets
}

func teamName(op *openapi3.Operation) string {
	if value, ok := op.Extensions[teamExtensionName]; ok {
		return value.(string)
	}
	return ""
}

// successResponseExtensions searches through a map of response objects for successful HTTP status
// codes (200, 201, 202, 204) and returns the extensions from the content of the first successful
// response found.
//
// The function prioritizes responses in the following order: 200, 201, 202, 204. For each found
// response, it extracts extensions from its content using the contentExtensions helper function.
//
// Parameters:
//   - responsesMap: A map of HTTP status codes to OpenAPI response objects
//
// Returns:
//   - A map of extension names to their values from the first successful response content,
//     or nil if no successful responses are found or if none contain relevant extensions
func successResponseExtensions(responsesMap map[string]*openapi3.ResponseRef) map[string]any {
	if val, ok := responsesMap["200"]; ok {
		return contentExtensions(val.Value.Content)
	}
	if val, ok := responsesMap["201"]; ok {
		return contentExtensions(val.Value.Content)
	}
	if val, ok := responsesMap["202"]; ok {
		return contentExtensions(val.Value.Content)
	}
	if val, ok := responsesMap["204"]; ok {
		return contentExtensions(val.Value.Content)
	}

	return nil
}

// contentExtensions extracts extensions from OpenAPI content objects, prioritizing content entries
// with the oldest date in their keys.
//
// The function sorts content keys by date (in YYYY-MM-DD format) if present, with older dates taking
// precedence. If multiple keys contain dates, it selects the entry with the earliest date. If no dates
// are found, it selects the first content entry that would sort before entries with dates.
//
// Parameters:
//   - content: An OpenAPI content map with media types as keys and schema objects as values
//
// Returns:
//   - A map of extension names to their values from the selected content entry,
//     or nil if the content map is empty or the selected entry has no extensions
func contentExtensions(content openapi3.Content) map[string]any {
	keysContent := slices.Collect(maps.Keys(content))
	// Regex to find a date in YYYY-MM-DD format.
	dateRegex := regexp.MustCompile(`\d{4}-\d{2}-\d{2}`)
	// we need the content of the API version with the older date.
	sort.Slice(keysContent, func(i, j int) bool {
		dateI := dateRegex.FindString(keysContent[i])
		dateJ := dateRegex.FindString(keysContent[j])

		// If both have dates, compare them as strings.
		if dateI != "" && dateJ != "" {
			return dateI < dateJ
		}
		// Strings with dates should come before those without.
		return dateI != ""
	})

	return content[keysContent[0]].Extensions
}
