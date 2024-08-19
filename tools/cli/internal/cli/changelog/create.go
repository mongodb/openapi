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

package changelog

import (
	"fmt"
	"log"

	"github.com/mongodb/openapi/tools/cli/internal/changelog"
	"github.com/mongodb/openapi/tools/cli/internal/cli/flag"
	"github.com/mongodb/openapi/tools/cli/internal/cli/usage"
	"github.com/mongodb/openapi/tools/cli/internal/openapi"
	"github.com/spf13/afero"
	"github.com/spf13/cobra"
)

const (
	changelogFileName          = "changelog"
	changelogAllFileName       = "changelog-all"
	changelogAllFolderName     = "internal"
	versionChangelogFolderName = "version-diff"
	metadataFileName           = "metadata.json"
)

type Opts struct {
	fs              afero.Fs
	basePath        string
	revisionPath    string
	exceptionsPaths string
	outputPath      string
	dryRun          bool
}

func (o *Opts) Run() error {
	entries, err := changelog.NewEntries(o.basePath, o.revisionPath)
	if err != nil {
		return err
	}

	notHiddenEntries, err := changelog.NewNotHiddenEntries(entries)
	if err != nil {
		return err
	}

	versionedEntries, err := changelog.NewEntriesBetweenRevisionVersions(o.revisionPath)
	if err != nil {
		return err
	}

	if o.dryRun {
		log.Printf("Detected dry-run mode. No changes will be saved.\n")
		return nil
	}

	if err := o.fs.MkdirAll(fmt.Sprintf("%s/%s", o.outputPath, changelogAllFolderName), 0o755); err != nil {
		return err
	}

	if errSaveFile := openapi.SaveToFile(o.newOutputFilePath(changelogFileName), "", notHiddenEntries, o.fs); errSaveFile != nil {
		return errSaveFile
	}

	if errSaveFile := openapi.SaveToFile(
		o.newOutputFilePath(fmt.Sprintf("%s/%s", changelogAllFolderName, changelogAllFileName)), "", entries, o.fs); errSaveFile != nil {
		return errSaveFile
	}

	if err := o.fs.MkdirAll(fmt.Sprintf("%s/%s", o.outputPath, versionChangelogFolderName), 0o755); err != nil {
		return err
	}

	for _, entry := range versionedEntries {
		if errSaveFile := openapi.SaveToFile(
			o.newOutputFilePath(fmt.Sprintf("%s/%s_%s", versionChangelogFolderName, entry.FromVersion, entry.ToVersion)),
			openapi.JSON, entry.Paths, o.fs); errSaveFile != nil {
			return errSaveFile
		}
	}

	return nil
}

func (o *Opts) validations() error {
	if _, err := o.fs.Stat(fmt.Sprintf("%s/%s", o.basePath, metadataFileName)); err != nil {
		return err
	}

	if _, err := o.fs.Stat(fmt.Sprintf("%s/%s", o.revisionPath, metadataFileName)); err != nil {
		return err
	}

	if _, err := o.fs.Stat(o.exceptionsPaths); err != nil {
		return err
	}

	return nil
}

func (o *Opts) newOutputFilePath(fileName string) string {
	if o.outputPath != "" {
		return fmt.Sprintf("%s/%s", o.outputPath, fileName)
	}

	return fileName
}

// Builder builds the merge command with the following signature:
// changelog create -b path_folder -r path_folder --dry-run
func CreateBuilder() *cobra.Command {
	opts := &Opts{
		fs: afero.NewOsFs(),
	}

	cmd := &cobra.Command{
		Use:     "create -b path_folder -r path_folder --dry-run ...",
		Aliases: []string{"generate"},
		Short:   "Generate the changelog for the OpenAPI spec.",
		Args:    cobra.NoArgs,
		PreRunE: func(_ *cobra.Command, _ []string) error {
			return opts.validations()
		},
		RunE: func(_ *cobra.Command, _ []string) error {
			return opts.Run()
		},
	}

	cmd.Flags().StringVarP(&opts.basePath, flag.Base, flag.BaseShort, "", usage.BaseFolder)
	cmd.Flags().StringVarP(&opts.revisionPath, flag.Revision, flag.RevisionShort, "", usage.RevisionFolder)
	cmd.Flags().StringVarP(&opts.exceptionsPaths, flag.ExemptionFilePath, flag.ExemptionFilePathShort, "", usage.ExemptionFilePath)
	cmd.Flags().BoolVarP(&opts.dryRun, flag.DryRun, flag.DryRunShort, false, usage.DryRun)
	cmd.Flags().StringVarP(&opts.outputPath, flag.Output, flag.OutputShort, "", usage.Output)

	_ = cmd.MarkFlagRequired(flag.Base)
	_ = cmd.MarkFlagRequired(flag.Revision)

	return cmd
}
