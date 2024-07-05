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

package split

import (
	"fmt"
	"log"
	"strings"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/mongodb/openapi/tools/cli/internal/cli/flag"
	"github.com/mongodb/openapi/tools/cli/internal/cli/usage"
	"github.com/mongodb/openapi/tools/cli/internal/openapi"
	"github.com/mongodb/openapi/tools/cli/internal/openapi/filter"
	"github.com/spf13/afero"
	"github.com/spf13/cobra"
)

type Opts struct {
	fs             afero.Fs
	basePath       string
	outputPath     string
	format         string
	splitByVersion bool
}

func (o *Opts) Run() error {
	if !o.splitByVersion {
		return nil
	}

	oas := openapi.Load(o.basePath)
	// TODO: Our specs are invalid. Oasdiff does not run this check.
	//  Would be good to have this check in the future.
	// if err := doc.Validate(loader.Context); err != nil {como
	// 	log.Fatalf("OpenAPI document is invalid: %v", err)
	// }

	versions := openapi.ExtractVersions(oas)
	for _, version := range versions {
		// TODO: filter oas by version
		oas, _ := o.filter(oas, version)
		if err := o.writeVersionedOas(oas, version); err != nil {
			log.Fatalf("Failed to write OpenAPI document: %v", err)
		}
	}

	return nil
}

func (o *Opts) filter(oas *openapi3.T, version string) (result *openapi3.T, err error) {
	log.Printf("Filtering OpenAPI document by version %s", version)
	return oas, filter.ApplyFilters(oas)
}

func (o *Opts) writeVersionedOas(oas *openapi3.T, version string) error {
	if o.outputPath == "" {
		path := strings.Replace(o.basePath, ".yaml", fmt.Sprintf("-%s.yaml", version), 1)
		return openapi.Save(path, oas, o.format, o.fs)
	}

	path := strings.Replace(o.outputPath, ".yaml", fmt.Sprintf("-%s.yaml", version), 1)
	return openapi.Save(path, oas, o.format, o.fs)
}

func (o *Opts) PreRunE(_ []string) error {
	if o.basePath == "" {
		return fmt.Errorf("no OAS detected. Please, use the flag %s to include the base OAS", flag.Base)
	}

	if o.outputPath != "" && !strings.Contains(o.outputPath, ".json") && !strings.Contains(o.outputPath, ".yaml") {
		return fmt.Errorf("output file must be either a JSON or YAML file, got %s", o.outputPath)
	}

	if o.format != "json" && o.format != "yaml" {
		return fmt.Errorf("output format must be either 'json' or 'yaml', got %s", o.format)
	}

	return nil
}

// Builder builds the split command with the following signature:
// split -b base-oas -o output-oas.json -v
func Builder() *cobra.Command {
	opts := &Opts{
		fs: afero.NewOsFs(),
	}

	cmd := &cobra.Command{
		Use:   "split -s spec ",
		Short: "Split Open API specification into others by version, environment or both.",
		Args:  cobra.NoArgs,
		PreRunE: func(_ *cobra.Command, args []string) error {
			return opts.PreRunE(args)
		},
		RunE: func(_ *cobra.Command, _ []string) error {
			return opts.Run()
		},
	}

	cmd.Flags().StringVarP(&opts.basePath, flag.Spec, flag.SpecShort, "", usage.Spec)
	cmd.Flags().StringVarP(&opts.outputPath, flag.Output, flag.OutputShort, "", usage.Output)
	cmd.Flags().StringVarP(&opts.format, flag.Format, flag.FormatShort, "json", usage.Format)
	cmd.Flags().BoolVarP(&opts.splitByVersion, flag.Versions, flag.VersionsShort, false, usage.Versions)
	return cmd
}
