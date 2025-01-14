// Copyright 2024 MongoDB Inc
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//	http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
package filter

import (
	"log"
	"strings"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/mongodb/openapi/tools/cli/internal/apiversion"
)

// Filter: VersioningFilter is a filter that modifies the OpenAPI spec by removing operations and responses
// that are not supported by the target version.
type VersioningFilter struct {
	oas      *openapi3.T
	metadata *Metadata
}

const versionExtension = "x-xgen-version"

// VersionConfig contains the information needed during the versioning filtering of the OAS.
// It contains the parsed operations, the operations that need to be removed and the version
// under scrutiny.
type VersionConfig struct {
	operationsToBeRemoved map[string]*openapi3.Operation
	parsedOperations      map[string]*OperationConfig
	requestedVersion      *apiversion.APIVersion
}

// OperationConfig contains the information needed while parsing an operation of the OAS.
type OperationConfig struct {
	operation            *openapi3.Operation
	latestMatchedVersion *apiversion.APIVersion
	deprecatedVersions   []*apiversion.APIVersion
	hasMinValidResponse  bool
}

func newOperationConfig(op *openapi3.Operation) *OperationConfig {
	return &OperationConfig{
		operation:            op,
		latestMatchedVersion: nil,
		deprecatedVersions:   make([]*apiversion.APIVersion, 0),
		hasMinValidResponse:  false,
	}
}

func (f *VersioningFilter) Apply() error {
	newPaths := &openapi3.Paths{
		Extensions: f.oas.Paths.Extensions,
	}

	for k, pathItem := range f.oas.Paths.Map() {
		if pathItem == nil {
			continue
		}

		if err := f.applyInternal(pathItem); err != nil {
			return err
		}

		if len(pathItem.Operations()) == 0 {
			continue
		}

		newPaths.Set(k, pathItem)
	}
	f.oas.Paths = newPaths
	return nil
}

func (f *VersioningFilter) applyInternal(path *openapi3.PathItem) error {
	config := &VersionConfig{
		requestedVersion:      f.metadata.targetVersion,
		operationsToBeRemoved: make(map[string]*openapi3.Operation),
		parsedOperations:      make(map[string]*OperationConfig),
	}

	for opKey, op := range path.Operations() {
		opConfig := newOperationConfig(op)
		config.parsedOperations[op.OperationID] = opConfig

		opConfig.latestMatchedVersion = apiversion.FindLatestContentVersionMatched(op, f.metadata.targetVersion)
		if err := updateResponses(op, config); err != nil {
			return err
		}

		if !opConfig.hasMinValidResponse {
			log.Printf("Removing operation: %s", op.OperationID)
			path.SetOperation(opKey, nil)
		}
		if err := updateRequestBody(op, opConfig); err != nil {
			return err
		}
		addDeprecationMessageToOperation(op, opConfig.deprecatedVersions)
	}

	return nil
}

// updateResponses filters the response and removes the deprecated responses from the operation and add the  to the operation config.
func updateResponses(op *openapi3.Operation, config *VersionConfig) error {
	for responseCode, response := range op.Responses.Map() {
		if response.Value == nil {
			log.Printf("Ignoring response: %s for operationID: %s", responseCode, op.OperationID)
			continue
		}

		filteredResponse, err := filterResponse(response, op, config)
		if err != nil {
			return err
		}

		if filteredResponse == nil && isVersionedContent(response.Value.Content) {
			log.Printf("Marking response for removal: %s", responseCode)
			op.Responses.Delete(responseCode)
		}
		response.Value.Content = filteredResponse
	}

	return nil
}

func updateRequestBody(op *openapi3.Operation, opConfig *OperationConfig) error {
	if op.RequestBody == nil || op.RequestBody.Value == nil {
		return nil
	}

	filteredRequestBody, err := filterLatestVersionedContent(op.RequestBody.Value.Content, opConfig.latestMatchedVersion)
	if err != nil {
		return err
	}

	if filteredRequestBody == nil {
		log.Printf("Removing request body for content type: %+v", op.RequestBody.Value)
		op.RequestBody.Value.Content = nil
	} else {
		op.RequestBody.Value.Content = filteredRequestBody
	}
	return nil
}

func filterResponse(response *openapi3.ResponseRef, op *openapi3.Operation, rConfig *VersionConfig) (openapi3.Content, error) {
	opConfig := rConfig.parsedOperations[op.OperationID]

	filteredContent, err := filterContentExactMatch(response.Value.Content, opConfig.latestMatchedVersion)
	if err != nil {
		return nil, err
	}

	if len(filteredContent) > 0 {
		opConfig.hasMinValidResponse = true
		deprecatedVersionsPerContent := getDeprecatedVersionsPerContent(response.Value.Content, opConfig.latestMatchedVersion)
		opConfig.deprecatedVersions = append(opConfig.deprecatedVersions, deprecatedVersionsPerContent...)
	}

	return filteredContent, nil
}

// addDeprecationMessageToOperation adds a deprecation message to the operation description if there are deprecated versions
// Example: "Read Only role. Deprecated versions: v2-{2023-01-01}".
func addDeprecationMessageToOperation(op *openapi3.Operation, deprecatedVersions []*apiversion.APIVersion) {
	if len(deprecatedVersions) == 0 {
		return
	}

	apiversion.Sort(deprecatedVersions)
	dVersions := make([]string, 0)
	for _, v := range deprecatedVersions {
		dVersions = append(dVersions, "v2-{"+v.String()+"}")
	}

	op.Description = strings.TrimSuffix(op.Description, ".")
	// add deprecated versions
	op.Description += ". Deprecated versions: " + strings.Join(dVersions, ", ")
}

func filterLatestVersionedContent(content map[string]*openapi3.MediaType, latestVersionMatched *apiversion.APIVersion) (openapi3.Content, error) {
	if content == nil {
		return nil, nil
	}

	var latestVersion *apiversion.APIVersion
	latestContent := openapi3.Content{}

	for contentType, mediaType := range content {
		contentVersion, err := apiversion.New(apiversion.WithContent(contentType))
		if err != nil {
			log.Printf("Ignoring invalid content type: %s", contentType)
			continue
		}

		updateSingleMediaTypeExtension(mediaType, contentVersion)

		if contentVersion.GreaterThan(latestVersionMatched) {
			continue
		}

		if latestVersion == nil && contentVersion.LessThan(latestVersionMatched) {
			latestVersion = contentVersion
			latestContent = openapi3.Content{contentType: mediaType}
		}

		if contentVersion.Equal(latestVersionMatched) {
			latestContent = openapi3.Content{contentType: mediaType}
			break
		}

		if contentVersion.LessThan(latestVersionMatched) && contentVersion.GreaterThan(latestVersion) {
			latestVersion = contentVersion
			latestContent = openapi3.Content{contentType: mediaType}
		}
	}

	return latestContent, nil
}

// filterContentExactMatch filters the content based on the exact match of the version.
func filterContentExactMatch(content map[string]*openapi3.MediaType, version *apiversion.APIVersion) (map[string]*openapi3.MediaType, error) {
	if content == nil {
		return nil, nil
	}

	filteredContent := make(map[string]*openapi3.MediaType)
	for contentType, mediaType := range content {
		contentVersion, err := apiversion.New(apiversion.WithContent(contentType))
		if err != nil {
			log.Printf("Ignoring invalid content type: %s", contentType)
			continue
		}

		if contentVersion.Equal(version) {
			updateSingleMediaTypeExtension(mediaType, contentVersion)
			filteredContent[contentType] = mediaType
		}
	}

	if len(filteredContent) == 0 {
		return nil, nil
	}

	return filteredContent, nil
}

// updateSingleMediaTypeExtension updates the media type extension with the version in string format.
func updateSingleMediaTypeExtension(m *openapi3.MediaType, version *apiversion.APIVersion) {
	if _, ok := m.Extensions[versionExtension]; ok {
		m.Extensions[versionExtension] = version.String()
	}
}

// getDeprecatedVersionsPerContent returns the deprecated versions for a given content type.
func getDeprecatedVersionsPerContent(content map[string]*openapi3.MediaType, version *apiversion.APIVersion) []*apiversion.APIVersion {
	versionsInContentType := make(map[string]*apiversion.APIVersion)
	for contentType := range content {
		v, err := apiversion.New(apiversion.WithContent(contentType))
		if err != nil {
			log.Printf("Ignoring invalid content type: %s", contentType)
			continue
		}

		versionsInContentType[v.String()] = v
	}
	deprecatedVersions := make([]*apiversion.APIVersion, 0)
	for _, v := range versionsInContentType {
		if v.LessThan(version) {
			deprecatedVersions = append(deprecatedVersions, v)
		}
	}
	return deprecatedVersions
}

func isVersionedContent(content map[string]*openapi3.MediaType) bool {
	if content == nil {
		return false
	}

	for contentType := range content {
		if _, err := apiversion.New(apiversion.WithContent(contentType)); err == nil {
			log.Printf("Found versioned content: %s", contentType)
			return true
		}
	}
	return false
}
