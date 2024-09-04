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

func NewChangelogBasePathNewAPIVersion(t *testing.T) string {
	t.Helper()
	cliPath, err := filepath.Abs("../../data/changelog/new-api-version/base")
	require.NoError(t, err)
	return cliPath
}

func NewChangelogRevisionPathNewAPIVersion(t *testing.T) string {
	t.Helper()
	cliPath, err := filepath.Abs("../../data/changelog/new-api-version/revision")
	require.NoError(t, err)
	return cliPath
}

func NewChangelogExepmtionFilePathNewAPIVersion(t *testing.T) string {
	t.Helper()
	cliPath, err := filepath.Abs("../../data/changelog/new-api-version/exemptions.yaml")
	require.NoError(t, err)
	return cliPath
}

func NewChangelogOutputPathNewAPIVersion(t *testing.T) string {
	t.Helper()
	cliPath, err := filepath.Abs("../../data/changelog/new-api-version/output")
	require.NoError(t, err)
	return cliPath
}

func NewChangelogBasePathSameAPIVersion(t *testing.T) string {
	t.Helper()
	cliPath, err := filepath.Abs("../../data/changelog/same-api-version/base")
	require.NoError(t, err)
	return cliPath
}

func NewChangelogRevisionPathSameAPIVersion(t *testing.T) string {
	t.Helper()
	cliPath, err := filepath.Abs("../../data/changelog/same-api-version/revision")
	require.NoError(t, err)
	return cliPath
}

func NewChangelogExepmtionFilePathSameAPIVersion(t *testing.T) string {
	t.Helper()
	cliPath, err := filepath.Abs("../../data/changelog/same-api-version/exemptions.yaml")
	require.NoError(t, err)
	return cliPath
}

func NewChangelogOutputPathSameAPIVersion(t *testing.T) string {
	t.Helper()
	cliPath, err := filepath.Abs("../../data/changelog/same-api-version/output")
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

func NewValidAtlasSpecPath(t *testing.T, version, folder string) string {
	t.Helper()
	cliPath, err := filepath.Abs("../../data/split/" + folder + "/openapi-v2-" + version + ".json")
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
