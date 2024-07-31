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
	"encoding/json"
	"fmt"
	"strings"

	"github.com/mongodb/openapi/tools/cli/internal/cli/flag"
	"github.com/mongodb/openapi/tools/cli/internal/cli/usage"
	"github.com/mongodb/openapi/tools/cli/internal/openapi"
	"github.com/spf13/afero"
	"github.com/spf13/cobra"
)

type Opts struct {
	Merger              openapi.Merger
	fs                  afero.Fs
	excludePrivatePaths bool
	basePath            string
	outputPath          string
	format              string
	gitSha              string
	externalPaths       []string
}

func (o *Opts) Run() error {
	federated, err := o.Merger.MergeOpenAPISpecs(o.externalPaths)
	if err != nil {
		return err
	}

	if o.gitSha != "" {
		federated.Info.Extensions = map[string]interface{}{
			"x-xgen-sha": o.gitSha,
		}
	}

	federatedBytes, err := json.MarshalIndent(*federated, "", "  ")
	if err != nil {
		return err
	}

	if o.outputPath == "" {
		fmt.Println(string(federatedBytes))
		return nil
	}

	return openapi.SaveSpec(o.outputPath, federated, o.format, o.fs)
}

func (o *Opts) PreRunE(_ []string) error {
	if o.basePath == "" {
		return fmt.Errorf("no base OAS detected. Please, use the flag %s to include the base OAS", flag.Base)
	}

	if o.externalPaths == nil {
		return fmt.Errorf("no external OAS detected. Please, use the flag %s to include at least one OAS", flag.External)
	}

	if o.outputPath != "" && !strings.Contains(o.outputPath, ".json") && !strings.Contains(o.outputPath, ".yaml") {
		return fmt.Errorf("output file must be either a JSON or YAML file, got %s", o.outputPath)
	}

	if o.format != "json" && o.format != "yaml" {
		return fmt.Errorf("output format must be either 'json' or 'yaml', got %s", o.format)
	}

	m, err := openapi.NewOasDiff(o.basePath, o.excludePrivatePaths)
	o.Merger = m
	return err
}

// Builder builds the merge command with the following signature:
// merge -b base-oas -e external-oas-1 -e external-oas-2
func Builder() *cobra.Command {
	opts := &Opts{
		fs: afero.NewOsFs(),
	}

	cmd := &cobra.Command{
		Use:   "merge -b base-spec [-e spec]...",
		Short: "Merge Open API specifications into a base spec.",
		Args:  cobra.NoArgs,
		PreRunE: func(_ *cobra.Command, args []string) error {
			return opts.PreRunE(args)
		},
		RunE: func(_ *cobra.Command, _ []string) error {
			return opts.Run()
		},
	}

	cmd.Flags().StringVarP(&opts.basePath, flag.Base, flag.BaseShort, "", usage.Base)
	cmd.Flags().StringArrayVarP(&opts.externalPaths, flag.External, flag.ExternalShort, nil, usage.External)
	cmd.Flags().StringVar(&opts.gitSha, flag.GitSha, "", usage.GitSha)
	cmd.Flags().BoolVarP(&opts.excludePrivatePaths, flag.ExcludePrivatePaths, flag.ExcludePrivatePathsShort, false, usage.ExcludePrivatePaths)
	cmd.Flags().StringVarP(&opts.outputPath, flag.Output, flag.OutputShort, "", usage.Output)
	cmd.Flags().StringVarP(&opts.format, flag.Format, flag.FormatShort, "json", usage.Format)

	_ = cmd.MarkFlagRequired(flag.Base)
	_ = cmd.MarkFlagRequired(flag.External)

	return cmd
}
