package outputfilter

// squashRequestFieldAdded squashes oasdiff entries with id "new-required-request-property"
func squashRequestFieldAdded(entriesGroupedByOperationID map[string][]*OasDiffEntry) ([]*OasDiffEntry, error) {
	return squashFieldChanged(
		"new-required-request-property",
		entriesGroupedByOperationID,
		"request property",
		"request properties",
	)
}

// squashRequestFieldRemoved squashes oasdiff entries with id "request-property-removed"
func squashRequestFieldRemoved(entriesGroupedByOperationID map[string][]*OasDiffEntry) ([]*OasDiffEntry, error) {
	return squashFieldChanged(
		"request-property-removed",
		entriesGroupedByOperationID,
		"request property",
		"request properties",
	)
}

// squashResponseRequiredFieldAdded squashes oasdiff entries with id "response-required-property-added"
func squashResponseRequiredFieldAdded(entriesGroupedByOperationID map[string][]*OasDiffEntry) ([]*OasDiffEntry, error) {
	return squashFieldChanged(
		"response-required-property-added",
		entriesGroupedByOperationID,
		"required property",
		"required properties",
	)
}

// squashResponseRequiredFieldRemoved squashes oasdiff entries with id "response-required-property-removed"
func squashResponseRequiredFieldRemoved(entriesGroupedByOperationID map[string][]*OasDiffEntry) ([]*OasDiffEntry, error) {
	return squashFieldChanged(
		"response-required-property-removed",
		entriesGroupedByOperationID,
		"required property",
		"required properties",
	)
}

// squashResponseOptionalFieldAdded squashes oasdiff entries with id "response-optional-property-added"
func squashResponseOptionalFieldAdded(entriesGroupedByOperationID map[string][]*OasDiffEntry) ([]*OasDiffEntry, error) {
	return squashFieldChanged(
		"response-optional-property-added",
		entriesGroupedByOperationID,
		"optional property",
		"optional properties",
	)
}

// squashResponseOptionalFieldRemoved squashes oasdiff entries with id "response-optional-property-removed"
func squashResponseOptionalFieldRemoved(entriesGroupedByOperationID map[string][]*OasDiffEntry) ([]*OasDiffEntry, error) {
	return squashFieldChanged(
		"response-optional-property-removed",
		entriesGroupedByOperationID,
		"optional property",
		"optional properties",
	)
}

// squashResponseOptionalFieldBecomeReadonly squashes oasdiff entries with id "response-optional-property-became-read-only"
func squashResponseOptionalFieldBecomeReadonly(entriesGroupedByOperationID map[string][]*OasDiffEntry) ([]*OasDiffEntry, error) {
	return squashFieldChanged(
		"response-optional-property-became-read-only",
		entriesGroupedByOperationID,
		"optional property",
		"optional properties",
	)
}

// squashResponseFieldBecameRequired squashes oasdiff entries with id "response-property-became-required"
func squashResponseFieldBecameRequired(entriesGroupedByOperationID map[string][]*OasDiffEntry) ([]*OasDiffEntry, error) {
	return squashFieldChanged(
		"response-property-became-required",
		entriesGroupedByOperationID,
		"response property",
		"response properties",
	)
}

// squashRequestFieldBecameRequired squashes oasdiff entries with id "request-property-became-required"
func squashRequestFieldBecameRequired(entriesGroupedByOperationID map[string][]*OasDiffEntry) ([]*OasDiffEntry, error) {
	return squashFieldChanged(
		"request-property-became-required",
		entriesGroupedByOperationID,
		"request property",
		"request properties",
	)
}

// squashNewOptionalRequestProperty squashes oasdiff entries with id "new-optional-request-property"
func squashNewOptionalRequestProperty(entriesGroupedByOperationID map[string][]*OasDiffEntry) ([]*OasDiffEntry, error) {
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
	entriesGroupedByOperationID map[string][]*OasDiffEntry,
	pluralizeFrom string,
	pluralizeTo string,
) ([]*OasDiffEntry, error) {
	return squashEntriesByValues(
		operation,
		entriesGroupedByOperationID,
		1,
		0,
		pluralizeFrom,
		pluralizeTo,
	)
}
