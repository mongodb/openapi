package cli

import (
	"bytes"
	"os/exec"
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
			"output.yaml",
		)

		var o, e bytes.Buffer
		cmd.Stdout = &o
		cmd.Stderr = &e
		require.NoError(t, cmd.Run(), e.String())

		validVersionSpec := NewValidVersionedAtlasYAMLSpecPath(t)
		ValidateVersionedSpec(t, validVersionSpec, "output-2024-05-30.yaml")
	})
}
