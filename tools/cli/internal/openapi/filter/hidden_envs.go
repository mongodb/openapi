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
	"log"
	"strings"

	"github.com/getkin/kin-openapi/openapi3"
)

const (
	hiddenEnvsExtension = "x-xgen-hidden-env"
	hiddenEnvsExtKey    = "envs"
)

type HiddenEnvsFilter struct {
	oas      *openapi3.T
	metadata *Metadata
}

func (f *HiddenEnvsFilter) Apply() error {
	for _, pathItem := range f.oas.Paths.Map() {
		if err := f.applyOnPath(pathItem); err != nil {
			return err
		}
	}
	return nil
}

func (f *HiddenEnvsFilter) applyOnPath(pathItem *openapi3.PathItem) error {
	for k, operation := range pathItem.Operations() {
		f.removeOperationIfHiddenForEnv(k, pathItem, operation)
		f.removeResponseIfHiddenForEnv(operation)
		f.removeRequestBodyIfHiddenForEnv(operation)
	}

	return nil
}

func (f *HiddenEnvsFilter) removeOperationIfHiddenForEnv(pathName string, pathItem *openapi3.PathItem, operation *openapi3.Operation) {
	if isOperationHiddenForEnv := f.isOperationHiddenForEnv(operation); isOperationHiddenForEnv {
		log.Printf("Removing operation: %q from path: %q because is hidden for target env: %q", pathName, pathItem.Ref, f.metadata.targetEnv)
		pathItem.SetOperation(pathName, nil) // Remove Operation if it is hidden for the target environment
		return
	} else if operation.Extensions != nil {
		// Remove the Hidden extension from the final OAS
		delete(operation.Extensions, hiddenEnvsExtension)
	}
}

func (f *HiddenEnvsFilter) removeRequestBodyIfHiddenForEnv(operation *openapi3.Operation) {
	if isRequestBodyHiddenForEnv := f.isRequestBodyHiddenForEnv(operation.RequestBody); isRequestBodyHiddenForEnv {
		log.Printf("Removing requestBody from operationID: %q because is hidden for target env: %q", operation.OperationID, f.metadata.targetEnv)
		operation.RequestBody = nil // Remove RequestBody if it is hidden for the target environment
	} else if operation.RequestBody != nil && operation.RequestBody.Extensions != nil {
		// Remove the Hidden extension from the final OAS
		delete(operation.RequestBody.Extensions, hiddenEnvsExtension)
	}
}

func (f *HiddenEnvsFilter) removeResponseIfHiddenForEnv(operation *openapi3.Operation) {
	for k, response := range operation.Responses.Map() {
		if isResponseHiddenForEnv := f.isResponseHiddenForEnv(response); isResponseHiddenForEnv {
			log.Printf("Removing response: %q from operationID: %q because is hidden for target env: %q", k, operation.OperationID, f.metadata.targetEnv)
			operation.Responses.Delete(k) // Remove Response if it is hidden for the target environment
		} else if response.Extensions != nil {
			// Remove the Hidden extension from the final OAS
			delete(response.Extensions, hiddenEnvsExtension)
		}
	}
}

func (f *HiddenEnvsFilter) isOperationHiddenForEnv(operation *openapi3.Operation) bool {
	if operation == nil {
		return false
	}

	if extension, ok := operation.Extensions[hiddenEnvsExtension]; ok {
		log.Printf("Found x-hidden-envs in the operation: K: %q, V: %q", hiddenEnvsExtension, extension)
		return f.isHiddenExtensionEqualToTargetEnv(extension)
	}

	return false
}

func (f *HiddenEnvsFilter) isResponseHiddenForEnv(response *openapi3.ResponseRef) bool {
	if response == nil {
		return false
	}

	if extension, ok := response.Extensions[hiddenEnvsExtension]; ok {
		log.Printf("Found x-hidden-envs in the response: K: %q, V: %q", hiddenEnvsExtension, extension)
		return f.isHiddenExtensionEqualToTargetEnv(extension)
	}

	if response.Value != nil {
		if extension, ok := response.Value.Extensions[hiddenEnvsExtension]; ok {
			log.Printf("Found x-hidden-envs in the response: K: %q, V: %q", hiddenEnvsExtension, extension)
			return f.isHiddenExtensionEqualToTargetEnv(extension)
		}
	}

	return false
}

func (f *HiddenEnvsFilter) isRequestBodyHiddenForEnv(requestBody *openapi3.RequestBodyRef) bool {
	if requestBody == nil {
		return false
	}

	if extension, ok := requestBody.Extensions[hiddenEnvsExtension]; ok {
		log.Printf("Found x-hidden-envs: K: %q, V: %q", hiddenEnvsExtension, extension)
		return f.isHiddenExtensionEqualToTargetEnv(extension)
	}

	return false
}

func (f *HiddenEnvsFilter) isHiddenExtensionEqualToTargetEnv(extension interface{}) bool {
	if envs, ok := extension.(map[string]interface{}); ok {
		if v, ok := envs[hiddenEnvsExtKey].(string); ok {
			log.Printf("Found x-hidden-envs: V: %q", v)
			return strings.Contains(v, f.metadata.targetEnv)
		}
	}
	return false
}
