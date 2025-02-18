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

package split

import (
	"net/url"
	"testing"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/mongodb/openapi/tools/cli/internal/openapi"
	"github.com/spf13/afero"
	"github.com/stretchr/testify/require"
	"github.com/tufin/oasdiff/load"
)

func TestSuccessfulSplit_Run(t *testing.T) {
	fs := afero.NewMemMapFs()
	opts := &Opts{
		basePath:   "../../../test/data/base_spec.json",
		outputPath: "foas.yaml",
		fs:         fs,
	}

	if err := opts.Run(); err != nil {
		t.Fatalf("Run() unexpected error: %v", err)
	}
}

func TestSplitPublicPreviewRun(t *testing.T) {
	fs := afero.NewMemMapFs()
	opts := &Opts{
		basePath:   "../../../test/data/base_spec_with_public_preview.json",
		outputPath: "foas.yaml",
		fs:         fs,
	}

	if err := opts.Run(); err != nil {
		t.Fatalf("Run() unexpected error: %v", err)
	}

	info, err := loadRunResultOas(fs, "foas-preview.yaml")
	require.NoError(t, err)

	// check paths has only one
	require.Len(t, info.Spec.Paths.Map(), 1)
	require.Contains(t, info.Spec.Paths.Map(), "/api/atlas/v2/groups")
}

func TestSplitPrivatePreviewRun(t *testing.T) {
	fs := afero.NewMemMapFs()
	opts := &Opts{
		basePath:   "../../../test/data/base_spec_with_private_preview.json",
		outputPath: "foas.yaml",
		fs:         fs,
	}

	if err := opts.Run(); err != nil {
		t.Fatalf("Run() unexpected error: %v", err)
	}

	info, err := loadRunResultOas(fs, "foas-private-preview-new-feature.yaml")
	require.NoError(t, err)

	// check paths has only one
	require.Len(t, info.Spec.Paths.Map(), 1)
	require.Contains(t, info.Spec.Paths.Map(), "/api/atlas/v2/groups")
}

func TestSplitMulitplePreviewsRun(t *testing.T) {
	fs := afero.NewMemMapFs()
	opts := &Opts{
		basePath:   "../../../test/data/base_spec_with_multiple_private_and_public_previews.json",
		outputPath: "foas.yaml",
		fs:         fs,
	}

	if err := opts.Run(); err != nil {
		t.Fatalf("Run() unexpected error: %v", err)
	}

	// private preview feature 1
	info, err := loadRunResultOas(fs, "foas-private-preview-new-feature.yaml")
	require.NoError(t, err)

	// check paths has only one
	require.Len(t, info.Spec.Paths.Map(), 1)
	require.Contains(t, info.Spec.Paths.Map(), "/api/atlas/v2/groups")

	// private preview feature 2
	info, err = loadRunResultOas(fs, "foas-private-preview-secrets-feature.yaml")
	require.NoError(t, err)

	// check paths has only one
	require.Len(t, info.Spec.Paths.Map(), 1)
	require.Contains(t, info.Spec.Paths.Map(), "/api/atlas/v2/groups/{groupId}/serviceAccounts/{clientId}/secrets")

	// public preview
	info, err = loadRunResultOas(fs, "foas-preview.yaml")
	require.NoError(t, err)

	// check paths has only one
	require.Len(t, info.Spec.Paths.Map(), 1)
	require.Contains(t, info.Spec.Paths.Map(), "/api/atlas/v2/groups/{groupId}/serviceAccounts")
}

func TestOpts_PreRunE(t *testing.T) {
	testCases := []struct {
		wantErr  require.ErrorAssertionFunc
		basePath string
		name     string
	}{
		{
			wantErr: require.Error,
			name:    "NoBasePath",
		},
		{
			wantErr:  require.NoError,
			basePath: "../../../test/data/base_spec.json",
			name:     "Successful",
		},
	}

	for _, tt := range testCases {
		t.Run(tt.name, func(t *testing.T) {
			o := &Opts{
				basePath: tt.basePath,
				format:   "json",
			}
			tt.wantErr(t, o.PreRunE(nil))
		})
	}
}

func TestInvalidFormat_PreRun(t *testing.T) {
	opts := &Opts{
		outputPath: "foas.json",
		basePath:   "base.json",
		format:     "html",
	}

	err := opts.PreRunE(nil)
	require.Error(t, err)
	require.EqualError(t, err, "output format must be either 'json' or 'yaml', got html")
}

func TestInvalidPath_PreRun(t *testing.T) {
	opts := &Opts{
		outputPath: "foas.html",
		basePath:   "base.json",
	}

	err := opts.PreRunE(nil)
	require.Error(t, err)
	require.EqualError(t, err, "output file must be either a JSON or YAML file, got foas.html")
}

func loadRunResultOas(fs afero.Fs, fileName string) (*load.SpecInfo, error) {
	oas := openapi.NewOpenAPI3()
	oas.Loader.ReadFromURIFunc = func(_ *openapi3.Loader, uri *url.URL) ([]byte, error) {
		f, err := fs.OpenFile(fileName, 0, 0)
		if err != nil {
			return nil, err
		}
		defer f.Close()
		return afero.ReadAll(f)
	}

	return oas.CreateOpenAPISpecFromPath(fileName)
}
