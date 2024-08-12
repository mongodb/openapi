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
	"time"

	"github.com/mongodb/openapi/tools/cli/internal/changelog/outputfilter"
	"github.com/tufin/oasdiff/checker"
)

const endpointRemovedCode = "endpoint-removed"

// newOasDiffEntriesFromSunsetEndpoints searches for resource versions marked for removal between
// previous changelog run date and current date (inclusive), and that not already included in the changelog.
// Returns a list of sunset endpoints with the same format as oasdiff results.
func (m *Metadata) newOasDiffEntriesFromSunsetEndpoints(
	confs map[string]*outputfilter.OperationConfigs, 
	version string) ([]*outputfilter.OasDiffEntry, error) {
	changes := make([]*outputfilter.OasDiffEntry, 0)
	for operationID, config := range confs {
		markedForRemoval, err := isResourceVersionMarkedForRemoval(config, m.PreviousRunDate, m.RunDate)
		if err != nil {
			return nil, err
		}

		if  ! markedForRemoval{
			continue
		}

		// Avoid adding duplicates in the changelog
		if findChangelogEntry(m.BaseChangelog, config.Revision.Sunset, operationID, version, endpointRemovedCode) == nil {
			changes = append(changes, &outputfilter.OasDiffEntry{
				Date:        config.Revision.Sunset,
				ID:          endpointRemovedCode,
				Text:        "endpoint removed",
				Level:       int(checker.ERR),
				Operation:   config.Revision.HTTPMethod,
				OperationID: operationID,
				Path:        config.Revision.Path,
			})
		}
	}

	printSunsetLogChanges(changes, version, m.PreviousRunDate, m.RunDate)
	return changes, nil
}



// isResourceVersionMarkedForRemoval checks if a resource sunset is marked for removal between previousRunDate and runDate.
func isResourceVersionMarkedForRemoval(config *outputfilter.OperationConfigs, previousRunDate, runDate string) (bool, error) {
	if config == nil || config.Revision == nil {
		return false, nil
	}

	if config.Revision == nil || config.Revision.Sunset == "" {
		return false, nil
	}

	return isEntryDateBetween(config.Revision.Sunset, previousRunDate, runDate)
}

func isEntryDateBetween(entryDateString, startDateString, endDateString string) (bool, error) {
	startDate, err := newDateFromString(startDateString)
    if err != nil {
        return false, err
    }
	endDate, err := newDateFromString(endDateString)
	if err != nil {
		return false, err
	}

	entryDate, err := newDateFromString(entryDateString)
	if err != nil {
		return false, err
	}

	return  (entryDate.After(startDate) || entryDate.Equal(startDate)) && 
	(entryDate.Before(endDate)|| entryDate.Equal(endDate)), nil
}


func newDateFromString(dateString string) (time.Time, error) {
	return time.Parse("2006-01-02", dateString)
}

func printSunsetLogChanges(changes []*outputfilter.OasDiffEntry, version, previousRunDate, runDate string) {
	if len(changes) == 0 {
		log.Printf("No endpoints marked for removal between [%s, %s]\n", previousRunDate, runDate)
		return
	}

	log.Printf("Detected %d v%s endpoints marked for removal between [%s, %s]\n  - %s",
		len(changes), version, previousRunDate, runDate,
		strings.Join(func() []string {
			var result []string
			for _, c := range changes {
				result = append(result, fmt.Sprintf("%s %s %s", c.OperationID, c.Operation, c.Path))
			}
			return result
		}(), "\n  - "))
}
