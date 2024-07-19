package cli

import (
	"bytes"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"testing"

	"github.com/stretchr/testify/require"
	"github.com/tufin/oasdiff/diff"
)

var versions = []string{"2023-01-01", "2023-02-01", "2023-10-01", "2023-11-15", "2024-05-30"}

func TestSplitVersions(t *testing.T) {
	cliPath := NewBin(t)

	t.Run("Split valid specs json dev", func(t *testing.T) {
		devFolder := "dev"
		base := NewAtlasJSONBaseSpecPath(t, devFolder)
		cmd := exec.Command(cliPath,
			"split",
			"-s",
			base,
			"-o",
			getOutputFolder(t, devFolder)+"/output.json",
		)

		var o, e bytes.Buffer
		cmd.Stdout = &o
		cmd.Stderr = &e
		require.NoError(t, cmd.Run(), e.String())

		for _, version := range versions {
			validateFiles(t, version, devFolder)
		}
	})

	t.Run("Split valid specs yaml dev", func(t *testing.T) {
		devFolder := "dev"
		base := NewAtlasYAMLBaseSpecPath(t, devFolder)
		cmd := exec.Command(cliPath,
			"split",
			"-s",
			base,
			"-o",
			getOutputFolder(t, devFolder)+"/output.yaml",
		)

		var o, e bytes.Buffer
		cmd.Stdout = &o
		cmd.Stderr = &e
		require.NoError(t, cmd.Run(), e.String())

		for _, version := range versions {
			validateFiles(t, version, devFolder)
		}
	})
}
func TestSplitEnvironments(t *testing.T) {
	cliPath := NewBin(t)

	t.Run("Split valid specs with env=dev", func(t *testing.T) {
		prodFolder := "dev"
		base := NewValidAtlasSpecWithExtensionsPath(t, prodFolder)
		cmd := exec.Command(cliPath,
			"split",
			"-s",
			base,
			"-o",
			getOutputFolder(t, prodFolder)+"/output.json",
			"--env",
			"prod",
		)

		var o, e bytes.Buffer
		cmd.Stdout = &o
		cmd.Stderr = &e
		require.NoError(t, cmd.Run(), e.String())

		for _, version := range versions {
			validateFiles(t, version, prodFolder)
		}
	})
}

func getOutputFolder(t *testing.T, subFolder string) string {
	t.Helper()
	_, path, _, ok := runtime.Caller(0)
	require.True(t, ok)

	dir := filepath.Dir(path)
	require.DirExists(t, dir)

	finalPath := filepath.Join(dir, "output", subFolder)
	require.NoError(t, os.MkdirAll(finalPath, os.ModePerm))
	require.DirExists(t, finalPath)
	return finalPath
}

func validateFiles(t *testing.T, version, folder string) {
	t.Helper()
	fileName := "output-" + version + ".json"
	path := getOutputFolder(t, folder) + "/" + fileName
	ValidateVersionedSpec(t, NewValidAtlasSpecPath(t, version, folder), path)
}

func ValidateVersionedSpec(t *testing.T, correctSpecPath, generatedSpecPath string) {
	t.Helper()
	correctSpec := newOpenAPISpec(t, correctSpecPath)
	generatedSpec := newOpenAPISpec(t, generatedSpecPath)
	d, err := diff.Get(diff.NewConfig().WithExcludeExtensions(), correctSpec, generatedSpec)
	require.NoError(t, err)

	message := "Generated spec is not equal to the correct spec for path: " + correctSpecPath + "\n\n" +
		"oasdiff diff --max-circular-dep 15 " + correctSpecPath + " " + generatedSpecPath + " > diff.yaml"

	if d.Empty() {
		return
	}

	fmt.Println(message)
	require.Empty(t, d.ExtensionsDiff)
	require.Empty(t, d.OpenAPIDiff)
	require.Empty(t, d.InfoDiff)
	// require.Empty(t, d.EndpointsDiff) TODO: add in next PR
	// require.Empty(t, d.PathsDiff)
	require.Empty(t, d.SecurityDiff)
	require.Empty(t, d.ServersDiff)
	// require.Empty(t, d.TagsDiff) TODO: add in next PR
	require.Empty(t, d.ExternalDocsDiff)
	require.Empty(t, d.ExamplesDiff)
	require.Empty(t, d.ComponentsDiff)
}
