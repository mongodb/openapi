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
	"errors"
	"mongodb/openapi/tools/cli/internal/cli/flag"
	"mongodb/openapi/tools/cli/internal/cli/usage"

	"github.com/spf13/cobra"
	"github.com/tufin/oasdiff/load"
)

type Opts struct {
	Base          *load.SpecInfo
	BasePath      string
	ExternalPaths []string
}

func (o *Opts) Run(_ []string) error {
	// To add in follow up PR: CLOUDP-225849
	return nil
}

func (o *Opts) PreRunE(_ []string) error {
	if o.BasePath == "" {
		return errors.New("")
	}

	if o.ExternalPaths == nil {
		return errors.New("")
	}

	return nil
}

func Builder() *cobra.Command {
	opts := &Opts{}

	cmd := &cobra.Command{
		Use:   "merge -b [base-spec] -e [spec-1] -e [spec-2] -e [spec-3]",
		Short: "Merge Open API specifications into a base spec.",
		Args:  cobra.NoArgs,
		PreRunE: func(_ *cobra.Command, args []string) error {
			return opts.PreRunE(args)
		},
		RunE: func(_ *cobra.Command, args []string) error {
			return opts.Run(args)
		},
	}

	cmd.Flags().StringVarP(&opts.BasePath, flag.Base, flag.BaseShort, "", usage.Base)
	cmd.Flags().StringArrayVarP(&opts.ExternalPaths, flag.External, flag.ExternalShort, nil, usage.External)
	return cmd
}
