package filter

import (
	"errors"
	"regexp"
	"slices"

	"github.com/getkin/kin-openapi/openapi3"
)

type SliceMetadata struct {
	OperationIDs []string
	Tags         []string
	Paths        []string
}

type SliceFilter struct {
	oas      *openapi3.T
	metadata *SliceMetadata
}

func NewSliceFilter(oas *openapi3.T, metadata *SliceMetadata) *SliceFilter {
	return &SliceFilter{
		oas:      oas,
		metadata: metadata,
	}
}

func (*SliceFilter) ValidateMetadata() error {
	return nil
}

func (f *SliceFilter) Apply() error {
	if f.oas == nil {
		return errors.New("OpenAPI spec is nil")
	}

	if f.oas.Paths == nil {
		return nil
	}

	for path, pathItem := range f.oas.Paths.Map() {
		if pathItem == nil {
			continue
		}
		hasOperations := false
		for method, operation := range pathItem.Operations() {
			if operation == nil {
				continue
			}
			if f.matches(path, operation) {
				hasOperations = true
			} else {
				pathItem.SetOperation(method, nil)
			}
		}
		if !hasOperations {
			f.oas.Paths.Delete(path)
		}
	}
	return nil
}

func (f *SliceFilter) matches(path string, operation *openapi3.Operation) bool {
	normalizedPath := normalizePath(path)
	for _, pattern := range f.metadata.Paths {
		if normalizedPath == normalizePath(pattern) {
			return true
		}
	}

	// Check if the operation ID matches
	if slices.Contains(f.metadata.OperationIDs, operation.OperationID) {
		return true
	}

	// Check if the tag matches
	for _, tag := range f.metadata.Tags {
		if slices.Contains(operation.Tags, tag) {
			return true
		}
	}
	return false
}

var pathParamRegex = regexp.MustCompile(`\{[^}]+\}`)

func normalizePath(path string) string {
	return pathParamRegex.ReplaceAllString(path, "{}")
}
