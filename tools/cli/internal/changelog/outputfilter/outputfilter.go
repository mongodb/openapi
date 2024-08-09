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

	"github.com/tufin/oasdiff/checker"
	"github.com/tufin/oasdiff/formatters"
	"github.com/tufin/oasdiff/load"
)

const lan = "en" // language for localized output

type Entry struct {
	ID                string `json:"id"`
	Text              string `json:"text"`
	Level             int    `json:"level"`
	Operation         string `json:"operation,omitempty"`
	OperationID       string `json:"operationId,omitempty"`
	Path              string `json:"path,omitempty"`
	Source            string `json:"source,omitempty"`
	Section           string `json:"section"`
	HideFromChangelog bool   `json:"hideFromChangelog,omitempty"`
}

func NewChangelogEntries(checkers checker.Changes, specInfoPair *load.SpecInfoPair, exemptionsFilePath string) ([]*Entry, error) {
	formatter, err := formatters.Lookup("json", formatters.FormatterOpts{
		Language: lan,
	})
	if err != nil {
		return nil, err
	}

	bytes, err := formatter.RenderChangelog(checkers, formatters.RenderOpts{ColorMode: checker.ColorAuto}, specInfoPair)
	if err != nil {
		return nil, err
	}

	var entries []*Entry
	err = json.Unmarshal(bytes, &entries)
	if err != nil {
		return nil, err
	}

	return transformEntries(entries, exemptionsFilePath)
}

func transformEntries(entries []*Entry, exemptionsFilePath string) ([]*Entry, error) {
	for _, entry := range entries {
		transformMessage(entry)
	}

	newEntries, err := squashEntries(entries)
	if err != nil {
		return nil, err
	}

	newEntries, err = MarkHiddenEntries(newEntries, exemptionsFilePath)
	if err != nil {
		return nil, err
	}

	return newEntries, nil
}
