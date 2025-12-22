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

package filter

import (
	"log"
	"maps"
	"strings"

	"github.com/getkin/kin-openapi/openapi3"
)

type ParametersFilter struct {
	oas *openapi3.T
}

func (*ParametersFilter) ValidateMetadata() error {
	return nil
}

func (f *ParametersFilter) Apply() error {
	if f.oas.Paths == nil {
		return nil
	}

	if f.oas.Components == nil || f.oas.Components.Parameters == nil {
		return nil
	}

	oasSpecAsBytes, err := f.oas.MarshalJSON()
	if err != nil {
		return err
	}

	spec := string(oasSpecAsBytes)
	parametersToDelete := make([]string, 0)
	for k := range f.oas.Components.Parameters {
		ref := "#/components/parameters/" + k
		if !strings.Contains(spec, ref) {
			parametersToDelete = append(parametersToDelete, k)
		}
	}

	for _, parameterToDelete := range parametersToDelete {
		log.Printf("Deleting unused parameter: %q", parameterToDelete)
		maps.DeleteFunc(f.oas.Components.Parameters, func(k string, _ *openapi3.ParameterRef) bool {
			return k == parameterToDelete
		})
	}

	return nil
}
