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

package changelog

import (
	"testing"

	"github.com/mongodb/openapi/tools/cli/internal/test"
	"github.com/stretchr/testify/require"
)

func TestBuilder(t *testing.T) {
	test.CmdValidator(
		t,
		Builder(),
		3,
		[]string{},
	)
}

func TestValidatePathWithinOutput(t *testing.T) {
	tests := []struct {
		name       string
		outputPath string
		targetPath string
		wantErr    bool
	}{
		{
			name:       "valid path inside output directory",
			outputPath: "/tmp/out",
			targetPath: "/tmp/out/version-diff/2024-01-01_2024-02-01.json",
			wantErr:    false,
		},
		{
			name:       "traversal escaping output directory",
			outputPath: "/tmp/out",
			targetPath: "/tmp/out/version-diff/../../pwned.upcoming_2024-01-01.json",
			wantErr:    true,
		},
		{
			name:       "traversal escaping empty output directory",
			outputPath: "",
			targetPath: "version-diff/../../pwned.upcoming_2024-01-01.json",
			wantErr:    true,
		},
		{
			name:       "valid relative path with empty output directory",
			outputPath: "",
			targetPath: "version-diff/2024-01-01_2024-02-01.json",
			wantErr:    false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			opts := &Opts{
				outputPath: tt.outputPath,
			}
			err := opts.validatePathWithinOutput(tt.targetPath)
			if tt.wantErr {
				require.Error(t, err)
			} else {
				require.NoError(t, err)
			}
		})
	}
}
