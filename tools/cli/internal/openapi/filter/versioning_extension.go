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

// Filter: VersioningExtensionFilter is a filter that updates the x-sunset and x-xgen-version extensions to a date string
// and deletes the x-sunset extension if the latest matched version is deprecated by hidden versions
// for the target environment.
type VersioningExtensionFilter struct {
	oas      *openapi3.T
	metadata *Metadata
}

const (
	sunsetExtension = "x-sunset"
	xGenExtension   = "x-xgen-version"
)

func (f *VersioningExtensionFilter) Apply() error {
	for _, pathItem := range f.oas.Paths.Map() {
		if pathItem == nil {
			continue
		}

		updateExtensionToDateString(pathItem.Extensions)

		for _, operation := range pathItem.Operations() {
			if operation == nil {
				continue
			}

			updateExtensionToDateString(operation.Extensions)

			latestVersionMatch := apiversion.FindLatestContentVersionMatched(operation, f.metadata.targetVersion)

			for _, response := range operation.Responses.Map() {
				if response == nil {
					continue
				}

				updateExtensionToDateString(response.Extensions)

				if response.Value == nil {
					continue
				}

				updateExtensionToDateString(response.Value.Extensions)
				if response.Value.Content == nil {
					continue
				}

				updateToDateString(response.Value.Content)
				f.deleteSunsetIfDeprecatedByHiddenVersions(latestVersionMatch, response.Value.Content)
			}

			request := operation.RequestBody
			if request == nil || request.Value == nil || request.Value.Content == nil {
				continue
			}
			updateToDateString(request.Value.Content)
			f.deleteSunsetIfDeprecatedByHiddenVersions(latestVersionMatch, request.Value.Content)
		}
	}

	return nil
}

// deleteSunsetIfDeprecatedByHiddenVersions deletes the sunset extension if the latest matched version is deprecated by hidden versions.
func (f *VersioningExtensionFilter) deleteSunsetIfDeprecatedByHiddenVersions(latestMatchedVersion *apiversion.APIVersion, content openapi3.Content) {
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
}

// isContentTypeHiddenForEnv returns true if the content type is hidden for the target environment.
func isContentTypeHiddenForEnv(contentType *openapi3.MediaType, targetEnv string) bool {
	if contentType == nil {
		return false
	}

	if extension, ok := contentType.Extensions[hiddenEnvsExtension]; ok {
		log.Printf("Found x-hidden-envs: K: %q, V: %q", hiddenEnvsExtension, extension)
		return isHiddenExtensionEqualToTargetEnv(extension, targetEnv)
	}

	return false
}

// getVersionsInContentType returns a list of versions and a map of versions to content types.
func getVersionsInContentType(content map[string]*openapi3.MediaType) (
	versions []*apiversion.APIVersion, contentsInVersion map[string]*openapi3.MediaType) {
	contentsInVersion = make(map[string]*openapi3.MediaType)
	versionsInContentType := make(map[string]*apiversion.APIVersion)

	for contentType, contentValue := range content {
		v, err := apiversion.New(apiversion.WithFullContent(contentType, contentValue))
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

func updateExtensionToDateString(extensions map[string]any) {
	if extensions == nil {
		return
	}

	for k, v := range extensions {
		if k != sunsetExtension && k != xGenExtension {
			continue
		}
		date, err := time.Parse(format, v.(string))
		if err != nil {
			continue
		}
		extensions[k] = date.Format("2006-01-02")
	}
}

func updateToDateString(content openapi3.Content) {
	for _, mediaType := range content {
		if mediaType.Extensions == nil {
			continue
		}

		updateExtensionToDateString(mediaType.Extensions)
	}
}
