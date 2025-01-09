package utils

import (
	"bytes"
	"fmt"
	"log"
	"os/exec"
)

// lintSpecWithSpectral runs Spectral CLI to lint the OpenAPI spec file.
func LintSpecWithSpectral(specPath, spectralRulesetPath string) error {
	// Command to run Spectral CLI
	cmd := exec.Command("spectral", "lint", "--ruleset", spectralRulesetPath, specPath, "> x.txt")

	// Capture stdout and stderr
	var out, stderr bytes.Buffer
	cmd.Stdout = &out
	cmd.Stderr = &stderr

	// Run the command
	err := cmd.Run()
	if err != nil {
		log.Printf("Spectral error: %s", stderr.String())
		return fmt.Errorf("failed to run Spectral: %v", err)
	}

	// Print Spectral output
	fmt.Printf("Spectral Linting Results:\n%s", out.String())
	return nil
}
