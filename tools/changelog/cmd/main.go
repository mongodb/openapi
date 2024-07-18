package main

import (
	"flag"
	"fmt"
	"os"

	atlaschangelog "github.com/mongodb/openapi/tools/changelog/internal/atlaschangelog"
)

// go run main.go --env=production --exception-file=exception-file.yaml --dry-=run
func main() {
	env := flag.String("env", "dev", "The environment to use to generate the changelog.")
	exceptionFilePath := flag.String("exception-file", "", "Path to the exception file.")
	dryRun := flag.Bool("dry-run", false, "Provide this flag to perform a dry-run.")

	flag.Parse()

	changelog, err := atlaschangelog.NewAtlasChangelog("", *exceptionFilePath, *env)
	if err != nil {
		fmt.Printf("Error creating changelog: %v\n", err)
		os.Exit(1)
	}

	err = changelog.Generate()
	if err != nil {
		fmt.Println("Error generating changelog:", err)
		os.Exit(1)
	}

	fmt.Println("Environment:", *env)
	fmt.Println("Exceptions file:", *exceptionFilePath)
	fmt.Println("Dry-run", *dryRun)
}
