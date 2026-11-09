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

package openapi

import (
	"testing"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/stretchr/testify/require"
)

const propertySunsetSpec = `{
  "openapi": "3.0.1",
  "info": {"title": "test", "version": "v1"},
  "paths": {
    "/things": {
      "post": {
        "operationId": "createThing",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "inlineGone": {"type": "string", "deprecated": true, "x-sunset": "2099-01-01"}
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "ok",
            "content": {
              "application/json": {
                "x-sunset": "2027-01-01",
                "schema": {
                  "type": "object",
                  "required": ["gone"],
                  "properties": {
                    "gone": {"type": "string", "deprecated": true, "x-sunset": "2020-01-01"}
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "Thing": {
        "type": "object",
        "properties": {
          "shared": {"$ref": "#/components/schemas/Shared"}
        }
      },
      "Shared": {
        "type": "object",
        "properties": {
          "gone": {"type": "string", "deprecated": true, "x-sunset": "2020-01-01"}
        }
      }
    }
  }
}`

func TestStripPropertySunsets(t *testing.T) {
	loader := openapi3.NewLoader()
	doc, err := loader.LoadFromData([]byte(propertySunsetSpec))
	require.NoError(t, err)

	require.NoError(t, stripPropertySunsets(doc))

	// Schemas reached through components, $refs and inline media types lose the extension.
	shared := doc.Components.Schemas["Shared"].Value.Properties["gone"].Value
	require.NotContains(t, shared.Extensions, sunsetExtension)
	require.True(t, shared.Deprecated)

	inline := doc.Paths.Value("/things").Post.RequestBody.Value.Content["application/json"].
		Schema.Value.Properties["inlineGone"].Value
	require.NotContains(t, inline.Extensions, sunsetExtension)

	response := doc.Paths.Value("/things").Post.Responses.Status(200).Value.Content["application/json"].
		Schema.Value.Properties["gone"].Value
	require.NotContains(t, response.Extensions, sunsetExtension)

	// Media type and operation extensions are used for version sunsetting and must survive.
	mediaType := doc.Paths.Value("/things").Post.Responses.Status(200).Value.Content["application/json"]
	require.Equal(t, "2027-01-01", mediaType.Extensions[sunsetExtension])
}
