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
	"testing"

	"github.com/getkin/kin-openapi/openapi3"
)

func TestAllOperationsHaveExtension(t *testing.T) {
	tests := []struct {
		name     string
		input    *openapi3.PathItem
		expected bool
	}{
		{
			name: "All operations have extension",
			input: &openapi3.PathItem{
				Get: &openapi3.Operation{
					Extensions: map[string]interface{}{
						"x-xgen-soa-migration": map[string]interface{}{
							"test": "true",
						},
					},
				},
				Put: &openapi3.Operation{
					Extensions: map[string]interface{}{
						"x-xgen-soa-migration": map[string]interface{}{
							"test": "true",
						},
					},
				},
				Post: &openapi3.Operation{
					Extensions: map[string]interface{}{
						"x-xgen-soa-migration": map[string]interface{}{
							"test": "true",
						},
					},
				},
				Patch: &openapi3.Operation{
					Extensions: map[string]interface{}{
						"x-xgen-soa-migration": map[string]interface{}{
							"test": "true",
						},
					},
				},
				Delete: &openapi3.Operation{
					Extensions: map[string]interface{}{
						"x-xgen-soa-migration": map[string]interface{}{
							"test": "true",
						},
					},
				},
			},
			expected: true,
		},
		{
			name: "Not all operations have extension",
			input: &openapi3.PathItem{
				Get: &openapi3.Operation{
					Extensions: map[string]interface{}{
						"x-xgen-soa-migration": map[string]interface{}{
							"test": "true",
						},
					},
				},
				Put: &openapi3.Operation{
					Extensions: map[string]interface{}{
						"x-xgen-sunset": "true",
					},
				},
			},
			expected: false,
		},
		{
			name:     "No operations",
			input:    &openapi3.PathItem{},
			expected: false,
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			actual := allOperationsHaveExtension(test.input, "/test", "x-xgen-soa-migration")
			if actual != test.expected {
				t.Errorf("Expected %t, got %t", test.expected, actual)
			}
		})
	}
}

func TestAllOperationsAllowDocsDiff(t *testing.T) {
	tests := []struct {
		name     string
		input    *openapi3.PathItem
		expected bool
	}{
		{
			name: "All operations allow docs diff",
			input: &openapi3.PathItem{
				Get: &openapi3.Operation{
					Extensions: map[string]interface{}{
						"x-xgen-soa-migration": map[string]interface{}{
							"allowDocsDiff": "true",
						},
					},
				},
				Put: &openapi3.Operation{
					Extensions: map[string]interface{}{
						"x-xgen-soa-migration": map[string]interface{}{
							"allowDocsDiff": "true",
						},
					},
				},
				Post: &openapi3.Operation{
					Extensions: map[string]interface{}{
						"x-xgen-soa-migration": map[string]interface{}{
							"allowDocsDiff": "true",
						},
					},
				},
				Patch: &openapi3.Operation{
					Extensions: map[string]interface{}{
						"x-xgen-soa-migration": map[string]interface{}{
							"allowDocsDiff": "true",
						},
					},
				},
				Delete: &openapi3.Operation{
					Extensions: map[string]interface{}{
						"x-xgen-soa-migration": map[string]interface{}{
							"allowDocsDiff": "true",
						},
					},
				},
			},
			expected: true,
		},
		{
			name: "Not all operations allow docs diff",
			input: &openapi3.PathItem{
				Get: &openapi3.Operation{
					Extensions: map[string]interface{}{
						"x-xgen-soa-migration": map[string]interface{}{
							"allowDocsDiff": "true",
						},
					},
				},
				Put: &openapi3.Operation{
					Extensions: map[string]interface{}{
						"x-xgen-soa-migration": map[string]interface{}{
							"allowDocsDiff": "false",
						},
					},
				},
			},
			expected: false,
		},
		{
			name:     "No operations",
			input:    &openapi3.PathItem{},
			expected: false,
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			actual := allOperationsAllowDocsDiff(test.input, "/test")
			if actual != test.expected {
				t.Errorf("Expected %t, got %t", test.expected, actual)
			}
		})
	}
}
