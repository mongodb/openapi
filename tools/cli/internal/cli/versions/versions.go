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
	"errors"
	"fmt"
	"strings"

	"github.com/mongodb/openapi/tools/cli/internal/apiversion"
	"github.com/mongodb/openapi/tools/cli/internal/cli/flag"
	"github.com/mongodb/openapi/tools/cli/internal/cli/usage"
	"github.com/mongodb/openapi/tools/cli/internal/openapi"
	"github.com/spf13/afero"
	"github.com/spf13/cobra"
	"gopkg.in/yaml.v3"
)

type Opts struct {
	fs             afero.Fs
	basePath       string
	outputPath     string
	format         string
	env            string
	stabilityLevel []string
}

func (o *Opts) Run() error {
	loader := openapi.NewOpenAPI3()
	specInfo, err := loader.CreateOpenAPISpecFromPath(o.basePath)
	if err != nil {
		return err
	}

	var versions []string
	versions, err = openapi.ExtractVersionsWithEnv(specInfo.Spec, o.env)
	if err != nil {
		return err
	}

	if versions == nil {
		return errors.New("no versions found in the OpenAPI specification")
	}

	versions = o.filterStabilityLevelVersions(versions)
	bytes, err := o.versionsAsBytes(versions)
	if err != nil {
		return err
	}

	if o.outputPath != "" {
		return afero.WriteFile(o.fs, o.outputPath, bytes, 0o600)
	}

	fmt.Println(string(bytes))
	return nil
}

func (o *Opts) filterStabilityLevelVersions(apiVersions []string) []string {
	if len(o.stabilityLevel) == 0 || apiVersions == nil {
		return apiVersions
	}

	var out []string
	for _, v := range apiVersions {
		for _, stabilityLevel := range o.stabilityLevel {
			if (apiversion.IsStableStabilityLevel(stabilityLevel)) && !apiversion.IsPreviewStabilityLevel(v) {
				out = append(out, v)
			}

			if (apiversion.IsPrivatePreviewStabilityLevel(stabilityLevel)) && apiversion.IsPrivatePreviewStabilityLevel(v) {
				out = append(out, v)
			}

			if (apiversion.IsPublicPreviewStabilityLevel(stabilityLevel)) && apiversion.IsPublicPreviewStabilityLevel(v) {
				out = append(out, v)
			}

			if apiversion.IsUpcomingStabilityLevel(stabilityLevel) && apiversion.IsUpcomingStabilityLevel(v) {
				out = append(out, v)
			}
		}
	}

	if len(out) == 0 {
		return []string{}
	}
	return out
}

func (o *Opts) versionsAsBytes(versions []string) ([]byte, error) {
	data, err := json.MarshalIndent(versions, "", "  ")
	if err != nil {
		return nil, err
	}

	if format := strings.ToLower(o.format); format == "json" {
		return data, nil
	}

	var jsonData any
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
	for i, v := range o.stabilityLevel {
		o.stabilityLevel[i] = strings.ToLower(v)

		if err := apiversion.ValidateStabilityLevel(o.stabilityLevel[i]); err != nil {
			return err
		}
	}

	if o.basePath == "" {
		return fmt.Errorf("no OAS detected. Please, use the flag %q to include the base OAS", flag.Base)
	}

	if o.outputPath != "" && !strings.Contains(o.outputPath, ".json") && !strings.Contains(o.outputPath, ".yaml") {
		return fmt.Errorf("output file must be either a JSON or YAML file, got %q", o.outputPath)
	}

	if o.format != "json" && o.format != "yaml" {
		return fmt.Errorf("output format must be either 'json' or 'yaml', got %q", o.format)
	}

	return nil
}

// Builder builds the versions command with the following signature:
// versions -s oas --env dev|qa|staging|prod -stability-level STABLE|UPCOMING|PREVIEW.
func Builder() *cobra.Command {
	opts := &Opts{
		fs: afero.NewOsFs(),
	}

	cmd := &cobra.Command{
		Use:     "versions -s spec ",
		Aliases: []string{"versions list", "versions ls"},
		Short:   "Get a list of versions from an OpenAPI specification.",
		Args:    cobra.NoArgs,
		PreRunE: func(_ *cobra.Command, args []string) error {
			return opts.PreRunE(args)
		},
		RunE: func(_ *cobra.Command, _ []string) error {
			return opts.Run()
		},
	}

	cmd.Flags().StringVarP(&opts.basePath, flag.Spec, flag.SpecShort, "", usage.Spec)
	cmd.Flags().StringVar(&opts.env, flag.Environment, "", usage.Environment)
	cmd.Flags().StringArrayVar(&opts.stabilityLevel, flag.StabilityLevel, nil, usage.StabilityLevel)
	cmd.Flags().StringVarP(&opts.outputPath, flag.Output, flag.OutputShort, "", usage.Output)
	cmd.Flags().StringVarP(&opts.format, flag.Format, flag.FormatShort, "json", usage.Format)
	return cmd
}
