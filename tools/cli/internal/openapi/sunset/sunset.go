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

func contentExtensions(content openapi3.Content) map[string]any {
	for _, v := range content {
		return v.Extensions
	}
	return nil
}
