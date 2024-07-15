package cli

import (
	"bytes"
	"os/exec"
	"path/filepath"
	"runtime"
	"testing"

	"github.com/stretchr/testify/require"
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
			getOutputFolder(t)+"/output.yaml",
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
	_, path, _, ok := runtime.Caller(0)
	require.True(t, ok)

	dir := filepath.Dir(path)
	require.DirExists(t, dir)

	return filepath.Join(dir, "output")
}

// func getOutputPath2() string {
// 	_, currentFilePath, _, ok := runtime.Caller(0)
// 	if !ok {
// 		panic("No caller information")
// 	}
// 	// find current file path
// 	absolutePath, err := filepath.Abs(currentFilePath)
// 	if err != nil {
// 		fmt.Println("Error getting absolute path:", err)
// 		return ""
// 	}
// 	dir := filepath.Dir(absolutePath)
// 	return filepath.Join(dir, "output")
// }

func validateFiles(t *testing.T, version string) {
	t.Helper()
	path, err := filepath.Abs("./output/output-" + version + ".yaml")
	require.NoError(t, err)
	ValidateVersionedSpec(t, NewValidAtlasSpecPath(t, version), path)
}
