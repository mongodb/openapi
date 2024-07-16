package cli

import (
	"bytes"
	"os/exec"
	"path/filepath"
	"runtime"
	"testing"

	"github.com/stretchr/testify/require"
	"github.com/tufin/oasdiff/diff"
)

var versions = []string{"2023-01-01", "2023-02-01", "2023-10-01", "2023-11-15", "2024-05-30"}

func TestSplit(t *testing.T) {
	cliPath := NewBin(t)

	t.Run("Split valid specs", func(t *testing.T) {
		base := NewAtlasYAMLBaseSpecPath(t)
		cmd := exec.Command(cliPath,
			"split",
			"-s",
			base,
			"-o",
			getOutputFolder(t)+"/output.json",
		)

		var o, e bytes.Buffer
		cmd.Stdout = &o
		cmd.Stderr = &e
		require.NoError(t, cmd.Run(), e.String())

		for _, version := range versions {
			validateFiles(t, version)
		}
	})

	t.Run("Split valid specs with env=prod", func(t *testing.T) {
		base := NewValidAtlasSpecWithExtensionsPath(t)
		cmd := exec.Command(cliPath,
			"split",
			"-s",
			base,
			"-o",
			getOutputFolder(t)+"/output.json",
			"--env",
			"prod",
		)

		var o, e bytes.Buffer
		cmd.Stdout = &o
		cmd.Stderr = &e
		require.NoError(t, cmd.Run(), e.String())

		for _, version := range versions {
			validateFiles(t, version)
		}
	})
}

func getOutputFolder(t *testing.T) string {
	t.Helper()
	_, path, _, ok := runtime.Caller(0)
	require.True(t, ok)

	dir := filepath.Dir(path)
	require.DirExists(t, dir)

	return filepath.Join(dir, "output")
}

func validateFiles(t *testing.T, version string) {
	t.Helper()
	path, err := filepath.Abs("./output/output-" + version + ".json")
	require.NoError(t, err)
	ValidateVersionedSpec(t, NewValidAtlasSpecPath(t, version), path)
}

func ValidateVersionedSpec(t *testing.T, correctSpecPath, generatedSpecPath string) {
	t.Helper()
	correctSpec := newOpenAPISpec(t, correctSpecPath)
	generatedSpec := newOpenAPISpec(t, generatedSpecPath)
	d, err := diff.Get(diff.NewConfig().WithExcludeExtensions(), correctSpec, generatedSpec)
	require.NoError(t, err)

	message := "Generated spec is not equal to the correct spec for path: " + correctSpecPath + "\n\n" +
		"oasdiff diff --max-circular-dep 15 " + correctSpecPath + " " + generatedSpecPath + " > diff.yaml"

	require.Empty(t, d.ExtensionsDiff, message)
	require.Empty(t, d.OpenAPIDiff, message)
	require.Empty(t, d.InfoDiff, message)
	// require.Empty(t, d.EndpointsDiff) TODO: add in next PR
	require.Empty(t, d.PathsDiff.Added, message)
	require.Empty(t, d.PathsDiff.Deleted, message)
	require.Empty(t, d.SecurityDiff, message)
	require.Empty(t, d.ServersDiff, message)
	require.Empty(t, d.TagsDiff, message)
	require.Empty(t, d.ExternalDocsDiff, message)
	require.Empty(t, d.ExamplesDiff, message)
	require.Empty(t, d.ComponentsDiff)

	for _, v := range d.PathsDiff.Modified {
		require.Empty(t, v.ExtensionsDiff)
		require.Empty(t, v.SummaryDiff)
		require.Empty(t, v.DescriptionDiff)
		require.Empty(t, v.ServersDiff)
		require.Empty(t, v.ParametersDiff)
		require.Empty(t, v.RefDiff)
		require.Empty(t, v.OperationsDiff.Added)
		// require.Empty(t, v.OperationsDiff.Deleted) TODO: add in next PR
		for _, op := range v.OperationsDiff.Modified {
			require.Empty(t, op.ExtensionsDiff)
			require.Empty(t, op.SummaryDiff)
			require.Empty(t, op.DescriptionDiff)
			require.Empty(t, op.ServersDiff)
			require.Empty(t, op.ParametersDiff)
			require.Empty(t, op.RequestBodyDiff)
			if op.ResponsesDiff != nil {
				require.Empty(t, op.ResponsesDiff.Deleted)
				require.Empty(t, op.ResponsesDiff.Modified)
				// require.Empty(t, op.ResponsesDiff.Added, message)  TODO: add in next PR
			}
		}
	}
}
