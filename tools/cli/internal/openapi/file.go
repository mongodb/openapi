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

	openapi3 "github.com/getkin/kin-openapi/openapi3"
	"github.com/spf13/afero"
	"gopkg.in/yaml.v3"
)

func SaveSpec(path string, oas *Spec, format string, fs afero.Fs) error {
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

func Save(path string, oas *openapi3.T, format string, fs afero.Fs) error {
	return SaveSpec(path, newSpec(oas), format, fs)
}
