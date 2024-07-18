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

package filter

import (
	"reflect"
	"testing"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestIsOperationHiddenForEnv(t *testing.T) {
	tests := []struct {
		name       string
		operation  *openapi3.Operation
		metadata   *Metadata
		wantHidden bool
	}{
		{
			name: "Hidden environment matches target environment",
			operation: &openapi3.Operation{
				Extensions: map[string]interface{}{
					hiddenEnvsExtension: map[string]interface{}{
						"envs": "prod",
					},
				},
			},
			metadata: &Metadata{
				targetEnv: "prod",
			},
			wantHidden: true,
		},
		{
			name: "Hidden environment matches target environment, multiple environments",
			operation: &openapi3.Operation{
				Extensions: map[string]interface{}{
					hiddenEnvsExtension: map[string]interface{}{
						"envs": "prod,dev,staging,prod",
					},
				},
			},
			metadata: &Metadata{
				targetEnv: "dev",
			},
			wantHidden: true,
		},
		{
			name: "Hidden environment does not match target environment",
			operation: &openapi3.Operation{
				Extensions: map[string]interface{}{
					hiddenEnvsExtension: map[string]interface{}{
						"envs": "staging",
					},
				},
			},
			metadata: &Metadata{
				targetEnv: "prod",
			},
			wantHidden: false,
		},
		{
			name: "Hidden environment does not match target environment, empty envs",
			operation: &openapi3.Operation{
				Extensions: map[string]interface{}{
					hiddenEnvsExtension: map[string]interface{}{
						"envs": "",
					},
				},
			},
			metadata: &Metadata{
				targetEnv: "prod",
			},
			wantHidden: false,
		},
		{
			name: "No hidden environment extension",
			operation: &openapi3.Operation{
				Extensions: map[string]interface{}{
					hiddenEnvsExtension: map[string]interface{}{
						"envs": "no",
					},
				},
			},
			metadata: &Metadata{
				targetEnv: "prod",
			},
			wantHidden: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			filter := HiddenEnvsFilter{
				metadata: tt.metadata,
			}
			got := filter.isOperationHiddenForEnv(tt.operation)
			if got != tt.wantHidden {
				t.Errorf("isOperationHiddenForEnv() = %v, want %v", got, tt.wantHidden)
			}
		})
	}
}

func TestIsPathHiddenForEnv(t *testing.T) {
	tests := []struct {
		name       string
		pathItem   *openapi3.PathItem
		metadata   *Metadata
		wantHidden bool
	}{
		{
			name: "Hidden environment matches target environment",
			pathItem: &openapi3.PathItem{
				Extensions: map[string]interface{}{
					hiddenEnvsExtension: map[string]interface{}{
						"envs": "prod",
					},
				},
			},
			metadata: &Metadata{
				targetEnv: "prod",
			},
			wantHidden: true,
		},
		{
			name: "Hidden environment matches target environment, multiple environments",
			pathItem: &openapi3.PathItem{
				Extensions: map[string]interface{}{
					hiddenEnvsExtension: map[string]interface{}{
						"envs": "prod,dev,staging,prod",
					},
				},
			},
			metadata: &Metadata{
				targetEnv: "dev",
			},
			wantHidden: true,
		},
		{
			name: "Hidden environment does not match target environment",
			pathItem: &openapi3.PathItem{
				Extensions: map[string]interface{}{
					hiddenEnvsExtension: map[string]interface{}{
						"envs": "staging",
					},
				},
			},
			metadata: &Metadata{
				targetEnv: "prod",
			},
			wantHidden: false,
		},
		{
			name: "Hidden environment does not match target environment, empty envs",
			pathItem: &openapi3.PathItem{
				Extensions: map[string]interface{}{
					hiddenEnvsExtension: map[string]interface{}{
						"envs": "",
					},
				},
			},
			metadata: &Metadata{
				targetEnv: "prod",
			},
			wantHidden: false,
		},
		{
			name: "No hidden environment extension",
			pathItem: &openapi3.PathItem{
				Extensions: map[string]interface{}{},
			},
			metadata: &Metadata{
				targetEnv: "prod",
			},
			wantHidden: false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			filter := HiddenEnvsFilter{
				metadata: tt.metadata,
			}
			got := filter.isPathHiddenForEnv(tt.pathItem)
			if got != tt.wantHidden {
				t.Errorf("isPathHiddenForEnv() = %v, want %v", got, tt.wantHidden)
			}
		})
	}
}

func TestIsRequestBodyHiddenForEnv(t *testing.T) {
	tests := []struct {
		name        string
		requestBody *openapi3.RequestBodyRef
		metadata    *Metadata
		wantHidden  bool
	}{
		{
			name: "Hidden environment matches target environment",
			requestBody: &openapi3.RequestBodyRef{
				Extensions: map[string]interface{}{
					hiddenEnvsExtension: map[string]interface{}{
						"envs": "prod",
					},
				},
			},
			metadata: &Metadata{
				targetEnv: "prod",
			},
			wantHidden: true,
		},
		{
			name: "Hidden environment matches target environment, multiple environments",
			requestBody: &openapi3.RequestBodyRef{
				Extensions: map[string]interface{}{
					hiddenEnvsExtension: map[string]interface{}{
						"envs": "prod,dev,staging,prod",
					},
				},
			},
			metadata: &Metadata{
				targetEnv: "dev",
			},
			wantHidden: true,
		},
		{
			name: "Hidden environment does not match target environment",
			requestBody: &openapi3.RequestBodyRef{
				Extensions: map[string]interface{}{
					hiddenEnvsExtension: map[string]interface{}{
						"envs": "staging",
					},
				},
			},
			metadata: &Metadata{
				targetEnv: "prod",
			},
			wantHidden: false,
		},
		{
			name: "Hidden environment does not match target environment, empty envs",
			requestBody: &openapi3.RequestBodyRef{
				Extensions: map[string]interface{}{
					hiddenEnvsExtension: map[string]interface{}{
						"envs": "",
					},
				},
			},
			metadata: &Metadata{
				targetEnv: "prod",
			},
			wantHidden: false,
		},
		{
			name: "No hidden environment extension",
			requestBody: &openapi3.RequestBodyRef{
				Extensions: map[string]interface{}{
					"other-extension": map[string]interface{}{
						"envs": "no",
					},
				},
			},
			metadata: &Metadata{
				targetEnv: "prod",
			},
			wantHidden: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			filter := HiddenEnvsFilter{
				metadata: tt.metadata,
			}
			got := filter.isRequestBodyHiddenForEnv(tt.requestBody)
			if got != tt.wantHidden {
				t.Errorf("isRequestBodyHiddenForEnv() = %v, want %v", got, tt.wantHidden)
			}
		})
	}
}

func TestIsResponseHiddenForEnv(t *testing.T) {
	tests := []struct {
		name       string
		response   *openapi3.ResponseRef
		metadata   *Metadata
		wantHidden bool
	}{
		{
			name: "Hidden environment matches target environment",
			response: &openapi3.ResponseRef{
				Extensions: map[string]interface{}{
					hiddenEnvsExtension: map[string]interface{}{
						"envs": "prod",
					},
				},
			},
			metadata: &Metadata{
				targetEnv: "prod",
			},
			wantHidden: true,
		},
		{
			name: "Hidden environment matches target environment, multiple environments",
			response: &openapi3.ResponseRef{
				Extensions: map[string]interface{}{
					hiddenEnvsExtension: map[string]interface{}{
						"envs": "prod,dev,staging,prod",
					},
				},
			},
			metadata: &Metadata{
				targetEnv: "dev",
			},
			wantHidden: true,
		},
		{
			name: "Hidden environment does not match target environment",
			response: &openapi3.ResponseRef{
				Extensions: map[string]interface{}{
					hiddenEnvsExtension: map[string]interface{}{
						"envs": "staging",
					},
				},
			},
			metadata: &Metadata{
				targetEnv: "prod",
			},
			wantHidden: false,
		},
		{
			name: "Hidden environment does not match target environment, empty envs",
			response: &openapi3.ResponseRef{
				Extensions: map[string]interface{}{
					hiddenEnvsExtension: map[string]interface{}{
						"envs": "",
					},
				},
			},
			metadata: &Metadata{
				targetEnv: "prod",
			},
			wantHidden: false,
		},
		{
			name: "No hidden environment extension",
			response: &openapi3.ResponseRef{
				Extensions: map[string]interface{}{
					"other-extension": map[string]interface{}{
						"envs": "no",
					},
				},
			},
			metadata: &Metadata{
				targetEnv: "prod",
			},
			wantHidden: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			filter := HiddenEnvsFilter{
				metadata: tt.metadata,
			}
			got := filter.isResponseHiddenForEnv(tt.response)
			if got != tt.wantHidden {
				t.Errorf("isResponseHiddenForEnv() = %v, want %v", got, tt.wantHidden)
			}
		})
	}
}

func TestApplyOnPath(t *testing.T) {
	tests := []struct {
		name     string
		input    *openapi3.PathItem
		metadata *Metadata
		expected *openapi3.PathItem
	}{
		{
			name: "Operation Hidden extension matches target environment",
			input: &openapi3.PathItem{
				Get: &openapi3.Operation{
					Extensions: map[string]interface{}{
						hiddenEnvsExtension: map[string]interface{}{
							"envs": "prod",
						},
					},
					Summary: "test",
				},
			},
			metadata: &Metadata{
				targetEnv: "prod",
			},
			expected: &openapi3.PathItem{
				Get: nil,
			},
		},
		{
			name: "Operation Hidden extension does not matches target environment",
			input: &openapi3.PathItem{
				Get: &openapi3.Operation{
					Extensions: map[string]interface{}{
						hiddenEnvsExtension: map[string]interface{}{
							"envs": "dev",
						},
					},
				},
			},
			metadata: &Metadata{
				targetEnv: "prod",
			},
			expected: &openapi3.PathItem{
				Get: &openapi3.Operation{
					Extensions: map[string]interface{}{},
				},
			},
		},
		{
			name: "Response Hidden extension matches target environment",
			input: &openapi3.PathItem{
				Get: &openapi3.Operation{
					Summary: "test",
					Responses: openapi3.NewResponses(
						openapi3.WithName("200",
							&openapi3.Response{
								Extensions: map[string]interface{}{
									hiddenEnvsExtension: map[string]interface{}{
										"envs": "prod",
									},
								},
							}),
						openapi3.WithName("400", &openapi3.Response{}),
					),
				},
			},
			metadata: &Metadata{
				targetEnv: "prod",
			},
			expected: &openapi3.PathItem{
				Get: &openapi3.Operation{
					Summary: "test",
					Responses: openapi3.NewResponses(
						openapi3.WithName("400", &openapi3.Response{}),
					),
				},
			},
		},
		{
			name: "Response Hidden extension doesn't match target environment",
			input: &openapi3.PathItem{
				Get: &openapi3.Operation{
					Summary: "test",
					Responses: openapi3.NewResponses(
						openapi3.WithName("200",
							&openapi3.Response{
								Extensions: map[string]interface{}{
									hiddenEnvsExtension: map[string]interface{}{
										"envs": "prod",
									},
								},
							}),
						openapi3.WithName("400", &openapi3.Response{}),
					),
				},
			},
			metadata: &Metadata{
				targetEnv: "dev",
			},
			expected: &openapi3.PathItem{
				Get: &openapi3.Operation{
					Summary: "test",
					Responses: openapi3.NewResponses(
						openapi3.WithName("200",
							&openapi3.Response{
								Extensions: map[string]interface{}{
									hiddenEnvsExtension: map[string]interface{}{
										"envs": "prod",
									},
								},
							}),
						openapi3.WithName("400", &openapi3.Response{}),
					),
				},
			},
		},
		{
			name: "RequestBody Hidden extension matches target environment",
			input: &openapi3.PathItem{
				Get: &openapi3.Operation{
					Summary: "test",
					Responses: openapi3.NewResponses(
						openapi3.WithName("400", &openapi3.Response{}),
					),
					RequestBody: &openapi3.RequestBodyRef{
						Extensions: map[string]interface{}{
							hiddenEnvsExtension: map[string]interface{}{
								"envs": "prod",
							},
						},
					},
				},
			},
			metadata: &Metadata{
				targetEnv: "prod",
			},
			expected: &openapi3.PathItem{
				Get: &openapi3.Operation{
					Summary: "test",
					Responses: openapi3.NewResponses(
						openapi3.WithName("400", &openapi3.Response{}),
					),
					RequestBody: nil,
				},
			},
		},

		{
			name: "RequestBody Hidden extension doesn't match target environment",
			input: &openapi3.PathItem{
				Get: &openapi3.Operation{
					Summary: "test",
					Responses: openapi3.NewResponses(
						openapi3.WithName("400", &openapi3.Response{}),
					),
					RequestBody: &openapi3.RequestBodyRef{
						Extensions: map[string]interface{}{
							hiddenEnvsExtension: map[string]interface{}{
								"envs": "prod",
							},
						},
					},
				},
			},
			metadata: &Metadata{
				targetEnv: "dev",
			},
			expected: &openapi3.PathItem{
				Get: &openapi3.Operation{
					Summary: "test",
					Responses: openapi3.NewResponses(
						openapi3.WithName("400", &openapi3.Response{}),
					),
					RequestBody: &openapi3.RequestBodyRef{
						Extensions: map[string]interface{}{},
					},
				},
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			filter := HiddenEnvsFilter{
				metadata: tt.metadata,
			}
			err := filter.applyOnPath(tt.input)
			require.NoError(t, err)
			if !reflect.DeepEqual(tt.expected, tt.input) {
				t.Errorf("expected %v, got %v", tt.expected, tt.input)
			}
		})
	}
}

func TestIsContentTypeHiddenForEnv(t *testing.T) {
	tests := []struct {
		name      string
		envs      string
		targetEnv string
		expected  bool
	}{
		{"Hidden for target env", "prod", "prod", true},
		{"Not hidden, no extension", "", "prod", false},
		{"Hidden for different env", "dev", "prod", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			contentType := &openapi3.MediaType{
				Extensions: map[string]interface{}{
					hiddenEnvsExtension: map[string]interface{}{
						hiddenEnvsExtKey: tt.envs,
					},
				},
			}
			f := HiddenEnvsFilter{metadata: &Metadata{targetEnv: tt.targetEnv}}
			result := f.isContentTypeHiddenForEnv(contentType)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestRemoveContentIfHiddenForEnv(t *testing.T) {
	tests := []struct {
		name        string
		envs        string
		targetEnv   string
		shouldBeNil bool
	}{
		{"Remove if hidden for target env", "prod", "prod", true},
		{"Do not remove if no extension", "", "prod", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			contentType := &openapi3.MediaType{
				Schema: &openapi3.SchemaRef{},
				Extensions: map[string]interface{}{
					hiddenEnvsExtension: map[string]interface{}{
						hiddenEnvsExtKey: tt.envs,
					},
				},
			}
			f := HiddenEnvsFilter{metadata: &Metadata{targetEnv: tt.targetEnv}}
			f.removeContentIfHiddenForEnv(contentType)
			assert.Equal(t, tt.shouldBeNil, contentType.Schema == nil)
		})
	}
}

func TestApply(t *testing.T) {
	metadata := &Metadata{
		targetEnv: "prod",
	}

	oas := getApplyOas()
	filter := HiddenEnvsFilter{
		oas:      oas,
		metadata: metadata,
	}

	err := filter.Apply()
	require.NoError(t, err)
	assert.NotContains(t, oas.Paths.Map(), "/api/atlas/v2/groups/{groupId}/streams")
	assert.Contains(t, oas.Paths.Map(), "/api/atlas/v2/groups/{groupId}/streams/{tenantName}/auditLogs")
}

func getApplyOas() *openapi3.T {
	oas := &openapi3.T{}
	oas.Paths = &openapi3.Paths{}
	hiddenFromProd := &openapi3.PathItem{
		Extensions: map[string]interface{}{
			hiddenEnvsExtension: map[string]interface{}{
				"envs": "prod",
			},
		},
	}

	hiddenFromDev := &openapi3.PathItem{
		Extensions: map[string]interface{}{
			hiddenEnvsExtension: map[string]interface{}{
				"envs": "dev",
			},
		},
	}

	oas.Paths.Set("/api/atlas/v2/groups/{groupId}/streams", hiddenFromProd)
	oas.Paths.Set("/api/atlas/v2/groups/{groupId}/streams/{tenantName}/auditLogs", hiddenFromDev)

	return oas
}
