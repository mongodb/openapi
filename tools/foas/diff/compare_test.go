// Copyright 2026 MongoDB Inc
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

package diff

import (
	"context"
	"testing"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestCompareIdenticalDocuments(t *testing.T) {
	report, err := Compare(
		context.Background(),
		Document{Spec: endpointSpec(true, false, "listItems")},
		Document{Spec: endpointSpec(true, false, "listItems")},
	)
	require.NoError(t, err)

	assert.False(t, report.HasChanges)
	assert.Empty(t, report.Changes)
	assert.Equal(t, Summary{}, report.Summary)
	assert.Equal(t, RulesetVersion, report.RulesetVersion)
	assert.Equal(t, "oasdiff", report.Engine)
}

func TestCompareAddedEndpointIsNonBreaking(t *testing.T) {
	report, err := Compare(
		context.Background(),
		Document{Spec: endpointSpec(true, false, "listItems")},
		Document{Spec: endpointSpec(true, true, "listItems")},
	)
	require.NoError(t, err)

	change := findChange(t, report.Changes, func(change Change) bool {
		return change.Component == ComponentEndpoint &&
			change.ChangeType == ChangeTypeAdded
	})
	assert.False(t, change.Breaking)
	assert.Equal(t, SeverityInfo, change.Severity)
	assert.Equal(t, "DELETE", change.Operation)
	assert.Equal(t, "/items", change.Path)
	assert.NotEmpty(t, change.Fingerprint)
	assert.Equal(t, 0, report.Summary.Breaking)

	addedEndpoints := 0
	for _, change := range report.Changes {
		if change.Component == ComponentEndpoint && change.ChangeType == ChangeTypeAdded {
			addedEndpoints++
		}
	}
	assert.Equal(t, 1, addedEndpoints, "checker and structural additions must be deduplicated")
}

func TestCompareRemovedEndpointIsBreaking(t *testing.T) {
	report, err := Compare(
		context.Background(),
		Document{Spec: endpointSpec(true, true, "listItems")},
		Document{Spec: endpointSpec(false, true, "listItems")},
	)
	require.NoError(t, err)

	change := findChange(t, report.Changes, func(change Change) bool {
		return change.Breaking &&
			change.Component == ComponentEndpoint &&
			change.Path == "/items" &&
			change.Operation == "GET"
	})
	assert.Equal(t, SeverityError, change.Severity)
	assert.Equal(t, ChangeTypeDeleted, change.ChangeType, "%#v", change)
	assert.Positive(t, report.Summary.Breaking)
}

func TestCompareAppliesOperationIDRemovalRule(t *testing.T) {
	report, err := Compare(
		context.Background(),
		Document{Spec: endpointSpec(true, false, "listItems")},
		Document{Spec: endpointSpec(true, false, "")},
	)
	require.NoError(t, err)

	change := findChange(t, report.Changes, func(change Change) bool {
		return change.ID == "api-operation-id-removed"
	})
	assert.True(t, change.Breaking)
	assert.Equal(t, SeverityError, change.Severity)
}

func TestCompareWarningIsNonBreaking(t *testing.T) {
	report, err := Compare(
		context.Background(),
		Document{Spec: parameterSpec(false)},
		Document{Spec: parameterSpec(true)},
	)
	require.NoError(t, err)

	change := findChange(t, report.Changes, func(change Change) bool {
		return change.ID == "request-parameter-max-set"
	})
	assert.False(t, change.Breaking)
	assert.Equal(t, SeverityWarning, change.Severity)
}

func TestCompareAddedSchema(t *testing.T) {
	base := endpointSpec(true, false, "listItems")
	revision := endpointSpec(true, false, "listItems")
	revision.Components.Schemas["Region"] = &openapi3.SchemaRef{
		Value: &openapi3.Schema{Type: &openapi3.Types{"object"}},
	}

	report, err := Compare(
		context.Background(),
		Document{Spec: base},
		Document{Spec: revision},
	)
	require.NoError(t, err)

	change := findChange(t, report.Changes, func(change Change) bool {
		return change.Component == ComponentSchema &&
			change.ChangeType == ChangeTypeAdded &&
			change.Name == "Region"
	})
	assert.False(t, change.Breaking)
	assert.Equal(t, "api-schema-added", change.ID)
}

func TestCompareRejectsMissingDocumentsAndCancelledContext(t *testing.T) {
	_, err := Compare(context.Background(), Document{}, Document{Spec: endpointSpec(true, false, "listItems")})
	require.EqualError(t, err, "base OpenAPI document is required")

	ctx, cancel := context.WithCancel(context.Background())
	cancel()
	_, err = Compare(
		ctx,
		Document{Spec: endpointSpec(true, false, "listItems")},
		Document{Spec: endpointSpec(true, false, "listItems")},
	)
	assert.ErrorIs(t, err, context.Canceled)
}

func endpointSpec(includeGet, includeDelete bool, operationID string) *openapi3.T {
	spec := newSpec()
	pathItem := &openapi3.PathItem{}
	if includeGet {
		pathItem.Get = &openapi3.Operation{
			OperationID: operationID,
			Tags:        []string{"Items"},
			Responses:   successfulResponses(),
		}
	}
	if includeDelete {
		pathItem.Delete = &openapi3.Operation{
			OperationID: "deleteItems",
			Tags:        []string{"Items"},
			Responses:   successfulResponses(),
		}
	}
	spec.Paths.Set("/items", pathItem)
	return spec
}

func parameterSpec(withMaximum bool) *openapi3.T {
	spec := newSpec()
	schema := &openapi3.Schema{Type: &openapi3.Types{"integer"}}
	if withMaximum {
		maximum := 100.0
		schema.Max = &maximum
	}
	spec.Paths.Set("/items", &openapi3.PathItem{
		Get: &openapi3.Operation{
			OperationID: "listItems",
			Parameters: openapi3.Parameters{
				{Value: &openapi3.Parameter{
					Name:   "limit",
					In:     "query",
					Schema: &openapi3.SchemaRef{Value: schema},
				}},
			},
			Responses: successfulResponses(),
		},
	})
	return spec
}

func newSpec() *openapi3.T {
	return &openapi3.T{
		OpenAPI: "3.0.0",
		Info: &openapi3.Info{
			Title:   "Items API",
			Version: "1.0.0",
		},
		Paths: &openapi3.Paths{},
		Components: &openapi3.Components{
			Schemas: map[string]*openapi3.SchemaRef{
				"Item": {
					Value: &openapi3.Schema{Type: &openapi3.Types{"object"}},
				},
			},
		},
	}
}

func successfulResponses() *openapi3.Responses {
	description := "OK"
	responses := openapi3.NewResponses()
	responses.Set("200", &openapi3.ResponseRef{
		Value: &openapi3.Response{Description: &description},
	})
	return responses
}

func findChange(t *testing.T, changes []Change, matches func(Change) bool) Change {
	t.Helper()
	for index := range changes {
		change := changes[index]
		if matches(change) {
			return change
		}
	}
	t.Fatalf("matching change not found in %#v", changes)
	return Change{}
}
