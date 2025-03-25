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
	"maps"
	"strings"

	"github.com/getkin/kin-openapi/openapi3"
)

const sunsetToBeDecided = "9999-12-31"

// SunsetFilter removes the sunsetToBeDecided from the openapi specification.
type SunsetFilter struct {
	oas *openapi3.T
}

func (*SunsetFilter) ValidateMetadata() error {
	return nil
}

func (f *SunsetFilter) Apply() error {
	if f.oas.Paths == nil {
		return nil
	}

	for _, pathItem := range f.oas.Paths.Map() {
		for _, operation := range pathItem.Operations() {
			if operation.Responses == nil {
				continue
			}

			applyOnOperation(operation)
		}
	}
	return nil
}

func applyOnOperation(op *openapi3.Operation) {
	for key, response := range op.Responses.Map() {
		if !strings.HasPrefix(key, "20") {
			continue
		}

		for _, content := range response.Value.Content {
			maps.DeleteFunc(content.Extensions, func(_ string, v any) bool {
				return v == sunsetToBeDecided
			})
		}
	}
}
