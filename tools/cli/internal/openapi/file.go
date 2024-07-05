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
package openapi

import (
	"encoding/json"
	"log"
	"strings"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/spf13/afero"
	load "github.com/tufin/oasdiff/load"
	"gopkg.in/yaml.v3"
)

func Load(path string) *openapi3.T {
	openapi3.CircularReferenceCounter = 15

	loader := openapi3.NewLoader()
	s1, err := load.NewSpecInfo(loader, load.NewSource(path))
	if err != nil {
		log.Fatalf("Failed to load OpenAPI document: %v", err)
	}

	return s1.Spec
}

func Save(path string, oas *openapi3.T, format string, fs afero.Fs) error {
	data, err := json.MarshalIndent(*oas, "", "  ")
	if err != nil {
		return err
	}

	if strings.Contains(path, ".yaml") || format == "yaml" {
		var jsonData interface{}
		if err := json.Unmarshal(data, &jsonData); err != nil {
			return err
		}

		yamlData, err := yaml.Marshal(jsonData)
		if err != nil {
			return err
		}

		data = yamlData
	}

	if err := afero.WriteFile(fs, path, data, 0o600); err != nil {
		return err
	}

	log.Printf("\nVersioned spec was saved in '%s'.\n\n", path)
	return nil
}
