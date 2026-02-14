// Copyright 2025 MongoDB Inc
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

package registry

import (
	"errors"
	"testing"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func createTestSpec(title, version string) *openapi3.T {
	return &openapi3.T{
		OpenAPI: "3.0.0",
		Info: &openapi3.Info{
			Title:   title,
			Version: version,
		},
	}
}

func TestNew(t *testing.T) {
	reg := New()
	assert.NotNil(t, reg)
	assert.Equal(t, 0, reg.Count())
}

func TestLoad(t *testing.T) {
	reg := New()
	spec := createTestSpec("Test API", "1.0.0")

	err := reg.Load("test", spec, "/path/to/spec.yaml")
	require.NoError(t, err)

	assert.Equal(t, 1, reg.Count())

	entry, err := reg.Get("test")
	require.NoError(t, err)
	assert.Equal(t, spec, entry.Spec)
	assert.Equal(t, "/path/to/spec.yaml", entry.SourcePath)
	assert.False(t, entry.IsVirtual)
}

func TestLoad_AliasExists(t *testing.T) {
	reg := New()
	spec := createTestSpec("Test API", "1.0.0")

	err := reg.Load("test", spec, "/path/to/spec.yaml")
	require.NoError(t, err)

	err = reg.Load("test", spec, "/path/to/other.yaml")
	assert.True(t, errors.Is(err, ErrAliasExists))
}

func TestLoadVirtual(t *testing.T) {
	reg := New()
	spec := createTestSpec("Virtual API", "1.0.0")

	err := reg.LoadVirtual("virtual", spec)
	require.NoError(t, err)

	entry, err := reg.Get("virtual")
	require.NoError(t, err)
	assert.True(t, entry.IsVirtual)
	assert.Empty(t, entry.SourcePath)
}

func TestGet_NotFound(t *testing.T) {
	reg := New()

	_, err := reg.Get("nonexistent")
	assert.True(t, errors.Is(err, ErrNotFound))
}

func TestUnload(t *testing.T) {
	reg := New()
	spec := createTestSpec("Test API", "1.0.0")

	err := reg.Load("test", spec, "/path/to/spec.yaml")
	require.NoError(t, err)
	assert.Equal(t, 1, reg.Count())

	err = reg.Unload("test")
	require.NoError(t, err)
	assert.Equal(t, 0, reg.Count())
}

func TestUnload_NotFound(t *testing.T) {
	reg := New()

	err := reg.Unload("nonexistent")
	assert.True(t, errors.Is(err, ErrNotFound))
}

func TestList(t *testing.T) {
	reg := New()

	err := reg.Load("api1", createTestSpec("API 1", "1.0.0"), "/path/1.yaml")
	require.NoError(t, err)
	err = reg.Load("api2", createTestSpec("API 2", "2.0.0"), "/path/2.yaml")
	require.NoError(t, err)

	aliases := reg.List()
	assert.Len(t, aliases, 2)
	assert.Contains(t, aliases, "api1")
	assert.Contains(t, aliases, "api2")
}

func TestDuplicate(t *testing.T) {
	original := createTestSpec("Original API", "1.0.0")
	original.Info.Description = "Original description"

	copy, err := Duplicate(original)
	require.NoError(t, err)

	// Verify it's a deep copy
	assert.Equal(t, original.Info.Title, copy.Info.Title)
	assert.Equal(t, original.Info.Version, copy.Info.Version)

	// Modify the copy and verify original is unchanged
	copy.Info.Title = "Modified API"
	assert.Equal(t, "Original API", original.Info.Title)
	assert.Equal(t, "Modified API", copy.Info.Title)
}

