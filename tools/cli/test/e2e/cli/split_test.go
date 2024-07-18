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

// var versions = []string{"2023-01-01", "2023-02-01", "2023-10-01", "2023-11-15", "2024-05-30", "2025-01-01s"}
var versions = []string{"2023-01-01"}

func TestSplitVersions(t *testing.T) {
	cliPath := NewBin(t)

	t.Run("Split valid specs json env=dev", func(t *testing.T) {
		devFolder := "dev"
		base := NewAtlasJSONBaseSpecPath(t, devFolder)
		cmd := exec.Command(cliPath,
			"split",
			"-s",
			base,
			"--env",
			"dev",
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

	// t.Run("Split valid specs yaml env=dev", func(t *testing.T) {
	// 	devFolder := "dev"
	// 	base := NewAtlasYAMLBaseSpecPath(t, devFolder)
	// 	cmd := exec.Command(cliPath,
	// 		"split",
	// 		"-s",
	// 		base,
	// 		"--env",
	// 		"dev",
	// 		"-o",
	// 		getOutputFolder(t, devFolder)+"/output.yaml",
	// 	)

	// 	var o, e bytes.Buffer
	// 	cmd.Stdout = &o
	// 	cmd.Stderr = &e
	// 	require.NoError(t, cmd.Run(), e.String())

	// 	for _, version := range versions {
	// 		validateFiles(t, version, devFolder)
	// 	}
	// })

	// t.Run("Split valid specs (with all extensions) with env=dev", func(t *testing.T) {
	// 	prodFolder := "dev"
	// 	base := NewValidAtlasSpecWithExtensionsPath(t, prodFolder)
	// 	cmd := exec.Command(cliPath,
	// 		"split",
	// 		"-s",
	// 		base,
	// 		"-o",
	// 		getOutputFolder(t, prodFolder)+"/output.json",
	// 		"--env",
	// 		"dev",
	// 	)

	// 	var o, e bytes.Buffer
	// 	cmd.Stdout = &o
	// 	cmd.Stderr = &e
	// 	require.NoError(t, cmd.Run(), e.String())

	// 	for _, version := range versions {
	// 		validateFiles(t, version, prodFolder)
	// 	}
	// })
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
	d, err := diff.Get(diff.NewConfig(), correctSpec, generatedSpec)
	require.NoError(t, err)

	message := "Generated spec is not equal to the correct spec for path: " + correctSpecPath + "\n\n" +
		"oasdiff diff --max-circular-dep 15 " + correctSpecPath + " " + generatedSpecPath + " > diff.yaml"

	if d.Empty() {
		return
	}

	require.Empty(t, d.ExtensionsDiff, message)
	require.Empty(t, d.OpenAPIDiff, message)
	require.Empty(t, d.InfoDiff, message)
	require.Empty(t, d.EndpointsDiff, message)
	require.Empty(t, d.PathsDiff, message)
	require.Empty(t, d.SecurityDiff, message)
	require.Empty(t, d.ServersDiff, message)
	require.Empty(t, d.TagsDiff, message)
	require.Empty(t, d.ExternalDocsDiff, message)
	require.Empty(t, d.ExamplesDiff, message)
	require.Empty(t, d.ComponentsDiff)
<<<<<<< HEAD
	require.Empty(t, d, message)
=======

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
>>>>>>> main
}
