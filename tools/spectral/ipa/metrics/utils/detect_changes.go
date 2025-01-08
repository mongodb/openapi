package utils

import (
	"fmt"
	"os/exec"
	"path/filepath"
	"strings"
)

func DetectChanges() {
	// Detect changes using `git diff`
	cmd := exec.Command("git", "diff", "--name-only", "HEAD~1", "openapi-foas.yaml")
	output, err := cmd.Output()
	if err != nil {
		fmt.Printf("Error running git diff: %v\n", err)
		return
	}

	changedFiles := strings.Split(strings.TrimSpace(string(output)), "\n")
	fmt.Println("Changed files:", changedFiles)

	// Map changes to split files
	splitDir := "./split_specs/tags"
	changedTags := mapChangesToTags(changedFiles, splitDir)
	fmt.Println("Tags to validate:", changedTags)
}

func mapChangesToTags(changedFiles []string, splitDir string) []string {
	tagsToValidate := []string{}

	for _, file := range changedFiles {
		tagFile := filepath.Join(splitDir, filepath.Base(file))
		if fileExists(tagFile) {
			tagsToValidate = append(tagsToValidate, tagFile)
		}
	}

	return tagsToValidate
}

func fileExists(filePath string) bool {
	_, err := exec.LookPath(filePath)
	return err == nil
}
