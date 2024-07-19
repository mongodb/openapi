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

var versions = []string{"2023-01-01", "2023-02-01", "2023-10-01", "2023-11-15", "2024-05-30", "2025-01-01"}

func TestSplitVersions(t *testing.T) {
	cliPath := NewBin(t)
	testCases := []struct {
		name     string
		format   string
		specType string
		env      string
	}{
		{
			name:     "Split filtered specs json dev",
			format:   "json",
			specType: "filtered",
			env:      "dev",
		},
		// {
		// 	name:     "Split filtered specs yaml dev",
		// 	format:   "yaml",
		// 	specType: "filtered",
		// 	env:      "dev",
		// },
		// {
		// 	name:     "Split not-filtered specs json dev",
		// 	format:   "json",
		// 	specType: "not-filtered",
		// 	env:      "dev",
		// },
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			folder := tc.env
			base := getInputFolder(t, tc.specType, tc.format, folder)
			cmd := exec.Command(cliPath,
				"split",
				"-s",
				base,
				"-o",
				getOutputFolder(t, folder)+"/output."+tc.format,
				"--env",
				tc.env,
			)

			var o, e bytes.Buffer
			cmd.Stdout = &o
			cmd.Stderr = &e
			require.NoError(t, cmd.Run(), e.String())

			for _, version := range versions {
				validateFiles(t, version, folder)
			}
		})
	}
}

func getInputFolder(t *testing.T, specType, format, folder string) string {
	t.Helper()
	if specType == "not-filtered" {
		cliPath, err := filepath.Abs("../../data/split/" + folder + "/openapi-mms-extensions.json")
		require.NoError(t, err)
		return cliPath
	}

	cliPath, err := filepath.Abs("../../data/split/" + folder + "/openapi-v2." + format)
	require.NoError(t, err)
	return cliPath
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
		"oasdiff diff --max-circular-dep 15 " + correctSpecPath + " " + generatedSpecPath + " > diff.yaml\n"

	if d.Empty() {
		return
	}

	fmt.Println(message)
	require.Empty(t, d.ExtensionsDiff)
	require.Empty(t, d.OpenAPIDiff)
	require.Empty(t, d.InfoDiff)
	// require.Empty(t, d.EndpointsDiff) TODO: add in next PR
	// require.Empty(t, d.PathsDiff) TODO: add in next PR
	require.Empty(t, d.SecurityDiff)
	require.Empty(t, d.ServersDiff)
	// require.Empty(t, d.TagsDiff) TODO: adds in next PR
	require.Empty(t, d.ExternalDocsDiff)
	require.Empty(t, d.ExamplesDiff)
	require.Empty(t, d.ComponentsDiff)
}
