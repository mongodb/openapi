package outputfilter

// squashRequestFieldAdded squashes oasdiff entries with id "new-required-request-property".
func squashRequestFieldAdded(entriesGroupedByOperationID map[string][]*OasDiffEntry) ([]*OasDiffEntry, error) {
	return squashFieldChanged(
		"new-required-request-property",
		entriesGroupedByOperationID,
		1,
		"request property",
		"request properties",
	)
}

// squashRequestFieldRemoved squashes oasdiff entries with id "request-property-removed".
func squashRequestFieldRemoved(entriesGroupedByOperationID map[string][]*OasDiffEntry) ([]*OasDiffEntry, error) {
	return squashFieldChanged(
		"request-property-removed",
		entriesGroupedByOperationID,
		1,
		"request property",
		"request properties",
	)
}

// squashResponseRequiredFieldAdded squashes oasdiff entries with id "response-required-property-added".
// Message format (oasdiff v1.14.0+): "added the required property `X` to the response with the `200` status".
func squashResponseRequiredFieldAdded(entriesGroupedByOperationID map[string][]*OasDiffEntry) ([]*OasDiffEntry, error) {
	return squashFieldChanged(
		"response-required-property-added",
		entriesGroupedByOperationID,
		2,
		"required property",
		"required properties",
	)
}

// squashResponseRequiredFieldRemoved squashes oasdiff entries with id "response-required-property-removed".
// Message format (oasdiff v1.14.0+): "removed the required property `X` from the response with the `200` status".
func squashResponseRequiredFieldRemoved(entriesGroupedByOperationID map[string][]*OasDiffEntry) ([]*OasDiffEntry, error) {
	return squashFieldChanged(
		"response-required-property-removed",
		entriesGroupedByOperationID,
		2,
		"required property",
		"required properties",
	)
}

// squashResponseOptionalFieldAdded squashes oasdiff entries with id "response-optional-property-added".
// Message format (oasdiff v1.14.0+): "added the optional property `X` to the response with the `200` status".
func squashResponseOptionalFieldAdded(entriesGroupedByOperationID map[string][]*OasDiffEntry) ([]*OasDiffEntry, error) {
	return squashFieldChanged(
		"response-optional-property-added",
		entriesGroupedByOperationID,
		2,
		"optional property",
		"optional properties",
	)
}

// squashResponseOptionalFieldRemoved squashes oasdiff entries with id "response-optional-property-removed".
// Message format (oasdiff v1.14.0+): "removed the optional property `X` from the response with the `200` status".
func squashResponseOptionalFieldRemoved(entriesGroupedByOperationID map[string][]*OasDiffEntry) ([]*OasDiffEntry, error) {
	return squashFieldChanged(
		"response-optional-property-removed",
		entriesGroupedByOperationID,
		2,
		"optional property",
		"optional properties",
	)
}

// squashResponseOptionalFieldBecomeReadonly squashes oasdiff entries with id "response-optional-property-became-read-only".
// Message format (oasdiff v1.14.0+): "the response optional property `X` became read-only for the status `200`".
func squashResponseOptionalFieldBecomeReadonly(entriesGroupedByOperationID map[string][]*OasDiffEntry) ([]*OasDiffEntry, error) {
	return squashFieldChanged(
		"response-optional-property-became-read-only",
		entriesGroupedByOperationID,
		2,
		"optional property",
		"optional properties",
	)
}

// squashResponseFieldBecameRequired squashes oasdiff entries with id "response-property-became-required".
// Message format (oasdiff v1.14.0+): "the response property `X` became required for the status `200`".
func squashResponseFieldBecameRequired(entriesGroupedByOperationID map[string][]*OasDiffEntry) ([]*OasDiffEntry, error) {
	return squashFieldChanged(
		"response-property-became-required",
		entriesGroupedByOperationID,
		2,
		"response property",
		"response properties",
	)
}

// squashRequestFieldBecameRequired squashes oasdiff entries with id "request-property-became-required".
// Message format (oasdiff v1.14.0+): "the request property `X` became required".
func squashRequestFieldBecameRequired(entriesGroupedByOperationID map[string][]*OasDiffEntry) ([]*OasDiffEntry, error) {
	return squashFieldChanged(
		"request-property-became-required",
		entriesGroupedByOperationID,
		1,
		"request property",
		"request properties",
	)
}

// squashNewOptionalRequestProperty squashes oasdiff entries with id "new-optional-request-property".
// Message format (oasdiff v1.14.0+): "added the new optional request property `X`".
func squashNewOptionalRequestProperty(entriesGroupedByOperationID map[string][]*OasDiffEntry) ([]*OasDiffEntry, error) {
	return squashFieldChanged(
		"new-optional-request-property",
		entriesGroupedByOperationID,
		1,
		"request property",
		"request properties",
	)
}

// squashFieldChanged is a helper function to squash entries based on the given operation.
func squashFieldChanged(
	operation string,
	entriesGroupedByOperationID map[string][]*OasDiffEntry,
	expectedNumberOfValues int,
	pluralizeFrom string,
	pluralizeTo string,
) ([]*OasDiffEntry, error) {
	return squashEntriesByValues(
		operation,
		entriesGroupedByOperationID,
		expectedNumberOfValues,
		0,
		pluralizeFrom,
		pluralizeTo,
	)
}
