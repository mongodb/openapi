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
	"github.com/getkin/kin-openapi/openapi3"
)

const sunsetExtension = "x-sunset"

// stripPropertySunsets removes x-sunset from schema objects.
//
// oasdiff v1.35.0 stops reporting deprecated properties removed after their
// sunset date; the changelog reports every removal. Media type and operation
// sunsets (version sunsetting) are untouched.
func stripPropertySunsets(doc *openapi3.T) error {
	return doc.WalkSchemas(func(_ string, schema *openapi3.SchemaRef) error {
		delete(schema.Value.Extensions, sunsetExtension)
		return nil
	})
}
