package utils

import (
	"fmt"
	"github.com/getkin/kin-openapi/openapi3"
	"gopkg.in/yaml.v3"
	"os"
	"path/filepath"
)

// Structs for OpenAPI (simplified)
type OpenAPISpec struct {
	OpenAPI    string                 `yaml:"openapi"`
	Paths      map[string]interface{} `yaml:"paths"`
	Components *openapi3.Components   `yaml:"components,omitempty"`
}

func SplitOAS() error {
	originalInputFile := "openapi-foas.yaml"
	dirPath := "./split_specs"
	tagsOutputDir := dirPath + "/tags"
	schemaFile := dirPath + "/shared_components.yaml"

	// Ensure the directory exists
	err := os.MkdirAll(dirPath, os.ModePerm)
	if err != nil {
		return fmt.Errorf("Error creating directory: %v\n", err)
	}

	// Initialize loader
	loader := openapi3.NewLoader()

	// Load specs
	originalSpecInfo, err := loadSpec(loader, originalInputFile)
	if err != nil {
		return fmt.Errorf("failed to load original spec: %v", err)
	}

	// Save shared schemas
	sharedSchemas := map[string]interface{}{
		"components": originalSpecInfo.Spec.Components,
	}
	saveYAML(schemaFile, sharedSchemas)

	// Map to group paths by tags
	spec := originalSpecInfo.Spec
	tagFiles := make(map[string]map[string]interface{})

	// Iterate through paths
	pathsMap := spec.Paths.Map()
	for path, pathItem := range pathsMap {
		for _, operation := range pathItem.Operations() {
			for _, tag := range operation.Tags {
				// Initialize map for the tag if not already present
				if _, exists := tagFiles[tag]; !exists {
					tagFiles[tag] = make(map[string]interface{})
				}

				// Add the path and its operations to the tag group
				tagFiles[tag][path] = pathItem
				savePathMapTagging(path, tag)
			}
		}
	}

	// Write each tag's paths to a separate file
	for tag, paths := range tagFiles {
		tagDir := filepath.Join(tagsOutputDir, tag)
		os.MkdirAll(tagDir, 0755)

		tagFile := filepath.Join(tagDir, "spec.yaml")

		splitSpec := OpenAPISpec{
			OpenAPI: spec.OpenAPI,
			Paths:   paths,
		}
		if err := saveYAML(tagFile, splitSpec); err != nil {
			return fmt.Errorf("failed to save tag file for tag %s: %v", tag, err)
		}
		fmt.Printf("Saved spec for tag %s to %s\n", tag, tagFile)
	}

	writeMappingToFile("./path_to_key_mapping.json")
	fmt.Println("Splitting completed.")
	return nil
}

func loadYAML(filePath string, out interface{}) error {
	// Read the file contents
	data, err := os.ReadFile(filePath)
	if err != nil {
		return fmt.Errorf("failed to read file %s: %v", filePath, err)
	}

	// Unmarshal the YAML content
	if err := yaml.Unmarshal(data, out); err != nil {
		return fmt.Errorf("failed to unmarshal YAML content from file %s: %v", filePath, err)
	}

	return nil
}

func saveYAML(filePath string, content interface{}) error {
	data, err := yaml.Marshal(content)
	if err != nil {
		return fmt.Errorf("failed to marshal YAML: %v", err)
	}

	err = os.WriteFile(filePath, data, 0644)
	if err != nil {
		return fmt.Errorf("failed to write file: %v", err)
	}

	return nil
}
