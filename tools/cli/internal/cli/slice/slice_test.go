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

package slice

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestOpts_PreRunE(t *testing.T) {
	testCases := []struct {
		name     string
		opts     Opts
		wantErr  require.ErrorAssertionFunc
		errorMsg string
	}{
		{
			name: "valid with operation IDs",
			opts: Opts{
				basePath:     "spec.yaml",
				outputPath:   "output.yaml",
				format:       "yaml",
				operationIDs: []string{"op1", "op2"},
			},
			wantErr: require.NoError,
		},
		{
			name: "valid with tags",
			opts: Opts{
				basePath:   "spec.yaml",
				outputPath: "output.yaml",
				format:     "yaml",
				tags:       []string{"tag1", "tag2"},
			},
			wantErr: require.NoError,
		},
		{
			name: "valid with paths",
			opts: Opts{
				basePath:   "spec.yaml",
				outputPath: "output.yaml",
				format:     "yaml",
				paths:      []string{"/api/v1"},
			},
			wantErr: require.NoError,
		},
		{
			name: "missing base path",
			opts: Opts{
				outputPath:   "output.yaml",
				format:       "yaml",
				operationIDs: []string{"op1"},
			},
			wantErr:  require.Error,
			errorMsg: "no OAS detected",
		},
		{
			name: "missing all criteria",
			opts: Opts{
				basePath:   "spec.yaml",
				outputPath: "output.yaml",
				format:     "yaml",
			},
			wantErr:  require.Error,
			errorMsg: "at least one of --operation-ids, --tags, or --paths must be specified",
		},
	}

	for _, tt := range testCases {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.opts.PreRunE(nil)
			tt.wantErr(t, err)
			if tt.errorMsg != "" && err != nil {
				assert.Contains(t, err.Error(), tt.errorMsg)
			}
		})
	}
}

func TestInvalidFormat_PreRunE(t *testing.T) {
	opts := &Opts{
		outputPath: "slice.json",
		basePath:   "base.json",
		format:     "html",
		paths:      []string{"/api/v1"},
	}

	err := opts.PreRunE(nil)
	require.Error(t, err)
	require.EqualError(t, err, "format must be either 'json', 'yaml' or 'all', got 'html'")
}

func TestInvalidPath_PreRunE(t *testing.T) {
	opts := &Opts{
		outputPath: "slice.html",
		basePath:   "base.json",
		format:     "all",
		paths:      []string{"/api/v1"},
	}

	err := opts.PreRunE(nil)
	require.Error(t, err)
	require.EqualError(t, err, "output file must be either a JSON or YAML file, got slice.html")
}
