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
	"testing"
	"time"

	"github.com/mongodb/openapi/tools/cli/internal/openapi/sunset"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestFindDiffsEmpty(t *testing.T) {
	baseSpecSunsets := []*sunset.Sunset{
		{
			Operation:  "GET",
			Path:       "/api/atlas/v2/example/info",
			Version:    "2023-01-01",
			SunsetDate: "2025-06-01",
			Team:       "Team",
		},
	}

	opts := &DiffOpts{
		basePath: "base.json",
		specPath: "spec.json",
	}

	diff, err := opts.findDiffs(baseSpecSunsets, baseSpecSunsets)
	require.NoError(t, err)
	assert.Empty(t, diff)
}

func TestFindDiffsNotEmpty(t *testing.T) {
	baseSpecSunsets := []*sunset.Sunset{
		{
			Operation:  "GET",
			Path:       "/api/atlas/v2/example/info",
			Version:    "2023-01-01",
			SunsetDate: "2025-06-01",
			Team:       "Team",
		},
		{
			Operation:  "GET",
			Path:       "/api/atlas/v2/versions",
			Version:    "2023-01-01",
			SunsetDate: "2025-06-01",
			Team:       "APIx",
		},
		{
			Operation:  "GET",
			Path:       "/api/atlas/v2/test",
			Version:    "2023-01-01",
			SunsetDate: "2025-06-01",
			Team:       "Test",
		},
		{
			Operation:  "GET",
			Path:       "/api/atlas/v2/groups",
			Version:    "2023-01-01",
			SunsetDate: "2025-06-01",
			Team:       "Groups",
		},
		{
			Operation:  "GET",
			Path:       "/api/atlas/v2/groups",
			Version:    "2023-02-01",
			SunsetDate: "2025-06-01",
			Team:       "Groups",
		},
	}
	specSunsets := []*sunset.Sunset{
		{
			Operation:  "GET",
			Path:       "/api/atlas/v2/example/info",
			Version:    "2023-01-01",
			SunsetDate: "2025-06-01",
			Team:       "Team",
		},
		{
			Operation:  "GET",
			Path:       "/api/atlas/v2/versions",
			Version:    "2023-01-01",
			SunsetDate: "2025-06-02",
			Team:       "APIx",
		},
		{
			Operation:  "GET",
			Path:       "/api/atlas/v2/users",
			Version:    "2023-01-01",
			SunsetDate: "2025-06-01",
			Team:       "Users",
		},
		{
			Operation:  "GET",
			Path:       "/api/atlas/v2/groups",
			Version:    "2023-01-01",
			SunsetDate: "2025-06-03",
			Team:       "Groups",
		},
		{
			Operation:  "GET",
			Path:       "/api/atlas/v2/groups",
			Version:    "2023-02-01",
			SunsetDate: "2025-06-03",
			Team:       "Groups",
		},
	}

	opts := &DiffOpts{
		basePath: "base.json",
		specPath: "spec.json",
	}

	diff, err := opts.findDiffs(baseSpecSunsets, specSunsets)

	require.NoError(t, err)
	assert.Len(t, diff, 5)

	assert.Equal(t, "GET", diff[0].Operation)
	assert.Equal(t, "/api/atlas/v2/groups", diff[0].Path)
	assert.Equal(t, "2023-01-01", diff[0].Version)
	assert.Equal(t, "2025-06-01", diff[0].BaseSunsetDate)
	assert.Equal(t, "2025-06-03", diff[0].SpecSunsetDate)
	assert.Equal(t, "base.json", diff[0].BaseSpec)
	assert.Equal(t, "spec.json", diff[0].Spec)
	assert.Equal(t, "Groups", diff[0].Team)

	assert.Equal(t, "GET", diff[1].Operation)
	assert.Equal(t, "/api/atlas/v2/groups", diff[1].Path)
	assert.Equal(t, "2023-02-01", diff[1].Version)
	assert.Equal(t, "2025-06-01", diff[1].BaseSunsetDate)
	assert.Equal(t, "2025-06-03", diff[1].SpecSunsetDate)
	assert.Equal(t, "base.json", diff[1].BaseSpec)
	assert.Equal(t, "spec.json", diff[1].Spec)
	assert.Equal(t, "Groups", diff[1].Team)

	assert.Equal(t, "GET", diff[2].Operation)
	assert.Equal(t, "/api/atlas/v2/test", diff[2].Path)
	assert.Equal(t, "2023-01-01", diff[2].Version)
	assert.Equal(t, "2025-06-01", diff[2].BaseSunsetDate)
	assert.Empty(t, diff[2].SpecSunsetDate)
	assert.Equal(t, "base.json", diff[2].BaseSpec)
	assert.Equal(t, "spec.json", diff[2].Spec)
	assert.Equal(t, "Test", diff[2].Team)

	assert.Equal(t, "GET", diff[3].Operation)
	assert.Equal(t, "/api/atlas/v2/users", diff[3].Path)
	assert.Equal(t, "2023-01-01", diff[3].Version)
	assert.Empty(t, diff[3].BaseSunsetDate)
	assert.Equal(t, "2025-06-01", diff[3].SpecSunsetDate)
	assert.Equal(t, "base.json", diff[3].BaseSpec)
	assert.Equal(t, "spec.json", diff[3].Spec)
	assert.Equal(t, "Users", diff[3].Team)

	assert.Equal(t, "GET", diff[4].Operation)
	assert.Equal(t, "/api/atlas/v2/versions", diff[4].Path)
	assert.Equal(t, "2023-01-01", diff[4].Version)
	assert.Equal(t, "2025-06-01", diff[4].BaseSunsetDate)
	assert.Equal(t, "2025-06-02", diff[4].SpecSunsetDate)
	assert.Equal(t, "base.json", diff[4].BaseSpec)
	assert.Equal(t, "spec.json", diff[4].Spec)
	assert.Equal(t, "APIx", diff[4].Team)
}

func TestFindDiffsFiltersByDate(t *testing.T) {
	baseSpecSunsets := []*sunset.Sunset{
		{
			Operation:  "GET",
			Path:       "/api/atlas/v2/versions",
			Version:    "2023-01-01",
			SunsetDate: "2025-06-01",
			Team:       "APIx",
		},
		{
			Operation:  "GET",
			Path:       "/api/atlas/v2/test",
			Version:    "2023-01-01",
			SunsetDate: "2025-07-01",
			Team:       "Test",
		},
		{
			Operation:  "GET",
			Path:       "/api/atlas/v2/groups",
			Version:    "2023-01-01",
			SunsetDate: "2025-06-01",
			Team:       "Groups",
		},
		{
			Operation:  "GET",
			Path:       "/api/atlas/v2/groups",
			Version:    "2023-02-01",
			SunsetDate: "2025-07-01",
			Team:       "Groups",
		},
	}
	specSunsets := []*sunset.Sunset{
		{
			Operation:  "GET",
			Path:       "/api/atlas/v2/versions",
			Version:    "2023-01-01",
			SunsetDate: "2025-06-02",
			Team:       "APIx",
		},
		{
			Operation:  "GET",
			Path:       "/api/atlas/v2/users",
			Version:    "2023-01-01",
			SunsetDate: "2025-06-01",
			Team:       "Users",
		},
		{
			Operation:  "GET",
			Path:       "/api/atlas/v2/groups",
			Version:    "2023-01-01",
			SunsetDate: "2025-07-03",
			Team:       "Groups",
		},
		{
			Operation:  "GET",
			Path:       "/api/atlas/v2/groups",
			Version:    "2023-02-01",
			SunsetDate: "2025-07-03",
			Team:       "Groups",
		},
	}

	fromDate := time.Date(2025, time.June, 1, 0, 0, 0, 0, time.UTC)
	toDate := time.Date(2025, time.June, 15, 0, 0, 0, 0, time.UTC)

	opts := &DiffOpts{
		basePath: "base.json",
		specPath: "spec.json",
		from:     "2025-06-01",
		to:       "2025-06-15",
		fromDate: &fromDate,
		toDate:   &toDate,
	}

	diff, err := opts.findDiffs(baseSpecSunsets, specSunsets)

	require.NoError(t, err)
	assert.Len(t, diff, 3)

	assert.Equal(t, "GET", diff[0].Operation)
	assert.Equal(t, "/api/atlas/v2/groups", diff[0].Path)
	assert.Equal(t, "2023-01-01", diff[0].Version)
	assert.Equal(t, "2025-06-01", diff[0].BaseSunsetDate)
	assert.Equal(t, "2025-07-03", diff[0].SpecSunsetDate)
	assert.Equal(t, "base.json", diff[0].BaseSpec)
	assert.Equal(t, "spec.json", diff[0].Spec)
	assert.Equal(t, "Groups", diff[0].Team)

	assert.Equal(t, "GET", diff[1].Operation)
	assert.Equal(t, "/api/atlas/v2/users", diff[1].Path)
	assert.Equal(t, "2023-01-01", diff[1].Version)
	assert.Empty(t, diff[1].BaseSunsetDate)
	assert.Equal(t, "2025-06-01", diff[1].SpecSunsetDate)
	assert.Equal(t, "base.json", diff[1].BaseSpec)
	assert.Equal(t, "spec.json", diff[1].Spec)
	assert.Equal(t, "Users", diff[1].Team)

	assert.Equal(t, "GET", diff[2].Operation)
	assert.Equal(t, "/api/atlas/v2/versions", diff[2].Path)
	assert.Equal(t, "2023-01-01", diff[2].Version)
	assert.Equal(t, "2025-06-01", diff[2].BaseSunsetDate)
	assert.Equal(t, "2025-06-02", diff[2].SpecSunsetDate)
	assert.Equal(t, "base.json", diff[2].BaseSpec)
	assert.Equal(t, "spec.json", diff[2].Spec)
	assert.Equal(t, "APIx", diff[2].Team)
}

func TestMakeKey(t *testing.T) {
	key := makeKey("/api/atlas/v2/groups", "GET", "2023-01-01")
	assert.Equal(t, "GET-/api/atlas/v2/groups-2023-01-01", key)
}

func TestDiffsInRangeToAndFrom(t *testing.T) {
	fromDate := time.Date(2025, time.June, 3, 0, 0, 0, 0, time.UTC)
	toDate := time.Date(2025, time.June, 21, 0, 0, 0, 0, time.UTC)

	opts := &DiffOpts{
		from:     "2025-06-03",
		to:       "2025-06-21",
		fromDate: &fromDate,
		toDate:   &toDate,
	}

	diffs := []*Diff{
		{
			Operation:      "GET",
			Path:           "/api/atlas/v2/versions",
			Version:        "2023-01-01",
			BaseSunsetDate: "2025-05-02",
			SpecSunsetDate: "2025-05-04",
		},
		{
			Operation:      "GET",
			Path:           "/api/atlas/v2/versions",
			Version:        "2024-01-01",
			BaseSunsetDate: "2025-06-02",
			SpecSunsetDate: "2025-06-04",
		},
		{
			Operation:      "GET",
			Path:           "/api/atlas/v2/versions",
			Version:        "2025-01-01",
			BaseSunsetDate: "2025-06-10",
			SpecSunsetDate: "2025-06-12",
		},
		{
			Operation:      "GET",
			Path:           "/api/atlas/v2/versions",
			Version:        "2026-01-01",
			BaseSunsetDate: "2025-06-20",
			SpecSunsetDate: "2025-06-22",
		},
		{
			Operation:      "GET",
			Path:           "/api/atlas/v2/versions",
			Version:        "2027-01-01",
			BaseSunsetDate: "2025-07-02",
			SpecSunsetDate: "2025-07-04",
		},
	}

	result, err := opts.diffsInRange(diffs)

	require.NoError(t, err)
	assert.Len(t, result, 3)

	assert.Equal(t, "GET", result[0].Operation)
	assert.Equal(t, "/api/atlas/v2/versions", result[0].Path)
	assert.Equal(t, "2024-01-01", result[0].Version)
	assert.Equal(t, "2025-06-02", result[0].BaseSunsetDate)
	assert.Equal(t, "2025-06-04", result[0].SpecSunsetDate)

	assert.Equal(t, "GET", result[1].Operation)
	assert.Equal(t, "/api/atlas/v2/versions", result[1].Path)
	assert.Equal(t, "2025-01-01", result[1].Version)
	assert.Equal(t, "2025-06-10", result[1].BaseSunsetDate)
	assert.Equal(t, "2025-06-12", result[1].SpecSunsetDate)

	assert.Equal(t, "GET", result[2].Operation)
	assert.Equal(t, "/api/atlas/v2/versions", result[2].Path)
	assert.Equal(t, "2026-01-01", result[2].Version)
	assert.Equal(t, "2025-06-20", result[2].BaseSunsetDate)
	assert.Equal(t, "2025-06-22", result[2].SpecSunsetDate)
}

func TestDiffsInRangeToAndFromInvalidSunsetDate(t *testing.T) {
	fromDate := time.Date(2025, time.June, 3, 0, 0, 0, 0, time.UTC)
	toDate := time.Date(2025, time.June, 21, 0, 0, 0, 0, time.UTC)

	opts := &DiffOpts{
		from:     "2025-06-03",
		to:       "2025-06-21",
		fromDate: &fromDate,
		toDate:   &toDate,
	}

	diffs := []*Diff{
		{
			Operation:      "GET",
			Path:           "/api/atlas/v2/versions",
			Version:        "2023-01-01",
			BaseSunsetDate: "2025-05", // Invalid date format
			SpecSunsetDate: "2025-05-04",
		},
	}

	result, err := opts.diffsInRange(diffs)

	require.Error(t, err)
	require.Empty(t, result)
}

func TestDiffsInRangeOnlyTo(t *testing.T) {
	toDate := time.Date(2025, time.June, 11, 0, 0, 0, 0, time.UTC)

	opts := &DiffOpts{
		to:     "2025-06-11",
		toDate: &toDate,
	}

	diffs := []*Diff{
		{
			Operation:      "GET",
			Path:           "/api/atlas/v2/versions",
			Version:        "2023-01-01",
			BaseSunsetDate: "",
			SpecSunsetDate: "2025-05-04",
		},
		{
			Operation:      "GET",
			Path:           "/api/atlas/v2/versions",
			Version:        "2024-01-01",
			BaseSunsetDate: "2025-06-02",
			SpecSunsetDate: "2025-06-04",
		},
		{
			Operation:      "GET",
			Path:           "/api/atlas/v2/versions",
			Version:        "2025-01-01",
			BaseSunsetDate: "2025-06-10",
			SpecSunsetDate: "2025-06-12",
		},
		{
			Operation:      "GET",
			Path:           "/api/atlas/v2/versions",
			Version:        "2026-01-01",
			BaseSunsetDate: "2025-06-20",
			SpecSunsetDate: "2025-06-22",
		},
		{
			Operation:      "GET",
			Path:           "/api/atlas/v2/versions",
			Version:        "2027-01-01",
			BaseSunsetDate: "",
			SpecSunsetDate: "2025-07-04",
		},
	}

	result, err := opts.diffsInRange(diffs)

	require.NoError(t, err)
	assert.Len(t, result, 3)

	assert.Equal(t, "GET", result[0].Operation)
	assert.Equal(t, "/api/atlas/v2/versions", result[0].Path)
	assert.Equal(t, "2023-01-01", result[0].Version)
	assert.Empty(t, result[0].BaseSunsetDate)
	assert.Equal(t, "2025-05-04", result[0].SpecSunsetDate)

	assert.Equal(t, "GET", result[1].Operation)
	assert.Equal(t, "/api/atlas/v2/versions", result[1].Path)
	assert.Equal(t, "2024-01-01", result[1].Version)
	assert.Equal(t, "2025-06-02", result[1].BaseSunsetDate)
	assert.Equal(t, "2025-06-04", result[1].SpecSunsetDate)

	assert.Equal(t, "GET", result[2].Operation)
	assert.Equal(t, "/api/atlas/v2/versions", result[2].Path)
	assert.Equal(t, "2025-01-01", result[2].Version)
	assert.Equal(t, "2025-06-10", result[2].BaseSunsetDate)
	assert.Equal(t, "2025-06-12", result[2].SpecSunsetDate)
}

func TestDiffsInRangeOnlyFrom(t *testing.T) {
	fromDate := time.Date(2025, time.June, 11, 0, 0, 0, 0, time.UTC)

	opts := &DiffOpts{
		from:     "2025-06-11",
		fromDate: &fromDate,
	}

	diffs := []*Diff{
		{
			Operation:      "GET",
			Path:           "/api/atlas/v2/versions",
			Version:        "2023-01-01",
			BaseSunsetDate: "2025-05-02",
			SpecSunsetDate: "",
		},
		{
			Operation:      "GET",
			Path:           "/api/atlas/v2/versions",
			Version:        "2024-01-01",
			BaseSunsetDate: "2025-06-02",
			SpecSunsetDate: "2025-06-04",
		},
		{
			Operation:      "GET",
			Path:           "/api/atlas/v2/versions",
			Version:        "2025-01-01",
			BaseSunsetDate: "2025-06-10",
			SpecSunsetDate: "2025-06-12",
		},
		{
			Operation:      "GET",
			Path:           "/api/atlas/v2/versions",
			Version:        "2026-01-01",
			BaseSunsetDate: "2025-06-20",
			SpecSunsetDate: "2025-06-22",
		},
		{
			Operation:      "GET",
			Path:           "/api/atlas/v2/versions",
			Version:        "2027-01-01",
			BaseSunsetDate: "2025-07-02",
			SpecSunsetDate: "",
		},
	}

	result, err := opts.diffsInRange(diffs)

	require.NoError(t, err)
	assert.Len(t, result, 3)

	assert.Equal(t, "GET", result[0].Operation)
	assert.Equal(t, "/api/atlas/v2/versions", result[0].Path)
	assert.Equal(t, "2025-01-01", result[0].Version)
	assert.Equal(t, "2025-06-10", result[0].BaseSunsetDate)
	assert.Equal(t, "2025-06-12", result[0].SpecSunsetDate)

	assert.Equal(t, "GET", result[1].Operation)
	assert.Equal(t, "/api/atlas/v2/versions", result[1].Path)
	assert.Equal(t, "2026-01-01", result[1].Version)
	assert.Equal(t, "2025-06-20", result[1].BaseSunsetDate)
	assert.Equal(t, "2025-06-22", result[1].SpecSunsetDate)

	assert.Equal(t, "GET", result[2].Operation)
	assert.Equal(t, "/api/atlas/v2/versions", result[2].Path)
	assert.Equal(t, "2027-01-01", result[2].Version)
	assert.Equal(t, "2025-07-02", result[2].BaseSunsetDate)
	assert.Empty(t, result[2].SpecSunsetDate)
}

func TestValidate(t *testing.T) {
	opts := &DiffOpts{
		from: "2025-06-01",
		to:   "2025-06-15",
	}

	err := opts.validate()
	require.NoError(t, err)
	assert.Equal(t, time.Date(2025, time.June, 1, 0, 0, 0, 0, time.UTC), *opts.fromDate)
	assert.Equal(t, time.Date(2025, time.June, 15, 0, 0, 0, 0, time.UTC), *opts.toDate)
}

func TestValidateToIsAfterFrom(t *testing.T) {
	opts := &DiffOpts{
		from: "2025-06-15",
		to:   "2025-06-01",
	}

	err := opts.validate()
	require.Error(t, err)
}
