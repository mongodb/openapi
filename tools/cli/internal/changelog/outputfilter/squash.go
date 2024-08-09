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
	identifierRegex = regexp.MustCompile(`'([^']+)'`)
)

type SquashHandler interface {
	Squash(entriesGroupedByOperationID map[string][]*OasDiffEntry) []*OasDiffEntry
}

func newSquashHandlers() map[string]func(map[string][]*OasDiffEntry) ([]*OasDiffEntry, error) {
	return map[string]func(map[string][]*OasDiffEntry) ([]*OasDiffEntry, error){
		// enum changes
		"response-property-enum-value-added":            squashResponsePropertyEnumValueAdded,
		"response-property-enum-value-removed":          squashResponsePropertyEnumValueRemoved,
		"response-mediatype-enum-value-removed":         squashResponseMediatypeEnumValueRemoved,
		"response-write-only-property-enum-value-added": squashResponseWriteOnlyPropertyEnumValueAdded,
		"request-body-enum-value-removed":               squashRequestBodyEnumValueRemoved,
		"request-parameter-enum-value-added":            squashRequestParameterEnumValueAdded,
		"request-parameter-enum-value-removed":          squashRequestParameterEnumValueRemoved,
		"request-property-enum-value-added":             squashRequestPropertyEnumValueAdded,
		"request-property-enum-value-removed":           squashRequestPropertyEnumValueRemoved,
		// field changes
		"response-required-property-added":            squashResponseRequiredFieldAdded,
		"response-required-property-removed":          squashResponseRequiredFieldRemoved,
		"response-optional-property-added":            squashResponseOptionalFieldAdded,
		"response-optional-property-removed":          squashResponseOptionalFieldRemoved,
		"response-property-became-required":           squashResponseFieldBecameRequired,
		"request-property-became-required":            squashRequestFieldBecameRequired,
		"new-required-request-property":               squashRequestFieldAdded,
		"request-property-removed":                    squashRequestFieldRemoved,
		"new-optional-request-property":               squashNewOptionalRequestProperty,
		"response-optional-property-became-read-only": squashResponseOptionalFieldBecomeReadonly,
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
		if _, ok := squashHandlers[entry.ID]; !ok {
			squashedEntries = append(squashedEntries, entry)
			continue
		}
	}

	for id, handler := range squashHandlers {
		entryMapPerOperationID, ok := entriesMap[id]
		if !ok {
			continue
		}

		entries, err := handler(entryMapPerOperationID)
		if err != nil {
			return nil, err
		}

		squashedEntries = append(squashedEntries, entries...)
	}

	return squashedEntries, nil
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

			squashedEntry := templateEntry
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
