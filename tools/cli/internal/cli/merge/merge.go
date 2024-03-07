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
	"github.com/spf13/cobra"
	"github.com/tufin/oasdiff/load"
)

type Opts struct {
	Base       *load.SpecInfo
	outputPath string
}

func (o *Opts) Run(args []string) error {
	// To add in follow up PR: CLOUDP-225849
	return nil
}

func (o *Opts) removeExternalReferences(paths []string, federated *load.SpecInfo) ([]byte, error) {
	// To add in follow up PR: CLOUDP-225849
	return nil, nil

}
func (o *Opts) saveFile(data []byte) error {
	return nil
}

func (o *Opts) PreRunE(args []string) error {
	// To Add in follow up PR: CLOUDP-225849
	return nil
}

func Builder() *cobra.Command {
	opts := &Opts{}

	cmd := &cobra.Command{
		Use:   "merge [base-spec] [spec-1] [spec-2] [spec-3] ... [spec-n]",
		Short: "Merge Open API specifications into a base spec.",
		Args:  cobra.MinimumNArgs(2),
		PreRunE: func(cmd *cobra.Command, args []string) error {
			return opts.PreRunE(args)
		},
		RunE: func(cmd *cobra.Command, args []string) error {
			return opts.Run(args)
		},
	}

	return cmd
}
