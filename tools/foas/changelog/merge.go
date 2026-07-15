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

	"github.com/mongodb/openapi/tools/foas/changelog/outputfilter"
	"github.com/oasdiff/oasdiff/checker"
)

const (
	endpointAddedCode        = "endpoint-added"
	endpointDeprecatedCode   = "endpoint-deprecated"
	endpointReactivatedCode  = "endpoint-reactivated"
	endpointRemovedCode      = "endpoint-removed"
	endpointVersionAddedCode = "endpoint-version-added"
	notSetPriority           = 10
	changeTypeRelease        = "release"
	changeTypeUpdate         = "update"
	changeTypeDeprecated     = "deprecate"
	changeTypeRemove         = "remove"
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
		endpointAddedCode:        changeTypeRelease,
		endpointVersionAddedCode: changeTypeRelease,
		endpointDeprecatedCode:   changeTypeDeprecated,
		endpointRemovedCode:      changeTypeRemove,
	}
}

// NewEntriesFromSunsetAndManualEntry merges the base changelog with the new changes from manual entries and sunset endpoints.
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

// newEntryFromOasDiff merges the base changelog with the new changes from a Base and Revision OpenAPI specs.
func (m *Changelog) newEntryFromOasDiff() ([]*Entry, error) {
	changes, err := m.newOasDiffEntries()
	if err != nil {
		return nil, err
	}

	if len(changes) == 0 {
		return m.BaseChangelog, nil
	}

	log.Printf("Found %d changes between %s and %s", len(changes), m.Base.Url, m.Revision.Url)

	conf := outputfilter.NewOperationConfigs(m.Base, m.Revision)

	return m.mergeChangelog(changeTypeUpdate, changes, conf)
}

// mergeChangelog merges the base changelog with the new changes
// Logic:
// 1. If the entry already exists in the changelog for the Run Date, use that entry or create it (newEntryAtRunDate)
// 2. Get the paths from the changes and add them to the entry
// 3. Sort the changelog by date DESC, path + httpMethod ASC, version DESC.
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
// 4. Get the updated paths with the revision changes from newPathsFromRevisionChanges.
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

// newPathsFromRevisionChanges creates new paths from revision changes.
func (m *Changelog) newPathsFromRevisionChanges(
	changes []*outputfilter.OasDiffEntry,
	changeType string, changelogPath *[]*Path,
	conf map[string]*outputfilter.OperationConfigs) ([]*Path, error) {
	revisionChanges := newRevisionChanges(changes, conf)
	return newMergedChanges(revisionChanges, changeType, m.RevisionMetadata.ActiveVersion, changelogPath, conf)
}

// newPathsFromDeprecatedChanges creates new paths from deprecated changes.
func (m *Changelog) newPathsFromDeprecatedChanges(
	changes []*outputfilter.OasDiffEntry,
	changelogPath *[]*Path,
	conf map[string]*outputfilter.OperationConfigs) ([]*Path, error) {
	deprecatedChanges := newDeprecatedByNewerVersionOasDiffEntries(changes, conf)
	return newMergedChanges(deprecatedChanges, changeTypeDeprecated, m.BaseMetadata.ActiveVersion, changelogPath, conf)
}

func (m *Changelog) newOasDiffEntries() ([]*outputfilter.OasDiffEntry, error) {
	diffResult, err := m.OasDiff.GetFlattenedDiff(m.Base, m.Revision)
	if err != nil {
		return nil, err
	}

	changes := checker.CheckBackwardCompatibilityUntilLevel(
		m.Config,
		diffResult.Report,
		diffResult.SourceMap,
		checker.INFO)

	log.Printf("Found '%d' oasdiff changes between %s and %s", len(changes), m.Base.Url, m.Revision.Url)
	return outputfilter.NewChangelogEntries(changes, m.ExemptionFilePath)
}

// sortChangelog sorts changelog by date DESC, path + httpMethod ASC, version DESC.
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

// newMergedChanges merges the OasDiff changes into the changelog []paths.
func newMergedChanges(changes []*outputfilter.OasDiffEntry,
	changeType, version string, changelogPath *[]*Path,
	operationConfig map[string]*outputfilter.OperationConfigs) ([]*Path, error) {
	if len(changes) == 0 {
		return *changelogPath, nil
	}

	for _, change := range changes {
		pathEntry := newPathEntry(changelogPath, change.Path, change.Operation)
		operationID := change.OperationID

		conf, ok := operationConfig[operationID]
		if !ok {
			return nil, fmt.Errorf("operation %s not found in operation config", operationID)
		}

		pathEntry.OperationID = operationID
		pathEntry.Tag = conf.Tag()

		pathEntryVersion := newEntryVersion(&pathEntry.Versions, version)
		pathEntryVersion.StabilityLevel = stabilityLevelStable
		pathEntryVersion.ChangeType = newChangeType(pathEntryVersion.ChangeType, changeType, change.ID)
		versionChange := &Change{
			Description:        change.Text,
			Code:               change.ID,
			BackwardCompatible: change.LevelWithDefault() < int(checker.ERR),
			HideFromChangelog:  change.HideFromChangelog,
			DeprecatedVersion:  change.DeprecatedVersion,
			SunsetDate:         change.SunsetDate,
			ReplacedByVersion:  change.ReplacedByVersion,
			ReplacesVersion:    change.ReplacesVersion,
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

func newDeprecatedByNewerVersionOasDiffEntries(
	changes []*outputfilter.OasDiffEntry,
	operationConfig map[string]*outputfilter.OperationConfigs) []*outputfilter.OasDiffEntry {
	newChanges := make([]*outputfilter.OasDiffEntry, 0)
	// Deduplicate by OperationID: a single operation can surface several reactivation signals
	// (one per media type), but the version transition is one event, so emit at most one
	// deprecation entry per operation.
	added := make(map[string]struct{})
	for _, change := range changes {
		// Normalized versioned specs surface "old version deprecated, new version active" as reactivation.
		if change.ID != endpointReactivatedCode {
			continue
		}
		baseVersion, revisionVersion, ok := endpointVersionLifecycle(change, operationConfig)
		if !ok {
			continue
		}
		if _, ok := added[change.OperationID]; ok {
			continue
		}

		conf := operationConfig[change.OperationID]
		if conf.Base.Sunset == "" {
			continue
		}

		newChanges = append(newChanges, newDeprecatedChangeEntry(change, baseVersion, revisionVersion, conf.Base.Sunset))
		added[change.OperationID] = struct{}{}
	}

	return newChanges
}

func newDeprecatedChangeEntry(
	change *outputfilter.OasDiffEntry,
	baseVersion, revisionVersion string,
	baseVersionSunset string) *outputfilter.OasDiffEntry {
	return &outputfilter.OasDiffEntry{
		ID:          endpointDeprecatedCode,
		Operation:   change.Operation,
		OperationID: change.OperationID,
		Text: fmt.Sprintf(
			"API version %s is deprecated and sunsets on %s. Use API version %s instead.",
			baseVersion, baseVersionSunset, revisionVersion),
		Level:             change.Level,
		Path:              change.Path,
		HideFromChangelog: change.HideFromChangelog,
		Date:              change.Date,
		Source:            change.Source,
		Section:           change.Section,
		DeprecatedVersion: baseVersion,
		SunsetDate:        baseVersionSunset,
		ReplacedByVersion: revisionVersion,
	}
}

func newEndpointVersionAddedChangeEntry(change *outputfilter.OasDiffEntry, baseVersion, revisionVersion string) *outputfilter.OasDiffEntry {
	return &outputfilter.OasDiffEntry{
		ID:          endpointVersionAddedCode,
		Operation:   change.Operation,
		OperationID: change.OperationID,
		Text: fmt.Sprintf(
			"API version %s was added. It replaces API version %s.",
			revisionVersion, baseVersion),
		Level:             change.Level,
		Path:              change.Path,
		HideFromChangelog: change.HideFromChangelog,
		Date:              change.Date,
		Source:            change.Source,
		Section:           change.Section,
		ReplacesVersion:   baseVersion,
	}
}

func endpointVersionLifecycle(
	change *outputfilter.OasDiffEntry,
	operationConfig map[string]*outputfilter.OperationConfigs) (baseVersion, revisionVersion string, ok bool) {
	conf := operationConfig[change.OperationID]
	if conf == nil || conf.Base == nil || conf.Revision == nil {
		return "", "", false
	}

	baseVersion = conf.Base.Version
	revisionVersion = conf.Revision.Version
	return baseVersion, revisionVersion, baseVersion != "" && revisionVersion != "" && baseVersion != revisionVersion
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

	newVersion := make([]*Version, 1, len(*versions)+1)
	newVersion[0] = &Version{
		Version: specVersion,
	}
	*versions = append(newVersion, *versions...)
	return (*versions)[0]
}

// newPathEntry returns the index and the path entry if it already exists in the changelog
// otherwise it returns -1 and a new path entry.
func newPathEntry(paths *[]*Path, path, operation string) *Path {
	for _, p := range *paths {
		if p.URI == path && p.HTTPMethod == operation {
			return p
		}
	}

	newPath := make([]*Path, 1, len(*paths)+1)
	newPath[0] = &Path{
		URI:        path,
		HTTPMethod: operation,
		Versions:   make([]*Version, 0),
	}
	*paths = append(newPath, *paths...)
	return (*paths)[0]
}

func newRevisionChanges(
	changes []*outputfilter.OasDiffEntry,
	operationConfig map[string]*outputfilter.OperationConfigs) []*outputfilter.OasDiffEntry {
	out := make([]*outputfilter.OasDiffEntry, 0)
	// Deduplicate by OperationID: an operation can surface several reactivation signals (one per
	// media type), but endpoint-version-added is one event per operation.
	added := make(map[string]struct{})
	for _, change := range changes {
		if change.ID == endpointReactivatedCode {
			baseVersion, revisionVersion, hasLifecycle := endpointVersionLifecycle(change, operationConfig)
			if !hasLifecycle {
				out = append(out, change)
				continue
			}

			if _, ok := added[change.OperationID]; !ok {
				out = append(out, newEndpointVersionAddedChangeEntry(change, baseVersion, revisionVersion))
				added[change.OperationID] = struct{}{}
			}
			continue
		}

		out = append(out, change)
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
