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
	"encoding/json"
	"errors"
	"fmt"
	"log"
	reflect "reflect"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/mongodb/openapi/tools/cli/internal/apiversion"
)

//go:generate mockgen -destination=../filter/mock_filter.go -package=filter github.com/mongodb/openapi/tools/cli/internal/openapi/filter Filter
type Filter interface {
	Apply() error
	ValidateMetadata() error
}

type Metadata struct {
	targetVersion *apiversion.APIVersion
	targetEnv     string
}

func NewMetadata(targetVersion *apiversion.APIVersion, targetEnv string) *Metadata {
	return &Metadata{
		targetVersion: targetVersion,
		targetEnv:     targetEnv,
	}
}

// validateMetadata validates the metadata object, ensuring its not nil and has a target env.
func validateMetadata(metadata *Metadata) error {
	if metadata == nil {
		return errors.New("metadata is nil")
	}

	if metadata.targetEnv == "" {
		return errors.New("target environment is empty")
	}

	return nil
}

// validateMetadataWithVersion validates the metadata object, ensuring its not nil and has a target version.
func validateMetadataWithVersion(metadata *Metadata) error {
	if err := validateMetadata(metadata); err != nil {
		return err
	}

	if metadata.targetVersion == nil {
		return errors.New("target version is nil")
	}

	return nil
}

func DefaultFilters(oas *openapi3.T, metadata *Metadata) []Filter {
	return []Filter{
		&ExtensionFilter{oas: oas, metadata: metadata},
		&VersioningExtensionFilter{oas: oas, metadata: metadata},
		&VersioningFilter{oas: oas, metadata: metadata},
		&InfoVersioningFilter{oas: oas, metadata: metadata},
		&HiddenEnvsFilter{oas: oas, metadata: metadata},
		&TagsFilter{oas: oas},
		&OperationsFilter{oas: oas},
		&SunsetFilter{oas: oas},
		&SchemasFilter{oas: oas},
		&BumpFilter{oas: oas, metadata: metadata},
		&CodeSampleFilter{oas: oas, metadata: metadata},
	}
}

func FiltersWithoutVersioning(oas *openapi3.T, metadata *Metadata) []Filter {
	return []Filter{
		&ExtensionFilter{oas: oas, metadata: metadata},
		&HiddenEnvsFilter{oas: oas, metadata: metadata},
		&TagsFilter{oas: oas},
		&OperationsFilter{oas: oas},
		&SchemasFilter{oas: oas},
	}
}

// FiltersToGetVersions returns a list of filters to apply to the OpenAPI document to get the versions.
func FiltersToGetVersions(oas *openapi3.T, metadata *Metadata) []Filter {
	return []Filter{
		&HiddenEnvsFilter{oas: oas, metadata: metadata},
	}
}

func FiltersToCleanupRefs(oas *openapi3.T) []Filter {
	return []Filter{
		&TagsFilter{oas: oas},
		&ResponseFilter{oas: oas},
		&ParametersFilter{oas: oas},
		&SchemasFilter{oas: oas},
	}
}

func ApplyFilters(doc *openapi3.T, metadata *Metadata, filters func(oas *openapi3.T, metadata *Metadata) []Filter) (*openapi3.T, error) {
	if doc == nil {
		return nil, errors.New("openapi document is nil")
	}

	// make a copy of the oas to avoid modifying the original document when applying filters
	oas, err := duplicateOas(doc)
	if err != nil {
		return nil, err
	}

	for _, filter := range filters(oas, metadata) {
		filterName := reflect.TypeOf(filter)
		log.Printf("Applying filter %s", filterName)
		if err := filter.ValidateMetadata(); err != nil {
			return nil, fmt.Errorf("failed to validate metadata for filter %s with: %w", filterName, err)
		}
		if err := filter.Apply(); err != nil {
			return nil, err
		}
	}

	return oas, nil
}

func duplicateOas(doc *openapi3.T) (*openapi3.T, error) {
	// Marshal the original document to JSON
	jsonData, err := json.Marshal(doc)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal original OpenAPI specification: %w", err)
	}

	// Unmarshal the JSON data into a new OpenAPI document
	duplicateDoc := &openapi3.T{}
	err = json.Unmarshal(jsonData, duplicateDoc)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal duplicated OpenAPI specification: %w", err)
	}

	return duplicateDoc, nil
}

// MergeFilteredSpecs merges multiple filtered OpenAPI specs into a single spec.
func MergeFilteredSpecs(specs []*openapi3.T) (*openapi3.T, error) {
	if len(specs) == 0 {
		return nil, errors.New("no specs to merge")
	}

	if len(specs) == 1 {
		return specs[0], nil
	}

	// Use the first spec as the base and merge others into it
	base, err := duplicateOas(specs[0])
	if err != nil {
		return nil, fmt.Errorf("failed to duplicate base spec: %w", err)
	}

	for i := 1; i < len(specs); i++ {
		if err := mergeVersionedSpecIntoBase(base, specs[i]); err != nil {
			return nil, fmt.Errorf("failed to merge spec %d: %w", i, err)
		}
	}

	return base, nil
}

// mergeVersionedSpecIntoBase merges the source spec into the base spec.
// It combines all paths, operations, content types, and component schemas from all specs.
// This function merges filtered versions of the same base spec, so conflicts are handled
// by taking the union of all content types.
func mergeVersionedSpecIntoBase(base, source *openapi3.T) error {
	if err := mergeVersionedPaths(base, source); err != nil {
		return fmt.Errorf("failed to merge paths: %w", err)
	}

	if err := mergeVersionedComponents(base, source); err != nil {
		return fmt.Errorf("failed to merge components: %w", err)
	}

	if err := mergeVersionedTags(base, source); err != nil {
		return fmt.Errorf("failed to merge tags: %w", err)
	}

	return nil
}

func mergeVersionedPaths(base, source *openapi3.T) error {
	if source.Paths == nil || source.Paths.Len() == 0 {
		return nil
	}

	if base.Paths == nil {
		base.Paths = &openapi3.Paths{}
	}

	for pathName, pathItem := range source.Paths.Map() {
		if pathItem == nil {
			continue
		}

		existingPath := base.Paths.Value(pathName)
		if existingPath == nil {
			base.Paths.Set(pathName, pathItem)
		} else {
			if err := mergeVersionedPathOperations(existingPath, pathItem); err != nil {
				return fmt.Errorf("failed to merge path %q: %w", pathName, err)
			}
		}
	}

	return nil
}

func mergeVersionedPathOperations(base, source *openapi3.PathItem) error {
	for method, operation := range source.Operations() {
		if operation == nil {
			continue
		}

		existingOp := base.Operations()[method]
		if existingOp == nil {
			base.SetOperation(method, operation)
		} else {
			if err := mergeVersionedOperationContent(existingOp, operation); err != nil {
				return fmt.Errorf("failed to merge operation %q: %w", method, err)
			}
		}
	}
	return nil
}

func mergeVersionedOperationContent(base, source *openapi3.Operation) error {
	if source.Responses != nil {
		if base.Responses == nil {
			base.Responses = &openapi3.Responses{}
		}

		for statusCode, response := range source.Responses.Map() {
			if response == nil || response.Value == nil {
				continue
			}

			existingResponse := base.Responses.Value(statusCode)
			if existingResponse == nil {
				base.Responses.Set(statusCode, response)
			} else if existingResponse.Value != nil {
				mergeVersionedContent(existingResponse.Value.Content, response.Value.Content)
			}
		}
	}

	if source.RequestBody != nil && source.RequestBody.Value != nil {
		if base.RequestBody == nil {
			base.RequestBody = source.RequestBody
		} else if base.RequestBody.Value != nil {
			mergeVersionedContent(base.RequestBody.Value.Content, source.RequestBody.Value.Content)
		}
	}

	return nil
}

func mergeVersionedContent(base, source openapi3.Content) {
	if source == nil {
		return
	}

	for contentType, mediaType := range source {
		if _, exists := base[contentType]; !exists {
			base[contentType] = mediaType
		}
	}
}

func mergeVersionedComponents(base, source *openapi3.T) error {
	if source.Components == nil {
		return nil
	}

	if base.Components == nil {
		base.Components = &openapi3.Components{}
	}

	if err := mergeVersionedSchemas(base.Components, source.Components); err != nil {
		return err
	}

	if err := mergeVersionedParameters(base.Components, source.Components); err != nil {
		return err
	}

	if err := mergeVersionedResponses(base.Components, source.Components); err != nil {
		return err
	}

	return nil
}

func mergeVersionedSchemas(base, source *openapi3.Components) error {
	if source.Schemas == nil || len(source.Schemas) == 0 {
		return nil
	}

	if base.Schemas == nil {
		base.Schemas = make(openapi3.Schemas)
	}

	for name, schema := range source.Schemas {
		if _, exists := base.Schemas[name]; !exists {
			base.Schemas[name] = schema
		}
	}

	return nil
}

// mergeVersionedParameters merges parameters from source into base.
// Note: Parameters themselves are not versioned - they are shared reusable definitions
// that are the same across all API versions.
// This function ensures that all parameter definitions referenced by operations in the
// merged spec are included, avoiding duplicates.
func mergeVersionedParameters(base, source *openapi3.Components) error {
	if source.Parameters == nil || len(source.Parameters) == 0 {
		return nil
	}

	if base.Parameters == nil {
		base.Parameters = make(openapi3.ParametersMap)
	}

	for name, param := range source.Parameters {
		if _, exists := base.Parameters[name]; !exists {
			base.Parameters[name] = param
		}
	}

	return nil
}

func mergeVersionedResponses(base, source *openapi3.Components) error {
	if source.Responses == nil || len(source.Responses) == 0 {
		return nil
	}

	if base.Responses == nil {
		base.Responses = make(openapi3.ResponseBodies)
	}

	for name, response := range source.Responses {
		if _, exists := base.Responses[name]; !exists {
			base.Responses[name] = response
		}
	}

	return nil
}

// mergeVersionedTags merges tags from source into base, avoiding duplicates.
// Note: Tags themselves are not versioned - they are shared and remain
// consistent across API versions. This function ensures that all tags used by
// operations in the merged spec are included.
func mergeVersionedTags(base, source *openapi3.T) error {
	if source.Tags == nil || len(source.Tags) == 0 {
		return nil
	}

	if base.Tags == nil {
		base.Tags = source.Tags
		return nil
	}

	existingTags := make(map[string]bool)
	for _, tag := range base.Tags {
		existingTags[tag.Name] = true
	}

	for _, tag := range source.Tags {
		if !existingTags[tag.Name] {
			base.Tags = append(base.Tags, tag)
		}
	}

	return nil
}
