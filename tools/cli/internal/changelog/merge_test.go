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

package changelog

import (
	"fmt"
	"testing"

	"github.com/mongodb/openapi/tools/cli/internal/changelog/outputfilter"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestMergeChangelogOneChange(t *testing.T) {
	baseChangelog, err := NewEntriesFromPath("../../test/data/changelog/changelog.json")
	require.NoError(t, err)

	lastChangelogRunDate := baseChangelog[0].Date
	endpointsConfig := map[string]*outputfilter.OperationConfigs{
		"createCluster": {
			Base: &outputfilter.OperationConfig{
				Path:                   "/api/atlas/v2/groups/{groupId}/clusters",
				HTTPMethod:             "POST",
				Tag:                    "Multi-Cloud Clusters",
				Sunset:                 "",
				ManualChangelogEntries: make(map[string]interface{}),
			},
			Revision: &outputfilter.OperationConfig{
				Path:                   "/api/atlas/v2/groups/{groupId}/clusters",
				HTTPMethod:             "POST",
				Tag:                    "Multi-Cloud Clusters",
				Sunset:                 "",
				ManualChangelogEntries: make(map[string]interface{}),
			},
		},
	}
	changeType := changeTypeUpdate

	changes := []*outputfilter.OasDiffEntry{
		{
			ID:          "request-property-added",
			Text:        "added 'replicationSpecs.regionConfigs' request property",
			Level:       1,
			Operation:   "POST",
			OperationID: "createCluster",
			Path:        "/api/atlas/v2/groups/{groupId}/clusters",
		},
	}

	version := "2023-02-01"
	runDate := "2023-06-15"

	changelogStruct := &Changelog{
		BaseMetadata: &Metadata{
			RunDate:       runDate,
			ActiveVersion: version,
		},
		RevisionMetadata: &Metadata{
			RunDate:       runDate,
			ActiveVersion: version,
		},
		RunDate:       runDate,
		BaseChangelog: baseChangelog,
	}

	// act
	changelog, err := changelogStruct.mergeChangelog(changeType, changes, endpointsConfig)
	require.NoError(t, err)

	assert.Len(t, changelog, 2, "merged changelog should have 2 entries, got %d", len(changelog))
	assert.Equal(t, changelog[0].Date, runDate, "merged changelog should have entries for the run date")
	assert.Equal(t, changelog[1].Date, lastChangelogRunDate, "merged changelog should have entries for the %s", lastChangelogRunDate)

	paths := changelog[0].Paths
	assert.Len(t, paths, 1, "latest changelog entry should refer to only one endpoint")
	assert.Equal(t, paths[0].URI, changes[0].Path)
	assert.Equal(t, paths[0].HTTPMethod, changes[0].Operation)
	assert.Equal(t, paths[0].OperationID, changes[0].OperationID)
	assert.Equal(t, "Multi-Cloud Clusters", paths[0].Tag)

	versions := paths[0].Versions
	assert.Len(t, versions, 1, "latest changelog entry is referring only to one version")
	assert.Equal(t, versions[0].Version, version)
	assert.Equal(t, "stable", versions[0].StabilityLevel)
	assert.Equal(t, versions[0].ChangeType, changeType)
}

func TestMergeChangelogTwoVersionsNoDeprecations(t *testing.T) {
	// arrange
	baseChangelog, err := NewEntriesFromPath("../../test/data/changelog/changelog.json")
	require.NoError(t, err)

	lastChangelogRunDate := baseChangelog[0].Date

	endpointsConfig := map[string]*outputfilter.OperationConfigs{
		"createCluster": {
			Base: &outputfilter.OperationConfig{
				Path:                   "/api/atlas/v2/groups/{groupId}/clusters",
				HTTPMethod:             "POST",
				Tag:                    "Multi-Cloud Clusters",
				Sunset:                 "",
				ManualChangelogEntries: make(map[string]interface{}),
			},
			Revision: &outputfilter.OperationConfig{
				Path:                   "/api/atlas/v2/groups/{groupId}/clusters",
				HTTPMethod:             "POST",
				Tag:                    "Multi-Cloud Clusters",
				Sunset:                 "",
				ManualChangelogEntries: make(map[string]interface{}),
			},
		},
	}

	changesFirstVersion := []*outputfilter.OasDiffEntry{
		{
			ID:          "request-property-added",
			Text:        "added 'replicationSpecs.regionConfigs' request property",
			Level:       1,
			Operation:   "POST",
			OperationID: "createCluster",
			Path:        "/api/atlas/v2/groups/{groupId}/clusters",
		},
	}

	changesSecondVersion := []*outputfilter.OasDiffEntry{
		{
			ID:          "request-property-removed",
			Text:        "removed the request properties: 'mongoURIWithOptions', 'providerBackupEnabled'",
			Level:       3,
			Operation:   "POST",
			OperationID: "createCluster",
			Path:        "/api/atlas/v2/groups/{groupId}/clusters",
		},
	}

	runDate := "2023-06-15"
	firstVersion := "2023-02-01"
	changeTypeFirstVersion := changeTypeUpdate

	changelogStruct := &Changelog{
		BaseMetadata: &Metadata{
			RunDate:       runDate,
			ActiveVersion: firstVersion,
		},
		RevisionMetadata: &Metadata{
			RunDate:       runDate,
			ActiveVersion: firstVersion,
		},
		RunDate:       runDate,
		BaseChangelog: baseChangelog,
	}

	changelog, err := changelogStruct.mergeChangelog(changeTypeFirstVersion, changesFirstVersion, endpointsConfig)
	require.NoError(t, err)

	secondVersion := "2023-02-02"
	changeTypeSecondVersion := changeTypeRelease

	changelogStruct = &Changelog{
		BaseMetadata: &Metadata{
			RunDate:       runDate,
			ActiveVersion: firstVersion,
		},
		RevisionMetadata: &Metadata{
			RunDate:       runDate,
			ActiveVersion: secondVersion,
		},
		RunDate:       runDate,
		BaseChangelog: changelog,
	}

	changelog, err = changelogStruct.mergeChangelog(changeTypeSecondVersion, changesSecondVersion, endpointsConfig)
	require.NoError(t, err)

	require.Len(t, changelog, 2, "merged changelog should have 2 entries, got %d", len(changelog))
	assert.Equal(t, changelog[0].Date, runDate, "merged changelog should have entries for the run date")
	assert.Equal(t, changelog[1].Date, lastChangelogRunDate, "merged changelog should have entries for the %s", lastChangelogRunDate)

	paths := changelog[0].Paths
	assert.Len(t, paths, 1, "latest changelog entry should refer to only one endpoint")

	assert.Equal(t, paths[0].URI, changesSecondVersion[0].Path)
	assert.Equal(t, paths[0].HTTPMethod, changesSecondVersion[0].Operation)
	assert.Equal(t, paths[0].OperationID, changesSecondVersion[0].OperationID)
	assert.Equal(t, "Multi-Cloud Clusters", paths[0].Tag)

	versions := paths[0].Versions
	require.Len(t, versions, 2, "latest changelog entry includes both versions and the versions are ordered DES")

	firstVersionEntry := versions[0]
	require.Len(t, firstVersionEntry.Changes, 1)
	assert.Equal(t, firstVersionEntry.Version, secondVersion)
	assert.Equal(t, changeTypeRelease, firstVersionEntry.ChangeType)
	assert.Equal(t, "request-property-removed", firstVersionEntry.Changes[0].Code)
	assert.False(t, firstVersionEntry.Changes[0].BackwardCompatible)

	secondVersionEntry := versions[1]
	require.Len(t, secondVersionEntry.Changes, 1)
	assert.Equal(t, secondVersionEntry.Version, firstVersion)
	assert.Equal(t, changeTypeUpdate, secondVersionEntry.ChangeType)
	assert.Equal(t, "request-property-added", secondVersionEntry.Changes[0].Code)
	assert.True(t, secondVersionEntry.Changes[0].BackwardCompatible)
}

func TestMergeChangelogAddTwoEndpoints(t *testing.T) {
	originalChangelog, err := NewEntriesFromPath("../../test/data/changelog/changelog.json")
	require.NoError(t, err)

	lastChangelogRunDate := originalChangelog[0].Date

	version := "2023-02-01"
	runDate := "2023-06-15"

	changes := []*outputfilter.OasDiffEntry{
		{
			ID:          "endpoint-added",
			Text:        "endpoint added",
			Level:       1,
			Operation:   "GET",
			OperationID: "getStreamInstance",
			Path:        "/api/atlas/v2/groups/{groupId}/streams/{tenantName}",
		},
		{
			ID:          "endpoint-added",
			Text:        "endpoint added",
			Level:       1,
			Operation:   "GET",
			OperationID: "listStreamInstances",
			Path:        "/api/atlas/v2/groups/{groupId}/streams",
		},
	}

	endpointsConfig := map[string]*outputfilter.OperationConfigs{
		"listStreamInstances": {
			Base: nil,
			Revision: &outputfilter.OperationConfig{
				Path:                   "/api/atlas/v2/groups/{groupId}/streams",
				HTTPMethod:             "GET",
				Tag:                    "Streams",
				Sunset:                 "",
				ManualChangelogEntries: make(map[string]interface{}),
			},
		},
		"getStreamInstance": {
			Base: nil,
			Revision: &outputfilter.OperationConfig{
				Path:                   "/api/atlas/v2/groups/{groupId}/streams/{tenantName}",
				HTTPMethod:             "GET",
				Tag:                    "Streams",
				Sunset:                 "",
				ManualChangelogEntries: make(map[string]interface{}),
			},
		},
	}

	changelogStruct := &Changelog{
		BaseMetadata: &Metadata{
			RunDate:       runDate,
			ActiveVersion: version,
		},
		RevisionMetadata: &Metadata{
			RunDate:       runDate,
			ActiveVersion: version,
		},
		RunDate:       runDate,
		BaseChangelog: originalChangelog,
	}

	// act
	changelog, err := changelogStruct.mergeChangelog(
		changeTypeUpdate,
		changes,
		endpointsConfig,
	)
	require.NoError(t, err)

	// assert
	assert.Equal(t, changelog[0].Date, runDate, "merged changelog should have entries for the run date")
	assert.Equal(t, changelog[1].Date, lastChangelogRunDate, "merged changelog should have entries for the %s", lastChangelogRunDate)

	latestChangelogEntry := changelog[0]
	newPaths := latestChangelogEntry.Paths
	assert.Equal(t, "/api/atlas/v2/groups/{groupId}/streams", newPaths[0].URI)
	assert.Equal(t, "/api/atlas/v2/groups/{groupId}/streams/{tenantName}", newPaths[1].URI)

	// for new endpoints, the change type is overwritten to changeTypeRelease)
	assert.Equal(t, changeTypeRelease, newPaths[0].Versions[0].ChangeType)
	assert.Equal(t, changeTypeRelease, newPaths[1].Versions[0].ChangeType)
}

func TestNewChangeType(t *testing.T) {
	type testCase struct {
		currentChangeType string
		newChangeType     string
		changeCode        string
		expectedResult    string
	}

	testCases := []testCase{
		{
			currentChangeType: changeTypeUpdate,
			newChangeType:     changeTypeDeprecated,
			changeCode:        "endpoint-deprecated",
			expectedResult:    changeTypeDeprecated,
		},
		{
			currentChangeType: changeTypeRelease,
			newChangeType:     changeTypeUpdate,
			changeCode:        "endpoint-added",
			expectedResult:    changeTypeRelease,
		},
		{
			currentChangeType: changeTypeRemove,
			newChangeType:     changeTypeUpdate,
			changeCode:        "endpoint-added",
			expectedResult:    changeTypeRemove,
		},
		{
			currentChangeType: changeTypeRemove,
			newChangeType:     changeTypeUpdate,
			changeCode:        "unknown-change-code",
			expectedResult:    changeTypeRemove,
		},
		{
			currentChangeType: changeTypeDeprecated,
			newChangeType:     "test",
			changeCode:        "unknown-change-code",
			expectedResult:    changeTypeDeprecated,
		},
	}

	for _, tc := range testCases {
		result := newChangeType(tc.currentChangeType, tc.newChangeType, tc.changeCode)
		assert.Equal(t, tc.expectedResult, result)
	}
}
func TestSortChangelog(t *testing.T) {
	changelog := []*Entry{
		{
			Date: "2023-06-14",
			Paths: []*Path{
				{
					URI:         "/api/atlas/v2/groups/{groupId}/streams",
					HTTPMethod:  "GET",
					OperationID: "listStreamInstances",
					Versions: []*Version{
						{
							Version:        "2023-02-01",
							StabilityLevel: "stable",
							ChangeType:     "update",
							Changes:        nil,
						},
					},
				},
				{
					URI:         "/api/atlas/v2/groups/{groupId}/clusters",
					HTTPMethod:  "POST",
					OperationID: "createCluster",
					Versions: []*Version{
						{
							Version:        "2023-02-02",
							StabilityLevel: "stable",
							ChangeType:     "release",
							Changes:        nil,
						},
						{
							Version:        "2023-02-01",
							StabilityLevel: "stable",
							ChangeType:     "update",
							Changes:        nil,
						},
					},
				},
			},
		},
		{
			Date: "2023-06-15",
			Paths: []*Path{
				{
					URI:         "/api/atlas/v2/groups/{groupId}/streams",
					HTTPMethod:  "GET",
					OperationID: "listStreamInstances",
					Versions: []*Version{
						{
							Version:        "2023-02-01",
							StabilityLevel: "stable",
							ChangeType:     "update",
							Changes:        nil,
						},
					},
				},
			},
		},
	}

	expectedChangelog := []*Entry{
		{
			Date: "2023-06-15",
			Paths: []*Path{
				{
					URI:         "/api/atlas/v2/groups/{groupId}/streams",
					HTTPMethod:  "GET",
					OperationID: "listStreamInstances",
					Versions: []*Version{
						{
							Version:        "2023-02-01",
							StabilityLevel: "stable",
							ChangeType:     "update",
							Changes:        nil,
						},
					},
				},
			},
		},
		{
			Date: "2023-06-14",
			Paths: []*Path{
				{
					URI:         "/api/atlas/v2/groups/{groupId}/clusters",
					HTTPMethod:  "POST",
					OperationID: "createCluster",
					Versions: []*Version{
						{
							Version:        "2023-02-02",
							StabilityLevel: "stable",
							ChangeType:     "release",
							Changes:        nil,
						},
						{
							Version:        "2023-02-01",
							StabilityLevel: "stable",
							ChangeType:     "update",
							Changes:        nil,
						},
					},
				},
				{
					URI:         "/api/atlas/v2/groups/{groupId}/streams",
					HTTPMethod:  "GET",
					OperationID: "listStreamInstances",
					Versions: []*Version{
						{
							Version:        "2023-02-01",
							StabilityLevel: "stable",
							ChangeType:     "update",
							Changes:        nil,
						},
					},
				},
			},
		},
	}
	// sortChangelog should sort the changelog by date DESC, path + httpMethod ASC, version DESC
	assert.Equal(t, expectedChangelog, sortChangelog(changelog))
}

func TestMergeChangelogTwoVersionsWithDeprecations(t *testing.T) {
	// arrange
	baseChangelog, err := NewEntriesFromPath("../../test/data/changelog/changelog.json")
	require.NoError(t, err)

	lastChangelogRunDate := baseChangelog[0].Date

	firstVersion := "2023-02-01"
	secondVersion := "2023-02-02"
	changeTypeFirstVersion := changeTypeUpdate
	changeTypeSecondVersion := changeTypeRelease

	runDate := "2023-06-15"
	sunset := "2024-02-02"
	endpointsConfig := map[string]*outputfilter.OperationConfigs{
		"createCluster": {
			Base: &outputfilter.OperationConfig{
				Path:                   "/api/atlas/v2/groups/{groupId}/clusters",
				HTTPMethod:             "POST",
				Tag:                    "Multi-Cloud Clusters",
				Sunset:                 sunset,
				ManualChangelogEntries: make(map[string]interface{}),
			},
			Revision: &outputfilter.OperationConfig{
				Path:                   "/api/atlas/v2/groups/{groupId}/clusters",
				HTTPMethod:             "POST",
				Tag:                    "Multi-Cloud Clusters",
				Sunset:                 "",
				ManualChangelogEntries: make(map[string]interface{}),
			},
		},
	}

	changesFirstVersion := []*outputfilter.OasDiffEntry{
		{
			ID:          "request-property-added",
			Text:        "added 'replicationSpecs.regionConfigs' request property",
			Level:       1,
			Operation:   "POST",
			OperationID: "createCluster",
			Path:        "/api/atlas/v2/groups/{groupId}/clusters",
		},
	}

	changesSecondVersion := []*outputfilter.OasDiffEntry{
		{
			ID:          "endpoint-reactivated",
			Text:        "endpoint reactivated",
			Level:       1,
			Operation:   "POST",
			OperationID: "createCluster",
			Path:        "/api/atlas/v2/groups/{groupId}/clusters",
		},
		{
			ID:          "request-property-removed",
			Text:        "removed the request properties: 'mongoURIWithOptions', 'providerBackupEnabled'",
			Level:       3,
			Operation:   "POST",
			OperationID: "createCluster",
			Path:        "/api/atlas/v2/groups/{groupId}/clusters",
		},
	}

	changelogStruct := &Changelog{
		BaseMetadata: &Metadata{
			RunDate:       runDate,
			ActiveVersion: firstVersion,
		},
		RevisionMetadata: &Metadata{
			RunDate:       runDate,
			ActiveVersion: firstVersion,
		},
		RunDate:       runDate,
		BaseChangelog: baseChangelog,
	}

	changelog, err := changelogStruct.mergeChangelog(changeTypeFirstVersion, changesFirstVersion, endpointsConfig)
	require.NoError(t, err)

	changelogStruct = &Changelog{
		BaseMetadata: &Metadata{
			RunDate:       runDate,
			ActiveVersion: firstVersion,
		},
		RevisionMetadata: &Metadata{
			RunDate:       runDate,
			ActiveVersion: secondVersion,
		},
		RunDate:       runDate,
		BaseChangelog: changelog,
	}

	changelog, err = changelogStruct.mergeChangelog(changeTypeSecondVersion, changesSecondVersion, endpointsConfig)
	require.NoError(t, err)

	require.Len(t, changelog, 2, "merged changelog should have 2 entries, got %d", len(changelog))
	assert.Equal(t, changelog[0].Date, runDate)
	assert.Equal(t, changelog[1].Date, lastChangelogRunDate)

	paths := changelog[0].Paths
	require.Len(t, paths, 1)

	assert.Equal(t, paths[0].URI, changesSecondVersion[0].Path)
	assert.Equal(t, paths[0].HTTPMethod, changesSecondVersion[0].Operation)
	assert.Equal(t, paths[0].OperationID, changesSecondVersion[0].OperationID)
	assert.Equal(t, "Multi-Cloud Clusters", paths[0].Tag)

	versions := paths[0].Versions
	require.Len(t, versions, 2)

	firstVersionEntry := versions[1]
	require.Len(t, firstVersionEntry.Changes, 2)
	assert.Equal(t, firstVersion, firstVersionEntry.Version)
	assert.Equal(t, changeTypeDeprecated, firstVersionEntry.ChangeType)

	assert.Equal(t, "request-property-added", firstVersionEntry.Changes[0].Code)
	assert.True(t, firstVersionEntry.Changes[0].BackwardCompatible)
	assert.Equal(t, "endpoint-deprecated", firstVersionEntry.Changes[1].Code)
	assert.True(t, firstVersionEntry.Changes[1].BackwardCompatible)

	secondVersionEntry := versions[0]
	require.Len(t, secondVersionEntry.Changes, 1)
	assert.Equal(t, secondVersionEntry.Version, secondVersion)
	assert.Equal(t, changeTypeRelease, secondVersionEntry.ChangeType)

	assert.Equal(t, "request-property-removed", secondVersionEntry.Changes[0].Code)
	assert.False(t, secondVersionEntry.Changes[0].BackwardCompatible)
}

func TestMergeChangelogWithDeprecations(t *testing.T) {
	baseChangelog, err := NewEntriesFromPath("../../test/data/changelog/changelog.json")
	require.NoError(t, err)

	firstVersion := "2023-02-01"
	secondVersion := "2023-02-02"
	changeTypeFirstVersion := changeTypeUpdate
	changeTypeSecondVersion := changeTypeRelease

	runDate := "2023-06-15"
	sunset := "2024-02-02"
	endpointsConfig := map[string]*outputfilter.OperationConfigs{
		"createCluster": {
			Base: &outputfilter.OperationConfig{
				Path:                   "/api/atlas/v2/groups/{groupId}/clusters",
				HTTPMethod:             "POST",
				Tag:                    "Multi-Cloud Clusters",
				Sunset:                 sunset,
				ManualChangelogEntries: nil,
			},
			Revision: &outputfilter.OperationConfig{
				Path:                   "/api/atlas/v2/groups/{groupId}/clusters",
				HTTPMethod:             "POST",
				Tag:                    "Multi-Cloud Clusters",
				Sunset:                 "",
				ManualChangelogEntries: nil,
			},
		},
	}

	changesFirstVersion := []*outputfilter.OasDiffEntry{
		{
			ID:          "request-property-added",
			Text:        "added 'replicationSpecs.regionConfigs' request property",
			Level:       1,
			Operation:   "POST",
			OperationID: "createCluster",
			Path:        "/api/atlas/v2/groups/{groupId}/clusters",
		},
	}

	changesSecondVersion := []*outputfilter.OasDiffEntry{
		{
			ID:          "endpoint-reactivated",
			Text:        "endpoint reactivated",
			Level:       1,
			Operation:   "POST",
			OperationID: "createCluster",
			Path:        "/api/atlas/v2/groups/{groupId}/clusters",
		},
		{
			ID:          "request-property-removed",
			Text:        "removed the request properties: 'mongoURIWithOptions', 'providerBackupEnabled'",
			Level:       3,
			Operation:   "POST",
			OperationID: "createCluster",
			Path:        "/api/atlas/v2/groups/{groupId}/clusters",
		},
	}

	changelogStruct := &Changelog{
		BaseMetadata: &Metadata{
			RunDate:       runDate,
			ActiveVersion: firstVersion,
		},
		RevisionMetadata: &Metadata{
			RunDate:       runDate,
			ActiveVersion: firstVersion,
		},
		RunDate:       runDate,
		BaseChangelog: baseChangelog,
	}

	changelog, err := changelogStruct.mergeChangelog(changeTypeFirstVersion, changesFirstVersion, endpointsConfig)
	require.NoError(t, err)

	changelogStruct = &Changelog{
		BaseMetadata: &Metadata{
			RunDate:       runDate,
			ActiveVersion: firstVersion,
		},
		RevisionMetadata: &Metadata{
			RunDate:       runDate,
			ActiveVersion: secondVersion,
		},
		RunDate:       runDate,
		BaseChangelog: changelog,
	}

	changelog, err = changelogStruct.mergeChangelog(changeTypeSecondVersion, changesSecondVersion, endpointsConfig)
	require.NoError(t, err)

	require.Len(t, changelog, 2, "merged changelog should have 2 entries, got %d", len(changelog))

	latestChangelogEntry := changelog[0]
	require.Equal(t, runDate, latestChangelogEntry.Date)

	paths := latestChangelogEntry.Paths
	require.Len(t, paths, 1)
	assert.Equal(t, changesSecondVersion[0].Path, paths[0].URI)
	assert.Equal(t, changesSecondVersion[0].OperationID, paths[0].OperationID)
	assert.Equal(t, changesSecondVersion[0].Operation, paths[0].HTTPMethod)
	assert.Equal(t, "Multi-Cloud Clusters", paths[0].Tag)

	versions := paths[0].Versions
	require.Len(t, versions, 2)

	firstVersionEntry := versions[1]
	require.Len(t, firstVersionEntry.Changes, 2)
	assert.Equal(t, "request-property-added", firstVersionEntry.Changes[0].Code)
	assert.True(t, firstVersionEntry.Changes[0].BackwardCompatible)

	assert.Equal(t, "endpoint-deprecated", firstVersionEntry.Changes[1].Code)
	assert.True(t, firstVersionEntry.Changes[1].BackwardCompatible)
	assert.Contains(t, firstVersionEntry.Changes[1].Description, fmt.Sprintf("deprecated and marked for removal on %s", sunset))

	secondVersionEntry := versions[0]
	require.Len(t, secondVersionEntry.Changes, 1)
	assert.Equal(t, "request-property-removed", secondVersionEntry.Changes[0].Code)
	assert.False(t, secondVersionEntry.Changes[0].BackwardCompatible)
}

func TestMergeChangelogCompare(t *testing.T) {
	baseChangelog, err := NewEntriesFromPath("../../test/data/changelog/changelog.json")
	require.NoError(t, err)

	firstVersion := "2023-01-01"
	secondVersion := "2023-02-02"
	changeTypeFirstVersion := changeTypeUpdate
	changeTypeSecondVersion := changeTypeRelease

	runDate := "2023-06-15"
	endpointsConfig := map[string]*outputfilter.OperationConfigs{
		"createCluster": {
			Base: &outputfilter.OperationConfig{
				Path:                   "/api/atlas/v2/groups/{groupId}/clusters",
				HTTPMethod:             "POST",
				Tag:                    "Multi-Cloud Clusters",
				Sunset:                 "2024-02-02",
				ManualChangelogEntries: nil,
			},
			Revision: &outputfilter.OperationConfig{
				Path:                   "/api/atlas/v2/groups/{groupId}/clusters",
				HTTPMethod:             "POST",
				Tag:                    "Multi-Cloud Clusters",
				Sunset:                 "2024-02-02",
				ManualChangelogEntries: nil,
			},
		},
		"getClusters": {
			Base: &outputfilter.OperationConfig{
				Path:                   "/api/atlas/v2/groups/{groupId}/clusters",
				HTTPMethod:             "GET",
				Tag:                    "Multi-Cloud Clusters",
				Sunset:                 "2024-02-02",
				ManualChangelogEntries: nil,
			},
			Revision: &outputfilter.OperationConfig{
				Path:                   "/api/atlas/v2/groups/{groupId}/clusters",
				HTTPMethod:             "GET",
				Tag:                    "Multi-Cloud Clusters",
				Sunset:                 "2024-02-02",
				ManualChangelogEntries: nil,
			},
		},
		"listStreamInstances": {
			Base: &outputfilter.OperationConfig{
				Path:                   "/api/atlas/v2/groups/{groupId}/streams",
				HTTPMethod:             "GET",
				Tag:                    "Streams",
				Sunset:                 "",
				ManualChangelogEntries: nil,
			},
			Revision: &outputfilter.OperationConfig{
				Path:                   "/api/atlas/v2/groups/{groupId}/streams",
				HTTPMethod:             "GET",
				Tag:                    "Streams",
				Sunset:                 "",
				ManualChangelogEntries: nil,
			},
		},
		"getStreamInstance": {
			Base: &outputfilter.OperationConfig{
				Path:                   "/api/atlas/v2/groups/{groupId}/streams/{tenantName}",
				HTTPMethod:             "GET",
				Tag:                    "Streams",
				Sunset:                 "",
				ManualChangelogEntries: nil,
			},
			Revision: &outputfilter.OperationConfig{
				Path:                   "/api/atlas/v2/groups/{groupId}/streams/{tenantName}",
				HTTPMethod:             "GET",
				Tag:                    "Streams",
				Sunset:                 "",
				ManualChangelogEntries: nil,
			},
		},
	}

	changesFirstVersion := []*outputfilter.OasDiffEntry{
		{
			ID:          "request-property-added",
			Text:        "added 'replicationSpecs.regionConfigs' request property",
			Level:       1,
			Operation:   "POST",
			OperationID: "createCluster",
			Path:        "/api/atlas/v2/groups/{groupId}/clusters",
		},
		{
			ID:          "response-optional-property-added",
			Text:        "added 'replicationSpecs.regionConfigs' response property",
			Level:       1,
			Operation:   "GET",
			OperationID: "getClusters",
			Path:        "/api/atlas/v2/groups/{groupId}/clusters",
		},
	}

	changesSecondVersion := []*outputfilter.OasDiffEntry{
		{
			ID:          "endpoint-added",
			Text:        "endpoint added",
			Level:       1,
			Operation:   "GET",
			OperationID: "listStreamInstances",
			Path:        "/api/atlas/v2/groups/{groupId}/streams",
		},
		{
			ID:          "endpoint-added",
			Text:        "endpoint added",
			Level:       1,
			Operation:   "GET",
			OperationID: "getStreamInstance",
			Path:        "/api/atlas/v2/groups/{groupId}/streams/{tenantName}",
		},
		{
			ID:          "endpoint-reactivated",
			Text:        "endpoint reactivated",
			Level:       1,
			Operation:   "POST",
			OperationID: "createCluster",
			Path:        "/api/atlas/v2/groups/{groupId}/clusters",
		},
		{
			ID:          "endpoint-reactivated",
			Text:        "endpoint reactivated",
			Level:       1,
			Operation:   "GET",
			OperationID: "getClusters",
			Path:        "/api/atlas/v2/groups/{groupId}/clusters",
		},
		{
			ID:          "request-property-removed",
			Text:        "removed the request properties: 'mongoURIWithOptions', 'providerBackupEnabled'",
			Level:       3,
			Operation:   "POST",
			OperationID: "createCluster",
			Path:        "/api/atlas/v2/groups/{groupId}/clusters",
		},
		{
			ID:          "response-property-removed",
			Text:        "removed 'replicationSpecs.regionConfigs' response property",
			Level:       3,
			Operation:   "GET",
			OperationID: "getClusters",
			Path:        "/api/atlas/v2/groups/{groupId}/clusters",
		},
	}

	expectedChangelogEntryForRunDate := &Entry{
		Date: "2023-06-15",
		Paths: []*Path{
			{
				URI:         "/api/atlas/v2/groups/{groupId}/clusters",
				HTTPMethod:  "GET",
				OperationID: "getClusters",
				Tag:         "Multi-Cloud Clusters",
				Versions: []*Version{
					{
						Version:        "2023-02-02",
						StabilityLevel: "stable",
						ChangeType:     "release",
						Changes: []*Change{
							{
								Description:        "removed 'replicationSpecs.regionConfigs' response property",
								Code:               "response-property-removed",
								BackwardCompatible: false,
							},
						},
					},
					{
						Version:        "2023-01-01",
						StabilityLevel: "stable",
						ChangeType:     "deprecate",
						Changes: []*Change{
							{
								Description:        "added 'replicationSpecs.regionConfigs' response property",
								Code:               "response-optional-property-added",
								BackwardCompatible: true,
							},
							{
								Description:        "New resource added 2023-02-02. Resource version 2023-01-01 deprecated and marked for removal on 2024-02-02",
								Code:               "endpoint-deprecated",
								BackwardCompatible: true,
							},
						},
					},
				},
			},
			{
				URI:         "/api/atlas/v2/groups/{groupId}/clusters",
				HTTPMethod:  "POST",
				OperationID: "createCluster",
				Tag:         "Multi-Cloud Clusters",
				Versions: []*Version{
					{
						Version:        "2023-02-02",
						StabilityLevel: "stable",
						ChangeType:     "release",
						Changes: []*Change{
							{
								Description:        "removed the request properties: 'mongoURIWithOptions', 'providerBackupEnabled'",
								Code:               "request-property-removed",
								BackwardCompatible: false,
							},
						},
					},
					{
						Version:        "2023-01-01",
						StabilityLevel: "stable",
						ChangeType:     "deprecate",
						Changes: []*Change{
							{
								Description:        "added 'replicationSpecs.regionConfigs' request property",
								Code:               "request-property-added",
								BackwardCompatible: true,
							},
							{
								Description:        "New resource added 2023-02-02. Resource version 2023-01-01 deprecated and marked for removal on 2024-02-02",
								Code:               "endpoint-deprecated",
								BackwardCompatible: true,
							},
						},
					},
				},
			},
			{
				URI:         "/api/atlas/v2/groups/{groupId}/streams",
				HTTPMethod:  "GET",
				OperationID: "listStreamInstances",
				Tag:         "Streams",
				Versions: []*Version{
					{
						Version:        "2023-02-02",
						StabilityLevel: "stable",
						ChangeType:     "release",
						Changes: []*Change{
							{
								Description:        "endpoint added",
								Code:               "endpoint-added",
								BackwardCompatible: true,
							},
						},
					},
				},
			},
			{
				URI:         "/api/atlas/v2/groups/{groupId}/streams/{tenantName}",
				HTTPMethod:  "GET",
				OperationID: "getStreamInstance",
				Tag:         "Streams",
				Versions: []*Version{
					{
						Version:        "2023-02-02",
						StabilityLevel: "stable",
						ChangeType:     "release",
						Changes: []*Change{
							{
								Description:        "endpoint added",
								Code:               "endpoint-added",
								BackwardCompatible: true,
							},
						},
					},
				},
			},
		},
	}

	changelogStruct := &Changelog{
		BaseMetadata: &Metadata{
			RunDate:       runDate,
			ActiveVersion: firstVersion,
		},
		RevisionMetadata: &Metadata{
			RunDate:       runDate,
			ActiveVersion: firstVersion,
		},
		RunDate:       runDate,
		BaseChangelog: baseChangelog,
	}

	changelog, err := changelogStruct.mergeChangelog(changeTypeFirstVersion, changesFirstVersion, endpointsConfig)
	require.NoError(t, err)

	changelogStruct = &Changelog{
		BaseMetadata: &Metadata{
			RunDate:       runDate,
			ActiveVersion: firstVersion,
		},
		RevisionMetadata: &Metadata{
			RunDate:       runDate,
			ActiveVersion: secondVersion,
		},
		RunDate:       runDate,
		BaseChangelog: changelog,
	}

	changelog, err = changelogStruct.mergeChangelog(changeTypeSecondVersion, changesSecondVersion, endpointsConfig)
	require.NoError(t, err)

	require.Len(t, changelog, 2)

	changeloEntryToCompare := changelog[0]
	assert.Equal(t, expectedChangelogEntryForRunDate.Date, changeloEntryToCompare.Date)

	require.Len(t, changeloEntryToCompare.Paths, len(expectedChangelogEntryForRunDate.Paths))
	assert.ElementsMatch(t, expectedChangelogEntryForRunDate.Paths, changeloEntryToCompare.Paths)
}
