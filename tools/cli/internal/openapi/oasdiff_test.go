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
	"reflect"
	"testing"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/mongodb/openapi/tools/cli/internal/openapi/errors"
	"github.com/mongodb/openapi/tools/cli/internal/pointer"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/tufin/oasdiff/diff"
	"github.com/tufin/oasdiff/load"
	"github.com/tufin/oasdiff/utils"
	gomock "go.uber.org/mock/gomock"
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
		expectedTags  []*openapi3.Tag
	}{
		{
			name: "SuccessfulMerge",
			inputBase: &load.SpecInfo{
				Url: "base",
				Spec: &openapi3.T{
					Tags: []*openapi3.Tag{
						{
							Name:        "TagBase3",
							Description: "TagBase3",
						},
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
							Name:        "AWS Clusters DNS",
							Description: "AWS Clusters DNS",
						},

						{
							Name:        "Access Tracking",
							Description: "Access Tracking",
						},
					},
				},
				Version: "3.0.1",
			},
			wantErr: require.NoError,
			expectedTags: []*openapi3.Tag{
				{
					Name:        "Access Tracking",
					Description: "Access Tracking",
				},

				{
					Name:        "AWS Clusters DNS",
					Description: "AWS Clusters DNS",
				},
				{
					Name:        "TagBase1",
					Description: "TagBase1",
				},

				{
					Name:        "TagBase2",
					Description: "TagBase2",
				},
				{
					Name:        "TagBase3",
					Description: "TagBase3",
				},
			},
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
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			o := OasDiff{
				base:     tc.inputBase,
				external: tc.inputExternal,
			}
			tc.wantErr(t, o.mergeTags())
			if tc.expectedTags != nil {
				assert.Equal(t, len(o.base.Spec.Tags), len(tc.expectedTags))
				// check tag names are the same
				for i := range o.base.Spec.Tags {
					assert.Equal(t, o.base.Spec.Tags[i].Name, tc.expectedTags[i].Name)
				}
			}
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
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			o := OasDiff{
				base:     tc.inputBase,
				external: tc.inputExternal,
				result: &OasDiffResult{
					Report: tc.diff,
				},
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
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			o := OasDiff{
				base:     tc.inputBase,
				external: tc.inputExternal,
				result: &OasDiffResult{
					Report: tc.diff,
				},
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

func TestUpdateExternalRefResponses(t *testing.T) {
	tests := []struct {
		name     string
		input    map[string]*openapi3.ResponseRef
		expected map[string]*openapi3.ResponseRef
	}{
		{
			name:     "Nil responses",
			input:    nil,
			expected: nil,
		},
		{
			name:     "Empty responses",
			input:    map[string]*openapi3.ResponseRef{},
			expected: map[string]*openapi3.ResponseRef{},
		},
		{
			name: "Responses with external ref",
			input: map[string]*openapi3.ResponseRef{
				"200": {
					Ref: "openapi-mms.json#someRef",
				},
			},
			expected: map[string]*openapi3.ResponseRef{
				"200": {
					Ref: "#someRef",
				},
			},
		},
		{
			name: "Responses with internal Ref",
			input: map[string]*openapi3.ResponseRef{
				"200": {
					Ref: "#someRef",
				},
			},
			expected: map[string]*openapi3.ResponseRef{
				"200": {
					Ref: "#someRef",
				},
			},
		},
		{
			name: "Responses with nested Content with external ref",
			input: map[string]*openapi3.ResponseRef{
				"200": {
					Value: &openapi3.Response{
						Content: openapi3.Content{
							"application/json": &openapi3.MediaType{
								Schema: &openapi3.SchemaRef{
									Ref: "openapi-mms.json#nestedRef",
								},
							},
						},
					},
				},
			},
			expected: map[string]*openapi3.ResponseRef{
				"200": {
					Value: &openapi3.Response{
						Content: openapi3.Content{
							"application/json": &openapi3.MediaType{
								Schema: &openapi3.SchemaRef{
									Ref: "#nestedRef",
								},
							},
						},
					},
				},
			},
		},
		{
			name: "Responses with external ref to another OAS than openapi-mms.json",
			input: map[string]*openapi3.ResponseRef{
				"200": {
					Ref: "other.json#someRef",
				},
			},
			expected: map[string]*openapi3.ResponseRef{
				"200": {
					Ref: "#someRef",
				},
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			input := newResponseFromMap(t, tt.input)
			expected := newResponseFromMap(t, tt.expected)

			updateExternalRefResponses(input)
			if !reflect.DeepEqual(expected, input) {
				t.Errorf("expected %v, got %v", expected, input)
			}
		})
	}
}

func newResponseFromMap(t *testing.T, input map[string]*openapi3.ResponseRef) *openapi3.Responses {
	t.Helper()
	output := &openapi3.Responses{}

	for k, v := range input {
		output.Set(k, v)
	}

	return output
}

func TestUpdateExternalRefParams(t *testing.T) {
	tests := []struct {
		name     string
		input    *openapi3.Parameters
		expected *openapi3.Parameters
	}{
		{
			name:     "Nil Param",
			input:    nil,
			expected: nil,
		},
		{
			name:     "Empty Param",
			input:    &openapi3.Parameters{},
			expected: &openapi3.Parameters{},
		},
		{
			name: "Param with external ref#",
			input: &openapi3.Parameters{
				{
					Ref: "openapi-mms.json#someRef",
				},
			},
			expected: &openapi3.Parameters{
				{
					Ref: "#someRef",
				},
			},
		},
		{
			name: "Param with internal Ref",
			input: &openapi3.Parameters{
				{
					Ref: "#someRef",
				},
			},
			expected: &openapi3.Parameters{
				{
					Ref: "#someRef",
				},
			},
		},
		{
			name: "Param with nested Content with external Ref",
			input: &openapi3.Parameters{
				{
					Value: &openapi3.Parameter{
						Content: openapi3.Content{
							"application/json": &openapi3.MediaType{
								Schema: &openapi3.SchemaRef{
									Ref: "openapi-mms.json#nestedRef",
								},
							},
						},
					},
				},
			},
			expected: &openapi3.Parameters{
				{
					Value: &openapi3.Parameter{
						Content: openapi3.Content{
							"application/json": &openapi3.MediaType{
								Schema: &openapi3.SchemaRef{
									Ref: "#nestedRef",
								},
							},
						},
					},
				},
			},
		},
		{
			name: "Responses with external ref to another OAS than openapi-mms.json",
			input: &openapi3.Parameters{
				{
					Ref: "other.json#someRef",
				},
			},
			expected: &openapi3.Parameters{
				{
					Ref: "#someRef",
				},
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			updateExternalRefParams(tt.input)
			if !reflect.DeepEqual(tt.expected, tt.input) {
				t.Errorf("expected %v, got %v", tt.expected, tt.input)
			}
		})
	}
}

func TestUpdateExternalRefReqBody(t *testing.T) {
	tests := []struct {
		name     string
		input    *openapi3.RequestBodyRef
		expected *openapi3.RequestBodyRef
	}{
		{
			name:     "Nil request body",
			input:    nil,
			expected: nil,
		},
		{
			name: "Request body with external ref",
			input: &openapi3.RequestBodyRef{
				Ref: "openapi-mms.json#someRef",
			},
			expected: &openapi3.RequestBodyRef{
				Ref: "#someRef",
			},
		},
		{
			name: "Request body with nested Content with external ref",
			input: &openapi3.RequestBodyRef{
				Value: &openapi3.RequestBody{
					Content: openapi3.Content{
						"application/json": &openapi3.MediaType{
							Schema: &openapi3.SchemaRef{
								Ref: "openapi-mms.json#nestedRef",
							},
						},
					},
				},
			},
			expected: &openapi3.RequestBodyRef{
				Value: &openapi3.RequestBody{
					Content: openapi3.Content{
						"application/json": &openapi3.MediaType{
							Schema: &openapi3.SchemaRef{
								Ref: "#nestedRef",
							},
						},
					},
				},
			},
		},
		{
			name: "Request Body with external ref to another OAS than openapi-mms.json",
			input: &openapi3.RequestBodyRef{
				Ref: "other.json#someRef",
			},
			expected: &openapi3.RequestBodyRef{
				Ref: "#someRef",
			},
		},
		{
			name: "Request body with nil content",
			input: &openapi3.RequestBodyRef{
				Value: &openapi3.RequestBody{
					Content: nil,
				},
			},
			expected: &openapi3.RequestBodyRef{
				Value: &openapi3.RequestBody{
					Content: nil,
				},
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			updateExternalRefReqBody(tt.input)
			if !reflect.DeepEqual(tt.expected, tt.input) {
				t.Errorf("expected %v, got %v", tt.expected, tt.input)
			}
		})
	}
}

func TestHandlePathConflict(t *testing.T) {
	testCases := []struct {
		name          string
		basePath      *openapi3.PathItem
		basePathName  string
		specDiff      *diff.Diff
		expectedError error
	}{
		{
			name: "No Conflict - Identical Paths",
			basePath: &openapi3.PathItem{
				Get: &openapi3.Operation{
					Extensions: map[string]interface{}{
						"x-xgen-soa-migration": map[string]interface{}{
							"allowDocsDiff": "false",
						},
					},
				},
			},
			basePathName: "/test",
			specDiff: &diff.Diff{
				PathsDiff: &diff.PathsDiff{
					Modified: map[string]*diff.PathDiff{},
				},
			},
			expectedError: nil,
		},
		{
			name: "Conflict with AllowDocsDiff",
			basePath: &openapi3.PathItem{
				Get: &openapi3.Operation{
					Extensions: map[string]interface{}{
						"x-xgen-soa-migration": map[string]interface{}{
							"allowDocsDiff": "true",
						},
					},
				},
			},
			basePathName: "/test",
			specDiff: &diff.Diff{
				PathsDiff: &diff.PathsDiff{
					Modified: map[string]*diff.PathDiff{
						"/test": {
							OperationsDiff: &diff.OperationsDiff{
								Modified: diff.ModifiedOperations{
									"get": {
										TagsDiff: &diff.StringsDiff{
											Added: utils.StringList{"tag1"},
										},
									},
								},
							},
						},
					},
				},
			},
			expectedError: errors.AllowDocsDiffNotSupportedError{
				Entry: "/test",
			},
		},
		{
			name: "Conflict with Different Operations",
			basePath: &openapi3.PathItem{
				Get: &openapi3.Operation{
					Extensions: map[string]interface{}{
						"x-xgen-soa-migration": map[string]interface{}{
							"allowDocsDiff": "false",
						},
					},
				},
			},
			basePathName: "/test",
			specDiff: &diff.Diff{
				PathsDiff: &diff.PathsDiff{
					Modified: map[string]*diff.PathDiff{
						"/test": {
							OperationsDiff: &diff.OperationsDiff{
								Added:   utils.StringList{"get"},
								Deleted: utils.StringList{},
							},
						},
					},
				},
			},
			expectedError: errors.PathConflictError{
				Entry: "/test",
			},
		},
		{
			name: "Conflict with Different Path Operation",
			basePath: &openapi3.PathItem{
				Get: &openapi3.Operation{
					Extensions: map[string]interface{}{
						"x-xgen-soa-migration": map[string]interface{}{
							"allowDocsDiff": "false",
						},
					},
				},
			},
			basePathName: "/test",
			specDiff: &diff.Diff{
				PathsDiff: &diff.PathsDiff{
					Modified: map[string]*diff.PathDiff{
						"/test": {
							OperationsDiff: &diff.OperationsDiff{
								Modified: diff.ModifiedOperations{
									"get": {
										TagsDiff: &diff.StringsDiff{
											Added: utils.StringList{"tag1"},
										},
									},
								},
							},
						},
					},
				},
			},
			expectedError: errors.PathDocsDiffConflictError{
				Entry: "/test",
				Diff: &diff.Diff{
					PathsDiff: &diff.PathsDiff{
						Modified: map[string]*diff.PathDiff{
							"/test": {
								OperationsDiff: &diff.OperationsDiff{
									Modified: diff.ModifiedOperations{
										"get": {
											TagsDiff: &diff.StringsDiff{
												Added: utils.StringList{"tag1"},
											},
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
			name: "Identical Paths with Extensions",
			basePath: &openapi3.PathItem{
				Get: &openapi3.Operation{
					Extensions: map[string]interface{}{
						"x-xgen-soa-migration": map[string]interface{}{
							"allowDocsDiff": "false",
						},
					},
				},
			},
			basePathName: "/test",
			specDiff: &diff.Diff{
				PathsDiff: &diff.PathsDiff{
					Modified: map[string]*diff.PathDiff{},
				},
			},
			expectedError: nil,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			ctrl := gomock.NewController(t)
			mockDiffGetter := NewMockDiffGetter(ctrl)
			o := OasDiff{
				base: &load.SpecInfo{
					Spec: &openapi3.T{
						Paths: &openapi3.Paths{},
					},
				},
				external: &load.SpecInfo{
					Spec: &openapi3.T{
						Paths: &openapi3.Paths{},
					},
				},
				result: &OasDiffResult{
					Report: tc.specDiff,
				},
				diffGetter: mockDiffGetter,
			}

			mockDiffGetter.
				EXPECT().
				GetWithOperationsSourcesMap(o.config, o.base.Spec, o.external.Spec).
				Return(tc.specDiff, nil, nil).
				AnyTimes()

			mockDiffGetter.
				EXPECT().
				Get(gomock.Any(), o.base.Spec, o.external.Spec).
				Return(tc.specDiff, nil).
				AnyTimes()

			err := o.handlePathConflict(tc.basePath, tc.basePathName)
			if tc.expectedError != nil {
				require.Error(t, err)
				assert.IsType(t, tc.expectedError, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}
