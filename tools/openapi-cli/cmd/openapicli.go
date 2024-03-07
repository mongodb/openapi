package main

import (
	"andreaangiolillo/openapi-cli/internal/cli/root/openapi"
	"context"
	"os"
)

// Execute adds all child commands to the root command and sets flags appropriately.
// This is called by main.main(). It only needs to happen once to the rootCmd.
func Execute(ctx context.Context) {
	rootCmd := openapi.Builder(os.Args[1:])
	if err := rootCmd.ExecuteContext(ctx); err != nil {
		os.Exit(1)
	}
}

func main() {
	Execute(context.Background())
}
