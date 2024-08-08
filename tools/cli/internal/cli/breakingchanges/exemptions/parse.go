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

package exemptions

import (
	"encoding/json"
	"fmt"

	"github.com/mongodb/openapi/tools/cli/internal/changelog"
	"github.com/mongodb/openapi/tools/cli/internal/cli/flag"
	"github.com/mongodb/openapi/tools/cli/internal/cli/usage"
	"github.com/spf13/afero"
	"github.com/spf13/cobra"
)

type Opts struct {
	fs              afero.Fs
	basePath        string
	revisionPath    string
	exemptionsPaths string
	dryRun          bool
}

func (o *Opts) Run() error {
	metadata, err := changelog.NewMetadata(
		fmt.Sprintf("%s/%s", o.basePath, "v2.json"),
		fmt.Sprintf("%s/%s", o.revisionPath, "v2.json"),
		o.exemptionsPaths)

	if err != nil {
		return err
	}

	checks, err := metadata.Check()
	if err != nil {
		return err
	}

	fmt.Print("Printing the checks\n")
	for _, check := range checks {
		base, err := json.MarshalIndent(*check, "", "  ")
		if err != nil {
			return err
		}

		fmt.Println(string(base))
	}

	return nil
}

func (o *Opts) PreRunE(_ []string) error {
	return nil
}

// Builder builds the merge command with the following signature:
// breaking-changes exemptions parse -p file_path
func ParseBuilder() *cobra.Command {
	opts := &Opts{
		fs: afero.NewOsFs(),
	}

	cmd := &cobra.Command{
		Use:     "parse -p file_path",
		Aliases: []string{"parse"},
		Short:   "Parse exemptions into oasdiff breaking changes format.",
		Args:    cobra.NoArgs,
		PreRunE: func(_ *cobra.Command, args []string) error {
			return opts.PreRunE(args)
		},
		RunE: func(_ *cobra.Command, _ []string) error {
			return opts.Run()
		},
	}

	cmd.Flags().StringVarP(&opts.exemptionsPaths, flag.ExemptionFilePath, flag.ExemptionFilePathShort, "", usage.ExemptionFilePath)
	cmd.Flags().BoolVarP(&opts.dryRun, flag.DryRun, flag.DryRunShort, false, usage.DryRun)

	_ = cmd.MarkFlagRequired(flag.Base)
	_ = cmd.MarkFlagRequired(flag.Revision)

	return cmd
}
