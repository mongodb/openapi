package cli

import (
	"fmt"
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

func NewAtlasYAMLBaseSpecPath(t *testing.T, folder string) string {
	t.Helper()
	cliPath, err := filepath.Abs("../../data/split/" + folder + "/openapi-v2.yaml")
	require.NoError(t, err)
	return cliPath
}

func NewAtlasJSONBaseSpecPath(t *testing.T, folder string) string {
	t.Helper()
	cliPath, err := filepath.Abs("../../data/split/" + folder + "/openapi-v2.json")
	require.NoError(t, err)
	return cliPath
}

func NewValidAtlasSpecPath(t *testing.T, version string, folder string) string {
	t.Helper()
	cliPath, err := filepath.Abs("../../data/split/" + folder + "/openapi-v2-" + version + ".json")
	require.NoError(t, err)
	return cliPath
}

func NewValidAtlasSpecWithExtensionsPath(t *testing.T, folder string) string {
	t.Helper()
	cliPath, err := filepath.Abs("../../data/split/" + folder + "/openapi-mms-extensions.json")
	require.NoError(t, err)
	return cliPath
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
