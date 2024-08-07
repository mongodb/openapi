// Copyright 2024 MongoDB Inc
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package openapi

import (
	"os"
	"regexp"
	"strings"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/tufin/oasdiff/load"
)

const publicPathPrefix = "api/atlas/v2"

type OpenAPI3 struct {
	IsExternalRefsAllowed    bool
	ExcludePrivatePaths      bool
	CircularReferenceCounter int
	Loader                   *openapi3.Loader
}

func NewOpenAPI3() *OpenAPI3 {
	return &OpenAPI3{
		IsExternalRefsAllowed: true,
		Loader:                openapi3.NewLoader(),
		ExcludePrivatePaths:   false,
	}
}

func NewOpenAPI3WithExcludePrivatePaths(excludePrivatePaths bool) *OpenAPI3 {
	return &OpenAPI3{
		IsExternalRefsAllowed: true,
		Loader:                openapi3.NewLoader(),
		ExcludePrivatePaths:   excludePrivatePaths,
	}
}

func (o *OpenAPI3) CreateOpenAPISpecFromPath(path string) (*load.SpecInfo, error) {
	o.Loader.IsExternalRefsAllowed = o.IsExternalRefsAllowed
	spec, err := load.NewSpecInfo(o.Loader, load.NewSource(path))
	if err != nil {
		return nil, err
	}

	if o.ExcludePrivatePaths {
		removePrivatePaths(spec.Spec)
	}
	return spec, nil
}

// CreateNormalizedOpenAPISpecFromPath reads the OpenAPI spec from the given path and normalizes it by replacing
// versioned media types (e.g. application/vnd.atlas.2023-01-01) with standard media types (e.g. application/json)..
func CreateNormalizedOpenAPISpecFromPath(path string) (*load.SpecInfo, error) {
	sourceContent, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	spec, err := openapi3.NewLoader().LoadFromData([]byte(normalizeMediaType(sourceContent)))
	if err != nil {
		return nil, err
	}
	return &load.SpecInfo{
		Spec: spec,
	}, nil
}

// normalizeMediaType replaces versioned media types (e.g. application/vnd.atlas.2023-01-01) with standard media types (e.g. application/json).
func normalizeMediaType(sourceFile []byte) string {
	re := regexp.MustCompile(`application/vnd\.atlas\.\d{4}-\d{2}-\d{2}\+(\w)`)
	return re.ReplaceAllStringFunc(string(sourceFile), func(match string) string {
		submatches := re.FindStringSubmatch(match)
		if len(submatches) > 1 {
			return "application/" + submatches[1]
		}
		return match
	})
}

func removePrivatePaths(spec *openapi3.T) {
	for path := range spec.Paths.Map() {
		if strings.Contains(path, publicPathPrefix) {
			continue
		}
		spec.Paths.Delete(path)
	}
}
