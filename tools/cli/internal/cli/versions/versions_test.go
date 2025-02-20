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

package versions

import (
	"testing"

	"github.com/spf13/afero"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestVersions_Run(t *testing.T) {
	fs := afero.NewMemMapFs()
	opts := &Opts{
		basePath:   "../../../test/data/base_spec.json",
		outputPath: "foas.json",
		fs:         fs,
	}

	require.NoError(t, opts.Run())
	b, err := afero.ReadFile(fs, opts.outputPath)
	require.NoError(t, err)
	// Check initial versions
	assert.NotEmpty(t, b)
	assert.Contains(t, string(b), "2023-02-01")
}

func TestVersion_RunWithEnv(t *testing.T) {
	fs := afero.NewMemMapFs()
	opts := &Opts{
		basePath:   "../../../test/data/base_spec.json",
		outputPath: "foas.json",
		fs:         fs,
		env:        "staging",
	}

	require.NoError(t, opts.Run())
	b, err := afero.ReadFile(fs, opts.outputPath)
	require.NoError(t, err)

	// Check initial versions
	assert.NotEmpty(t, b)
	assert.Contains(t, string(b), "2023-02-01")
}

func TestVersion_RunWithPreview(t *testing.T) {
	fs := afero.NewMemMapFs()
	opts := &Opts{
		basePath:   "../../../test/data/base_spec_with_private_preview.json",
		outputPath: "foas.json",
		fs:         fs,
		env:        "staging",
	}

	require.NoError(t, opts.Run())
	b, err := afero.ReadFile(fs, opts.outputPath)
	require.NoError(t, err)

	// Check initial versions
	assert.NotEmpty(t, b)
	assert.Contains(t, string(b), "2023-02-01")
	assert.Contains(t, string(b), "preview")
}

func TestVersion_RunStabilityLevelPreviewAndPrivatePreview(t *testing.T) {
	fs := afero.NewMemMapFs()
	opts := &Opts{
		basePath:       "../../../test/data/base_spec_with_private_preview.json",
		outputPath:     "foas.json",
		fs:             fs,
		env:            "staging",
		stabilityLevel: []string{"PREVIEW"},
	}

	require.NoError(t, opts.Run())
	b, err := afero.ReadFile(fs, opts.outputPath)
	require.NoError(t, err)

	// Check initial versions
	assert.NotEmpty(t, b)
	assert.NotContains(t, string(b), "2023-02-01")
	assert.Contains(t, string(b), "private-preview")
}

func TestVersion_PreviewAndPublicPreview(t *testing.T) {
	fs := afero.NewMemMapFs()
	opts := &Opts{
		basePath:       "../../../test/data/base_spec_with_public_preview.json",
		outputPath:     "foas.json",
		fs:             fs,
		env:            "staging",
		stabilityLevel: []string{"private-preview", "public-preview"},
	}

	require.NoError(t, opts.Run())
	b, err := afero.ReadFile(fs, opts.outputPath)
	require.NoError(t, err)

	// Check initial versions
	assert.NotEmpty(t, b)
	assert.NotContains(t, string(b), "private-preview")
	assert.Contains(t, string(b), "preview")
}

func TestVersion_RunStabilityLevelStable(t *testing.T) {
	fs := afero.NewMemMapFs()
	opts := &Opts{
		basePath:       "../../../test/data/base_spec_with_private_preview.json",
		outputPath:     "foas.json",
		fs:             fs,
		env:            "staging",
		stabilityLevel: []string{"STABLE"},
	}

	require.NoError(t, opts.Run())
	b, err := afero.ReadFile(fs, opts.outputPath)
	require.NoError(t, err)

	// Check initial versions
	assert.NotEmpty(t, b)
	assert.Contains(t, string(b), "2023-02-01")
	assert.NotContains(t, string(b), "private-preview")
}

func TestVersion_PreRun(t *testing.T) {
	t.Run("NoBasePath", func(t *testing.T) {
		opts := &Opts{}
		err := opts.PreRunE(nil)
		require.Error(t, err)
		assert.Contains(t, err.Error(), "no OAS detected")
	})

	t.Run("InvalidOutputPath", func(t *testing.T) {
		opts := &Opts{
			basePath:   "base",
			outputPath: "output",
		}
		err := opts.PreRunE(nil)
		require.Error(t, err)
		assert.Contains(t, err.Error(), "output file must be either a JSON or YAML file")
	})

	t.Run("InvalidFormat", func(t *testing.T) {
		opts := &Opts{
			basePath:   "base",
			outputPath: "output.json",
			format:     "invalid",
		}
		err := opts.PreRunE(nil)
		require.Error(t, err)
		assert.Contains(t, err.Error(), "output format must be either 'json' or 'yaml'")
	})

	t.Run("ValidFormat", func(t *testing.T) {
		opts := &Opts{
			basePath:   "base",
			outputPath: "output.json",
			format:     "json",
		}
		err := opts.PreRunE(nil)
		require.NoError(t, err)
	})

	t.Run("ValidFormatYAML", func(t *testing.T) {
		opts := &Opts{
			basePath:   "base",
			outputPath: "output.yaml",
			format:     "yaml",
		}
		err := opts.PreRunE(nil)
		require.NoError(t, err)
	})

	t.Run("InvalidStabilityLevel", func(t *testing.T) {
		opts := &Opts{
			basePath:       "base",
			outputPath:     "output.yaml",
			format:         "yaml",
			stabilityLevel: []string{"invalid"},
		}
		err := opts.PreRunE(nil)
		require.Error(t, err)
		assert.Contains(t, err.Error(), "invalid stability level value m")
	})
	t.Run("ValidStabilityLevelPreview", func(t *testing.T) {
		opts := &Opts{
			basePath:       "base",
			outputPath:     "output.yaml",
			format:         "yaml",
			stabilityLevel: []string{"PREVIEW"},
		}
		err := opts.PreRunE(nil)
		require.NoError(t, err)
	})

	t.Run("ValidStabilityLevelPreviewUppercase", func(t *testing.T) {
		opts := &Opts{
			basePath:       "base",
			outputPath:     "output.yaml",
			format:         "yaml",
			stabilityLevel: []string{"PREVIEW"},
		}
		err := opts.PreRunE(nil)
		require.NoError(t, err)
	})
}
