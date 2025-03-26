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

func TestSunsetFilter_Apply(t *testing.T) {
	testCases := []struct {
		name       string
		initSpec   *openapi3.T
		wantedSpec *openapi3.T
	}{
		{
			name: "Remove x-sunset when value is 9999-12-31",
			initSpec: &openapi3.T{
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
			},
			wantedSpec: &openapi3.T{
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
									},
								},
							},
						})),
					},
				})),
			},
		},
		{
			name: "Remove x-sunset when value is 9999-12-31 for a 204",
			initSpec: &openapi3.T{
				Paths: openapi3.NewPaths(openapi3.WithPath("test", &openapi3.PathItem{
					Get: &openapi3.Operation{
						OperationID: "testOperationID",
						Summary:     "testSummary",
						Responses: openapi3.NewResponses(openapi3.WithName("204", &openapi3.Response{
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
			},
			wantedSpec: &openapi3.T{
				Paths: openapi3.NewPaths(openapi3.WithPath("test", &openapi3.PathItem{
					Get: &openapi3.Operation{
						OperationID: "testOperationID",
						Summary:     "testSummary",
						Responses: openapi3.NewResponses(openapi3.WithName("204", &openapi3.Response{
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
									},
								},
							},
						})),
					},
				})),
			},
		},
		{
			name: "Keep x-sunset when value is different",
			initSpec: &openapi3.T{
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
							},
						})),
					},
				})),
			},
			wantedSpec: &openapi3.T{
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
							},
						})),
					},
				})),
			},
		},
		{
			name: "Ignore non-2xx responses",
			initSpec: &openapi3.T{
				Paths: openapi3.NewPaths(openapi3.WithPath("test", &openapi3.PathItem{
					Get: &openapi3.Operation{
						OperationID: "testOperationID",
						Summary:     "testSummary",
						Responses: openapi3.NewResponses(openapi3.WithName("404", &openapi3.Response{
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
			},
			wantedSpec: &openapi3.T{
				Paths: openapi3.NewPaths(openapi3.WithPath("test", &openapi3.PathItem{
					Get: &openapi3.Operation{
						OperationID: "testOperationID",
						Summary:     "testSummary",
						Responses: openapi3.NewResponses(openapi3.WithName("404", &openapi3.Response{
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
			},
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			f := &SunsetFilter{
				oas: tc.initSpec,
			}

			require.NoError(t, f.Apply())
			require.Equal(t, tc.wantedSpec, f.oas)
		})
	}
}
