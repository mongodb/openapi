package cli

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"testing"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/mongodb/openapi/tools/cli/internal/openapi"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func NewBin(t *testing.T) string {
	t.Helper()
	path := os.Getenv("CLI_E2E_BINARY")
	cliPath, err := filepath.Abs(path)
	require.NoError(t, err)

	if _, err := os.Stat(cliPath); err != nil {
		assert.Fail(t, fmt.Sprintf("The binary %q does not exist", cliPath))
	}
	return cliPath
}

func NewBaseSpecPath(t *testing.T) string {
	t.Helper()
	cliPath, err := filepath.Abs("../../data/base_spec.json")
	require.NoError(t, err)
	return cliPath
}

func NewAPIRegistrySpecPath(t *testing.T) string {
	t.Helper()
	cliPath, err := filepath.Abs("../../data/apiregistry_spec.json")
	require.NoError(t, err)
	return cliPath
}

func NewAuthNSpecPath(t *testing.T) string {
	t.Helper()
	cliPath, err := filepath.Abs("../../data/authn_spec.json")
	require.NoError(t, err)
	return cliPath
}
func NewDuplicatedPathAPIRegistrySpecPath(t *testing.T) string {
	t.Helper()
	cliPath, err := filepath.Abs("../../data/duplicated_path_apiregistry_spec.json")
	require.NoError(t, err)
	return cliPath
}
func NewNotIdenticalComponentPIRegistrySpecPath(t *testing.T) string {
	t.Helper()
	cliPath, err := filepath.Abs("../../data/not_identical_component_apiregistry_spec.json")
	require.NoError(t, err)
	return cliPath
}

func NewDuplicatedTagAuthNSpecPath(t *testing.T) string {
	t.Helper()
	cliPath, err := filepath.Abs("../../data/duplicated_tag_authn_spec.json")
	require.NoError(t, err)
	return cliPath
}

func NewAtlasYAMLBaseSpecPath(t *testing.T) string {
	t.Helper()
	cliPath, err := filepath.Abs("../../data/split/openapi-v2.yaml")
	require.NoError(t, err)
	return cliPath
}

func NewValidAtlas20240530YAMLSpecPath(t *testing.T) string {
	t.Helper()
	cliPath, err := filepath.Abs("../../data/split/openapi-v2-2024-05-30.yaml")
	require.NoError(t, err)
	return cliPath
}

func NewValidAtlas20231115YAMLSpecPath(t *testing.T) string {
	t.Helper()
	cliPath, err := filepath.Abs("../../data/split/openapi-v2-2023-11-15.yaml")
	require.NoError(t, err)
	return cliPath
}

func NewValidAtlas20231001YAMLSpecPath(t *testing.T) string {
	t.Helper()
	cliPath, err := filepath.Abs("../../data/split/openapi-v2-2023-10-01.yaml")
	require.NoError(t, err)
	return cliPath
}

func NewValidAtlas20230201YAMLSpecPath(t *testing.T) string {
	t.Helper()
	cliPath, err := filepath.Abs("../../data/split/openapi-v2-2023-02-01.yaml")
	require.NoError(t, err)
	return cliPath
}

func NewValidAtlas20230101YAMLSpecPath(t *testing.T) string {
	t.Helper()
	cliPath, err := filepath.Abs("../../data/split/openapi-v2-2023-01-01.yaml")
	require.NoError(t, err)
	return cliPath
}

func ValidateVersionedSpec(t *testing.T, correctSpecPath, generatedSpecPath string) {
	t.Helper()
	correctSpec := newOpenAPISpec(t, correctSpecPath)
	generatedSpec := newOpenAPISpec(t, generatedSpecPath)
	areOperationsEqual(t, correctSpec, generatedSpec)
}

func newOpenAPISpec(t *testing.T, path string) *openapi3.T {
	t.Helper()
	absPath, err := filepath.Abs(path)
	require.NoError(t, err)

	loader := openapi.NewOpenAPI3()
	specInfo, err := loader.CreateOpenAPISpecFromPath(absPath)
	require.NoError(t, err)

	return specInfo.Spec
}

func areOperationsEqual(t *testing.T, correctSpec, generatedSpec *openapi3.T) {
	t.Helper()
	generatedSpecPaths := generatedSpec.Paths.Map()

	for k, path := range correctSpec.Paths.Map() {
		log.Printf("Comparing path '%s'", k)
		if generatedPath, ok := generatedSpecPaths[k]; ok {
			arePathsEqual(t, path, generatedPath)
		} else {
			assert.Fail(t, "The path '%s' was not found in the generated", k)
		}
	}
}

func arePathsEqual(t *testing.T, correctPath, generatedPath *openapi3.PathItem) {
	t.Helper()
	if correctPath == nil && generatedPath == nil {
		return
	}

	if correctPath == nil || generatedPath == nil {
		return
	}

	assert.Equal(t,
		convertMultilineToSingleLine(correctPath.Description),
		convertMultilineToSingleLine(generatedPath.Description),
		"The descriptions of the paths mismatched")

	areHTTPMethodsEqual(t, correctPath, generatedPath)
}

func areHTTPMethodsEqual(t *testing.T, correctPath, generatedPath *openapi3.PathItem) {
	t.Helper()
	areGetsEquals(t, correctPath, generatedPath)
	arePostsEquals(t, correctPath, generatedPath)
	arePatchesEquals(t, correctPath, generatedPath)
	areDeletesEquals(t, correctPath, generatedPath)
	arePutsEquals(t, correctPath, generatedPath)
}

func areDeletesEquals(t *testing.T, correctPath, generatedPath *openapi3.PathItem) {
	t.Helper()
	log.Printf("Comparing DELETE Method")
	if correctPath.Delete == nil && generatedPath.Delete == nil {
		return
	}

	if correctPath.Delete == nil || generatedPath.Delete == nil {
		return
	}

	assert.Equal(t,
		convertMultilineToSingleLine(correctPath.Delete.Description),
		convertMultilineToSingleLine(generatedPath.Delete.Description),
		"The descriptions of the DELETE mismatched")
}

func arePatchesEquals(t *testing.T, correctPath, generatedPath *openapi3.PathItem) {
	t.Helper()
	log.Printf("Comparing PATCH Method")
	if correctPath.Patch == nil && generatedPath.Patch == nil {
		return
	}

	if correctPath.Patch == nil || generatedPath.Patch == nil {
		return
	}

	assert.Equal(t,
		convertMultilineToSingleLine(correctPath.Patch.Description),
		convertMultilineToSingleLine(generatedPath.Patch.Description),
		"The descriptions of the PATCH mismatched")
}

func arePostsEquals(t *testing.T, correctPath, generatedPath *openapi3.PathItem) {
	t.Helper()
	log.Printf("Comparing POST Method")
	if correctPath.Post == nil && generatedPath.Post == nil {
		return
	}

	if correctPath.Post == nil || generatedPath.Post == nil {
		return
	}

	assert.Equal(t,
		convertMultilineToSingleLine(correctPath.Post.Description),
		convertMultilineToSingleLine(generatedPath.Post.Description),
		"The descriptions of the POST mismatched")
}

func areGetsEquals(t *testing.T, correctPath, generatedPath *openapi3.PathItem) {
	t.Helper()
	log.Printf("Comparing GET Method")
	if correctPath.Get == nil && generatedPath.Get == nil {
		return
	}

	if correctPath.Get == nil || generatedPath.Get == nil {
		return
	}

	assert.Equal(t,
		convertMultilineToSingleLine(correctPath.Get.Description),
		convertMultilineToSingleLine(generatedPath.Get.Description),
		"The descriptions of the GET mismatched")
}

func arePutsEquals(t *testing.T, correctPath, generatedPath *openapi3.PathItem) {
	t.Helper()
	log.Printf("Comparing PUT Method")
	if correctPath.Put == nil && generatedPath.Put == nil {
		return
	}

	if correctPath.Put == nil || generatedPath.Put == nil {
		return
	}

	assert.Equal(t,
		convertMultilineToSingleLine(correctPath.Put.Description),
		convertMultilineToSingleLine(generatedPath.Put.Description),
		"The descriptions of the PUT mismatched")
}

func convertMultilineToSingleLine(s string) string {
	// Remove backslashes and newlines
	step1 := strings.ReplaceAll(s, "\\", "")
	step1 = strings.ReplaceAll(step1, "\n", "")

	// Trim leading and trailing spaces
	step2 := strings.TrimSpace(step1)

	// Replace multiple spaces with a single space
	re := regexp.MustCompile(`\s+`)
	return re.ReplaceAllString(step2, " ")
}
