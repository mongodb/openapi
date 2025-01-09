package utils

import (
	"encoding/json"
	"fmt"
	"os"
)

// PathTagMapping represents a map from paths to tags.
type PathTagMapping map[string]string

func loadMappingFromFile(fileName string) (PathTagMapping, error) {
	data, err := os.ReadFile(fileName)
	if err != nil {
		return nil, fmt.Errorf("failed to read mapping file: %v", err)
	}

	var mapping PathTagMapping
	if err := json.Unmarshal(data, &mapping); err != nil {
		return nil, fmt.Errorf("failed to parse mapping file: %v", err)
	}
	return mapping, nil
}

func writeMappingToFile(fileName string) error {
	file, err := os.Create(fileName)
	if err != nil {
		return fmt.Errorf("failed to create file: %v", err)
	}
	defer file.Close()

	encoder := json.NewEncoder(file)
	encoder.SetIndent("", "  ")
	if err := encoder.Encode(mapping); err != nil {
		return fmt.Errorf("failed to write mapping to file: %v", err)
	}
	return nil
}

var mapping PathTagMapping

func savePathMapTagging(path string, tag string) {
	if mapping == nil {
		mapping = make(map[string]string)
	}

	mapping[path] = tag
}
