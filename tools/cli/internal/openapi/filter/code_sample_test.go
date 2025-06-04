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
	"reflect"
	"testing"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/mongodb/openapi/tools/cli/internal/apiversion"
	"github.com/stretchr/testify/require"
)

func TestCodeSampleFilter(t *testing.T) {
	testCases := []struct {
		name        string
		oas         *openapi3.T
		version     string
		expectedOas *openapi3.T
	}{
		{
			name:    "stable api",
			version: "2025-01-01",
			oas: &openapi3.T{
				Paths: openapi3.NewPaths(openapi3.WithPath("/test", &openapi3.PathItem{
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
							},
						})),
						Extensions: map[string]any{
							"x-sunset": "9999-12-31",
						},
					},
				})),
			},
			expectedOas: &openapi3.T{
				Paths: openapi3.NewPaths(openapi3.WithPath("/test", &openapi3.PathItem{
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
							},
						})),
						Extensions: map[string]any{
							"x-sunset": "9999-12-31",
							"x-codeSamples": []codeSample{
								{
									Lang:   "cURL",
									Label:  "Atlas CLI",
									Source: "atlas api testOperationID --help",
								},
								{
									Lang:  "cURL",
									Label: "curl (Service Accounts)",
									Source: "curl --header \"Authorization: Bearer ${ACCESS_TOKEN}\" \\\n  " +
										"--header \"Accept: application/vnd.atlas.2025-01-01+json\" \\\n  " + "-X GET \"https://cloud.mongodb.com/test?pretty=true\"",
								},
								{
									Lang:  "cURL",
									Label: "curl (Digest)",
									Source: "curl --user \"${PUBLIC_KEY}:${PRIVATE_KEY}\" \\\n  --digest \\\n  " +
										"--header \"Accept: application/vnd.atlas.2025-01-01+json\" \\\n  " + "-X GET \"https://cloud.mongodb.com/test?pretty=true\"",
								},
							},
						},
					},
				})),
			},
		},
		{
			name:    "preview api",
			version: "preview",
			oas: &openapi3.T{
				Paths: openapi3.NewPaths(openapi3.WithPath("/test", &openapi3.PathItem{
					Get: &openapi3.Operation{
						OperationID: "testOperationID",
						Summary:     "testSummary",
						Responses: openapi3.NewResponses(openapi3.WithName("200", &openapi3.Response{
							Content: openapi3.Content{
								"application/vnd.atlas.preview+json": {
									Schema: &openapi3.SchemaRef{
										Ref: "#/components/schemas/PaginatedAppUserView",
									},
									Extensions: map[string]any{
										"x-gen-version": "preview",
									},
								},
							},
						})),
						Extensions: map[string]any{
							"x-sunset": "9999-12-31",
						},
					},
				})),
			},
			expectedOas: &openapi3.T{
				Paths: openapi3.NewPaths(openapi3.WithPath("/test", &openapi3.PathItem{
					Get: &openapi3.Operation{
						OperationID: "testOperationID",
						Summary:     "testSummary",
						Responses: openapi3.NewResponses(openapi3.WithName("200", &openapi3.Response{
							Content: openapi3.Content{
								"application/vnd.atlas.preview+json": {
									Schema: &openapi3.SchemaRef{
										Ref: "#/components/schemas/PaginatedAppUserView",
									},
									Extensions: map[string]any{
										"x-gen-version": "preview",
									},
								},
							},
						})),
						Extensions: map[string]any{
							"x-sunset": "9999-12-31",
							"x-codeSamples": []codeSample{
								{
									Lang:   "cURL",
									Label:  "Atlas CLI",
									Source: "atlas api testOperationID --help",
								},
								{
									Lang:  "cURL",
									Label: "curl (Service Accounts)",
									Source: "curl --header \"Authorization: Bearer ${ACCESS_TOKEN}\" \\\n  " +
										"--header \"Accept: application/vnd.atlas.preview+json\" \\\n  " + "-X GET \"https://cloud.mongodb.com/test?pretty=true\"",
								},
								{
									Lang:  "cURL",
									Label: "curl (Digest)",
									Source: "curl --user \"${PUBLIC_KEY}:${PRIVATE_KEY}\" \\\n  --digest \\\n  " +
										"--header \"Accept: application/vnd.atlas.preview+json\" \\\n  " + "-X GET \"https://cloud.mongodb.com/test?pretty=true\"",
								},
							},
						},
					},
				})),
			},
		},
		{
			name:    "upcoming api",
			version: "2025-01-01.upcoming",
			oas: &openapi3.T{
				Paths: openapi3.NewPaths(openapi3.WithPath("/test", &openapi3.PathItem{
					Get: &openapi3.Operation{
						OperationID: "testOperationID",
						Summary:     "testSummary",
						Responses: openapi3.NewResponses(openapi3.WithName("200", &openapi3.Response{
							Content: openapi3.Content{
								"application/vnd.atlas.2025-01-01.upcoming+json": {
									Schema: &openapi3.SchemaRef{
										Ref: "#/components/schemas/PaginatedAppUserView",
									},
									Extensions: map[string]any{
										"x-gen-version": "2025-01-01.upcoming",
									},
								},
							},
						})),
						Extensions: map[string]any{
							"x-sunset": "9999-12-31",
						},
					},
				})),
			},
			expectedOas: &openapi3.T{
				Paths: openapi3.NewPaths(openapi3.WithPath("/test", &openapi3.PathItem{
					Get: &openapi3.Operation{
						OperationID: "testOperationID",
						Summary:     "testSummary",
						Responses: openapi3.NewResponses(openapi3.WithName("200", &openapi3.Response{
							Content: openapi3.Content{
								"application/vnd.atlas.2025-01-01.upcoming+json": {
									Schema: &openapi3.SchemaRef{
										Ref: "#/components/schemas/PaginatedAppUserView",
									},
									Extensions: map[string]any{
										"x-gen-version": "2025-01-01.upcoming",
									},
								},
							},
						})),
						Extensions: map[string]any{
							"x-sunset": "9999-12-31",
							"x-codeSamples": []codeSample{
								{
									Lang:   "cURL",
									Label:  "Atlas CLI",
									Source: "atlas api testOperationID --help",
								},
								{
									Lang:  "cURL",
									Label: "curl (Service Accounts)",
									Source: "curl --header \"Authorization: Bearer ${ACCESS_TOKEN}\" \\\n  " +
										"--header \"Accept: application/vnd.atlas.2025-01-01.upcoming+json\" \\\n  " + "-X GET \"https://cloud.mongodb.com/test?pretty=true\"",
								},
								{
									Lang:  "cURL",
									Label: "curl (Digest)",
									Source: "curl --user \"${PUBLIC_KEY}:${PRIVATE_KEY}\" \\\n  --digest \\\n  " +
										"--header \"Accept: application/vnd.atlas.2025-01-01.upcoming+json\" \\\n  " + "-X GET \"https://cloud.mongodb.com/test?pretty=true\"",
								},
							},
						},
					},
				})),
			},
		},
	}

	for _, tt := range testCases {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			oas := tt.oas
			version, err := apiversion.New(apiversion.WithVersion(tt.version))
			require.NoError(t, err)

			filter := &CodeSampleFilter{
				oas:      oas,
				metadata: &Metadata{targetVersion: version, targetEnv: "dev"},
			}

			require.NoError(t, filter.Apply())
			if !reflect.DeepEqual(tt.expectedOas, tt.oas) {
				t.Errorf("expected %v, got %v", tt.expectedOas, oas)
			}
		})
	}
}
