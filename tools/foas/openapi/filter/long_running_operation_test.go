// Copyright 2026 MongoDB Inc
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
	"github.com/mongodb/openapi/tools/foas/apiversion"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// longRunningOperationExtension is set by the merge command and must pass through the filters
// unchanged. Declared here because tools/foas cannot import tools/cli.
const longRunningOperationExtension = "x-xgen-long-running-operation"

func newLongRunningOperationTestOas(version string) *openapi3.T {
	responses := openapi3.NewResponsesWithCapacity(1)
	responses.Set("202", &openapi3.ResponseRef{Value: &openapi3.Response{
		Extensions: map[string]any{},
		Content: openapi3.Content{
			"application/vnd.atlas." + version + "+json": openapi3.NewMediaType(),
		},
	}})

	operation := &openapi3.Operation{
		OperationID: "deleteGroupCluster",
		// CodeSampleFilter derives the Atlas CLI sample from the first tag.
		Tags:      []string{"Clusters"},
		Responses: responses,
		Extensions: map[string]any{
			longRunningOperationExtension: map[string]any{"legacy": true},
			"x-xgen-owner-team":           "APIx",
			ipaExceptionExtension:         map[string]any{"IPA-104": "reason"},
		},
	}

	paths := openapi3.NewPathsWithCapacity(1)
	paths.Set("/api/atlas/v2/groups/{groupId}/clusters/{clusterName}", &openapi3.PathItem{Delete: operation})

	return &openapi3.T{
		OpenAPI:    "3.0.1",
		Info:       &openapi3.Info{Title: "Test API", Version: "1.0.0"},
		Paths:      paths,
		Components: &openapi3.Components{},
	}
}

func filteredOperation(t *testing.T, oas *openapi3.T) *openapi3.Operation {
	t.Helper()

	operation := oas.Paths.Find("/api/atlas/v2/groups/{groupId}/clusters/{clusterName}").Delete
	require.NotNil(t, operation, "the operation must survive filtering")

	return operation
}

// TestLongRunningOperationExtensionIsPublished applies the filters used by `foascli filter`,
// which produces openapi/v2.json and openapi/v2.yaml.
func TestLongRunningOperationExtensionIsPublished(t *testing.T) {
	oas := newLongRunningOperationTestOas("2023-01-01")

	filtered, err := ApplyFilters(oas, NewMetadata(nil, "prod"), FiltersWithoutVersioning)
	require.NoError(t, err)

	operation := filteredOperation(t, filtered)

	assert.Equal(t, map[string]any{"legacy": true},
		operation.Extensions[longRunningOperationExtension])

	// Extensions that were already filtered out stay filtered out.
	assert.NotContains(t, operation.Extensions, "x-xgen-owner-team")
	assert.NotContains(t, operation.Extensions, ipaExceptionExtension)
}

// TestLongRunningOperationExtensionIsPublishedPerVersion applies the filters used by
// `foascli split`, which produces the per-version specs under openapi/v2.
func TestLongRunningOperationExtensionIsPublishedPerVersion(t *testing.T) {
	version, err := apiversion.New(apiversion.WithVersion("2023-01-01"))
	require.NoError(t, err)

	oas := newLongRunningOperationTestOas("2023-01-01")

	filtered, err := ApplyFilters(oas, NewMetadata(version, "prod"), DefaultFilters)
	require.NoError(t, err)

	operation := filteredOperation(t, filtered)

	assert.Equal(t, map[string]any{"legacy": true},
		operation.Extensions[longRunningOperationExtension])
	assert.NotNil(t, operation.Responses.Value("202"),
		"the versioning filters dropped the 202 the extension refers to")
}
