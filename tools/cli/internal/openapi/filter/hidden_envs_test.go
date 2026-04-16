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
	"github.com/mongodb/openapi/tools/cli/internal/apiversion"
	"github.com/mongodb/openapi/tools/cli/internal/pointer"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestIsOperationHiddenForEnv(t *testing.T) {
	previewVersion, err := apiversion.New(apiversion.WithVersion(apiversion.PreviewStabilityLevel))
	require.NoError(t, err)
	upcomingVersion, err := apiversion.New(apiversion.WithVersion("2024-08-05.upcoming"))
	require.NoError(t, err)

	tests := []struct {
		name       string
		operation  *openapi3.Operation
		metadata   *Metadata
		wantHidden bool
	}{
		{
			name: "Hidden environment matches target environment",
			operation: &openapi3.Operation{
				Extensions: map[string]any{
					hiddenEnvsExtension: map[string]any{
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
				Extensions: map[string]any{
					hiddenEnvsExtension: map[string]any{
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
				Extensions: map[string]any{
					hiddenEnvsExtension: map[string]any{
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
				Extensions: map[string]any{
					hiddenEnvsExtension: map[string]any{
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
				Extensions: map[string]any{
					hiddenEnvsExtension: map[string]any{
						"envs": "no",
					},
				},
			},
			metadata: &Metadata{
				targetEnv: "prod",
			},
			wantHidden: false,
		},
		{
			name: "Operation with targetVersion = preview and stable response content",
			operation: &openapi3.Operation{
				Extensions: map[string]any{},
				Responses: openapi3.NewResponses(openapi3.WithName("200", &openapi3.Response{
					Description: pointer.Get("Success"),
					Content: map[string]*openapi3.MediaType{
						"application/vnd.atlas.2024-08-05+json": {
							Schema: &openapi3.SchemaRef{
								Extensions: map[string]any{
									"envs": "prod",
								},
							},
						},
					},
				})),
			},
			metadata: &Metadata{
				targetEnv:     "prod",
				targetVersion: previewVersion,
			},
			wantHidden: true,
		},
		{
			name: "Operation with targetVersion = preview and preview response content",
			operation: &openapi3.Operation{
				Extensions: map[string]any{},
				Responses: openapi3.NewResponses(openapi3.WithName("200", &openapi3.Response{
					Description: pointer.Get("Success"),
					Content: map[string]*openapi3.MediaType{
						"application/vnd.atlas.preview+json": {
							Schema: &openapi3.SchemaRef{
								Extensions: map[string]any{
									"envs": "dev",
								},
							},
						},
					},
				})),
			},
			metadata: &Metadata{
				targetEnv:     "prod",
				targetVersion: previewVersion,
			},
			wantHidden: false,
		},
		{
			name: "Operation with targetVersion = upcoming and stable response content",
			operation: &openapi3.Operation{
				Extensions: map[string]any{},
				Responses: openapi3.NewResponses(openapi3.WithName("200", &openapi3.Response{
					Description: pointer.Get("Success"),
					Content: map[string]*openapi3.MediaType{
						"application/vnd.atlas.2024-08-05+json": {
							Schema: &openapi3.SchemaRef{
								Extensions: map[string]any{
									"envs": "prod",
								},
							},
						},
					},
				})),
			},
			metadata: &Metadata{
				targetEnv:     "prod",
				targetVersion: upcomingVersion,
			},
			wantHidden: true,
		},
		{
			name: "Operation with targetVersion = upcoming and upcoming response content",
			operation: &openapi3.Operation{
				Extensions: map[string]any{},
				Responses: openapi3.NewResponses(openapi3.WithName("200", &openapi3.Response{
					Description: pointer.Get("Success"),
					Content: map[string]*openapi3.MediaType{
						"application/vnd.atlas.2024-08-05.upcoming+json": {
							Schema: &openapi3.SchemaRef{
								Extensions: map[string]any{
									"envs": "dev",
								},
							},
						},
					},
				})),
			},
			metadata: &Metadata{
				targetEnv:     "prod",
				targetVersion: upcomingVersion,
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
				Extensions: map[string]any{
					hiddenEnvsExtension: map[string]any{
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
				Extensions: map[string]any{
					hiddenEnvsExtension: map[string]any{
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
				Extensions: map[string]any{
					hiddenEnvsExtension: map[string]any{
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
				Extensions: map[string]any{
					hiddenEnvsExtension: map[string]any{
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
				Extensions: map[string]any{},
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
				Extensions: map[string]any{
					hiddenEnvsExtension: map[string]any{
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
				Extensions: map[string]any{
					hiddenEnvsExtension: map[string]any{
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
				Extensions: map[string]any{
					hiddenEnvsExtension: map[string]any{
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
				Extensions: map[string]any{
					hiddenEnvsExtension: map[string]any{
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
				Extensions: map[string]any{
					"other-extension": map[string]any{
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
				Extensions: map[string]any{
					hiddenEnvsExtension: map[string]any{
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
				Extensions: map[string]any{
					hiddenEnvsExtension: map[string]any{
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
				Extensions: map[string]any{
					hiddenEnvsExtension: map[string]any{
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
				Extensions: map[string]any{
					hiddenEnvsExtension: map[string]any{
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
				Extensions: map[string]any{
					"other-extension": map[string]any{
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
					Extensions: map[string]any{
						hiddenEnvsExtension: map[string]any{
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
					Extensions: map[string]any{
						hiddenEnvsExtension: map[string]any{
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
					Extensions: map[string]any{},
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
								Extensions: map[string]any{
									hiddenEnvsExtension: map[string]any{
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
								Extensions: map[string]any{
									hiddenEnvsExtension: map[string]any{
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
								Extensions: map[string]any{
									hiddenEnvsExtension: map[string]any{
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
						Extensions: map[string]any{
							hiddenEnvsExtension: map[string]any{
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
						Extensions: map[string]any{
							hiddenEnvsExtension: map[string]any{
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
						Extensions: map[string]any{},
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

func TestRemoveResponseIfHiddenForEnv(t *testing.T) {
	tests := []struct {
		name      string
		targetEnv string
		operation *openapi3.Operation
		expected  *openapi3.Operation
	}{
		{
			name:      "Response Hidden",
			targetEnv: "prod",
			operation: &openapi3.Operation{
				OperationID: "testOperation",
				Responses: openapi3.NewResponses(openapi3.WithStatus(200,
					&openapi3.ResponseRef{
						Value: &openapi3.Response{
							Description: pointer.Get("A sample response"),
							Extensions: map[string]any{
								hiddenEnvsExtension: map[string]any{
									"envs": "prod",
								},
							},
							Content: map[string]*openapi3.MediaType{
								"application/json": {
									Schema: &openapi3.SchemaRef{
										Value: &openapi3.Schema{},
									},
								},
							},
						},
					})),
			},
			expected: &openapi3.Operation{
				OperationID: "testOperation",
				Responses:   openapi3.NewResponses(func(_ *openapi3.Responses) {}),
			},
		},
		{
			name:      "Response Hidden in content",
			targetEnv: "prod",
			operation: &openapi3.Operation{
				OperationID: "testOperation",
				Responses: openapi3.NewResponses(openapi3.WithStatus(200,
					&openapi3.ResponseRef{
						Value: &openapi3.Response{
							Description: pointer.Get("A sample response"),
							Content: map[string]*openapi3.MediaType{
								"application/json": {
									Schema: &openapi3.SchemaRef{},
									Extensions: map[string]any{
										hiddenEnvsExtension: map[string]any{
											"envs": "prod",
										},
									},
								},
								"application/2-json": {
									Schema: &openapi3.SchemaRef{},
									Extensions: map[string]any{
										hiddenEnvsExtension: map[string]any{
											"envs": "dev",
										},
									},
								},
							},
						},
					})),
			},
			expected: &openapi3.Operation{
				OperationID: "testOperation",
				Responses: openapi3.NewResponses(openapi3.WithStatus(200,
					&openapi3.ResponseRef{
						Value: &openapi3.Response{
							Description: pointer.Get("A sample response"),
							Content: map[string]*openapi3.MediaType{
								"application/2-json": {
									Schema:     &openapi3.SchemaRef{},
									Extensions: map[string]any{},
								},
							},
						},
					})),
			},
		},
		{
			name:      "Response Hidden in content with different target env",
			targetEnv: "prod",
			operation: &openapi3.Operation{
				OperationID: "testOperation",
				Responses: openapi3.NewResponses(openapi3.WithStatus(200,
					&openapi3.ResponseRef{
						Value: &openapi3.Response{
							Description: pointer.Get("A sample response"),
							Content: map[string]*openapi3.MediaType{
								"application/json": {
									Schema: &openapi3.SchemaRef{},
									Extensions: map[string]any{
										hiddenEnvsExtension: map[string]any{
											"envs": "dev",
										},
									},
								},
								"application/2-json": {
									Schema: &openapi3.SchemaRef{},
									Extensions: map[string]any{
										hiddenEnvsExtension: map[string]any{
											"envs": "dev",
										},
									},
								},
							},
						},
					})),
			},
			expected: &openapi3.Operation{
				OperationID: "testOperation",
				Responses: openapi3.NewResponses(openapi3.WithStatus(200,
					&openapi3.ResponseRef{
						Value: &openapi3.Response{
							Description: pointer.Get("A sample response"),
							Content: map[string]*openapi3.MediaType{
								"application/json": {
									Schema:     &openapi3.SchemaRef{},
									Extensions: map[string]any{},
								},
								"application/2-json": {
									Schema:     &openapi3.SchemaRef{},
									Extensions: map[string]any{},
								},
							},
						},
					})),
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			filter := HiddenEnvsFilter{
				metadata: &Metadata{targetEnv: tt.targetEnv},
			}

			filter.removeResponseIfHiddenForEnv(tt.operation)

			if !reflect.DeepEqual(tt.expected, tt.operation) {
				t.Errorf("expected %v, got %v", tt.expected, tt.operation)
			}
		})
	}
}

func TestApplyOnSchemas(t *testing.T) {
	tests := []struct {
		name      string
		schemas   openapi3.Schemas
		targetEnv string
		expected  openapi3.Schemas
	}{
		{
			name: "Remove schema hidden for target environment",
			schemas: openapi3.Schemas{
				"schema1": {
					Extensions: map[string]any{
						hiddenEnvsExtension: map[string]any{
							"envs": "prod",
						},
					},
				},
				"schema2": {
					Extensions: map[string]any{
						hiddenEnvsExtension: map[string]any{
							"envs": "dev",
						},
					},
				},
			},
			targetEnv: "prod",
			expected: openapi3.Schemas{
				"schema2": {
					Extensions: map[string]any{},
				},
			},
		},
		{
			name: "Remove properties hidden for target environment",
			schemas: openapi3.Schemas{
				"schema1": {
					Value: &openapi3.Schema{
						Properties: map[string]*openapi3.SchemaRef{
							"property1": {
								Extensions: map[string]any{
									hiddenEnvsExtension: map[string]any{
										"envs": "prod",
									},
								},
							},
							"property2": {
								Extensions: map[string]any{
									hiddenEnvsExtension: map[string]any{
										"envs": "dev",
									},
								},
							},
						},
					},
				},
			},
			targetEnv: "prod",
			expected: openapi3.Schemas{
				"schema1": {
					Value: &openapi3.Schema{
						Properties: map[string]*openapi3.SchemaRef{
							"property2": {
								Extensions: map[string]any{},
							},
						},
					},
				},
			},
		},
		{
			name: "Remove properties of properties hidden for target environment",
			schemas: openapi3.Schemas{
				"schema1": {
					Value: &openapi3.Schema{
						Properties: map[string]*openapi3.SchemaRef{
							"property1": {
								Value: &openapi3.Schema{
									Properties: map[string]*openapi3.SchemaRef{
										"subProperty1": {
											Extensions: map[string]any{
												hiddenEnvsExtension: map[string]any{
													"envs": "prod",
												},
											},
										},
										"subProperty2": {
											Extensions: map[string]any{
												hiddenEnvsExtension: map[string]any{
													"envs": "dev",
												},
											},
										},
									},
								},
							},
						},
					},
				},
			},
			targetEnv: "prod",
			expected: openapi3.Schemas{
				"schema1": {
					Value: &openapi3.Schema{
						Properties: map[string]*openapi3.SchemaRef{
							"property1": {
								Value: &openapi3.Schema{
									Properties: map[string]*openapi3.SchemaRef{
										"subProperty2": {
											Extensions: map[string]any{},
										},
									},
								},
							},
						},
					},
				},
			},
		},
		{
			name: "Retain schemas and properties not hidden for target environment",
			schemas: openapi3.Schemas{
				"schema1": {
					Extensions: map[string]any{
						hiddenEnvsExtension: map[string]any{
							"envs": "dev",
						},
					},
				},
				"schema2": {
					Value: &openapi3.Schema{
						Properties: map[string]*openapi3.SchemaRef{
							"property1": {
								Extensions: map[string]any{
									hiddenEnvsExtension: map[string]any{
										"envs": "dev",
									},
								},
							},
							"property2": {
								Extensions: map[string]any{},
							},
						},
					},
				},
			},
			targetEnv: "prod",
			expected: openapi3.Schemas{
				"schema1": {
					Extensions: map[string]any{},
				},
				"schema2": {
					Value: &openapi3.Schema{
						Properties: map[string]*openapi3.SchemaRef{
							"property1": {
								Extensions: map[string]any{},
							},
							"property2": {
								Extensions: map[string]any{},
							},
						},
					},
				},
			},
		},
		{
			name: "Remove hidden environment extension from final OAS",
			schemas: openapi3.Schemas{
				"schema1": {
					Extensions: map[string]any{
						hiddenEnvsExtension: map[string]any{
							"envs": "prod",
						},
					},
				},
				"schema2": {
					Value: &openapi3.Schema{
						Properties: map[string]*openapi3.SchemaRef{
							"property1": {
								Extensions: map[string]any{
									hiddenEnvsExtension: map[string]any{
										"envs": "prod",
									},
								},
							},
							"property2": {
								Extensions: map[string]any{},
							},
						},
					},
				},
			},
			targetEnv: "dev",
			expected: openapi3.Schemas{
				"schema1": {
					Extensions: map[string]any{},
				},
				"schema2": {
					Value: &openapi3.Schema{
						Properties: map[string]*openapi3.SchemaRef{
							"property1": {
								Extensions: map[string]any{},
							},
							"property2": {
								Extensions: map[string]any{},
							},
						},
					},
				},
			},
		},
		{
			name: "Remove hidden environment extension from final OAS",
			schemas: openapi3.Schemas{
				"schema1": {
					Extensions: map[string]any{
						hiddenEnvsExtension: map[string]any{
							"envs": "prod",
						},
					},
				},
				"schema2": {
					Value: &openapi3.Schema{
						Properties: map[string]*openapi3.SchemaRef{
							"property1": {
								Extensions: map[string]any{
									hiddenEnvsExtension: map[string]any{
										"envs": "prod",
									},
								},
							},
							"property2": {
								Extensions: map[string]any{},
							},
						},
					},
				},
			},
			targetEnv: "dev",
			expected: openapi3.Schemas{
				"schema1": {
					Extensions: map[string]any{},
				},
				"schema2": {
					Value: &openapi3.Schema{
						Properties: map[string]*openapi3.SchemaRef{
							"property1": {
								Extensions: map[string]any{},
							},
							"property2": {
								Extensions: map[string]any{},
							},
						},
					},
				},
			},
		},
		{
			name: "Remove schema.Value.Extensions hidden for target environment",
			schemas: openapi3.Schemas{
				"schema1": {
					Value: &openapi3.Schema{
						Extensions: map[string]any{
							hiddenEnvsExtension: map[string]any{
								"envs": "prod",
							},
						},
					},
				},
			},
			targetEnv: "prod",
			expected:  openapi3.Schemas{},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			filter := HiddenEnvsFilter{
				metadata: &Metadata{targetEnv: tt.targetEnv},
			}
			err := filter.applyOnSchemas(tt.schemas)
			require.NoError(t, err)
			assert.Equal(t, tt.expected, tt.schemas)
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
	assert.NotContains(t, oas.Components.Schemas, "test")
	assert.Contains(t, oas.Components.Schemas, "testKeep")
	assert.Contains(t, oas.Components.Schemas, "test2")
	assert.NotContains(t, oas.Components.Schemas["test2"].Value.Properties, "testP")
}

func getApplyOas() *openapi3.T {
	oas := &openapi3.T{}
	oas.Paths = &openapi3.Paths{}
	hiddenFromProd := &openapi3.PathItem{
		Extensions: map[string]any{
			hiddenEnvsExtension: map[string]any{
				"envs": "prod",
			},
		},
		Get: &openapi3.Operation{
			Summary: "test",
		},
	}

	hiddenFromDev := &openapi3.PathItem{
		Extensions: map[string]any{
			hiddenEnvsExtension: map[string]any{
				"envs": "dev",
			},
		},
		Get: &openapi3.Operation{
			Summary: "test",
		},
	}

	oas.Paths.Set("/api/atlas/v2/groups/{groupId}/streams", hiddenFromProd)
	oas.Paths.Set("/api/atlas/v2/groups/{groupId}/streams/{tenantName}/auditLogs", hiddenFromDev)
	oas.Components = &openapi3.Components{}
	oas.Components.Schemas = map[string]*openapi3.SchemaRef{
		"test": {
			Value: &openapi3.Schema{},
			Extensions: map[string]any{
				hiddenEnvsExtension: map[string]any{
					"envs": "prod",
				},
			},
		},
		"test2": {
			Value: &openapi3.Schema{
				Properties: map[string]*openapi3.SchemaRef{
					"testP": {
						Value: &openapi3.Schema{},
						Extensions: map[string]any{
							hiddenEnvsExtension: map[string]any{
								"envs": "prod",
							},
						},
					},
				},
			},
		},
		"testKeep": {
			Ref: "#/components/schemas/testKeep",
			Extensions: map[string]any{
				hiddenEnvsExtension: map[string]any{
					"envs": "qa",
				},
			},
		},
	}

	return oas
}
