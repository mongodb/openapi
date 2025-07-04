// Copyright 2025 MongoDB Inc
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

type ListOpts struct {
	fs         afero.Fs
	basePath   string
	outputPath string
	format     string
	from       string
	to         string
	toDate     *time.Time
	fromDate   *time.Time
}

func (o *ListOpts) Run() error {
	loader := openapi.NewOpenAPI3()
	specInfo, err := loader.CreateOpenAPISpecFromPath(o.basePath)
	if err != nil {
		return err
	}

	sunsets, err := o.newSunsetInRange(sunset.NewListFromSpec(specInfo))
	if err != nil {
		return err
	}

	// order sunset elements per Path,Operation in ascending order
	sort.Slice(sunsets, func(i, j int) bool {
		if sunsets[i].Path != sunsets[j].Path {
			return sunsets[i].Path < sunsets[j].Path
		}
		return sunsets[i].Operation < sunsets[j].Operation
	})

	bytes, err := o.newSunsetListBytes(sunsets)
	if err != nil {
		return err
	}
	if o.outputPath != "" {
		return afero.WriteFile(o.fs, o.outputPath, bytes, 0o600)
	}

	fmt.Println(string(bytes))
	return nil
}

func (o *ListOpts) newSunsetInRange(sunsets []*sunset.Sunset) ([]*sunset.Sunset, error) {
	var out []*sunset.Sunset
	if o.from == "" && o.to == "" {
		return sunsets, nil
	}

	for _, s := range sunsets {
		sunsetDate, err := time.Parse("2006-01-02", s.SunsetDate)
		if err != nil {
			return nil, err
		}

		if isDateInRange(&sunsetDate, o.fromDate, o.toDate) {
			out = append(out, s)
		}
	}

	return out, nil
}

func isDateInRange(date, from, to *time.Time) bool {
	if date == nil {
		return false
	}

	if from != nil && date.Before(*from) {
		return false
	}

	if to != nil && date.After(*to) {
		return false
	}

	return true
}

func (o *ListOpts) newSunsetListBytes(versions []*sunset.Sunset) ([]byte, error) {
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

func (o *ListOpts) validate() error {
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

	return nil
}

// ListBuilder builds the merge command with the following signature:
// sunset ls -s spec.json -f 2024-01-01 -t 2024-09-22.
func ListBuilder() *cobra.Command {
	opts := &ListOpts{
		fs: afero.NewOsFs(),
	}

	cmd := &cobra.Command{
		Use:     "list -s spec.json -o json",
		Short:   "List API endpoints with a Sunset date for a given OpenAPI spec.",
		Aliases: []string{"ls"},
		Args:    cobra.NoArgs,
		PreRunE: func(_ *cobra.Command, _ []string) error {
			return opts.validate()
		},
		RunE: func(_ *cobra.Command, _ []string) error {
			return opts.Run()
		},
	}

	cmd.Flags().StringVarP(&opts.basePath, flag.Spec, flag.SpecShort, "", usage.Spec)
	cmd.Flags().StringVarP(&opts.outputPath, flag.Output, flag.OutputShort, "", usage.Output)
	cmd.Flags().StringVar(&opts.from, flag.From, "", usage.From)
	cmd.Flags().StringVar(&opts.to, flag.To, "", usage.To)
	cmd.Flags().StringVarP(&opts.format, flag.Format, flag.FormatShort, "json", usage.Format)

	_ = cmd.MarkFlagRequired(flag.Spec)

	return cmd
}
