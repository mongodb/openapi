package utils

import (
	"fmt"
	"github.com/getkin/kin-openapi/openapi3"
	"os"
	"path/filepath"
)

// UpdateTagFile updates the tag-specific file with new path data
func CreateOrUpdateTagFile(tag string, pathKey string, pathItem *openapi3.PathItem, specVersion string) error {
	outputDir := "./split_specs/tags"
	tagDir := filepath.Join(outputDir, tag)
	os.MkdirAll(tagDir, 0755)

	tagFile := filepath.Join(tagDir, "spec.yaml")

	// Initialize the OpenAPISpec structure
	var tagSpec OpenAPISpec

	// Check if the tag file exists
	if _, err := os.Stat(tagFile); err == nil {
		// File exists, load the existing spec
		loadYAML(tagFile, &tagSpec)
	} else {
		// File does not exist, initialize a new spec
		tagSpec = OpenAPISpec{
			OpenAPI: specVersion,
			Paths:   make(map[string]interface{}),
		}
	}

	// Update the paths for the tag
	tagSpec.Paths[pathKey] = pathItem

	// Save the updated spec back to the tag file
	if err := saveYAML(tagFile, tagSpec); err != nil {
		return fmt.Errorf("failed to save updated tag file %s: %v", tagFile, err)
	}

	fmt.Printf("Updated tag file: %s\n", tagFile)
	savePathMapTagging(pathKey, tag)
	writeMappingToFile("./path_to_key_mapping.json")
	return nil
}

func DeletePathFromTagFile(tag string, pathKey string) error {
	outputDir := "./split_specs/tags"
	tagDir := filepath.Join(outputDir, tag)
	os.MkdirAll(tagDir, 0755)

	tagFile := filepath.Join(tagDir, "spec.yaml")
	deletedTagFile := filepath.Join(tagDir, "spec-deleted.yaml")
	// Initialize the OpenAPISpec structure
	var tagSpec OpenAPISpec
	var deletedPathSpec OpenAPISpec

	// Check if the tag file exists
	if _, err := os.Stat(tagFile); err == nil {
		// File exists, load the existing spec
		loadYAML(tagFile, &tagSpec)
	} else {
		// File does not exist
		return fmt.Errorf("file does not exist %s: %v", tagFile, err)
	}

	//Check if deleted path file exists
	if _, err := os.Stat(deletedTagFile); err == nil {
		// File exists, load the existing spec
		loadYAML(deletedTagFile, &deletedPathSpec)
	} else {
		// File does not exist
		deletedPathSpec = OpenAPISpec{
			OpenAPI: tagSpec.OpenAPI,
			Paths:   make(map[string]interface{}),
		}
	}

	deletedPathItem := tagSpec.Paths[pathKey]
	deletedPathSpec.Paths[pathKey] = deletedPathItem

	// Update the paths for the tag
	delete(tagSpec.Paths, pathKey)

	// Save the updated spec back to the tag file
	if err := saveYAML(tagFile, tagSpec); err != nil {
		return fmt.Errorf("failed to save updated tag file %s: %v", tagFile, err)
	}

	if err := saveYAML(deletedTagFile, deletedPathSpec); err != nil {
		return fmt.Errorf("failed to save deleted path file %s: %v", tagFile, err)
	}

	fmt.Printf("Updated tag file: %s\n", tagFile)
	savePathMapTagging(pathKey, tag)
	writeMappingToFile("./path_to_key_mapping.json")
	return nil
}

func getTagForPath(pathKey string, operations *openapi3.PathItem) string {
	operationsMap := operations.Operations()
	for _, details := range operationsMap {

		tags := details.Tags

		tagName := tags[0]
		return tagName
	}

	return ""
}
