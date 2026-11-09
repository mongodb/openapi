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

	"github.com/oasdiff/oasdiff/checker"
	"github.com/stretchr/testify/require"
)

func TestNormalizePropertyRemovals(t *testing.T) {
	en := checker.NewLocalizer("en")

	tests := []struct {
		name     string
		change   checker.ApiChange
		wantID   string
		wantArgs []any
		// wantRender comes from oasdiff's legacy template, not a hardcoded string.
		wantRender string
	}{
		{
			name:       "Request property removed with deprecation",
			change:     checker.ApiChange{Id: "request-property-removed-with-deprecation", Args: []any{"foo"}, Level: checker.ERR},
			wantID:     "request-property-removed",
			wantRender: en("request-property-removed", "`foo`"),
		},
		{
			name:       "Request property removed before sunset",
			change:     checker.ApiChange{Id: "request-property-removed-before-sunset", Args: []any{"foo", "2099-01-01"}, Level: checker.ERR},
			wantID:     "request-property-removed",
			wantArgs:   []any{"foo"}, // sunset date dropped
			wantRender: en("request-property-removed", "`foo`"),
		},
		{
			name: "Response required property removed with deprecation",
			change: checker.ApiChange{
				Id:    "response-required-property-removed-with-deprecation",
				Args:  []any{"results/items/foo", "200"},
				Level: checker.ERR,
			},
			wantID:     "response-required-property-removed",
			wantRender: en("response-required-property-removed", "`results/items/foo`", "`200`"),
		},
		{
			name: "Response required property removed before sunset",
			change: checker.ApiChange{
				Id:    "response-required-property-removed-before-sunset",
				Args:  []any{"results/items/foo", "200", "2099-01-01"},
				Level: checker.ERR,
			},
			wantID:     "response-required-property-removed",
			wantArgs:   []any{"results/items/foo", "200"},
			wantRender: en("response-required-property-removed", "`results/items/foo`", "`200`"),
		},
		{
			name:       "Legacy check is unchanged",
			change:     checker.ApiChange{Id: "request-property-removed", Args: []any{"foo"}, Level: checker.ERR},
			wantID:     "request-property-removed",
			wantRender: en("request-property-removed", "`foo`"),
		},
		{
			name:       "Unrelated check is unchanged",
			change:     checker.ApiChange{Id: "request-parameter-removed", Args: []any{"query", "foo"}, Level: checker.ERR},
			wantID:     "request-parameter-removed",
			wantRender: en("request-parameter-removed", "`query`", "`foo`"),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := normalizePropertyRemovals(checker.Changes{tt.change})[0]

			require.Equal(t, tt.wantID, got.GetId())
			if tt.wantArgs != nil {
				require.Equal(t, tt.wantArgs, got.GetArgs())
			}
			require.Equal(t, tt.wantRender, got.GetUncolorizedText(en))
		})
	}
}
