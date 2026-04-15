// Copyright 2026 MongoDB Inc
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

package sunset

import (
	"encoding/json"
	"fmt"
	"sort"
	"strings"

	"github.com/mongodb/openapi/tools/cli/internal/cli/flag"
	"github.com/mongodb/openapi/tools/cli/internal/cli/usage"
	"github.com/mongodb/openapi/tools/cli/internal/openapi"
	"github.com/mongodb/openapi/tools/cli/internal/openapi/sunset"
	"github.com/spf13/afero"
	"github.com/spf13/cobra"
	"gopkg.in/yaml.v3"
)

type DiffOpts struct {
	fs         afero.Fs
	basePath   string
	specPath   string
	outputPath string
	format     string
}

type Diff struct {
	Operation      string `json:"http_method" yaml:"http_method"`
	Path           string `json:"path" yaml:"path"`
	Version        string `json:"version" yaml:"version"`
	BaseSunsetDate string `json:"base_sunset_date" yaml:"base_sunset_date"`
	SpecSunsetDate string `json:"spec_sunset_date" yaml:"spec_sunset_date"`
	BaseSpec       string `json:"base_spec" yaml:"base_spec"`
	Spec           string `json:"spec" yaml:"spec"`
	Team           string `json:"team" yaml:"team"`
}

func (o *DiffOpts) Run() error {
	loader := openapi.NewOpenAPI3()

	// Load base spec
	baseSpecInfo, err := loader.CreateOpenAPISpecFromPath(o.basePath)
	if err != nil {
		return err
	}

	// Load comparison spec
	specInfo, err := loader.CreateOpenAPISpecFromPath(o.specPath)
	if err != nil {
		return err
	}

	// Get sunsets from both specs
	baseSunsets := sunset.NewListFromSpec(baseSpecInfo)
	specSunsets := sunset.NewListFromSpec(specInfo)

	// Find differences
	var diffs = findDiffs(baseSunsets, specSunsets, o.basePath, o.specPath)

	// Write to output
	bytes, err := o.newSunsetDiffBytes(diffs)
	if err != nil {
		return err
	}

	if o.outputPath != "" {
		return afero.WriteFile(o.fs, o.outputPath, bytes, 0o600)
	}

	fmt.Println(string(bytes))
	return nil
}

func findDiffs(baseSunsets, specSunsets []*sunset.Sunset, baseSpecPath, specPath string) []*Diff {
	// Create maps for easy lookup
	baseMap := make(map[string]*sunset.Sunset)
	for _, s := range baseSunsets {
		key := makeKey(s.Path, s.Operation, s.Version)
		baseMap[key] = s
	}

	specMap := make(map[string]*sunset.Sunset)
	for _, s := range specSunsets {
		key := makeKey(s.Path, s.Operation, s.Version)
		specMap[key] = s
	}

	// Find differences
	var diffs []*Diff

	// Check endpoints in base spec
	for key, baseSunset := range baseMap {
		if specSunset, exists := specMap[key]; exists {
			// Endpoint exists in both specs
			if baseSunset.SunsetDate != specSunset.SunsetDate {
				// Different sunset dates
				diffs = append(diffs, &Diff{
					Operation:      baseSunset.Operation,
					Path:           baseSunset.Path,
					Version:        baseSunset.Version,
					BaseSunsetDate: baseSunset.SunsetDate,
					SpecSunsetDate: specSunset.SunsetDate,
					BaseSpec:       baseSpecPath,
					Spec:           specPath,
					Team:           baseSunset.Team,
				})
			}
		} else {
			// Endpoint only in base spec (has sunset in base, not in spec)
			diffs = append(diffs, &Diff{
				Operation:      baseSunset.Operation,
				Path:           baseSunset.Path,
				Version:        baseSunset.Version,
				BaseSunsetDate: baseSunset.SunsetDate,
				SpecSunsetDate: "",
				BaseSpec:       baseSpecPath,
				Spec:           specPath,
				Team:           baseSunset.Team,
			})
		}
	}

	// Check endpoints only in spec (has sunset in spec, not in base)
	for key, specSunset := range specMap {
		if _, exists := baseMap[key]; !exists {
			diffs = append(diffs, &Diff{
				Operation:      specSunset.Operation,
				Path:           specSunset.Path,
				Version:        specSunset.Version,
				BaseSunsetDate: "",
				SpecSunsetDate: specSunset.SunsetDate,
				BaseSpec:       baseSpecPath,
				Spec:           specPath,
				Team:           specSunset.Team,
			})
		}
	}

	// Sort diffs by path, operation and version for consistent output
	sort.Slice(diffs, func(i, j int) bool {
		iKey := makeKey(diffs[i].Path, diffs[i].Operation, diffs[i].Version)
		jKey := makeKey(diffs[j].Path, diffs[j].Operation, diffs[j].Version)
		return iKey < jKey
	})

	return diffs
}

func makeKey(path, operation, version string) string {
	return operation + "-" + path + "-" + version
}

func (o *DiffOpts) newSunsetDiffBytes(diffs []*Diff) ([]byte, error) {
	data, err := json.MarshalIndent(diffs, "", "  ")
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

// DiffBuilder builds the diff command with the following signature:
// sunset diff --base base-spec.json --spec spec.json.
func DiffBuilder() *cobra.Command {
	opts := &DiffOpts{
		fs: afero.NewOsFs(),
	}

	cmd := &cobra.Command{
		Use:   "diff --base spec1.json --spec spec2.json",
		Short: "List API endpoints with different sunset dates between two OpenAPI specs.",
		Args:  cobra.NoArgs,
		RunE: func(_ *cobra.Command, _ []string) error {
			return opts.Run()
		},
	}

	cmd.Flags().StringVarP(&opts.basePath, flag.Base, flag.BaseShort, "", usage.Base)
	cmd.Flags().StringVarP(&opts.specPath, flag.Spec, flag.SpecShort, "", usage.Spec)
	cmd.Flags().StringVarP(&opts.outputPath, flag.Output, flag.OutputShort, "", usage.Output)
	cmd.Flags().StringVarP(&opts.format, flag.Format, flag.FormatShort, "json", usage.Format)

	_ = cmd.MarkFlagRequired(flag.Base)
	_ = cmd.MarkFlagRequired(flag.Spec)

	return cmd
}
