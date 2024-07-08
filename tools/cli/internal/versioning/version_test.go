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

	"github.com/stretchr/testify/assert"
)

func TestPathFilter_parseContentType(t *testing.T) {
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
			match, err := ParseVersion(tt.contentType)
			if tt.wantErr {
				assert.Error(t, err)
			} else {
				assert.Equal(t, tt.expectedMatch, match)
			}
		})
	}
}
