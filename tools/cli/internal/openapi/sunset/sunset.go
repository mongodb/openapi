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
	"sort"

	"github.com/oasdiff/kin-openapi/openapi3"
	"github.com/oasdiff/oasdiff/load"
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
			extensionsList := successResponseExtensions(operationBody.Responses.Map())

			for _, extensions := range extensionsList {
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
	}

	sort.Slice(sunsets, func(i, j int) bool {
		if sunsets[i].SunsetDate != sunsets[j].SunsetDate {
			return sunsets[i].SunsetDate < sunsets[j].SunsetDate
		}
		return sunsets[i].Version < sunsets[j].Version
	})

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
func successResponseExtensions(responsesMap map[string]*openapi3.ResponseRef) []map[string]any {
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

// contentExtensions extracts extensions from all OpenAPI content entries that have a sunset extension.
//
// The function iterates over all content entries and returns the extensions for each entry
// that contains a sunset extension, allowing multiple API versions with different sunset
// dates to be tracked independently.
//
// Parameters:
//   - content: An OpenAPI content map with media types as keys and schema objects as values
//
// Returns:
//   - A slice of extension maps, one per content entry that has a sunset extension,
//     or nil if no entries have sunset extensions
func contentExtensions(content openapi3.Content) []map[string]any {
	var result []map[string]any
	for _, mediaType := range content {
		if mediaType.Extensions == nil {
			continue
		}
		if _, ok := mediaType.Extensions[sunsetExtensionName]; !ok {
			continue
		}
		result = append(result, mediaType.Extensions)
	}
	return result
}
