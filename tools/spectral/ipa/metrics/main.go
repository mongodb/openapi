package main

import (
	"fmt"
	"log"
	"metrics/utils"
	"os"
	"path/filepath"
)

func main() {
	/*if err := utils.SplitOAS(); err != nil {
		log.Fatal(err)
	}*/
	affectedTags, deletedTags := utils.DetectChanges()

	tagsPath := "split_specs/tags"
	sharedComponentPath := "split_specs/shared_components.yaml" // Input: shared schema file
	mergedSpecPath := "output/merged_spec.yaml"                 // Temporary file to hold the merged spec
	spectralRulesetPath := "../ipa-spectral.yaml"               // Spectral ruleset file

	// Create output directory if it doesn't exist
	if err := os.MkdirAll("output", 0755); err != nil {
		log.Fatalf("Failed to create output directory: %v", err)
	}

	//For all the changed tag files
	for tag := range affectedTags {
		tagDir := filepath.Join(tagsPath, tag)
		tagFilePath := filepath.Join(tagDir, "spec.yaml")
		// Step 1: Merge tag and shared component files
		if err := utils.RebuildFullSpec(tagFilePath, sharedComponentPath, mergedSpecPath); err != nil {
			log.Fatalf("Failed to merge specs: %v", err)
		}
		fmt.Printf("Merged spec written to: %s\n", mergedSpecPath)

		// Step 2: Lint the merged spec with Spectral
		if err := utils.LintSpecWithSpectral(mergedSpecPath, spectralRulesetPath); err != nil {
			log.Fatalf("Failed to lint spec with Spectral: %v", err)
		}
	}

	for tag := range deletedTags {
		tagDir := filepath.Join(tagsPath, tag)
		tagFilePath := filepath.Join(tagDir, "spec-deleted.yaml")

		//check if there is a deleted component file, and if there is merge with it
		//otherwise, merge with the shared components file
		if err := utils.RebuildFullSpec(tagFilePath, sharedComponentPath, mergedSpecPath); err != nil {
			log.Fatalf("Failed to merge specs: %v", err)
		}
		fmt.Printf("Merged spec written to: %s\n", mergedSpecPath)

		//Lint the merged spec with Spectral
		if err := utils.LintSpecWithSpectral(mergedSpecPath, spectralRulesetPath); err != nil {
			log.Fatalf("Failed to lint spec with Spectral: %v", err)
		}
	}

}
