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
	"github.com/mongodb/openapi/tools/cli/internal/apiversion"
)

const (
	hiddenEnvsExtension = "x-xgen-hidden-env"
	hiddenEnvsExtKey    = "envs"
)

// HiddenEnvsFilter removes paths, operations, request/response bodies and content types
// that are hidden for the target environment.
type HiddenEnvsFilter struct {
	oas      *openapi3.T
	metadata *Metadata
}

func (f *HiddenEnvsFilter) ValidateMetadata() error {
	return validateMetadata(f.metadata)
}

func (f *HiddenEnvsFilter) Apply() error {
	// delete hidden paths first before processing
	for pathName, pathItem := range f.oas.Paths.Map() {
		f.removePathIfHiddenForEnv(pathName, pathItem)
	}

	for path, pathItem := range f.oas.Paths.Map() {
		if err := f.applyOnPath(pathItem); err != nil {
			return err
		}
		if len(pathItem.Operations()) == 0 {
			f.oas.Paths.Delete(path)
		}
	}

	if f.oas.Components == nil || f.oas.Components.Schemas == nil {
		return nil
	}

	return f.applyOnSchemas(f.oas.Components.Schemas)
}

func (f *HiddenEnvsFilter) applyOnSchemas(schemas openapi3.Schemas) error {
	for name, schema := range schemas {
		if err := f.removeSchemaIfHiddenForEnv(name, schema, schemas); err != nil {
			return err
		}
	}
	return nil
}

func (f *HiddenEnvsFilter) removeSchemaIfHiddenForEnv(name string, schema *openapi3.SchemaRef, schemas openapi3.Schemas) error {
	if schema == nil {
		return nil
	}

	// Remove the schema if it is hidden for the target environment
	if extension, ok := schema.Extensions[hiddenEnvsExtension]; ok {
		log.Printf("Found x-hidden-envs in schema: K: %q, V: %q", hiddenEnvsExtension, extension)
		if isHiddenExtensionEqualToTargetEnv(extension, f.metadata.targetEnv) {
			log.Printf("Removing schema: %q because is hidden for target env: %q", name, f.metadata.targetEnv)
			delete(schemas, name)
			return nil
		}

		// Remove the Hidden extension from the final OAS
		delete(schema.Extensions, hiddenEnvsExtension)
	}

	if schema.Value == nil {
		return nil
	}

	if schema.Value.Extensions != nil {
		if extension, ok := schema.Value.Extensions[hiddenEnvsExtension]; ok {
			log.Printf("Found x-hidden-envs in schema: K: %q, V: %q", hiddenEnvsExtension, extension)
			if isHiddenExtensionEqualToTargetEnv(extension, f.metadata.targetEnv) {
				log.Printf("Removing schema: %q because is hidden for target env: %q", name, f.metadata.targetEnv)
				delete(schemas, name)
				return nil
			}

			// Remove the Hidden extension from the final OAS
			delete(schema.Value.Extensions, hiddenEnvsExtension)
		}
	}

	// Remove properties and items if they are hidden for the target environment
	if schema.Value.Properties != nil {
		if err := f.applyOnSchemas(schema.Value.Properties); err != nil {
			return err
		}
	}

	f.removeItemsIfHiddenForEnv(schema)
	return nil
}

func (f *HiddenEnvsFilter) removeItemsIfHiddenForEnv(schema *openapi3.SchemaRef) {
	if schema.Value == nil || schema.Value.Items == nil {
		return
	}

	if extension, ok := schema.Value.Items.Extensions[hiddenEnvsExtension]; ok {
		log.Printf("Found x-hidden-envs in items: K: %q, V: %q", hiddenEnvsExtension, extension)
		if isHiddenExtensionEqualToTargetEnv(extension, f.metadata.targetEnv) {
			log.Printf("Removing items because is hidden for target env: %q", f.metadata.targetEnv)
			schema.Value.Items = nil
		} else {
			// Remove the Hidden extension from the final OAS
			delete(schema.Value.Items.Extensions, hiddenEnvsExtension)
		}
	}
}

// Remove OpenAPI Response, RequestBody and Operation if they are hidden for the specific environment.
// Note: removeOperationIfHiddenForEnv must run after removeResponseIfHiddenForEnv.
func (f *HiddenEnvsFilter) applyOnPath(pathItem *openapi3.PathItem) error {
	for k, operation := range pathItem.Operations() {
		f.removeResponseIfHiddenForEnv(operation)
		f.removeRequestBodyIfHiddenForEnv(operation)
		f.removeOperationIfHiddenForEnv(k, pathItem, operation)
	}

	return nil
}

func (f *HiddenEnvsFilter) removePathIfHiddenForEnv(pathName string, pathItem *openapi3.PathItem) {
	if isPathHiddenForEnv := f.isPathHiddenForEnv(pathItem); isPathHiddenForEnv {
		log.Printf("Removing path: %q because is hidden for target env: %q", pathItem.Ref, f.metadata.targetEnv)
		f.oas.Paths.Delete(pathName) // Remove Path if it is hidden for the target environment
	} else if pathItem.Extensions != nil {
		// Remove the Hidden extension from the final OAS
		delete(pathItem.Extensions, hiddenEnvsExtension)
	}
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

	if operation.RequestBody == nil || operation.RequestBody.Value == nil || operation.RequestBody.Value.Content == nil {
		return
	}

	for k, contentType := range operation.RequestBody.Value.Content {
		if isContentTypeHiddenForEnv := isContentTypeHiddenForEnv(contentType, f.metadata.targetEnv); isContentTypeHiddenForEnv {
			log.Printf("Removing contentType: %q because is hidden for target env: %q", contentType.Schema.Ref, f.metadata.targetEnv)
			// Remove ContentType if it is hidden for the target environment
			delete(operation.RequestBody.Value.Content, k)
		} else if contentType.Extensions != nil {
			// Remove the Hidden extension from the final OAS
			delete(contentType.Extensions, hiddenEnvsExtension)
		}
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

		if response.Value == nil || response.Value.Content == nil {
			continue
		}

		for k, contentType := range response.Value.Content {
			if isContentTypeHiddenForEnv := isContentTypeHiddenForEnv(contentType, f.metadata.targetEnv); isContentTypeHiddenForEnv {
				log.Printf("Removing contentType: %q because is hidden for target env: %q", contentType.Schema.Ref, f.metadata.targetEnv)
				// Remove ContentType if it is hidden for the target environment
				delete(response.Value.Content, k)
			} else if contentType.Extensions != nil {
				// Remove the Hidden extension from the final OAS
				delete(contentType.Extensions, hiddenEnvsExtension)
			}
		}
	}
}

// isOperationHiddenForEnv determines if an operation should be hidden for the target environment.
// It returns true if the operation is explicitly marked as hidden via the extension, or if
// the target version is non-stable (preview/upcoming) and the operation lacks the corresponding
// content type in its 2xx responses. isOperationHiddenForEnv must be executed after the response was already
// filtered out.
func (f *HiddenEnvsFilter) isOperationHiddenForEnv(operation *openapi3.Operation) bool {
	if operation == nil {
		return false
	}

	if extension, ok := operation.Extensions[hiddenEnvsExtension]; ok {
		log.Printf("Found x-hidden-envs in the operation: K: %q, V: %q", hiddenEnvsExtension, extension)
		return isHiddenExtensionEqualToTargetEnv(extension, f.metadata.targetEnv)
	}

	if f.metadata.targetVersion == nil || f.metadata.targetVersion.IsStable() {
		return false
	}

	// When targeting non-stable versions (preview or upcoming), x-hidden-envs is often applied narrowly
	// to specific response content types to preserve the stable version in production.
	//
	// Since removeResponseIfHiddenForEnv has already executed, any hidden content types are gone.
	// We must now ensure the operation still contains content relevant to the target version.
	// If the 2xx responses lack the target-specific content type (e.g. "preview"), the operation
	// is effectively hidden for this environment and should be removed entirely.
	if f.metadata.targetVersion.IsPreview() {
		return !hasContentTypeInTheResponse(operation, apiversion.PreviewStabilityLevel)
	}

	return !hasContentTypeInTheResponse(operation, apiversion.UpcomingStabilityLevel)
}

func hasContentTypeInTheResponse(operation *openapi3.Operation, contentType string) bool {
	for responseCode, response := range operation.Responses.Map() {
		if !strings.HasPrefix(responseCode, "20") {
			continue
		}

		if response.Value == nil || response.Value.Content == nil {
			continue
		}

		for contentKey := range response.Value.Content {
			if strings.Contains(contentKey, contentType) {
				return true
			}
		}
	}

	return false
}

func (f *HiddenEnvsFilter) isResponseHiddenForEnv(response *openapi3.ResponseRef) bool {
	if response == nil {
		return false
	}

	if extension, ok := response.Extensions[hiddenEnvsExtension]; ok {
		log.Printf("Found x-hidden-envs in the response: K: %q, V: %q", hiddenEnvsExtension, extension)
		return isHiddenExtensionEqualToTargetEnv(extension, f.metadata.targetEnv)
	}

	if response.Value != nil {
		if extension, ok := response.Value.Extensions[hiddenEnvsExtension]; ok {
			log.Printf("Found x-hidden-envs in the response: K: %q, V: %q", hiddenEnvsExtension, extension)
			return isHiddenExtensionEqualToTargetEnv(extension, f.metadata.targetEnv)
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
		return isHiddenExtensionEqualToTargetEnv(extension, f.metadata.targetEnv)
	}

	return false
}

func (f *HiddenEnvsFilter) isPathHiddenForEnv(pathItem *openapi3.PathItem) bool {
	if extension, ok := pathItem.Extensions[hiddenEnvsExtension]; ok {
		log.Printf("Found x-hidden-envs: K: %q, V: %q", hiddenEnvsExtension, extension)
		return isHiddenExtensionEqualToTargetEnv(extension, f.metadata.targetEnv)
	}
	return false
}

func isHiddenExtensionEqualToTargetEnv(extension any, target string) bool {
	if envs, ok := extension.(map[string]any); ok {
		if v, ok := envs[hiddenEnvsExtKey].(string); ok {
			log.Printf("Found x-hidden-envs: V: %q", v)
			return strings.Contains(v, target)
		}
	}
	return false
}

// isContentTypeHiddenForEnv returns true if the content type is hidden for the target environment.
func isContentTypeHiddenForEnv(contentType *openapi3.MediaType, targetEnv string) bool {
	if contentType == nil {
		return false
	}

	if extension, ok := contentType.Extensions[hiddenEnvsExtension]; ok {
		log.Printf("Found x-hidden-envs: K: %q, V: %q", hiddenEnvsExtension, extension)
		return isHiddenExtensionEqualToTargetEnv(extension, targetEnv)
	}

	return false
}
