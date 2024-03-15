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

package merge

import (
	"fmt"
	"testing"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/mongodb/openapi/tools/cli/internal/cli/flag"
	"github.com/mongodb/openapi/tools/cli/internal/cli/validator"
	"github.com/mongodb/openapi/tools/cli/internal/openapi"
	"github.com/spf13/afero"
	"github.com/stretchr/testify/require"
	"github.com/tufin/oasdiff/load"
	"go.uber.org/mock/gomock"
)

func TestSuccessfulMerge_Run(t *testing.T) {
	ctrl := gomock.NewController(t)
	mockMergerStore := openapi.NewMockMerger(ctrl)
	fs := afero.NewMemMapFs()
	externalPaths := []string{"external.json"}
	opts := &Opts{
		Merger:        mockMergerStore,
		basePath:      "base.json",
		outputPath:    "foas.json",
		externalPaths: externalPaths,
		fs:            fs,
	}

	response := &load.SpecInfo{
		Spec:    &openapi3.T{},
		Url:     "test",
		Version: "3.0.1",
	}

	mockMergerStore.
		EXPECT().
		MergeOpenAPISpecs(opts.externalPaths).
		Return(response, nil).
		Times(1)

	if err := opts.Run(); err != nil {
		t.Fatalf("Run() unexpected error: %v", err)
	}
}

func TestNoBaseSpecMerge_PreRun(t *testing.T) {
	externalPaths := []string{"external.json"}
	opts := &Opts{
		outputPath:    "foas.json",
		externalPaths: externalPaths,
	}

	err := opts.PreRunE(nil)
	require.Error(t, err)
	require.EqualError(t, err, fmt.Sprintf("no base OAS detected. "+
		"Please, use the flag %s to include the base OAS", flag.Base))
}

func TestNoExternalSpecMerge_PreRun(t *testing.T) {
	opts := &Opts{
		outputPath: "foas.json",
		basePath:   "base.json",
	}

	err := opts.PreRunE(nil)
	require.Error(t, err)
	require.EqualError(t, err, fmt.Sprintf("no external OAS detected. "+
		"Please, use the flag %s to include at least one OAS", flag.External))
}

func TestCreateBuilder(t *testing.T) {
	validator.ValidateSubCommandsAndFlags(
		t,
		Builder(),
		0,
		[]string{flag.Base, flag.External, flag.Output},
	)
}

func TestOpts_PreRunE(t *testing.T) {
	testCases := []struct {
		error         require.ErrorAssertionFunc
		basePath      string
		name          string
		externalPaths []string
	}{
		{
			error:         require.Error,
			basePath:      "test",
			name:          "NoExternalPaths",
			externalPaths: nil,
		},
		{
			error:         require.Error,
			name:          "NoBasePath",
			externalPaths: []string{"test"},
		},
		{
			error:         require.NoError,
			basePath:      "../../../test/data/base.json",
			name:          "Successful",
			externalPaths: []string{"test"},
		},
	}

	for _, tt := range testCases {
		t.Run(tt.name, func(t *testing.T) {
			o := &Opts{
				basePath:      tt.basePath,
				externalPaths: tt.externalPaths,
			}
			tt.error(t, o.PreRunE(nil))
		})
	}
}
