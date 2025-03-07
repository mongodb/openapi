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
	"testing"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/mongodb/openapi/tools/cli/internal/apiversion"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestPathFilter_processPathItem(t *testing.T) {
	version, err := apiversion.New(apiversion.WithVersion("2023-11-15"))
	require.NoError(t, err)

	filter := &VersioningFilter{
		metadata: &Metadata{targetVersion: version},
	}

	path := oasPathAllVersions()
	require.NoError(t, filter.applyInternal(path))

	assert.NotNil(t, path.Get)
	assert.Equal(t, 1, path.Get.Responses.Len())

	get200Responses := path.Get.Responses.Map()["200"]
	assert.NotNil(t, get200Responses)

	get200ResponsesContent := get200Responses.Value.Content
	assert.NotNil(t, get200ResponsesContent.Get("application/vnd.atlas.2023-11-15+json"))
}

func TestPathFilter_moreThanOneResponse(t *testing.T) {
	version, err := apiversion.New(apiversion.WithVersion("2023-01-01"))
	require.NoError(t, err)

	filter := &VersioningFilter{
		metadata: &Metadata{targetVersion: version},
	}

	path := oasPathAllVersions()
	err = filter.applyInternal(path)

	require.NoError(t, err)
	assert.NotNil(t, path.Get)
	assert.Equal(t, 1, path.Get.Responses.Len())

	get200Responses := path.Get.Responses.Map()["200"]
	assert.NotNil(t, get200Responses)

	get200ResponsesContent := get200Responses.Value.Content
	assert.NotNil(t, get200ResponsesContent.Get("application/vnd.atlas.2023-01-01+json"))
	assert.NotNil(t, get200ResponsesContent.Get("application/vnd.atlas.2023-01-01+csv"))
}

func TestPathFilter_removeEmptyPaths(t *testing.T) {
	version, err := apiversion.New(apiversion.WithVersion("2023-11-15"))
	require.NoError(t, err)

	filter := &VersioningFilter{
		oas:      getOasWithEmptyPaths(),
		metadata: &Metadata{targetVersion: version},
	}

	require.NoError(t, filter.Apply())
	assert.Empty(t, filter.oas.Paths.Map())
}

func TestPathFilter_filterRequestBody(t *testing.T) {
	version, err := apiversion.New(apiversion.WithVersion("2023-11-15"))
	require.NoError(t, err)

	filter := &VersioningFilter{
		metadata: &Metadata{targetVersion: version},
	}

	path := oasPathAllVersions()
	require.NoError(t, filter.applyInternal(path))

	assert.NotNil(t, path.Get)
	assert.NotNil(t, path.Get.RequestBody)
	assert.NotNil(t, path.Get.RequestBody.Value.Content)
	assert.NotNil(t, path.Get.RequestBody.Value.Content.Get("application/vnd.atlas.2023-11-15+json"))
}

func TestPathFilter_keepExtension(t *testing.T) {
	version, err := apiversion.New(apiversion.WithVersion("2023-11-15"))
	require.NoError(t, err)

	filter := &VersioningFilter{
		oas:      getOasWithPaths(),
		metadata: &Metadata{targetVersion: version},
	}

	require.NoError(t, filter.Apply())
	assert.NotEmpty(t, filter.oas.Paths.Map())
	assert.NotEmpty(t, filter.oas.Paths.Extensions)
	assert.Contains(t, filter.oas.Paths.Extensions, "x-sunset")
}

func getOasWithEmptyPaths() *openapi3.T {
	oas := &openapi3.T{}
	oas.Paths = &openapi3.Paths{}
	oas.Paths.Set("/api/atlas/v2/groups/{groupId}/streams", &openapi3.PathItem{})
	oas.Paths.Set("/api/atlas/v2/groups/{groupId}/streams/{tenantName}/auditLogs", &openapi3.PathItem{})
	oas.Paths.Set("/path3", &openapi3.PathItem{})

	return oas
}

func TestPathFilter_removeResponses(t *testing.T) {
	oas := &openapi3.T{}
	oas.Paths = &openapi3.Paths{}

	operation := &openapi3.Operation{
		Responses: &openapi3.Responses{},
	}

	operation.Responses.Set("200", &openapi3.ResponseRef{
		Value: &openapi3.Response{
			Content: map[string]*openapi3.MediaType{
				"application/vnd.atlas.2023-01-01+json": {
					Schema: &openapi3.SchemaRef{
						Value: &openapi3.Schema{
							Description: "description",
						},
					},
				},
			},
		},
	})

	operation.Responses.Set("201", &openapi3.ResponseRef{
		Value: &openapi3.Response{
			Content: map[string]*openapi3.MediaType{
				"application/vnd.atlas.2024-05-30+json": {
					Schema: &openapi3.SchemaRef{
						Value: &openapi3.Schema{
							Description: "description",
						},
					},
				},
			},
		},
	})

	oas.Paths.Set("/path", &openapi3.PathItem{Get: operation})

	version, err := apiversion.New(apiversion.WithVersion("2023-01-01"))
	require.NoError(t, err)

	filter := &VersioningFilter{
		oas:      oas,
		metadata: &Metadata{targetVersion: version},
	}

	require.NoError(t, filter.Apply())
	assert.NotNil(t, oas.Paths.Find("/path").Get)
	assert.NotNil(t, oas.Paths.Find("/path").Get.Responses)
	assert.NotNil(t, oas.Paths.Find("/path").Get.Responses.Map()["200"])
	assert.Nil(t, oas.Paths.Find("/path").Get.Responses.Map()["201"])
	assert.Equal(t, 1, oas.Paths.Find("/path").Get.Responses.Len())
}

func Test_FilterOperations_moveSunsetToOperationAndMarkDeprecated(t *testing.T) {
	response := &openapi3.ResponseRef{
		Value: &openapi3.Response{
			Content: openapi3.Content{
				"application/vnd.atlas.2023-01-01+json": &openapi3.MediaType{
					Extensions: map[string]any{
						"x-sunset":       "2024-01-01",
						"x-xgen-version": "2023-01-01",
					},
				},
			},
		},
	}
	responses := openapi3.Responses{}
	responses.Set("200", response)

	operation := &openapi3.Operation{
		Responses:   &responses,
		Summary:     "summary",
		Description: "description",
	}

	paths := openapi3.Paths{}
	paths.Set("/path", &openapi3.PathItem{Get: operation})

	version, err := apiversion.New(apiversion.WithVersion("2023-01-01"))
	require.NoError(t, err)

	f := &VersioningFilter{
		oas: &openapi3.T{
			Paths: &paths,
		},
		metadata: &Metadata{
			targetVersion: version,
		},
	}

	// Assert the sunset to be filtered exists
	require.Contains(t, f.oas.Paths.Find("/path").Get.Responses.Map()["200"].Value.Content["application/vnd.atlas.2023-01-01+json"].Extensions, "x-sunset")
	require.False(t, f.oas.Paths.Find("/path").Get.Deprecated)
	require.NoError(t, f.Apply())

	// Assert sunset was moved to operation
	require.Contains(t, f.oas.Paths.Find("/path").Get.Extensions, "x-sunset")
	require.NotContains(t, f.oas.Paths.Find("/path").Get.Responses.Map()["200"].Extensions, "x-sunset")
	require.NotContains(t, f.oas.Paths.Find("/path").Get.Responses.Map()["200"].Value.Content["application/vnd.atlas.2023-01-01+json"].Extensions, "x-sunset")
	require.True(t, f.oas.Paths.Find("/path").Get.Deprecated)

	// Assert oas was not updated
	require.Contains(t, f.oas.Paths.Find("/path").Get.Summary, "summary")
	require.Contains(t, f.oas.Paths.Find("/path").Get.Description, "description")
}

func getOasWithPaths() *openapi3.T {
	oas := &openapi3.T{}
	oas.Paths = &openapi3.Paths{
		Extensions: map[string]any{
			"x-sunset": "2025-01-10",
		},
	}

	validPath := &openapi3.PathItem{}
	validPath.SetOperation("GET", oasOperationAllVersions())

	oas.Paths.Set("/api/atlas/v2/groups/{groupId}/streams", validPath)

	return oas
}

func oasOperationAllVersions() *openapi3.Operation {
	responses := &openapi3.Responses{}
	responses.Set("200", &openapi3.ResponseRef{
		Value: &openapi3.Response{
			Content: map[string]*openapi3.MediaType{
				"application/vnd.atlas.2023-01-01+json": {},
				"application/vnd.atlas.2023-01-01+csv":  {},
				"application/vnd.atlas.2023-02-01+json": {},
				"application/vnd.atlas.2023-10-01+json": {},
				"application/vnd.atlas.2023-11-15+json": {},
				"application/vnd.atlas.2024-05-30+json": {},
			},
		},
	})

	return &openapi3.Operation{
		OperationID: "operationId",
		Responses:   responses,
		RequestBody: &openapi3.RequestBodyRef{
			Value: &openapi3.RequestBody{
				Content: map[string]*openapi3.MediaType{
					"application/vnd.atlas.2023-01-01+json": {},
					"application/vnd.atlas.2023-02-01+json": {},
					"application/vnd.atlas.2023-10-01+json": {},
					"application/vnd.atlas.2023-11-15+json": {},
					"application/vnd.atlas.2024-05-30+json": {},
				},
			},
		},
	}
}

func oasOperationFutureVersion() *openapi3.Operation {
	responses := &openapi3.Responses{}
	responses.Set("200", &openapi3.ResponseRef{
		Value: &openapi3.Response{
			Content: map[string]*openapi3.MediaType{
				"application/vnd.atlas.9000-05-30+json": {},
			},
		},
	})

	return &openapi3.Operation{
		OperationID: "operationIdFuture",
		Responses:   responses,
	}
}

func oasPathAllVersions() *openapi3.PathItem {
	return &openapi3.PathItem{
		Get: oasOperationAllVersions(),
		Put: oasOperationFutureVersion(),
	}
}
