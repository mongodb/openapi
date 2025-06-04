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
	"time"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/mongodb/openapi/tools/cli/internal/apiversion"
)

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

func (f *CodeSampleFilter) newDigestCurlCodeSamplesForOperation(pathName, opMethod string) codeSample {
	version := apiVersion(f.metadata.targetVersion)
	source := "curl --user \"${PUBLIC_KEY}:${PRIVATE_KEY}\" \\\n  --digest \\\n  " +
		"--header \"Accept: application/vnd.atlas." + version + "+json\" \\\n  "

	switch opMethod {
	case "GET":
		source += "-X " + opMethod + " \"https://cloud.mongodb.com" + pathName + "?pretty=true\""
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

func (f *CodeSampleFilter) newServiceAccountCurlCodeSamplesForOperation(pathName, opMethod string) codeSample {
	version := apiVersion(f.metadata.targetVersion)
	source := "curl --header \"Authorization: Bearer ${ACCESS_TOKEN}\" \\\n  " +
		"--header \"Accept: application/vnd.atlas." + version + "+json\" \\\n  "

	switch opMethod {
	case "GET":
		source += "-X " + opMethod + " \"https://cloud.mongodb.com" + pathName + "?pretty=true\""
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
	return codeSample{
		Lang:   "cURL",
		Label:  "Atlas CLI",
		Source: "atlas api " + op.OperationID + " --help",
	}
}

func (f *CodeSampleFilter) includeCodeSamplesForOperation(pathName, opMethod string, op *openapi3.Operation) error {
	if op == nil || opMethod == "" || pathName == "" {
		return nil
	}

	if op.Extensions == nil {
		op.Extensions = map[string]any{}
	}

	op.Extensions[codeSampleExtensionName] = []codeSample{
		newAtlasCliCodeSamplesForOperation(op),
		f.newServiceAccountCurlCodeSamplesForOperation(pathName, opMethod),
		f.newDigestCurlCodeSamplesForOperation(pathName, opMethod),
	}
	return nil
}
