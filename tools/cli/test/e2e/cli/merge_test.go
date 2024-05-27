package cli

import (
	"github.com/stretchr/testify/require"
	"os"
	"os/exec"
	"testing"
)

func TestMerge(t *testing.T) {
	cliPath, err := NewBin()
	require.NoError(t, err)

	t.Run("Use --help flag", func(t *testing.T) {
		cmd := exec.Command(cliPath,
			"merge",
			"--help",
		)

		cmd.Env = os.Environ()
		resp, err := cmd.CombinedOutput()
		require.NoError(t, err, string(resp))
	})
}
