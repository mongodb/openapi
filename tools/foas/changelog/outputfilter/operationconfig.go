package outputfilter

import (
	"github.com/getkin/kin-openapi/openapi3"
	"github.com/mongodb/openapi/tools/foas/apiversion"
	"github.com/oasdiff/oasdiff/load"
)

type OperationConfig struct {
	Path                   string
	HTTPMethod             string
	Tag                    string
	Version                string
	Sunset                 string
	ManualChangelogEntries map[string]any
}

type OperationConfigs struct {
	Base     *OperationConfig
	Revision *OperationConfig
}

func (e *OperationConfigs) Tag() string {
	if e.Revision != nil {
		return e.Revision.Tag
	}

	if e.Base != nil {
		return e.Base.Tag
	}

	return ""
}

func (e *OperationConfigs) Sunset() string {
	if e.Revision != nil && e.Revision.Sunset != "" {
		return e.Revision.Sunset
	}

	if e.Base != nil {
		return e.Base.Sunset
	}

	return ""
}

// NewOperationConfigs parses the base and revision openapi specs
// and returns the mapping between API operationId and EndpointConfig.
func NewOperationConfigs(base, revision *load.SpecInfo) map[string]*OperationConfigs {
	baseEndpointsConfigMap := newOperationConfigFromSpec(base)
	revisionEndpointsConfigMap := newOperationConfigFromSpec(revision)

	combinedConfig := make(map[string]*OperationConfigs)

	// Combine the keys from both maps
	keys := make(map[string]struct{})
	for key := range baseEndpointsConfigMap {
		keys[key] = struct{}{}
	}
	for key := range revisionEndpointsConfigMap {
		keys[key] = struct{}{}
	}

	// Create EndpointConfig for each key
	for opID := range keys {
		combinedConfig[opID] = &OperationConfigs{
			Base:     baseEndpointsConfigMap[opID],
			Revision: revisionEndpointsConfigMap[opID],
		}
	}

	return combinedConfig
}

func newOperationConfigFromSpec(spec *load.SpecInfo) map[string]*OperationConfig {
	endpointsConfigMap := make(map[string]*OperationConfig)
	if spec == nil || spec.Spec == nil {
		return nil
	}

	paths := spec.Spec.Paths
	if paths == nil || paths.Len() == 0 {
		return nil
	}

	for pathKey, path := range paths.Map() {
		for operationName, operation := range path.Operations() {
			endpointConfig := newEndpointConfig(pathKey, operationName, operation)
			if endpointConfig != nil {
				endpointsConfigMap[operation.OperationID] = endpointConfig
			}
		}
	}

	return endpointsConfigMap
}

func newEndpointConfig(pathName, operatioName string, operation *openapi3.Operation) *OperationConfig {
	operationID := operation.OperationID
	if operationID == "" {
		return nil
	}

	if operation.Tags == nil || len(operation.Tags) != 1 {
		return nil
	}
	tag := operation.Tags[0]

	sunset := ""
	if value, ok := operation.Extensions["x-sunset"]; ok {
		sunset = value.(string)
	}

	manualChangelogEntries := make(map[string]any)
	if value, ok := operation.Extensions["x-xgen-changelog"]; ok {
		manualChangelogEntries = value.(map[string]any)
	}

	return &OperationConfig{
		Tag:                    tag,
		Path:                   pathName,
		HTTPMethod:             operatioName,
		Version:                operationVersion(operation),
		Sunset:                 sunset,
		ManualChangelogEntries: manualChangelogEntries,
	}
}

func operationVersion(operation *openapi3.Operation) string {
	var latest *apiversion.APIVersion
	updateLatest := func(content openapi3.Content) {
		for contentType, mediaType := range content {
			version := versionFromMediaType(contentType, mediaType)
			if version == nil {
				continue
			}
			if latest == nil || version.GreaterThan(latest) {
				latest = version
			}
		}
	}

	if operation.Responses != nil {
		for _, response := range operation.Responses.Map() {
			if response == nil || response.Value == nil {
				continue
			}
			updateLatest(response.Value.Content)
		}
	}

	if operation.RequestBody != nil && operation.RequestBody.Value != nil {
		updateLatest(operation.RequestBody.Value.Content)
	}

	if latest == nil {
		return ""
	}
	return latest.String()
}

func versionFromMediaType(contentType string, mediaType *openapi3.MediaType) *apiversion.APIVersion {
	if mediaType == nil {
		return nil
	}

	if version, ok := mediaType.Extensions["x-xgen-version"].(string); ok && version != "" {
		v, err := apiversion.New(apiversion.WithVersion(version))
		if err == nil {
			return v
		}
	}

	v, err := apiversion.New(apiversion.WithFullContent(contentType, mediaType))
	if err != nil {
		return nil
	}
	return v
}
