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

//go:generate mockgen -destination=../openapi/mock_openapi.go -package=openapi github.com/mongodb/openapi/tools/cli/internal/openapi Parser,Merger
import (
	"encoding/json"
	"log"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/oasdiff/oasdiff/diff"
	"github.com/oasdiff/oasdiff/load"
)

// Spec is a struct is a 1-to-1 copy of the Spec struct in the openapi3 package.
// We need this to override the order of the fields in the struct.
type Spec struct {
	Extensions   map[string]any                `json:"-" yaml:"-"`
	OpenAPI      string                        `json:"openapi" yaml:"openapi"`
	Security     openapi3.SecurityRequirements `json:"security,omitempty" yaml:"security,omitempty"`
	Servers      openapi3.Servers              `json:"servers,omitempty" yaml:"servers,omitempty"`
	Tags         openapi3.Tags                 `json:"tags,omitempty" yaml:"tags,omitempty"`
	Info         *openapi3.Info                `json:"info" yaml:"info"`
	Paths        *openapi3.Paths               `json:"paths" yaml:"paths"`
	Components   *openapi3.Components          `json:"components,omitempty" yaml:"components,omitempty"`
	ExternalDocs *openapi3.ExternalDocs        `json:"externalDocs,omitempty" yaml:"externalDocs,omitempty"`
}
type Parser interface {
	CreateOpenAPISpecFromPath(string) (*load.SpecInfo, error)
}

type Merger interface {
	MergeOpenAPISpecs([]string) (*Spec, error)
}

func (o *OasDiff) MergeOpenAPISpecs(paths []string) (*Spec, error) {
	for _, p := range paths {
		spec, err := o.parser.CreateOpenAPISpecFromPath(p)
		if err != nil {
			return nil, err
		}
		o.result, err = o.GetSimpleDiff(o.base, spec)
		if err != nil {
			log.Fatalf("error in calculating the diff of the specs: %s", err)
			return nil, err
		}

		o.external = spec
		o.base, err = o.mergeSpecIntoBase()
		if err != nil {
			return nil, err
		}
	}

	return newSpec(o.base.Spec), nil
}

func NewOasDiff(base string, excludePrivatePaths bool) (*OasDiff, error) {
	parser := NewOpenAPI3()
	if excludePrivatePaths {
		parser.WithExcludedPrivatePaths()
	}

	baseSpec, err := parser.CreateOpenAPISpecFromPath(base)
	if err != nil {
		return nil, err
	}

	return &OasDiff{
		base:   baseSpec,
		parser: parser,
		config: &diff.Config{
			IncludePathParams: true,
		},
		diffGetter: NewResultGetter(),
	}, nil
}

func NewOasDiffWithSpecInfo(base, external *load.SpecInfo, config *diff.Config) *OasDiff {
	return &OasDiff{
		base:       base,
		external:   external,
		config:     config,
		diffGetter: NewResultGetter(),
	}
}

func newSpec(spec *openapi3.T) *Spec {
	return &Spec{
		Extensions:   spec.Extensions,
		OpenAPI:      spec.OpenAPI,
		Components:   spec.Components,
		Info:         spec.Info,
		Paths:        spec.Paths,
		Security:     spec.Security,
		Servers:      spec.Servers,
		Tags:         spec.Tags,
		ExternalDocs: spec.ExternalDocs,
	}
}

// MarshalJSON returns the JSON encoding of Spec.
// We need a custom definition of MarshalJSON to include support for
// Extensions   map[string]any                `json:"-" yaml:"-"` where
// we only what to serialize the value of the field.
func (doc *Spec) MarshalJSON() ([]byte, error) {
	x, err := doc.MarshalYAML()
	if err != nil {
		return nil, err
	}
	return json.Marshal(x)
}

// MarshalYAML returns the YAML encoding of Spec.
func (doc *Spec) MarshalYAML() (any, error) {
	if doc == nil {
		return nil, nil
	}
	m := make(map[string]any, 4+len(doc.Extensions))
	for k, v := range doc.Extensions {
		m[k] = v
	}
	m["openapi"] = doc.OpenAPI
	if x := doc.Components; x != nil {
		m["components"] = x
	}
	m["info"] = doc.Info
	m["paths"] = doc.Paths
	if x := doc.Security; len(x) != 0 {
		m["security"] = x
	}
	if x := doc.Servers; len(x) != 0 {
		m["servers"] = x
	}
	if x := doc.Tags; len(x) != 0 {
		m["tags"] = x
	}
	if x := doc.ExternalDocs; x != nil {
		m["externalDocs"] = x
	}
	return m, nil
}
