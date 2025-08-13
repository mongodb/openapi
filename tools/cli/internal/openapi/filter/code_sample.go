// Copyright 2025 MongoDB Inc
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
	"bytes"
	_ "embed"
	"fmt"
	goFormat "go/format"
	"strings"
	"text/template"
	"time"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/iancoleman/strcase"
	"github.com/mongodb/openapi/tools/cli/internal/apiversion"
	"golang.org/x/text/cases"
	"golang.org/x/text/language"
)

//go:embed template/go_sdk_code_sample.go.tmpl
var goSDKTemplate string

const codeSampleExtensionName = "x-codeSamples"

// https://redocly.com/docs-legacy/api-reference-docs/specification-extensions/x-code-samples#x-codesamples
type codeSample struct {
	Lang   string `json:"lang,omitempty" yaml:"lang,omitempty"`
	Label  string `json:"label,omitempty" yaml:"label,omitempty"`
	Source string `json:"source,omitempty" yaml:"source,omitempty"`
}

// CodeSampleFilter modifies includes the fields "x-state" and "x-beta" to the "preview" and "upcoming" APIs Operations.
// The "x-state" and "x-beta" fields are bump.sh custom fields to include budges
// Bump.sh feature: https://docs.bump.sh/help/specification-support/doc-code-samples/#example-usage
type CodeSampleFilter struct {
	oas      *openapi3.T
	metadata *Metadata
}

func (f *CodeSampleFilter) ValidateMetadata() error {
	return validateMetadataWithVersion(f.metadata)
}

func (f *CodeSampleFilter) Apply() error {
	for pathName, p := range f.oas.Paths.Map() {
		for opMethod, op := range p.Operations() {
			if err := f.includeCodeSamplesForOperation(pathName, opMethod, op); err != nil {
				return err
			}
		}
	}

	return nil
}

func getFileExtension(format string) string {
	switch format {
	case "gzip":
		return "gz"
	default:
		return format
	}
}

func (f *CodeSampleFilter) newDigestCurlCodeSamplesForOperation(pathName, opMethod, format string) codeSample {
	version := apiVersion(f.metadata.targetVersion)
	source := "curl --user \"${PUBLIC_KEY}:${PRIVATE_KEY}\" \\\n  --digest \\\n  " +
		"--header \"Accept: application/vnd.atlas." + version + "+" + format + "\" \\\n  "

	switch opMethod {
	case "GET":
		source += "-X " + opMethod + " \"https://cloud.mongodb.com" + pathName
		if format == "gzip" {
			source += "\" \\\n  "
			source += "--output \"file_name." + getFileExtension(format) + "\""
		} else {
			source += "?pretty=true\""
		}

	case "DELETE":
		source += "-X " + opMethod + " \"https://cloud.mongodb.com" + pathName + "\""
	case "POST", "PATCH", "PUT":
		source += "--header \"Content-Type: application/json\" \\\n  "
		source += "-X " + opMethod + " \"https://cloud.mongodb.com" + pathName + "\" \\\n  "
		source += "-d " + "'{ <Payload> }'"
	}

	return codeSample{
		Lang:   "cURL",
		Label:  "curl (Digest)",
		Source: source,
	}
}

func (f *CodeSampleFilter) newServiceAccountCurlCodeSamplesForOperation(pathName, opMethod, format string) codeSample {
	version := apiVersion(f.metadata.targetVersion)
	source := "curl --header \"Authorization: Bearer ${ACCESS_TOKEN}\" \\\n  " +
		"--header \"Accept: application/vnd.atlas." + version + "+" + format + "\" \\\n  "

	switch opMethod {
	case "GET":
		source += "-X " + opMethod + " \"https://cloud.mongodb.com" + pathName
		if format == "gzip" {
			source += "\" \\\n  "
			source += "--output \"file_name." + getFileExtension(format) + "\""
		} else {
			source += "?pretty=true\""
		}
	case "DELETE":
		source += "-X " + opMethod + " \"https://cloud.mongodb.com" + pathName + "\""
	case "POST", "PATCH", "PUT":
		source += "--header \"Content-Type: application/json\" \\\n  "
		source += "-X " + opMethod + " \"https://cloud.mongodb.com" + pathName + "\" \\\n  "
		source += "-d " + "'{ <Payload> }'"
	}

	return codeSample{
		Lang:   "cURL",
		Label:  "curl (Service Accounts)",
		Source: source,
	}
}

func apiVersion(version *apiversion.APIVersion) string {
	if version.IsStable() {
		return version.Date().Format(time.DateOnly)
	}

	if version.IsPreview() {
		return "preview"
	}

	// Upcoming api version
	return version.Date().Format(time.DateOnly) + ".upcoming"
}

func newAtlasCliCodeSamplesForOperation(op *openapi3.Operation) codeSample {
	tag := strcase.ToLowerCamel(op.Tags[0])
	operationID := strcase.ToLowerCamel(op.OperationID)
	return codeSample{
		Lang:   "cURL",
		Label:  "Atlas CLI",
		Source: "atlas api " + tag + " " + operationID + " --help",
	}
}

func (f *CodeSampleFilter) newGoSdkCodeSamplesForOperation(op *openapi3.Operation, opMethod string) (*codeSample, error) {
	version := strings.ReplaceAll(apiVersion(f.metadata.targetVersion), "-", "") + "001"
	operationID := cases.Title(language.English, cases.NoLower).String(op.OperationID)
	tag := strings.ReplaceAll(op.Tags[0], " ", "")
	tag = strings.ReplaceAll(tag, ".", "")
	t, err := template.New("goSDK").Parse(goSDKTemplate)
	if err != nil {
		return nil, err
	}

	var buffer bytes.Buffer
	err = t.Execute(&buffer, struct {
		Tag         string
		OperationID string
		Version     string
		Method      string
	}{
		Tag:         tag,
		OperationID: operationID,
		Version:     version,
		Method:      opMethod,
	})

	if err != nil {
		return nil, err
	}

	formattedResult, err := goFormat.Source(buffer.Bytes())
	if err != nil {
		return nil, fmt.Errorf("tag: %q, operationId: %q code: %q: error: %w",
			op.Tags[0], operationID, buffer.String(), err)
	}

	return &codeSample{
		Lang:   "go",
		Label:  "Go",
		Source: string(formattedResult),
	}, nil
}

func (f *CodeSampleFilter) includeCodeSamplesForOperation(pathName, opMethod string, op *openapi3.Operation) error {
	if op == nil || opMethod == "" || pathName == "" {
		return nil
	}

	if op.Extensions == nil {
		op.Extensions = map[string]any{}
	}

	codeSamples := []codeSample{
		newAtlasCliCodeSamplesForOperation(op),
	}

	if f.metadata.targetVersion.IsStable() {
		sdkSample, err := f.newGoSdkCodeSamplesForOperation(op, opMethod)
		if err != nil {
			return err
		}
		codeSamples = append(codeSamples, *sdkSample)
	}

	supportedFormat := getSupportedFormat(op)
	codeSamples = append(
		codeSamples,
		f.newServiceAccountCurlCodeSamplesForOperation(pathName, opMethod, supportedFormat),
		f.newDigestCurlCodeSamplesForOperation(pathName, opMethod, supportedFormat))
	op.Extensions[codeSampleExtensionName] = codeSamples
	return nil
}

// getSupportedFormat inspects the response content types of a given OpenAPI operation,
// looking for a content type string in the format "application/vnd.atlas.<api_version>+<supported_format>".
// It splits the content type on the '+' character and returns the last part, which represents the supported format (e.g., "json").
// If no such content type is found, it defaults to returning "json".
func getSupportedFormat(op *openapi3.Operation) string {
	responseMap := successResponseExtensions(op.Responses.Map())
	format := "json"
	for k := range responseMap {
		// k is a string with the format "application/vnd.atlas.<api_version>+<supported_format>"
		parts := strings.Split(k, "+")
		if len(parts) == 0 {
			continue
		}

		format = parts[len(parts)-1]
		// If the endpoint supports "json", we return it as "json" is the best supported format in our APIs
		// and users should use it when available.
		if format == "json" {
			return format
		}
	}

	return format
}

// successResponseExtensions returns the Content object of the first successful HTTP response (status 200, 201, 202, or 204)
// found in the provided responses map.
func successResponseExtensions(responsesMap map[string]*openapi3.ResponseRef) openapi3.Content {
	if val, ok := responsesMap["200"]; ok {
		return val.Value.Content
	}
	if val, ok := responsesMap["201"]; ok {
		return val.Value.Content
	}
	if val, ok := responsesMap["202"]; ok {
		return val.Value.Content
	}
	if val, ok := responsesMap["204"]; ok {
		return val.Value.Content
	}

	return nil
}
