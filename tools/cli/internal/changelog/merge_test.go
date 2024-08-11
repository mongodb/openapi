package changelog

import (
	"fmt"
	"testing"

	"github.com/mongodb/openapi/tools/cli/internal/changelog/outputfilter"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/tufin/oasdiff/load"
)

// @To do: Add tests for the following scenarios once the sunset logic is migrated:
// - test_merge_changelog_2_versions_with_deprecations
// - test_merge_changelog_yaml_compare
// - test_remove_hidden_entries_date_removed
// - test_remove_hidden_entries_entries_removed

func TestMergeChangelogOneChange(t *testing.T) {
	baseChangelog, err := NewChangelogEntries("../../test/data/changelog/changelog.json")
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
	changelogMetadata := &Metadata{
		Base: &load.SpecInfo{
			Version: version,
		},
		Revision: &load.SpecInfo{
			Version: version,
		},
		BaseChangelog: baseChangelog,
		RunDate:       runDate,
	}

	// act
	changelog, err := changelogMetadata.mergeChangelog(changeType, changes, endpointsConfig)
	require.NoError(t, err)

	assert.Len(t, changelog, 2, fmt.Sprintf("merged changelog should have 2 entries, got %d", len(changelog)))
	assert.Equal(t, changelog[0].Date, runDate, "merged changelog should have entries for the run date")
	assert.Equal(t, changelog[1].Date, lastChangelogRunDate, fmt.Sprintf("merged changelog should have entries for the %s", lastChangelogRunDate))

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
	baseChangelog, err := NewChangelogEntries("../../test/data/changelog/changelog.json")
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

	changelogMetadataFirstVersion := &Metadata{
		Base: &load.SpecInfo{
			Version: firstVersion,
		},
		Revision: &load.SpecInfo{
			Version: firstVersion,
		},
		BaseChangelog: baseChangelog,
		RunDate:       runDate,
	}

	changelog, err := changelogMetadataFirstVersion.mergeChangelog(changeTypeFirstVersion, changesFirstVersion, endpointsConfig)
	require.NoError(t, err)

	secondVersion := "2023-02-02"
	changeTypeSecondVersion := changeTypeRelease
	changelogMetadataSecondVersion := &Metadata{
		Base: &load.SpecInfo{
			Version: firstVersion,
		},
		Revision: &load.SpecInfo{
			Version: secondVersion,
		},
		BaseChangelog: changelog,
		RunDate:       runDate,
	}

	changelog, err = changelogMetadataSecondVersion.mergeChangelog(changeTypeSecondVersion, changesSecondVersion, endpointsConfig)
	require.NoError(t, err)

	assert.Len(t, changelog, 2, fmt.Sprintf("merged changelog should have 2 entries, got %d", len(changelog)))
	assert.Equal(t, changelog[0].Date, runDate, "merged changelog should have entries for the run date")
	assert.Equal(t, changelog[1].Date, lastChangelogRunDate, fmt.Sprintf("merged changelog should have entries for the %s", lastChangelogRunDate))

	paths := changelog[0].Paths
	assert.Len(t, paths, 1, "latest changelog entry should refer to only one endpoint")

	assert.Equal(t, paths[0].URI, changesSecondVersion[0].Path)
	assert.Equal(t, paths[0].HTTPMethod, changesSecondVersion[0].Operation)
	assert.Equal(t, paths[0].OperationID, changesSecondVersion[0].OperationID)
	assert.Equal(t, "Multi-Cloud Clusters", paths[0].Tag)

	versions := paths[0].Versions
	assert.Len(t, versions, 2, "latest changelog entry includes both versions and the versions are ordered DES")

	firstVersionEntry := versions[0]
	assert.Len(t, firstVersionEntry.Changes, 1)
	assert.Equal(t, firstVersionEntry.Version, secondVersion)
	assert.Equal(t, changeTypeRelease, firstVersionEntry.ChangeType)
	assert.Equal(t, "request-property-removed", firstVersionEntry.Changes[0].Code)
	assert.False(t, firstVersionEntry.Changes[0].BackwardCompatible)

	secondVersionEntry := versions[1]
	assert.Len(t, secondVersionEntry.Changes, 1)
	assert.Equal(t, secondVersionEntry.Version, firstVersion)
	assert.Equal(t, changeTypeUpdate, secondVersionEntry.ChangeType)
	assert.Equal(t, "request-property-added", secondVersionEntry.Changes[0].Code)
	assert.True(t, secondVersionEntry.Changes[0].BackwardCompatible)
}

func TestMergeChangelogAdd2Endpoints(t *testing.T) {
	originalChangelog, err := NewChangelogEntries("../../test/data/changelog/changelog.json")
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

	changelogMetadata := &Metadata{
		Base: &load.SpecInfo{
			Version: version,
		},
		Revision: &load.SpecInfo{
			Version: version,
		},
		BaseChangelog: originalChangelog,
		RunDate:       runDate,
	}

	// act
	changelog, err := changelogMetadata.mergeChangelog(
		changeTypeUpdate,
		changes,
		endpointsConfig,
	)
	require.NoError(t, err)

	// assert
	assert.Equal(t, changelog[0].Date, runDate, "merged changelog should have entries for the run date")
	assert.Equal(t, changelog[1].Date, lastChangelogRunDate, fmt.Sprintf("merged changelog should have entries for the %s", lastChangelogRunDate))

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
			expectedResult:    changeTypeUpdate,
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
		assert.Equal(t, tc.expectedResult, result, "newChangeType should return the expected result")
	}
}
