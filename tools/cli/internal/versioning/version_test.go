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

package versioning

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
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
			name:          "invalid",
			contentType:   "application/vnd.test.2023-01-01",
			expectedMatch: "",
			wantErr:       true,
		},
	}

	for _, tt := range testCases {
		t.Run(tt.name, func(t *testing.T) {
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
	}

	for _, tt := range testCases {
		t.Run(tt.name, func(t *testing.T) {
			version, err := NewAPIVersionFromContentType(tt.contentType)
			if tt.wantErr {
				assert.Error(t, err)
			} else {
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
			v1, _ := NewAPIVersionFromDateString(tt.version1)
			v2, _ := NewAPIVersionFromDateString(tt.version2)
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
			v1, _ := NewAPIVersionFromDateString(tt.version1)
			v2, _ := NewAPIVersionFromDateString(tt.version2)
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
			v, _ := NewAPIVersionFromDateString(tt.version)
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
			v, _ := NewAPIVersionFromDateString(tt.version)
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
			v1, _ := NewAPIVersionFromDateString(tt.version1)
			v2, _ := NewAPIVersionFromDateString(tt.version2)
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
			timeValue, _ := time.Parse("2006-01-02", tt.time)
			match, err := NewAPIVersionFromTime(timeValue)
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
		wantErr       bool
	}{
		{
			name:          "2023-01-01",
			version:       "2023-01-01",
			expectedMatch: "2023-01-01",
			wantErr:       false,
		},
		{
			name:          "2023-01-02",
			version:       "2023-01-02",
			expectedMatch: "2023-01-02",
			wantErr:       false,
		},
		{
			name:          "2030-02-20",
			version:       "2030-02-20",
			expectedMatch: "2030-02-20",
			wantErr:       false,
		},
	}

	for _, tt := range testCases {
		t.Run(tt.name, func(t *testing.T) {
			match, err := NewVersionDate(tt.version)
			if tt.wantErr {
				assert.Error(t, err)
			} else {
				assert.Equal(t, tt.expectedMatch, match.Format(dateFormat))
			}
		})
	}
}

func TestNewAPIVersionFromDateString(t *testing.T) {
	testCases := []struct {
		name          string
		version       string
		expectedMatch string
		wantErr       bool
	}{
		{
			name:          "2023-01-01",
			version:       "2023-01-01",
			expectedMatch: "2023-01-01",
			wantErr:       false,
		},
		{
			name:          "2023-01-02",
			version:       "2023-01-02",
			expectedMatch: "2023-01-02",
			wantErr:       false,
		},
		{
			name:          "2030-02-20",
			version:       "2030-02-20",
			expectedMatch: "2030-02-20",
			wantErr:       false,
		},
	}

	for _, tt := range testCases {
		t.Run(tt.name, func(t *testing.T) {
			match, err := NewAPIVersionFromDateString(tt.version)
			if tt.wantErr {
				assert.Error(t, err)
			} else {
				assert.Equal(t, tt.expectedMatch, match.String())
			}
		})
	}
}

func TestNewAPIVersion(t *testing.T) {
	testCases := []struct {
		name          string
		version       string
		expectedMatch string
		wantErr       bool
	}{
		{
			name:          "2023-01-01",
			version:       "2023-01-01",
			expectedMatch: "2023-01-01",
			wantErr:       false,
		},
		{
			name:          "2023-01-02",
			version:       "2023-01-02",
			expectedMatch: "2023-01-02",
			wantErr:       false,
		},
		{
			name:          "2030-02-20",
			version:       "2030-02-20",
			expectedMatch: "2030-02-20",
			wantErr:       false,
		},
	}

	for _, tt := range testCases {
		t.Run(tt.name, func(t *testing.T) {
			match, err := NewAPIVersionFromDateString(tt.version)
			if tt.wantErr {
				assert.Error(t, err)
			} else {
				assert.Equal(t, tt.expectedMatch, match.String())
			}
		})
	}
}
