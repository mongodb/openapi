package cli

import (
	"bytes"
	"os/exec"
	"path/filepath"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestSplit(t *testing.T) {
	cliPath := NewBin(t)

	t.Run("Split valid specs", func(t *testing.T) {
		base := NewAtlasYAMLBaseSpecPath(t)

		cmd := exec.Command(cliPath,
			"split",
			"-s",
			base,
			"-o",
			"./output/output.yaml",
		)

		var o, e bytes.Buffer
		cmd.Stdout = &o
		cmd.Stderr = &e
		require.NoError(t, cmd.Run(), e.String())

		versions := []string{"2023-01-01", "2023-02-01", "2023-10-01", "2023-11-15", "2024-05-30"}
		for _, version := range versions {
			validateFiles(t, version)
		}
	})
}

func validateFiles(t *testing.T, version string) {
	t.Helper()
	path, err := filepath.Abs("./output/output-" + version + ".yaml")
	require.NoError(t, err)
	ValidateVersionedSpec(t, NewValidAtlasSpecPath(t, version), path)
}
