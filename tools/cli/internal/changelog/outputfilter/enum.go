package outputfilter

const (
	enumSingularForm = "enum value"
	enumPluralForm   = "enum values"
)

// squashRequestPropertyEnumValueAdded squashes oasdiff entries with id: "response-property-enum-value-added"
// Message format: "added the new 'DUBLIN_IRL' enum value to the '/items/dataProcessRegion/region' response property"
func squashResponsePropertyEnumValueAdded(entriesGroupedByOperationID map[string][]*OasDiffEntry) ([]*OasDiffEntry, error) {
	return squashEntriesByValues(
		"response-property-enum-value-added",
		entriesGroupedByOperationID,
		2,
		0,
		enumSingularForm,
		enumPluralForm,
	)
}

// squashResponsePropertyEnumValueRemoved squashes oasdiff entries with id: "response-property-enum-value-removed"
// Message format: "removed the 'DUBLIN_IRL' enum value from the '/items/dataProcessRegion/region' response property"
func squashResponsePropertyEnumValueRemoved(entriesGroupedByOperationID map[string][]*OasDiffEntry) ([]*OasDiffEntry, error) {
	return squashEntriesByValues(
		"response-property-enum-value-removed",
		entriesGroupedByOperationID,
		2,
		0,
		enumSingularForm,
		enumPluralForm,
	)
}

// squashResponseMediatypeEnumValueRemoved squashes oasdiff entries with id: "response-mediatype-enum-value-removed"
// Message format: "response schema application/json enum value removed from 'DUBLIN_IRL'"
func squashResponseMediatypeEnumValueRemoved(entriesGroupedByOperationID map[string][]*OasDiffEntry) ([]*OasDiffEntry, error) {
	return squashEntriesByValues(
		"response-mediatype-enum-value-removed",
		entriesGroupedByOperationID,
		1,
		0,
		enumSingularForm,
		enumPluralForm,
	)
}

// squashResponseWriteOnlyPropertyEnumValueAdded squashes oasdiff entries with id: "response-write-only-property-enum-value-added"
// Message format: "added the new 'DUBLIN_IRL' enum value to the '/items/dataProcessRegion/region' response write-only property",
func squashResponseWriteOnlyPropertyEnumValueAdded(entriesGroupedByOperationID map[string][]*OasDiffEntry) ([]*OasDiffEntry, error) {
	return squashEntriesByValues(
		"response-write-only-property-enum-value-added",
		entriesGroupedByOperationID,
		2,
		0,
		enumSingularForm,
		enumPluralForm,
	)
}

// squashRequestBodyEnumValueRemoved squashes oasdiff entries with id: "request-body-enum-value-removed"
// Message format: "request body enum value removed 'DUBLIN_IRL'",
func squashRequestBodyEnumValueRemoved(entriesGroupedByOperationID map[string][]*OasDiffEntry) ([]*OasDiffEntry, error) {
	return squashEntriesByValues(
		"request-body-enum-value-removed",
		entriesGroupedByOperationID,
		1,
		0,
		enumSingularForm,
		enumPluralForm,
	)
}

// squashRequestParameterEnumValueAdded squashes oasdiff entries with id: "request-parameter-enum-value-added"
// Message format: "added the new enum value 'AVAILABLE' to the 'query' request parameter 'status'"
func squashRequestParameterEnumValueAdded(entriesGroupedByOperationID map[string][]*OasDiffEntry) ([]*OasDiffEntry, error) {
	return squashEntriesByValues(
		"request-parameter-enum-value-added",
		entriesGroupedByOperationID,
		3,
		0,
		enumSingularForm,
		enumPluralForm,
	)
}

// squashRequestParameterEnumValueRemoved squashes oasdiff entries with id: "request-parameter-enum-value-removed"
// Message format: "removed the enum value 'AVAILABLE' from the 'query' request parameter 'status'"
func squashRequestParameterEnumValueRemoved(entriesGroupedByOperationID map[string][]*OasDiffEntry) ([]*OasDiffEntry, error) {
	return squashEntriesByValues(
		"request-parameter-enum-value-removed",
		entriesGroupedByOperationID,
		3,
		0,
		enumSingularForm,
		enumPluralForm,
	)
}

// squashRequestPropertyEnumValueAdded squashes oasdiff entries with id: "request-property-enum-value-added"
// Message format: "added the new 'DUBLIN_IRL' enum value to the request property '/items/dataProcessRegion/region'"
func squashRequestPropertyEnumValueAdded(entriesGroupedByOperationID map[string][]*OasDiffEntry) ([]*OasDiffEntry, error) {
	return squashEntriesByValues(
		"request-property-enum-value-added",
		entriesGroupedByOperationID,
		2,
		0,
		enumSingularForm,
		enumPluralForm,
	)
}

// squashRequestPropertyEnumValueRemoved squashes oasdiff entries with id: "request-property-enum-value-removed"
// Message format: "removed the enum value 'DUBLIN_IRL' of the request property '/items/dataProcessRegion/region'"
func squashRequestPropertyEnumValueRemoved(entriesGroupedByOperationID map[string][]*OasDiffEntry) ([]*OasDiffEntry, error) {
	return squashEntriesByValues(
		"request-property-enum-value-removed",
		entriesGroupedByOperationID,
		2,
		0,
		enumSingularForm,
		enumPluralForm,
	)
}
