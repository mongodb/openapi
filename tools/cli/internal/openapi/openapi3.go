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
	"fmt"
	"os"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/tufin/oasdiff/load"
)

type OpenAPI3 struct {
	IsExternalRefsAllowed    bool
	CircularReferenceCounter int
	Loader                   *openapi3.Loader
}

func NewOpenAPI3() *OpenAPI3 {
	return &OpenAPI3{
		IsExternalRefsAllowed:    true,
		CircularReferenceCounter: 10,
		Loader:                   openapi3.NewLoader(),
	}
}

func (o *OpenAPI3) CreateOpenAPISpecFromPath(path string) (*load.SpecInfo, error) {
	openapi3.CircularReferenceCounter = o.CircularReferenceCounter
	o.Loader.IsExternalRefsAllowed = o.IsExternalRefsAllowed
	dir, err := os.Getwd()
	if err != nil {
		fmt.Println("Error:", err)
	}
	fmt.Println("dir:", dir)

	spec, err := load.NewSpecInfo(o.Loader, load.NewSource(path))
	if err != nil {
		return nil, err
	}

	return spec, nil
}
