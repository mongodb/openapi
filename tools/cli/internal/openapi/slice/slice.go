// Copyright 2025 MongoDB Inc
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//	http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package slice

import (
	"errors"
	"regexp"
	"slices"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/mongodb/openapi/tools/cli/internal/openapi/filter"
)

// Criteria defines the selection criteria for slicing an OpenAPI spec.
// Operations matching ANY of the specified criteria will be included (OR logic).
type Criteria struct {
	OperationIDs []string // Match by operation ID
	Tags         []string // Match by tag
	Paths        []string // Match by path (supports parameter normalization)
}

// Slice creates a minispec containing only operations matching the criteria.
// It removes non-matching operations and automatically cleans up unused tags and schemas.
// This ensures the resulting spec is valid and contains no dangling references.
func Slice(spec *openapi3.T, criteria *Criteria) error {
	if spec == nil {
		return errors.New("OpenAPI spec is nil")
	}

	if spec.Paths == nil {
		return nil
	}

	for path, pathItem := range spec.Paths.Map() {
		if pathItem == nil {
			continue
		}
		hasOperations := false
		for method, operation := range pathItem.Operations() {
			if operation == nil {
				continue
			}
			if matches(path, operation, criteria) {
				hasOperations = true
			} else {
				pathItem.SetOperation(method, nil)
			}
		}
		if !hasOperations {
			spec.Paths.Delete(path)
		}
	}

	filters := filter.FiltersToCleanupRefs(spec)
	for _, f := range filters {
		if err := f.Apply(); err != nil {
			return err
		}
	}

	return nil
}

// matches checks if an operation matches any of the criteria (OR logic).
func matches(path string, operation *openapi3.Operation, criteria *Criteria) bool {
	// Check if the path matches (with normalization)
	normalizedPath := normalizePath(path)
	for _, pattern := range criteria.Paths {
		if normalizedPath == normalizePath(pattern) {
			return true
		}
	}

	// Check if the operation ID matches
	if slices.Contains(criteria.OperationIDs, operation.OperationID) {
		return true
	}

	// Check if any tag matches
	for _, tag := range criteria.Tags {
		if slices.Contains(operation.Tags, tag) {
			return true
		}
	}

	return false
}

var pathParamRegex = regexp.MustCompile(`\{[^}]+\}`)

// normalizePath replaces all path parameters with {} for comparison.
// This allows matching paths with different parameter names.
// Example: /api/v2/groups/{groupId} and /api/v2/groups/{id} both normalize to /api/v2/groups/{}.
func normalizePath(path string) string {
	return pathParamRegex.ReplaceAllString(path, "{}")
}
