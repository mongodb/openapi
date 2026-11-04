// Copyright 2024 MongoDB Inc
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//	http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
package outputfilter

import (
	"encoding/json"

	foasdiff "github.com/mongodb/openapi/tools/foas/diff"
	"github.com/oasdiff/oasdiff/checker"
	"github.com/oasdiff/oasdiff/formatters"
	"github.com/spf13/afero"
)

const lan = "en" // language for localized output

type OasDiffEntry struct {
	ID                string `json:"id"`
	Date              string `json:"date"`
	Text              string `json:"text"`
	Level             int    `json:"level"`
	Operation         string `json:"operation,omitempty"`
	OperationID       string `json:"operationId,omitempty"`
	Path              string `json:"path,omitempty"`
	Source            string `json:"source,omitempty"`
	Section           string `json:"section"`
	HideFromChangelog bool   `json:"hideFromChangelog,omitempty"`
	DeprecatedVersion string `json:"deprecatedVersion,omitempty"`
	SunsetDate        string `json:"sunsetDate,omitempty"`
	ReplacedByVersion string `json:"replacedByVersion,omitempty"`
	ReplacesVersion   string `json:"replacesVersion,omitempty"`
}

func (o *OasDiffEntry) LevelWithDefault() int {
	if o.Level != 0 {
		return o.Level
	}
	return severityLevel(foasdiff.SeverityInfo)
}

func (o *OasDiffEntry) IsBreaking() bool {
	return o.LevelWithDefault() >= severityLevel(foasdiff.SeverityError)
}

// NewChangelogEntries converts raw oasdiff checker changes into changelog
// entries. New comparison callers should use diff.Compare and
// NewChangelogEntriesFromDiff.
func NewChangelogEntries(checkers checker.Changes, exemptionsFilePath string) ([]*OasDiffEntry, error) {
	formatter, err := formatters.Lookup("json", formatters.FormatterOpts{
		Language: lan,
	})
	if err != nil {
		return nil, err
	}

	bytes, err := formatter.RenderChangelog(checkers, formatters.RenderOpts{ColorMode: checker.ColorAuto})
	if err != nil {
		return nil, err
	}

	var entries []*OasDiffEntry
	if err := json.Unmarshal(bytes, &entries); err != nil {
		return nil, err
	}
	return transformEntries(entries, exemptionsFilePath)
}

// NewChangelogEntriesFromDiff converts a transport-neutral FOAS diff report
// into changelog entries.
func NewChangelogEntriesFromDiff(changes []foasdiff.Change, exemptionsFilePath string) ([]*OasDiffEntry, error) {
	entries := make([]*OasDiffEntry, 0, len(changes))
	for index := range changes {
		change := &changes[index]
		entries = append(entries, &OasDiffEntry{
			ID:          change.ID,
			Text:        change.Text,
			Level:       severityLevel(change.Severity),
			Operation:   change.Operation,
			OperationID: change.OperationID,
			Path:        change.Path,
			Source:      change.Source,
			Section:     change.Section,
		})
	}

	return transformEntries(entries, exemptionsFilePath)
}

func severityLevel(severity foasdiff.Severity) int {
	switch severity {
	case foasdiff.SeverityError:
		return 3
	case foasdiff.SeverityWarning:
		return 2
	case foasdiff.SeverityInfo:
		return 1
	}
	return 1
}

func transformEntries(entries []*OasDiffEntry, exemptionsFilePath string) ([]*OasDiffEntry, error) {
	fs := afero.NewOsFs()
	entries, err := MarkHiddenEntries(entries, exemptionsFilePath, fs)
	if err != nil {
		return nil, err
	}

	newEntries := make([]*OasDiffEntry, 0)
	for _, entry := range entries {
		// only changes linked to endpoints are currently considered.
		// For example, oasdiff might also return entries where components were removed.
		if entry.Path == "" {
			continue
		}
		transformMessage(entry)
		newEntries = append(newEntries, entry)
	}

	newEntries, err = squashEntries(newEntries)
	if err != nil {
		return nil, err
	}

	return newEntries, nil
}
