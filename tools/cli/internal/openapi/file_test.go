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
	"github.com/spf13/afero"
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
			name:     "JSON with HTML characters",
			spec:     getTestSpecWithHTMLChars(),
			path:     "test.json",
			format:   "json",
			expected: "<test>&</test>",
		},
		{
			name:     "YAML with HTML characters",
			spec:     getTestSpecWithHTMLChars(),
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

func TestSaveToFileFormats(t *testing.T) {
	tests := []struct {
		name     string
		spec     *Spec
		path     string
		format   string
		expected string
	}{
		{
			name:     "JSON with HTML characters",
			spec:     getTestSpecWithHTMLChars(),
			path:     "test.json",
			format:   "json",
			expected: "<test>&</test>",
		},
		{
			name: "YAML with HTML characters",
			spec: getTestSpecWithHTMLChars(),

			path:     "test.yaml",
			format:   "yaml",
			expected: "<test>&</test>",
		},
		{
			name:     "all with HTML characters",
			spec:     getTestSpecWithHTMLChars(),
			path:     "test.yaml",
			format:   "all",
			expected: "<test>&</test>",
		},
		{
			name:     "empty format with HTML characters",
			spec:     getTestSpecWithHTMLChars(),
			path:     "test.yaml",
			format:   "",
			expected: "<test>&</test>",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			fs := afero.NewMemMapFs()
			err := SaveToFile(tt.path, tt.format, tt.spec, fs)
			require.NoError(t, err)

			data, err := afero.ReadFile(fs, tt.path)
			require.NoError(t, err)
			assert.Contains(t, string(data), tt.expected)
		})
	}
}

func TestSaveToFile_All(t *testing.T) {
	fs := afero.NewMemMapFs()
	err := SaveToFile("test.yaml", "all", getTestSpecWithHTMLChars(), fs)
	require.NoError(t, err)

	// read yaml file
	data, err := afero.ReadFile(fs, "test.yaml")
	require.NoError(t, err)
	assert.Contains(t, string(data), "<test>&</test>")

	// read json file
	data, err = afero.ReadFile(fs, "test.json")
	require.NoError(t, err)
	assert.Contains(t, string(data), "<test>&</test>")
}

func getTestSpecWithHTMLChars() *Spec {
	return &Spec{
		Paths: openapi3.NewPaths(
			openapi3.WithPath(
				"/api/atlas/v2/groups/{groupId}/databaseUsers/{databaseName}/{username}",
				&openapi3.PathItem{
					Delete: &openapi3.Operation{
						Description: "<test>&</test>",
					},
				},
			),
		),
	}
}
