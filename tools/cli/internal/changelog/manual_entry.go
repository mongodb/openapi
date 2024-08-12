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
	"strings"

	"github.com/mongodb/openapi/tools/cli/internal/changelog/outputfilter"
	"github.com/tufin/oasdiff/checker"
)

const manualChangelogEntry = "manual-changelog-entry"

func (m *Metadata) newOasDiffEntriesWithManualEntries(confs map[string]*outputfilter.OperationConfigs,
	version string) ([]*outputfilter.OasDiffEntry, error) {
	changes := make([]*outputfilter.OasDiffEntry, 0)

	for operationID, config := range confs {
		if config == nil || config.Revision == nil {
			continue
		}

		for entryDate, entryText := range config.Revision.ManualChangelogEntries {
			if value, err := isEntryDateBetween(entryDate, m.PreviousRunDate, m.RunDate); err != nil || !value {
				continue
			}

			if findChangelogEntry(m.BaseChangelog, entryDate, operationID, version, manualChangelogEntry) != nil {
				continue
			}

			changes = append(changes, &outputfilter.OasDiffEntry{
				Date:        entryDate,
				ID:          manualChangelogEntry,
				Text:        entryText.(string),
				Level:       int(checker.INFO),
				Operation:   config.Revision.HTTPMethod,
				OperationID: operationID,
				Path:        config.Revision.Path,
			})
		}
	}

	printManualChangesLogs(changes, version, m.PreviousRunDate, m.RunDate)
	return changes, nil
}

func printManualChangesLogs(changes []*outputfilter.OasDiffEntry, version, previousRunDate, runDate string) {
	if len(changes) == 0 {
		log.Printf("No manual changelog entries for v%s removal between [%s, %s]\n", version, previousRunDate, runDate)
		return
	}

	log.Printf("Detected %d manual changelog entries for v%s between [%s, %s]\n  - %s",
		len(changes), version, previousRunDate, runDate,
		strings.Join(func() []string {
			var result []string
			for _, c := range changes {
				result = append(result, fmt.Sprintf("%s %s %s", c.OperationID, c.Operation, c.Path))
			}
			return result
		}(), "\n  - "))
}
