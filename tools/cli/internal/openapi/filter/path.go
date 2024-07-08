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
	"time"

	"github.com/mongodb/openapi/tools/cli/internal/apiversion"

	"github.com/getkin/kin-openapi/openapi3"
)

type PathFilter struct {
}

type ApplyConfig struct {
	operationsToBeRemoved map[string]*openapi3.Operation
	parsedOperations      map[string]*OperationConfig
	requestedVersion      *apiversion.APIVersion
}

type OperationConfig struct {
	operation            *openapi3.Operation
	latestMatchedVersion *apiversion.APIVersion
	deprecatedVersions   []*apiversion.APIVersion
	removeResponseCodes  []string
	hasMinValidResponse  bool
	shouldApply          bool
}

func newOperationConfig() *OperationConfig {
	return &OperationConfig{
		operation:            nil,
		latestMatchedVersion: nil,
		deprecatedVersions:   make([]*apiversion.APIVersion, 0),
		removeResponseCodes:  make([]string, 0),
		hasMinValidResponse:  false,
		shouldApply:          false,
	}
}

func (f *PathFilter) Apply(doc *openapi3.T, metadata *Metadata) error {
	log.Printf("Applying path for OAS with Title %s", doc.Info.Title)
	for path, pathItem := range doc.Paths.Map() {
		config := f.processPathItem(pathItem, metadata)
		if config == nil {
			log.Fatalf("Error processing path item: %s", path)
			return nil
		}

		log.Printf("[DEBUG] See config values {operationsToBeRemoved: %v, parsedOperations: %v}",
			config.operationsToBeRemoved, config.parsedOperations)

		// f.apply(config, pathItem)
	}
	return nil
}

// processPathItem processes a path item and returns an ApplyConfig
func (f *PathFilter) processPathItem(path *openapi3.PathItem, m *Metadata) *ApplyConfig {
	config := &ApplyConfig{
		requestedVersion:      m.targetVersion,
		operationsToBeRemoved: make(map[string]*openapi3.Operation),
		parsedOperations:      make(map[string]*OperationConfig),
	}

	for _, op := range path.Operations() {
		opConfig := newOperationConfig()
		config.parsedOperations[op.OperationID] = opConfig
		var err error
		opConfig.latestMatchedVersion, err = getLatestVersionMatch(op, m.targetVersion)
		if err != nil {
			log.Fatalf("Error getting latest version match: %s", err)
			return nil
		}

		for _, response := range op.Responses.Map() {
			filteredResponse := filterResponse(response, op, config)
			if filteredResponse == nil {
				log.Printf("Marking response for removal: %s", response.Ref)
				opConfig.removeResponseCodes = append(opConfig.removeResponseCodes, response.Ref)
			}
		}

		if !opConfig.hasMinValidResponse {
			config.operationsToBeRemoved[op.OperationID] = op
		}
	}

	return config
}

func (f *PathFilter) apply(config *ApplyConfig, path *openapi3.PathItem) {
	for _, op := range config.operationsToBeRemoved {
		log.Printf("Removing operation: %s", op.OperationID)
		delete(path.Operations(), op.OperationID)
	}

	for _, op := range config.parsedOperations {
		updateOpDescription(op.operation, op.deprecatedVersions)

	}
	for _, op := range path.Operations() {
		opConfig := config.parsedOperations[op.OperationID]
		updateOpDescription(op, opConfig.deprecatedVersions)

		for _, c := range opConfig.removeResponseCodes {
			log.Printf("Removing response code: %s", c)
			delete(op.Responses.Map(), c)
		}
	}
}

// func filterPathItem(path *openapi3.PathItem, m *Metadata) {
// 	rConfig := &ApplyConfig{
// 		requestedVersion:      m.targetVersion,
// 		operationsToBeRemoved: make(map[string]*openapi3.Operation),
// 		parsedOperations:      make(map[string]*OperationConfig),
// 	}

// 	version := m.targetVersion
// 	for _, op := range path.Operations() {
// 		opConfig := newOperationConfig()
// 		rConfig.parsedOperations[op.OperationID] = opConfig

// 		var err error
// 		opConfig.latestMatchedVersion, err = getLatestVersionMatch(op, version)
// 		if err != nil {
// 			log.Fatalf("Error getting latest version match: %s", err)
// 			return
// 		}

// 		log.Printf("Parsing OperationId: %s for targetVersion %s and got the latest matched version: %s",
// 			op.OperationID, version, opConfig.latestMatchedVersion)

// 		for _, response := range op.Responses.Map() {
// 			response.Value.Content = filterResponse(response, op, rConfig)
// 			if response.Value.Content == nil {
// 				log.Printf("Marking response for removal: %s", response.Ref)
// 				rConfig.operationsToBeRemoved[op.OperationID] = op
// 			}
// 		}

// 		updateOpDescription(op, opConfig.deprecatedVersions)

// 		for _, c := range opConfig.removeResponseCodes {
// 			log.Printf("Removing response code: %s", c)
// 			delete(op.Responses.Map(), c)
// 		}

// 		// if requestBody := op.RequestBody; requestBody != nil && len(requestBody.Content) > 0 {
// 		// 	filteredRequestBody := filterVersionedContent(requestBody.Content, pVersion, false).Content
// 		// 	if filteredRequestBody != nil && len(filteredRequestBody) > 0 {
// 		// 		requestBody.Content = filteredRequestBody
// 		// 	} else {
// 		// 		// We do not want empty request. Remove request body object
// 		// 		op.RequestBody = nil
// 		// 	}
// 		// }
// 	}
// }

func getLatestVersionMatch(
	op *openapi3.Operation, requestedVersion *apiversion.APIVersion) (*apiversion.APIVersion, error) {
	/*
		  given:
			 version: 2024-01-01
			 op response:
			   "200":
				  content: application/vnd.atlas.2023-01-01+json
			   "201":
				  content: application/vnd.atlas.2023-12-01+json
				  content: application/vnd.atlas.2025-01-01+json
		  should return latestVersionMatch=2023-12-01
	*/
	var latestVersionMatch *apiversion.APIVersion
	for _, response := range op.Responses.Map() {
		if response.Value.Content == nil {
			continue
		}

		for contentType := range response.Value.Content {
			contentVersion, err := apiversion.New(apiversion.WithContent(contentType))
			if err != nil {
				log.Printf("Ignoring invalid content type: %s", contentType)
				continue
			}
			if contentVersion.GreaterThan(requestedVersion) {
				continue
			}

			if contentVersion.Equal(requestedVersion) {
				return contentVersion, nil
			}

			if latestVersionMatch == nil || contentVersion.GreaterThan(latestVersionMatch) {
				latestVersionMatch = contentVersion
			}
		}
	}

	if latestVersionMatch == nil {
		return requestedVersion, nil
	}

	return latestVersionMatch, nil
}

func filterResponse(response *openapi3.ResponseRef, op *openapi3.Operation, rConfig *ApplyConfig) openapi3.Content {
	opConfig := rConfig.parsedOperations[op.OperationID]

	filteredContent, _ := filterVersionedContent(response.Value.Content, opConfig.latestMatchedVersion, true)
	if len(filteredContent) > 0 {
		opConfig.hasMinValidResponse = true
		deprecatedVersionsPerContent := getDeprecatedVersionsPerContent(response.Value.Content, opConfig.latestMatchedVersion)
		opConfig.deprecatedVersions = append(opConfig.deprecatedVersions, deprecatedVersionsPerContent...)
	}

	// remove entirely the response code (e.g. "200") if the filtered content is empty
	if filteredContent == nil && isVersionedContent(response.Value.Content) {
		opConfig.removeResponseCodes = append(opConfig.removeResponseCodes, response.Ref)
	}
	return filteredContent
}

func updateOpDescription(op *openapi3.Operation, deprecatedVersions []*apiversion.APIVersion) {
	if len(deprecatedVersions) == 0 {
		return
	}

	dVersions := make([]string, 0)
	for _, v := range deprecatedVersions {
		dVersions = append(dVersions, "v2-{"+v.String()+"}")
	}

	op.Description = strings.TrimSuffix(op.Description, ".")
	// add deprecated versions
	op.Description += ". Deprecated versions: " + strings.Join(dVersions, ", ")
}

func parseVersionToDate(version string) (time.Time, error) {
	return time.Parse("2006-01-02", version)
}

func filterVersionedContent(content map[string]*openapi3.MediaType, version *apiversion.APIVersion, pExactMatch bool) (openapi3.Content, error) {
	if content == nil {
		return nil, nil
	}

	for contentType, mediaType := range content {
		v, err := apiversion.New(apiversion.WithContent(contentType))
		if err != nil {
			log.Printf("Ignoring invalid content type: %s", contentType)
			continue
		}

		if pExactMatch && !v.Equal(version) {
			continue
		}
		if pExactMatch && !v.Equal(version) {
			return openapi3.Content{contentType: mediaType}, nil
		}

		// if the version is not an exact match, we need to check if it is the latest version
		if !pExactMatch {
			requestedVersion, err := parseVersionToDate(v.String())
			if err != nil {
				log.Fatalf("Error parsing version: %s", err)
				return nil, nil
			}

			contentVersion, err := parseVersionToDate(v.String())
			if err != nil {
				log.Fatalf("Error parsing version: %s", err)
				return nil, nil
			}

			if contentVersion.After(requestedVersion) {
				continue
			}
		}

		// if the version is an exact match or the latest version, return the content
		return openapi3.Content{contentType: mediaType}, nil
	}

	return nil, nil
}

func getDeprecatedVersionsPerContent(content map[string]*openapi3.MediaType, version *apiversion.APIVersion) []*apiversion.APIVersion {
	versionsInContentType := make(map[string]*apiversion.APIVersion)
	for contentType, _ := range content {
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
