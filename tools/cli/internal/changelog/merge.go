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
	"sort"

	"github.com/mongodb/openapi/tools/cli/internal/changelog/outputfilter"
	"github.com/tufin/oasdiff/checker"
)

const (
	endpointAddedCode       = "endpoint-added"
	endpointDeprecatedCode  = "endpoint-deprecated"
	endpointReactivatedCode = "endpoint-reactivated"
	notSetPriority          = 10
	changeTypeRelease       = "release"
	changeTypeUpdate        = "update"
	changeTypeDeprecated    = "deprecate"
	changeTypeRemove        = "remove"
)

func newChangeTypePriority() map[string]int {
	return map[string]int{
		changeTypeRemove:     1,
		changeTypeRelease:    1,
		changeTypeUpdate:     3,
		changeTypeDeprecated: 2,
	}
}

func newChangeTypeOverrides() map[string]string {
	return map[string]string{
		endpointAddedCode: changeTypeRelease,
	}
}

// NewEntriesFromSunsetAndManualEntry merges the base changelog with the new changes from manual entries and sunset endpoints
func (m *Changelog) NewEntriesFromSunsetAndManualEntry() ([]*Entry, error) {
	conf := outputfilter.NewOperationConfigs(nil, m.Revision)
	if _, err := m.newEntriesFromSunsetEndpoints(conf); err != nil {
		return nil, err
	}

	if _, err := m.newManualEntries(conf); err != nil {
		return nil, err
	}

	return m.BaseChangelog, nil
}

func (m *Changelog) newEntriesFromSunsetEndpoints(conf map[string]*outputfilter.OperationConfigs) ([]*Entry, error) {
	sunsetChanges, err := m.newOasDiffEntriesFromSunsetEndpoints(conf, m.RevisionMetadata.ActiveVersion)
	if err != nil {
		return nil, err
	}

	runDate := m.RunDate
	for _, change := range sunsetChanges {
		m.RunDate = func() string {
			if change.Date == "" {
				return runDate
			}
			return change.Date
		}()

		changelog, err := m.mergeChangelog(changeTypeRemove, []*outputfilter.OasDiffEntry{change}, conf)
		if err != nil {
			return nil, err
		}

		m.BaseChangelog = changelog
	}

	return m.BaseChangelog, nil
}

func (m *Changelog) newManualEntries(conf map[string]*outputfilter.OperationConfigs) ([]*Entry, error) {
	manualChanges, err := m.newOasDiffEntriesWithManualEntries(conf, m.RevisionMetadata.ActiveVersion)
	if err != nil {
		return nil, err
	}

	runDate := m.RunDate
	for _, change := range manualChanges {
		m.RunDate = func() string {
			if change.Date == "" {
				return runDate
			}
			return change.Date
		}()

		changelog, err := m.mergeChangelog(changeTypeUpdate, []*outputfilter.OasDiffEntry{change}, conf)
		if err != nil {
			return nil, err
		}

		m.BaseChangelog = changelog
	}

	return m.BaseChangelog, nil
}

// newEntryFromOasDiff merges the base changelog with the new changes from a Base and Revision OpenAPI specs
func (m *Changelog) newEntryFromOasDiff() ([]*Entry, error) {
	changes, err := m.newOasDiffEntries()
	if err != nil {
		return nil, err
	}

	if len(changes) == 0 {
		return m.BaseChangelog, nil
	}

	log.Printf("Found %d changes between %s and %s", len(changes), m.Base.Url, m.Revision.Url)
	log.Printf("Changes: %s", newStringFromStruct(changes))

	conf := outputfilter.NewOperationConfigs(m.Base, m.Revision)

	changeType := changeTypeUpdate
	if m.BaseMetadata.ActiveVersion != m.RevisionMetadata.ActiveVersion {
		changeType = changeTypeRelease
	}

	return m.mergeChangelog(changeType, changes, conf)
}

// mergeChangelog merges the base changelog with the new changes
// Logic:
// 1. If the entry already exists in the changelog for the Run Date, use that entry or create it (newEntryAtRunDate)
// 2. Get the paths from the changes and add them to the entry
// 3. Sort the changelog by date DESC, path + httpMethod ASC, version DESC
func (m *Changelog) mergeChangelog(
	changeType string,
	changes []*outputfilter.OasDiffEntry,
	conf map[string]*outputfilter.OperationConfigs) ([]*Entry, error) {
	changelog, err := duplicateEntries(m.BaseChangelog)
	if err != nil {
		return nil, err
	}

	entry := m.newEntryAtRunDate(&changelog)
	entry.Paths, err = m.newPathsFromChanges(changes, changeType, entry, conf)
	if err != nil {
		return nil, err
	}

	return sortChangelog(changelog), nil
}

// newPathsFromChanges creates new paths from changes
// Logic:
// 1. Get the deprecated paths from the changes
// 2. Get the updated paths with the deprecated changes from newPathsFromDeprecatedChanges
// 3. Get the revision paths from the changes
// 4. Get the updated paths with the revision changes from newPathsFromRevisionChanges
func (m *Changelog) newPathsFromChanges(
	changes []*outputfilter.OasDiffEntry,
	changeType string, entry *Entry,
	conf map[string]*outputfilter.OperationConfigs) ([]*Path, error) {
	deprecatedPaths, err := m.newPathsFromDeprecatedChanges(changes, &entry.Paths, conf)
	if err != nil {
		return nil, err
	}

	paths, err := m.newPathsFromRevisionChanges(changes, changeType, &deprecatedPaths, conf)
	if err != nil {
		return nil, err
	}

	return paths, nil
}

// newPathsFromRevisionChanges creates new paths from revision changes
func (m *Changelog) newPathsFromRevisionChanges(
	changes []*outputfilter.OasDiffEntry,
	changeType string, changelogPath *[]*Path,
	conf map[string]*outputfilter.OperationConfigs) ([]*Path, error) {
	revisionChanges := m.newRevisionChanges(changes)
	return newMergedChanges(revisionChanges, changeType, m.RevisionMetadata.ActiveVersion, changelogPath, conf)
}

// newPathsFromDeprecatedChanges creates new paths from deprecated changes
func (m *Changelog) newPathsFromDeprecatedChanges(
	changes []*outputfilter.OasDiffEntry,
	changelogPath *[]*Path,
	conf map[string]*outputfilter.OperationConfigs) ([]*Path, error) {
	depreactedChanges := m.newDeprecatedByNewerVersionOasDiffEntries(changes, conf)
	return newMergedChanges(depreactedChanges, changeTypeDeprecated, m.BaseMetadata.ActiveVersion, changelogPath, conf)
}

func (m *Changelog) newOasDiffEntries() ([]*outputfilter.OasDiffEntry, error) {
	// CLOUDP-267267: @Todo need to add the logic to hide from exceptions
	diffResult, err := m.OasDiff.NewDiffResult()
	if err != nil {
		return nil, err
	}

	changes := checker.CheckBackwardCompatibilityUntilLevel(
		m.Config,
		diffResult.Report,
		diffResult.SourceMap,
		checker.INFO)

	log.Printf("Found '%d' oasdiff changes between %s and %s", len(changes), m.Base.Url, m.Revision.Url)
	return outputfilter.NewChangelogEntries(changes, diffResult.SpecInfoPair, m.ExemptionFilePath)
}

// sortChangelog sorts changelog by date DESC, path + httpMethod ASC, version DESC
func sortChangelog(changelog []*Entry) []*Entry {
	sort.Slice(changelog, func(i, j int) bool {
		return changelog[i].Date > changelog[j].Date
	})

	for _, dateEntry := range changelog {
		sort.Slice(dateEntry.Paths, func(i, j int) bool {
			return fmt.Sprintf("%s-%s",
				dateEntry.Paths[i].URI, dateEntry.Paths[i].HTTPMethod) <
				fmt.Sprintf("%s-%s", dateEntry.Paths[j].URI, dateEntry.Paths[j].HTTPMethod)
		})

		for _, pathEntry := range dateEntry.Paths {
			sort.Slice(pathEntry.Versions, func(i, j int) bool {
				return pathEntry.Versions[i].Version > pathEntry.Versions[j].Version
			})
		}
	}

	return changelog
}

// newMergedChanges merges the OasDiff changes into the changelog []paths
func newMergedChanges(changes []*outputfilter.OasDiffEntry,
	changeType, version string, changelogPath *[]*Path,
	operationConfig map[string]*outputfilter.OperationConfigs) ([]*Path, error) {
	if len(changes) == 0 {
		return *changelogPath, nil
	}

	for _, change := range changes {
		pathEntry := newPathEntry(changelogPath, change.Path, change.Operation)
		operationdID := change.OperationID

		conf, ok := operationConfig[operationdID]
		if !ok {
			return nil, fmt.Errorf("operation %s not found in operation config", operationdID)
		}

		pathEntry.OperationID = operationdID
		pathEntry.Tag = conf.Tag()

		pathEntryVersion := newEntryVersion(&pathEntry.Versions, version)
		pathEntryVersion.StabilityLevel = stabilityLevelStable
		pathEntryVersion.ChangeType = newChangeType(pathEntryVersion.ChangeType, changeType, change.ID)

		versionChange := &Change{
			Description:        change.Text,
			Code:               change.ID,
			BackwardCompatible: change.LevelWithDefault() < int(checker.ERR),
			HideFromChangelog:  change.HideFromChangelog,
		}

		pathEntryVersion.Changes = append(pathEntryVersion.Changes, versionChange)
	}

	return *changelogPath, nil
}

var priorityGivenChangeType = func(changeType string) int {
	if val, ok := newChangeTypePriority()[changeType]; ok {
		return val
	}
	return notSetPriority
}

func (m *Changelog) newDeprecatedByNewerVersionOasDiffEntries(
	changes []*outputfilter.OasDiffEntry,
	operationConfig map[string]*outputfilter.OperationConfigs) []*outputfilter.OasDiffEntry {
	// deprecation by newer version occurs only when
	// base_version is different than revision_version
	if m.BaseMetadata.ActiveVersion == m.RevisionMetadata.ActiveVersion {
		return nil
	}

	// when comparing specs from 2 versions, we first normalize the specs
	// (replacing versioned media-types with standard media-types).
	// Base version endpoint is marked as deprecated and with a sunset date,
	// while the revision endpoint is active.
	// This will result in changes where the endpoint appears as reactivated
	// (transition from deprecated with sunset to active).
	// For changelog we want to transform these reactivation changes
	// to the real change: "endpoint-deprecated".
	newChanges := make([]*outputfilter.OasDiffEntry, 0)
	for _, change := range changes {
		if change.ID != endpointReactivatedCode {
			continue
		}

		newChanges = append(newChanges, newDeprecatedChangeEntry(change, m.BaseMetadata.ActiveVersion, m.RevisionMetadata.ActiveVersion, operationConfig))
	}

	return newChanges
}

func newDeprecatedChangeEntry(
	change *outputfilter.OasDiffEntry,
	baseVersion, revisionVersion string,
	operationConfig map[string]*outputfilter.OperationConfigs) *outputfilter.OasDiffEntry {
	conf := operationConfig[change.OperationID]
	baseVersionSunset := func() string {
		if conf != nil {
			return conf.Sunset()
		}
		return ""
	}()

	return &outputfilter.OasDiffEntry{
		ID:          endpointDeprecatedCode,
		Operation:   change.Operation,
		OperationID: change.OperationID,
		Text: fmt.Sprintf(
			"New resource added {%s}. Resource version {%s} and marked for removal on %s",
			revisionVersion, baseVersionSunset, baseVersion),
		Level:             change.Level,
		Path:              change.Path,
		HideFromChangelog: change.HideFromChangelog,
		Date:              change.Date,
		Source:            change.Source,
		Section:           change.Section,
	}
}

func newChangeType(currentChangeType, newChangeType, changeCode string) string {
	changeType, ok := newChangeTypeOverrides()[changeCode]
	if !ok {
		changeType = newChangeType
	}

	// lower priority number means higher priority
	if priorityGivenChangeType(changeType) < priorityGivenChangeType(currentChangeType) {
		return changeType
	}

	return currentChangeType
}

func newEntryVersion(versions *[]*Version, specVersion string) *Version {
	for _, version := range *versions {
		if version.Version == specVersion {
			return version
		}
	}

	newVersion := []*Version{{
		Version: specVersion,
	}}
	*versions = append(newVersion, *versions...)
	return (*versions)[0]
}

// newPathEntry returns the index and the path entry if it already exists in the changelog
// otherwise it returns -1 and a new path entry
func newPathEntry(paths *[]*Path, path, operation string) *Path {
	for _, p := range *paths {
		if p.URI == path && p.HTTPMethod == operation {
			return p
		}
	}

	newPath := []*Path{{
		URI:        path,
		HTTPMethod: operation,
		Versions:   make([]*Version, 0),
	}}
	*paths = append(newPath, *paths...)
	return (*paths)[0]
}

func (m *Changelog) newRevisionChanges(changes []*outputfilter.OasDiffEntry) []*outputfilter.OasDiffEntry {
	if m.BaseMetadata.ActiveVersion == m.RevisionMetadata.ActiveVersion {
		return changes
	}

	out := make([]*outputfilter.OasDiffEntry, 0)
	for _, change := range changes {
		if change.ID != endpointReactivatedCode {
			out = append(out, change)
		}
	}

	return out
}

func (m *Changelog) newEntryAtRunDate(changelog *[]*Entry) *Entry {
	if entry := retrieveEntryAtDate(changelog, m.RunDate); entry != nil {
		return entry
	}

	// If the entry does not exist, create a new entry with the current Run Date
	// and append it at the first position to the changelog
	*changelog = append([]*Entry{{Date: m.RunDate}}, *changelog...)
	return (*changelog)[0] // Return a pointer to the first element of the changelog
}

func retrieveEntryAtDate(changelog *[]*Entry, date string) *Entry {
	for _, entry := range *changelog {
		if entry.Date == date {
			return entry
		}
	}
	return nil
}

func duplicateEntries(changelog []*Entry) ([]*Entry, error) {
	// Marshal the original document to JSON
	contents, err := json.Marshal(changelog)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal original changelog: %w", err)
	}

	// Unmarshal the JSON data into a new OpenAPI document
	var entries []*Entry
	if err := json.Unmarshal(contents, &entries); err != nil {
		return nil, err
	}

	return entries, nil
}
