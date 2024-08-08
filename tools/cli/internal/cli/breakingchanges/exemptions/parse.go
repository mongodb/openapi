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
	"github.com/mongodb/openapi/tools/cli/internal/breakingchanges"
	"github.com/mongodb/openapi/tools/cli/internal/cli/flag"
	"github.com/mongodb/openapi/tools/cli/internal/cli/usage"
	"github.com/spf13/afero"
	"github.com/spf13/cobra"
)

type Opts struct {
	fs              afero.Fs
	exemptionsPaths string
	outputPath      string
}

func (o *Opts) Run() error {
	err := breakingchanges.GenerateExemptionsFile(o.outputPath, o.exemptionsPaths, false)
	if err != nil {
		return err
	}

	return nil
}

func (o *Opts) PreRunE(_ []string) error {
	_, err := o.fs.Stat(o.exemptionsPaths)
	if err != nil {
		return err
	}
	return nil
}

// Builder builds the merge command with the following signature:
// breaking-changes exemptions parse -e file_path
func ParseBuilder() *cobra.Command {
	opts := &Opts{
		fs: afero.NewOsFs(),
	}

	cmd := &cobra.Command{
		Use:     "parse",
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
	cmd.Flags().StringVarP(&opts.outputPath, flag.Output, flag.OutputShort, "exemptions.txt", usage.Output)

	_ = cmd.MarkFlagRequired(flag.ExemptionFilePath)

	return cmd
}
