package resources

import (
	"encoding/json"
	"testing"

	"github.com/mongodb/openapi/tools/mcp-server/internal/registry"
	"github.com/oasdiff/kin-openapi/openapi3"
)

// TestHandleSpecs_EmptyRegistry verifies that an empty registry returns an empty list.
func TestHandleSpecs_EmptyRegistry(t *testing.T) {
	result, err := handleSpecs(registry.New(), makeRequest("openapi://specs"))
	if err != nil {
		t.Fatalf("handleSpecs() returned unexpected error: %v", err)
	}
	var body SpecsResource
	if err := json.Unmarshal([]byte(result.Contents[0].Text), &body); err != nil {
		t.Fatalf("failed to unmarshal response: %v", err)
	}
	if body.Total != 0 || len(body.Specs) != 0 {
		t.Errorf("expected empty specs list, got total=%d", body.Total)
	}
}

// TestHandleSpecs_WithEntries verifies that loaded specs are returned with alias, sourceType, and filePath.
func TestHandleSpecs_WithEntries(t *testing.T) {
	reg := newTestRegistry(t)

	result, err := handleSpecs(reg, makeRequest("openapi://specs"))
	if err != nil {
		t.Fatalf("handleSpecs() returned unexpected error: %v", err)
	}
	var body SpecsResource
	if err := json.Unmarshal([]byte(result.Contents[0].Text), &body); err != nil {
		t.Fatalf("failed to unmarshal response: %v", err)
	}
	if body.Total != 1 {
		t.Fatalf("expected total=1, got %d", body.Total)
	}
	s := body.Specs[0]
	if s.Alias != "test-api" {
		t.Errorf("alias = %q, want %q", s.Alias, "test-api")
	}
	if s.SourceType != registry.SourceTypeFile {
		t.Errorf("sourceType = %q, want %q", s.SourceType, registry.SourceTypeFile)
	}
	if s.FilePath != "/test/api.yaml" {
		t.Errorf("filePath = %q, want %q", s.FilePath, "/test/api.yaml")
	}
}

// TestHandleSpecs_VirtualSpecHasNoFilePath verifies that virtual specs omit filePath.
func TestHandleSpecs_VirtualSpecHasNoFilePath(t *testing.T) {
	reg := registry.New()
	if err := reg.Add("virtual-api", "", &openapi3.T{Info: &openapi3.Info{Title: "Virtual"}}, nil); err != nil {
		t.Fatalf("failed to add virtual spec: %v", err)
	}
	result, err := handleSpecs(reg, makeRequest("openapi://specs"))
	if err != nil {
		t.Fatalf("handleSpecs() returned unexpected error: %v", err)
	}
	var body SpecsResource
	if err := json.Unmarshal([]byte(result.Contents[0].Text), &body); err != nil {
		t.Fatalf("failed to unmarshal response: %v", err)
	}
	if body.Specs[0].FilePath != "" {
		t.Errorf("expected empty filePath for virtual spec, got %q", body.Specs[0].FilePath)
	}
	if body.Specs[0].SourceType != registry.SourceTypeVirtual {
		t.Errorf("sourceType = %q, want %q", body.Specs[0].SourceType, registry.SourceTypeVirtual)
	}
}
