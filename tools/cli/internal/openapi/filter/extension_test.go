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

			versionExtension := oas.Paths.Find("/path").Get.Responses.Map()["200"].Value.Content.Get(contentKey).Extensions[xGenExtension]
			assert.Equal(t, tt.version, versionExtension)

			if tt.sunsetDate == "" {
				assert.Empty(t, oas.Paths.Find("/path").Get.Responses.Map()["200"].Value.Content.Get(contentKey).Extensions[sunsetExtension])
				return
			}

			assert.NotNil(t, oas.Paths.Find("/path").Get.Responses.Map()["200"].Value.Content.Get(contentKey))
			contentExtensions := oas.Paths.Find("/path").Get.Responses.Map()["200"].Value.Content.Get(contentKey).Extensions
			assert.Contains(t, contentExtensions, sunsetExtension)
			assert.Equal(t, tt.sunsetDate, contentExtensions[sunsetExtension])
		})
	}
}

func TestExtensionFilter_removeIpaException(t *testing.T) {
	oas := getOasIpaExceptions()
	version, err := apiversion.New(apiversion.WithVersion("2023-01-01"))
	require.NoError(t, err)

	filter := &ExtensionFilter{
		oas:      oas,
		metadata: &Metadata{targetVersion: version, targetEnv: "dev"},
	}
	require.NoError(t, filter.Apply())

	contentKey := fmt.Sprintf("application/vnd.atlas.%s+json", version)

	tests := []struct {
		name      string
		component any
		extension any
	}{
		{
			name:      "operationParameter",
			component: oas.Paths.Find("/path").Get.Parameters[0],
			extension: oas.Paths.Find("/path").Get.Parameters[0].Extensions[ipaExceptionExtension],
		},
		{
			name:      "operationParameterSchema",
			component: oas.Paths.Find("/path").Get.Parameters[0].Value.Schema,
			extension: oas.Paths.Find("/path").Get.Parameters[0].Value.Schema.Extensions[ipaExceptionExtension],
		},
		{
			name:      "operation",
			component: oas.Paths.Find("/path").Get,
			extension: oas.Paths.Find("/path").Get.Extensions[ipaExceptionExtension],
		},
		{
			name:      "responseSchema",
			component: oas.Paths.Find("/path").Get.Responses.Map()["200"].Value.Content.Get(contentKey).Schema,
			extension: oas.Paths.Find("/path").Get.Responses.Map()["200"].Value.Content.Get(contentKey).Schema.Extensions[ipaExceptionExtension],
		},
		{
			name:      "responseValue",
			component: oas.Paths.Find("/path").Get.Responses.Map()["200"].Value,
			extension: oas.Paths.Find("/path").Get.Responses.Map()["200"].Value.Extensions[ipaExceptionExtension],
		},
		{
			name:      "response",
			component: oas.Paths.Find("/path").Get.Responses.Map()["200"],
			extension: oas.Paths.Find("/path").Get.Responses.Map()["200"].Extensions[ipaExceptionExtension],
		},
		{
			name:      "requestBody",
			component: oas.Paths.Find("/path").Get.RequestBody,
			extension: oas.Paths.Find("/path").Get.RequestBody.Extensions[ipaExceptionExtension],
		},
		{
			name:      "requestBodyContent",
			component: oas.Paths.Find("/path").Get.RequestBody.Value.Content.Get(contentKey),
			extension: oas.Paths.Find("/path").Get.RequestBody.Value.Content.Get(contentKey).Extensions[ipaExceptionExtension],
		},
		{
			name:      "requestBodyContentSchema",
			component: oas.Paths.Find("/path").Get.RequestBody.Value.Content.Get(contentKey).Schema,
			extension: oas.Paths.Find("/path").Get.RequestBody.Value.Content.Get(contentKey).Schema.Extensions[ipaExceptionExtension],
		},
		{
			name:      "path",
			component: oas.Paths.Find("/path"),
			extension: oas.Paths.Find("/path").Extensions[ipaExceptionExtension],
		},
		{
			name:      "tag",
			component: oas.Tags.Get("tag"),
			extension: oas.Tags.Get("tag").Extensions[ipaExceptionExtension],
		},
		{
			name:      "componentParameter",
			component: oas.Components.Parameters["parameter"],
			extension: oas.Components.Parameters["parameter"].Extensions[ipaExceptionExtension],
		},
		{
			name:      "componentSchema",
			component: oas.Components.Schemas["schema"],
			extension: oas.Components.Schemas["schema"].Extensions[ipaExceptionExtension],
		},
		{
			name:      "componentSchemaValue",
			component: oas.Components.Schemas["schema"].Value,
			extension: oas.Components.Schemas["schema"].Value.Extensions[ipaExceptionExtension],
		},
		{
			name:      "componentSchemaProperty",
			component: oas.Components.Schemas["schema"].Value.Properties["property"],
			extension: oas.Components.Schemas["schema"].Value.Properties["property"].Extensions[ipaExceptionExtension],
		},
		{
			name:      "componentAllOfSchemaProperty",
			component: oas.Components.Schemas["schemaAllOf"].Value.AllOf[0].Value.Properties["property"],
			extension: oas.Components.Schemas["schemaAllOf"].Value.AllOf[0].Value.Properties["property"].Extensions[ipaExceptionExtension],
		},
		{
			name:      "componentAnyOfSchemaProperty",
			component: oas.Components.Schemas["schemaAnyOf"].Value.AnyOf[0].Value.Properties["property"],
			extension: oas.Components.Schemas["schemaAnyOf"].Value.AnyOf[0].Value.Properties["property"].Extensions[ipaExceptionExtension],
		},
		{
			name:      "componentOneOfSchemaProperty",
			component: oas.Components.Schemas["schemaOneOf"].Value.OneOf[0].Value.Properties["property"],
			extension: oas.Components.Schemas["schemaOneOf"].Value.OneOf[0].Value.Properties["property"].Extensions[ipaExceptionExtension],
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.NotNil(t, tt.component)
			assert.Nil(t, tt.extension)
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
					Extensions: map[string]any{
						"x-sunset":    "2024-05-30T00:00:00Z",
						xGenExtension: "2023-01-01T00:00:00Z",
					},
				},
				"application/vnd.atlas.2024-02-30+json": {
					Schema: &openapi3.SchemaRef{
						Value: &openapi3.Schema{
							Description: "description",
						},
					},
					Extensions: map[string]any{
						"x-sunset":    "2024-04-10",
						xGenExtension: "2024-02-30T00:00:00Z",
					},
				},
				"application/vnd.atlas.2025-01-01+json": {
					Schema: &openapi3.SchemaRef{
						Value: &openapi3.Schema{
							Description: "description",
						},
						Extensions: map[string]any{
							"x-sunset":    "2025-01-01T00:00:00Z",
							xGenExtension: "2025-01-01",
						},
					},
					Extensions: map[string]any{
						hiddenEnvsExtension: map[string]any{
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
					Extensions: map[string]any{
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

func getOasIpaExceptions() *openapi3.T {
	extension := map[string]any{
		ipaExceptionExtension: map[string]string{"IPA-104-resource-has-GET": "reason"},
	}

	oas := &openapi3.T{}
	oas.Paths = &openapi3.Paths{}
	oas.Tags = make([]*openapi3.Tag, 0)
	oas.Components = &openapi3.Components{}

	parameters := make(openapi3.Parameters, 0)
	parameters = append(parameters, &openapi3.ParameterRef{
		Value: &openapi3.Parameter{
			Description: "description",
			Schema: &openapi3.SchemaRef{
				Value: &openapi3.Schema{
					Description: "description",
				},
				Extensions: extension,
			},
		},
		Extensions: extension})

	operation := &openapi3.Operation{
		Responses:   &openapi3.Responses{},
		RequestBody: &openapi3.RequestBodyRef{},
		Parameters:  parameters,
		Extensions:  extension,
	}

	operation.Responses.Set("200", &openapi3.ResponseRef{
		Value: &openapi3.Response{
			Content: map[string]*openapi3.MediaType{
				"application/vnd.atlas.2023-01-01+json": {
					Schema: &openapi3.SchemaRef{
						Value: &openapi3.Schema{
							Description: "description",
						},
						Extensions: extension,
					},
				},
			},
			Extensions: extension,
		},
		Extensions: extension,
	})

	operation.RequestBody = &openapi3.RequestBodyRef{
		Value: &openapi3.RequestBody{
			Content: map[string]*openapi3.MediaType{
				"application/vnd.atlas.2023-01-01+json": {
					Schema: &openapi3.SchemaRef{
						Value: &openapi3.Schema{
							Description: "description",
						},
						Extensions: extension,
					},
					Extensions: extension,
				},
			},
		},
		Extensions: extension,
	}

	oas.Paths.Set("/path", &openapi3.PathItem{
		Get:        operation,
		Extensions: extension})

	oas.Tags = append(oas.Tags, &openapi3.Tag{
		Name:        "tag",
		Description: "description",
		Extensions:  extension,
	})

	multipleSchemas := make(openapi3.SchemaRefs, 0)

	multipleSchemas = append(multipleSchemas, &openapi3.SchemaRef{
		Value: &openapi3.Schema{
			Properties: map[string]*openapi3.SchemaRef{
				"property": {
					Value: &openapi3.Schema{
						Description: "description",
						Extensions:  extension,
					},
				},
			},
		},
	})

	components := &openapi3.Components{
		Parameters: map[string]*openapi3.ParameterRef{
			"parameter": {
				Value: &openapi3.Parameter{
					Description: "description",
				},
				Extensions: extension,
			},
		},
		Schemas: map[string]*openapi3.SchemaRef{
			"schema": {
				Value: &openapi3.Schema{
					Description: "description",
					Properties: map[string]*openapi3.SchemaRef{
						"property": {
							Value: &openapi3.Schema{
								Description: "description",
								Extensions:  extension,
							},
						},
					},
					Extensions: extension,
				},
				Extensions: extension,
			},
			"schemaAllOf": {
				Value: &openapi3.Schema{
					Description: "description",
					AllOf:       multipleSchemas,
				},
			},
			"schemaAnyOf": {
				Value: &openapi3.Schema{
					Description: "description",
					AnyOf:       multipleSchemas,
				},
			},
			"schemaOneOf": {
				Value: &openapi3.Schema{
					Description: "description",
					OneOf:       multipleSchemas,
				},
			},
		}}

	oas.Components = components

	return oas
}
