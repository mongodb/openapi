package cli

import (
	"bytes"
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"slices"
	"strings"
	"testing"
	"time"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/mongodb/openapi/tools/cli/internal/apiversion"
	"github.com/stretchr/testify/require"
	"github.com/tufin/oasdiff/diff"
)

var skipVersions = []string{}

func TestSplitVersionsFilteredOASes(t *testing.T) {
	cliPath := NewBin(t)
	testCases := []struct {
		name     string
		format   string
		specType string
		env      string
	}{
		{
			name:     "Split filtered specs json dev",
			format:   "json",
			specType: "filtered",
			env:      "dev",
		},
		{
			name:     "Split filtered specs yaml dev",
			format:   "yaml",
			specType: "filtered",
			env:      "dev",
		},
		{
			name:     "Split not-filtered specs json dev",
			format:   "json",
			specType: "not-filtered",
			env:      "dev",
		},
		{
			name:     "Split not-filtered specs json prod",
			format:   "json",
			specType: "not-filtered",
			env:      "prod",
		},
		{
			name:     "Split not-filtered specs json prod",
			format:   "json",
			specType: "filtered",
			env:      "prod",
		},
		{
			name:     "Split not-filtered specs json prod yaml",
			format:   "yaml",
			specType: "filtered",
			env:      "prod",
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			folder := tc.env
			base := getInputPath(t, tc.specType, tc.format, folder)
			outputPath := getOutputFolder(t, folder) + "/" + tc.specType + "-" + folder + "-" + "output." + tc.format
			cmd := exec.Command(cliPath,
				"split",
				"-s",
				base,
				"-o",
				outputPath,
				"--env",
				tc.env,
			)

			var o, e bytes.Buffer
			cmd.Stdout = &o
			cmd.Stderr = &e
			require.NoError(t, cmd.Run(), e.String())

			versions := getVersions(t, cliPath, base, folder)
			for _, version := range versions {
				if slices.Contains(skipVersions, version) {
					continue
				}
				if tc.env == "prod" && !versionInFuture(t, version) {
					continue
				}
				fmt.Printf("Validating version: %s\n", version)
				noExtensionOutputPath := strings.Replace(outputPath, "."+tc.format, "", 1)
				versionedOutputPath := noExtensionOutputPath + "-" + version + "." + tc.format
				ValidateVersionedSpec(t, NewValidAtlasSpecPath(t, version, folder), versionedOutputPath)
			}
		})
	}
}

func versionInFuture(t *testing.T, version string) bool {
	t.Helper()
	v, err := apiversion.New(apiversion.WithVersion(version))
	require.NoError(t, err)
	return v.Date().After(time.Now())
}

func TestSplitVersionsForOASWithExternalReferences(t *testing.T) {
	folder := "dev"
	cliPath := NewBin(t)
	base, err := filepath.Abs("../../data/split/" + folder + "/openapi-api-registry.json")
	require.NoError(t, err)
	copyMMSFileToOutput(t, folder)

	cmd := exec.Command(cliPath,
		"split",
		"-s",
		base,
		"-o",
		getOutputFolder(t, folder)+"/api-registry-output.json",
		"--env",
		folder,
	)
	var o, e bytes.Buffer
	cmd.Stdout = &o
	cmd.Stderr = &e
	require.NoError(t, cmd.Run(), e.String())

	versions := getVersions(t, cliPath, base, folder)
	fmt.Printf("Versions: %v\n", versions)
	for _, version := range versions {
		if folder == "prod" && version == "2025-01-01" {
			continue
		}

		// validate the file exists
		fileName := "api-registry-output-" + version + ".json"
		path := getOutputFolder(t, folder) + "/" + fileName
		require.FileExists(t, path)
		// validate the file is a valid openapi spec
		loader := openapi3.NewLoader()
		loader.IsExternalRefsAllowed = true
		oas, err := loader.LoadFromFile(path)
		require.NoError(t, err)
		require.NotNil(t, oas)
		require.NoError(t, oas.Validate(loader.Context))
	}
}

func copyMMSFileToOutput(t *testing.T, folder string) {
	t.Helper()
	// copy mms file to output folder because the split command will not copy it and it
	// is needed for external references
	srcPath := "../../data/split/" + folder + "/openapi-mms.json"
	destPath := getOutputFolder(t, folder) + "/openapi-mms.json"
	cpCmd := exec.Command(
		"cp",
		srcPath,
		destPath,
	)
	var o, e bytes.Buffer
	cpCmd.Stdout = &o
	cpCmd.Stderr = &e
	require.NoError(t, cpCmd.Run(), e.String())
}

func getVersions(t *testing.T, cliPath, base, folder string) []string {
	t.Helper()
	cmd := exec.Command(cliPath,
		"versions",
		"-s",
		base,
		"--env",
		folder,
	)

	var o, e bytes.Buffer
	cmd.Stdout = &o
	cmd.Stderr = &e
	require.NoError(t, cmd.Run(), e.String())

	// load json output in a string slice
	versions := []string{}
	require.NoError(t, json.Unmarshal(o.Bytes(), &versions))
	return versions
}

func getInputPath(t *testing.T, specType, format, folder string) string {
	t.Helper()
	if specType == "not-filtered" {
		cliPath, err := filepath.Abs("../../data/split/" + folder + "/openapi-mms.json")
		require.NoError(t, err)
		return cliPath
	}

	cliPath, err := filepath.Abs("../../data/split/" + folder + "/openapi-v2." + format)
	require.NoError(t, err)
	return cliPath
}

func getOutputFolder(t *testing.T, subFolder string) string {
	t.Helper()
	_, path, _, ok := runtime.Caller(0)
	require.True(t, ok)

	dir := filepath.Dir(path)
	require.DirExists(t, dir)

	finalPath := filepath.Join(dir, "output", subFolder)
	require.NoError(t, os.MkdirAll(finalPath, os.ModePerm))
	require.DirExists(t, finalPath)
	return finalPath
}

func ValidateVersionedSpec(t *testing.T, correctSpecPath, generatedSpecPath string) {
	t.Helper()
	correctSpec := newOpenAPISpec(t, correctSpecPath)
	generatedSpec := newOpenAPISpec(t, generatedSpecPath)
	examples := []string{"examples"}
	d, err := diff.Get(diff.NewConfig().WithExcludeElements(examples), correctSpec, generatedSpec)
	require.NoError(t, err)

	message := "Generated spec is not equal to the correct spec for path: " + correctSpecPath + "\n\n" +
		"oasdiff diff --max-circular-dep 15 " + correctSpecPath + " " + generatedSpecPath + " > diff.yaml\n"

	if d.Empty() {
		return
	}

	logOasdiff(t, correctSpecPath, generatedSpecPath)
	require.Empty(t, d.ExtensionsDiff, message)
	require.Empty(t, d.OpenAPIDiff, message)
	require.Empty(t, d.InfoDiff, message)
	require.Empty(t, d.EndpointsDiff, message)
	require.Empty(t, d.PathsDiff, message)
	require.Empty(t, d.SecurityDiff, message)
	require.Empty(t, d.ServersDiff, message)
	// require.Empty(t, d.TagsDiff, message) TODO: adds in next PR
	require.Empty(t, d.ExternalDocsDiff, message)
	require.Empty(t, d.ExamplesDiff, message)
	require.Empty(t, d.ComponentsDiff, message)
}

func logOasdiff(t *testing.T, correctSpecPath, generatedSpecPath string) {
	t.Helper()
	_, err := exec.LookPath("oasdiff")
	if err != nil {
		t.Log("oasdiff not found in PATH, skipping diff")
		return
	}
	t.Log("Running oasdiff diff and comparing " + correctSpecPath + " with " + generatedSpecPath)
	cmd := exec.Command("oasdiff", "diff", "--max-circular-dep", "15", "--exclude-elements", "examples", correctSpecPath, generatedSpecPath)
	var o, e bytes.Buffer
	cmd.Stdout = &o
	cmd.Stderr = &e
	require.NoError(t, cmd.Run(), e.String())
	fmt.Println(o.String())
}
