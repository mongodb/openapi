// Copyright 2025 MongoDB Inc
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//	http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package slice

import (
	"errors"
	"fmt"
	"log"

	"github.com/mongodb/openapi/tools/cli/internal/cli/flag"
	"github.com/mongodb/openapi/tools/cli/internal/cli/usage"
	"github.com/mongodb/openapi/tools/cli/internal/openapi"
	"github.com/mongodb/openapi/tools/cli/internal/openapi/slice"
	"github.com/spf13/afero"
	"github.com/spf13/cobra"
)

type Opts struct {
	fs           afero.Fs
	basePath     string
	outputPath   string
	format       string
	operationIDs []string
	tags         []string
	paths        []string
}

func (o *Opts) Run() error {
	loader := openapi.NewOpenAPI3()
	specInfo, err := loader.CreateOpenAPISpecFromPath(o.basePath)
	if err != nil {
		return err
	}

	criteria := &slice.Criteria{
		OperationIDs: o.operationIDs,
		Tags:         o.tags,
		Paths:        o.paths,
	}

	// Log what we're slicing
	if len(criteria.OperationIDs) > 0 {
		log.Printf("Slicing operations by IDs: %v", criteria.OperationIDs)
	}
	if len(criteria.Tags) > 0 {
		log.Printf("Slicing operations by tags: %v", criteria.Tags)
	}
	if len(criteria.Paths) > 0 {
		log.Printf("Slicing operations by paths: %v", criteria.Paths)
	}

	// Slice the spec (includes automatic cleanup of unused tags and schemas)
	if err := slice.Slice(specInfo.Spec, criteria); err != nil {
		return err
	}

	// Validate the sliced spec
	if err := specInfo.Spec.Validate(loader.Loader.Context); err != nil {
		log.Printf("[WARN] Sliced OpenAPI document has validation warnings: %v", err)
	}

	return openapi.Save(o.outputPath, specInfo.Spec, o.format, o.fs)
}

func (o *Opts) PreRunE(_ []string) error {
	if o.basePath == "" {
		return fmt.Errorf("no OAS detected. Please, use the flag %s to include the base OAS", flag.Spec)
	}

	if len(o.operationIDs) == 0 && len(o.tags) == 0 && len(o.paths) == 0 {
		return errors.New("at least one of --operation-ids, --tags, or --paths must be specified")
	}

	return openapi.ValidateFormatAndOutput(o.format, o.outputPath)
}

// Builder builds the slice command with the following signature:
// slice -s spec -o output.json --operation-ids "op1,op2" --tags "tag1,tag2" --paths "/api/v1".
func Builder() *cobra.Command {
	opts := &Opts{
		fs: afero.NewOsFs(),
	}

	cmd := &cobra.Command{
		Use:   "slice -s spec",
		Short: "Slice a subset of an OpenAPI specification by operation IDs, tags, or paths",
		Long: `Slice creates a valid mini OpenAPI specification containing only the operations
that match the specified criteria. The output includes all necessary schemas and
components referenced by the selected operations.

You can filter by:
  - Operation IDs: Specific operation identifiers
  - Tags: Operations tagged with specific values
  - Paths: Operations under specific path patterns

Multiple values can be specified as comma-separated lists.`,
		Example: `  # Slice specific operations by ID:
  foascli slice -s spec.yaml -o subset.yaml --operation-ids "getUser,createUser"

  # Slice operations by tags:
  foascli slice -s spec.yaml -o subset.yaml --tags "Users,Authentication"

  # Slice operations by path patterns:
  foascli slice -s spec.yaml -o subset.yaml --paths "/api/v1/users"

  # Combine multiple criteria:
  foascli slice -s spec.yaml -o subset.yaml --tags "Users" --paths "/api/v1"`,
		Args: cobra.NoArgs,
		PreRunE: func(_ *cobra.Command, args []string) error {
			return opts.PreRunE(args)
		},
		RunE: func(_ *cobra.Command, _ []string) error {
			return opts.Run()
		},
	}

	cmd.Flags().StringVarP(&opts.basePath, flag.Spec, flag.SpecShort, "-", usage.Spec)
	cmd.Flags().StringVarP(&opts.outputPath, flag.Output, flag.OutputShort, "", usage.Output)
	cmd.Flags().StringVarP(&opts.format, flag.Format, flag.FormatShort, openapi.ALL, usage.Format)
	cmd.Flags().StringSliceVar(&opts.operationIDs, flag.OperationIDs, []string{}, usage.OperationIDs)
	cmd.Flags().StringSliceVar(&opts.tags, flag.Tags, []string{}, usage.Tags)
	cmd.Flags().StringSliceVar(&opts.paths, flag.Paths, []string{}, usage.Paths)

	// Required flags
	_ = cmd.MarkFlagRequired(flag.Output)
	_ = cmd.MarkFlagRequired(flag.Spec)
	cmd.MarkFlagsOneRequired(flag.Tags, flag.Paths, flag.OperationIDs)

	return cmd
}
