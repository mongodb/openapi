package cli

import (
	"fmt"
	"os"
	"path/filepath"
)

func NewBin() (string, error) {
	path := os.Getenv("CLI_E2E_BINARY")
	cliPath, err := filepath.Abs(path)
	if err != nil {
		return "", fmt.Errorf("%w: invalid bin path %q", err, path)
	}

	if _, err := os.Stat(cliPath); err != nil {
		return "", fmt.Errorf("%w: invalid bin %q", err, path)
	}
	return cliPath, nil
}
