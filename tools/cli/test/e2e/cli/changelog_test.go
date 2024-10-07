package cli

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"os/exec"
	"strings"
	"testing"

	"github.com/mongodb/openapi/tools/cli/internal/changelog"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestChangelog(t *testing.T) {
	cliPath := NewBin(t)

	// Flaky Test: To be fixed in ticket CLOUDP-277324
	//t.Run("Generate Changelog with new API Version", func(t *testing.T) {
	//	base := NewChangelogBasePathNewAPIVersion(t)
	//	revision := NewChangelogRevisionPathNewAPIVersion(t)
	//	exemptions := NewChangelogExepmtionFilePathNewAPIVersion(t)
	//	commandOut := getOutputFolder(t, "changelog")
	//
	//	cmd := exec.Command(cliPath,
	//		"changelog",
	//		"create",
	//		"-b",
	//		base,
	//		"-r",
	//		revision,
	//		"-e",
	//		exemptions,
	//		"-o",
	//		commandOut,
	//	)
	//
	//	var o, e bytes.Buffer
	//	cmd.Stdout = &o
	//	cmd.Stderr = &e
	//	require.NoError(t, cmd.Run(), e.String())
	//	checkChangelogFilesAreTheSame(t, commandOut, NewChangelogOutputPathNewAPIVersion(t))
	//})

	t.Run("Generate Changelog with same API Version", func(t *testing.T) {
		base := NewChangelogBasePathSameAPIVersion(t)
		revision := NewChangelogRevisionPathSameAPIVersion(t)
		exemptions := NewChangelogExepmtionFilePathSameAPIVersion(t)
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
}

func checkChangelogFilesAreTheSame(t *testing.T, cmdOutput, testOutput string) {
	t.Helper()
	log.Print("Checking file: changelog.json")
	cmdChangelog := newEntriesFromPath(t, fmt.Sprintf("%s/%s", cmdOutput, "changelog.json"))
	testChangelog := newEntriesFromPath(t, fmt.Sprintf("%s/%s", testOutput, "changelog.json"))
	areEntriesTheSame(t, cmdChangelog, testChangelog)

	log.Print("Checking file: changelog-all.json")
	cmdChangelogAll := newEntriesFromPath(t, fmt.Sprintf("%s/%s", cmdOutput, "internal/changelog-all.json"))
	testChangelogAll := newEntriesFromPath(t, fmt.Sprintf("%s/%s", testOutput, "changelog-all.json"))
	areEntriesTheSame(t, cmdChangelogAll, testChangelogAll)
	compareVersions(t, cmdOutput, testOutput)
}

func compareVersions(t *testing.T, cmdOutput, testOutput string) {
	t.Helper()

	files, err := os.ReadDir(testOutput)
	require.NoError(t, err)

	// Loop over each file in the test output folder
	for _, fileName := range files {
		if strings.Contains(fileName.Name(), "changelog.json") {
			continue
		}

		if strings.Contains(fileName.Name(), "changelog-all.json") {
			continue
		}

		log.Printf("Checking file: %s", fileName.Name())
		cmdPaths := newPathsFromPath(t, fmt.Sprintf("%s/%s/%s", cmdOutput, "version-diff", fileName.Name()))
		testPaths := newPathsFromPath(t, fmt.Sprintf("%s/%s", testOutput, fileName.Name()))
		arePathsTheSame(t, cmdPaths, testPaths)
	}
}

func areEntriesTheSame(t *testing.T, cmdEntries, testEntries []*changelog.Entry) {
	t.Helper()
	require.Equal(t, len(cmdEntries), len(testEntries))
	arePathsTheSame(t, cmdEntries[0].Paths, testEntries[0].Paths)
}

func arePathsTheSame(t *testing.T, cmdPaths, testPaths []*changelog.Path) {
	t.Helper()
	require.Equal(t, len(cmdPaths), len(testPaths))
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
