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

package tools

import (
	"context"
	"os"
	"path/filepath"
	"testing"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/modelcontextprotocol/go-sdk/mcp"
	"github.com/mongodb/openapi/tools/cli/internal/mcp/registry"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func createTestSpec() *openapi3.T {
	return &openapi3.T{
		OpenAPI: "3.0.0",
		Info: &openapi3.Info{
			Title:   "Test API",
			Version: "1.0.0",
		},
		Paths: &openapi3.Paths{},
	}
}

func TestLoadSpecHandler_FileNotFound(t *testing.T) {
	reg := registry.New()
	handler := LoadSpecHandler(reg)

	result, _, err := handler(context.Background(), &mcp.CallToolRequest{}, LoadSpecInput{
		FilePath: "/nonexistent/path/spec.yaml",
		Alias:    "test",
	})

	require.NoError(t, err)
	assert.True(t, result.IsError)
	assert.Contains(t, result.Content[0].(*mcp.TextContent).Text, "does not exist")
}

func TestLoadSpecHandler_Success(t *testing.T) {
	// Create a temporary spec file
	tmpDir := t.TempDir()
	specPath := filepath.Join(tmpDir, "spec.yaml")
	specContent := `openapi: "3.0.0"
info:
  title: Test API
  version: "1.0.0"
paths: {}`
	err := os.WriteFile(specPath, []byte(specContent), 0644)
	require.NoError(t, err)

	reg := registry.New()
	handler := LoadSpecHandler(reg)

	result, _, err := handler(context.Background(), &mcp.CallToolRequest{}, LoadSpecInput{
		FilePath: specPath,
		Alias:    "test",
	})

	require.NoError(t, err)
	assert.False(t, result.IsError)
	assert.Contains(t, result.Content[0].(*mcp.TextContent).Text, "Loaded 'test'")
	assert.Equal(t, 1, reg.Count())
}

func TestLoadSpecHandler_AliasExists(t *testing.T) {
	tmpDir := t.TempDir()
	specPath := filepath.Join(tmpDir, "spec.yaml")
	specContent := `openapi: "3.0.0"
info:
  title: Test API
  version: "1.0.0"
paths: {}`
	err := os.WriteFile(specPath, []byte(specContent), 0644)
	require.NoError(t, err)

	reg := registry.New()
	handler := LoadSpecHandler(reg)

	// Load first time
	_, _, err = handler(context.Background(), &mcp.CallToolRequest{}, LoadSpecInput{
		FilePath: specPath,
		Alias:    "test",
	})
	require.NoError(t, err)

	// Try to load again with same alias
	result, _, err := handler(context.Background(), &mcp.CallToolRequest{}, LoadSpecInput{
		FilePath: specPath,
		Alias:    "test",
	})

	require.NoError(t, err)
	assert.True(t, result.IsError)
	assert.Contains(t, result.Content[0].(*mcp.TextContent).Text, "already exists")
}

func TestFilterSpecHandler_SpecNotFound(t *testing.T) {
	reg := registry.New()
	handler := FilterSpecHandler(reg)

	result, _, err := handler(context.Background(), &mcp.CallToolRequest{}, FilterSpecInput{
		SourceAlias: "nonexistent",
	})

	require.NoError(t, err)
	assert.True(t, result.IsError)
	assert.Contains(t, result.Content[0].(*mcp.TextContent).Text, "not found")
}

func TestUnloadSpecHandler_Success(t *testing.T) {
	reg := registry.New()
	spec := createTestSpec()
	err := reg.Load("test", spec, "/path/to/spec.yaml")
	require.NoError(t, err)

	handler := UnloadSpecHandler(reg)
	result, _, err := handler(context.Background(), &mcp.CallToolRequest{}, UnloadSpecInput{
		Alias: "test",
	})

	require.NoError(t, err)
	assert.False(t, result.IsError)
	assert.Contains(t, result.Content[0].(*mcp.TextContent).Text, "Unloaded 'test'")
	assert.Equal(t, 0, reg.Count())
}

func TestListSpecsHandler_Empty(t *testing.T) {
	reg := registry.New()
	handler := ListSpecsHandler(reg)

	result, _, err := handler(context.Background(), &mcp.CallToolRequest{}, struct{}{})

	require.NoError(t, err)
	assert.False(t, result.IsError)
	assert.Contains(t, result.Content[0].(*mcp.TextContent).Text, "No specs loaded")
}

