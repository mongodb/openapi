package internal

import (
	"log"
	"os"

	yaml "gopkg.in/yaml.v2"
)

type ExceptionConfig struct {
	Exceptions []*Exception `yaml:"exceptions"`
}

type Exception struct {
	Description       string `yaml:"breaking_change_description"`
	ExemptUntil       string `yaml:"exempt_until"`
	Reason            string `yaml:"reason"`
	HideFromChangelog bool   `yaml:"hide_from_changelog"`
}

// NewExceptionConfig reads the exception YAML file and returns an ExceptionConfig object.
func NewExceptionConfig(path string) (*ExceptionConfig, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		log.Fatalf("Error reading exception file: %v", err)
		return nil, err
	}

	var config *ExceptionConfig
	err = yaml.Unmarshal(data, &config)
	if err != nil {
		log.Fatalf("Error parsing YAML file: %v", err)
	}

	return config, nil
}
