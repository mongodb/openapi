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

// Package oasutil holds small utilities for working with kin-openapi documents.
package oasutil

import (
	"encoding/json"
	"errors"
	"fmt"

	"github.com/getkin/kin-openapi/openapi3"
)

// Duplicate returns an independent copy of an OpenAPI document via JSON
// round-trip. The returned document does NOT have $ref.Value fields populated:
// kin-openapi's JSON marshaller omits resolved values, and the unmarshaller
// does not re-resolve. Callers that need to inspect a referenced schema body
// should look it up by name in Components instead of dereferencing .Value.
//
// Duplicate is intended for creating a safe-to-mutate working copy of a spec
// loaded by openapi3.Loader.
func Duplicate(doc *openapi3.T) (*openapi3.T, error) {
	if doc == nil {
		return nil, errors.New("openapi document is nil")
	}

	jsonData, err := json.Marshal(doc)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal OpenAPI specification: %w", err)
	}

	dup := &openapi3.T{}
	if err := json.Unmarshal(jsonData, dup); err != nil {
		return nil, fmt.Errorf("failed to unmarshal duplicated OpenAPI specification: %w", err)
	}

	return dup, nil
}
