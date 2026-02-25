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

package filter

import (
	"fmt"
	"log"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/mongodb/openapi/tools/cli/internal/apiversion"
	"github.com/mongodb/openapi/tools/cli/internal/cli/flag"
	"github.com/mongodb/openapi/tools/cli/internal/cli/usage"
	"github.com/mongodb/openapi/tools/cli/internal/openapi"
	"github.com/mongodb/openapi/tools/cli/internal/openapi/filter"
	"github.com/spf13/afero"
	"github.com/spf13/cobra"
)

type Opts struct {
	fs                afero.Fs
	basePath          string
	outputPath        string
	env               string
	versions          []string
	format            string
	keepIPAExceptions bool
}

func (o *Opts) Run() error {
	loader := openapi.NewOpenAPI3()
	specInfo, err := loader.CreateOpenAPISpecFromPath(o.basePath)
	if err != nil {
		return err
	}

	var filteredOAS *openapi3.T
	// If versions are provided, versioning filters will also be applied.
	if len(o.versions) > 0 {
		filteredOAS, err = ByVersions(specInfo.Spec, o.versions, o.env, o.keepIPAExceptions)
	} else {
		filters := filter.FiltersWithoutVersioning
		metadata := filter.NewMetadataWithIPAExceptions(nil, o.env, o.keepIPAExceptions)
		filteredOAS, err = filter.ApplyFilters(specInfo.Spec, metadata, filters)
	}

	if err != nil {
		return err
	}

	return openapi.Save(o.outputPath, filteredOAS, o.format, o.fs)
}

func ByVersion(oas *openapi3.T, version, env string, keepIPAExceptions bool) (result *openapi3.T, err error) {
	log.Printf("Filtering OpenAPI document by version %q", version)
	apiVersion, err := apiversion.New(apiversion.WithVersion(version))
	if err != nil {
		return nil, err
	}

	return filter.ApplyFilters(oas, filter.NewMetadataWithIPAExceptions(apiVersion, env, keepIPAExceptions), filter.DefaultFilters)
}

func ByVersions(oas *openapi3.T, versions []string, env string, keepIPAExceptions bool) (result *openapi3.T, err error) {
	if len(versions) == 0 {
		return nil, nil
	}

	if len(versions) == 1 {
		return ByVersion(oas, versions[0], env, keepIPAExceptions)
	}

	log.Printf("Filtering OpenAPI document by versions %v", versions)

	filteredSpecs := make([]*openapi3.T, 0, len(versions))
	for _, version := range versions {
		filtered, err := ByVersion(oas, version, env, keepIPAExceptions)
		if err != nil {
			return nil, fmt.Errorf("failed to filter by version %q: %w", version, err)
		}
		filteredSpecs = append(filteredSpecs, filtered)
	}

	return filter.MergeFilteredSpecs(filteredSpecs)
}

func (o *Opts) PreRunE(_ []string) error {
	if o.basePath == "" {
		return fmt.Errorf("no OAS detected. Please, use the flag %s to include the base OAS", flag.Base)
	}

	return openapi.ValidateFormatAndOutput(o.format, o.outputPath)
}

// Builder builds the filter command with the following signature:
// filter -s oas -o output-oas.json.
func Builder() *cobra.Command {
	opts := &Opts{
		fs: afero.NewOsFs(),
	}

	cmd := &cobra.Command{
		Use: "filter -s spec ",
		Short: `Filter Open API specification removing hidden endpoints and extension metadata. 
If a version is provided, versioning filters will also be applied.`,
		Args: cobra.NoArgs,
		PreRunE: func(_ *cobra.Command, args []string) error {
			return opts.PreRunE(args)
		},
		RunE: func(_ *cobra.Command, _ []string) error {
			return opts.Run()
		},
	}

	cmd.Flags().StringVarP(&opts.basePath, flag.Spec, flag.SpecShort, "-", usage.Spec)
	cmd.Flags().StringVar(&opts.env, flag.Environment, "", usage.Environment)
	cmd.Flags().StringVarP(&opts.outputPath, flag.Output, flag.OutputShort, "", usage.Output)
	cmd.Flags().StringSliceVar(&opts.versions, flag.Version, []string{}, usage.Version)
	cmd.Flags().StringVarP(&opts.format, flag.Format, flag.FormatShort, openapi.ALL, usage.Format)
	cmd.Flags().BoolVar(&opts.keepIPAExceptions, flag.KeepIPAExceptions, false, usage.KeepIPAExceptions)

	// Required flags
	_ = cmd.MarkFlagRequired(flag.Output)
	_ = cmd.MarkFlagRequired(flag.Spec)
	_ = cmd.MarkFlagRequired(flag.Environment)
	return cmd
}
