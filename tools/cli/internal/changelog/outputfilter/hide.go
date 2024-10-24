package outputfilter

import (
	"log"
	"slices"
	"strings"

	"github.com/mongodb/openapi/tools/cli/internal/breakingchanges"
	"github.com/spf13/afero"
)

var hideIDs = []string{
	"response-required-property-became-write-only",
	"response-required-property-became-read-only",
	"response-required-property-became-not-read-only",
	"response-optional-property-became-write-only",
	"response-optional-property-became-read-only",
	"response-optional-property-became-not-write-only",
	"response-optional-property-became-not-read-only",
	"response-required-property-became-not-write-only",
	"api-sunset-date-too-small",
}

// MarkHiddenEntries sets the HideFromChangelog flag to true
func MarkHiddenEntries(entries []*OasDiffEntry, exemptionsFilePath string, fs afero.Fs) ([]*OasDiffEntry, error) {
	exemptions, err := getExemptionsFromPath(exemptionsFilePath, fs)
	if err != nil {
		return nil, err
	}

	entries, err = hideByExemptions(entries, exemptions)
	if err != nil {
		return nil, err
	}

	return hideByIDs(entries, hideIDs)
}

// hideByIDs removes entries with the specified IDs from the list of entries
func hideByIDs(entries []*OasDiffEntry, ids []string) ([]*OasDiffEntry, error) {
	if len(ids) == 0 {
		return entries, nil
	}

	for _, entry := range entries {
		if entry.HideFromChangelog {
			continue
		}
		if slices.Contains(ids, entry.ID) {
			entry.HideFromChangelog = true
		}
	}
	return entries, nil
}

// hideByExemptions hides entries based on the exemptions
func hideByExemptions(entries []*OasDiffEntry, exemptions []breakingchanges.Exemption) ([]*OasDiffEntry, error) {
	exemptionsMarkedHidden := breakingchanges.GetHiddenExemptions(exemptions)
	log.Printf("Found %d exemptions marked hidden from the changelog.", len(exemptionsMarkedHidden))
	hiddenEntries := 0
	for _, entry := range entries {
		if entry.HideFromChangelog {
			continue
		}
		for _, exemption := range exemptionsMarkedHidden {
			// If the path is not empty and the path is not in the exemption, skip
			if entry.Path != "" && !strings.Contains(exemption.BreakingChangeDescription, entry.Path) {
				continue
			}

			// If the ID is not empty and the ID is not in the exemption, skip
			if entry.ID != "" && !strings.Contains(exemption.BreakingChangeDescription, entry.ID) {
				continue
			}

			// Transform entry into a dummy exemption to compare descriptions
			dummyExemption := fromEntry(entry, exemption.HideFromChangelog)
			if !strings.Contains(exemption.BreakingChangeDescription, dummyExemption.BreakingChangeDescription) {
				continue
			}

			entry.HideFromChangelog = true
			hiddenEntries++
		}
	}

	log.Printf("Marked %d changes hidden from the changelog.", hiddenEntries)
	return entries, nil
}

func fromEntry(entry *OasDiffEntry, hideFromChangelog string) *breakingchanges.Exemption {
	description := entry.Operation + " " + entry.Path + " " + entry.Text + " [" + entry.ID + "]"
	if entry.Source == "" {
		description = entry.Text + " [" + entry.ID + "]"
	}

	return &breakingchanges.Exemption{
		BreakingChangeDescription: description,
		ExemptUntil:               "",
		Reason:                    "",
		HideFromChangelog:         hideFromChangelog,
	}
}

func getExemptionsFromPath(exemptionsFilePath string, fs afero.Fs) ([]breakingchanges.Exemption, error) {
	exemptions, err := breakingchanges.GetValidExemptionsList(exemptionsFilePath, true, fs)
	if err != nil {
		return nil, err
	}

	return exemptions, nil
}
