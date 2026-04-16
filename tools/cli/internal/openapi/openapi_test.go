// Copyright 2025 MongoDB Inc
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
	"reflect"
	"testing"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/stretchr/testify/require"
)

func TestSpec_MarshalJSON(t *testing.T) {
	minimalInfo := &openapi3.Info{Title: "Test API", Version: "1.0.0"}

	tests := []struct {
		name       string
		spec       *Spec
		jsonOutput string
		wantErr    bool
	}{
		{
			name: "spec with nil extensions",
			spec: &Spec{
				OpenAPI:    "3.0.3",
				Info:       minimalInfo,
				Paths:      &openapi3.Paths{},
				Extensions: nil,
			},
			jsonOutput: `{"info":{"title":"Test API","version":"1.0.0"},"openapi":"3.0.3","paths":{}}`,
			wantErr:    false,
		},
		{
			name: "spec with empty extensions",
			spec: &Spec{
				OpenAPI:    "3.0.3",
				Info:       minimalInfo,
				Paths:      &openapi3.Paths{},
				Extensions: map[string]any{},
			},
			jsonOutput: `{"info":{"title":"Test API","version":"1.0.0"},"openapi":"3.0.3","paths":{}}`,
			wantErr:    false,
		},
		{
			name: "spec with single string extension",
			spec: &Spec{
				OpenAPI: "3.0.3",
				Info:    minimalInfo,
				Paths:   &openapi3.Paths{},
				Extensions: map[string]any{
					"x-custom-string": "hello world",
				},
			},
			jsonOutput: `{
  "info": {
    "title": "Test API",
    "version": "1.0.0"
  },
  "openapi": "3.0.3",
  "paths": {},
  "x-custom-string": "hello world"
}`,
			wantErr: false,
		},
		{
			name: "spec with multiple extensions of different types",
			spec: &Spec{
				OpenAPI: "3.0.3",
				Info:    minimalInfo,
				Paths:   &openapi3.Paths{},
				Extensions: map[string]any{
					"x-custom-string": "hello",
					"x-custom-number": 123.45,
					"x-custom-bool":   true,
					"x-custom-null":   nil,
				},
			},
			jsonOutput: `{
  "info": {
    "title": "Test API",
    "version": "1.0.0"
  },
  "openapi": "3.0.3",
  "paths": {},
  "x-custom-bool": true,
  "x-custom-null": null,
  "x-custom-number": 123.45,
  "x-custom-string": "hello"
}`,
			wantErr: false,
		},
		{
			name: "spec with nested object extension",
			spec: &Spec{
				OpenAPI: "3.0.3",
				Info:    minimalInfo,
				Paths:   &openapi3.Paths{},
				Extensions: map[string]any{
					"x-custom-object": map[string]any{
						"key1": "value1",
						"key2": 100,
					},
				},
			},
			jsonOutput: `{
  "info": {
    "title": "Test API",
    "version": "1.0.0"
  },
  "openapi": "3.0.3",
  "paths": {},
  "x-custom-object": {
    "key1": "value1",
    "key2": 100
  }
}`,
			wantErr: false,
		},
		{
			name: "spec with array extension",
			spec: &Spec{
				OpenAPI: "3.0.3",
				Info:    minimalInfo,
				Paths:   &openapi3.Paths{},
				Extensions: map[string]any{
					"x-custom-array": []any{"a", 2, true, map[string]any{"nested": "item"}},
				},
			},
			jsonOutput: `{
  "info": {
    "title": "Test API",
    "version": "1.0.0"
  },
  "openapi": "3.0.3",
  "paths": {},
  "x-custom-array": [
    "a",
    2,
    true,
    {
      "nested": "item"
    }
  ]
}`,
			wantErr: false,
		},
		{
			name: "spec with extensions and other optional fields (e.g., components)",
			spec: &Spec{
				OpenAPI: "3.0.3",
				Info:    minimalInfo,
				Paths:   &openapi3.Paths{},
				Components: &openapi3.Components{
					Schemas: openapi3.Schemas{
						"MySchema": &openapi3.SchemaRef{
							Value: openapi3.NewObjectSchema().WithProperty("id", openapi3.NewIntegerSchema()),
						},
					},
				},
				Extensions: map[string]any{
					"x-marker": "present",
				},
			},
			jsonOutput: `{
  "components": {
    "schemas": {
      "MySchema": {
        "properties": {
          "id": {
            "type": "integer"
          }
        },
        "type": "object"
      }
    }
  },
  "info": {
    "title": "Test API",
    "version": "1.0.0"
  },
  "openapi": "3.0.3",
  "paths": {},
  "x-marker": "present"
}`,
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			gotBytes, err := tt.spec.MarshalJSON()
			require.NoError(t, err)

			var gotMap map[string]any
			err = json.Unmarshal(gotBytes, &gotMap)
			require.NoError(t, err)

			var wantMap map[string]any
			err = json.Unmarshal([]byte(tt.jsonOutput), &wantMap)
			require.NoError(t, err)
			if !reflect.DeepEqual(gotMap, wantMap) {
				gotPretty, _ := json.MarshalIndent(gotMap, "", "  ")
				wantPretty, _ := json.MarshalIndent(wantMap, "", "  ")
				t.Errorf("Spec.MarshalJSON() mismatch:\nGot:\n%s\nWant:\n%s", string(gotPretty), string(wantPretty))
			}
		})
	}
}
