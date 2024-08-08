package outputfilter

// squashRequestPropertyEnumValueAdded squashes oasdiff entries with id: "response-property-enum-value-added"
// Message format: "added the new 'DUBLIN_IRL' enum value to the '/items/dataProcessRegion/region' response property",
func squashResponsePropertyEnumValueAdded(entriesGroupedByOperationID map[string][]*Entry) ([]*Entry, error) {
	return squashEntriesByValues(
		"response-property-enum-value-added",
		entriesGroupedByOperationID,
		2,
		0,
		"enum value",
		"enum values",
	)
}

// squashResponsePropertyEnumValueRemoved squashes oasdiff entries with id: "response-property-enum-value-removed"
// Message format: "removed the 'DUBLIN_IRL' enum value from the '/items/dataProcessRegion/region' response property",
func squashResponsePropertyEnumValueRemoved(entriesGroupedByOperationID map[string][]*Entry) ([]*Entry, error) {
	return squashEntriesByValues(
		"response-property-enum-value-removed",
		entriesGroupedByOperationID,
		2,
		0,
		"enum value",
		"enum values",
	)
}

// squashResponseMediatypeEnumValueRemoved squashes oasdiff entries with id: "response-mediatype-enum-value-removed"
// Message format: "response schema application/json enum value removed 'DUBLIN_IRL'",
func squashResponseMediatypeEnumValueRemoved(entriesGroupedByOperationID map[string][]*Entry) ([]*Entry, error) {
	return squashEntriesByValues(
		"response-mediatype-enum-value-removed",
		entriesGroupedByOperationID,
		2,
		0,
		"enum value",
		"enum values",
	)
}

// squashResponseWriteOnlyPropertyEnumValueAdded squashes oasdiff entries with id: "response-write-only-property-enum-value-added"
// Message format: "added the new 'DUBLIN_IRL' enum value to the'/items/dataProcessRegion/region' response write-only property",
func squashResponseWriteOnlyPropertyEnumValueAdded(entriesGroupedByOperationID map[string][]*Entry) ([]*Entry, error) {
	return squashEntriesByValues(
		"response-write-only-property-enum-value-added",
		entriesGroupedByOperationID,
		2,
		0,
		"enum value",
		"enum values",
	)
}

// squashRequestBodyEnumValueRemoved squashes oasdiff entries with id: "request-body-enum-value-removed"
// Message format: "request body enum value removed 'DUBLIN_IRL'",
func squashRequestBodyEnumValueRemoved(entriesGroupedByOperationID map[string][]*Entry) ([]*Entry, error) {
	return squashEntriesByValues(
		"request-body-enum-value-removedd",
		entriesGroupedByOperationID,
		1,
		0,
		"enum value",
		"enum values",
	)
}

// squashRequestParameterEnumValueAdded squashes oasdiff entries with id: "request-parameter-enum-value-added"
// Message format: "added the new enum value 'AVAILABLE' to the 'query' request parameter 'status'",
func squashRequestParameterEnumValueAdded(entriesGroupedByOperationID map[string][]*Entry) ([]*Entry, error) {
	return squashEntriesByValues(
		"request-parameter-enum-value-added",
		entriesGroupedByOperationID,
		3,
		0,
		"enum value",
		"enum values",
	)
}

// squashRequestParameterEnumValueRemoved squashes oasdiff entries with id: "request-parameter-enum-value-removed"
// Message format: "removed the enum value 'AVAILABLE' from the 'query' request parameter 'status'",
func squashRequestParameterEnumValueRemoved(entriesGroupedByOperationID map[string][]*Entry) ([]*Entry, error) {
	return squashEntriesByValues(
		"request-parameter-enum-value-removed",
		entriesGroupedByOperationID,
		3,
		0,
		"enum value",
		"enum values",
	)
}

// squashRequestPropertyEnumValueAdded squashes oasdiff entries with id: "request-property-enum-value-added"
// Message format: "added the new 'DUBLIN_IRL' enum value to the request property '/items/dataProcessRegion/region'",
func squashRequestPropertyEnumValueAdded(entriesGroupedByOperationID map[string][]*Entry) ([]*Entry, error) {
	return squashEntriesByValues(
		"request-property-enum-value-added",
		entriesGroupedByOperationID,
		2,
		0,
		"enum value",
		"enum values",
	)
}

// squashRequestPropertyEnumValueRemoved squashes oasdiff entries with id: "request-property-enum-value-removed"
// Message format: "removed the enum value 'DUBLIN_IRL' of the request property '/items/dataProcessRegion/region'",
func squashRequestPropertyEnumValueRemoved(entriesGroupedByOperationID map[string][]*Entry) ([]*Entry, error) {
	return squashEntriesByValues(
		"request-property-enum-value-removed",
		entriesGroupedByOperationID,
		2,
		0,
		"enum value",
		"enum values",
	)
}
