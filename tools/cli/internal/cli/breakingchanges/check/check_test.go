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

package check

import (
	"testing"

	"github.com/spf13/afero"
	"github.com/stretchr/testify/require"
)

func TestCheckOpts_PreRunE(t *testing.T) {
	testCases := []struct {
		name         string
		basePath     string
		revisionPath string
		wantErr      require.ErrorAssertionFunc
		setupFS      func(fs afero.Fs)
	}{
		{
			name:         "NoBasePath",
			basePath:     "",
			revisionPath: "revision.json",
			wantErr:      require.Error,
			setupFS:      func(_ afero.Fs) {},
		},
		{
			name:         "NoRevisionPath",
			basePath:     "base.json",
			revisionPath: "",
			wantErr:      require.Error,
			setupFS:      func(_ afero.Fs) {},
		},
		{
			name:         "BaseFileNotFound",
			basePath:     "base.json",
			revisionPath: "revision.json",
			wantErr:      require.Error,
			setupFS: func(fs afero.Fs) {
				_ = afero.WriteFile(fs, "revision.json", []byte("{}"), 0o644)
			},
		},
		{
			name:         "RevisionFileNotFound",
			basePath:     "base.json",
			revisionPath: "revision.json",
			wantErr:      require.Error,
			setupFS: func(fs afero.Fs) {
				_ = afero.WriteFile(fs, "base.json", []byte("{}"), 0o644)
			},
		},
		{
			name:         "Successful",
			basePath:     "base.json",
			revisionPath: "revision.json",
			wantErr:      require.NoError,
			setupFS: func(fs afero.Fs) {
				_ = afero.WriteFile(fs, "base.json", []byte("{}"), 0o644)
				_ = afero.WriteFile(fs, "revision.json", []byte("{}"), 0o644)
			},
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			fs := afero.NewMemMapFs()
			tc.setupFS(fs)

			opts := &Opts{
				fs:           fs,
				basePath:     tc.basePath,
				revisionPath: tc.revisionPath,
			}

			tc.wantErr(t, opts.PreRunE())
		})
	}
}

func TestCheckBuilder(t *testing.T) {
	cmd := Builder()

	require.NotNil(t, cmd)
	require.Equal(t, "check -b base-spec -r revision-spec [-o output-file]", cmd.Use)
	require.Equal(t, "Check breaking changes between two OpenAPI specifications.", cmd.Short)

	// Verify required flags
	baseFlag := cmd.Flags().Lookup("base")
	require.NotNil(t, baseFlag)
	require.Equal(t, "b", baseFlag.Shorthand)

	revisionFlag := cmd.Flags().Lookup("revision")
	require.NotNil(t, revisionFlag)
	require.Equal(t, "r", revisionFlag.Shorthand)

	outputFlag := cmd.Flags().Lookup("output")
	require.NotNil(t, outputFlag)
	require.Equal(t, "o", outputFlag.Shorthand)
}
