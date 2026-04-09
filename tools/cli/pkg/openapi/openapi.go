// Copyright 2026 MongoDB Inc
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

// Package openapi provides public interfaces for loading and saving OpenAPI specifications.
// This package wraps the internal openapi package to provide a stable public API.
package openapi

import (
	"github.com/mongodb/openapi/tools/cli/internal/openapi"
	"github.com/oasdiff/kin-openapi/openapi3"
	"github.com/oasdiff/oasdiff/load"
	"github.com/spf13/afero"
)

// Loader provides methods for loading OpenAPI specifications from files.
type Loader struct {
	impl *openapi.OpenAPI3
}

// NewLoader creates a new OpenAPI loader.
func NewLoader() *Loader {
	return &Loader{
		impl: openapi.NewOpenAPI3(),
	}
}

// LoadFromPath loads an OpenAPI spec from the given file path.
func (l *Loader) LoadFromPath(path string) (*load.SpecInfo, error) {
	return l.impl.CreateOpenAPISpecFromPath(path)
}

// SaveToFile saves an OpenAPI spec to a file in the specified format.
// Format can be "json", "yaml", or "all".
func SaveToFile(path, format string, spec *openapi3.T, fs afero.Fs) error {
	return openapi.Save(path, spec, format, fs)
}
