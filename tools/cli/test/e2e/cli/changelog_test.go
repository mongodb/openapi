package cli

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"

	"github.com/mongodb/openapi/tools/cli/internal/changelog"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestChangelog(t *testing.T) {
	cliPath := NewBin(t)

	t.Run("Generate Changelog with new API Version", func(t *testing.T) {
		base := NewChangelogBasePathNewAPIVersion(t)
		revision := NewChangelogRevisionPathNewAPIVersion(t)
		exemptions := NewChangelogExepmtionFilePathNewAPIVersion(t)
		commandOut := getOutputFolder(t, "changelog")

		cmd := exec.Command(cliPath,
			"changelog",
			"create",
			"-b",
			base,
			"-r",
			revision,
			"-e",
			exemptions,
			"-o",
			commandOut,
		)

		var o, e bytes.Buffer
		cmd.Stdout = &o
		cmd.Stderr = &e
		require.NoError(t, cmd.Run(), e.String())
		checkChangelogFilesAreTheSame(t, commandOut, NewChangelogOutputPathNewAPIVersion(t))
	})

	t.Run("Generate Changelog with same API Version", func(t *testing.T) {
		base := NewChangelogBasePathSameAPIVersion(t)
		revision := NewChangelogRevisionPathSameAPIVersion(t)
		exemptions := NewChangelogExemptionFilePathSameAPIVersion(t)
		commandOut := getOutputFolder(t, "changelog")

		cmd := exec.Command(cliPath,
			"changelog",
			"create",
			"-b",
			base,
			"-r",
			revision,
			"-e",
			exemptions,
			"-o",
			commandOut,
		)

		var o, e bytes.Buffer
		cmd.Stdout = &o
		cmd.Stderr = &e
		require.NoError(t, cmd.Run(), e.String())
		checkChangelogFilesAreTheSame(t, commandOut, NewChangelogOutputPathSameAPIVersion(t))
	})

	t.Run("Generate Changelog with new Preview API Version", func(t *testing.T) {
		base := newChangelogBasePathNewPreviewAPIVersion(t)
		revision := newChangelogRevisionPathNewPreviewAPIVersion(t)
		exemptions := newChangelogExemptionFilePathNewPreviewAPIVersion(t)
		commandOut := getOutputFolder(t, "changelog")

		cmd := exec.Command(cliPath,
			"changelog",
			"create",
			"-b",
			base,
			"-r",
			revision,
			"-e",
			exemptions,
			"-o",
			commandOut,
		)

		var o, e bytes.Buffer
		cmd.Stdout = &o
		cmd.Stderr = &e
		require.NoError(t, cmd.Run(), e.String())
		checkChangelogFilesAreTheSame(t, commandOut, newChangelogOutputPathNewPreviewAPIVersion(t))
	})

	t.Run("Generate Changelog with renamed API Version", func(t *testing.T) {
		base := newChangelogBasePathRenamedAPIVersion(t)
		revision := newChangelogRevisionPathRenamedAPIVersion(t)
		exemptions := newChangelogExemptionFilePathRenamedAPIVersion(t)
		commandOut := getOutputFolder(t, "changelog")

		cmd := exec.Command(cliPath,
			"changelog",
			"create",
			"-b",
			base,
			"-r",
			revision,
			"-e",
			exemptions,
			"-o",
			commandOut,
		)

		var o, e bytes.Buffer
		cmd.Stdout = &o
		cmd.Stderr = &e
		require.NoError(t, cmd.Run(), e.String())
		checkChangelogFilesAreTheSame(t, commandOut, newChangelogOutputPathRenamedAPIVersion(t))
	})

	t.Run("Generate Changelog with Upcoming API Version", func(t *testing.T) {
		base := newChangelogBasePathUpcomingAPIVersion(t)
		revision := newChangelogRevisionPathUpcomingAPIVersion(t)
		exemptions := newChangelogExemptionFilePathUpcomingAPIVersion(t)
		commandOut := getOutputFolder(t, "changelog")

		cmd := exec.Command(cliPath,
			"changelog",
			"create",
			"-b",
			base,
			"-r",
			revision,
			"-e",
			exemptions,
			"-o",
			commandOut,
		)

		var o, e bytes.Buffer
		cmd.Stdout = &o
		cmd.Stderr = &e
		require.NoError(t, cmd.Run(), e.String())
		checkChangelogFilesAreTheSame(t, commandOut, newChangelogOutputPathUpcomingAPIVersion(t))
	})
}

func checkChangelogFilesAreTheSame(t *testing.T, cmdOutput, testOutput string) {
	t.Helper()
	fmt.Printf("Checking file: %s", filepath.Join(cmdOutput, "changelog.json"))
	cmdChangelog := newEntriesFromPath(t, filepath.Join(cmdOutput, "changelog.json"))

	fmt.Printf("With test file: %s", filepath.Join(testOutput, "changelog.json"))
	testChangelog := newEntriesFromPath(t, filepath.Join(testOutput, "changelog.json"))
	areEntriesTheSame(t, cmdChangelog, testChangelog)

	log.Print("Checking file: changelog-all.json")
	cmdChangelogAll := newEntriesFromPath(t, filepath.Join(cmdOutput, "internal", "changelog-all.json"))
	testChangelogAll := newEntriesFromPath(t, filepath.Join(testOutput, "changelog-all.json"))
	areEntriesTheSame(t, cmdChangelogAll, testChangelogAll)
	compareVersions(t, cmdOutput, testOutput)
}

func compareVersions(t *testing.T, cmdOutput, testOutput string) {
	t.Helper()

	files, err := os.ReadDir(testOutput)
	require.NoError(t, err)

	// Compare number of version-diff files
	cmdFiles, err := os.ReadDir(filepath.Join(cmdOutput, "version-diff"))
	require.NoError(t, err)
	// Ignore the changelog.json and changelog-all.json files
	require.Len(t, cmdFiles, len(files)-2)

	// Loop over each file in the test output folder
	for _, fileName := range files {
		if strings.Contains(fileName.Name(), "changelog.json") {
			continue
		}

		if strings.Contains(fileName.Name(), "changelog-all.json") {
			continue
		}

		fmt.Printf("Checking file: %s", fileName.Name())
		cmdPaths := newPathsFromPath(t, filepath.Join(cmdOutput, "version-diff", fileName.Name()))
		testPaths := newPathsFromPath(t, filepath.Join(testOutput, fileName.Name()))
		arePathsTheSame(t, cmdPaths, testPaths)
	}
}

func areEntriesTheSame(t *testing.T, cmdEntries, testEntries []*changelog.Entry) {
	t.Helper()
	require.Len(t, cmdEntries, len(testEntries))
	arePathsTheSame(t, cmdEntries[0].Paths, testEntries[0].Paths)
}

func arePathsTheSame(t *testing.T, cmdPaths, testPaths []*changelog.Path) {
	t.Helper()
	require.Len(t, cmdPaths, len(testPaths))
	for i, cmdPath := range cmdPaths {
		assert.Equal(t, cmdPath.OperationID, testPaths[i].OperationID)
		assert.Equal(t, cmdPath.HTTPMethod, testPaths[i].HTTPMethod)
		assert.Equal(t, cmdPath.Tag, testPaths[i].Tag)
		assert.Equal(t, cmdPath.StabilityLevel, testPaths[i].StabilityLevel)
		assert.Equal(t, cmdPath.URI, testPaths[i].URI)
		assert.Equal(t, cmdPath.ChangeType, testPaths[i].ChangeType)
		assert.ElementsMatch(t, cmdPath.Changes, testPaths[i].Changes)

		for j, cmdVersion := range cmdPath.Versions {
			assert.Equal(t, cmdVersion.Version, testPaths[i].Versions[j].Version)
			assert.Equal(t, cmdVersion.ChangeType, testPaths[i].Versions[j].ChangeType)
			assert.Equal(t, cmdVersion.StabilityLevel, testPaths[i].Versions[j].StabilityLevel)
			assert.ElementsMatch(t, cmdVersion.Changes, testPaths[i].Versions[j].Changes)
		}
	}
}

func newEntriesFromPath(t *testing.T, path string) []*changelog.Entry {
	t.Helper()
	contents, err := os.ReadFile(path)
	require.NoError(t, err)

	var entries []*changelog.Entry
	require.NoError(t, json.Unmarshal(contents, &entries))
	return entries
}

func newPathsFromPath(t *testing.T, path string) []*changelog.Path {
	t.Helper()
	contents, err := os.ReadFile(path)
	require.NoError(t, err)

	var paths []*changelog.Path
	require.NoError(t, json.Unmarshal(contents, &paths))
	return paths
}
