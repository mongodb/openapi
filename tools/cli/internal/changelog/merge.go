package changelog

import (
	"encoding/json"
	"fmt"
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
		changeTypeUpdate:     2,
		changeTypeDeprecated: 3,
	}
}

func newChangeTypeOverrides() map[string]string {
	return map[string]string{
		endpointAddedCode: changeTypeRelease,
	}
}

// MergeChangelog merges the base changelog with the new changes from a Base and Revision OpenAPI specs
func (m *Metadata) MergeChangelog() ([]*Entry, error) {
	changes, err := m.newOasDiffEntries()
	if err != nil {
		return nil, err
	}

	if len(changes) == 0 {
		return m.BaseChangelog, nil
	}

	conf := outputfilter.NewOperationConfigs(m.Base, m.Revision)
	return m.mergeChangelog(changeTypeUpdate, changes, conf)
}

// mergeChangelog merges the base changelog with the new changes
// Logic:
// 1. If the entry already exists in the changelog for the Run Date, use that entry or create it (newEntryAtRunDate)
// 2. Get the paths from the changes and add them to the entry
// 3. Sort the changelog by date DESC, path + httpMethod ASC, version DESC
func (m *Metadata) mergeChangelog(
	changeType string,
	changes []*outputfilter.OasDiffEntry,
	conf map[string]*outputfilter.OperationConfigs) ([]*Entry, error) {
	changelog, err := duplicateChangelog(m.BaseChangelog)
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
func (m *Metadata) newPathsFromChanges(
	changes []*outputfilter.OasDiffEntry,
	changeType string, entry *Entry,
	conf map[string]*outputfilter.OperationConfigs) ([]*Path, error) {
	paths := make([]*Path, 0)
	deprecatedPaths, err := m.newPathsFromDeprecatedChanges(changes, entry, conf)
	if err != nil {
		return nil, err
	}

	if len(deprecatedPaths) > 0 {
		paths = append(paths, deprecatedPaths...)
	}

	revisionPaths, err := m.newPathsFromRevisionChanges(changes, changeType, entry, conf)
	if err != nil {
		return nil, err
	}

	if len(revisionPaths) > 0 {
		paths = append(paths, revisionPaths...)
	}
	return paths, nil
}

// newPathsFromRevisionChanges creates new paths from revision changes
func (m *Metadata) newPathsFromRevisionChanges(
	changes []*outputfilter.OasDiffEntry,
	changeType string, entry *Entry,
	conf map[string]*outputfilter.OperationConfigs) ([]*Path, error) {
	revisionChanges := m.newRevisionChanges(changes)
	return newMergedChanges(revisionChanges, changeType, m.Revision.Version, &entry.Paths, conf)
}

// newPathsFromDeprecatedChanges creates new paths from deprecated changes
func (m *Metadata) newPathsFromDeprecatedChanges(
	changes []*outputfilter.OasDiffEntry,
	entry *Entry,
	conf map[string]*outputfilter.OperationConfigs) ([]*Path, error) {
	depreactedChanges := m.newDeprecatedByNewerVersionChanges(changes, conf)
	return newMergedChanges(depreactedChanges, changeTypeDeprecated, m.Base.Version, &entry.Paths, conf)
}

func (m *Metadata) newOasDiffEntries() ([]*outputfilter.OasDiffEntry, error) {
	diffResult, err := m.OasDiff.NewDiffResult()
	if err != nil {
		return nil, err
	}

	changes := checker.CheckBackwardCompatibilityUntilLevel(
		m.Config,
		diffResult.Report,
		diffResult.SourceMap,
		checker.INFO)

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

func newMergedChanges(changes []*outputfilter.OasDiffEntry,
	changeType, version string, changelogPath *[]*Path,
	operationConfig map[string]*outputfilter.OperationConfigs) ([]*Path, error) {
	if len(changes) == 0 {
		return []*Path{}, nil
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

		pathEntryVersion := newEntryVersion(pathEntry.Versions, version)
		pathEntryVersion.StabilityLevel = stabilityLevelStable
		pathEntryVersion.ChangeType = newChangeType(pathEntryVersion.ChangeType, changeType, change.ID)

		versionChange := &Change{
			Description:        change.Text,
			Code:               change.ID,
			BackwardCompatible: change.LevelWithDefault() < int(checker.ERR),
			HideFromChangelog:  change.HideFromChangelog,
		}

		pathEntryVersion.Changes = append(pathEntryVersion.Changes, versionChange)
		pathEntry.Versions = append(pathEntry.Versions, pathEntryVersion)
	}

	return *changelogPath, nil
}

var priorityGivenChangeType = func(changeType string) int {
	if val, ok := newChangeTypePriority()[changeType]; ok {
		return val
	}
	return notSetPriority
}

func (m *Metadata) newDeprecatedByNewerVersionChanges(
	changes []*outputfilter.OasDiffEntry,
	operationConfig map[string]*outputfilter.OperationConfigs) []*outputfilter.OasDiffEntry {
	// deprecation by newer version occurs only when
	// base_version is different than revision_version
	if m.Base.Version == m.Revision.Version {
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

		newChanges = append(newChanges, newDeprecatedChangeEntry(change, m.Base.Version, m.Revision.Version, operationConfig))
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
		Level: change.Level,
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

func newEntryVersion(versions []*Version, specVersion string) *Version {
	for _, version := range versions {
		if version.Version == specVersion {
			return version
		}
	}

	return &Version{
		Version: specVersion,
	}
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

func (m *Metadata) newRevisionChanges(changes []*outputfilter.OasDiffEntry) []*outputfilter.OasDiffEntry {
	if m.Base.Version == m.Revision.Version {
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

func (m *Metadata) newEntryAtRunDate(changelog *[]*Entry) *Entry {
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

func duplicateChangelog(changelog []*Entry) ([]*Entry, error) {
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
