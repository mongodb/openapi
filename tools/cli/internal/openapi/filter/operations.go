// Copyright 2024 MongoDB Inc
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
	"github.com/getkin/kin-openapi/openapi3"
)

// OperationsFilter: is a filter that removes the x-xgen-owner-team extension from operations.
type OperationsFilter struct {
	oas *openapi3.T
}

func (*OperationsFilter) ValidateMetadata() error {
	return nil
}

func (f *OperationsFilter) Apply() error {
	if f.oas.Paths == nil {
		return nil
	}

	for _, pathItem := range f.oas.Paths.Map() {
		for _, operation := range pathItem.Operations() {
			if operation.Extensions != nil {
				delete(operation.Extensions, "x-xgen-owner-team")
			}
		}
	}
	return nil
}
