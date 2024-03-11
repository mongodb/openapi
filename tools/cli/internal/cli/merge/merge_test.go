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
	"testing"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/mongodb/openapi/tools/cli/internal/cli/flag"
	"github.com/mongodb/openapi/tools/cli/internal/cli/validator"
	"github.com/mongodb/openapi/tools/cli/internal/openapi"
	"github.com/spf13/afero"
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

func TestCreateBuilder(t *testing.T) {
	validator.ValidateSubCommandsAndFlags(
		t,
		Builder(),
		0,
		[]string{flag.Base, flag.External, flag.Output},
	)
}
