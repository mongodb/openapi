package cli

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
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
	cliPath, err := filepath.Abs("../../data/split/tools/openapi-v2.yaml")
	require.NoError(t, err)
	return cliPath
}

func NewValidVersionedAtlasYAMLSpecPath(t *testing.T) string {
	t.Helper()
	cliPath, err := filepath.Abs("../../data/split/tools/openapi-v2-2024-05-30.yaml")
	require.NoError(t, err)
	return cliPath
}

func ValidateVersionedSpec(t *testing.T, correctSpecPath, generatedSpecPath string) {
	t.Helper()
	correctSpec := newOpenAPISpec(t, correctSpecPath)
	generatedSpec := newOpenAPISpec(t, generatedSpecPath)

	assert.True(t, areOperationsEqual(t, correctSpec, generatedSpec))
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

func areOperationsEqual(t *testing.T, correctSpec, generatedSpec *openapi3.T) bool {
	t.Helper()
	generatedSpecPaths := generatedSpec.Paths.Map()

	for k, path := range correctSpec.Paths.Map() {
		log.Printf("Comparing path '%s'", k)
		if generatedPath, ok := generatedSpecPaths[k]; !ok || !arePathsEqual(t, path, generatedPath) {
			return false
		}
	}

	return false
}

func arePathsEqual(t *testing.T, correctPath, generatedPath *openapi3.PathItem) bool {
	t.Helper()
	if correctPath == nil && generatedPath == nil {
		return true
	}

	if correctPath == nil || generatedPath == nil {
		return false
	}

	if correctPath.Description != generatedPath.Description {
		log.Printf("The descriptions of the path mismatched. Wanted '%s', Got: '%s;", correctPath.Description, generatedPath.Description)
		return false
	}

	return areHTTPMethodsEqual(t, correctPath, generatedPath)
}

func areHTTPMethodsEqual(t *testing.T, correctPath, generatedPath *openapi3.PathItem) bool {
	t.Helper()
	return areGetsEquals(t, correctPath, generatedPath) &&
		arePostsEquals(t, correctPath, generatedPath) &&
		arePatchesEquals(t, correctPath, generatedPath) &&
		areDeletesEquals(t, correctPath, generatedPath)
}

func areDeletesEquals(t *testing.T, correctPath, generatedPath *openapi3.PathItem) bool {
	t.Helper()
	if correctPath.Delete == nil && generatedPath.Delete == nil {
		return true
	}

	if correctPath.Delete == nil || generatedPath.Delete == nil {
		return false
	}

	assert.Equal(t, correctPath.Delete.Description, generatedPath.Delete.Description, "The descriptions of the DELETE mismatched")
	return true
}

func arePatchesEquals(t *testing.T, correctPath, generatedPath *openapi3.PathItem) bool {
	t.Helper()
	if correctPath.Patch == nil && generatedPath.Patch == nil {
		return true
	}

	if correctPath.Patch == nil || generatedPath.Patch == nil {
		return false
	}

	assert.Equal(t, correctPath.Patch.Description, generatedPath.Patch.Description, "The descriptions of the PATCH mismatched")
	return true
}

func arePostsEquals(t *testing.T, correctPath, generatedPath *openapi3.PathItem) bool {
	t.Helper()
	if correctPath.Post == nil && generatedPath.Post == nil {
		return true
	}

	if correctPath.Post == nil || generatedPath.Post == nil {
		return false
	}

	assert.Equal(t, correctPath.Post.Description, generatedPath.Post.Description, "The descriptions of the POST mismatched")
	return true
}

func areGetsEquals(t *testing.T, correctPath, generatedPath *openapi3.PathItem) bool {
	t.Helper()
	if correctPath.Get == nil && generatedPath.Get == nil {
		return true
	}

	if correctPath.Get == nil || generatedPath.Get == nil {
		return false
	}

	assert.Equal(t, correctPath.Get.Description, generatedPath.Get.Description, "The descriptions of the GET mismatched")
	return true
}
