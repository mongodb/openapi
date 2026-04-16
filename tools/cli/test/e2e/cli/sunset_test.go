package cli

import (
	"bytes"
	"context"
	"encoding/json"
	"os"
	"os/exec"
	"testing"

	"github.com/mongodb/openapi/tools/cli/internal/cli/sunset"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestDiff_NoChanges(t *testing.T) {
	baseSpecPath := "../../data/base_spec.json"
	outputPath := "diff.json"

	cliPath := NewBin(t)
	cmd := exec.CommandContext(context.Background(), cliPath,
		"sunset",
		"diff",
		"-b",
		baseSpecPath,
		"-s",
		baseSpecPath,
		"-o",
		outputPath,
	)

	var o, e bytes.Buffer
	cmd.Stdout = &o
	cmd.Stderr = &e
	require.NoError(t, cmd.Run(), e.String())

	b, err := os.ReadFile(outputPath)
	require.NoError(t, err)
	assert.NotEmpty(t, b)
	var results []*sunset.Diff
	require.NoError(t, json.Unmarshal(b, &results))

	assert.Empty(t, results)
}

func TestDiff_WithChanges(t *testing.T) {
	baseSpecPath := "../../data/base_spec.json"
	specPath := "../../data/base_spec_with_mismatching_sunset_dates.json"
	outputPath := "diff.json"

	cliPath := NewBin(t)
	cmd := exec.CommandContext(context.Background(), cliPath,
		"sunset",
		"diff",
		"-b",
		baseSpecPath,
		"-s",
		specPath,
		"-o",
		outputPath,
	)

	var o, e bytes.Buffer
	cmd.Stdout = &o
	cmd.Stderr = &e
	require.NoError(t, cmd.Run(), e.String())

	b, err := os.ReadFile(outputPath)
	require.NoError(t, err)
	assert.NotEmpty(t, b)
	var results []*sunset.Diff
	require.NoError(t, json.Unmarshal(b, &results))

	assert.Len(t, results, 4)
	assert.Equal(t, "PATCH", results[3].Operation)
	assert.Equal(t, "/api/atlas/v2/groups/{groupId}/alerts/{alertId}", results[3].Path)
	assert.Equal(t, "2023-01-01", results[3].Version)
	assert.Equal(t, "2025-05-30", results[3].BaseSunsetDate)
	assert.Equal(t, "2025-05-31", results[3].SpecSunsetDate)
	assert.Equal(t, baseSpecPath, results[3].BaseSpec)
	assert.Equal(t, specPath, results[3].Spec)

	assert.Equal(t, "DELETE", results[0].Operation)
	assert.Equal(t, "/api/atlas/v2/groups/{groupId}/clusters/{clusterName}/globalWrites/managedNamespaces", results[0].Path)
	assert.Equal(t, "2023-01-01", results[0].Version)
	assert.Equal(t, "2025-06-01", results[0].BaseSunsetDate)
	assert.Equal(t, "2025-06-02", results[0].SpecSunsetDate)
	assert.Equal(t, baseSpecPath, results[0].BaseSpec)
	assert.Equal(t, specPath, results[0].Spec)

	assert.Equal(t, "DELETE", results[1].Operation)
	assert.Equal(t, "/api/atlas/v2/groups/{groupId}/clusters/{clusterName}/globalWrites/managedNamespaces", results[1].Path)
	assert.Equal(t, "2023-02-01", results[1].Version)
	assert.Empty(t, results[1].BaseSunsetDate)
	assert.Equal(t, "2025-06-01", results[1].SpecSunsetDate)
	assert.Equal(t, baseSpecPath, results[1].BaseSpec)
	assert.Equal(t, specPath, results[1].Spec)

	assert.Equal(t, "GET", results[2].Operation)
	assert.Equal(t, "/api/atlas/v2/groups/{groupId}/clusters/{clusterName}/search/deployment", results[2].Path)
	assert.Equal(t, "2023-01-01", results[2].Version)
	assert.Equal(t, "2026-03-01", results[2].BaseSunsetDate)
	assert.Empty(t, results[2].SpecSunsetDate)
	assert.Equal(t, baseSpecPath, results[2].BaseSpec)
	assert.Equal(t, specPath, results[2].Spec)
}
