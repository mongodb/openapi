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
	"encoding/json"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/mongodb/openapi/tools/cli/internal/openapi"
	"github.com/spf13/afero"
	"github.com/tufin/oasdiff/checker"
	"github.com/tufin/oasdiff/diff"
	"github.com/tufin/oasdiff/load"
)

const (
	deprecationDaysStable = 365 //  min days required between deprecating a stable resource and removing it
	deprecationDaysBeta   = 365 //  min days required between deprecating a beta resource and removing it
	stabilityLevelStable  = "stable"
)

var breakingChangesAdditionalCheckers = []string{
	"response-non-success-status-removed",
	"api-operation-id-removed",
	"api-tag-removed",
	"response-property-enum-value-removed",
	"response-mediatype-enum-value-removed",
	"request-body-enum-value-removed",
	"api-schema-removed",
}

type Changelog struct {
	BaseMetadata      *Metadata
	RevisionMetadata  *Metadata
	Base              *load.SpecInfo //  the base spec to compare against the revision
	Revision          *load.SpecInfo //  the new spec to compare against the base
	BaseChangelog     []*Entry
	Config            *checker.Config
	OasDiff           *openapi.OasDiff
	ExemptionFilePath string
	RunDate           string
}

type Metadata struct {
	Path          string
	ActiveVersion string
	RunDate       string   `json:"runDate"`
	SpecRevision  string   `json:"specRevision"`
	Versions      []string `json:"versions"`
}

type Entry struct {
	Date        string  `json:"date"`
	Paths       []*Path `json:"paths"`
	FromVersion string
	ToVersion   string
}

type Path struct {
	URI            string     `json:"path"`
	HTTPMethod     string     `json:"httpMethod"`
	Versions       []*Version `json:"versions,omitempty"`
	OperationID    string     `json:"operationId"`
	Tag            string     `json:"tag"`
	StabilityLevel string     `json:"stabilityLevel,omitempty"`
	ChangeType     string     `json:"changeType,omitempty"`
	Changes        []*Change  `json:"changes,omitempty"`
}

type Version struct {
	Version        string    `json:"version"`
	Changes        []*Change `json:"changes"`
	StabilityLevel string    `json:"stabilityLevel"`
	ChangeType     string    `json:"changeType"`
}

type Change struct {
	Description        string `json:"change"`
	Code               string `json:"changeCode"`
	BackwardCompatible bool   `json:"backwardCompatible"`
	HideFromChangelog  bool   `json:"hideFromChangelog,omitempty"`
}

// NewEntries generates the changelog entries between the base and revision specs.
// The returned entries includes all the changes between the base and revision specs included the one
// marked as hidden.
func NewEntries(basePath, revisionPath, exemptionFilePath string, fs afero.Fs) ([]*Entry, error) {
	baseMetadata, err := newMetadataFromFile(basePath)
	if err != nil {
		return nil, err
	}
	log.Printf("Base Metadata: %s", newStringFromStruct(baseMetadata))

	revisionMetadata, err := newMetadataFromFile(revisionPath)
	if err != nil {
		return nil, err
	}
	log.Printf("Revision Metadata: %s", newStringFromStruct(revisionMetadata))

	revisionMetadata.RunDate = time.Now().Format("2006-01-02")

	baseActiveVersionOnPreviousRunDate, err := latestVersionActiveOnDate(baseMetadata.RunDate, baseMetadata.Versions)
	if err != nil {
		return nil, err
	}

	revisionActiveVersionOnPreviousRunDate, err := latestVersionActiveOnDate(baseMetadata.RunDate, revisionMetadata.Versions)
	if err != nil {
		return nil, err
	}

	baseActiveVersionOnRunDate, err := latestVersionActiveOnDate(revisionMetadata.RunDate, baseMetadata.Versions)
	if err != nil {
		return nil, err
	}

	revisionActiveVersionOnRunDate, err := latestVersionActiveOnDate(revisionMetadata.RunDate, revisionMetadata.Versions)
	if err != nil {
		return nil, err
	}

	log.Printf(`Base specs (from when last changelog was generated): current active version as of today %s, 
	active version when last changelog was generated %s`, baseActiveVersionOnRunDate, baseActiveVersionOnPreviousRunDate)

	log.Printf(`Revision specs (new specs): current active version as of today %s, 
	active version when last changelog was generated %s`, revisionActiveVersionOnRunDate, revisionActiveVersionOnPreviousRunDate)

	baseMetadata.ActiveVersion = baseActiveVersionOnPreviousRunDate
	revisionMetadata.ActiveVersion = revisionActiveVersionOnPreviousRunDate

	changelog, err := newChangelog(baseMetadata, revisionMetadata, nil)
	if err != nil {
		return nil, err
	}

	changelogEntries, err := changelog.newEntryFromOasDiff(exemptionFilePath, fs)
	if err != nil {
		return nil, err
	}

	changelog.BaseChangelog = changelogEntries
	if revisionActiveVersionOnRunDate != baseActiveVersionOnPreviousRunDate {
		// new version was released or become active since last changelog run
		// compare "baseActiveVersionOnPreviousRunDate" with "revisionActiveVersionOnRunDate"
		// (using latest specs, since above, we're comparing
		// baseActiveVersionOnPreviousRunDate with revisionActiveVersionOnPreviousRunDate)
		baseMetadata.ActiveVersion = baseActiveVersionOnRunDate
		revisionMetadata.ActiveVersion = revisionActiveVersionOnRunDate
		changelog, err = newChangelog(baseMetadata, revisionMetadata, changelogEntries)
		if err != nil {
			return nil, err
		}

		changelogEntries, err = changelog.newEntryFromOasDiff(exemptionFilePath, fs)
		if err != nil {
			return nil, err
		}
	}

	for _, version := range changelog.RevisionMetadata.Versions {
		changelog.RevisionMetadata.ActiveVersion = version
		changelog.BaseMetadata.ActiveVersion = version
		changelog.Revision, err = newOpeAPISpecFromPathAndVersion(changelog.RevisionMetadata.Path, version)
		if err != nil {
			return nil, err
		}

		changelogEntries, err = changelog.NewEntriesFromSunsetAndManualEntry()
		if err != nil {
			return nil, err
		}

		changelog.BaseChangelog = changelogEntries
	}

	return changelogEntries, nil
}

// NewEntriesWithoutHidden generates the changelog entries between the base and revision specs.
// The returned entries includes the changes between the base and revision specs that are not
// marked as hidden.
func NewEntriesWithoutHidden(basePath, revisionPath, exemptionFilePath string, fs afero.Afero) ([]*Entry, error) {
	entries, err := NewEntries(basePath, revisionPath, exemptionFilePath, fs)
	if err != nil {
		return nil, err
	}

	return NewNotHiddenEntries(entries), nil
}

// NewEntriesBetweenRevisionVersions generates the changelog entries between the revision versions.
func NewEntriesBetweenRevisionVersions(revisionPath, exemptionFilePath string, fs afero.Fs) ([]*Entry, error) {
	revisionMetadata, err := newMetadataFromFile(revisionPath)
	if err != nil {
		return nil, err
	}

	entries := []*Entry{}
	for idx, fromVersion := range revisionMetadata.Versions {
		for _, toVersion := range revisionMetadata.Versions[idx+1:] {
			entry, err := newEntriesBetweenVersion(revisionMetadata, fromVersion, toVersion, exemptionFilePath, fs)
			if err != nil {
				return nil, err
			}
			entries = append(entries, entry)
		}
	}

	return newVersionEntries(entries), nil
}

func newEntriesBetweenVersion(metadata *Metadata, fromVersion, toVersion, exemptionFilePath string, fs afero.Fs) (*Entry, error) {
	baseMetadata := &Metadata{
		Path:          metadata.Path,
		ActiveVersion: fromVersion,
		RunDate:       time.Now().Format("2006-01-02"),
		SpecRevision:  metadata.SpecRevision,
		Versions:      metadata.Versions,
	}

	revisionMetadata := &Metadata{
		Path:          metadata.Path,
		ActiveVersion: toVersion,
		RunDate:       time.Now().Format("2006-01-02"),
		SpecRevision:  metadata.SpecRevision,
		Versions:      metadata.Versions,
	}

	changelog, err := newChangelog(baseMetadata, revisionMetadata, []*Entry{})
	if err != nil {
		return nil, err
	}

	entries, err := changelog.newEntryFromOasDiff(exemptionFilePath, fs)
	if err != nil {
		return nil, err
	}

	if len(entries) == 0 {
		log.Printf("No changes found between %s and %s versions.", fromVersion, toVersion)
		return nil, nil
	}

	out := entries[0]
	out.FromVersion = fromVersion
	out.ToVersion = toVersion
	log.Printf("Generating diff between %s and %s versions, updated paths: %d.", fromVersion, toVersion, len(out.Paths))

	return out, nil
}

func newVersionEntries(entries []*Entry) []*Entry {
	versionEntries := []*Entry{}
	for _, entry := range entries {
		versionEntries = append(versionEntries, &Entry{
			Date:        entry.Date,
			Paths:       newVersionedPaths(entry.Paths, entry.ToVersion),
			ToVersion:   entry.ToVersion,
			FromVersion: entry.FromVersion,
		})
	}
	return versionEntries
}

// newVersionedPaths returns the input paths with a new format that includes only the input version.
// For the version changelog, only version for for "to_version" are relevant (what has changed between "to" and "from" version),
// while the changes for "from_version" should contain only deprecation entries.
func newVersionedPaths(paths []*Path, version string) []*Path {
	versionedPaths := []*Path{}
	for _, path := range paths {
		for _, v := range path.Versions {
			if v.Version != version {
				continue
			}

			if len(v.Changes) == 0 {
				continue
			}

			versionedPaths = append(versionedPaths,
				&Path{
					URI:            path.URI,
					HTTPMethod:     path.HTTPMethod,
					OperationID:    path.OperationID,
					Tag:            path.Tag,
					StabilityLevel: path.StabilityLevel,
					ChangeType:     path.ChangeType,
					Changes:        v.Changes,
				})
		}
	}

	return versionedPaths
}

func newChangelog(baseMetadata, revisionMetadata *Metadata, baseChangelog []*Entry) (*Changelog, error) {
	var err error
	if baseChangelog == nil {
		baseChangelog, err = newEntriesFromPath(fmt.Sprintf("%s/%s", baseMetadata.Path, "changelog.json"))
		if err != nil {
			return nil, err
		}
	}

	baseSpec, revisionSpec, err := newBaseAndRevisionSpecs(baseMetadata, revisionMetadata)
	if err != nil {
		return nil, err
	}

	changelogConfig := checker.NewConfig(
		checker.GetAllChecks()).WithOptionalChecks(breakingChangesAdditionalCheckers).WithDeprecation(deprecationDaysBeta, deprecationDaysStable)

	return &Changelog{
		BaseChangelog:     baseChangelog,
		RunDate:           revisionMetadata.RunDate,
		Base:              baseSpec,
		Revision:          revisionSpec,
		BaseMetadata:      baseMetadata,
		RevisionMetadata:  revisionMetadata,
		Config:            changelogConfig,
		ExemptionFilePath: fmt.Sprintf("%s/%s", revisionMetadata.Path, "exemptions.yaml"),
		OasDiff: openapi.NewOasDiffWithSpecInfo(baseSpec, revisionSpec, &diff.Config{
			IncludePathParams: true,
		}),
	}, nil
}

func newEntriesFromPath(path string) ([]*Entry, error) {
	contents, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	var entries []*Entry
	if err := json.Unmarshal(contents, &entries); err != nil {
		return nil, err
	}

	return entries, nil
}

func newBaseAndRevisionSpecs(baseMetadata, revisionMetadata *Metadata) (baseSpec, revisionSpec *load.SpecInfo, err error) {
	if baseMetadata.ActiveVersion != revisionMetadata.ActiveVersion {
		log.Printf("Base spec revision %s is different from the active version %s", baseMetadata.SpecRevision, baseMetadata.ActiveVersion)
		log.Println("Normalizing the specs: replace versioned media-types with corresponding standard media-types")
		baseSpec, err = openapi.CreateNormalizedOpenAPISpecFromPath(fmt.Sprintf("%s/openapi-%s.json", baseMetadata.Path, baseMetadata.ActiveVersion))
		if err != nil {
			return nil, nil, err
		}
		revisionSpec, err = openapi.CreateNormalizedOpenAPISpecFromPath(fmt.Sprintf("%s/openapi-%s.json",
			revisionMetadata.Path, revisionMetadata.ActiveVersion))
		if err != nil {
			return nil, nil, err
		}
		baseSpec.Version = baseMetadata.ActiveVersion
		revisionSpec.Version = revisionMetadata.ActiveVersion

		return baseSpec, revisionSpec, nil
	}

	loader := openapi.NewOpenAPI3().WithExcludedPrivatePaths()
	baseSpec, err = loader.CreateOpenAPISpecFromPath(fmt.Sprintf("%s/openapi-%s.json", baseMetadata.Path, baseMetadata.ActiveVersion))
	if err != nil {
		return nil, nil, err
	}

	revisionSpec, err = loader.CreateOpenAPISpecFromPath(fmt.Sprintf("%s/openapi-%s.json", revisionMetadata.Path, revisionMetadata.ActiveVersion))
	if err != nil {
		return nil, nil, err
	}

	baseSpec.Version = baseMetadata.ActiveVersion
	revisionSpec.Version = revisionMetadata.ActiveVersion

	return baseSpec, revisionSpec, nil
}

func newOpeAPISpecFromPathAndVersion(path, version string) (*load.SpecInfo, error) {
	loader := openapi.NewOpenAPI3().WithExcludedPrivatePaths()
	return loader.CreateOpenAPISpecFromPath(fmt.Sprintf("%s/openapi-%s.json", path, version))
}

// newMetadataFromFile reads the metadata file from the given path and returns the metadata struct.
func newMetadataFromFile(path string) (*Metadata, error) {
	metadataContent, err := os.ReadFile(fmt.Sprintf("%s/%s", path, "metadata.json"))
	if err != nil {
		return nil, err
	}

	var metadata *Metadata
	if err := json.Unmarshal(metadataContent, &metadata); err != nil {
		return nil, err
	}

	metadata.Path = path
	return metadata, nil
}

// latestVersionActiveOnDate returns before current UTC date.
func latestVersionActiveOnDate(date string, versions []string) (string, error) {
	dateTime, err := newDateFromString(date)
	if err != nil {
		return "", err
	}

	activeVersions := []time.Time{}
	for _, version := range versions {
		versionTime, err := newDateFromString(version)
		if err != nil {
			return "", err
		}

		if versionTime.Before(dateTime) || versionTime.Equal(dateTime) {
			activeVersions = append(activeVersions, versionTime)
		}
	}

	return latestVersion(activeVersions), nil
}

func latestVersion(dates []time.Time) string {
	if len(dates) == 0 {
		return ""
	}

	latest := dates[0]
	for _, date := range dates {
		if d := date.After(latest); d {
			latest = date
		}
	}
	return latest.Format("2006-01-02")
}

// findChangelogEntry finds the changelog entries for the given date and operationID, versions and changeCode.
func findChangelogEntry(changelog []*Entry, date, operationID, version, changeCode string) *Change {
	for _, entry := range changelog {
		if entry.Date == date {
			for _, path := range entry.Paths {
				if path.OperationID != operationID {
					continue
				}

				for _, v := range path.Versions {
					if v.Version != version {
						continue
					}

					for _, change := range v.Changes {
						if change.Code == changeCode {
							return change
						}
					}
				}
			}
		}
	}

	return nil
}

func newStringFromStruct(data interface{}) string {
	bytes, err := json.MarshalIndent(data, "", "  ")
	if err != nil {
		return ""
	}

	return string(bytes)
}

// NewNotHiddenEntries returns the entries that are not hidden from the changelog.
// Logic:
// Gets the last changelog date entry at index 0 and:
// 1. Remove all entries with hideFromChangelog
// 2. Remove all empty versions
// 3. Remove all empty paths
// 4. Shift changelog entry if it turns out empty
func NewNotHiddenEntries(changelog []*Entry) []*Entry {
	if len(changelog) == 0 {
		return changelog
	}

	// Get changes only for the last date, which is what was recently merged
	changes := changelog[0]

	// Remove hidden changes
	for _, path := range changes.Paths {
		for _, version := range path.Versions {
			version.Changes = newNotHiddenChanges(version.Changes)
		}
	}

	// Remove empty versions
	for _, path := range changes.Paths {
		versions := []*Version{}
		for _, version := range path.Versions {
			if len(version.Changes) > 0 {
				versions = append(versions, version)
			}
		}
		path.Versions = versions
	}

	// Remove empty paths
	paths := []*Path{}
	for _, path := range changes.Paths {
		if len(path.Versions) > 0 {
			paths = append(paths, path)
		}
	}

	if len(paths) == 0 {
		return changelog[1:]
	}

	changelog[0].Paths = paths
	return changelog
}

func newNotHiddenChanges(changes []*Change) []*Change {
	var notHiddenChanges []*Change
	for _, change := range changes {
		if !change.HideFromChangelog {
			notHiddenChanges = append(notHiddenChanges, change)
		}
	}

	return notHiddenChanges
}
