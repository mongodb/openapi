package cli

import (
	"fmt"
	"os"
	"path/filepath"
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

func NewBaseSpec() (string, error) {
	cliPath, err := filepath.Abs("../../data/base_spec.json")
	if err != nil {
		return "", err
	}
	return cliPath, nil
}

func NewAPIRegistrySpec() (string, error) {
	cliPath, err := filepath.Abs("../../data/apiregistry_spec.json")
	if err != nil {
		return "", err
	}
	return cliPath, nil
}

func NewAuthNSpec() (string, error) {
	cliPath, err := filepath.Abs("../../data/authn_spec.json")
	if err != nil {
		return "", err
	}
	return cliPath, nil
}
func NewDuplicatedPathAPIRegistrySpec() (string, error) {
	cliPath, err := filepath.Abs("../../data/duplicated_path_apiregistry_spec.json")
	if err != nil {
		return "", err
	}
	return cliPath, nil
}
func NewNotIdenticalComponentPIRegistrySpec() (string, error) {
	cliPath, err := filepath.Abs("../../data/not_identical_component_apiregistry_spec.json")
	if err != nil {
		return "", err
	}
	return cliPath, nil
}

func NewDuplicatedTagAuthNSpec() (string, error) {
	cliPath, err := filepath.Abs("../../data/duplicated_tag_authn_spec.json")
	if err != nil {
		return "", err
	}
	return cliPath, nil
}
