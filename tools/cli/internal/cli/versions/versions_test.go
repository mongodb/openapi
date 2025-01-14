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
)

func TestVersions_Run(t *testing.T) {
	fs := afero.NewMemMapFs()
	opts := &Opts{
		basePath:   "../../../test/data/base_spec.json",
		outputPath: "foas.json",
		fs:         fs,
	}

	if err := opts.Run(); err != nil {
		t.Fatalf("Run() unexpected error: %v", err)
	}

	b, err := afero.ReadFile(fs, opts.outputPath)
	if err != nil {
		t.Fatalf("ReadFile() unexpected error: %v", err)
	}

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

	if err := opts.Run(); err != nil {
		t.Fatalf("Run() unexpected error: %v", err)
	}

	b, err := afero.ReadFile(fs, opts.outputPath)
	if err != nil {
		t.Fatalf("ReadFile() unexpected error: %v", err)
	}

	// Check initial versions
	assert.NotEmpty(t, b)
	assert.Contains(t, string(b), "2023-02-01")
}

func TestVersion_RunWithPreview(t *testing.T) {
	fs := afero.NewMemMapFs()
	opts := &Opts{
		basePath:   "../../../test/data/base_spec_with_preview.json",
		outputPath: "foas.json",
		fs:         fs,
		env:        "staging",
	}

	if err := opts.Run(); err != nil {
		t.Fatalf("Run() unexpected error: %v", err)
	}

	b, err := afero.ReadFile(fs, opts.outputPath)
	if err != nil {
		t.Fatalf("ReadFile() unexpected error: %v", err)
	}

	// Check initial versions
	assert.NotEmpty(t, b)
	assert.Contains(t, string(b), "2023-02-01")
	assert.Contains(t, string(b), "preview")
}

func TestVersion_RunStabilityLevelPreview(t *testing.T) {
	fs := afero.NewMemMapFs()
	opts := &Opts{
		basePath:       "../../../test/data/base_spec_with_preview.json",
		outputPath:     "foas.json",
		fs:             fs,
		env:            "staging",
		stabilityLevel: "PREVIEW",
	}

	if err := opts.Run(); err != nil {
		t.Fatalf("Run() unexpected error: %v", err)
	}

	b, err := afero.ReadFile(fs, opts.outputPath)
	if err != nil {
		t.Fatalf("ReadFile() unexpected error: %v", err)
	}

	// Check initial versions
	assert.NotEmpty(t, b)
	assert.NotContains(t, string(b), "2023-02-01")
	assert.Contains(t, string(b), "preview")
}

func TestVersion_RunStabilityLevelStable(t *testing.T) {
	fs := afero.NewMemMapFs()
	opts := &Opts{
		basePath:       "../../../test/data/base_spec_with_preview.json",
		outputPath:     "foas.json",
		fs:             fs,
		env:            "staging",
		stabilityLevel: "STABLE",
	}

	if err := opts.Run(); err != nil {
		t.Fatalf("Run() unexpected error: %v", err)
	}

	b, err := afero.ReadFile(fs, opts.outputPath)
	if err != nil {
		t.Fatalf("ReadFile() unexpected error: %v", err)
	}

	// Check initial versions
	assert.NotEmpty(t, b)
	assert.Contains(t, string(b), "2023-02-01")
	assert.NotContains(t, string(b), "preview")
}
