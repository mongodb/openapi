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
	"time"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/mongodb/openapi/tools/cli/internal/apiversion"
)

type ExtensionFilter struct {
	oas      *openapi3.T
	metadata *Metadata
}

const sunsetExtension = "x-sunset"
const xGenExtension = "x-gen-version"
const format = "2006-01-02T15:04:05Z07:00"

func (f *ExtensionFilter) Apply() error {
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

				f.deleteSunsetIfDeprecatedByHiddenVersions(latestVersionMatch, response.Value.Content)
				f.updateToDateString(response.Value.Content)
			}

			request := operation.RequestBody
			if request == nil || request.Value == nil || request.Value.Content == nil {
				continue
			}
			f.updateToDateString(request.Value.Content)
			f.deleteSunsetIfDeprecatedByHiddenVersions(latestVersionMatch, request.Value.Content)
		}
	}
	return nil
}

func (f *ExtensionFilter) updateToDateString(content openapi3.Content) {
	for _, mediaType := range content {
		if mediaType.Extensions == nil {
			continue
		}

		// check if it has sunset extension
		if sunset, ok := mediaType.Extensions[sunsetExtension]; ok {
			date, err := time.Parse(format, sunset.(string))
			if err != nil {
				continue
			}
			mediaType.Extensions[sunsetExtension] = date.Format("2006-01-02")
		}

		// check if it has x-gen-version extension
		if genVersion, ok := mediaType.Extensions[xGenExtension]; ok {
			date, err := time.Parse(format, genVersion.(string))
			if err != nil {
				continue
			}
			mediaType.Extensions[xGenExtension] = date.Format("2006-01-02")
		}
	}
}

// deleteSunsetIfDeprecatedByHiddenVersions deletes the sunset extension if the latest matched version is deprecated by hidden versions
func (f *ExtensionFilter) deleteSunsetIfDeprecatedByHiddenVersions(latestMatchedVersion *apiversion.APIVersion, content openapi3.Content) {
	versions, versionToContentType := getVersionsInContentType(content)

	deprecatedByHiddenVersions := make([]*apiversion.APIVersion, 0)
	deprecatedByVersions := make([]*apiversion.APIVersion, 0)

	for _, v := range versions {
		if v.GreaterThan(latestMatchedVersion) {
			if value, ok := versionToContentType[v.String()]; ok {
				if isContentTypeHiddenForEnv(value, f.metadata.targetEnv) {
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

func getVersionsInContentType(content map[string]*openapi3.MediaType) (
	versions []*apiversion.APIVersion, contentsInVersion map[string]*openapi3.MediaType) {
	contentsInVersion = make(map[string]*openapi3.MediaType)
	versionsInContentType := make(map[string]*apiversion.APIVersion)

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
