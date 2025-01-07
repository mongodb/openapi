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

package openapi

import (
	"github.com/getkin/kin-openapi/openapi3"
	"github.com/tufin/oasdiff/load"
)

const (
	sunsetExtensionName     = "x-sunset"
	apiVersionExtensionName = "x-xgen-version"
)

type Sunset struct {
	Operation  string `json:"http_method" yaml:"http_method"`
	Path       string `json:"path" yaml:"path"`
	Version    string `json:"version" yaml:"version"`
	SunsetDate string `json:"sunset_date" yaml:"sunset_date"`
}

func NewSunsetListFromSpec(spec *load.SpecInfo) []*Sunset {
	var sunsets []*Sunset
	paths := spec.Spec.Paths

	for path, pathBody := range paths.Map() {
		for operationName, operationBody := range pathBody.Operations() {
			extensions := newExtensionsFrom2xxResponse(operationBody.Responses.Map())
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
			}

			sunsets = append(sunsets, &sunset)
		}
	}

	return sunsets
}

func newExtensionsFrom2xxResponse(responsesMap map[string]*openapi3.ResponseRef) map[string]any {
	if val, ok := responsesMap["200"]; ok {
		return newExtensionsFromContent(val.Value.Content)
	}
	if val, ok := responsesMap["201"]; ok {
		return newExtensionsFromContent(val.Value.Content)
	}
	if val, ok := responsesMap["202"]; ok {
		return newExtensionsFromContent(val.Value.Content)
	}
	if val, ok := responsesMap["204"]; ok {
		return newExtensionsFromContent(val.Value.Content)
	}

	return nil
}

func newExtensionsFromContent(content openapi3.Content) map[string]any {
	for _, v := range content {
		return v.Extensions
	}
	return nil
}
