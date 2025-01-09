package utils

import (
	"fmt"
	"github.com/getkin/kin-openapi/openapi3"
	"github.com/tufin/oasdiff/diff"
	"github.com/tufin/oasdiff/load"
	"log"
	"reflect"
)

type tagSet map[string]struct{}

func extractNewRevisionComponents() error {
	updatedInputFile := "openapi-foas-updated.yaml"
	schemaFile := "./split_specs/shared_components.yaml"

	// Initialize loader
	loader := openapi3.NewLoader()

	// Load specs
	updatedSpecInfo, err := loadSpec(loader, updatedInputFile)
	if err != nil {
		return fmt.Errorf("failed to load original spec: %v", err)
	}

	// Save shared schemas
	sharedSchemas := map[string]interface{}{
		"components": updatedSpecInfo.Spec.Components,
	}
	saveYAML(schemaFile, sharedSchemas)
	return nil
}

func DetectChanges() tagSet {
	mappingsFile := "./path_to_key_mapping.json"
	mapping, err := loadMappingFromFile(mappingsFile)
	if err != nil {
		log.Fatal(err)
	}

	affectedTags := tagSet{}

	pathsDiff, componentsDiff, err, _, updatedSpecInfo := GetOASChanges()
	if err != nil {
		log.Fatal(err)
	}

	if isAnyComponentDiffNotNil(componentsDiff) {
		extractNewRevisionComponents()
	}

	if !pathsDiff.Added.Empty() {
		for path := range pathsDiff.Added.ToStringSet() {
			operations := pathsDiff.Revision.Find(path)
			tagName := getTagForPath(path, operations)
			CreateOrUpdateTagFile(tagName, path, operations, updatedSpecInfo.Spec.OpenAPI)
			affectedTags[tagName] = struct{}{}
		}
	}

	if !pathsDiff.Deleted.Empty() {
		for pathKey := range pathsDiff.Deleted.ToStringSet() {
			tagName := mapping[pathKey]
			affectedTags[tagName] = struct{}{}
		}
	}

	if len(pathsDiff.Modified) != 0 {
		for path, _ := range pathsDiff.Modified {
			tagName := mapping[path]
			affectedTags[tagName] = struct{}{}
		}
	}

	return affectedTags

}

func GetOASChanges() (*diff.PathsDiff, diff.ComponentsDiff, error, *load.SpecInfo, *load.SpecInfo) {
	// File paths for the original and updated OpenAPI specs
	originalSpec := "openapi-foas.yaml"
	updatedSpec := "openapi-foas-updated.yaml"

	// Initialize loader
	loader := openapi3.NewLoader()

	// Load specs
	original, err := loadSpec(loader, originalSpec)
	if err != nil {
		return nil, diff.ComponentsDiff{}, fmt.Errorf("failed to load original spec: %v", err), nil, nil
	}

	updated, err := loadSpec(loader, updatedSpec)
	if err != nil {
		return nil, diff.ComponentsDiff{}, fmt.Errorf("failed to load updated spec: %v", err), nil, nil
	}

	config := diff.NewConfig()
	changes, _, err := diff.GetWithOperationsSourcesMap(config, original, updated)
	if err != nil {
		return nil, diff.ComponentsDiff{}, fmt.Errorf("failed to compute diff: %v", err), nil, nil
	}

	if changes == nil {
		return nil, diff.ComponentsDiff{}, fmt.Errorf("no changes detected between the specs"), nil, nil
	}

	// Print the changes
	fmt.Printf("Changes detected between %s and %s:\n", originalSpec, updatedSpec)
	fmt.Println(changes.PathsDiff)
	return changes.PathsDiff, changes.ComponentsDiff, nil, original, updated
}

func isAnyComponentDiffNotNil(diff diff.ComponentsDiff) bool {
	v := reflect.ValueOf(diff)
	// Iterate over the struct fields
	for i := 0; i < v.NumField(); i++ {
		// Get the field
		fieldValue := v.Field(i)
		// If the field is a pointer and not nil, return true
		if fieldValue.IsValid() && !fieldValue.IsNil() {
			return true
		}
	}
	return false
}
