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
package filter

import (
	"testing"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/stretchr/testify/require"
)

type testCase struct {
	name       string
	initSpec   *openapi3.T
	wantedSpec *openapi3.T
}

func TestSchemasFilter_Apply(t *testing.T) {
	testCases := []testCase{
		unusedSchemasScenario(),
		nestedSchemasScenario(),
		onlyUsedSchemasScenario(),
		unusedSchemasWithCircularDependencyScenario(),
	}
	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			f := &SchemasFilter{
				oas: tc.initSpec,
			}

			require.NoError(t, f.Apply())
			require.Equal(t, tc.wantedSpec, f.oas)
		})
	}
}

func unusedSchemasScenario() testCase {
	return testCase{
		name: "Remove unused schemas",
		initSpec: &openapi3.T{
			OpenAPI: "3.0.0",
			Info: &openapi3.Info{
				Version: "1.0",
			},
			Paths: openapi3.NewPaths(openapi3.WithPath("test", &openapi3.PathItem{
				Get: &openapi3.Operation{
					OperationID: "testOperationID",
					Summary:     "testSummary",
					Responses: openapi3.NewResponses(openapi3.WithName("200", &openapi3.Response{
						Content: openapi3.Content{
							"application/vnd.atlas.2025-01-01+json": {
								Schema: &openapi3.SchemaRef{
									Ref: "#/components/schemas/PaginatedAppUserView",
								},
								Extensions: map[string]any{
									"x-gen-version": "2025-01-01",
								},
							},
							"application/vnd.atlas.2024-01-01+json": {
								Schema: &openapi3.SchemaRef{
									Ref: "#/components/schemas/PaginatedAppUserView3",
								},
								Extensions: map[string]any{
									"x-gen-version": "2024-01-01",
									"x-sunset":      "2024-12-31",
								},
							},
							"application/vnd.atlas.2023-01-01+json": {
								Schema: &openapi3.SchemaRef{
									Ref: "#/components/schemas/PaginatedAppUserView2",
								},
								Extensions: map[string]any{
									"x-gen-version": "2023-01-01",
									"x-sunset":      "9999-12-31",
								},
							},
						},
					})),
				},
			})),
			Components: &openapi3.Components{
				Schemas: map[string]*openapi3.SchemaRef{
					"PaginatedAppUserView": {
						Value: &openapi3.Schema{
							Properties: map[string]*openapi3.SchemaRef{
								"pro": {
									Value: &openapi3.Schema{
										Format: "string",
									},
								},
							},
						},
					},
					"PaginatedAppUserView2": {
						Value: &openapi3.Schema{
							Properties: map[string]*openapi3.SchemaRef{
								"pro": {
									Value: &openapi3.Schema{
										Format: "string",
									},
								},
							},
						},
					},
					"PaginatedAppUserView3": {
						Value: &openapi3.Schema{
							Properties: map[string]*openapi3.SchemaRef{
								"pro": {
									Value: &openapi3.Schema{
										Format: "string",
									},
								},
							},
						},
					},
				},
			},
		},
		wantedSpec: &openapi3.T{
			OpenAPI: "3.0.0",
			Info: &openapi3.Info{
				Version: "1.0",
			},
			Paths: openapi3.NewPaths(openapi3.WithPath("test", &openapi3.PathItem{
				Get: &openapi3.Operation{
					OperationID: "testOperationID",
					Summary:     "testSummary",
					Responses: openapi3.NewResponses(openapi3.WithName("200", &openapi3.Response{
						Content: openapi3.Content{
							"application/vnd.atlas.2025-01-01+json": {
								Schema: &openapi3.SchemaRef{
									Ref: "#/components/schemas/PaginatedAppUserView",
								},
								Extensions: map[string]any{
									"x-gen-version": "2025-01-01",
								},
							},
							"application/vnd.atlas.2024-01-01+json": {
								Schema: &openapi3.SchemaRef{
									Ref: "#/components/schemas/PaginatedAppUserView3",
								},
								Extensions: map[string]any{
									"x-gen-version": "2024-01-01",
									"x-sunset":      "2024-12-31",
								},
							},
							"application/vnd.atlas.2023-01-01+json": {
								Schema: &openapi3.SchemaRef{
									Ref: "#/components/schemas/PaginatedAppUserView2",
								},
								Extensions: map[string]any{
									"x-gen-version": "2023-01-01",
									"x-sunset":      "9999-12-31",
								},
							},
						},
					})),
				},
			})),
			Components: &openapi3.Components{
				Schemas: map[string]*openapi3.SchemaRef{
					"PaginatedAppUserView": {
						Value: &openapi3.Schema{
							Properties: map[string]*openapi3.SchemaRef{
								"pro": {
									Value: &openapi3.Schema{
										Format: "string",
									},
								},
							},
						},
					},
					"PaginatedAppUserView2": {
						Value: &openapi3.Schema{
							Properties: map[string]*openapi3.SchemaRef{
								"pro": {
									Value: &openapi3.Schema{
										Format: "string",
									},
								},
							},
						},
					},
					"PaginatedAppUserView3": {
						Value: &openapi3.Schema{
							Properties: map[string]*openapi3.SchemaRef{
								"pro": {
									Value: &openapi3.Schema{
										Format: "string",
									},
								},
							},
						},
					},
				},
			},
		},
	}
}

func nestedSchemasScenario() testCase {
	return testCase{
		name: "Do not remove nested schemas",
		initSpec: &openapi3.T{
			OpenAPI: "3.0.0",
			Info: &openapi3.Info{
				Version: "1.0",
			},
			Paths: openapi3.NewPaths(openapi3.WithPath("test", &openapi3.PathItem{
				Get: &openapi3.Operation{
					OperationID: "testOperationID",
					Summary:     "testSummary",
					Responses: openapi3.NewResponses(openapi3.WithName("200", &openapi3.Response{
						Content: openapi3.Content{
							"application/vnd.atlas.2025-01-01+json": {
								Schema: &openapi3.SchemaRef{
									Ref: "#/components/schemas/PaginatedAppUserView",
								},
								Extensions: map[string]any{
									"x-gen-version": "2025-01-01",
								},
							},
							"application/vnd.atlas.2024-01-01+json": {
								Schema: &openapi3.SchemaRef{
									Ref: "#/components/schemas/PaginatedAppUserView",
								},
								Extensions: map[string]any{
									"x-gen-version": "2024-01-01",
									"x-sunset":      "2024-12-31",
								},
							},
							"application/vnd.atlas.2023-01-01+json": {
								Schema: &openapi3.SchemaRef{
									Ref: "#/components/schemas/PaginatedAppUserView",
								},
								Extensions: map[string]any{
									"x-gen-version": "2023-01-01",
									"x-sunset":      "9999-12-31",
								},
							},
						},
					})),
				},
			})),
			Components: &openapi3.Components{
				Schemas: map[string]*openapi3.SchemaRef{
					"PaginatedAppUserView": {
						Value: &openapi3.Schema{
							Properties: map[string]*openapi3.SchemaRef{
								"pro": {
									Ref: "#/components/schemas/PaginatedAppUserView2",
								},
							},
						},
					},
					"PaginatedAppUserView2": {
						Value: &openapi3.Schema{
							Properties: map[string]*openapi3.SchemaRef{
								"pro": {
									Value: &openapi3.Schema{
										Format: "string",
									},
								},
							},
						},
					},
					"PaginatedAppUserView3": {
						Value: &openapi3.Schema{
							Properties: map[string]*openapi3.SchemaRef{
								"pro": {
									Value: &openapi3.Schema{
										Format: "string",
									},
								},
							},
						},
					},
					"PaginatedAppUserView4": {
						Value: &openapi3.Schema{
							Properties: map[string]*openapi3.SchemaRef{
								"pro": {
									Value: &openapi3.Schema{
										Format: "string",
									},
								},
							},
						},
					},
				},
			},
		},
		wantedSpec: &openapi3.T{
			OpenAPI: "3.0.0",
			Info: &openapi3.Info{
				Version: "1.0",
			},
			Paths: openapi3.NewPaths(openapi3.WithPath("test", &openapi3.PathItem{
				Get: &openapi3.Operation{
					OperationID: "testOperationID",
					Summary:     "testSummary",
					Responses: openapi3.NewResponses(openapi3.WithName("200", &openapi3.Response{
						Content: openapi3.Content{
							"application/vnd.atlas.2025-01-01+json": {
								Schema: &openapi3.SchemaRef{
									Ref: "#/components/schemas/PaginatedAppUserView",
								},
								Extensions: map[string]any{
									"x-gen-version": "2025-01-01",
								},
							},
							"application/vnd.atlas.2024-01-01+json": {
								Schema: &openapi3.SchemaRef{
									Ref: "#/components/schemas/PaginatedAppUserView",
								},
								Extensions: map[string]any{
									"x-gen-version": "2024-01-01",
									"x-sunset":      "2024-12-31",
								},
							},
							"application/vnd.atlas.2023-01-01+json": {
								Schema: &openapi3.SchemaRef{
									Ref: "#/components/schemas/PaginatedAppUserView",
								},
								Extensions: map[string]any{
									"x-gen-version": "2023-01-01",
									"x-sunset":      "9999-12-31",
								},
							},
						},
					})),
				},
			})),
			Components: &openapi3.Components{
				Schemas: map[string]*openapi3.SchemaRef{
					"PaginatedAppUserView": {
						Value: &openapi3.Schema{
							Properties: map[string]*openapi3.SchemaRef{
								"pro": {
									Ref: "#/components/schemas/PaginatedAppUserView2",
								},
							},
						},
					},
					"PaginatedAppUserView2": {
						Value: &openapi3.Schema{
							Properties: map[string]*openapi3.SchemaRef{
								"pro": {
									Value: &openapi3.Schema{
										Format: "string",
									},
								},
							},
						},
					},
				},
			},
		},
	}
}

func onlyUsedSchemasScenario() testCase {
	return testCase{
		name: "Don not remove used schemas",
		initSpec: &openapi3.T{
			OpenAPI: "3.0.0",
			Info: &openapi3.Info{
				Version: "1.0",
			},
			Paths: openapi3.NewPaths(openapi3.WithPath("test", &openapi3.PathItem{
				Get: &openapi3.Operation{
					OperationID: "testOperationID",
					Summary:     "testSummary",
					Responses: openapi3.NewResponses(openapi3.WithName("200", &openapi3.Response{
						Content: openapi3.Content{
							"application/vnd.atlas.2025-01-01+json": {
								Schema: &openapi3.SchemaRef{
									Ref: "#/components/schemas/PaginatedAppUserView",
								},
								Extensions: map[string]any{
									"x-gen-version": "2025-01-01",
								},
							},
							"application/vnd.atlas.2024-01-01+json": {
								Schema: &openapi3.SchemaRef{
									Ref: "#/components/schemas/PaginatedAppUserView3",
								},
								Extensions: map[string]any{
									"x-gen-version": "2024-01-01",
									"x-sunset":      "2024-12-31",
								},
							},
							"application/vnd.atlas.2023-01-01+json": {
								Schema: &openapi3.SchemaRef{
									Ref: "#/components/schemas/PaginatedAppUserView2",
								},
								Extensions: map[string]any{
									"x-gen-version": "2023-01-01",
									"x-sunset":      "9999-12-31",
								},
							},
						},
					})),
				},
			})),
			Components: &openapi3.Components{
				Schemas: map[string]*openapi3.SchemaRef{
					"PaginatedAppUserView": {
						Value: &openapi3.Schema{
							Properties: map[string]*openapi3.SchemaRef{
								"pro": {
									Value: &openapi3.Schema{
										Format: "string",
									},
								},
							},
						},
					},
					"PaginatedAppUserView2": {
						Value: &openapi3.Schema{
							Properties: map[string]*openapi3.SchemaRef{
								"pro": {
									Value: &openapi3.Schema{
										Format: "string",
									},
								},
							},
						},
					},
					"PaginatedAppUserView3": {
						Value: &openapi3.Schema{
							Properties: map[string]*openapi3.SchemaRef{
								"pro": {
									Value: &openapi3.Schema{
										Format: "string",
									},
								},
							},
						},
					},
					"PaginatedAppUserView4": {
						Value: &openapi3.Schema{
							Properties: map[string]*openapi3.SchemaRef{
								"pro": {
									Value: &openapi3.Schema{
										Format: "string",
									},
								},
							},
						},
					},
				},
			},
		},
		wantedSpec: &openapi3.T{
			OpenAPI: "3.0.0",
			Info: &openapi3.Info{
				Version: "1.0",
			},
			Paths: openapi3.NewPaths(openapi3.WithPath("test", &openapi3.PathItem{
				Get: &openapi3.Operation{
					OperationID: "testOperationID",
					Summary:     "testSummary",
					Responses: openapi3.NewResponses(openapi3.WithName("200", &openapi3.Response{
						Content: openapi3.Content{
							"application/vnd.atlas.2025-01-01+json": {
								Schema: &openapi3.SchemaRef{
									Ref: "#/components/schemas/PaginatedAppUserView",
								},
								Extensions: map[string]any{
									"x-gen-version": "2025-01-01",
								},
							},
							"application/vnd.atlas.2024-01-01+json": {
								Schema: &openapi3.SchemaRef{
									Ref: "#/components/schemas/PaginatedAppUserView3",
								},
								Extensions: map[string]any{
									"x-gen-version": "2024-01-01",
									"x-sunset":      "2024-12-31",
								},
							},
							"application/vnd.atlas.2023-01-01+json": {
								Schema: &openapi3.SchemaRef{
									Ref: "#/components/schemas/PaginatedAppUserView2",
								},
								Extensions: map[string]any{
									"x-gen-version": "2023-01-01",
									"x-sunset":      "9999-12-31",
								},
							},
						},
					})),
				},
			})),
			Components: &openapi3.Components{
				Schemas: map[string]*openapi3.SchemaRef{
					"PaginatedAppUserView": {
						Value: &openapi3.Schema{
							Properties: map[string]*openapi3.SchemaRef{
								"pro": {
									Value: &openapi3.Schema{
										Format: "string",
									},
								},
							},
						},
					},
					"PaginatedAppUserView2": {
						Value: &openapi3.Schema{
							Properties: map[string]*openapi3.SchemaRef{
								"pro": {
									Value: &openapi3.Schema{
										Format: "string",
									},
								},
							},
						},
					},
					"PaginatedAppUserView3": {
						Value: &openapi3.Schema{
							Properties: map[string]*openapi3.SchemaRef{
								"pro": {
									Value: &openapi3.Schema{
										Format: "string",
									},
								},
							},
						},
					},
				},
			},
		},
	}
}

// unusedSchemasWithCircularDependencyScenario tests that the filter correctly removes
// schemas that have circular dependencies but are not referenced anywhere in the API.
// This ensures the BFS traversal algorithm doesn't get stuck in infinite loops and
// properly identifies that circular schemas are unused if they have no entry point.
func unusedSchemasWithCircularDependencyScenario() testCase {
	return testCase{
		name: "Remove unused schemas with circular dependency",
		initSpec: &openapi3.T{
			OpenAPI: "3.0.0",
			Info: &openapi3.Info{
				Version: "1.0",
			},
			Paths: openapi3.NewPaths(openapi3.WithPath("test", &openapi3.PathItem{
				Get: &openapi3.Operation{
					OperationID: "testOperationID",
					Summary:     "testSummary",
					Responses: openapi3.NewResponses(openapi3.WithName("200", &openapi3.Response{
						Content: openapi3.Content{
							"application/vnd.atlas.2025-01-01+json": {
								Schema: &openapi3.SchemaRef{
									Ref: "#/components/schemas/UsedSchema",
								},
								Extensions: map[string]any{
									"x-gen-version": "2025-01-01",
								},
							},
						},
					})),
				},
			})),
			Components: &openapi3.Components{
				Schemas: map[string]*openapi3.SchemaRef{
					"UsedSchema": {
						Value: &openapi3.Schema{
							Properties: map[string]*openapi3.SchemaRef{
								"field": {
									Value: &openapi3.Schema{
										Format: "string",
									},
								},
							},
						},
					},
					// CircularA and CircularB reference each other but are not used anywhere
					"CircularA": {
						Value: &openapi3.Schema{
							Properties: map[string]*openapi3.SchemaRef{
								"refToB": {
									Ref: "#/components/schemas/CircularB",
								},
							},
						},
					},
					"CircularB": {
						Value: &openapi3.Schema{
							Properties: map[string]*openapi3.SchemaRef{
								"refToA": {
									Ref: "#/components/schemas/CircularA",
								},
							},
						},
					},
					// Another unused schema
					"UnusedSchema": {
						Value: &openapi3.Schema{
							Properties: map[string]*openapi3.SchemaRef{
								"field": {
									Value: &openapi3.Schema{
										Format: "string",
									},
								},
							},
						},
					},
				},
			},
		},
		wantedSpec: &openapi3.T{
			OpenAPI: "3.0.0",
			Info: &openapi3.Info{
				Version: "1.0",
			},
			Paths: openapi3.NewPaths(openapi3.WithPath("test", &openapi3.PathItem{
				Get: &openapi3.Operation{
					OperationID: "testOperationID",
					Summary:     "testSummary",
					Responses: openapi3.NewResponses(openapi3.WithName("200", &openapi3.Response{
						Content: openapi3.Content{
							"application/vnd.atlas.2025-01-01+json": {
								Schema: &openapi3.SchemaRef{
									Ref: "#/components/schemas/UsedSchema",
								},
								Extensions: map[string]any{
									"x-gen-version": "2025-01-01",
								},
							},
						},
					})),
				},
			})),
			Components: &openapi3.Components{
				Schemas: map[string]*openapi3.SchemaRef{
					"UsedSchema": {
						Value: &openapi3.Schema{
							Properties: map[string]*openapi3.SchemaRef{
								"field": {
									Value: &openapi3.Schema{
										Format: "string",
									},
								},
							},
						},
					},
					// CircularA, CircularB, and UnusedSchema should all be removed
				},
			},
		},
	}
}
