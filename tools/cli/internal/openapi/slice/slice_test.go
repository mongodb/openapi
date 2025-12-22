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

package slice

import (
	"testing"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestNormalizePath(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{
			name:     "single parameter",
			input:    "/api/v2/groups/{groupId}",
			expected: "/api/v2/groups/{}",
		},
		{
			name:     "multiple parameters",
			input:    "/api/v2/groups/{groupId}/clusters/{clusterId}",
			expected: "/api/v2/groups/{}/clusters/{}",
		},
		{
			name:     "no parameters",
			input:    "/api/v2/groups",
			expected: "/api/v2/groups",
		},
		{
			name:     "different parameter names normalize to same",
			input:    "/api/v2/groups/{id}",
			expected: "/api/v2/groups/{}",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := normalizePath(tt.input)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestSlice_FilterByPath(t *testing.T) {
	tests := []struct {
		name          string
		paths         []string
		specPaths     map[string]*openapi3.PathItem
		expectedPaths []string
	}{
		{
			name:  "exact path match",
			paths: []string{"/api/v2/groups/{groupId}"},
			specPaths: map[string]*openapi3.PathItem{
				"/api/v2/groups/{groupId}": {
					Get: &openapi3.Operation{OperationID: "getGroup"},
				},
				"/api/v2/users/{userId}": {
					Get: &openapi3.Operation{OperationID: "getUser"},
				},
			},
			expectedPaths: []string{"/api/v2/groups/{groupId}"},
		},
		{
			name:  "normalized path match - different param names",
			paths: []string{"/api/v2/groups/{id}"},
			specPaths: map[string]*openapi3.PathItem{
				"/api/v2/groups/{groupId}": {
					Get: &openapi3.Operation{OperationID: "getGroup"},
				},
				"/api/v2/users/{userId}": {
					Get: &openapi3.Operation{OperationID: "getUser"},
				},
			},
			expectedPaths: []string{"/api/v2/groups/{groupId}"},
		},
		{
			name:  "multiple parameters normalized",
			paths: []string{"/api/v2/groups/{gid}/clusters/{cid}"},
			specPaths: map[string]*openapi3.PathItem{
				"/api/v2/groups/{groupId}/clusters/{clusterId}": {
					Get: &openapi3.Operation{OperationID: "getCluster"},
				},
				"/api/v2/users/{userId}": {
					Get: &openapi3.Operation{OperationID: "getUser"},
				},
			},
			expectedPaths: []string{"/api/v2/groups/{groupId}/clusters/{clusterId}"},
		},
		{
			name:  "no match - all paths removed",
			paths: []string{"/api/v2/nonexistent/{id}"},
			specPaths: map[string]*openapi3.PathItem{
				"/api/v2/groups/{groupId}": {
					Get: &openapi3.Operation{OperationID: "getGroup"},
				},
			},
			expectedPaths: []string{},
		},
		{
			name:  "multiple paths to keep",
			paths: []string{"/api/v2/groups/{id}", "/api/v2/users/{id}"},
			specPaths: map[string]*openapi3.PathItem{
				"/api/v2/groups/{groupId}": {
					Get: &openapi3.Operation{OperationID: "getGroup"},
				},
				"/api/v2/users/{userId}": {
					Get: &openapi3.Operation{OperationID: "getUser"},
				},
				"/api/v2/clusters/{clusterId}": {
					Get: &openapi3.Operation{OperationID: "getCluster"},
				},
			},
			expectedPaths: []string{"/api/v2/groups/{groupId}", "/api/v2/users/{userId}"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			oas := &openapi3.T{
				Paths: openapi3.NewPaths(),
			}
			for path, pathItem := range tt.specPaths {
				oas.Paths.Set(path, pathItem)
			}

			err := Slice(oas, &Criteria{
				Paths: tt.paths,
			})
			require.NoError(t, err)

			assert.Equal(t, len(tt.expectedPaths), oas.Paths.Len())
			for _, expectedPath := range tt.expectedPaths {
				assert.NotNil(t, oas.Paths.Value(expectedPath), "expected path %s to exist", expectedPath)
			}
		})
	}
}

func TestSlice_FilterByOperationID(t *testing.T) {
	oas := &openapi3.T{
		Paths: openapi3.NewPaths(),
	}

	oas.Paths.Set("/api/v2/groups/{groupId}", &openapi3.PathItem{
		Get:  &openapi3.Operation{OperationID: "getGroup"},
		Post: &openapi3.Operation{OperationID: "createGroup"},
	})
	oas.Paths.Set("/api/v2/users/{userId}", &openapi3.PathItem{
		Get:    &openapi3.Operation{OperationID: "getUser"},
		Delete: &openapi3.Operation{OperationID: "deleteUser"},
	})

	err := Slice(oas, &Criteria{
		OperationIDs: []string{"getGroup", "deleteUser"},
	})
	require.NoError(t, err)

	// Should keep both paths
	assert.Equal(t, 2, oas.Paths.Len())

	// Check groups path - only GET should remain
	groupsPath := oas.Paths.Value("/api/v2/groups/{groupId}")
	require.NotNil(t, groupsPath)
	assert.NotNil(t, groupsPath.Get)
	assert.Nil(t, groupsPath.Post) // POST should be removed

	// Check users path - only DELETE should remain
	usersPath := oas.Paths.Value("/api/v2/users/{userId}")
	require.NotNil(t, usersPath)
	assert.Nil(t, usersPath.Get) // GET should be removed
	assert.NotNil(t, usersPath.Delete)
}

func TestSlice_FilterByTag(t *testing.T) {
	oas := &openapi3.T{
		Paths: openapi3.NewPaths(),
	}

	oas.Paths.Set("/api/v2/groups/{groupId}", &openapi3.PathItem{
		Get:  &openapi3.Operation{OperationID: "getGroup", Tags: []string{"Groups"}},
		Post: &openapi3.Operation{OperationID: "createGroup", Tags: []string{"Groups"}},
	})
	oas.Paths.Set("/api/v2/users/{userId}", &openapi3.PathItem{
		Get:    &openapi3.Operation{OperationID: "getUser", Tags: []string{"Users"}},
		Delete: &openapi3.Operation{OperationID: "deleteUser", Tags: []string{"Users"}},
	})
	oas.Paths.Set("/api/v2/clusters/{clusterId}", &openapi3.PathItem{
		Get: &openapi3.Operation{OperationID: "getCluster", Tags: []string{"Clusters"}},
	})

	err := Slice(oas, &Criteria{
		Tags: []string{"Groups", "Clusters"},
	})
	require.NoError(t, err)

	// Should keep groups and clusters paths, remove users
	assert.Equal(t, 2, oas.Paths.Len())
	assert.NotNil(t, oas.Paths.Value("/api/v2/groups/{groupId}"))
	assert.NotNil(t, oas.Paths.Value("/api/v2/clusters/{clusterId}"))
	assert.Nil(t, oas.Paths.Value("/api/v2/users/{userId}"))
}

func TestSlice_MultipleCriteria(t *testing.T) {
	oas := &openapi3.T{
		Paths: openapi3.NewPaths(),
	}

	oas.Paths.Set("/api/v2/groups/{groupId}", &openapi3.PathItem{
		Get:  &openapi3.Operation{OperationID: "getGroup", Tags: []string{"Groups"}},
		Post: &openapi3.Operation{OperationID: "createGroup", Tags: []string{"Groups"}},
	})
	oas.Paths.Set("/api/v2/users/{userId}", &openapi3.PathItem{
		Get:    &openapi3.Operation{OperationID: "getUser", Tags: []string{"Users"}},
		Delete: &openapi3.Operation{OperationID: "deleteUser", Tags: []string{"Users"}},
	})
	oas.Paths.Set("/api/v2/clusters/{clusterId}", &openapi3.PathItem{
		Get: &openapi3.Operation{OperationID: "getCluster", Tags: []string{"Clusters"}},
	})

	// Match by: path (/api/v2/groups/{id}), operationID (getUser), or tag (Clusters)
	err := Slice(oas, &Criteria{
		Paths:        []string{"/api/v2/groups/{id}"},
		OperationIDs: []string{"getUser"},
		Tags:         []string{"Clusters"},
	})
	require.NoError(t, err)

	// Should keep all three paths
	assert.Equal(t, 3, oas.Paths.Len())

	// Groups path - both operations match by path
	groupsPath := oas.Paths.Value("/api/v2/groups/{groupId}")
	require.NotNil(t, groupsPath)
	assert.NotNil(t, groupsPath.Get)
	assert.NotNil(t, groupsPath.Post)

	// Users path - only GET matches by operationID
	usersPath := oas.Paths.Value("/api/v2/users/{userId}")
	require.NotNil(t, usersPath)
	assert.NotNil(t, usersPath.Get)
	assert.Nil(t, usersPath.Delete)

	// Clusters path - matches by tag
	clustersPath := oas.Paths.Value("/api/v2/clusters/{clusterId}")
	require.NotNil(t, clustersPath)
	assert.NotNil(t, clustersPath.Get)
}

func TestSlice_EmptyCriteria(t *testing.T) {
	oas := &openapi3.T{
		Paths: openapi3.NewPaths(),
	}

	oas.Paths.Set("/api/v2/groups/{groupId}", &openapi3.PathItem{
		Get: &openapi3.Operation{OperationID: "getGroup"},
	})

	err := Slice(oas, &Criteria{})
	require.NoError(t, err)

	// With empty criteria, nothing matches, so all paths should be removed
	assert.Equal(t, 0, oas.Paths.Len())
}

func TestSlice_NilSpec(t *testing.T) {
	err := Slice(nil, &Criteria{
		Paths: []string{"/api/v2/groups/{id}"},
	})
	require.Error(t, err)
	assert.Contains(t, err.Error(), "OpenAPI spec is nil")
}

func TestSlice_NilPaths(t *testing.T) {
	oas := &openapi3.T{
		Paths: nil,
	}

	err := Slice(oas, &Criteria{
		Paths: []string{"/api/v2/groups/{id}"},
	})
	require.NoError(t, err) // Should not error, just return early
}

func TestSlice_RemovePathWithNoMatchingOperations(t *testing.T) {
	oas := &openapi3.T{
		Paths: openapi3.NewPaths(),
	}

	oas.Paths.Set("/api/v2/groups/{groupId}", &openapi3.PathItem{
		Get:  &openapi3.Operation{OperationID: "getGroup", Tags: []string{"Groups"}},
		Post: &openapi3.Operation{OperationID: "createGroup", Tags: []string{"Groups"}},
	})

	// Filter by tag that doesn't match any operations
	err := Slice(oas, &Criteria{
		Tags: []string{"Users"},
	})
	require.NoError(t, err)

	// Path should be removed since no operations match
	assert.Equal(t, 0, oas.Paths.Len())
}
