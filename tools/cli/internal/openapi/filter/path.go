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

func (f *PathFilter) Apply(doc *openapi3.T, metadata *Metadata) error {
	log.Printf("Applying path for OAS with Title %s", doc.Info.Title)
	for path, pathItem := range doc.Paths.Map() {
		log.Printf("Path: %s", path)
		filterPathItem(pathItem, metadata)
	}
	return nil
}

func filterPathItem(pPath *openapi3.PathItem, m *Metadata) {
	version := m.targetVersion
	for _, op := range pPath.Operations() {
		latestMatchedVersion, err := getLatestVersionMatch(op, version)
		if err != nil {
			log.Fatalf("Error getting latest version match: %s", err)
			return
		}

		log.Printf("Parsing OperationId: %s for targetVersion %s and got the latest matched version: %s",
			op.OperationID, version, latestMatchedVersion)
		// TODO: Continue parsing...
	}
}

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
