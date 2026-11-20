package cli

import (
	"bytes"
	"context"
	"encoding/json"
	"os"
	"os/exec"
	"path/filepath"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func runCLI(t *testing.T, args ...string) []byte {
	t.Helper()
	cmd := exec.CommandContext(context.Background(), NewBin(t), args...) // #nosec G204
	var o, e bytes.Buffer
	cmd.Stdout = &o
	cmd.Stderr = &e
	require.NoError(t, cmd.Run(), e.String())
	return o.Bytes()
}

func loadJSON(t *testing.T, content []byte) map[string]any {
	t.Helper()
	spec := map[string]any{}
	require.NoError(t, json.Unmarshal(content, &spec))
	return spec
}

func schemaProperties(t *testing.T, spec map[string]any, schema string) map[string]any {
	t.Helper()
	components, ok := spec["components"].(map[string]any)
	require.True(t, ok)
	schemas, ok := components["schemas"].(map[string]any)
	require.True(t, ok)
	definition, ok := schemas[schema].(map[string]any)
	require.True(t, ok, "schema %q not found", schema)
	properties, ok := definition["properties"].(map[string]any)
	require.True(t, ok)
	return properties
}

// assertOpenAPI31Schema checks the OpenAPI 3.1 constructs of the test fixtures are kept as is.
func assertOpenAPI31Schema(t *testing.T, spec map[string]any, schema string) {
	t.Helper()
	assert.Equal(t, "3.1.0", spec["openapi"])

	properties := schemaProperties(t, spec, schema)

	count, ok := properties["count"].(map[string]any)
	require.True(t, ok)
	assert.Equal(t, []any{"integer", "null"}, count["type"])
	assert.InDelta(t, 0, count["exclusiveMinimum"], 0)
	assert.InDelta(t, 100, count["exclusiveMaximum"], 0)

	status, ok := properties["status"].(map[string]any)
	require.True(t, ok)
	assert.Equal(t, []any{"OPEN", "CLOSED"}, status["examples"])

	owner, ok := properties["owner"].(map[string]any)
	require.True(t, ok)
	assert.Contains(t, owner["$ref"], "#/components/schemas/")
	assert.Equal(t, "Owner, described next to the reference.", owner["description"])
	assert.Equal(t, true, owner["readOnly"])
}

func TestMergeOpenAPI31(t *testing.T) {
	output := filepath.Join(t.TempDir(), "foas.json")

	runCLI(t, "merge",
		"-b", NewBaseSpecOpenAPI31Path(t),
		"-e", NewExternalSpecOpenAPI31Path(t),
		"-o", output,
	)

	content, err := os.ReadFile(output)
	require.NoError(t, err)
	spec := loadJSON(t, content)

	paths, ok := spec["paths"].(map[string]any)
	require.True(t, ok)
	assert.Contains(t, paths, "/api/atlas/v2/groups/{groupId}/widgets")
	assert.Contains(t, paths, "/api/atlas/v2/groups/{groupId}/gadgets")
	assertOpenAPI31Schema(t, spec, "WidgetView")
	assertOpenAPI31Schema(t, spec, "GadgetView")
}

func TestSplitOpenAPI31(t *testing.T) {
	folder := t.TempDir()
	merged := filepath.Join(folder, "foas.json")

	runCLI(t, "merge",
		"-b", NewBaseSpecOpenAPI31Path(t),
		"-e", NewExternalSpecOpenAPI31Path(t),
		"-o", merged,
	)

	runCLI(t, "split",
		"-s", merged,
		"--env", "dev",
		"--format", "json",
		"-o", filepath.Join(folder, "openapi-v2.json"),
	)

	content, err := os.ReadFile(filepath.Join(folder, "openapi-v2-2023-01-01.json"))
	require.NoError(t, err)
	spec := loadJSON(t, content)
	assertOpenAPI31Schema(t, spec, "WidgetView")
	assertOpenAPI31Schema(t, spec, "GadgetView")
}
