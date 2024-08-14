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
