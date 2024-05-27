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
	"github.com/mongodb/openapi/tools/cli/internal/openapi"
	"github.com/spf13/afero"
	"github.com/stretchr/testify/require"
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

	response := &openapi.Spec{
		OpenAPI: "v3.0.1",
		Info:    &openapi3.Info{},
		Servers: nil,
		Tags:    openapi3.Tags{},
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

func TestOpts_PreRunE(t *testing.T) {
	testCases := []struct {
		wantErr       require.ErrorAssertionFunc
		basePath      string
		name          string
		externalPaths []string
	}{
		{
			wantErr:       require.Error,
			basePath:      "test",
			name:          "NoExternalPaths",
			externalPaths: nil,
		},
		{
			wantErr:       require.Error,
			name:          "NoBasePath",
			externalPaths: []string{"test"},
		},
		{
			wantErr:       require.NoError,
			basePath:      "../../../test/data/valid_base_spec.json",
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
			tt.wantErr(t, o.PreRunE(nil))
		})
	}
}
