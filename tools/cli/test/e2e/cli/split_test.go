package cli

import (
	"bytes"
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
		{
			name:     "Split filtered specs yaml dev",
			format:   "yaml",
			specType: "filtered",
			env:      "dev",
		},
		{
			name:     "Split not-filtered specs json dev",
			format:   "json",
			specType: "not-filtered",
			env:      "dev",
		},
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

	require.Empty(t, d.ExtensionsDiff, message)
	require.Empty(t, d.OpenAPIDiff, message)
	require.Empty(t, d.InfoDiff, message)
	// require.Empty(t, d.EndpointsDiff) TODO: add in next PR
	require.Empty(t, d.PathsDiff.Added, message)
	require.Empty(t, d.PathsDiff.Deleted, message)
	require.Empty(t, d.SecurityDiff, message)
	require.Empty(t, d.ServersDiff, message)
	// require.Empty(t, d.TagsDiff, message) TODO: add in next PR
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
		require.Empty(t, v.OperationsDiff.Deleted)
		for _, op := range v.OperationsDiff.Modified {
			require.Empty(t, op.ExtensionsDiff)
			require.Empty(t, op.SummaryDiff)
			require.Empty(t, op.DescriptionDiff)
			require.Empty(t, op.ServersDiff)
			require.Empty(t, op.ParametersDiff, message)
			require.Empty(t, op.RequestBodyDiff)
			if op.ResponsesDiff != nil {
				require.Empty(t, op.ResponsesDiff.Deleted)
				require.Empty(t, op.ResponsesDiff.Modified)
				// require.Empty(t, op.ResponsesDiff.Added, message)  TODO: add in next PR
			}
		}
	}
}
