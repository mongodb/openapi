package cli

import (
	"bytes"
	"os"
	"os/exec"
	"path/filepath"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestParseCommand(t *testing.T) {
	cliPath := NewBin(t) // Adjust this function to point to your CLI binary
	testCases := []struct {
		name           string
		exemptionsFile string
		expectedOutput string
		expectError    bool
	}{
		{
			name:           "Valid exemptions file",
			exemptionsFile: "valid_exemptions.yaml",
			expectedOutput: "exemptions.txt",
			expectError:    false,
		},
		{
			name:           "Invalid exemptions file path",
			exemptionsFile: "invalid_exemptions.yaml",
			expectedOutput: "",
			expectError:    true,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			exemptionsFilePath, err := filepath.Abs("../../data/exemptions/" + tc.exemptionsFile)
			require.NoError(t, err)
			outputFilePath, err := filepath.Abs("../../data/exemptions/" + tc.expectedOutput)
			require.NoError(t, err)

			cmd := exec.Command(cliPath,
				"breaking-changes", "exemptions", "parse",
				"-e", exemptionsFilePath,
				"-o", outputFilePath,
			)

			var expectedOutput []byte
			if !tc.expectError {
				require.FileExists(t, outputFilePath)
				expectedOutput, err = os.ReadFile(outputFilePath)
				require.NoError(t, err)
			}
			var o, e bytes.Buffer
			cmd.Stdout = &o
			cmd.Stderr = &e
			err = cmd.Run()

			if tc.expectError {
				require.Error(t, err, e.String())
			} else {
				require.NoError(t, err, e.String())
				require.FileExists(t, outputFilePath)

				require.NoError(t, err)
				actualOutput, err := os.ReadFile(outputFilePath)
				require.NoError(t, err)
				require.Equal(t, string(expectedOutput), string(actualOutput))
			}
		})
	}
}
