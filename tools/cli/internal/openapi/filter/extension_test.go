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
	"fmt"
	"testing"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/mongodb/openapi/tools/cli/internal/apiversion"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestXSunsetFilter_removeSunset(t *testing.T) {
	tests := []struct {
		name       string
		oas        *openapi3.T
		version    string
		sunsetDate string
	}{
		{
			name:       "sunset 2023-01-01",
			oas:        getOasSunset(),
			version:    "2023-01-01",
			sunsetDate: "2024-05-30",
		},
		{
			name:       "sunset 2024-05-30",
			oas:        getOasSunset(),
			version:    "2024-05-30",
			sunsetDate: "",
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			version, err := apiversion.New(apiversion.WithVersion(tt.version))
			require.NoError(t, err)
			oas := tt.oas

			filter := &ExtensionFilter{
				oas:      oas,
				metadata: &Metadata{targetVersion: version, targetEnv: "dev"},
			}

			contentKey := fmt.Sprintf("application/vnd.atlas.%s+json", tt.version)
			require.NoError(t, filter.Apply())
			assert.NotNil(t, oas.Paths.Find("/path").Get)
			assert.NotEmpty(t, oas.Paths.Find("/path").Get.Responses)
			assert.NotNil(t, oas.Paths.Find("/path").Get.Responses.Map()["200"])

			if tt.sunsetDate == "" {
				assert.Empty(t, oas.Paths.Find("/path").Get.Responses.Map()["200"].Value.Content.Get(contentKey).Extensions)
				return
			}

			assert.NotNil(t, oas.Paths.Find("/path").Get.Responses.Map()["200"].Value.Content.Get(contentKey))
			contentExtensions := oas.Paths.Find("/path").Get.Responses.Map()["200"].Value.Content.Get(contentKey).Extensions
			assert.Contains(t, contentExtensions, sunsetExtension)
			assert.Equal(t, tt.sunsetDate, contentExtensions[sunsetExtension])
		})
	}
}

func getOasSunset() *openapi3.T {
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
					Extensions: map[string]interface{}{
						"x-sunset":    "2024-05-30T00:00:00Z",
						xGenExtension: "2023-01-01",
					},
				},
				"application/vnd.atlas.2024-02-30+json": {
					Schema: &openapi3.SchemaRef{
						Value: &openapi3.Schema{
							Description: "description",
						},
					},
					Extensions: map[string]interface{}{
						"x-sunset":    "2024-04-10",
						xGenExtension: "2024-02-30",
					},
				},
				"application/vnd.atlas.2025-01-01+json": {
					Schema: &openapi3.SchemaRef{
						Value: &openapi3.Schema{
							Description: "description",
						},
						Extensions: map[string]interface{}{
							"x-sunset": "2025-01-01T00:00:00Z",
						},
					},
					Extensions: map[string]interface{}{
						hiddenEnvsExtension: map[string]interface{}{
							"envs": "dev,qa,prod,stage",
						},
					},
				},
				"application/vnd.atlas.2024-05-30+json": {
					Schema: &openapi3.SchemaRef{
						Value: &openapi3.Schema{
							Description: "description",
						},
					},
					Extensions: map[string]interface{}{
						"x-sunset":    "2025-01-01T00:00:00Z",
						xGenExtension: "2024-05-30",
					},
				},
			},
		},
	})

	oas.Paths.Set("/path", &openapi3.PathItem{Get: operation})
	return oas
}
