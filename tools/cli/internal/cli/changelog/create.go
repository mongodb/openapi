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

package changelog

import (
	"encoding/json"
	"fmt"

	"github.com/mongodb/openapi/tools/cli/internal/cli/flag"
	"github.com/mongodb/openapi/tools/cli/internal/cli/usage"
	"github.com/mongodb/openapi/tools/cli/internal/openapi"
	"github.com/spf13/afero"
	"github.com/spf13/cobra"
)

type Opts struct {
	fs              afero.Fs
	basePath        string
	revisionPath    string
	exceptionsPaths string
	dryRun          bool
}

func (o *Opts) Run() error {
	changelog, err := openapi.NewChangelog(
		fmt.Sprintf("%s/%s", o.basePath, "v2.json"),
		fmt.Sprintf("%s/%s", o.revisionPath, "v2.json"),
		o.exceptionsPaths)

	if err != nil {
		return err
	}

	fmt.Print("Normalizing the v2.json spec...\n")
	base, err := json.MarshalIndent(*changelog.Base, "", "  ")
	if err != nil {
		return err
	}

	fmt.Println(string(base))

	return nil
}

func (o *Opts) PreRunE(_ []string) error {
	return nil
}

// Builder builds the merge command with the following signature:
// changelog create -b path_folder -r path_folder --dry-run
func CreateBuilder() *cobra.Command {
	opts := &Opts{
		fs: afero.NewOsFs(),
	}

	cmd := &cobra.Command{
		Use:     "create -b path_folder -r path_folder --dry-run ...",
		Aliases: []string{"generate"},
		Short:   "Generate the changelog for the OpenAPI spec.",
		Args:    cobra.NoArgs,
		PreRunE: func(_ *cobra.Command, args []string) error {
			return opts.PreRunE(args)
		},
		RunE: func(_ *cobra.Command, _ []string) error {
			return opts.Run()
		},
	}

	cmd.Flags().StringVarP(&opts.basePath, flag.Base, flag.BaseShort, "", usage.BaseFolder)
	cmd.Flags().StringVarP(&opts.revisionPath, flag.Revision, flag.RevisionShort, "", usage.RevisionFolder)
	cmd.Flags().StringVarP(&opts.exceptionsPaths, flag.ExceptionFilePath, flag.ExceptionFilePathShort, "", usage.ExceptionFilePath)
	cmd.Flags().BoolVarP(&opts.dryRun, flag.DryRun, flag.DryRunShort, false, usage.DryRun)

	_ = cmd.MarkFlagRequired(flag.Base)
	_ = cmd.MarkFlagRequired(flag.Revision)

	return cmd
}
