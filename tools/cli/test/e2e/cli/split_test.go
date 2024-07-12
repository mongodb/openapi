package cli

import (
	"bytes"
	"os/exec"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestSplit(t *testing.T) {
	cliPath, err := NewBin()
	require.NoError(t, err)

	t.Run("Split valid specs", func(t *testing.T) {
		base, err := NewAtlasYAMLBaseSpecPath()
		require.NoError(t, err)

		cmd := exec.Command(cliPath,
			"merge",
			"-s",
			base,
			"-o",
			"output.yaml",
		)

		var o, e bytes.Buffer
		cmd.Stdout = &o
		cmd.Stderr = &e
		require.NoError(t, cmd.Run(), e.String())

		validVersionSpec, err := NewValidVersionedAtlasYAMLSpecPath()
		require.NoError(t, err)
		ValidateVersionedSpec(t, validVersionSpec, "output-2024-05-30.yaml")
	})
}
