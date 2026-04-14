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

package sunset

import (
	"encoding/json"
	"testing"

	"github.com/spf13/afero"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestNoDiff_Run(t *testing.T) {
	fs := afero.NewMemMapFs()
	opts := &DiffOpts{
		basePath:   "../../../test/data/base_spec.json",
		specPath:   "../../../test/data/base_spec.json",
		outputPath: "diff.json",
		fs:         fs,
		format:     "json",
	}

	require.NoError(t, opts.Run())
	b, err := afero.ReadFile(fs, opts.outputPath)
	require.NoError(t, err)
	assert.NotEmpty(t, b)
	var results []*Diff
	require.NoError(t, json.Unmarshal(b, &results))
	// When comparing the same file, there should be no differences
	assert.Empty(t, results)
}

func TestDiff_Run(t *testing.T) {
	fs := afero.NewMemMapFs()
	opts := &DiffOpts{
		basePath:   "../../../test/data/base_spec.json",
		specPath:   "../../../test/data/base_spec_with_mismatching_sunset_dates.json",
		outputPath: "diff.json",
		fs:         fs,
		format:     "json",
	}

	require.NoError(t, opts.Run())
	b, err := afero.ReadFile(fs, opts.outputPath)
	require.NoError(t, err)
	assert.NotEmpty(t, b)
	var results []*Diff
	require.NoError(t, json.Unmarshal(b, &results))

	assert.Len(t, results, 4)
	assert.Equal(t, "PATCH", results[0].Operation)
	assert.Equal(t, "/api/atlas/v2/groups/{groupId}/alerts/{alertId}", results[0].Path)
	assert.Equal(t, "2023-01-01", results[0].Version)
	assert.Equal(t, "2025-05-30", results[0].BaseSunsetDate)
	assert.Equal(t, "2025-05-31", results[0].SpecSunsetDate)

	assert.Equal(t, "GET", results[3].Operation)
	assert.Equal(t, "/api/atlas/v2/groups/{groupId}/clusters/{clusterName}/search/deployment", results[3].Path)
	assert.Equal(t, "2023-01-01", results[3].Version)
	assert.Equal(t, "2026-03-01", results[3].BaseSunsetDate)
	assert.Empty(t, results[3].SpecSunsetDate)

	assert.Equal(t, "DELETE", results[2].Operation)
	assert.Equal(t, "/api/atlas/v2/groups/{groupId}/clusters/{clusterName}/globalWrites/managedNamespaces", results[2].Path)
	assert.Equal(t, "2023-02-01", results[2].Version)
	assert.Empty(t, results[2].BaseSunsetDate)
	assert.Equal(t, "2025-06-01", results[2].SpecSunsetDate)

	assert.Equal(t, "DELETE", results[1].Operation)
	assert.Equal(t, "/api/atlas/v2/groups/{groupId}/clusters/{clusterName}/globalWrites/managedNamespaces", results[1].Path)
	assert.Equal(t, "2023-01-01", results[1].Version)
	assert.Equal(t, "2025-06-01", results[1].BaseSunsetDate)
	assert.Equal(t, "2025-06-02", results[1].SpecSunsetDate)
}
