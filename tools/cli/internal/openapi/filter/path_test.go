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

func TestPathFilter_getLatestVersionMatch(t *testing.T) {
	testCases := []struct {
		name          string
		targetVersion string
		expectedMatch string
	}{
		{
			name:          "exact match 2023-01-01",
			targetVersion: "2023-01-01",
			expectedMatch: "2023-01-01",
		},
		{
			name:          "exact match 2023-11-15",
			targetVersion: "2023-11-15",
			expectedMatch: "2023-11-15",
		},
		{
			name:          "exact match 2024-05-30",
			targetVersion: "2024-05-30",
			expectedMatch: "2024-05-30",
		},
		{
			name:          "approx match 2023-01-01",
			targetVersion: "2023-01-02",
			expectedMatch: "2023-01-01",
		},
		{
			name:          "approx match 2023-01-01",
			targetVersion: "2023-01-31",
			expectedMatch: "2023-01-01",
		},
		{
			name:          "approx match 2023-02-01",
			targetVersion: "2023-02-20",
			expectedMatch: "2023-02-01",
		},
		{
			name:          "future date",
			targetVersion: "2030-02-20",
			expectedMatch: "2024-05-30",
		},
		{
			name:          "past date",
			targetVersion: "1999-02-20",
			expectedMatch: "1999-02-20",
		},
	}

	for _, tt := range testCases {
		t.Run(tt.name, func(t *testing.T) {
			targetVersion, err := apiversion.New(apiversion.WithVersion(tt.targetVersion))
			require.NoError(t, err)
			r, err := getLatestVersionMatch(oasOperationAllVersions(), targetVersion)
			require.NoError(t, err)
			// transform time to str with format "2006-01-02"
			assert.Equal(t, tt.expectedMatch, r.String())
		})
	}
}

func TestPathFilter_processPathItem(t *testing.T) {
	filter := &PathFilter{}
	version, err := apiversion.New(apiversion.WithVersion("2023-11-15"))
	require.NoError(t, err)

	oas := oasPathAllVersions()
	err = filter.apply(oas, &Metadata{targetVersion: version})

	require.NoError(t, err)
	assert.NotNil(t, oas.Get)
	assert.Equal(t, 1, oas.Get.Responses.Len())

	get200Responses := oas.Get.Responses.Map()["200"]
	assert.NotNil(t, get200Responses)

	get200ResponsesContent := get200Responses.Value.Content
	assert.NotNil(t, get200ResponsesContent.Get("application/vnd.atlas.2023-11-15+json"))
}

func TestPathFilter_moreThanOneResponse(t *testing.T) {
	filter := &PathFilter{}
	version, err := apiversion.New(apiversion.WithVersion("2023-01-01"))
	require.NoError(t, err)

	oas := oasPathAllVersions()
	err = filter.apply(oas, &Metadata{targetVersion: version})

	require.NoError(t, err)
	assert.NotNil(t, oas.Get)
	assert.Equal(t, 1, oas.Get.Responses.Len())

	get200Responses := oas.Get.Responses.Map()["200"]
	assert.NotNil(t, get200Responses)

	get200ResponsesContent := get200Responses.Value.Content
	assert.NotNil(t, get200ResponsesContent.Get("application/vnd.atlas.2023-01-01+json"))
	assert.NotNil(t, get200ResponsesContent.Get("application/vnd.atlas.2023-01-01+csv"))
}

func TestPathFilter_removeEmptyPaths(t *testing.T) {
	version, err := apiversion.New(apiversion.WithVersion("2023-11-15"))
	require.NoError(t, err)

	filter := &PathFilter{
		oas:      getOasWithEmptyPaths(),
		metadata: &Metadata{targetVersion: version},
	}

	require.NoError(t, filter.Apply())
	assert.Empty(t, filter.oas.Paths.Map())
}

func TestPathFilter_filterRequestBody(t *testing.T) {
	filter := &PathFilter{}

	version, err := apiversion.New(apiversion.WithVersion("2023-11-15"))
	require.NoError(t, err)

	oas := oasPathAllVersions()
	err = filter.apply(oas, &Metadata{targetVersion: version})

	require.NoError(t, err)
	assert.NotNil(t, oas.Get)
	assert.NotNil(t, oas.Get.RequestBody)
	assert.NotNil(t, oas.Get.RequestBody.Value.Content)
	assert.NotNil(t, oas.Get.RequestBody.Value.Content.Get("application/vnd.atlas.2023-11-15+json"))
}

func getOasWithEmptyPaths() *openapi3.T {
	oas := &openapi3.T{}
	oas.Paths = &openapi3.Paths{}
	oas.Paths.Set("/api/atlas/v2/groups/{groupId}/streams", &openapi3.PathItem{})
	oas.Paths.Set("/api/atlas/v2/groups/{groupId}/streams/{tenantName}/auditLogs", &openapi3.PathItem{})
	oas.Paths.Set("/path3", &openapi3.PathItem{})

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
