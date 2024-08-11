package changelog

import (
	"fmt"
	"testing"

	"github.com/mongodb/openapi/tools/cli/internal/changelog/outputfilter"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/tufin/oasdiff/load"
)

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
