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
	"github.com/mongodb/openapi/tools/cli/internal/cli/flag"
	"github.com/mongodb/openapi/tools/cli/internal/cli/usage"
	"github.com/mongodb/openapi/tools/cli/internal/openapi"
	"github.com/spf13/afero"
	"github.com/spf13/cobra"
	"github.com/tufin/oasdiff/load"
	"gopkg.in/yaml.v3"
)

type Opts struct {
	Merger         openapi.Merger
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
	openapi3.CircularReferenceCounter = 15

	loader := openapi3.NewLoader()
	s1, err := load.NewSpecInfo(loader, load.NewSource(o.basePath))
	if err != nil {
		log.Fatalf("Failed to load OpenAPI document: %v", err)
	}

	oas := s1.Spec
	// Our specs are invalid
	// if err := doc.Validate(loader.Context); err != nil {
	// 	log.Fatalf("OpenAPI document is invalid: %v", err)
	// }

	versions := openapi.ExtractVersions(oas)
	for _, version := range versions {
		// TODO: filter oas by version
		if err := o.writeVersionedOas(oas, version); err != nil {
			log.Fatalf("Failed to write OpenAPI document: %v", err)
		}
	}

	return nil
}

func (o *Opts) writeVersionedOas(oas *openapi3.T, version string) error {
	federatedBytes, err := json.MarshalIndent(*oas, "", "  ")
	if err != nil {
		return err
	}

	if o.outputPath == "" {
		path := strings.Replace(o.basePath, ".yaml", fmt.Sprintf("-%s.yaml", version), 1)
		return o.saveFile(federatedBytes, path)
	}

	path := strings.Replace(o.outputPath, ".yaml", fmt.Sprintf("-%s.yaml", version), 1)
	return o.saveFile(federatedBytes, path)
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

func (o *Opts) saveFile(data []byte, path string) error {
	if strings.Contains(path, ".yaml") || o.format == "yaml" {
		var jsonData interface{}
		if err := json.Unmarshal(data, &jsonData); err != nil {
			return err
		}

		yamlData, err := yaml.Marshal(jsonData)
		if err != nil {
			return err
		}

		data = yamlData
	}

	if err := afero.WriteFile(o.fs, path, data, 0o600); err != nil {
		return err
	}

	log.Printf("\nVersioned spec was saved in '%s'.\n\n", path)
	return nil
}

// Builder builds the merge command with the following signature:
// merge -b base-oas -e external-oas-1 -e external-oas-2
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

	cmd.Flags().StringVarP(&opts.basePath, flag.Base, flag.BaseShort, "", usage.Base)
	cmd.Flags().StringVarP(&opts.outputPath, flag.Output, flag.OutputShort, "", usage.Output)
	cmd.Flags().StringVarP(&opts.format, flag.Format, flag.FormatShort, "json", usage.Format)
	cmd.Flags().BoolVar(&opts.splitByVersion, "versions", false, "Split by verision")
	return cmd
}
