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

func (f *SunsetFilter) Apply() error {
	for _, pathItem := range f.oas.Paths.Map() {
		if pathItem == nil {
			continue
		}

		for _, operation := range pathItem.Operations() {
			if operation == nil {
				continue
			}

			for _, response := range operation.Responses.Map() {
				if response.Value == nil || response.Value.Content == nil {
					continue
				}

				storeDeprecatedVersions(&OperationConfig{
					latestMatchedVersion: f.metadata.targetVersion,
				}, response)
			}
		}

	}
	return nil
}

// storeDeprecatedVersions stores the deprecated versions for a given response
func storeDeprecatedVersions(opConfig *OperationConfig, response *openapi3.ResponseRef) {
	versions, contentTypeToVersion := getVersionsInContentType(response.Value.Content)

	deprecatedVersions := make([]*apiversion.APIVersion, 0)

	for _, v := range versions {
		if v.LessThan(opConfig.latestMatchedVersion) {
			deprecatedVersions = append(deprecatedVersions, v)
		}
		if v.GreaterThan(opConfig.latestMatchedVersion) {
			if v, ok := contentTypeToVersion[v.String()]; ok {
				f := &HiddenEnvsFilter{
					metadata: &Metadata{
						targetVersion: opConfig.latestMatchedVersion,
						targetEnv:     "dev",
					},
				}
				// its not deprecated by version
				if f.isContentTypeHiddenForEnv(v) {
					//delete x sunset
					delete(v.Extensions, "x-sunset")
					continue
				}
			}
		}
	}

	opConfig.deprecatedVersions = append(opConfig.deprecatedVersions, deprecatedVersions...)
}

func getVersionsInContentType(content map[string]*openapi3.MediaType) ([]*apiversion.APIVersion, map[string]*openapi3.MediaType) {
	contentsInVersion := make(map[string]*openapi3.MediaType)
	versionsInContentType := make(map[string]*apiversion.APIVersion)

	for contentType := range content {
		v, err := apiversion.New(apiversion.WithContent(contentType))
		if err != nil {
			log.Printf("Ignoring invalid content type: %s", contentType)
			continue
		}

		versionsInContentType[v.String()] = v
		contentsInVersion[v.String()] = content[contentType]
	}

	versions := make([]*apiversion.APIVersion, 0)
	for _, v := range versionsInContentType {
		versions = append(versions, v)
	}
	return versions, contentsInVersion
}
