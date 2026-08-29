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

package check

import (
	"encoding/json"
	"fmt"
	"github.com/mongodb/openapi/tools/cli/internal/breakingchanges/customcheckers"

	"github.com/mongodb/openapi/tools/cli/internal/cli/flag"
	"github.com/mongodb/openapi/tools/cli/internal/cli/usage"
	"github.com/mongodb/openapi/tools/cli/internal/openapi"
	"github.com/oasdiff/oasdiff/checker"
	"github.com/oasdiff/oasdiff/diff"
	"github.com/spf13/afero"
	"github.com/spf13/cobra"
)

type Opts struct {
	fs           afero.Fs
	basePath     string
	revisionPath string
	outputPath   string
}

func (o *Opts) Run() error {
	// Load the base spec
	parser := openapi.NewOpenAPI3()
	baseSpec, err := parser.CreateOpenAPISpecFromPath(o.basePath)
	if err != nil {
		return fmt.Errorf("failed to load base spec: %w", err)
	}

	// Load the revision spec
	revisionSpec, err := parser.CreateOpenAPISpecFromPath(o.revisionPath)
	if err != nil {
		return fmt.Errorf("failed to load revision spec: %w", err)
	}

	// Create OasDiff instance
	oasDiff := openapi.NewOasDiffWithSpecInfo(baseSpec, revisionSpec, &diff.Config{
		IncludePathParams: true,
	})

	// Get the flattened diff
	diffResult, err := oasDiff.GetFlattenedDiff(baseSpec, revisionSpec)
	if err != nil {
		return fmt.Errorf("failed to get diff: %w", err)
	}

	// Load default and custom checkers and rules
	checks := append(checker.GetAllChecks(), customcheckers.GetAllChecks()...)
	rules := append(checker.GetAllRules(), customcheckers.GetAllRules()...)

	// Set log levels for each rule
	ids := make(map[string]checker.Level)
	for _, rule := range rules {
		ids[rule.Id] = rule.Level
	}

	// Create checker config
	config := &checker.Config{
		Checks:              checks,
		LogLevels:           ids,
		Attributes:          make([]string, 0),
		MinSunsetBetaDays:   365, // TODO: not sure what this does, it's used downstream
		MinSunsetStableDays: 365, // TODO: not sure what this does, it's used downstream
	}

	// Additional checks used downstream
	breakingChangesAdditionalCheckers := []string{
		"response-non-success-status-removed",
		"api-operation-id-removed",
		"api-tag-removed",
		"response-property-enum-value-removed",
		"response-mediatype-enum-value-removed",
		"request-body-enum-value-removed",
		"api-schema-removed",
	}

	// Add additional checkers used downstream, sets them to ERR level by default
	config = config.WithOptionalChecks(breakingChangesAdditionalCheckers)

	// Check for breaking changes
	breakingChanges := checker.CheckBackwardCompatibilityUntilLevel(
		config,
		diffResult.Report,
		diffResult.SourceMap,
		checker.ERR, // TODO: Use flag for setting level (default to WARN)
	)

	// Format the output as JSON
	output, err := json.MarshalIndent(breakingChanges, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal breaking changes: %w", err)
	}

	// Write to output file or print to terminal
	if o.outputPath != "" {
		if err := afero.WriteFile(o.fs, o.outputPath, output, 0o644); err != nil {
			return fmt.Errorf("failed to write output file: %w", err)
		}
		fmt.Printf("Breaking changes written to %s\n", o.outputPath)
	} else {
		fmt.Println(string(output))
	}

	return nil
}

func (o *Opts) PreRunE() error {
	if o.basePath == "" {
		return fmt.Errorf("base spec path is required")
	}

	if o.revisionPath == "" {
		return fmt.Errorf("revision spec path is required")
	}

	// Validate that the files exist
	if _, err := o.fs.Stat(o.basePath); err != nil {
		return fmt.Errorf("base spec file not found: %w", err)
	}

	if _, err := o.fs.Stat(o.revisionPath); err != nil {
		return fmt.Errorf("revision spec file not found: %w", err)
	}

	return nil
}

// Builder builds the check command with the following signature:
// breaking-changes check -b base-spec -r revision-spec [-o output-file].
func Builder() *cobra.Command {
	opts := &Opts{
		fs: afero.NewOsFs(),
	}

	cmd := &cobra.Command{
		Use:   "check -b base-spec -r revision-spec [-o output-file]",
		Short: "Check breaking changes between two OpenAPI specifications.",
		Long: `Check breaking changes between two OpenAPI specifications using OasDiff.
The command compares a base specification with a revision specification and reports
any breaking changes found. By default, the results are printed to the terminal,
but can be written to a file using the --output flag.`,
		Args: cobra.NoArgs,
		PreRunE: func(_ *cobra.Command, _ []string) error {
			return opts.PreRunE()
		},
		RunE: func(_ *cobra.Command, _ []string) error {
			return opts.Run()
		},
	}

	cmd.Flags().StringVarP(&opts.basePath, flag.Base, flag.BaseShort, "", usage.Base)
	cmd.Flags().StringVarP(&opts.revisionPath, flag.Revision, flag.RevisionShort, "", usage.Revision)
	cmd.Flags().StringVarP(&opts.outputPath, flag.Output, flag.OutputShort, "", usage.Output)

	_ = cmd.MarkFlagRequired(flag.Base)
	_ = cmd.MarkFlagRequired(flag.Revision)

	return cmd
}
