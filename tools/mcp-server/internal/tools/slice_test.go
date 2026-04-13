package tools

import (
	"testing"

	"github.com/mongodb/openapi/tools/mcp-server/internal/registry"
)

func setupSliceRegistry(t *testing.T) *registry.Registry {
	t.Helper()
	reg := registry.New()
	if err := reg.Add("test-api", "/test/api.yaml", createTestSpec(), nil); err != nil {
		t.Fatalf("failed to set up registry: %v", err)
	}
	return reg
}

func getSlicedEntry(t *testing.T, reg *registry.Registry, alias string) *registry.Entry {
	t.Helper()
	entry, err := reg.GetByAlias(alias)
	if err != nil {
		t.Fatalf("GetByAlias(%q) failed: %v", alias, err)
	}
	if entry.SourceType != registry.SourceTypeVirtual {
		t.Errorf("entry.SourceType = %q, want %q", entry.SourceType, registry.SourceTypeVirtual)
	}
	if entry.FilePath != "" {
		t.Errorf("entry.FilePath = %q, want empty string", entry.FilePath)
	}
	return entry
}

func collectOperationIDs(t *testing.T, reg *registry.Registry, alias string) map[string]bool {
	t.Helper()
	entry := getSlicedEntry(t, reg, alias)
	ops := make(map[string]bool)
	for _, pathItem := range entry.Spec.Paths.Map() {
		for _, op := range pathItem.Operations() {
			if op != nil {
				ops[op.OperationID] = true
			}
		}
	}
	return ops
}

// TestHandleSlice_ByTags verifies that slicing by tag "Users" keeps only the 3
// Users operations (getUsers, createUser, getUser) and excludes the 2 Clusters ones.
func TestHandleSlice_ByTags(t *testing.T) {
	reg := setupSliceRegistry(t)

	result, err := handleSlice(reg, &SliceParams{
		SourceAlias: "test-api",
		SaveAs:      "test-api-users",
		Tags:        []string{"Users"},
	})
	if err != nil {
		t.Fatalf("handleSlice() returned unexpected error: %v", err)
	}
	if !result.Success {
		t.Fatalf("handleSlice() failed: %s", result.Error)
	}
	if result.Alias != "test-api-users" {
		t.Errorf("result.Alias = %q, want %q", result.Alias, "test-api-users")
	}

	ops := collectOperationIDs(t, reg, result.Alias)
	wantOps := map[string]bool{"getUsers": true, "createUser": true, "getUser": true}
	for opID := range wantOps {
		if !ops[opID] {
			t.Errorf("expected operation %q to be present", opID)
		}
	}
	for opID := range ops {
		if !wantOps[opID] {
			t.Errorf("unexpected operation %q in sliced spec", opID)
		}
	}
}

// TestHandleSlice_ByOperationIDs verifies that slicing by operationIds keeps
// exactly the requested operations and no others.
func TestHandleSlice_ByOperationIDs(t *testing.T) {
	reg := setupSliceRegistry(t)

	result, err := handleSlice(reg, &SliceParams{
		SourceAlias:  "test-api",
		SaveAs:       "test-api-user-ops",
		OperationIDs: []string{"getUser", "createUser"},
	})
	if err != nil {
		t.Fatalf("handleSlice() returned unexpected error: %v", err)
	}
	if !result.Success {
		t.Fatalf("handleSlice() failed: %s", result.Error)
	}

	ops := collectOperationIDs(t, reg, result.Alias)
	wantOps := map[string]bool{"getUser": true, "createUser": true}
	for opID := range wantOps {
		if !ops[opID] {
			t.Errorf("expected operation %q to be present", opID)
		}
	}
	for opID := range ops {
		if !wantOps[opID] {
			t.Errorf("unexpected operation %q in sliced spec", opID)
		}
	}
}

// TestHandleSlice_ByPaths verifies that slicing by path "/users" keeps only
// the operations under that exact path and excludes "/users/{userId}" and "/clusters".
func TestHandleSlice_ByPaths(t *testing.T) {
	reg := setupSliceRegistry(t)

	result, err := handleSlice(reg, &SliceParams{
		SourceAlias: "test-api",
		SaveAs:      "test-api-users-path",
		Paths:       []string{"/users"},
	})
	if err != nil {
		t.Fatalf("handleSlice() returned unexpected error: %v", err)
	}
	if !result.Success {
		t.Fatalf("handleSlice() failed: %s", result.Error)
	}

	ops := collectOperationIDs(t, reg, result.Alias)
	// /users has GET (getUsers) and POST (createUser); /users/{userId} and /clusters must be excluded
	wantOps := map[string]bool{"getUsers": true, "createUser": true}
	for opID := range wantOps {
		if !ops[opID] {
			t.Errorf("expected operation %q to be present", opID)
		}
	}
	for opID := range ops {
		if !wantOps[opID] {
			t.Errorf("unexpected operation %q in sliced spec", opID)
		}
	}
}

// TestHandleSlice_NoCriteria verifies that omitting all filter criteria is rejected.
func TestHandleSlice_NoCriteria(t *testing.T) {
	reg := setupSliceRegistry(t)

	result, err := handleSlice(reg, &SliceParams{
		SourceAlias: "test-api",
		SaveAs:      "test-api-sliced",
	})
	if err != nil {
		t.Fatalf("handleSlice() returned unexpected error: %v", err)
	}
	wantErr := "at least one of tags, operationIds, or paths must be specified"
	if result.Success || result.Error != wantErr {
		t.Errorf("result = {Success: %v, Error: %q}, want {false, %q}", result.Success, result.Error, wantErr)
	}
}

// TestHandleSlice_SourceAliasNotFound verifies that referencing a non-existent source alias is rejected.
func TestHandleSlice_SourceAliasNotFound(t *testing.T) {
	reg := registry.New()

	result, err := handleSlice(reg, &SliceParams{
		SourceAlias: "nonexistent",
		SaveAs:      "nonexistent-sliced",
		Tags:        []string{"Users"},
	})
	if err != nil {
		t.Fatalf("handleSlice() returned unexpected error: %v", err)
	}
	wantErr := "spec with alias 'nonexistent' not found"
	if result.Success || result.Error != wantErr {
		t.Errorf("result = {Success: %v, Error: %q}, want {false, %q}", result.Success, result.Error, wantErr)
	}
}

// TestHandleSlice_SaveAsAliasAlreadyInUse verifies that reusing an existing alias for saveAs is rejected.
func TestHandleSlice_SaveAsAliasAlreadyInUse(t *testing.T) {
	reg := setupSliceRegistry(t)

	_, err := handleSlice(reg, &SliceParams{
		SourceAlias: "test-api",
		SaveAs:      "test-api-users",
		Tags:        []string{"Users"},
	})
	if err != nil {
		t.Fatalf("first handleSlice() returned unexpected error: %v", err)
	}

	result, err := handleSlice(reg, &SliceParams{
		SourceAlias: "test-api",
		SaveAs:      "test-api-users",
		Tags:        []string{"Clusters"},
	})
	if err != nil {
		t.Fatalf("handleSlice() returned unexpected error: %v", err)
	}
	wantErr := "alias 'test-api-users' is already in use, choose a different saveAs alias"
	if result.Success || result.Error != wantErr {
		t.Errorf("result = {Success: %v, Error: %q}, want {false, %q}", result.Success, result.Error, wantErr)
	}
}

// TestHandleSlice_InvalidSaveAsAlias verifies that a saveAs alias with invalid characters is rejected.
func TestHandleSlice_InvalidSaveAsAlias(t *testing.T) {
	reg := setupSliceRegistry(t)

	result, err := handleSlice(reg, &SliceParams{
		SourceAlias: "test-api",
		SaveAs:      "Invalid Alias!",
		Tags:        []string{"Users"},
	})
	if err != nil {
		t.Fatalf("handleSlice() returned unexpected error: %v", err)
	}
	wantErr := "invalid saveAs alias 'Invalid Alias!': only lowercase letters, numbers, and hyphens allowed"
	if result.Success || result.Error != wantErr {
		t.Errorf("result = {Success: %v, Error: %q}, want {false, %q}", result.Success, result.Error, wantErr)
	}
}

// TestHandleSlice_MissingSaveAs verifies that an empty saveAs is rejected.
func TestHandleSlice_MissingSaveAs(t *testing.T) {
	reg := setupSliceRegistry(t)

	result, err := handleSlice(reg, &SliceParams{
		SourceAlias: "test-api",
		Tags:        []string{"Users"},
	})
	if err != nil {
		t.Fatalf("handleSlice() returned unexpected error: %v", err)
	}
	wantErr := "saveAs is required: provide an alias for the resulting virtual spec (e.g. 'my-api-users')"
	if result.Success || result.Error != wantErr {
		t.Errorf("result = {Success: %v, Error: %q}, want {false, %q}", result.Success, result.Error, wantErr)
	}
}
