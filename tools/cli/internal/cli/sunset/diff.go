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
	"time"

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
	from       string
	to         string
	toDate     *time.Time
	fromDate   *time.Time
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
	diffs, err := o.findDiffs(baseSunsets, specSunsets)
	if err != nil {
		return err
	}

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

func (o *DiffOpts) findDiffs(baseSunsets, specSunsets []*sunset.Sunset) ([]*Diff, error) {
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
				diffs = append(diffs, &Diff{
					Operation:      baseSunset.Operation,
					Path:           baseSunset.Path,
					Version:        baseSunset.Version,
					BaseSunsetDate: baseSunset.SunsetDate,
					SpecSunsetDate: specSunset.SunsetDate,
					BaseSpec:       o.basePath,
					Spec:           o.specPath,
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
				BaseSpec:       o.basePath,
				Spec:           o.specPath,
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
				BaseSpec:       o.basePath,
				Spec:           o.specPath,
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

	// Filter diffs by date range if specified
	filteredDiffs, err := o.diffsInRange(diffs)
	if err != nil {
		return nil, err
	}

	return filteredDiffs, nil
}

func (o *DiffOpts) diffsInRange(diffs []*Diff) ([]*Diff, error) {
	var out []*Diff

	if o.from == "" && o.to == "" {
		return diffs, nil
	}

	for _, d := range diffs {
		baseSunsetDate, err := parseSunsetDate(d.BaseSunsetDate)
		if err != nil {
			return nil, err
		}

		specSunsetDate, err := parseSunsetDate(d.SpecSunsetDate)
		if err != nil {
			return nil, err
		}

		if isDateInRange(baseSunsetDate, o.fromDate, o.toDate) || isDateInRange(specSunsetDate, o.fromDate, o.toDate) {
			out = append(out, d)
		}
	}

	return out, nil
}

func parseSunsetDate(dateStr string) (*time.Time, error) {
	if dateStr == "" {
		return nil, nil
	}
	parsedDate, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		return nil, err
	}
	return &parsedDate, err
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

func (o *DiffOpts) validate() error {
	if o.from != "" {
		value, err := time.Parse("2006-01-02", o.from)
		if err != nil {
			return err
		}
		o.fromDate = &value
	}

	if o.to != "" {
		value, err := time.Parse("2006-01-02", o.to)
		if err != nil {
			return err
		}
		o.toDate = &value
	}

	if o.from != "" && o.to != "" && o.fromDate.After(*o.toDate) {
		return fmt.Errorf("%s date cannot be after %s date", flag.From, flag.To)
	}

	return nil
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
		PreRunE: func(_ *cobra.Command, _ []string) error {
			return opts.validate()
		},
		RunE: func(_ *cobra.Command, _ []string) error {
			return opts.Run()
		},
	}

	cmd.Flags().StringVarP(&opts.basePath, flag.Base, flag.BaseShort, "", usage.Base)
	cmd.Flags().StringVarP(&opts.specPath, flag.Spec, flag.SpecShort, "", usage.Spec)
	cmd.Flags().StringVarP(&opts.outputPath, flag.Output, flag.OutputShort, "", usage.Output)
	cmd.Flags().StringVarP(&opts.format, flag.Format, flag.FormatShort, "json", usage.Format)
	cmd.Flags().StringVar(&opts.from, flag.From, "", usage.From)
	cmd.Flags().StringVar(&opts.to, flag.To, "", usage.To)

	_ = cmd.MarkFlagRequired(flag.Base)
	_ = cmd.MarkFlagRequired(flag.Spec)

	return cmd
}
