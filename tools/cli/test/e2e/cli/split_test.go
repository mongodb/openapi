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
	// compare w/ oasdiff
	d, err := diff.Get(diff.NewConfig(), correctSpec, generatedSpec)
	require.NoError(t, err)

	message := "Generated spec is not equal to the correct spec for path: " + correctSpecPath + "\n\n" + "git diff --no-index " + correctSpecPath + " " + generatedSpecPath + " > diff.diff"

	require.Empty(t, d.ExtensionsDiff, message)
	require.Empty(t, d.OpenAPIDiff, message)
	// require.Empty(t, d.InfoDiff, message) TODO: add in next PR
	// require.Empty(t, d.EndpointsDiff) TODO: add in next PR
	// require.Empty(t, d.PathsDiff) TODO: add in next PR
	require.Empty(t, d.SecurityDiff, message)
	require.Empty(t, d.ServersDiff, message)
	require.Empty(t, d.TagsDiff, message)
	require.Empty(t, d.ExternalDocsDiff, message)
	require.Empty(t, d.ExamplesDiff, message)
	// require.Empty(t, d.ComponentsDiff) TODO: add in next PR

	// Components diff
	for _, v := range d.PathsDiff.Modified {
		require.Empty(t, v.ExtensionsDiff)
		require.Empty(t, v.DescriptionDiff)
	}
}
