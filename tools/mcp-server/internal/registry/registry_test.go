package registry

import (
	"testing"

	"github.com/oasdiff/kin-openapi/openapi3"
)

func TestRegistry_Add_NewEntry(t *testing.T) {
	reg := New()
	spec := createTestSpec("Test API", "1.0.0")

	err := reg.Add("test-api", "/path/to/test.yaml", spec, nil)
	if err != nil {
		t.Fatalf("Add() failed for new entry: %v", err)
	}

	if reg.Count() != 1 {
		t.Errorf("Count() = %d, want 1", reg.Count())
	}

	entry, err := reg.GetByAlias("test-api")
	if err != nil {
		t.Fatalf("GetByAlias() failed: %v", err)
	}

	if entry.Alias != "test-api" {
		t.Errorf("entry.Alias = %q, want %q", entry.Alias, "test-api")
	}
	if entry.FilePath != "/path/to/test.yaml" {
		t.Errorf("entry.FilePath = %q, want %q", entry.FilePath, "/path/to/test.yaml")
	}
}

func TestRegistry_Add_CollisionDifferentFile(t *testing.T) {
	reg := New()
	spec1 := createTestSpec("API 1", "1.0.0")
	spec2 := createTestSpec("API 2", "2.0.0")

	// Add first spec with alias "my-api"
	err := reg.Add("my-api", "/path/to/file1.yaml", spec1, nil)
	if err != nil {
		t.Fatalf("First Add() failed: %v", err)
	}

	// Try to add different file with same alias - should error
	err = reg.Add("my-api", "/path/to/file2.yaml", spec2, nil)
	if err == nil {
		t.Fatal("Add() should have returned collision error for different file")
	}

	// Verify error message mentions collision
	expectedMsg := "alias 'my-api' is already in use by '/path/to/file1.yaml'"
	if err.Error() != expectedMsg {
		t.Errorf("error = %q, want %q", err.Error(), expectedMsg)
	}

	// Registry should still have only the first entry
	if reg.Count() != 1 {
		t.Errorf("Count() = %d, want 1", reg.Count())
	}
}

func TestRegistry_Add_SameFileModified(t *testing.T) {
	reg := New()
	spec1 := createTestSpec("API", "1.0.0")
	spec2 := createTestSpec("API", "2.0.0") // Different version = different checksum

	// Add original spec
	err := reg.Add("my-api", "/path/to/api.yaml", spec1, nil)
	if err != nil {
		t.Fatalf("First Add() failed: %v", err)
	}

	entry1, _ := reg.GetByAlias("my-api")
	checksum1 := entry1.Checksum

	// Re-add same file with modified content - should update
	err = reg.Add("my-api", "/path/to/api.yaml", spec2, nil)
	if err != nil {
		t.Fatalf("Second Add() should succeed (update): %v", err)
	}

	// Should still have only 1 entry
	if reg.Count() != 1 {
		t.Errorf("Count() = %d, want 1", reg.Count())
	}

	// Checksum should have changed
	entry2, _ := reg.GetByAlias("my-api")
	if entry2.Checksum == checksum1 {
		t.Error("Checksum should have changed after update")
	}

	// Version should be updated
	if entry2.Spec.Info.Version != "2.0.0" {
		t.Errorf("Spec version = %q, want %q", entry2.Spec.Info.Version, "2.0.0")
	}
}

func TestRegistry_Add_SameFileUnchanged(t *testing.T) {
	reg := New()
	spec := createTestSpec("API", "1.0.0")

	// Add spec
	err := reg.Add("my-api", "/path/to/api.yaml", spec, nil)
	if err != nil {
		t.Fatalf("First Add() failed: %v", err)
	}

	entry1, _ := reg.GetByAlias("my-api")
	loadedAt1 := entry1.LoadedAt

	// Re-add exact same spec - should be idempotent
	err = reg.Add("my-api", "/path/to/api.yaml", spec, nil)
	if err != nil {
		t.Fatalf("Second Add() should succeed (idempotent): %v", err)
	}

	entry2, _ := reg.GetByAlias("my-api")

	// LoadedAt should NOT change (idempotent operation)
	if !entry2.LoadedAt.Equal(loadedAt1) {
		t.Error("LoadedAt should not change for idempotent operation")
	}
}

func TestRegistry_Remove(t *testing.T) {
	reg := New()
	spec := createTestSpec("Test API", "1.0.0")

	err := reg.Add("test-api", "/path/to/test.yaml", spec, nil)
	if err != nil {
		t.Fatalf("Failed to add spec: %v", err)
	}

	err = reg.Remove("test-api")
	if err != nil {
		t.Fatalf("Remove() failed: %v", err)
	}

	if reg.Count() != 0 {
		t.Errorf("Count() = %d, want 0", reg.Count())
	}

	_, err = reg.GetByAlias("test-api")
	if err == nil {
		t.Error("GetByAlias() should fail after removal")
	}
}

// Helper function to create a test spec.
func createTestSpec(title, version string) *openapi3.T {
	return &openapi3.T{
		OpenAPI: "3.0.0",
		Info: &openapi3.Info{
			Title:   title,
			Version: version,
		},
		Paths: &openapi3.Paths{},
	}
}

func TestRegistry_Add_VirtualSpec(t *testing.T) {
	reg := New()
	spec := createTestSpec("Virtual API", "1.0.0")

	// Add virtual spec (empty file path)
	err := reg.Add("virtual-api", "", spec, map[string]string{"source": "filter"})
	if err != nil {
		t.Fatalf("Add() failed for virtual spec: %v", err)
	}

	entry, err := reg.GetByAlias("virtual-api")
	if err != nil {
		t.Fatalf("GetByAlias() failed: %v", err)
	}

	if entry.SourceType != SourceTypeVirtual {
		t.Errorf("entry.SourceType = %q, want %q", entry.SourceType, SourceTypeVirtual)
	}
	if entry.FilePath != "" {
		t.Errorf("entry.FilePath = %q, want empty string", entry.FilePath)
	}
}

func TestRegistry_Add_VirtualSpecUpdate(t *testing.T) {
	reg := New()
	spec1 := createTestSpec("API", "1.0.0")
	spec2 := createTestSpec("API", "2.0.0")

	// Add virtual spec
	err := reg.Add("my-virtual", "", spec1, nil)
	if err != nil {
		t.Fatalf("First Add() failed: %v", err)
	}

	// Update with different spec (different checksum)
	err = reg.Add("my-virtual", "", spec2, nil)
	if err != nil {
		t.Fatalf("Second Add() should succeed (update): %v", err)
	}

	entry, _ := reg.GetByAlias("my-virtual")
	if entry.Spec.Info.Version != "2.0.0" {
		t.Errorf("Spec version = %q, want %q", entry.Spec.Info.Version, "2.0.0")
	}
}

func TestRegistry_Add_CollisionFileVsVirtual(t *testing.T) {
	reg := New()
	spec1 := createTestSpec("API 1", "1.0.0")
	spec2 := createTestSpec("API 2", "2.0.0")

	// Add file-based spec
	err := reg.Add("my-api", "/path/to/file.yaml", spec1, nil)
	if err != nil {
		t.Fatalf("File-based Add() failed: %v", err)
	}

	// Try to add virtual spec with same alias - should error
	err = reg.Add("my-api", "", spec2, nil)
	if err == nil {
		t.Fatal("Add() should return collision error for file vs virtual")
	}

	// Error message should mention type conflict
	expectedMsg := "alias 'my-api' is already in use by a file spec"
	if err.Error() != expectedMsg {
		t.Errorf("error = %q, want %q", err.Error(), expectedMsg)
	}
}

func TestRegistry_Add_CollisionVirtualVsFile(t *testing.T) {
	reg := New()
	spec1 := createTestSpec("API 1", "1.0.0")
	spec2 := createTestSpec("API 2", "2.0.0")

	// Add virtual spec
	err := reg.Add("my-api", "", spec1, nil)
	if err != nil {
		t.Fatalf("Virtual Add() failed: %v", err)
	}

	// Try to add file-based spec with same alias - should error
	err = reg.Add("my-api", "/path/to/file.yaml", spec2, nil)
	if err == nil {
		t.Fatal("Add() should return collision error for virtual vs file")
	}

	expectedMsg := "alias 'my-api' is already in use by a virtual spec"
	if err.Error() != expectedMsg {
		t.Errorf("error = %q, want %q", err.Error(), expectedMsg)
	}
}
