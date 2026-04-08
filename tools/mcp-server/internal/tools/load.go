package tools

import (
	"fmt"
	"path/filepath"
	"regexp"
	"strings"

	"github.com/mongodb/openapi/tools/cli/pkg/openapi"
	"github.com/mongodb/openapi/tools/mcp-server/internal/registry"
)

// LoadParams are the parameters for the load tool.
type LoadParams struct {
	FilePath string            `json:"filePath" jsonschema:"Path to the OpenAPI file (JSON or YAML)"`
	Alias    string            `json:"alias,omitempty" jsonschema:"Optional custom alias (auto-generated from filename if not provided)"`
	Metadata map[string]string `json:"metadata,omitempty" jsonschema:"Optional metadata to attach to the spec"`
}

// LoadResult is the result of a load operation.
type LoadResult struct {
	Success  bool     `json:"success"`
	Alias    string   `json:"alias"`
	Message  string   `json:"message"`
	SpecInfo SpecInfo `json:"specInfo,omitempty"`
}

// SpecInfo contains metadata about the loaded spec.
type SpecInfo struct {
	Title       string `json:"title,omitempty"`
	Version     string `json:"version,omitempty"`
	PathCount   int    `json:"pathCount"`
	SchemaCount int    `json:"schemaCount"`
}

// handleLoad loads an OpenAPI spec from a file into the registry.
// The SDK handles parameter unmarshaling and validation automatically.
func handleLoad(reg *registry.Registry, params LoadParams) (LoadResult, error) {
	alias := params.Alias
	if alias == "" {
		var err error
		alias, err = generateAliasFromPath(params.FilePath)
		if err != nil {
			return LoadResult{Success: false}, fmt.Errorf("failed to generate alias: %w", err)
		}
	} else {
		alias = strings.ToLower(alias)
		if !isValidAlias(alias) {
			return LoadResult{Success: false}, fmt.Errorf("invalid alias '%s': only lowercase letters, numbers, and hyphens allowed", alias)
		}
	}

	loader := openapi.NewLoader()
	specInfo, err := loader.LoadFromPath(params.FilePath)
	if err != nil {
		return LoadResult{Success: false}, fmt.Errorf("failed to load spec from %q: %w", params.FilePath, err)
	}

	err = reg.Add(alias, params.FilePath, specInfo.Spec, params.Metadata)
	if err != nil {
		return LoadResult{Success: false}, fmt.Errorf("%w. Please use 'unload' first or provide a different alias", err)
	}

	schemaCount := 0
	if specInfo.Spec.Components != nil && specInfo.Spec.Components.Schemas != nil {
		schemaCount = len(specInfo.Spec.Components.Schemas)
	}

	info := SpecInfo{
		Title:       specInfo.Spec.Info.Title,
		Version:     specInfo.Spec.Info.Version,
		PathCount:   len(specInfo.Spec.Paths.Map()),
		SchemaCount: schemaCount,
	}

	return LoadResult{
		Success:  true,
		Alias:    alias,
		Message:  fmt.Sprintf("Loaded '%s' successfully", alias),
		SpecInfo: info,
	}, nil
}

// generateAliasFromPath creates a valid alias from a file path.
func generateAliasFromPath(filePath string) (string, error) {
	filename := filepath.Base(filePath)
	ext := filepath.Ext(filename)
	name := strings.TrimSuffix(filename, ext)

	name = strings.ToLower(name)

	re := regexp.MustCompile(`[^a-z0-9-]+`)
	alias := re.ReplaceAllString(name, "-")

	alias = strings.Trim(alias, "-")

	re = regexp.MustCompile(`-+`)
	alias = re.ReplaceAllString(alias, "-")

	if !isValidAlias(alias) {
		return "", fmt.Errorf("could not generate valid alias from filename '%s'", filename)
	}

	return alias, nil
}

// isValidAlias checks if alias contains only allowed characters.
func isValidAlias(alias string) bool {
	if alias == "" {
		return false
	}
	matched, _ := regexp.MatchString(`^[a-z0-9-]+$`, alias)
	return matched
}
