package tools

import (
	"fmt"

	"github.com/mongodb/openapi/tools/mcp-server/internal/registry"
)

// UnloadParams are the parameters for the unload tool.
type UnloadParams struct {
	Alias string `json:"alias" jsonschema:"Alias of the spec to unload"`
}

// UnloadResult is the result of an unload operation.
type UnloadResult struct {
	Success bool   `json:"success"`
	Alias   string `json:"alias"`
	Message string `json:"message"`
}

// handleUnload removes a spec from the registry.
// The SDK handles parameter unmarshaling and validation automatically.
func handleUnload(reg *registry.Registry, params UnloadParams) (UnloadResult, error) {
	if err := reg.Remove(params.Alias); err != nil {
		return UnloadResult{Success: false}, err
	}

	return UnloadResult{
		Success: true,
		Alias:   params.Alias,
		Message: fmt.Sprintf("Unloaded '%s' successfully", params.Alias),
	}, nil
}
