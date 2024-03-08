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
	"log"
	"mongodb/openapi/tools/cli/internal/cli/flag"
	"mongodb/openapi/tools/cli/internal/cli/usage"
	"os"

	"github.com/spf13/cobra"
)

const (
	DefaultOutputFileName = "FOAS.json"
)

type Opts struct {
	basePath      string
	outputPath    string
	externalPaths []string
}

func (o *Opts) Run(_ []string) error {
	// To add in follow up PR: CLOUDP-225849
	return o.saveFile([]byte("test"))
}

func (o *Opts) PreRunE(_ []string) error {
	if o.basePath == "" {
		return fmt.Errorf("no base OAS detected. Please, use the flag %s to include the base OAS", flag.Base)
	}

	if o.externalPaths == nil {
		return fmt.Errorf("no external OAS detected. Please, use the flag %s to include at least one OAS", flag.External)
	}

	return nil
}

func (o *Opts) saveFile(data []byte) error {
	if err := os.WriteFile(o.outputPath, data, 0o600); err != nil {
		return err
	}

	log.Printf("\nMerged spec was saved in '%s'.\n\n", o.outputPath)
	return nil
}

// Builder builds the merge command with the following signature:
// merge -b base-oas -e external-oas-1 -e external-oas-2
func Builder() *cobra.Command {
	opts := &Opts{}

	cmd := &cobra.Command{
		Use:   "merge -b base-spec [-e spec]...",
		Short: "Merge Open API specifications into a base spec.",
		Args:  cobra.NoArgs,
		PreRunE: func(_ *cobra.Command, args []string) error {
			return opts.PreRunE(args)
		},
		RunE: func(_ *cobra.Command, args []string) error {
			return opts.Run(args)
		},
	}

	cmd.Flags().StringVarP(&opts.basePath, flag.Base, flag.BaseShort, "", usage.Base)
	cmd.Flags().StringArrayVarP(&opts.externalPaths, flag.External, flag.ExternalShort, nil, usage.External)
	cmd.Flags().StringVarP(&opts.outputPath, flag.Output, flag.OutputShort, DefaultOutputFileName, usage.Output)
	return cmd
}
