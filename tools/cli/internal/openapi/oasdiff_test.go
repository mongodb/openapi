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

	"github.com/stretchr/testify/require"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/mongodb/openapi/tools/cli/internal/pointer"
	"github.com/tufin/oasdiff/diff"
	"github.com/tufin/oasdiff/load"
)

func TestOasDiff_mergePaths(t *testing.T) {
	testCases := []struct {
		inputBase     *load.SpecInfo
		inputExternal *load.SpecInfo
		wantErr       require.ErrorAssertionFunc
		name          string
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
			wantErr: require.NoError,
		},
		{
			name: "SuccessfulMergeWithEmptyPaths",
			inputBase: &load.SpecInfo{
				Url: "base",
				Spec: &openapi3.T{
					Paths: nil,
				},
				Version: "3.0.1",
			},
			inputExternal: &load.SpecInfo{
				Url: "external",
				Spec: &openapi3.T{
					Paths: nil,
				},
				Version: "3.0.1",
			},
			wantErr: require.NoError,
		},
		{
			name: "SuccessfulMergeWithEmptyBasePaths",
			inputBase: &load.SpecInfo{
				Url: "base",
				Spec: &openapi3.T{
					Paths: nil,
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
			wantErr: require.NoError,
		},
		{
			name: "SuccessfulMergeWithEmptyExternalPaths",
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
					Paths: nil,
				},
				Version: "3.0.1",
			},
			wantErr: require.NoError,
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
			wantErr: require.Error,
		},
	}

	for _, tc := range testCases {
		tc := tc // https://gist.github.com/posener/92a55c4cd441fc5e5e85f27bca008721#what-happened
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			o := OasDiff{
				base:     tc.inputBase,
				external: tc.inputExternal,
			}
			tc.wantErr(t, o.mergePaths())
		})
	}
}

func TestOasDiff_mergeTags(t *testing.T) {
	testCases := []struct {
		inputBase     *load.SpecInfo
		inputExternal *load.SpecInfo
		wantErr       require.ErrorAssertionFunc
		name          string
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
			wantErr: require.NoError,
		},
		{
			name: "SuccessfulMergeEmptyTags",
			inputBase: &load.SpecInfo{
				Url: "base",
				Spec: &openapi3.T{
					Tags: nil,
				},
				Version: "3.0.1",
			},
			inputExternal: &load.SpecInfo{
				Url: "external",
				Spec: &openapi3.T{
					Tags: nil,
				},
				Version: "3.0.1",
			},
			wantErr: require.NoError,
		},
		{
			name: "SuccessfulMergeEmptyBaseTags",
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
			wantErr: require.NoError,
		},
		{
			name: "SuccessfulMergeEmptyExternalTags",
			inputBase: &load.SpecInfo{
				Url: "base",
				Spec: &openapi3.T{
					Tags: nil,
				},
				Version: "3.0.1",
			},
			inputExternal: &load.SpecInfo{
				Url: "external",
				Spec: &openapi3.T{
					Tags: nil,
				},
				Version: "3.0.1",
			},
			wantErr: require.NoError,
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
			wantErr: require.Error,
		},
	}

	for _, tc := range testCases {
		tc := tc // https://gist.github.com/posener/92a55c4cd441fc5e5e85f27bca008721#what-happened
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			o := OasDiff{
				base:     tc.inputBase,
				external: tc.inputExternal,
			}
			tc.wantErr(t, o.mergeTags())
		})
	}
}

func TestOasDiff_mergeResponses(t *testing.T) {
	testCases := []struct {
		inputBase     *load.SpecInfo
		inputExternal *load.SpecInfo
		wantErr       require.ErrorAssertionFunc
		diff          *diff.Diff
		name          string
	}{
		{
			name: "SuccessfulMergeWithEmptyResponses",
			diff: &diff.Diff{},
			inputBase: &load.SpecInfo{
				Url: "base",
				Spec: &openapi3.T{
					Components: &openapi3.Components{
						Responses: nil,
					},
				},
				Version: "3.0.1",
			},
			inputExternal: &load.SpecInfo{
				Url: "external",
				Spec: &openapi3.T{
					Components: &openapi3.Components{
						Responses: nil,
					},
				},
				Version: "3.0.1",
			},
			wantErr: require.NoError,
		},
		{
			name: "SuccessfulMergeWithEmpyBaseResponses",
			diff: &diff.Diff{},
			inputBase: &load.SpecInfo{
				Url: "base",
				Spec: &openapi3.T{
					Components: &openapi3.Components{
						Responses: openapi3.ResponseBodies{},
					},
				},
				Version: "3.0.1",
			},
			inputExternal: &load.SpecInfo{
				Url: "external",
				Spec: &openapi3.T{
					Components: &openapi3.Components{
						Responses: map[string]*openapi3.ResponseRef{
							"external": {
								Value: &openapi3.Response{
									Description: pointer.Get("external"),
								},
							},
						},
					},
				},
				Version: "3.0.1",
			},
			wantErr: require.NoError,
		},
		{
			name: "SuccessfulMergeWithEmpyExternalResponses",
			diff: &diff.Diff{},
			inputBase: &load.SpecInfo{
				Url: "base",
				Spec: &openapi3.T{
					Components: &openapi3.Components{
						Responses: map[string]*openapi3.ResponseRef{
							"base": {
								Value: &openapi3.Response{
									Description: pointer.Get("base"),
								},
							},
						},
					},
				},
				Version: "3.0.1",
			},
			inputExternal: &load.SpecInfo{
				Url: "external",
				Spec: &openapi3.T{
					Components: &openapi3.Components{
						Responses: openapi3.ResponseBodies{},
					},
				},
				Version: "3.0.1",
			},
			wantErr: require.NoError,
		},
		{
			name: "SuccessfulMergeIdenticalResponses",
			diff: &diff.Diff{
				ComponentsDiff: diff.ComponentsDiff{
					ResponsesDiff: &diff.ResponsesDiff{
						Modified: map[string]*diff.ResponseDiff{},
					},
				},
			},
			inputBase: &load.SpecInfo{
				Url: "base",
				Spec: &openapi3.T{
					Components: &openapi3.Components{
						Responses: map[string]*openapi3.ResponseRef{
							"external1": {
								Value: &openapi3.Response{
									Description: pointer.Get("external1"),
								},
							},
							"external2": {
								Value: &openapi3.Response{
									Description: pointer.Get("external2"),
								},
							},
						},
					},
				},
				Version: "3.0.1",
			},
			inputExternal: &load.SpecInfo{
				Url: "external",
				Spec: &openapi3.T{
					Components: &openapi3.Components{
						Responses: map[string]*openapi3.ResponseRef{
							"external1": {
								Value: &openapi3.Response{
									Description: pointer.Get("external1"),
								},
							},
							"external2": {
								Value: &openapi3.Response{
									Description: pointer.Get("external2"),
								},
							},
						},
					},
				},
				Version: "3.0.1",
			},
			wantErr: require.NoError,
		},
		{
			name: "SuccessfulMerge",
			inputBase: &load.SpecInfo{
				Url: "base",
				Spec: &openapi3.T{
					Components: &openapi3.Components{
						Responses: map[string]*openapi3.ResponseRef{
							"base": {
								Value: &openapi3.Response{
									Description: pointer.Get("base"),
								},
							},
						},
					},
				},
				Version: "3.0.1",
			},
			inputExternal: &load.SpecInfo{
				Url: "external",
				Spec: &openapi3.T{
					Components: &openapi3.Components{
						Responses: map[string]*openapi3.ResponseRef{
							"external1": {
								Value: &openapi3.Response{
									Description: pointer.Get("external1"),
								},
							},
							"external2": {
								Value: &openapi3.Response{
									Description: pointer.Get("external2"),
								},
							},
						},
					},
				},
				Version: "3.0.1",
			},
			wantErr: require.NoError,
		},
		{
			name: "SuccessfulMergeWithNoIdenticalResponses",
			diff: &diff.Diff{
				ComponentsDiff: diff.ComponentsDiff{
					ResponsesDiff: &diff.ResponsesDiff{
						Modified: map[string]*diff.ResponseDiff{
							"external1": {Base: nil},
							"external2": {Base: nil},
						},
					},
				},
			},
			inputBase: &load.SpecInfo{
				Url: "base",
				Spec: &openapi3.T{
					Components: &openapi3.Components{
						Responses: map[string]*openapi3.ResponseRef{
							"external1": {
								Value: &openapi3.Response{
									Description: pointer.Get("external1"),
								},
							},
							"external2": {
								Value: &openapi3.Response{
									Description: pointer.Get("external2"),
								},
							},
						},
					},
				},
				Version: "3.0.1",
			},
			inputExternal: &load.SpecInfo{
				Url: "external",
				Spec: &openapi3.T{
					Components: &openapi3.Components{
						Responses: map[string]*openapi3.ResponseRef{
							"external1": {
								Value: &openapi3.Response{
									Description: pointer.Get("external1"),
								},
							},
							"external2": {
								Value: &openapi3.Response{
									Description: pointer.Get("external2"),
								},
							},
						},
					},
				},
				Version: "3.0.1",
			},
			wantErr: require.Error,
		},
	}

	for _, tc := range testCases {
		tc := tc // https://gist.github.com/posener/92a55c4cd441fc5e5e85f27bca008721#what-happened
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			o := OasDiff{
				base:     tc.inputBase,
				external: tc.inputExternal,
				specDiff: tc.diff,
			}
			tc.wantErr(t, o.mergeResponses())
		})
	}
}

func TestOasDiff_mergeSchemas(t *testing.T) {
	testCases := []struct {
		inputBase     *load.SpecInfo
		inputExternal *load.SpecInfo
		wantErr       require.ErrorAssertionFunc
		diff          *diff.Diff
		name          string
	}{
		{
			name: "SuccessfulMergeWithEmptySchemas",
			diff: &diff.Diff{},
			inputBase: &load.SpecInfo{
				Url: "base",
				Spec: &openapi3.T{
					Components: &openapi3.Components{
						Schemas: nil,
					},
				},
				Version: "3.0.1",
			},
			inputExternal: &load.SpecInfo{
				Url: "external",
				Spec: &openapi3.T{
					Components: &openapi3.Components{
						Schemas: nil,
					},
				},
				Version: "3.0.1",
			},
			wantErr: require.NoError,
		},
		{
			name: "SuccessfulMergeWithEmpyBaseSchema",
			diff: &diff.Diff{},
			inputBase: &load.SpecInfo{
				Url: "base",
				Spec: &openapi3.T{
					Components: &openapi3.Components{
						Schemas: openapi3.Schemas{},
					},
				},
				Version: "3.0.1",
			},
			inputExternal: &load.SpecInfo{
				Url: "external",
				Spec: &openapi3.T{
					Components: &openapi3.Components{
						Schemas: openapi3.Schemas{
							"ext1": {
								Value: &openapi3.Schema{Description: "ext1"},
							},
						},
					},
				},
				Version: "3.0.1",
			},
			wantErr: require.NoError,
		},
		{
			name: "SuccessfulMergeWithEmpyExternalSchema",
			diff: &diff.Diff{},
			inputBase: &load.SpecInfo{
				Url: "base",
				Spec: &openapi3.T{
					Components: &openapi3.Components{
						Schemas: openapi3.Schemas{
							"base1": {
								Value: &openapi3.Schema{Description: "base1"},
							},
						},
					},
				},
				Version: "3.0.1",
			},
			inputExternal: &load.SpecInfo{
				Url: "external",
				Spec: &openapi3.T{
					Components: &openapi3.Components{
						Schemas: openapi3.Schemas{},
					},
				},
				Version: "3.0.1",
			},
			wantErr: require.NoError,
		},
		{
			name: "SuccessfulMergeIdenticalSchemas",
			diff: &diff.Diff{
				ComponentsDiff: diff.ComponentsDiff{
					SchemasDiff: &diff.SchemasDiff{
						Modified: map[string]*diff.SchemaDiff{},
					},
				},
			},
			inputBase: &load.SpecInfo{
				Url: "base",
				Spec: &openapi3.T{
					Components: &openapi3.Components{
						Schemas: openapi3.Schemas{
							"base1": {
								Value: &openapi3.Schema{Description: "base1"},
							},
						},
					},
				},
				Version: "3.0.1",
			},
			inputExternal: &load.SpecInfo{
				Url: "external",
				Spec: &openapi3.T{
					Components: &openapi3.Components{
						Schemas: openapi3.Schemas{
							"base1": {
								Value: &openapi3.Schema{Description: "base1"},
							},
						},
					},
				},
				Version: "3.0.1",
			},
			wantErr: require.NoError,
		},
		{
			name: "SuccessfulMerge",
			inputBase: &load.SpecInfo{
				Url: "base",
				Spec: &openapi3.T{
					Components: &openapi3.Components{
						Responses: map[string]*openapi3.ResponseRef{
							"base": {
								Value: &openapi3.Response{
									Description: pointer.Get("base"),
								},
							},
						},
					},
				},
				Version: "3.0.1",
			},
			inputExternal: &load.SpecInfo{
				Url: "external",
				Spec: &openapi3.T{
					Components: &openapi3.Components{
						Responses: map[string]*openapi3.ResponseRef{
							"external1": {
								Value: &openapi3.Response{
									Description: pointer.Get("external1"),
								},
							},
							"external2": {
								Value: &openapi3.Response{
									Description: pointer.Get("external2"),
								},
							},
						},
					},
				},
				Version: "3.0.1",
			},
			wantErr: require.NoError,
		},
		{
			name: "SuccessfulMergeWithNoIdenticalResponses",
			diff: &diff.Diff{
				ComponentsDiff: diff.ComponentsDiff{
					SchemasDiff: &diff.SchemasDiff{
						Modified: map[string]*diff.SchemaDiff{
							"base1": {Base: nil},
							"base2": {Base: nil},
						},
					},
				},
			},
			inputBase: &load.SpecInfo{
				Url: "base",
				Spec: &openapi3.T{
					Components: &openapi3.Components{
						Schemas: openapi3.Schemas{
							"base1": {
								Value: &openapi3.Schema{Description: "base1"},
							},
							"base2": {
								Value: &openapi3.Schema{Description: "base1"},
							},
						},
					},
				},
				Version: "3.0.1",
			},
			inputExternal: &load.SpecInfo{
				Url: "external",
				Spec: &openapi3.T{
					Components: &openapi3.Components{
						Schemas: openapi3.Schemas{
							"base1": {
								Value: &openapi3.Schema{Description: "base1"},
							},
							"base2": {
								Value: &openapi3.Schema{Description: "base1"},
							},
						},
					},
				},
				Version: "3.0.1",
			},
			wantErr: require.Error,
		},
	}

	for _, tc := range testCases {
		tc := tc // https://gist.github.com/posener/92a55c4cd441fc5e5e85f27bca008721#what-happened
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			o := OasDiff{
				base:     tc.inputBase,
				external: tc.inputExternal,
				specDiff: tc.diff,
			}
			tc.wantErr(t, o.mergeSchemas())
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
