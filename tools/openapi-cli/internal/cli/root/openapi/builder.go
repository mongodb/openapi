package openapi

import (
	"andreaangiolillo/openapi-cli/internal/cli/merge"
	"fmt"
	"github.com/spf13/cobra"
)

const (
	ToolName = "openapicli"
	Version  = "0.1"
)

// Builder conditionally adds children commands as needed.
// This is important in particular for Atlas as it dynamically sets flags for cluster creation and
// this can be slow to timeout on environments with limited internet access (Ops Manager).
func Builder(argsWithoutProg []string) *cobra.Command {
	rootCmd := &cobra.Command{
		Version: Version,
		Use:     ToolName,
		Short:   "CLI tool to validate and merge your Open API Specifications",
		Long: fmt.Sprintf(`
CLI tool to validate and merge your Open API Specifications.
`),
		Example: `  # Display the help menu for the merge command:
  openapicli merge --help
`,
		SilenceUsage: true,
	}

	rootCmd.AddCommand(
		merge.Builder(),
	)
	return rootCmd
}
