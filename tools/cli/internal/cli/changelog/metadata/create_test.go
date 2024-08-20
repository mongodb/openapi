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

package metadata

import (
	"testing"

	"github.com/mongodb/openapi/tools/cli/internal/cli/flag"
	"github.com/mongodb/openapi/tools/cli/internal/test"
	"github.com/spf13/afero"
	"github.com/stretchr/testify/require"
)

func TestCreateBuild_Run(t *testing.T) {
	fs := afero.NewMemMapFs()
	opts := &Opts{
		specRevision: "test",
		runDate:      "2024-01-01",
		versions:     []string{"2024-01-01"},
		fs:           fs,
	}

	require.NoError(t, opts.Run())
}

func TestCreateBuild_PreRun_InvalidVersion(t *testing.T) {
	fs := afero.NewMemMapFs()
	opts := &Opts{
		specRevision: "test",
		runDate:      "2024-01-01",
		versions:     []string{"1.0.0"},
		fs:           fs,
	}

	require.ErrorContains(t, opts.PreRun(), "invalid version date")
}

func TestCreateBuilder(t *testing.T) {
	test.CmdValidator(
		t,
		CreateBuilder(),
		0,
		[]string{flag.Output, flag.Versions, flag.RunDate, flag.GitSha},
	)
}
