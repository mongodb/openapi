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
	"github.com/mongodb/openapi/tools/cli/internal/apiversion"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestNewMetadata(t *testing.T) {
	version := &apiversion.APIVersion{}
	env := "test-env"
	metadata := NewMetadata(version, env)

	assert.Equal(t, version, metadata.targetVersion)
	assert.Equal(t, env, metadata.targetEnv)
}

func TestValidateMetadata(t *testing.T) {
	t.Run("Valid metadata", func(t *testing.T) {
		metadata := &Metadata{
			targetEnv: "dev",
		}
		err := validateMetadata(metadata)
		assert.NoError(t, err)
	})

	t.Run("Nil metadata", func(t *testing.T) {
		err := validateMetadata(nil)
		require.ErrorContains(t, err, "metadata is nil")
	})
}

func TestDuplicateOas(t *testing.T) {
	doc := &openapi3.T{
		Info: &openapi3.Info{
			Title:   "Test API",
			Version: "1.0.0",
		},
	}

	duplicateDoc, err := duplicateOas(doc)
	require.NoError(t, err)
	require.NotNil(t, duplicateDoc)
	assert.Equal(t, doc.Info.Title, duplicateDoc.Info.Title)
	assert.Equal(t, doc.Info.Version, duplicateDoc.Info.Version)
}

func TestApplyFilters(t *testing.T) {
	doc := &openapi3.T{
		Info: &openapi3.Info{
			Title:   "Test API",
			Version: "1.0.0",
		},
	}
	metadata := &Metadata{}

	t.Run("Nil document", func(t *testing.T) {
		_, err := ApplyFilters(nil, metadata, DefaultFilters)
		require.ErrorContains(t, err, "openapi document is nil")
	})

	t.Run("Nil metadata", func(t *testing.T) {
		_, err := ApplyFilters(doc, nil, DefaultFilters)
		require.ErrorContains(t, err, "metadata is nil")
	})

	t.Run("Invalid metadata", func(t *testing.T) {
		_, err := ApplyFilters(doc, metadata, DefaultFilters)
		require.ErrorContains(t, err, "target environment is empty")
	})

	t.Run("Missing versioning metadata", func(t *testing.T) {
		metadata := &Metadata{
			targetEnv: "dev",
		}
		_, err := ApplyFilters(doc, metadata, DefaultFilters)
		require.ErrorContains(t, err, "failed to validate metadata for filter *filter.VersioningExtensionFilter with: target version is nil")
	})

	t.Run("Valid metadata for default filters", func(t *testing.T) {
		version, err := apiversion.New(apiversion.WithVersion("2023-11-15"))
		require.NoError(t, err)
		metadata := &Metadata{
			targetEnv:     "dev",
			targetVersion: version,
		}

		filteredDoc, err := ApplyFilters(doc, metadata, DefaultFilters)
		require.NoError(t, err)
		assert.NotNil(t, filteredDoc)
	})
}

func TestDefaultFilters(t *testing.T) {
	doc := &openapi3.T{}
	metadata := &Metadata{}
	filters := DefaultFilters(doc, metadata)

	assert.Len(t, filters, 9)
}

func TestFiltersWithoutVersioning(t *testing.T) {
	doc := &openapi3.T{}
	metadata := &Metadata{}
	filters := FiltersWithoutVersioning(doc, metadata)

	assert.Len(t, filters, 5)
}

func TestFiltersToGetVersions(t *testing.T) {
	doc := &openapi3.T{}
	metadata := &Metadata{}
	filters := FiltersToGetVersions(doc, metadata)

	assert.Len(t, filters, 1)
}
