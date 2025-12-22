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

package openapi

import (
	"fmt"
	"runtime"

	"github.com/mongodb/openapi/tools/cli/internal/cli/breakingchanges"
	"github.com/mongodb/openapi/tools/cli/internal/cli/changelog"
	"github.com/mongodb/openapi/tools/cli/internal/cli/filter"
	"github.com/mongodb/openapi/tools/cli/internal/cli/merge"
	"github.com/mongodb/openapi/tools/cli/internal/cli/slice"
	"github.com/mongodb/openapi/tools/cli/internal/cli/split"
	"github.com/mongodb/openapi/tools/cli/internal/cli/sunset"
	"github.com/mongodb/openapi/tools/cli/internal/cli/versions"
	"github.com/mongodb/openapi/tools/cli/internal/version"
	"github.com/spf13/cobra"
)

const (
	ToolName    = "foascli"
	verTemplate = `foascli version: %s
git version: %s
Go version: %s
   os: %s
   arch: %s
   compiler: %s
`
)

// Builder conditionally adds children commands as needed.
// This is important in particular for Atlas as it dynamically sets flags for cluster creation and
// this can be slow to timeout on environments with limited internet access (Ops Manager).
func Builder() *cobra.Command {
	rootCmd := &cobra.Command{
		Version: version.Version,
		Use:     ToolName,
		Short:   "CLI tool to validate and merge your Open API Specifications",
		Example: `  # Display the help menu for the merge command:
  foascli merge --help
`,
		SilenceUsage: true,
	}

	rootCmd.SetVersionTemplate(formattedVersion())
	rootCmd.AddCommand(
		merge.Builder(),
		split.Builder(),
		versions.Builder(),
		changelog.Builder(),
		breakingchanges.Builder(),
		sunset.Builder(),
		filter.Builder(),
		slice.Builder(),
	)
	return rootCmd
}

func formattedVersion() string {
	return fmt.Sprintf(verTemplate,
		version.Version,
		version.GitCommit,
		runtime.Version(),
		runtime.GOOS,
		runtime.GOARCH,
		runtime.Compiler)
}
