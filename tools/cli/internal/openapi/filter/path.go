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

	"github.com/mongodb/openapi/tools/cli/internal/apiversion"

	"github.com/getkin/kin-openapi/openapi3"
)

type PathFilter struct {
}

func (f *PathFilter) Apply(doc *openapi3.T, metadata *FilterMetadata) error {
	log.Printf("Applying path for OAS with Title %s", doc.Info.Title)
	for path, pathItem := range doc.Paths.Map() {
		log.Printf("Path: %s", path)
		filterPathItem(pathItem, metadata)
	}
	return nil
}

func filterPathItem(pPath *openapi3.PathItem, m *FilterMetadata) {
	// versionFoundForOperation := false
	// operationsToBeRemoved := make(map[string]*openapi3.Operation)

	version := m.targetVersion
	for _, op := range pPath.Operations() {
		latestMatchedVersion, err := getLatestVersionMatch(op, version)
		if err != nil {
			log.Fatalf("Error getting latest version match: %s", err)
			return
		}

		log.Printf("targetVersion: %s", version)
		log.Printf("latestMatchedVersion: %s", latestMatchedVersion)

		versionFoundForOperation := false
		deprecatedVersions := make([]*apiversion.APIVersion, 0)
		removeResponseCodes := make([]string, 0)

		for _, response := range op.Responses.Map() {
			filteredContent, _ := filterVersionedContent(response.Value.Content, latestMatchedVersion, true)
			if len(filteredContent) > 0 {
				versionFoundForOperation = true
				deprecatedVersionsPerContent := getDeprecatedVersionsPerContent(response.Value.Content, latestMatchedVersion)
				deprecatedVersions = append(deprecatedVersions, deprecatedVersionsPerContent...)
			}

			log.Printf("versionFoundForOperation: %t", versionFoundForOperation)
			log.Printf("deprecatedVersions: %v", deprecatedVersions)

			// remove entirely the response code (e.g. "200") if the filtered content is empty
			if filteredContent == nil && isVersionedContent(response.Value.Content) {
				removeResponseCodes = append(removeResponseCodes, response.Ref)
			}
			response.Value.Content = filteredContent
		}
		for _, c := range removeResponseCodes {
			log.Printf("Removing response code: %s", c)
			delete(op.Responses.Map(), c)
		}

		// if requestBody := op.RequestBody; requestBody != nil && len(requestBody.Content) > 0 {
		// 	filteredRequestBody := filterVersionedContent(requestBody.Content, pVersion, false).Content
		// 	if filteredRequestBody != nil && len(filteredRequestBody) > 0 {
		// 		requestBody.Content = filteredRequestBody
		// 	} else {
		// 		// We do not want empty request. Remove request body object
		// 		op.RequestBody = nil
		// 	}
		// }

		// if len(deprecatedVersions) > 0 {
		// 	op.Description += ". Deprecated versions: " + strings.Join(deprecatedVersions, ", ")
		// }
	}
}

func getLatestVersionMatch(op *openapi3.Operation, requestedVersion *apiversion.APIVersion) (*apiversion.APIVersion, error) {
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
	var latestVersionMatch *apiversion.APIVersion = nil
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
