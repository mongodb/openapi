// Copyright 2025 MongoDB Inc
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
	"testing"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/mongodb/openapi/tools/cli/internal/apiversion"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestBumpFilter_Apply_Preview(t *testing.T) {
	targetVersion, err := apiversion.New(apiversion.WithVersion("preview"))
	require.NoError(t, err)

	oas := &openapi3.T{
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
			},
			Extensions: map[string]any{},
		})),
	}

	filter := &BumpFilter{
		metadata: NewMetadata(targetVersion, "test"),
		oas:      oas,
	}

	require.NoError(t, filter.Apply())
	assert.Len(t, oas.Paths.Map(), 1)
	assert.Contains(t, oas.Paths.Map(), "test")

	testPath := oas.Paths.Map()["test"]
	assert.NotNil(t, testPath.Get)

	op := testPath.Get
	assert.Contains(t, op.Extensions, "x-state")
	assert.Equal(t, "Preview", op.Extensions["x-state"])
	assert.Contains(t, op.Extensions, "x-beta")
	assert.Equal(t, true, op.Extensions["x-beta"])
	assert.Contains(t, description, op.Description)
}

func TestBumpFilter_Apply_Upcoming(t *testing.T) {
	targetVersion, err := apiversion.New(apiversion.WithVersion("2024-09-22.upcoming"))
	require.NoError(t, err)

	oas := &openapi3.T{
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
						"application/vnd.atlas.2024-09-22.upcoming+json": {
							Schema: &openapi3.SchemaRef{
								Ref: "#/components/schemas/PaginatedAppUserView",
							},
						},
					},
				})),
			},
			Extensions: map[string]any{},
		})),
	}

	filter := &BumpFilter{
		metadata: NewMetadata(targetVersion, "test"),
		oas:      oas,
	}

	require.NoError(t, filter.Apply())
	assert.Len(t, oas.Paths.Map(), 1)
	assert.Contains(t, oas.Paths.Map(), "test")

	testPath := oas.Paths.Map()["test"]
	assert.NotNil(t, testPath.Get)
	op := testPath.Get

	assert.Contains(t, op.Extensions, "x-state")
	assert.Equal(t, "Upcoming", op.Extensions["x-state"])
	assert.NotContains(t, op.Extensions, "x-beta")
	assert.NotContains(t, op.Description, description)
}

func TestBumpFilter_Apply_Stable(t *testing.T) {
	targetVersion, err := apiversion.New(apiversion.WithVersion("2024-09-22"))
	require.NoError(t, err)

	oas := &openapi3.T{
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
						"application/vnd.atlas.2024-09-22+json": {
							Schema: &openapi3.SchemaRef{
								Ref: "#/components/schemas/PaginatedAppUserView",
							},
						},
					},
				})),
			},
			Extensions: map[string]any{},
		})),
	}

	filter := &BumpFilter{
		metadata: NewMetadata(targetVersion, "test"),
		oas:      oas,
	}

	require.NoError(t, filter.Apply())
	assert.Len(t, oas.Paths.Map(), 1)
	assert.Contains(t, oas.Paths.Map(), "test")

	testPath := oas.Paths.Map()["test"]
	assert.NotNil(t, testPath.Get)
	op := testPath.Get

	assert.NotContains(t, op.Extensions, "x-state")
	assert.NotContains(t, op.Extensions, "x-beta")
}
