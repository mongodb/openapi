package main

import (
	"fmt"
	"gopkg.in/yaml.v3"
	"log"
	"os"
	"os/exec"
	"path/filepath"

	"github.com/mongodb/openapi/tools/codegen/codespec"
	"github.com/mongodb/openapi/tools/codegen/openapi"
)

const (
	atlasAdminAPISpecURL = "https://raw.githubusercontent.com/mongodb/atlas-sdk-go/main/openapi/atlas-api-transformed.yaml"
	configPath           = "config.yml"
	specFilePath         = "open-api-spec.yml"
)

func main() {
	resourceName := getOsArg()

	if err := openapi.DownloadOpenAPISpec(atlasAdminAPISpecURL, specFilePath); err != nil {
		log.Fatalf("an error occurred when downloading Atlas Admin API spec: %v", err)
	}

	model, err := codespec.ToCodeSpecModel(specFilePath, configPath, resourceName)
	if err != nil {
		log.Fatalf("an error occurred while generating codespec.Model: %v", err)
	}

	file, err := yaml.Marshal(model)
	if err != nil {
		log.Fatalf("an error occurred while marshalling model: %v", err)
	}
	err = os.WriteFile("codegen.yaml", file, 0o600)
}

func getOsArg() *string {
	if len(os.Args) < 2 {
		return nil
	}
	return &os.Args[1]
}

func writeToFile(fileName, content string) error {
	// read/write/execute for owner, and read/execute for group and others
	const filePermission = 0o755

	// Create directories if they don't exist
	dir := filepath.Dir(fileName)
	dirPermission := os.FileMode(filePermission)
	if err := os.MkdirAll(dir, dirPermission); err != nil {
		return fmt.Errorf("failed to create directory %s: %w", dir, err)
	}

	// Write content to file (will override content if file exists)
	if err := os.WriteFile(fileName, []byte(content), filePermission); err != nil {
		return fmt.Errorf("failed to write to file %s: %w", fileName, err)
	}
	return nil
}

// formatGoFile runs goimports and fieldalignment on the specified Go file
func formatGoFile(filePath string) {
	goimportsCmd := exec.Command("goimports", "-w", filePath)
	if output, err := goimportsCmd.CombinedOutput(); err != nil {
		log.Printf("warning: goimports failed for %s: %v\nOutput: %s", filePath, err, output)
	}

	fieldalignmentCmd := exec.Command("fieldalignment", "-fix", filePath)
	if output, err := fieldalignmentCmd.CombinedOutput(); err != nil {
		log.Printf("warning: fieldalignment failed for %s: %v\nOutput: %s", filePath, err, output)
	}
}
