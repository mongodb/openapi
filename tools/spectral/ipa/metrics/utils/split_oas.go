package utils

import (
	"fmt"
	"github.com/invopop/yaml"
	"log"
	"os"
	"path"
)

// Structs for OpenAPI (simplified)
type OpenAPISpec struct {
	OpenAPI    string                 `yaml:"openapi"`
	Info       map[string]interface{} `yaml:"info"`
	Paths      map[string]interface{} `yaml:"paths"`
	Components map[string]interface{} `yaml:"components"`
}

func SplitOAS() {
	inputFile := "openapi-foas.yaml"
	dirPath := "./split_specs"
	outputDir := dirPath + "/tags"
	schemaFile := dirPath + "/shared_schemas.yaml"

	// Ensure the directory exists
	err := os.MkdirAll(dirPath, os.ModePerm)
	if err != nil {
		fmt.Printf("Error creating directory: %v\n", err)
		return
	}

	spec := parseOpenAPISpec(inputFile)

	// Save shared schemas
	sharedSchemas := map[string]interface{}{
		"components": map[string]interface{}{
			"schemas": spec.Components["schemas"],
		},
	}
	saveYAML(schemaFile, sharedSchemas)

	// Split by tags
	for pathKey, operations := range spec.Paths {
		operationsMap, ok := operations.(map[string]interface{})
		if !ok {
			continue
		}

		for method, details := range operationsMap {
			detailsMap, ok := details.(map[string]interface{})
			if !ok {
				continue
			}

			tags, ok := detailsMap["tags"].([]interface{})
			if !ok {
				continue
			}

			for _, tag := range tags {
				tagName := tag.(string)
				tagDir := path.Join(outputDir, tagName)
				os.MkdirAll(tagDir, 0755)

				tagFile := path.Join(tagDir, "spec.yaml")
				splitSpec := OpenAPISpec{
					OpenAPI: spec.OpenAPI,
					Info:    spec.Info,
					Paths: map[string]interface{}{
						pathKey: map[string]interface{}{
							method: detailsMap,
						},
					},
					Components: nil,
				}
				saveYAML(tagFile, splitSpec)
			}
		}
	}
	fmt.Println("Splitting completed.")
}

func parseOpenAPISpec(inputFile string) OpenAPISpec {
	// Read OpenAPI spec
	data, err := os.ReadFile(inputFile)
	if err != nil {
		log.Fatalf("Failed to read file: %v", err)
	}

	var spec OpenAPISpec
	err = yaml.Unmarshal(data, &spec)
	if err != nil {
		log.Fatalf("Failed to parse YAML: %v", err)
	}
	return spec
}

func saveYAML(filePath string, content interface{}) {
	data, err := yaml.Marshal(content)
	if err != nil {
		log.Fatalf("Failed to marshal YAML: %v", err)
	}
	err = os.WriteFile(filePath, data, 0644)
	if err != nil {
		log.Fatalf("Failed to write file: %v", err)
	}
}
