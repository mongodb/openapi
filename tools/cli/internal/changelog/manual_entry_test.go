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
	"testing"

	"github.com/mongodb/openapi/tools/cli/internal/changelog/outputfilter"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/tufin/oasdiff/load"
)

func TestDetectManualEntriesAndMergeChangelog(t *testing.T) {
	previousRunDate := "2023-07-10"
	runDate := "2023-07-12"
	version := "2023-02-01"
	theDayAfterRunDate := "2023-07-13"

	changelog := []*Entry{
		{
			Date: previousRunDate,
			Paths: []*Path{
				{
					URI:         "/api/atlas/v2/groups/{groupId}/clusters",
					HTTPMethod:  "POST",
					OperationID: "createCluster",
					Tag:         "Multi-Cloud Clusters",
					Versions: []*Version{
						{
							Version:        version,
							StabilityLevel: "stable",
							ChangeType:     "update",
							Changes: []*Change{
								{
									Description:        "change info 1",
									Code:               "manual-changelog-entry",
									BackwardCompatible: true,
								},
							},
						},
					},
				},
			},
		},
	}

	endpointsConfig := map[string]*outputfilter.OperationConfigs{
		"createCluster": {
			Base: nil,
			Revision: &outputfilter.OperationConfig{
				Path:       "/api/atlas/v2/groups/{groupId}/clusters",
				HTTPMethod: "POST",
				Tag:        "Multi-Cloud Clusters",
				Sunset:     "",
				ManualChangelogEntries: map[string]interface{}{
					previousRunDate:    "change info 1", // Already in the changelog
					runDate:            "change info 2", // Should be added to the changelog
					theDayAfterRunDate: "change info 3", // Should not be added to the changelog
				},
			},
		},
	}

	expectedChanges := []*outputfilter.OasDiffEntry{
		{
			Date:        runDate,
			ID:          "manual-changelog-entry",
			Level:       1,
			Operation:   "POST",
			OperationID: "createCluster",
			Path:        "/api/atlas/v2/groups/{groupId}/clusters",
			Text:        "change info 2",
		},
	}

	changelogMetadata := &Metadata{
		Base: &load.SpecInfo{
			Version: version,
		},
		Revision: &load.SpecInfo{
			Version: version,
		},
		BaseChangelog:   changelog,
		RunDate:         runDate,
		PreviousRunDate: previousRunDate,
	}

	// Act
	changes, err := changelogMetadata.newOasDiffEntriesWithManualEntries(endpointsConfig, version)

	// Assert
	require.NoError(t, err)
	require.NotNil(t, changes)
	assert.Equal(t, expectedChanges, changes)
}
