package resources

import (
	"encoding/json"
	"testing"

	"github.com/mongodb/openapi/tools/mcp-server/internal/registry"
)

// TestHandleAlias_Overview verifies that the spec overview contains title, stats, and source info.
func TestHandleAlias_Overview(t *testing.T) {
	reg := newTestRegistry(t)

	result, err := handleAlias(reg, makeRequest("openapi://specs/test-api"))
	if err != nil {
		t.Fatalf("handleAlias() returned unexpected error: %v", err)
	}
	var body SpecOverview
	if err := json.Unmarshal([]byte(result.Contents[0].Text), &body); err != nil {
		t.Fatalf("failed to unmarshal response: %v", err)
	}
	if body.Alias != "test-api" {
		t.Errorf("alias = %q, want %q", body.Alias, "test-api")
	}
	if body.Title != "Test API" {
		t.Errorf("title = %q, want %q", body.Title, "Test API")
	}
	if body.SourceType != registry.SourceTypeFile {
		t.Errorf("sourceType = %q, want %q", body.SourceType, registry.SourceTypeFile)
	}
	if body.Stats.Paths != 4 {
		t.Errorf("stats.paths = %d, want 4", body.Stats.Paths)
	}
	if body.Stats.Operations != 5 {
		t.Errorf("stats.operations = %d, want 5", body.Stats.Operations)
	}
	if body.Stats.Tags != 2 {
		t.Errorf("stats.tags = %d, want 2", body.Stats.Tags)
	}
	if body.Stats.Schemas != 2 {
		t.Errorf("stats.schemas = %d, want 2", body.Stats.Schemas)
	}
	if body.LatestStableVersion != "2025-01-01" {
		t.Errorf("latestStableVersion = %q, want %q", body.LatestStableVersion, "2025-01-01")
	}
	if len(body.AvailableVersions) != 2 {
		t.Errorf("availableVersions = %v, want [2024-01-01 2025-01-01]", body.AvailableVersions)
	}
	if !body.HasPreview {
		t.Error("hasPreview = false, want true")
	}
	if !body.HasUpcoming {
		t.Error("hasUpcoming = false, want true")
	}
}

// TestHandleAlias_NotFound verifies that reading a non-existent alias returns an error.
func TestHandleAlias_NotFound(t *testing.T) {
	_, err := handleAlias(registry.New(), makeRequest("openapi://specs/nonexistent"))
	if err == nil {
		t.Error("expected error for non-existent alias, got nil")
	}
}

// TestHandleAlias_URIMissingAlias verifies that a URI without an alias segment returns an error.
func TestHandleAlias_URIMissingAlias(t *testing.T) {
	_, err := handleAlias(registry.New(), makeRequest("not-a-valid-uri"))
	if err == nil {
		t.Error("expected error for URI with no alias, got nil")
	}
}
