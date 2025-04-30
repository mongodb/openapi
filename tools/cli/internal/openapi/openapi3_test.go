// Copyright 2024 MongoDB Inc
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package openapi

import "testing"

func TestNormalizeMediaType(t *testing.T) {
	tests := []struct {
		name     string
		input    []byte
		expected string
	}{
		{
			name: "OpenAPI spec with versioned media type",
			input: []byte(`{
  "/api/atlas/v2/alertConfigs/matchers/fieldNames": {
    "get": {
      "responses": {
        "200": {
          "content": {
            "application/vnd.atlas.2023-01-01+json": {
              "schema": {
                "items": { "$ref": "#/components/schemas/MatcherFieldView" },
                "type": "array"
              },
              "x-xgen-version": "2023-01-01"
            }
          },
          "description": "OK"
        },
        "401": { "$ref": "#/components/responses/unauthorized" },
        "500": { "$ref": "#/components/responses/internalServerError" }
      }
    }
  }
}`),
			expected: `{
  "/api/atlas/v2/alertConfigs/matchers/fieldNames": {
    "get": {
      "responses": {
        "200": {
          "content": {
            "application/json": {
              "schema": {
                "items": { "$ref": "#/components/schemas/MatcherFieldView" },
                "type": "array"
              },
              "x-xgen-version": "2023-01-01"
            }
          },
          "description": "OK"
        },
        "401": { "$ref": "#/components/responses/unauthorized" },
        "500": { "$ref": "#/components/responses/internalServerError" }
      }
    }
  }
}`,
		},
		{
			name: "OpenAPI spec without versioned media type",
			input: []byte(`{
  "/api/atlas/v2/alertConfigs/matchers/fieldNames": {
    "get": {
      "responses": {
        "200": {
          "content": {
            "application/json": {
              "schema": {
                "items": { "$ref": "#/components/schemas/MatcherFieldView" },
                "type": "array"
              },
              "x-xgen-version": "2023-01-01"
            }
          },
          "description": "OK"
        },
        "401": { "$ref": "#/components/responses/unauthorized" },
        "500": { "$ref": "#/components/responses/internalServerError" }
      }
    }
  }
}`),
			expected: `{
  "/api/atlas/v2/alertConfigs/matchers/fieldNames": {
    "get": {
      "responses": {
        "200": {
          "content": {
            "application/json": {
              "schema": {
                "items": { "$ref": "#/components/schemas/MatcherFieldView" },
                "type": "array"
              },
              "x-xgen-version": "2023-01-01"
            }
          },
          "description": "OK"
        },
        "401": { "$ref": "#/components/responses/unauthorized" },
        "500": { "$ref": "#/components/responses/internalServerError" }
      }
    }
  }
}`,
		},
		{
			name:     "Empty input",
			input:    []byte(``),
			expected: ``,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			actual := normalizeMediaType(tt.input)
			if actual != tt.expected {
				t.Errorf("normalizeMediaType() = %v, want %v", actual, tt.expected)
			}
		})
	}
}
