// Copyright 2026 MongoDB Inc
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

package merge

import (
	"encoding/json"
	"testing"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/mongodb/openapi/tools/foas/openapi"
	"github.com/spf13/afero"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.uber.org/mock/gomock"
)

func newTestOperation(operationID string, statusCodes ...string) *openapi3.Operation {
	responses := openapi3.NewResponsesWithCapacity(len(statusCodes))
	for _, statusCode := range statusCodes {
		responses.Set(statusCode, &openapi3.ResponseRef{Value: openapi3.NewResponse()})
	}

	return &openapi3.Operation{OperationID: operationID, Responses: responses}
}

func newTestSpec(pathItem *openapi3.PathItem) *openapi.Spec {
	paths := openapi3.NewPathsWithCapacity(1)
	paths.Set("/api/atlas/v2/groups/{groupId}/things", pathItem)

	return &openapi.Spec{OpenAPI: "3.0.1", Info: &openapi3.Info{}, Paths: paths}
}

func TestTagLongRunningOperations(t *testing.T) {
	testCases := []struct {
		want        any
		name        string
		operationID string
		statusCodes []string
	}{
		{
			name:        "Compliant202IsTaggedAsNonLegacy",
			operationID: "createGroupThing",
			statusCodes: []string{"202"},
			want:        longRunningOperation{Legacy: false},
		},
		{
			name:        "Legacy202IsTaggedAsLegacy",
			operationID: "deleteGroupCluster",
			statusCodes: []string{"202"},
			want:        longRunningOperation{Legacy: true},
		},
		{
			name:        "202AlongsideOtherResponsesIsTagged",
			operationID: "updateGroupUserSecurity",
			statusCodes: []string{"200", "202", "400"},
			want:        longRunningOperation{Legacy: true},
		},
		{
			name:        "Non202IsNotTagged",
			operationID: "listGroupThings",
			statusCodes: []string{"200", "500"},
			want:        nil,
		},
		{
			name:        "204IsNotTagged",
			operationID: "deleteGroupThing",
			statusCodes: []string{"204"},
			want:        nil,
		},
		{
			// An ID in the list is only marked legacy when the operation also returns 202.
			name:        "LegacyOperationIDWithout202IsNotTagged",
			operationID: "deleteGroupCluster",
			statusCodes: []string{"200"},
			want:        nil,
		},
	}

	for _, tt := range testCases {
		t.Run(tt.name, func(t *testing.T) {
			operation := newTestOperation(tt.operationID, tt.statusCodes...)

			tagLongRunningOperations(newTestSpec(&openapi3.PathItem{Post: operation}))

			assert.Equal(t, tt.want, operation.Extensions[longRunningOperationExtension])
		})
	}
}

func TestTagLongRunningOperations_TagsEveryHTTPMethod(t *testing.T) {
	pathItem := &openapi3.PathItem{
		Get:    newTestOperation("listGroupThings", "200"),
		Post:   newTestOperation("createGroupThing", "202"),
		Put:    newTestOperation("cutoverGroupLiveMigration", "202"),
		Patch:  newTestOperation("updateGroupUserSecurity", "202"),
		Delete: newTestOperation("deleteGroupCluster", "202"),
	}

	tagLongRunningOperations(newTestSpec(pathItem))

	assert.Nil(t, pathItem.Get.Extensions[longRunningOperationExtension])
	assert.Equal(t, longRunningOperation{Legacy: false},
		pathItem.Post.Extensions[longRunningOperationExtension])
	for _, operation := range []*openapi3.Operation{pathItem.Put, pathItem.Patch, pathItem.Delete} {
		assert.Equal(t, longRunningOperation{Legacy: true},
			operation.Extensions[longRunningOperationExtension], operation.OperationID)
	}
}

func TestTagLongRunningOperations_RemovesStaleExtensionAndKeepsOthers(t *testing.T) {
	operation := newTestOperation("listGroupThings", "200")
	operation.Extensions = map[string]any{
		longRunningOperationExtension: longRunningOperation{Legacy: true},
		"x-xgen-owner-team":           "APIx",
	}

	tagLongRunningOperations(newTestSpec(&openapi3.PathItem{Get: operation}))

	assert.NotContains(t, operation.Extensions, longRunningOperationExtension,
		"the extension was left on an operation that does not return 202")
	assert.Equal(t, "APIx", operation.Extensions["x-xgen-owner-team"],
		"an unrelated extension was modified")
}

func TestTagLongRunningOperations_PreservesUnrelatedExtensionsOnTaggedOperation(t *testing.T) {
	operation := newTestOperation("createGroupThing", "202")
	operation.Extensions = map[string]any{"x-xgen-owner-team": "APIx"}

	tagLongRunningOperations(newTestSpec(&openapi3.PathItem{Post: operation}))

	assert.Equal(t, "APIx", operation.Extensions["x-xgen-owner-team"])
	assert.Equal(t, longRunningOperation{Legacy: false},
		operation.Extensions[longRunningOperationExtension])
}

// TestLongRunningOperation_EmittedShape pins the JSON encoding, which the YAML output derives from.
func TestLongRunningOperation_EmittedShape(t *testing.T) {
	compliant, err := json.Marshal(longRunningOperation{Legacy: false})
	require.NoError(t, err)
	assert.JSONEq(t, `{"legacy":false}`, string(compliant))

	legacy, err := json.Marshal(longRunningOperation{Legacy: true})
	require.NoError(t, err)
	assert.JSONEq(t, `{"legacy":true}`, string(legacy))
}

func TestTagLongRunningOperations_NilSafe(t *testing.T) {
	require.NotPanics(t, func() {
		tagLongRunningOperations(nil)
		tagLongRunningOperations(&openapi.Spec{})
		tagLongRunningOperations(&openapi.Spec{Paths: openapi3.NewPathsWithCapacity(0)})
		tagLongRunningOperations(newTestSpec(nil))
		tagLongRunningOperations(newTestSpec(&openapi3.PathItem{Get: &openapi3.Operation{OperationID: "noResponses"}}))
	})
}

// TestMerge_Run_WritesLongRunningOperationExtension checks the extension in the files Run writes,
// which are the federated spec saved as openapi/.raw/v2.json and openapi/.raw/v2.yaml.
func TestMerge_Run_WritesLongRunningOperationExtension(t *testing.T) {
	ctrl := gomock.NewController(t)
	mockMergerStore := openapi.NewMockMerger(ctrl)
	fs := afero.NewMemMapFs()

	opts := &Opts{
		Merger:        mockMergerStore,
		basePath:      "base.json",
		outputPath:    "foas.json",
		externalPaths: []string{"external.json"},
		fs:            fs,
	}

	federated := newTestSpec(&openapi3.PathItem{
		Post:   newTestOperation("createGroupThing", "202"),
		Delete: newTestOperation("deleteGroupCluster", "202"),
		Get:    newTestOperation("listGroupThings", "200"),
	})
	federated.Tags = openapi3.Tags{}

	mockMergerStore.
		EXPECT().
		MergeOpenAPISpecs(opts.externalPaths).
		Return(federated, nil).
		Times(1)

	require.NoError(t, opts.Run())

	jsonOutput, err := afero.ReadFile(fs, "foas.json")
	require.NoError(t, err)
	assert.Contains(t, string(jsonOutput), `"x-xgen-long-running-operation"`)
	assert.Contains(t, string(jsonOutput), `"legacy": true`)
	assert.Contains(t, string(jsonOutput), `"legacy": false`)

	yamlOutput, err := afero.ReadFile(fs, "foas.yaml")
	require.NoError(t, err)
	assert.Contains(t, string(yamlOutput), "x-xgen-long-running-operation:")
	assert.Contains(t, string(yamlOutput), "legacy: true")
}
