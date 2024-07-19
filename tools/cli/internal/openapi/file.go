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
	"log"
	"strings"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/spf13/afero"
	"gopkg.in/yaml.v3"
)

const (
	JSON    = "json"
	YAML    = "yaml"
	DotYAML = ".yaml"
	DotJSON = ".json"
)

func SaveSpec(path string, oas *Spec, format string, fs afero.Fs) error {
	data, err := NewArrayBytesFromOAS(oas, path, format)
	if err != nil {
		return err
	}

	if err := afero.WriteFile(fs, path, data, 0o600); err != nil {
		return err
	}

	log.Printf("\nVersioned spec was saved in '%s'.\n\n", path)
	return nil
}

func NewArrayBytesFromOAS(oas *Spec, path, format string) ([]byte, error) {
	data, err := serializeToJSON(oas)
	if err != nil {
		return nil, err
	}

	if strings.Contains(path, DotJSON) || format == JSON {
		return data, nil
	}

	return serializeToYAML(data)
}

func serializeToJSON(oas *Spec) ([]byte, error) {
	buf := new(bytes.Buffer)
	enc := json.NewEncoder(buf)
	enc.SetEscapeHTML(false)
	enc.SetIndent("", "  ")
	err := enc.Encode(*oas)
	if err != nil {
		return nil, err
	}

	// enc.SetEscapeHTML(false) doesn't seem to work for Spec. Replace characters <>& manually.
	data := bytes.ReplaceAll(buf.Bytes(), []byte(`\u003c`), []byte("<"))
	data = bytes.ReplaceAll(data, []byte(`\u003e`), []byte(">"))
	data = bytes.ReplaceAll(data, []byte(`\u0026`), []byte("&"))
	return data, nil
}

func serializeToYAML(data []byte) ([]byte, error) {
	var jsonData interface{}
	if err := json.Unmarshal(data, &jsonData); err != nil {
		return nil, err
	}

	yamlData, err := yaml.Marshal(jsonData)
	if err != nil {
		return nil, err
	}

	return yamlData, nil
}

func Save(path string, oas *openapi3.T, format string, fs afero.Fs) error {
	return SaveSpec(path, newSpec(oas), format, fs)
}
