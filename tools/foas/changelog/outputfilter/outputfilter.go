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

	"github.com/oasdiff/oasdiff/checker"
	"github.com/oasdiff/oasdiff/formatters"
	"github.com/oasdiff/oasdiff/load"
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
}

func (o *OasDiffEntry) LevelWithDefault() int {
	if o.Level != 0 {
		return o.Level
	}
	return int(checker.INFO)
}

func NewChangelogEntries(checkers checker.Changes, specInfoPair *load.SpecInfoPair, exemptionsFilePath string) ([]*OasDiffEntry, error) {
	formatter, err := formatters.Lookup("json", formatters.FormatterOpts{
		Language: lan,
	})
	if err != nil {
		return nil, err
	}

	bytes, err := formatter.RenderChangelog(checkers, formatters.RenderOpts{ColorMode: checker.ColorAuto},
		specInfoPair.Base.Version, specInfoPair.Revision.Version)
	if err != nil {
		return nil, err
	}

	var entries []*OasDiffEntry
	err = json.Unmarshal(bytes, &entries)
	if err != nil {
		return nil, err
	}

	return transformEntries(entries, exemptionsFilePath)
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
