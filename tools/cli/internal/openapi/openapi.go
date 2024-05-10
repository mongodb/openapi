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
	"github.com/getkin/kin-openapi/openapi3"
	"log"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/tufin/oasdiff/diff"
	"github.com/tufin/oasdiff/load"
)

type Parser interface {
	CreateOpenAPISpecFromPath(string) (*load.SpecInfo, error)
}

type Merger interface {
	MergeOpenAPISpecs([]string) (*Spec, error)
}

type Spec struct {
	OpenAPI      string                        `json:"openapi" yaml:"openapi"`
	Security     openapi3.SecurityRequirements `json:"security,omitempty" yaml:"security,omitempty"`
	Servers      openapi3.Servers              `json:"servers,omitempty" yaml:"servers,omitempty"`
	Tags         openapi3.Tags                 `json:"tags,omitempty" yaml:"tags,omitempty"`
	Info         *openapi3.Info                `json:"info" yaml:"info"`
	Paths        *openapi3.Paths               `json:"paths" yaml:"paths"`
	Components   *openapi3.Components          `json:"components,omitempty" yaml:"components,omitempty"`
	ExternalDocs *openapi3.ExternalDocs        `json:"externalDocs,omitempty" yaml:"externalDocs,omitempty"`
}

func (o *OasDiff) MergeOpenAPISpecs(paths []string) (*Spec, error) {
	for _, p := range paths {
		spec, err := o.parser.CreateOpenAPISpecFromPath(p)
		if err != nil {
			return nil, err
		}

		specDiff, err := diff.Get(o.config, o.base.Spec, spec.Spec)
		if err != nil {
			log.Fatalf("error in calculating the diff of the specs: %s", err)
			return nil, err
		}

		o.specDiff = specDiff
		o.external = spec
		o.base, err = o.mergeSpecIntoBase()
		if err != nil {
			return nil, err
		}
	}

	return newSpec(o.base), nil
}

func NewOasDiff(base string) (*OasDiff, error) {
	parser := NewOpenAPI3()
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
	}, nil
}

func newSpec(specInfo *load.SpecInfo) *Spec {
	return &Spec{
		OpenAPI:      specInfo.Spec.OpenAPI,
		Components:   specInfo.Spec.Components,
		Info:         specInfo.Spec.Info,
		Paths:        specInfo.Spec.Paths,
		Security:     specInfo.Spec.Security,
		Servers:      specInfo.Spec.Servers,
		Tags:         specInfo.Spec.Tags,
		ExternalDocs: specInfo.Spec.ExternalDocs,
	}
}
