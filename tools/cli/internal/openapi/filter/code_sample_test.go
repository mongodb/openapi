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
						Tags: []string{"TestTag"},
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
						Tags: []string{"TestTag"},
						Extensions: map[string]any{
							"x-sunset": "9999-12-31",
							"x-codeSamples": []codeSample{
								{
									Lang:   "cURL",
									Label:  "Atlas CLI",
									Source: "atlas api testTag testOperationId --help",
								},
								{
									Lang:  "go",
									Label: "Go",
									Source: "import (\n" +
										"\t\"os\"\n	\"context\"\n" + "\t\"log\"\n" +
										"\tsdk \"go.mongodb.org/atlas-sdk/v20250101001/admin\"\n)\n\n" +
										"func main() {\n" +
										"\tctx := context.Background()\n" +
										"\tclientID := os.Getenv(\"MONGODB_ATLAS_CLIENT_ID\")\n" +
										"\tclientSecret := os.Getenv(\"MONGODB_ATLAS_CLIENT_SECRET\")\n\n" +
										"\t// See https://dochub.mongodb.org/core/atlas-go-sdk-oauth\n" +
										"\tclient, err := sdk.NewClient(sdk.UseOAuthAuth(clientID, clientSecret))\n\n" +
										"\tif err != nil {\n" + "\t\tlog.Fatalf(\"Error: %v\", err)\n\t}\n\n" +
										"\tparams = &sdk.TestOperationIDApiParams{}\n" +
										"\tsdkResp, httpResp, err := client.TestTagApi.\n" +
										"\t\tTestOperationIDWithParams(ctx, params).\n" +
										"\t\tExecute()" + "\n}\n",
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
						Tags:        []string{"TestTag"},
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
						Tags:        []string{"TestTag"},
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
									Source: "atlas api testTag testOperationId --help",
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
						Tags:        []string{"TestTag"},
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
						Tags:        []string{"TestTag"},
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
									Source: "atlas api testTag testOperationId --help",
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
		{
			name:    "stable api gzip",
			version: "2025-01-01",
			oas: &openapi3.T{
				Paths: openapi3.NewPaths(openapi3.WithPath("/test", &openapi3.PathItem{
					Get: &openapi3.Operation{
						OperationID: "testOperationID",
						Summary:     "testSummary",
						Responses: openapi3.NewResponses(openapi3.WithName("200", &openapi3.Response{
							Content: openapi3.Content{
								"application/vnd.atlas.2025-01-01+gzip": {
									Schema: &openapi3.SchemaRef{
										Ref: "#/components/schemas/PaginatedAppUserView",
									},
									Extensions: map[string]any{
										"x-gen-version": "2025-01-01",
									},
								},
							},
						})),
						Tags: []string{"TestTag"},
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
								"application/vnd.atlas.2025-01-01+gzip": {
									Schema: &openapi3.SchemaRef{
										Ref: "#/components/schemas/PaginatedAppUserView",
									},
									Extensions: map[string]any{
										"x-gen-version": "2025-01-01",
									},
								},
							},
						})),
						Tags: []string{"TestTag"},
						Extensions: map[string]any{
							"x-sunset": "9999-12-31",
							"x-codeSamples": []codeSample{
								{
									Lang:   "cURL",
									Label:  "Atlas CLI",
									Source: "atlas api testTag testOperationId --help",
								},
								{
									Lang:  "go",
									Label: "Go",
									Source: "import (\n" +
										"\t\"os\"\n	\"context\"\n" + "\t\"log\"\n" +
										"\tsdk \"go.mongodb.org/atlas-sdk/v20250101001/admin\"\n)\n\n" +
										"func main() {\n" +
										"\tctx := context.Background()\n" +
										"\tclientID := os.Getenv(\"MONGODB_ATLAS_CLIENT_ID\")\n" +
										"\tclientSecret := os.Getenv(\"MONGODB_ATLAS_CLIENT_SECRET\")\n\n" +
										"\t// See https://dochub.mongodb.org/core/atlas-go-sdk-oauth\n" +
										"\tclient, err := sdk.NewClient(sdk.UseOAuthAuth(clientID, clientSecret))\n\n" +
										"\tif err != nil {\n" + "\t\tlog.Fatalf(\"Error: %v\", err)\n\t}\n\n" +
										"\tparams = &sdk.TestOperationIDApiParams{}\n" +
										"\tsdkResp, httpResp, err := client.TestTagApi.\n" +
										"\t\tTestOperationIDWithParams(ctx, params).\n" +
										"\t\tExecute()" + "\n}\n",
								},
								{
									Lang:  "cURL",
									Label: "curl (Service Accounts)",
									Source: "curl --header \"Authorization: Bearer ${ACCESS_TOKEN}\" \\\n  " +
										"--header \"Accept: application/vnd.atlas.2025-01-01+gzip\" \\\n  " +
										"-X GET \"https://cloud.mongodb.com/test\" \\\n  --output \"file_name.gz\"",
								},
								{
									Lang:  "cURL",
									Label: "curl (Digest)",
									Source: "curl --user \"${PUBLIC_KEY}:${PRIVATE_KEY}\" \\\n  --digest \\\n  " +
										"--header \"Accept: application/vnd.atlas.2025-01-01+gzip\" \\\n  " +
										"-X GET \"https://cloud.mongodb.com/test\" \\\n  --output \"file_name.gz\"",
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
				expectedOas, err := tt.expectedOas.MarshalJSON()
				require.NoError(t, err)
				oasFromTest, err := tt.oas.MarshalJSON()
				require.NoError(t, err)
				t.Errorf("expected: %q,\ngot: %q", string(expectedOas), string(oasFromTest))
			}
		})
	}
}
