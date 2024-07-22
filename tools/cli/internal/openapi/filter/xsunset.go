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

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/mongodb/openapi/tools/cli/internal/apiversion"
)

type SunsetFilter struct {
	oas      *openapi3.T
	metadata *Metadata
}

const sunsetExtension = "x-sunset"

func (f *SunsetFilter) Apply() error {
	for _, pathItem := range f.oas.Paths.Map() {
		if pathItem == nil {
			continue
		}

		for _, operation := range pathItem.Operations() {
			if operation == nil {
				continue
			}

			latestVersionMatch, err := apiversion.FindLatestContentVersionMatched(operation, f.metadata.targetVersion)
			if err != nil {
				return err
			}

			for _, response := range operation.Responses.Map() {
				if response.Value == nil || response.Value.Content == nil {
					continue
				}

				f.deleteSunsetIfDeprecatedByHiddenVersions(latestVersionMatch, response)
			}
		}

	}
	return nil
}

// deleteSunsetIfDeprecatedByHiddenVersions deletes the sunset extension if the latest matched version is deprecated by hidden versions
func (f *SunsetFilter) deleteSunsetIfDeprecatedByHiddenVersions(latestMatchedVersion *apiversion.APIVersion, response *openapi3.ResponseRef) {
	versions, versionToContentType := getVersionsInContentType(response.Value.Content)

	deprecatedByHiddenVersions := make([]*apiversion.APIVersion, 0)
	deprecatedByVersions := make([]*apiversion.APIVersion, 0)

	for _, v := range versions {
		if v.GreaterThan(latestMatchedVersion) {
			if value, ok := versionToContentType[v.String()]; ok {
				f := &HiddenEnvsFilter{
					metadata: f.metadata,
				}
				if f.isContentTypeHiddenForEnv(value) {
					deprecatedByHiddenVersions = append(deprecatedByHiddenVersions, v)
					continue
				}
				deprecatedByVersions = append(deprecatedByVersions, v)
			}
		}
	}

	// If the exact requested version is marked for sunset for a list of hidden versions
	if value, ok := versionToContentType[latestMatchedVersion.String()]; ok {
		if len(deprecatedByHiddenVersions) > 0 && len(deprecatedByVersions) == 0 && value.Extensions != nil {
			delete(value.Extensions, sunsetExtension)
		}
	}
}

func getVersionsInContentType(content map[string]*openapi3.MediaType) ([]*apiversion.APIVersion, map[string]*openapi3.MediaType) {
	contentsInVersion := make(map[string]*openapi3.MediaType)
	versionsInContentType := make(map[string]*apiversion.APIVersion)
	versions := make([]*apiversion.APIVersion, 0)

	for contentType := range content {
		v, err := apiversion.New(apiversion.WithContent(contentType))
		if err != nil {
			log.Printf("Ignoring invalid content type: %s", contentType)
			continue
		}
		versions = append(versions, v)
		versionsInContentType[v.String()] = v
		contentsInVersion[v.String()] = content[contentType]
	}

	return versions, contentsInVersion
}
