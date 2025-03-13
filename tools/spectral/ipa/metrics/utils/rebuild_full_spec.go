package utils

import (
	"fmt"
	"github.com/getkin/kin-openapi/openapi3"
	"github.com/invopop/yaml"
	"os"
)

func loadSpecYAMLFile(filePath string) (*OpenAPISpec, error) {
	data, err := os.ReadFile(filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to read file %s: %v", filePath, err)
	}

	var spec OpenAPISpec
	err = yaml.Unmarshal(data, &spec)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal YAML for file %s: %v", filePath, err)
	}

	return &spec, nil
}

func RebuildFullDeletedPathsSpec(tagFiles []string, sharedSchemasFile string, outputFile string) error {
	loader := openapi3.NewLoader()

	componentsSpec, err := loadSpec(loader, sharedSchemasFile)
	if err != nil {
		return fmt.Errorf("failed to load shared schemas: %v", err)
	}

	var deletedPathsSpec OpenAPISpec
	// Merge tag-specific paths
	for _, tagFile := range tagFiles {
		tagSpec, err := loadSpecYAMLFile(tagFile)
		if err != nil {
			return fmt.Errorf("failed to load tag file %s: %v", tagFile, err)
		}
		for path, pathItem := range tagSpec.Paths {
			deletedPathsSpec.Paths[path] = pathItem
		}
	}

	deletedPathsSpec.Components = componentsSpec.Spec.Components

	return saveYAML(outputFile, deletedPathsSpec)
}

func RebuildFullSpec(tagFile string, sharedSchemasFile string, outputFile string) error {
	loader := openapi3.NewLoader()

	componentsSpec, err := loadSpec(loader, sharedSchemasFile)
	if err != nil {
		return fmt.Errorf("failed to load shared schemas: %v", err)
	}

	// Merge tag-specific paths
	tagSpec, err := loadSpecYAMLFile(tagFile)
	if err != nil {
		return fmt.Errorf("failed to load tag file %s: %v", tagFile, err)
	}
	tagSpec.Components = componentsSpec.Spec.Components

	return saveYAML(outputFile, tagSpec)
}
