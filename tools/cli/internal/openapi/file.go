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
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"strings"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/spf13/afero"
	"gopkg.in/yaml.v3"
)

const (
	JSON    = "json"
	YAML    = "yaml"
	ALL     = "all"
	DotYAML = ".yaml"
	DotJSON = ".json"
)

// SaveToFile saves the content to a file in the specified format.
// If format is empty or set to 'all', it saves the content in both JSON and YAML formats.
func SaveToFile[T any](path, format string, content T, fs afero.Fs) error {
	data, err := SerializeToJSON(content)
	if err != nil {
		return err
	}

	if format == ALL || format == "" {
		// strip . format from path
		path = strings.TrimSuffix(path, DotJSON)
		path = strings.TrimSuffix(path, DotYAML)
	}

	if format == JSON || format == "" || format == ALL {
		jsonPath := newPathWithExtension(path, JSON)
		if errJSON := afero.WriteFile(fs, jsonPath, data, 0o600); errJSON != nil {
			return errJSON
		}
		log.Printf("\nFile was saved in '%s'.\n\n", jsonPath)
	}

	if format == YAML || format == "" || format == ALL {
		dataYAML, err := SerializeToYAML(data)
		if err != nil {
			return err
		}

		path = newPathWithExtension(path, YAML)
		if err := afero.WriteFile(fs, path, dataYAML, 0o600); err != nil {
			return err
		}

		log.Printf("\nFile was saved in '%s'.\n\n", path)
	}

	return nil
}

func newPathWithExtension(path, extension string) string {
	if strings.Contains(path, DotJSON) || strings.Contains(path, DotYAML) {
		return path
	}

	return fmt.Sprintf("%s.%s", path, extension)
}

func NewArrayBytesFromOAS(oas *Spec, path, format string) ([]byte, error) {
	data, err := SerializeToJSON(oas)
	if err != nil {
		return nil, err
	}

	if strings.Contains(path, DotJSON) || format == JSON {
		return data, nil
	}

	return SerializeToYAML(data)
}

func SerializeToJSON[T any](data T) ([]byte, error) {
	buf := new(bytes.Buffer)
	enc := json.NewEncoder(buf)
	enc.SetEscapeHTML(false)
	enc.SetIndent("", "  ")
	err := enc.Encode(data)
	if err != nil {
		return nil, err
	}

	// enc.SetEscapeHTML(false) doesn't seem to work for Spec. Replace characters <>& manually.
	out := bytes.ReplaceAll(buf.Bytes(), []byte(`\u003c`), []byte("<"))
	out = bytes.ReplaceAll(out, []byte(`\u003e`), []byte(">"))
	out = bytes.ReplaceAll(out, []byte(`\u0026`), []byte("&"))
	return out, nil
}

func SerializeToYAML(data []byte) ([]byte, error) {
	var jsonData any
	if err := json.Unmarshal(data, &jsonData); err != nil {
		return nil, err
	}

	yamlData, err := yaml.Marshal(jsonData)
	if err != nil {
		return nil, err
	}

	return yamlData, nil
}

// Save saves the OpenAPI document to a file in the specified format. This is important for public
// OpenAPI documents as it ensures to follow the order of the Spec object.
func Save(path string, oas *openapi3.T, format string, fs afero.Fs) error {
	return SaveToFile(path, format, newSpec(oas), fs)
}

// ValidateFormatAndOutput validates the format and output file match.
func ValidateFormatAndOutput(format, output string) error {
	if format != JSON && format != YAML && format != ALL {
		return fmt.Errorf("format must be either 'json', 'yaml' or 'all', got '%s'", format)
	}

	if output != "" && !strings.Contains(output, DotJSON) && !strings.Contains(output, DotYAML) {
		return fmt.Errorf("output file must be either a JSON or YAML file, got %s", output)
	}

	if format == ALL || output == "" {
		return nil
	}

	if format == JSON && !strings.Contains(output, DotJSON) {
		return fmt.Errorf("output file and format mistmatch got format '%s' and output '%s'", format, output)
	}

	if format == YAML && !strings.Contains(output, DotYAML) {
		return fmt.Errorf("output file and format mistmatch got format '%s' and output '%s'", format, output)
	}

	return nil
}
