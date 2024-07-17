// Copyright 2024 MongoDB Inc
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

func Test_FilterOperations_owners(t *testing.T) {
	operation := &openapi3.Operation{
		Extensions: map[string]interface{}{
			"x-xgen-owner-team": "team1",
		},
		Summary:     "summary",
		Description: "description",
	}

	paths := openapi3.Paths{}
	paths.Set("/path", &openapi3.PathItem{Get: operation})

	f := &OperationsFilter{oas: &openapi3.T{
		Paths: &paths,
	}}
	require.Contains(t, f.oas.Paths.Find("/path").Get.Extensions, "x-xgen-owner-team")

	require.NoError(t, f.Apply())
	require.NotContains(t, f.oas.Paths.Find("/path").Get.Extensions, "x-xgen-owner-team")
	require.Contains(t, f.oas.Paths.Find("/path").Get.Summary, "summary")
	require.Contains(t, f.oas.Paths.Find("/path").Get.Description, "description")
}

func Test_FilterOperations_moveSunsetToOperationAndMarkDeprecated(t *testing.T) {
	response := &openapi3.ResponseRef{
		Value: &openapi3.Response{
			Content: openapi3.Content{
				"application/json": &openapi3.MediaType{
					Extensions: map[string]interface{}{
						"x-sunset": "2024-01-01"},
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

	f := &OperationsFilter{oas: &openapi3.T{
		Paths: &paths,
	}}

	// Assert the sunset to be filtered exists
	require.Contains(t, f.oas.Paths.Find("/path").Get.Responses.Map()["200"].Value.Content["application/json"].Extensions, "x-sunset")
	require.False(t, f.oas.Paths.Find("/path").Get.Deprecated)
	require.NoError(t, f.Apply())

	// Assert sunset was moved to operation
	require.Contains(t, f.oas.Paths.Find("/path").Get.Extensions, "x-sunset")
	require.NotContains(t, f.oas.Paths.Find("/path").Get.Responses.Map()["200"].Extensions, "x-sunset")
	require.NotContains(t, f.oas.Paths.Find("/path").Get.Responses.Map()["200"].Value.Content["application/json"].Extensions, "x-sunset")
	require.True(t, f.oas.Paths.Find("/path").Get.Deprecated)

	// Assert oas was not updated
	require.Contains(t, f.oas.Paths.Find("/path").Get.Summary, "summary")
	require.Contains(t, f.oas.Paths.Find("/path").Get.Description, "description")
}
