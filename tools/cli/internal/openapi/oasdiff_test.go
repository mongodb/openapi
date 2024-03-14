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

package openapi

import (
	"testing"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/tufin/oasdiff/load"
)

func Test_MergePaths(t *testing.T) {
	testCases := []struct {
		inputBase     *load.SpecInfo
		inputExternal *load.SpecInfo
		name          string
		error         bool
	}{
		{
			name: "SuccessfulMerge",
			inputBase: &load.SpecInfo{
				Url: "base",
				Spec: &openapi3.T{
					Paths: newBaseSpecPaths(t),
				},
				Version: "3.0.1",
			},
			inputExternal: &load.SpecInfo{
				Url: "external",
				Spec: &openapi3.T{
					Paths: newExternalSpecPaths(t),
				},
				Version: "3.0.1",
			},
			error: false,
		},
		{
			name: "FailedMerge",
			inputBase: &load.SpecInfo{
				Url: "base",
				Spec: &openapi3.T{
					Paths: newBaseSpecPaths(t),
				},
				Version: "3.0.1",
			},
			inputExternal: &load.SpecInfo{
				Url: "external",
				Spec: &openapi3.T{
					Paths: newBaseSpecPaths(t),
				},
				Version: "3.0.1",
			},
			error: true,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			o := OasDiff{
				base:     tc.inputBase,
				external: tc.inputExternal,
			}
			err := o.mergePaths()
			if err != nil && !tc.error {
				t.Errorf("No error expected but got the error %v", err)
			}
		})
	}
}

func Test_MergeTags(t *testing.T) {
	testCases := []struct {
		inputBase     *load.SpecInfo
		inputExternal *load.SpecInfo
		name          string
		error         bool
	}{
		{
			name: "SuccessfulMerge",
			inputBase: &load.SpecInfo{
				Url: "base",
				Spec: &openapi3.T{
					Tags: []*openapi3.Tag{
						{
							Name:        "TagBase1",
							Description: "TagBase1",
						},

						{
							Name:        "TagBase2",
							Description: "TagBase2",
						},
					},
				},
				Version: "3.0.1",
			},
			inputExternal: &load.SpecInfo{
				Url: "external",
				Spec: &openapi3.T{
					Tags: []*openapi3.Tag{
						{
							Name:        "Tag1",
							Description: "Tag1",
						},

						{
							Name:        "Tag2",
							Description: "Tag2",
						},
					},
				},
				Version: "3.0.1",
			},
			error: false,
		},
		{
			name: "FailedMerge",
			inputBase: &load.SpecInfo{
				Url: "base",
				Spec: &openapi3.T{
					Tags: []*openapi3.Tag{
						{
							Name:        "TagBase1",
							Description: "TagBase1",
						},

						{
							Name:        "TagBase2",
							Description: "TagBase2",
						},
					},
				},
				Version: "3.0.1",
			},
			inputExternal: &load.SpecInfo{
				Url: "external",
				Spec: &openapi3.T{
					Tags: []*openapi3.Tag{
						{
							Name:        "TagBase1",
							Description: "TagBase1",
						},

						{
							Name:        "TagBase2",
							Description: "TagBase2",
						},
					},
				},
				Version: "3.0.1",
			},
			error: true,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			o := OasDiff{
				base:     tc.inputBase,
				external: tc.inputExternal,
			}
			err := o.mergeTags()
			if err != nil && !tc.error {
				t.Errorf("No error expected but got the error %v", err)
			}
		})
	}
}

func newBaseSpecPaths(t *testing.T) *openapi3.Paths {
	t.Helper()
	inputPath := &openapi3.Paths{}
	inputPath.Set("pathBase1", &openapi3.PathItem{
		Extensions:  nil,
		Ref:         "",
		Summary:     "pathBase1",
		Description: "pathBase1Description",
	})

	inputPath.Set("pathBase2", &openapi3.PathItem{
		Extensions:  nil,
		Ref:         "",
		Summary:     "pathBase2",
		Description: "pathBase2Description",
		Put: &openapi3.Operation{
			Tags: []string{"tag1"},
		},
	})
	return inputPath
}

func newExternalSpecPaths(t *testing.T) *openapi3.Paths {
	t.Helper()
	inputPath := &openapi3.Paths{}
	inputPath.Set("path1", &openapi3.PathItem{
		Extensions:  nil,
		Ref:         "",
		Summary:     "path1",
		Description: "path1Description",
	})

	inputPath.Set("path2", &openapi3.PathItem{
		Extensions:  nil,
		Ref:         "",
		Summary:     "path2",
		Description: "path2Description",
		Put: &openapi3.Operation{
			Tags: []string{"tag2"},
		},
	})
	return inputPath
}
