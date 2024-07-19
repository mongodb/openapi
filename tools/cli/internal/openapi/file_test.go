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
package openapi

import (
	"fmt"
	"testing"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestNewArrayBytesFromOAS(t *testing.T) {
	tests := []struct {
		name     string
		spec     *Spec
		path     string
		format   string
		expected string
	}{
		{
			name: "JSON with HTML characters",
			spec: &Spec{
				Paths: openapi3.NewPaths(
					openapi3.WithPath(
						"/api/atlas/v2/groups/{groupId}/databaseUsers/{databaseName}/{username}",
						&openapi3.PathItem{
							Delete: &openapi3.Operation{
								Description: "<test>&</test>",
							},
						},
					)),
			},
			path:     "test.json",
			format:   "json",
			expected: "<test>&</test>",
		},
		{
			name: "YAML with HTML characters",
			spec: &Spec{
				Paths: openapi3.NewPaths(
					openapi3.WithPath(
						"/api/atlas/v2/groups/{groupId}/databaseUsers/{databaseName}/{username}",
						&openapi3.PathItem{
							Delete: &openapi3.Operation{
								Description: "<test>&</test>",
							},
						},
					)),
			},
			path:     "test.yaml",
			format:   "yaml",
			expected: "<test>&</test>",
		},
		{
			name: "YAML with normal characters",
			spec: &Spec{
				Paths: openapi3.NewPaths(
					openapi3.WithPath(
						"/api/atlas/v2/groups/{groupId}/databaseUsers/{databaseName}/{username}",
						&openapi3.PathItem{
							Delete: &openapi3.Operation{
								Description: "test",
							},
						},
					)),
			},
			path:     "test.yaml",
			format:   "yaml",
			expected: "test",
		},
		{
			name: "JSON with normal characters",
			spec: &Spec{
				Paths: openapi3.NewPaths(
					openapi3.WithPath(
						"/api/atlas/v2/groups/{groupId}/databaseUsers/{databaseName}/{username}",
						&openapi3.PathItem{
							Delete: &openapi3.Operation{
								Description: "test",
							},
						},
					)),
			},
			path:     "test.jsoo",
			format:   "json",
			expected: "test",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			data, err := NewArrayBytesFromOAS(tt.spec, tt.path, tt.format)
			require.NoError(t, err)
			fmt.Printf("data: %s", data)
			assert.Contains(t, string(data), tt.expected)
		})
	}
}
