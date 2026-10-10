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
	"fmt"
	"testing"

	"github.com/oasdiff/oasdiff/checker"
	oasdiff "github.com/oasdiff/oasdiff/diff"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

const testExtensionUpdatedID = "api-test-extension-updated"

func TestCompareRunsCustomRules(t *testing.T) {
	base := endpointSpec(true, false, "listItems")
	revision := endpointSpec(true, false, "listItems")
	base.Paths.Value("/items").Get.Extensions = map[string]any{"x-test-extension": "old"}
	revision.Paths.Value("/items").Get.Extensions = map[string]any{"x-test-extension": "new"}

	report, err := compareWithCustomRules(
		context.Background(),
		Document{Spec: base},
		Document{Spec: revision},
		[]customRule{testExtensionRule()},
	)
	require.NoError(t, err)

	change := findChange(t, report.Changes, func(change Change) bool {
		return change.ID == testExtensionUpdatedID
	})
	assert.Equal(t, SeverityError, change.Severity)
	assert.True(t, change.Breaking)
	assert.Equal(t, "x-test-extension changed from \"old\" to \"new\"", change.Text)
	assert.Equal(t, "/items", change.Path)
	assert.Equal(t, "GET", change.Operation)
}

func TestValidateCustomRules(t *testing.T) {
	valid := testExtensionRule()

	tests := []struct {
		name  string
		rules []customRule
		error string
	}{
		{
			name:  "DuplicateID",
			rules: []customRule{valid, valid},
			error: `custom diff rule "api-test-extension-updated" is registered more than once`,
		},
		{
			name: "BuiltInID",
			rules: []customRule{
				newCustomRule(
					"api-operation-id-removed",
					SeverityError,
					"conflicting rule",
					testExtensionUpdatedCheck,
					checker.DirectionNone,
					checker.AreaPaths,
					checker.KindType,
					checker.ActionChange,
					testExtensionMessage,
				),
			},
			error: `custom diff rule "api-operation-id-removed" conflicts with an oasdiff rule`,
		},
		{
			name: "MissingHandler",
			rules: []customRule{
				newCustomRule(
					"missing-handler",
					SeverityError,
					"missing handler",
					nil,
					checker.DirectionNone,
					checker.AreaPaths,
					checker.KindType,
					checker.ActionChange,
					testExtensionMessage,
				),
			},
			error: `custom diff rule "missing-handler" checker is required`,
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			assert.EqualError(t, validateCustomRules(test.rules), test.error)
		})
	}
}

func TestCustomChecksDeduplicatesSharedHandlers(t *testing.T) {
	first := testExtensionRule()
	second := first
	second.id = "api-second-test-extension-updated"

	assert.Len(t, customChecks([]customRule{first, second}), 1)
}

func testExtensionRule() customRule {
	return newCustomRule(
		testExtensionUpdatedID,
		SeverityError,
		"an operation extension changed",
		testExtensionUpdatedCheck,
		checker.DirectionNone,
		checker.AreaPaths,
		checker.KindType,
		checker.ActionChange,
		testExtensionMessage,
	)
}

func testExtensionMessage(args []any) string {
	return fmt.Sprintf("x-test-extension changed from %q to %q", args[0], args[1])
}

func testExtensionUpdatedCheck(
	report *oasdiff.Diff,
	operationSources *oasdiff.OperationsSourcesMap,
	config *checker.Config,
) checker.Changes {
	var changes checker.Changes
	if report.PathsDiff == nil {
		return changes
	}

	for path, pathItem := range report.PathsDiff.Modified {
		if pathItem.OperationsDiff == nil {
			continue
		}
		for operation, operationItem := range pathItem.OperationsDiff.Modified {
			if operationItem.ExtensionsDiff == nil {
				continue
			}
			if operationItem.ExtensionsDiff.Modified["x-test-extension"] == nil {
				continue
			}
			changes = append(changes, checker.NewApiChange(
				testExtensionUpdatedID,
				config,
				[]any{
					operationItem.Base.Extensions["x-test-extension"],
					operationItem.Revision.Extensions["x-test-extension"],
				},
				"",
				operationSources,
				pathItem.Revision.GetOperation(operation),
				operation,
				path,
			))
		}
	}
	return changes
}
