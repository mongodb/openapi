package outputfilter

// SquashRequestFieldAdded squashes oasdiff entries with id "new-required-request-property"
func SquashRequestFieldAdded(entriesGroupedByOperationID map[string][]*Entry) ([]*Entry, error) {
	return squashFieldChanged(
		"new-required-request-property",
		entriesGroupedByOperationID,
		"request property",
		"request properties",
	)
}

// SquashRequestFieldRemoved squashes oasdiff entries with id "request-property-removed"
func SquashRequestFieldRemoved(entriesGroupedByOperationID map[string][]*Entry) ([]*Entry, error) {
	return squashFieldChanged(
		"request-property-removed",
		entriesGroupedByOperationID,
		"request property",
		"request properties",
	)
}

// SquashResponseRequiredFieldAdded squashes oasdiff entries with id "response-required-property-added"
func SquashResponseRequiredFieldAdded(entriesGroupedByOperationID map[string][]*Entry) ([]*Entry, error) {
	return squashFieldChanged(
		"response-required-property-added",
		entriesGroupedByOperationID,
		"required property",
		"required properties",
	)
}

// SquashResponseRequiredFieldRemoved squashes oasdiff entries with id "response-required-property-removed"
func SquashResponseRequiredFieldRemoved(entriesGroupedByOperationID map[string][]*Entry) ([]*Entry, error) {
	return squashFieldChanged(
		"response-required-property-removed",
		entriesGroupedByOperationID,
		"required property",
		"required properties",
	)
}

// SquashResponseOptionalFieldAdded squashes oasdiff entries with id "response-optional-property-added"
func SquashResponseOptionalFieldAdded(entriesGroupedByOperationID map[string][]*Entry) ([]*Entry, error) {
	return squashFieldChanged(
		"response-optional-property-added",
		entriesGroupedByOperationID,
		"optional property",
		"optional properties",
	)
}

// SquashResponseOptionalFieldRemoved squashes oasdiff entries with id "response-optional-property-removed"
func SquashResponseOptionalFieldRemoved(entriesGroupedByOperationID map[string][]*Entry) ([]*Entry, error) {
	return squashFieldChanged(
		"response-optional-property-removed",
		entriesGroupedByOperationID,
		"optional property",
		"optional properties",
	)
}

// SquashResponseOptionalFieldBecomeReadonly squashes oasdiff entries with id "response-optional-property-became-read-only"
func SquashResponseOptionalFieldBecomeReadonly(entriesGroupedByOperationID map[string][]*Entry) ([]*Entry, error) {
	return squashFieldChanged(
		"response-optional-property-became-read-only",
		entriesGroupedByOperationID,
		"optional property",
		"optional properties",
	)
}

// SquashResponseFieldBecameRequired squashes oasdiff entries with id "response-property-became-required"
func SquashResponseFieldBecameRequired(entriesGroupedByOperationID map[string][]*Entry) ([]*Entry, error) {
	return squashFieldChanged(
		"response-property-became-required",
		entriesGroupedByOperationID,
		"response property",
		"response properties",
	)
}

// SquashRequestFieldBecameRequired squashes oasdiff entries with id "request-property-became-required"
func SquashRequestFieldBecameRequired(entriesGroupedByOperationID map[string][]*Entry) ([]*Entry, error) {
	return squashFieldChanged(
		"request-property-became-required",
		entriesGroupedByOperationID,
		"request property",
		"request properties",
	)
}

// SquashNewOptionalRequestProperty squashes oasdiff entries with id "new-optional-request-property"
func SquashNewOptionalRequestProperty(entriesGroupedByOperationID map[string][]*Entry) ([]*Entry, error) {
	return squashFieldChanged(
		"new-optional-request-property",
		entriesGroupedByOperationID,
		"request property",
		"request properties",
	)
}

// squashFieldChanged is a helper function to squash entries based on the given operation
func squashFieldChanged(
	operation string,
	entriesGroupedByOperationID map[string][]*Entry,
	pluralizeFrom string,
	pluralizeTo string,
) ([]*Entry, error) {
	return squashEntriesByValues(
		operation,
		entriesGroupedByOperationID,
		1,
		0,
		pluralizeFrom,
		pluralizeTo,
	)
}
