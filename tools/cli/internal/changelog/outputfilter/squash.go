package outputfilter

import (
	"fmt"
	"sort"
	"strings"

	"regexp"
)

var (
	// identifierRegex matches text enclosed in single quotes.
	// Example: it'll match "value" from the string "added the new required request property 'value'".
	// Example: it'll match "" and "/items/dataProcessRegion/region" from the string
	//"removed the '' enum value from the '/items/dataProcessRegion/region' response property".
	identifierRegex = regexp.MustCompile(`'([^']*)'`)
)

type SquashHandler interface {
	Squash(entriesGroupedByOperationID map[string][]*OasDiffEntry) []*OasDiffEntry
}

type handler struct {
	id       string
	squasher func(map[string][]*OasDiffEntry) ([]*OasDiffEntry, error)
}

func newSquashHandlers() []handler {
	return []handler{
		// enum changes
		{
			id:       "response-property-enum-value-added",
			squasher: squashResponsePropertyEnumValueAdded,
		},
		{
			id:       "response-property-enum-value-removed",
			squasher: squashResponsePropertyEnumValueRemoved,
		},
		{
			id:       "response-mediatype-enum-value-removed",
			squasher: squashResponseMediatypeEnumValueRemoved,
		},
		{
			id:       "response-write-only-property-enum-value-added",
			squasher: squashResponseWriteOnlyPropertyEnumValueAdded,
		},
		{
			id:       "request-body-enum-value-removed",
			squasher: squashRequestBodyEnumValueRemoved,
		},
		{
			id:       "request-parameter-enum-value-added",
			squasher: squashRequestParameterEnumValueAdded,
		},
		{
			id:       "request-parameter-enum-value-removed",
			squasher: squashRequestParameterEnumValueRemoved,
		},
		{
			id:       "request-property-enum-value-added",
			squasher: squashRequestPropertyEnumValueAdded,
		},
		{
			id:       "request-property-enum-value-removed",
			squasher: squashRequestPropertyEnumValueRemoved,
		},
		// field changes
		{
			id:       "response-required-property-added",
			squasher: squashResponseRequiredFieldAdded,
		},
		{
			id:       "response-required-property-removed",
			squasher: squashResponseRequiredFieldRemoved,
		},
		{
			id:       "response-optional-property-added",
			squasher: squashResponseOptionalFieldAdded,
		},
		{
			id:       "response-optional-property-removed",
			squasher: squashResponseOptionalFieldRemoved,
		},
		{
			id:       "response-property-became-required",
			squasher: squashResponseFieldBecameRequired,
		},
		{
			id:       "request-property-became-required",
			squasher: squashRequestFieldBecameRequired,
		},
		{
			id:       "new-required-request-property",
			squasher: squashRequestFieldAdded,
		},

		{
			id:       "request-property-removed",
			squasher: squashRequestFieldRemoved,
		},

		{
			id:       "new-optional-request-property",
			squasher: squashNewOptionalRequestProperty,
		},

		{
			id:       "response-optional-property-became-read-only",
			squasher: squashResponseOptionalFieldBecomeReadonly,
		},
	}
}

// EntryMappings groups entries by ID and then by OperationID and returns a Map[changeCode, Map[operationId, List[oasdiffEntry]]]
func newEntriesMapPerIDAndOperationID(entries []*OasDiffEntry) map[string]map[string][]*OasDiffEntry {
	result := make(map[string]map[string][]*OasDiffEntry)

	for _, entry := range entries {
		code := entry.ID
		operationID := entry.OperationID

		// Ensure the code map exists
		if _, exists := result[code]; !exists {
			result[code] = make(map[string][]*OasDiffEntry)
		}

		// Append the entry to the appropriate operationID slice
		result[code][operationID] = append(result[code][operationID], entry)
	}

	return result
}

func squashEntries(entries []*OasDiffEntry) ([]*OasDiffEntry, error) {
	entriesMap := newEntriesMapPerIDAndOperationID(entries)
	squashHandlers := newSquashHandlers()
	squashedEntries := []*OasDiffEntry{}

	for _, entry := range entries {
		// if no squash handlers implemented for entry's code,
		// just append the entry to the result
		if _, ok := findHandler(entry.ID); !ok {
			squashedEntries = append(squashedEntries, entry)
			continue
		}
	}

	for _, handler := range squashHandlers {
		entryMapPerOperationID, ok := entriesMap[handler.id]
		if !ok {
			continue
		}

		entries, err := handler.squasher(entryMapPerOperationID)
		if err != nil {
			return nil, err
		}

		squashedEntries = append(squashedEntries, sortEntriesByDescription(entries)...)
	}

	return squashedEntries, nil
}

func sortEntriesByDescription(entries []*OasDiffEntry) []*OasDiffEntry {
	sort.Slice(entries, func(i, j int) bool {
		return entries[i].Text < entries[j].Text
	})

	return entries
}

func findHandler(id string) (*handler, bool) {
	for _, h := range newSquashHandlers() {
		if h.id == id {
			return &h, true
		}
	}
	return nil, false
}

type squashedEntries struct {
	valuesNotSquashed []string
	valuesToSquash    map[string]struct{}
}

// squashEntriesByValues squashes entries based on the given parameters
func squashEntriesByValues(
	operation string,
	entriesGroupedByOperationID map[string][]*OasDiffEntry,
	expectedNumberOfValues,
	squashIdx int,
	pluralizeFrom,
	pluralizeTo string,
) ([]*OasDiffEntry, error) {
	if len(entriesGroupedByOperationID) == 0 {
		return nil, nil
	}

	result := []*OasDiffEntry{}

	for _, opEntries := range entriesGroupedByOperationID {
		squashMap, err := newSquashMap(operation, opEntries, expectedNumberOfValues, squashIdx)
		if err != nil {
			return nil, err
		}

		templateEntry := opEntries[0]
		templateText := templateEntry.Text

		for _, squashData := range squashMap {
			keyValues := squashData.valuesNotSquashed
			squashValues := squashData.valuesToSquash

			text := templateText
			for idx, value := range keyValues {
				var valuesToAddToTemplate string
				if idx == squashIdx {
					squashList := []string{}
					for sv := range squashValues {
						squashList = append(squashList, sv)
					}
					sort.Strings(squashList)
					valuesToAddToTemplate = strings.Join(squashList, ", ")
				} else {
					valuesToAddToTemplate = value
				}
				text = replaceOnlyFirstOccurrence(text, valuesToAddToTemplate)
			}

			squashedEntry := &OasDiffEntry{
				ID:                templateEntry.ID,
				OperationID:       templateEntry.OperationID,
				Date:              templateEntry.Date,
				Level:             templateEntry.Level,
				Operation:         templateEntry.Operation,
				Path:              templateEntry.Path,
				Source:            templateEntry.Source,
				HideFromChangelog: templateEntry.HideFromChangelog,
				Section:           templateEntry.Section,
			}

			squashedEntry.Text = strings.ReplaceAll(
				strings.ReplaceAll(
					text,
					"``",
					"'",
				),
				pluralizeFrom,
				pluralizeToIfNeeded(pluralizeFrom, pluralizeTo, len(squashValues)),
			)
			result = append(result, squashedEntry)
		}
	}
	return result, nil
}

// replaceOnlyFirstOccurrence replaces only the first occurrence of the identifierRegex
// in the template with the valuesToAddToTemplate.
// Why do we need to replace only the first occurrence?
// OasDiffEntry.Text may have messages with multiple values enclosed in single quotes such as
// "added the new 'DUBLIN_IRL' enum value to the '/items/dataProcessRegion/region' response property".
// In this scenario, calling ReplaceAllStringFunc will also replace '/items/dataProcessRegion/region' which is not intended.
func replaceOnlyFirstOccurrence(template, valuesToAddToTemplate string) string {
	// Variable to track if a replacement has been made
	replacementMade := false

	return identifierRegex.ReplaceAllStringFunc(template, func(match string) string {
		if !replacementMade {
			replacementMade = true
			return fmt.Sprintf("``%v``", valuesToAddToTemplate)
		}
		return match
	})
}

func newSquashMap(operation string, entries []*OasDiffEntry, expectedNumberOfValues, squashIdx int) (map[string]squashedEntries, error) {
	// 	squash_map is a dictionary where:
	//      The key is a string generated by concatenating values extracted from each entry, excluding the one at squash_idx (the index to be squashed).
	//      The value is a tuple:
	//		- The first element is a list of the values that are not squashed. Example: [regionName, 200]
	// 		- The second element is a set of values that should be squashed. Example: ("GLOBAL_EVENT_ADMIN", "ORG_MEMBER")
	squashMap := map[string]squashedEntries{}

	for _, entry := range entries {
		values, err := extractExactValuesOrFail(operation, entry, expectedNumberOfValues)
		if err != nil {
			return nil, err
		}
		valueToSquash := values[squashIdx]
		values[squashIdx] = ""

		mergedKey := strings.Join(values, "|")
		if _, exists := squashMap[mergedKey]; !exists {
			squashMap[mergedKey] = squashedEntries{
				valuesNotSquashed: values,
				valuesToSquash:    make(map[string]struct{}),
			}
		}
		squashMap[mergedKey].valuesToSquash[valueToSquash] = struct{}{}
	}

	return squashMap, nil
}

// extractExactValuesOrFail extracts a list of values enclosed in single quotes from a given text entry.
// If the number of extracted values doesn’t match the expected number (expectedNumberOfValues), it returns an error.
func extractExactValuesOrFail(operation string, entry *OasDiffEntry, expectedNumberOfValues int) ([]string, error) {
	text := entry.Text
	values := identifierRegex.FindAllStringSubmatch(text, -1)

	// Extract the matched values
	extractedValues := []string{}
	for _, match := range values {
		if len(match) > 1 {
			extractedValues = append(extractedValues, match[1])
		}
	}

	if len(extractedValues) == expectedNumberOfValues {
		return extractedValues, nil
	}

	return nil, fmt.Errorf(
		"the pattern for %s message was changed. Expecting exactly %d values between apostrophes: %s",
		operation, expectedNumberOfValues, text)
}

// pluralizeToIfNeeded checks if pluralization is needed
func pluralizeToIfNeeded(from, to string, count int) string {
	if count > 1 {
		return to
	}
	return from
}
