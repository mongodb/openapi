package resources

import (
	"encoding/json"
	"testing"

	"github.com/mongodb/openapi/tools/mcp-server/internal/registry"
)

// TestHandleTags_Clusters verifies Clusters operations are returned sorted by path then method.
// Operation IDs, paths, and summaries mirror the real Atlas v2 spec.
func TestHandleTags_Clusters(t *testing.T) {
	result, err := handleTags(newTestRegistry(t), makeRequest("openapi://specs/test-api/tags/Clusters"))
	if err != nil {
		t.Fatalf("handleTags() returned unexpected error: %v", err)
	}
	var body TagsResource
	if err := json.Unmarshal([]byte(result.Contents[0].Text), &body); err != nil {
		t.Fatalf("failed to unmarshal response: %v", err)
	}
	if body.Tag != "Clusters" {
		t.Errorf("tag = %q, want %q", body.Tag, "Clusters")
	}
	if body.Total != 4 {
		t.Errorf("total = %d, want 4", body.Total)
	}
	ops := body.Operations
	// Sorted by path then method:
	// 1. GET    /api/atlas/v2/clusters
	// 2. GET    /api/atlas/v2/groups/{groupId}/clusters
	// 3. POST   /api/atlas/v2/groups/{groupId}/clusters
	// 4. DELETE /api/atlas/v2/groups/{groupId}/clusters/{clusterName}
	if ops[0].OperationID != "listClusterDetails" || ops[0].Method != "GET" {
		t.Errorf("ops[0] = {%s %s}, want {GET listClusterDetails}", ops[0].Method, ops[0].OperationID)
	}
	if ops[1].OperationID != "listGroupClusters" || ops[1].Method != "GET" {
		t.Errorf("ops[1] = {%s %s}, want {GET listGroupClusters}", ops[1].Method, ops[1].OperationID)
	}
	if ops[2].OperationID != "createGroupCluster" || ops[2].Method != "POST" {
		t.Errorf("ops[2] = {%s %s}, want {POST createGroupCluster}", ops[2].Method, ops[2].OperationID)
	}
	if ops[3].OperationID != "deleteGroupCluster" || ops[3].Method != "DELETE" {
		t.Errorf("ops[3] = {%s %s}, want {DELETE deleteGroupCluster}", ops[3].Method, ops[3].OperationID)
	}
}

// TestHandleTags_OperationFields verifies all fields are populated correctly.
// Uses listClusterDetails from the real Atlas v2 spec as the reference operation.
func TestHandleTags_OperationFields(t *testing.T) {
	result, err := handleTags(newTestRegistry(t), makeRequest("openapi://specs/test-api/tags/Clusters"))
	if err != nil {
		t.Fatalf("handleTags() returned unexpected error: %v", err)
	}
	var body TagsResource
	if err := json.Unmarshal([]byte(result.Contents[0].Text), &body); err != nil {
		t.Fatalf("failed to unmarshal response: %v", err)
	}
	var op *TagOperation
	for i := range body.Operations {
		if body.Operations[i].OperationID == "listClusterDetails" {
			op = &body.Operations[i]
			break
		}
	}
	if op == nil {
		t.Fatal("operation listClusterDetails not found")
	}
	if op.Method != "GET" {
		t.Errorf("method = %q, want %q", op.Method, "GET")
	}
	if op.Path != "/api/atlas/v2/clusters" {
		t.Errorf("path = %q, want %q", op.Path, "/api/atlas/v2/clusters")
	}
	if op.Summary != "Return All Authorized Clusters in All Projects" {
		t.Errorf("summary = %q, want %q", op.Summary, "Return All Authorized Clusters in All Projects")
	}
}

// TestHandleTags_FlexClusters verifies that tag names containing spaces are resolved correctly.
// The server decodes the URI automatically so agents can use tag names as they appear in the spec.
func TestHandleTags_FlexClusters(t *testing.T) {
	result, err := handleTags(newTestRegistry(t), makeRequest("openapi://specs/test-api/tags/Flex%20Clusters"))
	if err != nil {
		t.Fatalf("handleTags() returned unexpected error: %v", err)
	}
	var body TagsResource
	if err := json.Unmarshal([]byte(result.Contents[0].Text), &body); err != nil {
		t.Fatalf("failed to unmarshal response: %v", err)
	}
	if body.Tag != "Flex Clusters" {
		t.Errorf("tag = %q, want %q", body.Tag, "Flex Clusters")
	}
	if body.Total != 2 {
		t.Errorf("total = %d, want 2", body.Total)
	}
	// Sorted: GET before POST on the same path
	if body.Operations[0].OperationID != "listGroupFlexClusters" {
		t.Errorf("ops[0].operationId = %q, want %q", body.Operations[0].OperationID, "listGroupFlexClusters")
	}
	if body.Operations[1].OperationID != "createGroupFlexCluster" {
		t.Errorf("ops[1].operationId = %q, want %q", body.Operations[1].OperationID, "createGroupFlexCluster")
	}
}

// TestHandleTags_TagNotFound verifies that a non-existent tag returns an error.
func TestHandleTags_TagNotFound(t *testing.T) {
	_, err := handleTags(newTestRegistry(t), makeRequest("openapi://specs/test-api/tags/NonExistent"))
	if err == nil {
		t.Error("expected error for non-existent tag, got nil")
	}
}

// TestHandleTags_TagCaseSensitive verifies that tag matching is case-sensitive.
func TestHandleTags_TagCaseSensitive(t *testing.T) {
	_, err := handleTags(newTestRegistry(t), makeRequest("openapi://specs/test-api/tags/clusters"))
	if err == nil {
		t.Error("expected error for wrong-case tag name, got nil")
	}
}

// TestHandleTags_AliasNotFound verifies that a non-existent alias returns an error.
func TestHandleTags_AliasNotFound(t *testing.T) {
	_, err := handleTags(registry.New(), makeRequest("openapi://specs/nonexistent/tags/Clusters"))
	if err == nil {
		t.Error("expected error for non-existent alias, got nil")
	}
}

// TestHandleTags_URIInvalid verifies that a URI missing the tag segment returns an error.
func TestHandleTags_URIInvalid(t *testing.T) {
	_, err := handleTags(registry.New(), makeRequest("openapi://specs/test-api"))
	if err == nil {
		t.Error("expected error for URI missing tag segment, got nil")
	}
}
