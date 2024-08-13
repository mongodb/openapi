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

	"github.com/stretchr/testify/assert"
)

func TestNewNotHiddenEntries(t *testing.T) {
	tests := []struct {
		name      string
		changelog []*Entry
		expected  []*Entry
	}{
		{
			name:      "EmptyChangelog",
			changelog: []*Entry{},
			expected:  []*Entry{},
		},
		{
			name: "NoHiddenChanges",
			changelog: []*Entry{
				{
					Date: "2024-08-01",
					Paths: []*Path{
						{
							URI:         "/api/v1/test",
							HTTPMethod:  "GET",
							OperationID: "getTest",
							Versions: []*Version{
								{
									Version:        "v1",
									StabilityLevel: "stable",
									ChangeType:     "add",
									Changes: []*Change{
										{
											Description:        "added endpoint",
											Code:               "endpoint-added",
											BackwardCompatible: true,
											HideFromChangelog:  false,
										},
									},
								},
							},
						},
						{
							URI:         "/api/v1/test2",
							HTTPMethod:  "GET",
							OperationID: "getTest2",
							Versions: []*Version{
								{
									Version:        "v1",
									StabilityLevel: "stable",
									ChangeType:     "add",
									Changes: []*Change{
										{
											Description:        "added endpoint",
											Code:               "endpoint-added",
											BackwardCompatible: true,
											HideFromChangelog:  false,
										},
									},
								},
							},
						},
					},
				},
			},
			expected: []*Entry{
				{
					Date: "2024-08-01",
					Paths: []*Path{
						{
							URI:         "/api/v1/test",
							HTTPMethod:  "GET",
							OperationID: "getTest",
							Versions: []*Version{
								{
									Version:        "v1",
									StabilityLevel: "stable",
									ChangeType:     "add",
									Changes: []*Change{
										{
											Description:        "added endpoint",
											Code:               "endpoint-added",
											BackwardCompatible: true,
											HideFromChangelog:  false,
										},
									},
								},
							},
						},
						{
							URI:         "/api/v1/test2",
							HTTPMethod:  "GET",
							OperationID: "getTest2",
							Versions: []*Version{
								{
									Version:        "v1",
									StabilityLevel: "stable",
									ChangeType:     "add",
									Changes: []*Change{
										{
											Description:        "added endpoint",
											Code:               "endpoint-added",
											BackwardCompatible: true,
											HideFromChangelog:  false,
										},
									},
								},
							},
						},
					},
				},
			},
		},
		{
			name: "SomeHiddenChanges",
			changelog: []*Entry{
				{
					Date: "2024-08-01",
					Paths: []*Path{
						{
							URI:         "/api/v1/test",
							HTTPMethod:  "GET",
							OperationID: "getTest",
							Versions: []*Version{
								{
									Version:        "v1",
									StabilityLevel: "stable",
									ChangeType:     "add",
									Changes: []*Change{
										{
											Description:        "added endpoint",
											Code:               "endpoint-added",
											BackwardCompatible: true,
											HideFromChangelog:  false,
										},
										{
											Description:        "hidden change",
											Code:               "hidden-change",
											BackwardCompatible: true,
											HideFromChangelog:  true,
										},
									},
								},
							},
						},
					},
				},
			},
			expected: []*Entry{
				{
					Date: "2024-08-01",
					Paths: []*Path{
						{
							URI:         "/api/v1/test",
							HTTPMethod:  "GET",
							OperationID: "getTest",
							Versions: []*Version{
								{
									Version:        "v1",
									StabilityLevel: "stable",
									ChangeType:     "add",
									Changes: []*Change{
										{
											Description:        "added endpoint",
											Code:               "endpoint-added",
											BackwardCompatible: true,
											HideFromChangelog:  false,
										},
									},
								},
							},
						},
					},
				},
			},
		},
		{
			name: "AllChangesHidden",
			changelog: []*Entry{
				{
					Date: "2024-08-01",
					Paths: []*Path{
						{
							URI:         "/api/v1/test",
							HTTPMethod:  "GET",
							OperationID: "getTest",
							Versions: []*Version{
								{
									Version:        "v1",
									StabilityLevel: "stable",
									ChangeType:     "add",
									Changes: []*Change{
										{
											Description:        "hidden change 1",
											Code:               "hidden-change-1",
											BackwardCompatible: true,
											HideFromChangelog:  true,
										},
										{
											Description:        "hidden change 2",
											Code:               "hidden-change-2",
											BackwardCompatible: true,
											HideFromChangelog:  true,
										},
									},
								},
							},
						},
					},
				},
			},
			expected: []*Entry{},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			actual := newNotHiddenEntries(tt.changelog)
			assert.Equal(t, tt.expected, actual)
		})
	}
}

func TestFindChangelogEntry(t *testing.T) {
	tests := []struct {
		name            string
		entries         []*Entry
		operationID     string
		date            string
		version         string
		changeCode      string
		expectedEntries *Change
	}{

		{
			name: "find changelog entry",
			entries: []*Entry{
				{
					Date: "2023-07-10",
					Paths: []*Path{
						{
							URI:         "/api/atlas/v2/groups/{id}/clusters",
							HTTPMethod:  "POST",
							OperationID: "createCluster",
							Tag:         "Multi-Cloud Clusters",
							Versions: []*Version{
								{
									Version:        "2023-02-01",
									StabilityLevel: "stable",
									ChangeType:     "remove",
									Changes: []*Change{
										{
											Description:        "endpoint removed",
											Code:               "endpoint-removed",
											BackwardCompatible: true,
										}},
								},
							},
						},
					},
				},
				{
					Date: "2023-07-11",
					Paths: []*Path{
						{
							URI:         "/api/atlas/v2/groups/{id}/clusters",
							HTTPMethod:  "POST",
							OperationID: "createCluster",
							Tag:         "Multi-Cloud Clusters",
							Versions: []*Version{
								{
									Version:        "2023-02-01",
									StabilityLevel: "stable",
									ChangeType:     "remove",
									Changes: []*Change{
										{
											Description:        "endpoint removed",
											Code:               "endpoint-removed",
											BackwardCompatible: true,
										}},
								},
							},
						},
					},
				},
			},
			operationID: "createCluster",
			date:        "2023-07-10",
			version:     "2023-02-01",
			changeCode:  "endpoint-removed",
			expectedEntries: &Change{
				Description:        "endpoint removed",
				Code:               "endpoint-removed",
				BackwardCompatible: true,
			},
		},
		{
			name: "Not find changelog entry for different date",
			entries: []*Entry{
				{
					Date: "2023-07-10",
					Paths: []*Path{
						{
							URI:         "/api/atlas/v2/groups/{id}/clusters",
							HTTPMethod:  "POST",
							OperationID: "createCluster",
							Tag:         "Multi-Cloud Clusters",
							Versions: []*Version{
								{
									Version:        "2023-02-01",
									StabilityLevel: "stable",
									ChangeType:     "remove",
									Changes: []*Change{
										{
											Description:        "endpoint removed",
											Code:               "endpoint-removed",
											BackwardCompatible: true,
										}},
								},
							},
						},
					},
				},
				{
					Date: "2023-07-11",
					Paths: []*Path{
						{
							URI:         "/api/atlas/v2/groups/{id}/clusters",
							HTTPMethod:  "POST",
							OperationID: "createCluster",
							Tag:         "Multi-Cloud Clusters",
							Versions: []*Version{
								{
									Version:        "2023-02-01",
									StabilityLevel: "stable",
									ChangeType:     "remove",
									Changes: []*Change{
										{
											Description:        "endpoint removed",
											Code:               "endpoint-removed",
											BackwardCompatible: true,
										}},
								},
							},
						},
					},
				},
			},
			operationID:     "createCluster",
			date:            "2023-07-21",
			version:         "2023-02-01",
			changeCode:      "endpoint-removed",
			expectedEntries: nil,
		},
		{
			name: "Not find changelog entry for different version",
			entries: []*Entry{
				{
					Date: "2023-07-10",
					Paths: []*Path{
						{
							URI:         "/api/atlas/v2/groups/{id}/clusters",
							HTTPMethod:  "POST",
							OperationID: "createCluster",
							Tag:         "Multi-Cloud Clusters",
							Versions: []*Version{
								{
									Version:        "2023-02-01",
									StabilityLevel: "stable",
									ChangeType:     "remove",
									Changes: []*Change{
										{
											Description:        "endpoint removed",
											Code:               "endpoint-removed",
											BackwardCompatible: true,
										}},
								},
							},
						},
					},
				},
				{
					Date: "2023-07-11",
					Paths: []*Path{
						{
							URI:         "/api/atlas/v2/groups/{id}/clusters",
							HTTPMethod:  "POST",
							OperationID: "createCluster",
							Tag:         "Multi-Cloud Clusters",
							Versions: []*Version{
								{
									Version:        "2023-02-01",
									StabilityLevel: "stable",
									ChangeType:     "remove",
									Changes: []*Change{
										{
											Description:        "endpoint removed",
											Code:               "endpoint-removed",
											BackwardCompatible: true,
										}},
								},
							},
						},
					},
				},
			},
			operationID:     "createCluster",
			date:            "2023-07-11",
			version:         "2023-02-02",
			changeCode:      "endpoint-removed",
			expectedEntries: nil,
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			result := findChangelogEntry(test.entries, test.date, test.operationID, test.version, test.changeCode)
			assert.Equal(t, test.expectedEntries, result)
		})
	}
}
