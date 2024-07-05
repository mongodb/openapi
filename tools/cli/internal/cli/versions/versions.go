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

package versions

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/mongodb/openapi/tools/cli/internal/cli/flag"
	"github.com/mongodb/openapi/tools/cli/internal/cli/usage"
	"github.com/mongodb/openapi/tools/cli/internal/openapi"
	"github.com/spf13/afero"
	"github.com/spf13/cobra"
	"gopkg.in/yaml.v3"
)

type Opts struct {
	fs         afero.Fs
	basePath   string
	outputPath string
	format     string
}

func (o *Opts) Run() error {
	loader := openapi.NewOpenAPI3()
	specInfo, err := loader.CreateOpenAPISpecFromPath(o.basePath)
	if err != nil {
		return err
	}

	versions := openapi.ExtractVersions(specInfo.Spec)
	if versions == nil {
		return fmt.Errorf("no versions found in the OpenAPI specification")
	}

	bytes, err := o.getVersionBytes(versions)
	if err != nil {
		return err
	}

	if o.outputPath != "" {
		return afero.WriteFile(o.fs, o.outputPath, bytes, 0o600)
	}

	fmt.Println(string(bytes))
	return nil
}

func (o *Opts) getVersionBytes(versions []string) ([]byte, error) {
	data, err := json.MarshalIndent(versions, "", "  ")
	if err != nil {
		return nil, err
	}

	if format := strings.ToLower(o.format); format == "json" {
		return data, nil
	}

	var jsonData interface{}
	if mErr := json.Unmarshal(data, &jsonData); mErr != nil {
		return nil, mErr
	}

	yamlData, err := yaml.Marshal(jsonData)
	if err != nil {
		return nil, err
	}

	return yamlData, nil
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

// Builder builds the versions command with the following signature:
// versions -s oas
func Builder() *cobra.Command {
	opts := &Opts{
		fs: afero.NewOsFs(),
	}

	cmd := &cobra.Command{
		Use:   "versions -s spec ",
		Short: "Get a list of versions from an OpenAPI specification.",
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
	return cmd
}
