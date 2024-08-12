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

func TestNewOasDiffEntriesFromSunsetEndpoints(t *testing.T) {
	previousRunDate := "2023-07-10"
	runDate := "2023-07-12"
	previousVersion := "2023-01-01"
	version := "2023-02-01"
	changelog := []*Entry{
		{
			Date: previousRunDate,
			Paths: []*Path{
				{
					URI:         "/api/atlas/v2/groups/{id}/clusters",
					HTTPMethod:  "POST",
					OperationID: "createCluster",
					Tag:         "Multi-Cloud Clusters",
					Versions: []*Version{
						{
							Version:        version,
							StabilityLevel: "stable",
							ChangeType:     "remove",
							Changes: []*Change{
								{
									Description:        "endpoint removed",
									Code:               "endpoint-removed",
									BackwardCompatible: true,
								},
							},
						},
					},
				},
				{
					URI:         "/api/atlas/v2/groups/{id}/streams",
					HTTPMethod:  "GET",
					OperationID: "listStreamInstances",
					Tag:         "Streams",
					Versions: []*Version{
						{
							Version:        previousVersion,
							StabilityLevel: "stable",
							ChangeType:     "remove",
							Changes: []*Change{
								{
									Description:        "endpoint removed",
									Code:               "endpoint-removed",
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
				Path:                   "/api/atlas/v2/groups/{id}/clusters",
				HTTPMethod:             "POST",
				Tag:                    "Multi-Cloud Clusters",
				Sunset:                 previousRunDate,
				ManualChangelogEntries: map[string]interface{}{},
			},
		},
		"getCluster": {
			Base: nil,
			Revision: &outputfilter.OperationConfig{
				Path:                   "/api/atlas/v2/groups/{id}/clusters",
				HTTPMethod:             "GET",
				Tag:                    "Multi-Cloud Clusters",
				Sunset:                 "",
				ManualChangelogEntries: map[string]interface{}{},
			},
		},
		"listStreamInstances": {
			Base: nil,
			Revision: &outputfilter.OperationConfig{
				Path:                   "/api/atlas/v2/groups/{id}/streams",
				HTTPMethod:             "GET",
				Tag:                    "Streams",
				Sunset:                 runDate,
				ManualChangelogEntries: map[string]interface{}{},
			},
		},
		"getStreamInstance": {
			Base: nil,
			Revision: &outputfilter.OperationConfig{
				Path:                   "/api/atlas/v2/groups/{id}/streams/{tenantName}",
				HTTPMethod:             "GET",
				Tag:                    "Streams",
				Sunset:                 "2023-07-13",
				ManualChangelogEntries: map[string]interface{}{},
			},
		},
	}

	expectedChanges := []*outputfilter.OasDiffEntry{
		{
			Date:        runDate,
			ID:          "endpoint-removed",
			Level:       3,
			Operation:   "GET",
			OperationID: "listStreamInstances",
			Path:        "/api/atlas/v2/groups/{id}/streams",
			Text:        "endpoint removed",
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

	changes, err := changelogMetadata.newOasDiffEntriesFromSunsetEndpoints(endpointsConfig, version)

	require.NoError(t, err)
	require.NotNil(t, changes)
	assert.Equal(t, expectedChanges, changes)
}
