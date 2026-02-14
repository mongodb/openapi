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

package resources

import (
	"context"
	"encoding/json"
	"testing"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/modelcontextprotocol/go-sdk/mcp"
	"github.com/mongodb/openapi/tools/cli/internal/mcp/registry"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func createTestSpec() *openapi3.T {
	spec := &openapi3.T{
		OpenAPI: "3.0.0",
		Info: &openapi3.Info{
			Title:       "Test API",
			Version:     "1.0.0",
			Description: "A test API",
		},
		Tags: openapi3.Tags{
			{Name: "users", Description: "User operations"},
			{Name: "orders", Description: "Order operations"},
		},
		Paths: &openapi3.Paths{},
	}
	spec.Paths.Set("/users", &openapi3.PathItem{
		Get: &openapi3.Operation{
			OperationID: "getUsers",
			Summary:     "Get all users",
			Tags:        []string{"users"},
		},
		Post: &openapi3.Operation{
			OperationID: "createUser",
			Summary:     "Create a user",
			Tags:        []string{"users"},
		},
	})
	spec.Components = &openapi3.Components{
		Schemas: openapi3.Schemas{
			"User": &openapi3.SchemaRef{
				Value: &openapi3.Schema{
					Type: &openapi3.Types{"object"},
					Properties: openapi3.Schemas{
						"id":   &openapi3.SchemaRef{Value: &openapi3.Schema{Type: &openapi3.Types{"string"}}},
						"name": &openapi3.SchemaRef{Value: &openapi3.Schema{Type: &openapi3.Types{"string"}}},
					},
				},
			},
		},
	}
	return spec
}

func TestOperationsListHandler_Success(t *testing.T) {
	reg := registry.New()
	spec := createTestSpec()
	err := reg.Load("test", spec, "/path/to/spec.yaml")
	require.NoError(t, err)

	handler := OperationsListHandler(reg)
	result, err := handler(context.Background(), &mcp.ReadResourceRequest{
		Params: &mcp.ReadResourceParams{URI: "openapi://test/operations"},
	})

	require.NoError(t, err)
	require.Len(t, result.Contents, 1)

	var operations []OperationSummary
	err = json.Unmarshal([]byte(result.Contents[0].Text), &operations)
	require.NoError(t, err)

	assert.Len(t, operations, 2)
}

func TestOperationsListHandler_NotFound(t *testing.T) {
	reg := registry.New()
	handler := OperationsListHandler(reg)

	_, err := handler(context.Background(), &mcp.ReadResourceRequest{
		Params: &mcp.ReadResourceParams{URI: "openapi://nonexistent/operations"},
	})

	assert.Error(t, err)
	assert.Contains(t, err.Error(), "not found")
}

func TestTagsListHandler_Success(t *testing.T) {
	reg := registry.New()
	spec := createTestSpec()
	err := reg.Load("test", spec, "/path/to/spec.yaml")
	require.NoError(t, err)

	handler := TagsListHandler(reg)
	result, err := handler(context.Background(), &mcp.ReadResourceRequest{
		Params: &mcp.ReadResourceParams{URI: "openapi://test/tags"},
	})

	require.NoError(t, err)
	require.Len(t, result.Contents, 1)

	var tags []TagSummary
	err = json.Unmarshal([]byte(result.Contents[0].Text), &tags)
	require.NoError(t, err)

	assert.Len(t, tags, 2)
	assert.Equal(t, "users", tags[0].Name)
	assert.Equal(t, "User operations", tags[0].Description)
}

func TestPathsListHandler_Success(t *testing.T) {
	reg := registry.New()
	spec := createTestSpec()
	err := reg.Load("test", spec, "/path/to/spec.yaml")
	require.NoError(t, err)

	handler := PathsListHandler(reg)
	result, err := handler(context.Background(), &mcp.ReadResourceRequest{
		Params: &mcp.ReadResourceParams{URI: "openapi://test/paths"},
	})

	require.NoError(t, err)
	require.Len(t, result.Contents, 1)

	var paths []PathSummary
	err = json.Unmarshal([]byte(result.Contents[0].Text), &paths)
	require.NoError(t, err)

	assert.Len(t, paths, 1)
	assert.Equal(t, "/users", paths[0].Path)
	assert.Len(t, paths[0].Methods, 2)
}

func TestSchemasListHandler_Success(t *testing.T) {
	reg := registry.New()
	spec := createTestSpec()
	err := reg.Load("test", spec, "/path/to/spec.yaml")
	require.NoError(t, err)

	handler := SchemasListHandler(reg)
	result, err := handler(context.Background(), &mcp.ReadResourceRequest{
		Params: &mcp.ReadResourceParams{URI: "openapi://test/schemas"},
	})

	require.NoError(t, err)
	require.Len(t, result.Contents, 1)

	var schemas []SchemaSummary
	err = json.Unmarshal([]byte(result.Contents[0].Text), &schemas)
	require.NoError(t, err)

	assert.Len(t, schemas, 1)
	assert.Equal(t, "User", schemas[0].Name)
}

func TestOperationDetailHandler_Success(t *testing.T) {
	reg := registry.New()
	spec := createTestSpec()
	err := reg.Load("test", spec, "/path/to/spec.yaml")
	require.NoError(t, err)

	handler := OperationDetailHandler(reg)
	result, err := handler(context.Background(), &mcp.ReadResourceRequest{
		Params: &mcp.ReadResourceParams{URI: "openapi://test/operations/getUsers"},
	})

	require.NoError(t, err)
	require.Len(t, result.Contents, 1)

	var opResult map[string]any
	err = json.Unmarshal([]byte(result.Contents[0].Text), &opResult)
	require.NoError(t, err)

	assert.Equal(t, "getUsers", opResult["operationId"])
	assert.Equal(t, "/users", opResult["path"])
	assert.Equal(t, "GET", opResult["method"])
}

func TestOperationDetailHandler_NotFound(t *testing.T) {
	reg := registry.New()
	spec := createTestSpec()
	err := reg.Load("test", spec, "/path/to/spec.yaml")
	require.NoError(t, err)

	handler := OperationDetailHandler(reg)
	_, err = handler(context.Background(), &mcp.ReadResourceRequest{
		Params: &mcp.ReadResourceParams{URI: "openapi://test/operations/nonexistent"},
	})

	assert.Error(t, err)
	assert.Contains(t, err.Error(), "not found")
}

func TestTagDetailHandler_Success(t *testing.T) {
	reg := registry.New()
	spec := createTestSpec()
	err := reg.Load("test", spec, "/path/to/spec.yaml")
	require.NoError(t, err)

	handler := TagDetailHandler(reg)
	result, err := handler(context.Background(), &mcp.ReadResourceRequest{
		Params: &mcp.ReadResourceParams{URI: "openapi://test/tags/users"},
	})

	require.NoError(t, err)
	require.Len(t, result.Contents, 1)

	var operations []OperationSummary
	err = json.Unmarshal([]byte(result.Contents[0].Text), &operations)
	require.NoError(t, err)

	assert.Len(t, operations, 2)
}

func TestSchemaDetailHandler_Success(t *testing.T) {
	reg := registry.New()
	spec := createTestSpec()
	err := reg.Load("test", spec, "/path/to/spec.yaml")
	require.NoError(t, err)

	handler := SchemaDetailHandler(reg)
	result, err := handler(context.Background(), &mcp.ReadResourceRequest{
		Params: &mcp.ReadResourceParams{URI: "openapi://test/schemas/User"},
	})

	require.NoError(t, err)
	require.Len(t, result.Contents, 1)
	assert.Contains(t, result.Contents[0].Text, "object")
}

func TestSchemaDetailHandler_NotFound(t *testing.T) {
	reg := registry.New()
	spec := createTestSpec()
	err := reg.Load("test", spec, "/path/to/spec.yaml")
	require.NoError(t, err)

	handler := SchemaDetailHandler(reg)
	_, err = handler(context.Background(), &mcp.ReadResourceRequest{
		Params: &mcp.ReadResourceParams{URI: "openapi://test/schemas/NonExistent"},
	})

	assert.Error(t, err)
	assert.Contains(t, err.Error(), "not found")
}
