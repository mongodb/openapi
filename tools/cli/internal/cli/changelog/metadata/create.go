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
	"encoding/json"
	"fmt"
	"time"

	"github.com/mongodb/openapi/tools/cli/internal/changelog"
	"github.com/mongodb/openapi/tools/cli/internal/cli/flag"
	"github.com/mongodb/openapi/tools/cli/internal/cli/usage"
	"github.com/mongodb/openapi/tools/cli/internal/openapi"
	"github.com/spf13/afero"
	"github.com/spf13/cobra"
)

type Opts struct {
	fs           afero.Fs
	specRevision string
	runDate      string
	versions     []string
	outputPath   string
}

func (o *Opts) Run() error {
	if o.runDate == "" {
		o.runDate = time.Now().Format("2006-01-02")
	}

	metadataBytes, err := json.MarshalIndent(*o.newMetadata(), "", "  ")
	if err != nil {
		return err
	}

	if o.outputPath == "" {
		fmt.Println(string(metadataBytes))
		return nil
	}

	return openapi.SaveToFile(o.outputPath, openapi.JSON, metadataBytes, o.fs)
}

func (o *Opts) newMetadata() *changelog.Metadata {
	return &changelog.Metadata{
		SpecRevision:      o.specRevision,
		SpecRevisionShort: o.specRevision[:11],
		RunDate:           o.runDate,
		Versions:          o.versions,
	}
}

func (o *Opts) PreRun() error {
	if o.runDate != "" {
		if _, err := time.Parse("2006-01-02", o.runDate); err != nil {
			return fmt.Errorf("invalid run date: %w. Make sure to use the format YYYY-MM-DD", err)
		}
	}

	for _, version := range o.versions {
		if _, err := time.Parse("2006-01-02", version); err != nil {
			return fmt.Errorf("invalid version date: %w. Make sure to use the format YYYY-MM-DD", err)
		}
	}

	return nil
}

// changelog metadata create [--run-date=2024-09-22] --sha=e624d716e86f6910757b60cefdf3aa3181582d38 versions=2023-01-01,2023-02-01
func CreateBuilder() *cobra.Command {
	opts := &Opts{
		fs: afero.NewOsFs(),
	}

	cmd := &cobra.Command{
		Use:     "create",
		Aliases: []string{"generate"},
		Short:   "Generate the changelog for the OpenAPI spec.",
		Args:    cobra.NoArgs,
		PreRunE: func(_ *cobra.Command, _ []string) error {
			return opts.PreRun()
		},

		RunE: func(_ *cobra.Command, _ []string) error {
			return opts.Run()
		},
	}

	cmd.Flags().StringVarP(&opts.runDate, flag.RunDate, flag.RunDateShort, "", usage.RunDate)
	cmd.Flags().StringVar(&opts.specRevision, flag.GitSha, "", usage.GitShaChangelog)
	cmd.Flags().StringSliceVarP(&opts.versions, flag.Versions, flag.VersionsShort, []string{}, usage.VersionsChangelog)
	cmd.Flags().StringVarP(&opts.outputPath, flag.Output, flag.OutputShort, "", usage.Output)

	_ = cmd.MarkFlagRequired(flag.GitSha)
	_ = cmd.MarkFlagRequired(flag.Versions)

	return cmd
}
