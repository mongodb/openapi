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

// ExtensionFilter is a filter that removes the x-xgen-IPA-exception extension from the OpenAPI spec.
// If metadata.keepIPAExceptions is true, the x-xgen-IPA-exception extensions are kept.
type ExtensionFilter struct {
	oas      *openapi3.T
	metadata *Metadata
}

const (
	ipaExceptionExtension = "x-xgen-IPA-exception"
	format                = "2006-01-02T15:04:05Z07:00"
)

func (f *ExtensionFilter) ValidateMetadata() error {
	return validateMetadata(f.metadata)
}

func (f *ExtensionFilter) Apply() error {
	for _, pathItem := range f.oas.Paths.Map() {
		if pathItem == nil {
			continue
		}
		f.deleteIpaExceptionExtensionIfNeeded(pathItem.Extensions)

		for _, operation := range pathItem.Operations() {
			if operation == nil {
				continue
			}

			f.deleteIpaExceptionExtensionIfNeeded(operation.Extensions)

			if operation.Parameters != nil {
				f.updateExtensionsForOperationParameters(operation.Parameters)
			}

			f.updateExtensionsForRequestBody(operation.RequestBody)

			for _, response := range operation.Responses.Map() {
				if response == nil {
					continue
				}

				f.deleteIpaExceptionExtensionIfNeeded(response.Extensions)

				if response.Value == nil {
					continue
				}

				f.deleteIpaExceptionExtensionIfNeeded(response.Value.Extensions)

				if response.Value.Content == nil {
					continue
				}

				// Handle response content - iterate over ALL content types directly
				for _, content := range response.Value.Content {
					if content == nil {
						continue
					}
					f.deleteIpaExceptionExtensionIfNeeded(content.Extensions)
					f.updateExtensionsForSchema(content.Schema)
				}
			}

			request := operation.RequestBody
			if request == nil || request.Value == nil || request.Value.Content == nil {
				continue
			}
		}
	}
	if f.oas.Tags != nil {
		f.updateExtensionsForTags(&f.oas.Tags)
	}
	if f.oas.Components != nil {
		f.updateExtensionsForComponents(f.oas.Components)
	}
	return nil
}

func (f *ExtensionFilter) updateExtensionsForRequestBody(requestBody *openapi3.RequestBodyRef) {
	if requestBody == nil || requestBody.Value == nil {
		return
	}
	f.deleteIpaExceptionExtensionIfNeeded(requestBody.Extensions)

	// Handle request body content - iterate over ALL content types directly
	for _, content := range requestBody.Value.Content {
		if content == nil {
			continue
		}
		f.deleteIpaExceptionExtensionIfNeeded(content.Extensions)
		f.updateExtensionsForSchema(content.Schema)
	}
}

func (f *ExtensionFilter) updateExtensionsForOperationParameters(parameters openapi3.Parameters) {
	for _, parameter := range parameters {
		if parameter == nil {
			continue
		}
		f.deleteIpaExceptionExtensionIfNeeded(parameter.Extensions)

		if parameter.Value == nil {
			continue
		}
		f.deleteIpaExceptionExtensionIfNeeded(parameter.Value.Extensions)
		f.updateExtensionsForSchema(parameter.Value.Schema)
	}
}

func (f *ExtensionFilter) updateExtensionsForComponents(components *openapi3.Components) {
	for _, schema := range components.Schemas {
		f.updateExtensionsForSchema(schema)
	}
	for _, parameter := range components.Parameters {
		if parameter != nil {
			f.deleteIpaExceptionExtensionIfNeeded(parameter.Extensions)
			if parameter.Value != nil {
				f.deleteIpaExceptionExtensionIfNeeded(parameter.Value.Extensions)
				f.updateExtensionsForSchema(parameter.Value.Schema)
			}
		}
	}
}

func (f *ExtensionFilter) updateExtensionsForTags(tags *openapi3.Tags) {
	for _, tag := range *tags {
		if tag != nil {
			f.deleteIpaExceptionExtensionIfNeeded(tag.Extensions)
		}
	}
}

func (f *ExtensionFilter) updateExtensionsForSchema(schema *openapi3.SchemaRef) {
	if schema == nil {
		return
	}
	f.deleteIpaExceptionExtensionIfNeeded(schema.Extensions)

	if schema.Value == nil {
		return
	}

	f.deleteIpaExceptionExtensionIfNeeded(schema.Value.Extensions)

	// Handle array items
	if schema.Value.Items != nil {
		f.updateExtensionsForSchema(schema.Value.Items)
	}

	// Handle allOf
	for _, allOf := range schema.Value.AllOf {
		f.updateExtensionsForSchema(allOf)
	}

	// Handle anyOf
	for _, anyOf := range schema.Value.AnyOf {
		f.updateExtensionsForSchema(anyOf)
	}

	// Handle oneOf
	for _, oneOf := range schema.Value.OneOf {
		f.updateExtensionsForSchema(oneOf)
	}

	// Handle properties (recursively)
	for _, property := range schema.Value.Properties {
		f.updateExtensionsForSchema(property)
	}
}

func deleteIpaExceptionExtension(extensions map[string]any) {
	if extensions == nil || extensions[ipaExceptionExtension] == nil {
		return
	}

	delete(extensions, ipaExceptionExtension)
}

func (f *ExtensionFilter) deleteIpaExceptionExtensionIfNeeded(extensions map[string]any) {
	if f.metadata != nil && f.metadata.keepIPAExceptions {
		return
	}
	deleteIpaExceptionExtension(extensions)
}
