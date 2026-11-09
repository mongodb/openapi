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
// oasdiff v1.35.0 applies the parameter and endpoint lifecycle to request
// properties and required response properties: a deprecated property removed
// before its x-sunset date is reported as *-removed-before-sunset, and one
// removed after that date is not reported at all. The changelog records every
// change and Atlas treats every property removal as breaking, so the extension
// is hidden from the comparison to keep the behavior of oasdiff v1.34.
//
// Only schema objects are touched. Operation and media type x-sunset values
// drive API version sunsetting and are left in place.
func stripPropertySunsets(doc *openapi3.T) error {
	return doc.WalkSchemas(func(_ string, schema *openapi3.SchemaRef) error {
		delete(schema.Value.Extensions, sunsetExtension)
		return nil
	})
}
