package cli

import (
	"bytes"
	"os"
	"os/exec"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestMerge(t *testing.T) {
	cliPath, err := NewBin()
	require.NoError(t, err)

	t.Run("Merge valid specs", func(t *testing.T) {
		base, err := NewBaseSpec()
		require.NoError(t, err)
		external, err := NewAPIRegistrySpec()
		require.NoError(t, err)

		cmd := exec.Command(cliPath,
			"merge",
			"-b",
			base,
			"-e",
			external,
		)

		var o, e bytes.Buffer
		cmd.Stdout = &o
		cmd.Stderr = &e
		require.NoError(t, cmd.Run(), e.String())

		assert.Contains(t, o.String(), "\"openapi\"")
		assert.Contains(t, e.String(), "We silently resolved the conflict with the schemas \"ApiError\" because the definition was identical") //nolint:lll // Line is over 120 characters
		assert.Contains(t, o.String(), "\"ApiError\":")
	})

	t.Run("Merge valid specs to yaml", func(t *testing.T) {
		base, err := NewBaseSpec()
		require.NoError(t, err)
		external, err := NewAPIRegistrySpec()
		require.NoError(t, err)

		cmd := exec.Command(cliPath,
			"merge",
			"-b",
			base,
			"-e",
			external,
			"-f",
			"yaml",
		)

		var o, e bytes.Buffer
		cmd.Stdout = &o
		cmd.Stderr = &e
		require.NoError(t, cmd.Run(), e.String())

		assert.Contains(t, o.String(), "\"openapi\"")
		assert.Contains(t, e.String(), "We silently resolved the conflict with the schemas \"ApiError\" because the definition was identical") //nolint:lll // Line is over 120 characters
		assert.Contains(t, o.String(), "\"ApiError\":")
	})

	t.Run("Expecting Error: Merge duplicated path with base spec", func(t *testing.T) {
		base, err := NewBaseSpec()
		require.NoError(t, err)
		apiRegistrySpec, err := NewDuplicatedPathAPIRegistrySpec()
		require.NoError(t, err)
		authnSpec, err := NewAuthNSpec()
		require.NoError(t, err)

		cmd := exec.Command(cliPath,
			"merge",
			"-b",
			base,
			"-e",
			apiRegistrySpec,
			"-e",
			authnSpec,
		)

		cmd.Env = os.Environ()
		resp, err := cmd.CombinedOutput()
		stringResponse := string(resp)
		require.Error(t, err, stringResponse)
		assert.Contains(t, stringResponse, "Error: there was a conflict with the path: \"/api/atlas/v2/groups/{groupId}/events\"") //nolint:lll // Line is over 120 characters
	})

	t.Run("Expecting Error: Merge duplicated tag", func(t *testing.T) {
		base, err := NewBaseSpec()
		require.NoError(t, err)
		apiRegistrySpec, err := NewAPIRegistrySpec()
		require.NoError(t, err)
		authnSpec, err := NewDuplicatedTagAuthNSpec()
		require.NoError(t, err)

		cmd := exec.Command(cliPath,
			"merge",
			"-b",
			base,
			"-e",
			apiRegistrySpec,
			"-e",
			authnSpec,
		)

		cmd.Env = os.Environ()
		resp, err := cmd.CombinedOutput()
		stringResponse := string(resp)
		require.Error(t, err, stringResponse)
		assert.Contains(t, stringResponse, "Error: there was a conflict with the Tag \"Events\" with the description: \"Returns information about the MongoDB Atlas Specification.\"") //nolint:lll // Line is over 120 characters
	})

	t.Run("Expecting Error: not identical component", func(t *testing.T) {
		base, err := NewBaseSpec()
		require.NoError(t, err)
		apiRegistrySpec, err := NewNotIdenticalComponentPIRegistrySpec()
		require.NoError(t, err)
		authnSpec, err := NewAuthNSpec()
		require.NoError(t, err)

		cmd := exec.Command(cliPath,
			"merge",
			"-b",
			base,
			"-e",
			apiRegistrySpec,
			"-e",
			authnSpec,
		)

		cmd.Env = os.Environ()
		resp, err := cmd.CombinedOutput()
		stringResponse := string(resp)
		require.Error(t, err, stringResponse)
		assert.Contains(t, stringResponse, "Error: there was a conflict on a Schema component: \"ApiError\"")
	})
}
