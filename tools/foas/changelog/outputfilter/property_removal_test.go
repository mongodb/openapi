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
package outputfilter

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestNormalizePropertyRemovals(t *testing.T) {
	tests := []struct {
		name     string
		entry    *OasDiffEntry
		expected *OasDiffEntry
	}{
		{
			name: "Request property removed with deprecation",
			entry: &OasDiffEntry{
				ID:   "request-property-removed-with-deprecation",
				Text: "removed the deprecated request property `foo`",
			},
			expected: &OasDiffEntry{
				ID:   "request-property-removed",
				Text: "removed the request property `foo`",
			},
		},
		{
			name: "Request property removed before sunset",
			entry: &OasDiffEntry{
				ID:   "request-property-removed-before-sunset",
				Text: "removed the request property `foo` before the sunset date `2099-01-01`",
			},
			expected: &OasDiffEntry{
				ID:   "request-property-removed",
				Text: "removed the request property `foo`",
			},
		},
		{
			name: "Response required property removed with deprecation",
			entry: &OasDiffEntry{
				ID:   "response-required-property-removed-with-deprecation",
				Text: "removed the deprecated required property `results/items/foo` from the response with the `200` status",
			},
			expected: &OasDiffEntry{
				ID:   "response-required-property-removed",
				Text: "removed the required property `results/items/foo` from the response with the `200` status",
			},
		},
		{
			name: "Response required property removed before sunset",
			entry: &OasDiffEntry{
				ID:   "response-required-property-removed-before-sunset",
				Text: "removed the required property `results/items/foo` from the response with the `200` status before the sunset date `2099-01-01`",
			},
			expected: &OasDiffEntry{
				ID:   "response-required-property-removed",
				Text: "removed the required property `results/items/foo` from the response with the `200` status",
			},
		},
		{
			name: "Unrelated change is unchanged",
			entry: &OasDiffEntry{
				ID:   "request-property-removed",
				Text: "removed the request property `foo`",
			},
			expected: &OasDiffEntry{
				ID:   "request-property-removed",
				Text: "removed the request property `foo`",
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			normalizePropertyRemovals([]*OasDiffEntry{tt.entry})
			require.Equal(t, tt.expected, tt.entry)
		})
	}
}
