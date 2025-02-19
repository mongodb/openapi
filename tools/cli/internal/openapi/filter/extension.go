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

// Filter: ExtensionFilter is a filter that updates the x-sunset and x-xgen-version extensions to a date string
// and deletes the x-sunset extension if the latest matched version is deprecated by hidden versions
// for the target environment.
type ExtensionFilter struct {
	oas      *openapi3.T
	metadata *Metadata
}

const (
	sunsetExtension       = "x-sunset"
	xGenExtension         = "x-xgen-version"
	ipaExceptionExtension = "x-xgen-IPA-exception"
	format                = "2006-01-02T15:04:05Z07:00"
)

func (f *ExtensionFilter) Apply() error {
	for _, pathItem := range f.oas.Paths.Map() {
		if pathItem == nil {
			continue
		}
		updateExtensionToDateString(pathItem.Extensions)
		deleteIpaExceptionExtension(pathItem.Extensions)

		for _, operation := range pathItem.Operations() {
			if operation == nil {
				continue
			}

			updateExtensionToDateString(operation.Extensions)
			deleteIpaExceptionExtension(operation.Extensions)

			if operation.Parameters != nil {
				updateExtensionsForOperationParameters(operation.Parameters)
			}

			updateExtensionsForRequestBody(operation.RequestBody)

			latestVersionMatch := apiversion.FindLatestContentVersionMatched(operation, f.metadata.targetVersion)

			for _, response := range operation.Responses.Map() {
				if response == nil {
					continue
				}

				updateExtensionToDateString(response.Extensions)
				deleteIpaExceptionExtension(response.Extensions)

				if response.Value == nil {
					continue
				}

				updateExtensionToDateString(response.Value.Extensions)
				deleteIpaExceptionExtension(response.Value.Extensions)

				if response.Value.Content == nil {
					continue
				}

				f.deleteSunsetIfDeprecatedByHiddenVersions(latestVersionMatch, response.Value.Content)
				updateToDateString(response.Value.Content)
			}

			request := operation.RequestBody
			if request == nil || request.Value == nil || request.Value.Content == nil {
				continue
			}
			updateToDateString(request.Value.Content)
			f.deleteSunsetIfDeprecatedByHiddenVersions(latestVersionMatch, request.Value.Content)
		}
	}
	if f.oas.Tags != nil {
		updateExtensionsForTags(&f.oas.Tags)
	}
	if f.oas.Components != nil {
		updateExtensionsForComponents(f.oas.Components)
	}
	return nil
}

func updateExtensionsForRequestBody(requestBody *openapi3.RequestBodyRef) {
	if requestBody == nil {
		return
	}
	deleteIpaExceptionExtension(requestBody.Extensions)
	_, contentsInVersion := getVersionsInContentType(requestBody.Value.Content)
	for _, content := range contentsInVersion {
		deleteIpaExceptionExtension(content.Extensions)
		updateExtensionsForSchema(content.Schema)
	}
}

func updateExtensionsForOperationParameters(parameters openapi3.Parameters) {
	for _, parameter := range parameters {
		if parameter.Value == nil || parameter.Value.Schema == nil {
			continue
		}
		deleteIpaExceptionExtension(parameter.Value.Schema.Extensions)
		if parameter.Value.Schema.Value == nil {
			continue
		}
		deleteIpaExceptionExtension(parameter.Value.Schema.Value.Extensions)
	}
}

func updateExtensionsForComponents(components *openapi3.Components) {
	for _, schema := range components.Schemas {
		updateExtensionsForSchema(schema)
	}
	for _, parameter := range components.Parameters {
		if parameter != nil {
			deleteIpaExceptionExtension(parameter.Extensions)
		}
	}
}

func updateExtensionsForTags(tags *openapi3.Tags) {
	for _, tag := range *tags {
		if tag != nil {
			deleteIpaExceptionExtension(tag.Extensions)
		}
	}
}

func updateExtensionsForSchema(schema *openapi3.SchemaRef) {
	if schema != nil {
		deleteIpaExceptionExtension(schema.Extensions)
	}
	if schema.Value != nil {
		deleteIpaExceptionExtension(schema.Value.Extensions)
		for _, allOf := range schema.Value.AllOf {
			if allOf.Value == nil {
				continue
			}
			for _, property := range allOf.Value.Properties {
				if property.Value != nil {
					deleteIpaExceptionExtension(property.Value.Extensions)
				}
			}
		}
		for _, anyOf := range schema.Value.AnyOf {
			if anyOf.Value == nil {
				continue
			}
			for _, property := range anyOf.Value.Properties {
				if property.Value != nil {
					deleteIpaExceptionExtension(property.Value.Extensions)
				}
			}
		}
		for _, oneOf := range schema.Value.OneOf {
			if oneOf.Value == nil {
				continue
			}
			for _, property := range oneOf.Value.Properties {
				if property.Value != nil {
					deleteIpaExceptionExtension(property.Value.Extensions)
				}
			}
		}
		for _, property := range schema.Value.Properties {
			if property.Value != nil {
				deleteIpaExceptionExtension(property.Value.Extensions)
			}
		}
	}
}

func deleteIpaExceptionExtension(extensions map[string]any) {
	if extensions == nil || extensions[ipaExceptionExtension] == nil {
		return
	}

	delete(extensions, ipaExceptionExtension)
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

// deleteSunsetIfDeprecatedByHiddenVersions deletes the sunset extension if the latest matched version is deprecated by hidden versions.
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
