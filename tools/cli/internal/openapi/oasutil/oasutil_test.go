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

package oasutil

import (
	"testing"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestDuplicate(t *testing.T) {
	t.Run("inline schemas survive with Value populated", func(t *testing.T) {
		doc := &openapi3.T{
			OpenAPI: "3.0.0",
			Info:    &openapi3.Info{Title: "T", Version: "1.0"},
			Components: &openapi3.Components{
				Schemas: openapi3.Schemas{
					"User": {Value: &openapi3.Schema{Type: &openapi3.Types{"object"}}},
				},
			},
		}

		dup, err := Duplicate(doc)
		require.NoError(t, err)
		require.NotNil(t, dup.Components)
		require.Contains(t, dup.Components.Schemas, "User")
		assert.Empty(t, dup.Components.Schemas["User"].Ref)
		require.NotNil(t, dup.Components.Schemas["User"].Value, "inline schemas must keep their Value after round-trip")
		require.NotNil(t, dup.Components.Schemas["User"].Value.Type)
		assert.Equal(t, openapi3.Types{"object"}, *dup.Components.Schemas["User"].Value.Type)
	})

	t.Run("returns independent copy", func(t *testing.T) {
		doc := &openapi3.T{
			Info: &openapi3.Info{Title: "Original", Version: "1.0.0"},
		}

		dup, err := Duplicate(doc)
		require.NoError(t, err)

		dup.Info.Title = "Mutated"

		assert.Equal(t, "Original", doc.Info.Title, "mutation on duplicate must not leak to original")
	})

	t.Run("ref values are nil by design", func(t *testing.T) {
		doc := &openapi3.T{
			OpenAPI: "3.0.0",
			Info:    &openapi3.Info{Title: "T", Version: "1.0"},
			Components: &openapi3.Components{
				Schemas: openapi3.Schemas{
					"User": {Value: &openapi3.Schema{Type: &openapi3.Types{"object"}}},
					"Ref":  {Ref: "#/components/schemas/User"},
				},
			},
		}

		dup, err := Duplicate(doc)
		require.NoError(t, err)
		require.NotNil(t, dup.Components)
		require.Contains(t, dup.Components.Schemas, "Ref")
		assert.Equal(t, "#/components/schemas/User", dup.Components.Schemas["Ref"].Ref)
		assert.Nil(t, dup.Components.Schemas["Ref"].Value, "Duplicate must not resolve refs")
	})

	t.Run("nil input returns error", func(t *testing.T) {
		dup, err := Duplicate(nil)
		require.Error(t, err)
		assert.Nil(t, dup)
		assert.Contains(t, err.Error(), "openapi document is nil")
	})
}
