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
	"fmt"
	"log"
	"strings"

	"github.com/getkin/kin-openapi/openapi3"
)

const (
	hiddenEnvsExtensionName     = "x-xgen-hidden-env"
	hiddenEnvsExtionsionKeyName = "envs"
)

type HiddenEnvsFilter struct{}

func (f *HiddenEnvsFilter) Apply(oas *openapi3.T, metadata *Metadata) error {
	for _, pathItem := range oas.Paths.Map() {
		if err := f.applyOnPath(pathItem, metadata); err != nil {
			return err
		}
	}

	for _, pathItem := range oas.Paths.Map() {
		if err := f.applyOnPath(pathItem, metadata); err != nil {
			return err
		}
	}
	
	return nil
}

func (f *HiddenEnvsFilter) applyOnPath(pathItem *openapi3.PathItem, metadata *Metadata) error {
	for k, operation := range pathItem.Operations() {
		if isOperationHiddenForEnv := f.isOperationHiddenForEnv(operation, metadata); isOperationHiddenForEnv {
			log.Printf("Removing operation: '%s' from path: '%s' because is hidden for target env: %s", k, pathItem.Ref, metadata.targetEnv)
			pathItem.SetOperation(k, nil) // Remove Operation if it is hidden for the target environment
			continue
		}

		for k, response := range operation.Responses.Map(){
			if isResponseHiddenForEnv := f.isResponseHiddenForEnv(response, metadata); isResponseHiddenForEnv {
				log.Printf("Removing response: '%s' from operationID: '%s' because is hidden for target env: %s", k, operation.OperationID, metadata.targetEnv)
				operation.Responses.Set(k, nil) // Remove Response if it is hidden for the target environment
			}
		}

		if isRequestBodyHiddenForEnv:= f.isRequestBodyHiddenForEnv(operation.RequestBody, metadata); isRequestBodyHiddenForEnv {
			log.Printf("Removing requestBody from operationID: '%s' because is hidden for target env: %s", operation.OperationID, metadata.targetEnv)
			operation.RequestBody = nil // Remove RequestBody if it is hidden for the target environment	
		}
	}

	return nil
}

func (f *HiddenEnvsFilter) isOperationHiddenForEnv(operation *openapi3.Operation, metadata *Metadata) bool {
	for k, extension := range operation.Extensions {
		if k != hiddenEnvsExtensionName {
			continue
		}

		print(fmt.Printf("Found x-hidden-envs: K: %s, V: %s", k, extension))
		return isHiddenExtensionEqualToTargetEnv(extension, metadata)
	}

	return false
}

func (f *HiddenEnvsFilter) isResponseHiddenForEnv(response *openapi3.ResponseRef, metadata *Metadata) bool {
	for k, extension := range response.Extensions {
		if k != hiddenEnvsExtensionName {
			continue
		}

		print(fmt.Printf("Found x-hidden-envs in the response: K: %s, V: %s", k, extension))
		return isHiddenExtensionEqualToTargetEnv(extension, metadata)
	}

	return false
}

func (f *HiddenEnvsFilter) isRequestBodyHiddenForEnv(requestBody *openapi3.RequestBodyRef, metadata *Metadata) bool {
	for k, extension := range requestBody.Extensions {
		if k != hiddenEnvsExtensionName {
			continue
		}

		print(fmt.Printf("Found x-hidden-envs: K: %s, V: %s", k, extension))
		return isHiddenExtensionEqualToTargetEnv(extension, metadata)
	}

	return false
}

func isHiddenExtensionEqualToTargetEnv(extension interface{}, metadata *Metadata) bool {
	if envs, ok := extension.(map[string]interface{}); ok {
		if v, ok := envs[hiddenEnvsExtionsionKeyName].(string); ok {
			print(fmt.Printf("Found x-hidden-envs: V: %s", v))
			return strings.Contains(v, metadata.targetEnv)
		}
	}
	return false
}
