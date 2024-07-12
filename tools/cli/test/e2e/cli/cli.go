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

func NewBin() (string, error) {
	path := os.Getenv("CLI_E2E_BINARY")
	cliPath, err := filepath.Abs(path)
	if err != nil {
		return "", fmt.Errorf("%w: invalid bin path %q", err, path)
	}

	if _, err := os.Stat(cliPath); err != nil {
		return "", fmt.Errorf("%w: invalid bin %q", err, path)
	}
	return cliPath, nil
}

func NewBaseSpecPath() (string, error) {
	cliPath, err := filepath.Abs("../../data/merge/base_spec.json")
	if err != nil {
		return "", err
	}
	return cliPath, nil
}

func NewAPIRegistrySpecPath() (string, error) {
	cliPath, err := filepath.Abs("../../data/merge/apiregistry_spec.json")
	if err != nil {
		return "", err
	}
	return cliPath, nil
}

func NewAuthNSpecPath() (string, error) {
	cliPath, err := filepath.Abs("../../data/merge/authn_spec.json")
	if err != nil {
		return "", err
	}
	return cliPath, nil
}
func NewDuplicatedPathAPIRegistrySpecPath() (string, error) {
	cliPath, err := filepath.Abs("../../data/merge/duplicated_path_apiregistry_spec.json")
	if err != nil {
		return "", err
	}
	return cliPath, nil
}
func NewNotIdenticalComponentPIRegistrySpecPath() (string, error) {
	cliPath, err := filepath.Abs("../../data/merge/not_identical_component_apiregistry_spec.json")
	if err != nil {
		return "", err
	}
	return cliPath, nil
}

func NewDuplicatedTagAuthNSpecPath() (string, error) {
	cliPath, err := filepath.Abs("../../data/merge/duplicated_tag_authn_spec.json")
	if err != nil {
		return "", err
	}
	return cliPath, nil
}

func NewAtlasYAMLBaseSpecPath() (string, error) {
	cliPath, err := filepath.Abs("../../data/split/tools/openapi-v2.yaml")
	if err != nil {
		return "", err
	}
	return cliPath, nil
}

func NewValidVersionedAtlasYAMLSpecPath() (string, error) {
	cliPath, err := filepath.Abs("../../data/split/tools/openapi-v2-2024-05-30.yaml")
	if err != nil {
		return "", err
	}
	return cliPath, nil
}

func ValidateVersionedSpec(t *testing.T, correctSpecPath, generatedSpecPath string) {
	t.Helper()
	correctSpec, err := newOpenAPISpec(t, correctSpecPath)
	require.NoError(t, err)

	generatedSpec, err := newOpenAPISpec(t, generatedSpecPath)
	require.NoError(t, err)

	assert.True(t, areOperationsEqual(t, correctSpec, generatedSpec))
}

func newOpenAPISpec(t *testing.T, path string) (*openapi3.T, error) {
	t.Helper()
	absPath, err := filepath.Abs(path)
	require.NoError(t, err)

	loader := openapi.NewOpenAPI3()
	specInfo, err := loader.CreateOpenAPISpecFromPath(absPath)
	require.NoError(t, err)

	return specInfo.Spec, nil
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
