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
	"regexp"
	"slices"
	"strings"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/mongodb/openapi/tools/cli/internal/collections/queue"
	"github.com/mongodb/openapi/tools/cli/internal/collections/set"
)

// SchemasFilter removes unused #/components/schemas/.
type SchemasFilter struct {
	oas *openapi3.T
}

func (*SchemasFilter) ValidateMetadata() error {
	return nil
}

// Apply removes all unused schemas from the OpenAPI specification.
// A schema is considered used if it is referenced directly in paths/operations
// or transitively through other used schemas (including circular dependencies).
func (f *SchemasFilter) Apply() error {
	if f.oas.Paths == nil {
		return nil
	}

	if f.oas.Components == nil || f.oas.Components.Schemas == nil {
		return nil
	}

	usedSchemas, err := f.discoverUsedSchemas()
	if err != nil {
		return err
	}

	maps.DeleteFunc(f.oas.Components.Schemas, func(k string, _ *openapi3.SchemaRef) bool {
		if usedSchemas.Has(k) {
			return false
		}
		log.Printf("Deleting unused schema: %q", k)
		return true
	})

	return nil
}

// discoverUsedSchemas finds all schemas that are used in the OpenAPI spec.
// It performs a two-phase discovery:
// 1. Find all schemas directly referenced in paths/operations (root schemas)
// 2. Traverse schema dependencies to find transitively referenced schemas
// This approach correctly handles circular dependencies between schemas.
func (f *SchemasFilter) discoverUsedSchemas() (set.Set[string], error) {
	usedSchemas := set.New[string]()

	markUsed := func(schemaName string) {
		usedSchemas.Add(schemaName)
	}

	// Phase 1: Discover root schemas referenced in paths/operations
	if err := f.discoverUsedRootSchemas(markUsed); err != nil {
		return nil, err
	}

	// Phase 2: Traverse schema dependencies using BFS to find nested references
	q := queue.New(slices.Collect(usedSchemas.Iter())...)
	markToDiscover := func(schemaName string) {
		if usedSchemas.Has(schemaName) {
			return
		}
		usedSchemas.Add(schemaName)
		q.Enqueue(schemaName)
	}

	for !q.IsEmpty() {
		schemaName := q.Dequeue()

		if schemaRef, exists := f.oas.Components.Schemas[schemaName]; exists {
			f.discoverSchemaRefsInSchema(schemaRef, markToDiscover)
		}
	}

	return usedSchemas, nil
}

// discoverUsedRootSchemas finds schemas directly referenced in paths, operations,
// parameters, request bodies, and responses (excluding component schemas).
// It temporarily removes all schemas from components, marshals the spec to JSON,
// and searches for schema references in the resulting JSON.
func (f *SchemasFilter) discoverUsedRootSchemas(onDiscovered func(schemaName string)) error {
	// Temporarily remove schemas to exclude them from the search
	schemas := f.oas.Components.Schemas
	f.oas.Components.Schemas = openapi3.Schemas{}
	defer func() {
		f.oas.Components.Schemas = schemas
	}()

	oasSpecAsBytes, err := f.oas.MarshalJSON()
	if err != nil {
		return err
	}

	// Find all schema references in the JSON
	refRegex := regexp.MustCompile(`"(#/components/schemas/([^"]+))"`)

	matches := refRegex.FindAllStringSubmatch(string(oasSpecAsBytes), -1)
	for _, match := range matches {
		onDiscovered(match[2])
	}

	return nil
}

// discoverSchemaRefsInSchema recursively finds all schema references within a given schema.
// It checks properties, polymorphism constructs (allOf, anyOf, oneOf), items, not, and additionalProperties.
func (f *SchemasFilter) discoverSchemaRefsInSchema(schema *openapi3.SchemaRef, onDiscovered func(string)) {
	if schema == nil {
		return
	}

	// If this is a reference, extract and report the schema name
	if isRef(schema) {
		onDiscovered(getRefName(schema))
		return
	}

	// Guard against nil schema values
	if schema.Value == nil {
		return
	}

	// Check properties for refs
	for _, ref := range schema.Value.Properties {
		f.discoverSchemaRefsInSchema(ref, onDiscovered)
	}

	// Check polymorphism for refs
	for _, ref := range schema.Value.AllOf {
		f.discoverSchemaRefsInSchema(ref, onDiscovered)
	}
	for _, ref := range schema.Value.AnyOf {
		f.discoverSchemaRefsInSchema(ref, onDiscovered)
	}
	for _, ref := range schema.Value.OneOf {
		f.discoverSchemaRefsInSchema(ref, onDiscovered)
	}

	// Check array items, negation, and additional properties
	f.discoverSchemaRefsInSchema(schema.Value.Items, onDiscovered)
	f.discoverSchemaRefsInSchema(schema.Value.Not, onDiscovered)
	f.discoverSchemaRefsInSchema(schema.Value.AdditionalProperties.Schema, onDiscovered)
}

// getRefName extracts the schema name from a schema reference.
// For example, "#/components/schemas/User" returns "User".
func getRefName(s *openapi3.SchemaRef) string {
	if isRef(s) {
		return strings.TrimPrefix(s.Ref, "#/components/schemas/")
	}
	return ""
}

// isRef checks if a SchemaRef is a reference to a component schema.
// It validates that the reference starts with "#/components/schemas/" to ensure
// we only process schema references (not other types like parameters or responses).
func isRef(s *openapi3.SchemaRef) bool {
	if s == nil {
		return false
	}
	if s.Ref != "" && strings.HasPrefix(s.Ref, "#/components/schemas/") {
		return true
	}
	return false
}
