package tools

import (
	"strings"
	"testing"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/mongodb/openapi/tools/mcp-server/internal/registry"
)

// setupTestRegistry creates a registry with the test spec loaded.
func setupTestRegistry(t *testing.T) *registry.Registry {
	t.Helper()
	reg := registry.New()
	spec := createTestSpec()
	err := reg.Add("test-api", "/test/api.yaml", spec, nil)
	if err != nil {
		t.Fatalf("Failed to add spec: %v", err)
	}
	return reg
}

// ExpectedResults defines expected search results for table-driven tests.
type ExpectedResults struct {
	Operations []string
	Schemas    []string
	Parameters []string
	Paths      []string
	Tags       []string
	TotalCount int
}

// assertSearchResults verifies all aspects of search results.
func assertSearchResults(t *testing.T, result *SearchResult, expected *ExpectedResults) {
	t.Helper()
	assertExactOperationIDs(t, result.Operations, expected.Operations)
	assertExactSchemaNames(t, result.Schemas, expected.Schemas)
	assertExactParameterNames(t, result.Parameters, expected.Parameters)
	assertExactPaths(t, result.Paths, expected.Paths)

	if len(expected.Tags) > 0 {
		if len(result.Tags) != len(expected.Tags) {
			t.Errorf("Expected %d tags, got %d", len(expected.Tags), len(result.Tags))
		}
		for i, expectedTag := range expected.Tags {
			if i < len(result.Tags) && result.Tags[i].Name != expectedTag {
				t.Errorf("Expected tag '%s', got '%s'", expectedTag, result.Tags[i].Name)
			}
		}
	}

	if expected.TotalCount > 0 && result.Pagination.TotalMatches != expected.TotalCount {
		t.Errorf("Expected totalMatches=%d, got %d", expected.TotalCount, result.Pagination.TotalMatches)
	}
}

// assertExactOperationIDs verifies the exact set of operation IDs.
func assertExactOperationIDs(t *testing.T, operations []OperationMatch, expectedIDs []string) {
	t.Helper()
	if len(operations) != len(expectedIDs) {
		t.Errorf("Expected %d operations, got %d", len(expectedIDs), len(operations))
		t.Logf("Got: %v", getOperationIDs(operations))
		t.Logf("Expected: %v", expectedIDs)
	}
	found := make(map[string]bool)
	for i := range operations {
		found[operations[i].OperationID] = true
	}
	for _, expectedID := range expectedIDs {
		if !found[expectedID] {
			t.Errorf("Expected operation ID '%s' not found", expectedID)
		}
	}
	expectedSet := make(map[string]bool)
	for _, id := range expectedIDs {
		expectedSet[id] = true
	}
	for i := range operations {
		if !expectedSet[operations[i].OperationID] {
			t.Errorf("Unexpected operation ID '%s' found", operations[i].OperationID)
		}
	}
}

// assertExactSchemaNames verifies the exact set of schema names.
func assertExactSchemaNames(t *testing.T, schemas []SchemaMatch, expectedNames []string) {
	t.Helper()
	if len(schemas) != len(expectedNames) {
		t.Errorf("Expected %d schemas, got %d", len(expectedNames), len(schemas))
		t.Logf("Got: %v", getSchemaNames(schemas))
		t.Logf("Expected: %v", expectedNames)
	}
	found := make(map[string]bool)
	for _, schema := range schemas {
		found[schema.Name] = true
	}
	for _, expectedName := range expectedNames {
		if !found[expectedName] {
			t.Errorf("Expected schema '%s' not found", expectedName)
		}
	}
}

// assertExactParameterNames verifies the exact set of parameter names.
func assertExactParameterNames(t *testing.T, parameters []ParameterMatch, expectedNames []string) {
	t.Helper()
	if len(parameters) != len(expectedNames) {
		t.Errorf("Expected %d parameters, got %d", len(expectedNames), len(parameters))
		t.Logf("Got: %v", getParameterNames(parameters))
		t.Logf("Expected: %v", expectedNames)
	}
	found := make(map[string]bool)
	for _, param := range parameters {
		found[param.Name] = true
	}
	for _, expectedName := range expectedNames {
		if !found[expectedName] {
			t.Errorf("Expected parameter '%s' not found", expectedName)
		}
	}
}

// assertExactPaths verifies the exact set of paths.
func assertExactPaths(t *testing.T, paths []PathMatch, expectedPaths []string) {
	t.Helper()
	if len(paths) != len(expectedPaths) {
		t.Errorf("Expected %d paths, got %d", len(expectedPaths), len(paths))
		t.Logf("Got: %v", getPaths(paths))
		t.Logf("Expected: %v", expectedPaths)
	}
	found := make(map[string]bool)
	for _, path := range paths {
		found[path.Path] = true
	}
	for _, expectedPath := range expectedPaths {
		if !found[expectedPath] {
			t.Errorf("Expected path '%s' not found", expectedPath)
		}
	}
}

// Helper functions to extract names/IDs for logging.
func getOperationIDs(operations []OperationMatch) []string {
	ids := make([]string, len(operations))
	for i := range operations {
		ids[i] = operations[i].OperationID
	}
	return ids
}

func getSchemaNames(schemas []SchemaMatch) []string {
	names := make([]string, len(schemas))
	for i, schema := range schemas {
		names[i] = schema.Name
	}
	return names
}

func getParameterNames(parameters []ParameterMatch) []string {
	names := make([]string, len(parameters))
	for i, param := range parameters {
		names[i] = param.Name
	}
	return names
}

func getPaths(paths []PathMatch) []string {
	pathStrs := make([]string, len(paths))
	for i, path := range paths {
		pathStrs[i] = path.Path
	}
	return pathStrs
}

func TestHandleSearch_Patterns(t *testing.T) {
	reg := setupTestRegistry(t)

	tests := []struct {
		name     string
		params   SearchParams
		expected ExpectedResults
		checkFn  func(*testing.T, SearchResult) // Optional additional checks
	}{
		{
			name: "pattern: user",
			params: SearchParams{
				Alias:   "test-api",
				Pattern: "user",
			},
			expected: ExpectedResults{
				Operations: []string{"getUsers", "createUser", "getUser"},
				Schemas:    []string{"User"},
				Parameters: []string{"userId"},
				Paths:      []string{"/users", "/users/{userId}"},
				Tags:       []string{"Users"},
				TotalCount: 8,
			},
			checkFn: func(t *testing.T, result SearchResult) {
				t.Helper()
				// Verify matchedIn is populated
				for i := range result.Operations {
					if len(result.Operations[i].MatchedIn) == 0 {
						t.Errorf("Expected matchedIn populated for %s", result.Operations[i].OperationID)
					}
				}
			},
		},
		{
			name: "pattern: cluster",
			params: SearchParams{
				Alias:   "test-api",
				Pattern: "cluster",
			},
			expected: ExpectedResults{
				Operations: []string{"createCluster", "listClusters", "getCluster"},
				Schemas:    []string{"Cluster"},
				Parameters: []string{"clusterId"},
				Paths:      []string{"/clusters", "/clusters/{clusterId}"},
				Tags:       []string{"Clusters"},
				TotalCount: 8,
			},
			checkFn: func(t *testing.T, result SearchResult) {
				t.Helper()
				// Verify Cluster schema matched by both name and property
				if len(result.Schemas) > 0 {
					schema := result.Schemas[0]
					hasName := false
					hasProps := false
					for _, field := range schema.MatchedIn {
						if field == "name" {
							hasName = true
						}
						if field == "properties" {
							hasProps = true
						}
					}
					if !hasName || !hasProps {
						t.Errorf("Expected Cluster to match by name and properties, got: %v", schema.MatchedIn)
					}
				}
			},
		},
		{
			name: "case-insensitive: USER",
			params: SearchParams{
				Alias:   "test-api",
				Pattern: "USER",
			},
			expected: ExpectedResults{
				Operations: []string{"getUsers", "createUser", "getUser"},
				Schemas:    []string{"User"},
				Parameters: []string{"userId"},
				Paths:      []string{"/users", "/users/{userId}"},
				Tags:       []string{"Users"},
				TotalCount: 8,
			},
		},
		{
			name: "case-sensitive: USER (no match)",
			params: SearchParams{
				Alias:         "test-api",
				Pattern:       "USER",
				CaseSensitive: true,
			},
			expected: ExpectedResults{
				Operations: []string{},
				Schemas:    []string{},
				Parameters: []string{},
				Paths:      []string{},
				Tags:       []string{},
				TotalCount: 0,
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := handleSearch(reg, tt.params)
			if err != nil {
				t.Fatalf("handleSearch() failed: %v", err)
			}

			if !result.Success {
				t.Error("Expected success=true")
			}

			assertSearchResults(t, &result, &tt.expected)

			if tt.checkFn != nil {
				tt.checkFn(t, result)
			}
		})
	}
}

func TestHandleSearch_InvalidRegex(t *testing.T) {
	reg := setupTestRegistry(t)

	params := SearchParams{
		Alias:   "test-api",
		Pattern: "[invalid(regex",
	}

	_, err := handleSearch(reg, params)
	if err == nil {
		t.Error("Expected error for invalid regex")
	}

	if !strings.Contains(err.Error(), "invalid regex") && !strings.Contains(err.Error(), "error parsing regexp") {
		t.Errorf("Expected regex error message, got: %v", err)
	}
}

func TestHandleSearch_Pagination(t *testing.T) {
	reg := registry.New()

	spec := &openapi3.T{
		OpenAPI: "3.0.0",
		Info: &openapi3.Info{
			Title:   "Test API",
			Version: "1.0.0",
		},
		Paths: &openapi3.Paths{},
	}

	// Add multiple operations (15 to test limit of 5)
	for i := 0; i < 15; i++ {
		path := "/endpoint" + string(rune('a'+i))
		spec.Paths.Set(path, &openapi3.PathItem{
			Get: &openapi3.Operation{
				OperationID: "getEndpoint" + string(rune('A'+i)),
				Summary:     "Test endpoint " + string(rune('A'+i)),
			},
		})
	}

	err := reg.Add("test-api", "/test/api.yaml", spec, nil)
	if err != nil {
		t.Fatalf("Failed to add spec: %v", err)
	}

	// Test with limit=5 per category
	params := SearchParams{
		Alias:   "test-api",
		Pattern: "endpoint",
		Limit:   5,
	}

	result, err := handleSearch(reg, params)
	if err != nil {
		t.Fatalf("handleSearch() failed: %v", err)
	}

	// We should get 5 operations and 5 paths (limited)
	if len(result.Operations) != 5 {
		t.Errorf("Expected 5 operations (limited), got %d", len(result.Operations))
	}

	if len(result.Paths) != 5 {
		t.Errorf("Expected 5 paths (limited), got %d", len(result.Paths))
	}

	// Total matches should be 30 (15 paths + 15 operations)
	if result.Pagination.TotalMatches != 30 {
		t.Errorf("Expected totalMatches=30, got %d", result.Pagination.TotalMatches)
	}

	// Verify pagination metadata is exact
	if result.Pagination.Limit != 5 {
		t.Errorf("Expected limit=5, got %d", result.Pagination.Limit)
	}

	if result.Pagination.TotalMatches != 30 {
		t.Errorf("Expected totalMatches=30 (15 paths + 15 operations), got %d", result.Pagination.TotalMatches)
	}

	// Verify category counts (before truncation)
	if result.Pagination.CategoryCounts["operations"] != 15 {
		t.Errorf("Expected categoryCounts['operations']=15, got %d", result.Pagination.CategoryCounts["operations"])
	}

	if result.Pagination.CategoryCounts["paths"] != 15 {
		t.Errorf("Expected categoryCounts['paths']=15, got %d", result.Pagination.CategoryCounts["paths"])
	}

	// Should indicate more available for both categories
	if !result.Pagination.CategoryHasMore["operations"] {
		t.Error("Expected categoryHasMore['operations']=true (15 total, limit 5)")
	}

	if !result.Pagination.CategoryHasMore["paths"] {
		t.Error("Expected categoryHasMore['paths']=true (15 total, limit 5)")
	}

	// Other categories should not be in categoryHasMore
	if result.Pagination.CategoryHasMore["schemas"] {
		t.Error("Expected categoryHasMore['schemas'] to be false (0 matches)")
	}
}

func TestHandleSearch_SearchInFilter(t *testing.T) {
	reg := setupTestRegistry(t)

	tests := []struct {
		name     string
		searchIn []string
		expected ExpectedResults
	}{
		{
			name:     "only schemas",
			searchIn: []string{"schemas"},
			expected: ExpectedResults{
				Operations: []string{},
				Schemas:    []string{"User"},
				Parameters: []string{},
				Paths:      []string{},
				Tags:       []string{},
			},
		},
		{
			name:     "only operations",
			searchIn: []string{"operations"},
			expected: ExpectedResults{
				Operations: []string{"getUsers", "createUser", "getUser"},
				Schemas:    []string{},
				Parameters: []string{},
				Paths:      []string{},
				Tags:       []string{},
			},
		},
		{
			name:     "operations and schemas",
			searchIn: []string{"operations", "schemas"},
			expected: ExpectedResults{
				Operations: []string{"getUsers", "createUser", "getUser"},
				Schemas:    []string{"User"},
				Parameters: []string{},
				Paths:      []string{},
				Tags:       []string{},
			},
		},
		{
			name:     "empty searchIn (all categories)",
			searchIn: []string{},
			expected: ExpectedResults{
				Operations: []string{"getUsers", "createUser", "getUser"},
				Schemas:    []string{"User"},
				Parameters: []string{"userId"},
				Paths:      []string{"/users", "/users/{userId}"},
				Tags:       []string{"Users"},
				TotalCount: 8,
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			params := SearchParams{
				Alias:    "test-api",
				Pattern:  "user",
				SearchIn: tt.searchIn,
			}

			result, err := handleSearch(reg, params)
			if err != nil {
				t.Fatalf("handleSearch() failed: %v", err)
			}

			assertSearchResults(t, &result, &tt.expected)
		})
	}
}

func TestHandleSearch_InvalidSearchInCategory(t *testing.T) {
	reg := setupTestRegistry(t)

	params := SearchParams{
		Alias:    "test-api",
		Pattern:  "test",
		SearchIn: []string{"operations", "invalid-category", "foo"},
	}

	_, err := handleSearch(reg, params)
	if err == nil {
		t.Error("Expected error for invalid searchIn categories")
	}

	expectedError := "invalid searchIn categories"
	if !strings.Contains(err.Error(), expectedError) {
		t.Errorf("Expected error to contain '%s', got: %v", expectedError, err)
	}

	// Should mention the invalid categories
	if !strings.Contains(err.Error(), "invalid-category") || !strings.Contains(err.Error(), "foo") {
		t.Errorf("Expected error to mention invalid categories, got: %v", err)
	}
}
