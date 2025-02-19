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

package apiversion

import (
	"testing"
	"time"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestParseVersion(t *testing.T) {
	testCases := []struct {
		name          string
		contentType   string
		expectedMatch string
		wantErr       bool
	}{
		{
			name:          "json",
			contentType:   "application/vnd.atlas.2023-01-01+json",
			expectedMatch: "2023-01-01",
			wantErr:       false,
		},
		{
			name:          "csv",
			contentType:   "application/vnd.atlas.2023-01-02+csv",
			expectedMatch: "2023-01-02",
			wantErr:       false,
		},
		{
			name:          "yaml",
			contentType:   "application/vnd.atlas.2030-02-20+yaml",
			expectedMatch: "2030-02-20",
			wantErr:       false,
		},
		{
			name:          "preview_json",
			contentType:   "application/vnd.atlas.preview+json",
			expectedMatch: "preview",
			wantErr:       false,
		},
		{
			name:          "preview_yaml",
			contentType:   "application/vnd.atlas.preview+yaml",
			expectedMatch: "preview",
			wantErr:       false,
		},
		{
			name:          "preview_csv",
			contentType:   "application/vnd.atlas.preview+csv",
			expectedMatch: "preview",
			wantErr:       false,
		},
		{
			name:          "invalid",
			contentType:   "application/vnd.test.2023-01-01",
			expectedMatch: "",
			wantErr:       true,
		},
	}

	for _, tt := range testCases {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			match, err := Parse(tt.contentType)
			if tt.wantErr {
				assert.Error(t, err)
			} else {
				assert.Equal(t, tt.expectedMatch, match)
			}
		})
	}
}

func TestNewAPIVersionFromContentType(t *testing.T) {
	testCases := []struct {
		name          string
		contentType   string
		expectedMatch string
		wantErr       bool
	}{
		{
			name:          "json",
			contentType:   "application/vnd.atlas.2023-01-01+json",
			expectedMatch: "2023-01-01",
			wantErr:       false,
		},
		{
			name:          "csv",
			contentType:   "application/vnd.atlas.2023-01-02+csv",
			expectedMatch: "2023-01-02",
			wantErr:       false,
		},
		{
			name:          "yaml",
			contentType:   "application/vnd.atlas.2030-02-20+yaml",
			expectedMatch: "2030-02-20",
			wantErr:       false,
		},
		{
			name:          "preview",
			contentType:   "application/vnd.atlas.preview+json",
			expectedMatch: "preview",
			wantErr:       false,
		},
		{
			name:          "invalid",
			contentType:   "application/vnd.test.2023-01-01",
			expectedMatch: "",
			wantErr:       true,
		},
		{
			name:          "notVersioned",
			contentType:   "application/json",
			expectedMatch: "",
			wantErr:       true,
		},
		{
			name:          "empty",
			contentType:   "",
			expectedMatch: "",
			wantErr:       true,
		},
		{
			name:          "invalidFormat",
			contentType:   "application/vnd.atlas.2023-01-01",
			expectedMatch: "",
			wantErr:       true,
		},
		{
			name:          "invalidDate",
			contentType:   "application/vnd.atlas.2023111-01-01",
			expectedMatch: "",
			wantErr:       true,
		},
	}

	for _, tt := range testCases {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			version, err := New(withContent(tt.contentType))
			if tt.wantErr {
				assert.Error(t, err)
			} else {
				assert.Equal(t, tt.expectedMatch, version.String())
			}
		})
	}
}

func TestApiVersion_WithFullContent(t *testing.T) {
	testCases := []struct {
		name          string
		contentType   string
		contentValue  *openapi3.MediaType
		expectedMatch string
		wantErr       bool
	}{
		{
			name:          "json",
			contentType:   "application/vnd.atlas.2023-01-01+json",
			contentValue:  &openapi3.MediaType{},
			expectedMatch: "2023-01-01",
			wantErr:       false,
		},
		{
			name:         "csv",
			contentType:  "application/vnd.atlas.2023-01-02+csv",
			contentValue: &openapi3.MediaType{},

			expectedMatch: "2023-01-02",
			wantErr:       false,
		},
		{
			name:          "yaml",
			contentType:   "application/vnd.atlas.2030-02-20+yaml",
			contentValue:  &openapi3.MediaType{},
			expectedMatch: "2030-02-20",
			wantErr:       false,
		},
		{
			name: "invalid",

			contentType:   "application/vnd.test.2023-01-01",
			contentValue:  &openapi3.MediaType{},
			expectedMatch: "",
			wantErr:       true,
		},
		{
			name:          "notVersioned",
			contentType:   "application/json",
			contentValue:  &openapi3.MediaType{},
			expectedMatch: "",
			wantErr:       true,
		},
		{
			name:          "empty",
			contentType:   "",
			contentValue:  &openapi3.MediaType{},
			expectedMatch: "",
			wantErr:       true,
		},
		{
			name:          "invalidFormat",
			contentType:   "application/vnd.atlas.2023-01-01",
			expectedMatch: "",
			contentValue:  &openapi3.MediaType{},
			wantErr:       true,
		},
		{
			name:          "invalidDate",
			contentType:   "application/vnd.atlas.2023111-01-01",
			expectedMatch: "",
			contentValue:  &openapi3.MediaType{},
			wantErr:       true,
		},

		{
			name:        "preview",
			contentType: "application/vnd.atlas.preview+json",
			contentValue: &openapi3.MediaType{
				Extensions: map[string]any{
					"x-xgen-preview": map[string]any{
						"public": "true",
					},
				},
			},
			expectedMatch: "preview",
			wantErr:       false,
		},
		{
			name:        "private-preview",
			contentType: "application/vnd.atlas.preview+json",
			contentValue: &openapi3.MediaType{
				Extensions: map[string]any{
					"x-xgen-preview": map[string]any{
						"name": "feature",
					},
				},
			},
			expectedMatch: "private-preview-feature",
			wantErr:       false,
		},
		{
			name:        "invalid-preview",
			contentType: "application/vnd.atlas.preview+json",
			contentValue: &openapi3.MediaType{
				Extensions: map[string]any{
					"x-xgen-preview": map[string]any{
						"public": "true",
						"name":   "feature",
					},
				},
			},
			expectedMatch: "private-preview-feature",
			wantErr:       true,
		},
		{
			name:          "invalid-preview",
			contentType:   "application/vnd.atlas.preview+json",
			contentValue:  &openapi3.MediaType{},
			expectedMatch: "preview",
			wantErr:       true,
		},
	}

	for _, tt := range testCases {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			version, err := New(WithFullContent(tt.contentType, tt.contentValue))
			if tt.wantErr {
				assert.Error(t, err)
			} else {
				require.NoError(t, err)
				assert.Equal(t, tt.expectedMatch, version.String())
			}
		})
	}
}

func TestApiVersion_GreaterThan(t *testing.T) {
	testCases := []struct {
		name     string
		version1 string
		version2 string
		expected bool
	}{
		{
			name:     "greater",
			version1: "2023-01-02",
			version2: "2023-01-01",
			expected: true,
		},
		{
			name:     "not greater",
			version1: "2023-01-01",
			version2: "2023-01-02",
			expected: false,
		},
	}

	for _, tt := range testCases {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			v1, _ := New(WithVersion(tt.version1))
			v2, _ := New(WithVersion(tt.version2))
			assert.Equal(t, tt.expected, v1.GreaterThan(v2))
		})
	}
}

func TestApiVersion_LessThan(t *testing.T) {
	testCases := []struct {
		name     string
		version1 string
		version2 string
		expected bool
	}{
		{
			name:     "less",
			version1: "2023-01-01",
			version2: "2023-01-02",
			expected: true,
		},
		{
			name:     "not less",
			version1: "2023-01-02",
			version2: "2023-01-01",
			expected: false,
		},
	}

	for _, tt := range testCases {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			v1, _ := New(WithVersion(tt.version1))
			v2, _ := New(WithVersion(tt.version2))
			assert.Equal(t, tt.expected, v1.LessThan(v2))
		})
	}
}

func TestApiVersion_IsZero(t *testing.T) {
	testCases := []struct {
		name     string
		version  string
		expected bool
	}{
		{
			name:     "not zero",
			version:  "2023-01-01",
			expected: false,
		},
		{
			name:     "zero",
			version:  "",
			expected: true,
		},
	}

	for _, tt := range testCases {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			v, _ := New(WithVersion(tt.version))
			assert.Equal(t, tt.expected, v.IsZero())
		})
	}
}

func TestApiVersion_String(t *testing.T) {
	testCases := []struct {
		name     string
		version  string
		expected string
	}{
		{
			name:     "2023-01-01",
			version:  "2023-01-01",
			expected: "2023-01-01",
		},
		{
			name:     "2023-01-02",
			version:  "2023-01-02",
			expected: "2023-01-02",
		},
		{
			name:     "2030-02-20",
			version:  "2030-02-20",
			expected: "2030-02-20",
		},
	}

	for _, tt := range testCases {
		t.Run(tt.name, func(t *testing.T) {
			v, _ := New(WithVersion(tt.version))
			assert.Equal(t, tt.expected, v.String())
		})
	}
}

func TestApiVersion_Equal(t *testing.T) {
	testCases := []struct {
		name     string
		version1 string
		version2 string
		expected bool
	}{
		{
			name:     "equal",
			version1: "2023-01-01",
			version2: "2023-01-01",
			expected: true,
		},
		{
			name:     "not equal",
			version1: "2023-01-01",
			version2: "2023-01-02",
			expected: false,
		},
	}

	for _, tt := range testCases {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			v1, _ := New(WithVersion(tt.version1))
			v2, _ := New(WithVersion(tt.version2))
			assert.Equal(t, tt.expected, v1.Equal(v2))
		})
	}
}

func TestNewAPIVersionFromTime(t *testing.T) {
	testCases := []struct {
		name          string
		time          string
		expectedMatch string
		wantErr       bool
	}{
		{
			name:          "2023-01-01",
			time:          "2023-01-01",
			expectedMatch: "2023-01-01",
			wantErr:       false,
		},
		{
			name:          "2023-01-02",
			time:          "2023-01-02",
			expectedMatch: "2023-01-02",
			wantErr:       false,
		},
		{
			name:          "2030-02-20",
			time:          "2030-02-20",
			expectedMatch: "2030-02-20",
			wantErr:       false,
		},
	}

	for _, tt := range testCases {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			timeValue, _ := time.Parse("2006-01-02", tt.time)
			match, err := New(WithDate(timeValue))
			if tt.wantErr {
				assert.Error(t, err)
			} else {
				assert.Equal(t, tt.expectedMatch, match.String())
			}
		})
	}
}

func TestNewVersionDate(t *testing.T) {
	testCases := []struct {
		name          string
		version       string
		expectedMatch string
		wantErr       require.ErrorAssertionFunc
	}{
		{
			name:          "2023-01-01",
			version:       "2023-01-01",
			expectedMatch: "2023-01-01",
			wantErr:       require.NoError,
		},
		{
			name:          "2023-01-02",
			version:       "2023-01-02",
			expectedMatch: "2023-01-02",
			wantErr:       require.NoError,
		},
		{
			name:          "2030-02-20",
			version:       "2030-02-20",
			expectedMatch: "2030-02-20",
			wantErr:       require.NoError,
		},
	}

	for _, tt := range testCases {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			match, err := DateFromVersion(tt.version)
			tt.wantErr(t, err)
			assert.Equal(t, tt.expectedMatch, match.Format(dateFormat))
		})
	}
}

func TestNew_WithVersion(t *testing.T) {
	testCases := []struct {
		name          string
		version       string
		expectedMatch string
		wantErr       require.ErrorAssertionFunc
	}{
		{
			name:          "2023-01-01",
			version:       "2023-01-01",
			expectedMatch: "2023-01-01",
			wantErr:       require.NoError,
		},
		{
			name:          "2023-01-02",
			version:       "2023-01-02",
			expectedMatch: "2023-01-02",
			wantErr:       require.NoError,
		},
		{
			name:          "2030-02-20",
			version:       "2030-02-20",
			expectedMatch: "2030-02-20",
			wantErr:       require.NoError,
		},
	}

	for _, tt := range testCases {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			match, err := New(WithVersion(tt.version))
			tt.wantErr(t, err)
			assert.Equal(t, tt.expectedMatch, match.String())
		})
	}
}

func TestFindLatestContentVersionMatched(t *testing.T) {
	testCases := []struct {
		name          string
		targetVersion string
		expectedMatch string
	}{
		{
			name:          "exact match 2023-01-01",
			targetVersion: "2023-01-01",
			expectedMatch: "2023-01-01",
		},
		{
			name:          "exact match preview",
			targetVersion: "preview",
			expectedMatch: "preview",
		},
		{
			name:          "exact match private-preview-feature",
			targetVersion: "private-preview-feature",
			expectedMatch: "private-preview-feature",
		},
		{
			name:          "exact match 2023-11-15",
			targetVersion: "2023-11-15",
			expectedMatch: "2023-11-15",
		},
		{
			name:          "exact match 2024-05-30",
			targetVersion: "2024-05-30",
			expectedMatch: "2024-05-30",
		},
		{
			name:          "approx match 2023-01-01",
			targetVersion: "2023-01-02",
			expectedMatch: "2023-01-01",
		},
		{
			name:          "approx match 2023-01-01",
			targetVersion: "2023-01-31",
			expectedMatch: "2023-01-01",
		},
		{
			name:          "approx match 2023-02-01",
			targetVersion: "2023-02-20",
			expectedMatch: "2023-02-01",
		},
		{
			name:          "future date",
			targetVersion: "2030-02-20",
			expectedMatch: "2024-05-30",
		},
		{
			name:          "past date",
			targetVersion: "1999-02-20",
			expectedMatch: "1999-02-20",
		},
	}

	for _, tt := range testCases {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			targetVersion, err := New(WithVersion(tt.targetVersion))
			require.NoError(t, err)
			r := FindLatestContentVersionMatched(oasOperationAllVersions(), targetVersion)
			// transform time to str with format "2006-01-02"
			assert.Equal(t, tt.expectedMatch, r.String())
		})
	}
}

func oasOperationAllVersions() *openapi3.Operation {
	responses := &openapi3.Responses{}
	responses.Set("200", &openapi3.ResponseRef{
		Value: &openapi3.Response{
			Content: map[string]*openapi3.MediaType{
				"application/vnd.atlas.preview+json":    {},
				"application/vnd.atlas.2023-01-01+json": {},
				"application/vnd.atlas.2023-01-01+csv":  {},
				"application/vnd.atlas.2023-02-01+json": {},
				"application/vnd.atlas.2023-10-01+json": {},
				"application/vnd.atlas.2023-11-15+json": {},
				"application/vnd.atlas.2024-05-30+json": {},
			},
		},
	})

	return &openapi3.Operation{
		OperationID: "operationId",
		Responses:   responses,
		RequestBody: &openapi3.RequestBodyRef{
			Value: &openapi3.RequestBody{
				Content: map[string]*openapi3.MediaType{
					"application/vnd.atlas.2023-01-01+json": {},
					"application/vnd.atlas.2023-02-01+json": {},
					"application/vnd.atlas.2023-10-01+json": {},
					"application/vnd.atlas.2023-11-15+json": {},
					"application/vnd.atlas.2024-05-30+json": {},
				},
			},
		},
	}
}
