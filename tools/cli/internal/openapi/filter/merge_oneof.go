package filter

import (
	"github.com/getkin/kin-openapi/openapi3"
)

// MergeOneOfFilter: is a filter that merges properties from allOf into each child schema within oneOf to eliminate circular dependencies.
type MergeOneOfFilter struct {
	oas *openapi3.T
}

func (*MergeOneOfFilter) ValidateMetadata() error {
	return nil
}

func (f *MergeOneOfFilter) Apply() error {
	if f.oas == nil {
		return nil
	}

	// Process components schemas
	if f.oas.Components != nil && f.oas.Components.Schemas != nil {
		for _, schemaRef := range f.oas.Components.Schemas {
			if schemaRef != nil && schemaRef.Value != nil {
				f.processSchema(schemaRef.Value)
			}
		}
	}

	// Process paths and their operations
	if f.oas.Paths != nil {
		for _, pathItem := range f.oas.Paths.Map() {
			// Process parameters at path level
			for _, paramRef := range pathItem.Parameters {
				if paramRef != nil && paramRef.Value != nil && paramRef.Value.Schema != nil && paramRef.Value.Schema.Value != nil {
					f.processSchema(paramRef.Value.Schema.Value)
				}
			}

			// Process operations
			for _, operation := range pathItem.Operations() {
				// Process operation parameters
				for _, paramRef := range operation.Parameters {
					if paramRef != nil && paramRef.Value != nil && paramRef.Value.Schema != nil && paramRef.Value.Schema.Value != nil {
						f.processSchema(paramRef.Value.Schema.Value)
					}
				}

				// Process request body
				if operation.RequestBody != nil && operation.RequestBody.Value != nil {
					for _, mediaType := range operation.RequestBody.Value.Content {
						if mediaType.Schema != nil && mediaType.Schema.Value != nil {
							f.processSchema(mediaType.Schema.Value)
						}
					}
				}

				// Process responses
				for _, responseRef := range operation.Responses.Map() {
					if responseRef != nil && responseRef.Value != nil {
						for _, mediaType := range responseRef.Value.Content {
							if mediaType.Schema != nil && mediaType.Schema.Value != nil {
								f.processSchema(mediaType.Schema.Value)
							}
						}
					}
				}
			}
		}
	}

	return nil
}

// processSchema recursively processes a schema to merge allOf properties into oneOf schemas
func (f *MergeOneOfFilter) processSchema(schema *openapi3.Schema) {
	if schema == nil {
		return
	}

	// If schema has both allOf and oneOf, we need to merge properties
	if len(schema.AllOf) > 0 && len(schema.OneOf) > 0 {
		// Collect all properties from allOf schemas
		allOfProperties := make(map[string]*openapi3.SchemaRef)
		allOfRequired := make([]string, 0)

		for _, allOfSchema := range schema.AllOf {
			if allOfSchema != nil && allOfSchema.Value != nil {
				// Merge properties
				for propName, propSchema := range allOfSchema.Value.Properties {
					allOfProperties[propName] = propSchema
				}

				// Merge required fields
				allOfRequired = append(allOfRequired, allOfSchema.Value.Required...)
			}
		}

		// Apply collected properties to each oneOf schema
		for _, oneOfSchema := range schema.OneOf {
			if oneOfSchema != nil && oneOfSchema.Value != nil {
				// Initialize properties map if nil
				if oneOfSchema.Value.Properties == nil {
					oneOfSchema.Value.Properties = make(map[string]*openapi3.SchemaRef)
				}

				// Copy allOf properties into oneOf schema
				for propName, propSchema := range allOfProperties {
					// Only add if the property doesn't exist in the oneOf schema
					if _, exists := oneOfSchema.Value.Properties[propName]; !exists {
						oneOfSchema.Value.Properties[propName] = propSchema
					}
				}

				// Merge required fields (avoiding duplicates)
				requiredSet := make(map[string]bool)
				for _, req := range oneOfSchema.Value.Required {
					requiredSet[req] = true
				}

				for _, req := range allOfRequired {
					if !requiredSet[req] {
						oneOfSchema.Value.Required = append(oneOfSchema.Value.Required, req)
						requiredSet[req] = true
					}
				}
			}
		}
	}

	// Recursively process nested schemas
	
	// Process properties
	for _, propSchema := range schema.Properties {
		if propSchema != nil && propSchema.Value != nil {
			f.processSchema(propSchema.Value)
		}
	}

	// Process additionalProperties
	if schema.AdditionalProperties.Schema != nil && schema.AdditionalProperties.Schema.Value != nil {
		f.processSchema(schema.AdditionalProperties.Schema.Value)
	}

	// Process items for arrays
	if schema.Items != nil && schema.Items.Value != nil {
		f.processSchema(schema.Items.Value)
	}

	// Process allOf schemas
	for _, subSchema := range schema.AllOf {
		if subSchema != nil && subSchema.Value != nil {
			f.processSchema(subSchema.Value)
		}
	}

	// Process oneOf schemas
	for _, subSchema := range schema.OneOf {
		if subSchema != nil && subSchema.Value != nil {
			f.processSchema(subSchema.Value)
		}
	}

	// Process anyOf schemas
	for _, subSchema := range schema.AnyOf {
		if subSchema != nil && subSchema.Value != nil {
			f.processSchema(subSchema.Value)
		}
	}
}
