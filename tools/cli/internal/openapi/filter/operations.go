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

type OperationsFilter struct {
	oas *openapi3.T
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
			moveSunsetExtensionToOperation(operation)
		}
	}
	return nil
}

func moveSunsetExtensionToOperation(operation *openapi3.Operation) {
	if operation.Responses == nil {
		return
	}
	// search for sunset in content responses
	for _, response := range operation.Responses.Map() {
		if response == nil || response.Value == nil || response.Value.Content == nil {
			continue
		}

		for _, mediaType := range response.Value.Content {
			if mediaType == nil || mediaType.Extensions == nil {
				continue
			}

			if sunset, ok := mediaType.Extensions["x-sunset"]; ok {
				if operation.Extensions == nil {
					operation.Extensions = make(map[string]interface{})
				}
				operation.Extensions[sunsetExtension] = sunset
				delete(mediaType.Extensions, sunsetExtension)
				operation.Deprecated = true
			}
		}
	}
}
