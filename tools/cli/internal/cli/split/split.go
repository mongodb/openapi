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
	"encoding/json"
	"fmt"
	"log"
	"strings"

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
	fs         afero.Fs
	basePath   string
	outputPath string
	env        string
	format     string
}

func (o *Opts) Run() error {
	loader := openapi.NewOpenAPI3()
	specInfo, err := loader.CreateOpenAPISpecFromPath(o.basePath)
	if err != nil {
		return err
	}

	oas := specInfo.Spec
	versions := openapi.ExtractVersions(oas)

	for _, version := range versions {
		// make a copy of the oas to avoid modifying the original document when applying filters
		versionedOas, err := duplicateOas(oas)
		if err != nil {
			return err
		}

		filteredOAS, err := o.filter(versionedOas, version)
		if err != nil {
			return err
		}

		if err := o.saveVersionedOas(filteredOAS, version); err != nil {
			return err
		}

		if err := filteredOAS.Validate(loader.Loader.Context); err != nil {
			log.Printf("[WARN] OpenAPI document is invalid: %v", err)
		}
	}

	return nil
}

func duplicateOas(doc *openapi3.T) (*openapi3.T, error) {
	// Marshal the original document to JSON
	jsonData, err := json.Marshal(doc)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal original OpenAPI specification: %w", err)
	}

	// Unmarshal the JSON data into a new OpenAPI document
	duplicateDoc := &openapi3.T{}
	err = json.Unmarshal(jsonData, duplicateDoc)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal duplicated OpenAPI specification: %w", err)
	}

	return duplicateDoc, nil
}

func (o *Opts) filter(oas *openapi3.T, version string) (result *openapi3.T, err error) {
	log.Printf("Filtering OpenAPI document by version %s", version)
	apiVersion, err := apiversion.New(apiversion.WithVersion(version))
	if err != nil {
		return nil, err
	}

	return oas, filter.ApplyFilters(oas, filter.NewMetadata(apiVersion, o.env))
}

func (o *Opts) saveVersionedOas(oas *openapi3.T, version string) error {
	path := o.basePath
	if o.outputPath != "" {
		path = o.outputPath
	}

	path = strings.Replace(path, fmt.Sprintf(".%s", o.format), fmt.Sprintf("-%s.%s", version, o.format), 1)
	return openapi.Save(path, oas, o.format, o.fs)
}

func (o *Opts) PreRunE(_ []string) error {
	if o.basePath == "" {
		return fmt.Errorf("no OAS detected. Please, use the flag %s to include the base OAS", flag.Base)
	}

	if o.outputPath != "" && !strings.Contains(o.outputPath, openapi.DotJSON) && !strings.Contains(o.outputPath, openapi.DotYAML) {
		return fmt.Errorf("output file must be either a JSON or YAML file, got %s", o.outputPath)
	}

	if o.format != openapi.JSON && o.format != openapi.YAML {
		return fmt.Errorf("output format must be either 'json' or 'yaml', got %s", o.format)
	}

	if strings.Contains(o.basePath, openapi.DotYAML) {
		o.format = openapi.YAML
	}

	return nil
}

// Builder builds the split command with the following signature:
// split -b base-oas -o output-oas.json
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
	cmd.Flags().StringVar(&opts.env, flag.Environment, "", usage.Environment)
	cmd.Flags().StringVarP(&opts.outputPath, flag.Output, flag.OutputShort, "", usage.Output)
	cmd.Flags().StringVarP(&opts.format, flag.Format, flag.FormatShort, openapi.JSON, usage.Format)

	_ = cmd.MarkFlagRequired(flag.Spec)

	return cmd
}
