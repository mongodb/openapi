package resources

import (
	"sort"
	"strings"

	"github.com/getkin/kin-openapi/openapi3"
)

const schemaRefPrefix = "#/components/schemas/"

// schemaReferencesIn returns all distinct schema names directly referenced within a schema tree.
func schemaReferencesIn(schema *openapi3.SchemaRef) []string {
	seen := make(map[string]bool)
	var walk func(*openapi3.SchemaRef)
	walk = func(s *openapi3.SchemaRef) {
		if s == nil {
			return
		}
		if s.Ref != "" {
			if name := strings.TrimPrefix(s.Ref, schemaRefPrefix); name != s.Ref {
				seen[name] = true
			}
			return
		}
		if s.Value == nil {
			return
		}
		for _, prop := range s.Value.Properties {
			walk(prop)
		}
		for _, s2 := range s.Value.AllOf {
			walk(s2)
		}
		for _, s2 := range s.Value.AnyOf {
			walk(s2)
		}
		for _, s2 := range s.Value.OneOf {
			walk(s2)
		}
		walk(s.Value.Items)
		walk(s.Value.Not)
		walk(s.Value.AdditionalProperties.Schema)
	}
	walk(schema)
	result := make([]string, 0, len(seen))
	for name := range seen {
		result = append(result, name)
	}
	sort.Strings(result)
	return result
}

// operationsUsing returns operationIDs of all operations that directly reference the target schema.
func operationsUsing(spec *openapi3.T, schemaName string) []string {
	if spec.Paths == nil {
		return []string{}
	}
	target := schemaRefPrefix + schemaName
	ops := []string{}
	for _, pathItem := range spec.Paths.Map() {
		if pathItem == nil {
			continue
		}
		for _, op := range pathItem.Operations() {
			if op != nil && operationReferencesSchema(op, target) {
				ops = append(ops, op.OperationID)
			}
		}
	}
	sort.Strings(ops)
	return ops
}

// operationReferencesSchema reports whether an operation's parameters, request body, or responses
// directly reference the given schema ref string.
func operationReferencesSchema(op *openapi3.Operation, target string) bool {
	for _, paramRef := range op.Parameters {
		if paramRef != nil && paramRef.Value != nil && schemaRefContains(paramRef.Value.Schema, target) {
			return true
		}
	}
	if op.RequestBody != nil && op.RequestBody.Value != nil {
		for _, mt := range op.RequestBody.Value.Content {
			if mt != nil && schemaRefContains(mt.Schema, target) {
				return true
			}
		}
	}
	if op.Responses != nil {
		for _, respRef := range op.Responses.Map() {
			if respRef != nil && respRef.Value != nil {
				for _, mt := range respRef.Value.Content {
					if mt != nil && schemaRefContains(mt.Schema, target) {
						return true
					}
				}
			}
		}
	}
	return false
}

// schemasUsing returns names of component schemas that directly reference the target schema.
func schemasUsing(spec *openapi3.T, schemaName string) []string {
	if spec.Components == nil || spec.Components.Schemas == nil {
		return []string{}
	}
	target := schemaRefPrefix + schemaName
	schemas := []string{}
	for name, schemaRef := range spec.Components.Schemas {
		if name != schemaName && schemaRef != nil && schemaRefContains(schemaRef, target) {
			schemas = append(schemas, name)
		}
	}
	sort.Strings(schemas)
	return schemas
}

// schemaRefContains reports whether the schema ref tree directly contains a ref matching target.
func schemaRefContains(schema *openapi3.SchemaRef, target string) bool {
	if schema == nil {
		return false
	}
	if schema.Ref == target {
		return true
	}
	if schema.Value == nil {
		return false
	}
	for _, prop := range schema.Value.Properties {
		if schemaRefContains(prop, target) {
			return true
		}
	}
	for _, s := range schema.Value.AllOf {
		if schemaRefContains(s, target) {
			return true
		}
	}
	for _, s := range schema.Value.AnyOf {
		if schemaRefContains(s, target) {
			return true
		}
	}
	for _, s := range schema.Value.OneOf {
		if schemaRefContains(s, target) {
			return true
		}
	}
	return schemaRefContains(schema.Value.Items, target) ||
		schemaRefContains(schema.Value.Not, target) ||
		schemaRefContains(schema.Value.AdditionalProperties.Schema, target)
}
