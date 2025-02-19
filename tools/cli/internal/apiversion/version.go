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

package apiversion

import (
	"errors"
	"fmt"
	"log"
	"regexp"
	"strings"
	"time"

	"github.com/getkin/kin-openapi/openapi3"
)

type APIVersion struct {
	version          string
	stabilityVersion string
	versionDate      time.Time
}

const (
	dateFormat                   = "2006-01-02"
	StableStabilityLevel         = "stable"
	PreviewStabilityLevel        = "preview"
	PrivatePreviewStabilityLevel = "private-preview"
)

var contentPattern = regexp.MustCompile(`application/vnd\.atlas\.((\d{4})-(\d{2})-(\d{2})|preview)\+(.+)`)

// Option is a function that sets a value on the APIVersion.
type Option func(v *APIVersion) error

// New creates a new API version.
func New(opts ...Option) (*APIVersion, error) {
	version := &APIVersion{}
	for _, opt := range opts {
		if err := opt(version); err != nil {
			return nil, err
		}
	}
	return version, nil
}

func (v *APIVersion) newVersion(version string, date time.Time) {
	v.version = version
	v.stabilityVersion = StableStabilityLevel
	v.versionDate = date

	if IsPreviewSabilityLevel(version) {
		v.versionDate = time.Now().AddDate(10, 0, 0) // set preview date to the future
		v.stabilityVersion = PreviewStabilityLevel
	}
}

// WithVersion sets the version on the APIVersion.
func WithVersion(version string) Option {
	return func(v *APIVersion) error {
		versionDate, err := DateFromVersion(version)
		if err != nil {
			return err
		}

		v.newVersion(version, versionDate)
		return nil
	}
}

// WithDate sets the version on the APIVersion.
func WithDate(date time.Time) Option {
	return func(v *APIVersion) error {
		v.newVersion(date.Format(dateFormat), date)
		return nil
	}
}

// withContent returns an Option to generate a new APIVersion given the contentType.
func withContent(contentType string) Option {
	return func(v *APIVersion) error {
		version, err := Parse(contentType)
		if err != nil {
			return err
		}

		versionDate, err := DateFromVersion(version)
		if err != nil {
			return err
		}

		v.newVersion(version, versionDate)
		return nil
	}
}

// WithFullContent returns an Option to generate a new APIVersion given the contentType and contentValue.
func WithFullContent(contentType string, contentValue *openapi3.MediaType) Option {
	return func(v *APIVersion) error {
		if !IsPreviewSabilityLevel(contentType) {
			return withContent(contentType)(v)
		}

		name, err := GetPreviewVersionName(contentValue)
		if err != nil {
			return err
		}
		// version will be based on the name, either 'preview' or 'private-preview-<name>'
		return WithVersion(name)(v)
	}
}

func DateFromVersion(version string) (time.Time, error) {
	if IsPreviewSabilityLevel(version) {
		return time.Now(), nil
	}
	return time.Parse(dateFormat, version)
}

func (v *APIVersion) Equal(v2 *APIVersion) bool {
	return strings.EqualFold(v.version, v2.version)
}

func (v *APIVersion) GreaterThan(v2 *APIVersion) bool {
	return v.versionDate.After(v2.versionDate)
}

func (v *APIVersion) LessThan(v2 *APIVersion) bool {
	return v.versionDate.Before(v2.versionDate)
}

func (v *APIVersion) IsZero() bool {
	if v == nil {
		return true
	}

	return v.versionDate.IsZero()
}

func (v *APIVersion) String() string {
	return v.version
}

func (v *APIVersion) Date() time.Time {
	return v.versionDate
}

func (v *APIVersion) StabilityLevel() string {
	return v.stabilityVersion
}

func (v *APIVersion) ExactMatchOnly() bool {
	return v.IsPreview()
}

func (v *APIVersion) IsPreview() bool {
	return IsPreviewSabilityLevel(v.version)
}

func (v *APIVersion) IsPrivatePreview() bool {
	return strings.Contains(v.version, PrivatePreviewStabilityLevel)
}

func (v *APIVersion) IsPublicPreview() bool {
	return v.IsPreview() && !v.IsPrivatePreview()
}

func IsPreviewSabilityLevel(value string) bool {
	// we also need string match given private preview versions like "private-preview-<name>"
	return strings.EqualFold(value, PreviewStabilityLevel) || strings.Contains(value, PreviewStabilityLevel)
}

func IsStableSabilityLevel(value string) bool {
	return strings.EqualFold(value, StableStabilityLevel)
}

func FindMatchesFromContentType(contentType string) []string {
	return contentPattern.FindStringSubmatch(contentType)
}

func ReplaceContentType(contentType, replacement string) string {
	return contentPattern.ReplaceAllString(contentType, replacement)
}

// Parse extracts the version date from the content type.
func Parse(contentType string) (string, error) {
	matches := contentPattern.FindStringSubmatch(contentType)
	if matches == nil {
		return "", fmt.Errorf("invalid content type: %s", contentType)
	}

	if len(matches) == 3 {
		return fmt.Sprintf("%s-%s-%s", matches[2], matches[3], matches[4]), nil
	}

	return matches[1], nil
}

// FindLatestContentVersionMatched finds the latest content version that matches the requested version.
func FindLatestContentVersionMatched(op *openapi3.Operation, requestedVersion *APIVersion) *APIVersion {
	/*
		  given:
			 version: 2024-01-01
			 op response:
			   "200":
				  content: application/vnd.atlas.2023-01-01+json
				  content: application/vnd.atlas.preview+json
			   "201":
				  content: application/vnd.atlas.2023-12-01+json
				  content: application/vnd.atlas.2025-01-01+json
		  should return latestVersionMatch=2023-12-01
	*/
	var latestVersionMatch *APIVersion
	if op.Responses == nil {
		return requestedVersion
	}

	for _, response := range op.Responses.Map() {
		if response.Value == nil || response.Value.Content == nil {
			continue
		}

		for contentType, contentValue := range response.Value.Content {
			contentVersion, err := New(WithFullContent(contentType, contentValue))
			if err != nil {
				log.Printf("Ignoring invalid content type: %q", contentType)
				continue
			}

			if contentVersion.Equal(requestedVersion) {
				return contentVersion
			}

			if requestedVersion.ExactMatchOnly() {
				// for private preview, we will need to match with "preview" and x-xgen-preview name extension
				if privatePreviewContentMatch(contentVersion, contentValue, requestedVersion) {
					return contentVersion
				}
				continue
			}

			if contentVersion.GreaterThan(requestedVersion) {
				continue
			}

			if latestVersionMatch == nil || contentVersion.GreaterThan(latestVersionMatch) {
				latestVersionMatch = contentVersion
			}
		}
	}

	if latestVersionMatch == nil {
		return requestedVersion
	}

	return latestVersionMatch
}

func privatePreviewContentMatch(contentVersion *APIVersion, contentValue *openapi3.MediaType, requestedVersion *APIVersion) bool {
	log.Printf("trying to match in case one of the versions is private preview")
	if !contentVersion.IsPrivatePreview() && !requestedVersion.IsPrivatePreview() {
		return false
	}

	name, err := GetPreviewVersionName(contentValue)
	if err != nil {
		log.Printf("failed to parse preview version name for content=%v err=%v", contentVersion.version, err)
		return false
	}

	return strings.EqualFold(name, requestedVersion.version)
}

// Sort versions.
func Sort(versions []*APIVersion) {
	for i := 0; i < len(versions); i++ {
		for j := i + 1; j < len(versions); j++ {
			if versions[i].LessThan(versions[j]) {
				versions[i], versions[j] = versions[j], versions[i]
			}
		}
	}
}

// GetPreviewVersionName returns the preview version name.
func GetPreviewVersionName(contentTypeValue *openapi3.MediaType) (name string, err error) {
	public, name, err := parsePreviewExtensionData(contentTypeValue)
	if err != nil {
		return "", err
	}

	if public {
		return "preview", nil
	}

	if !public && name != "" {
		return "private-preview-" + name, nil
	}

	return "", errors.New("no preview extension found")
}

func parsePreviewExtensionData(contentTypeValue *openapi3.MediaType) (public bool, name string, err error) {
	// Expected formats:
	//
	//   "x-xgen-preview": {
	// 		"name": "api-registry-private-preview"
	//   }
	//
	//   "x-xgen-preview": {
	// 		"public": "true"
	//   }

	name = ""
	public = false

	if contentTypeValue.Extensions == nil {
		return false, "", errors.New("no preview extension found")
	}

	previewExtension, ok := contentTypeValue.Extensions["x-xgen-preview"]
	if !ok {
		return false, "", errors.New("no preview extension found")
	}

	previewExtensionMap, ok := previewExtension.(map[string]any)
	if !ok {
		return false, "", errors.New("no preview extension found")
	}

	// Reading if it's public or not
	publicV, ok := previewExtensionMap["public"].(string)
	if ok {
		public = strings.EqualFold(publicV, "true")
	}

	// Reading the name
	nameV, ok := previewExtensionMap["name"].(string)
	if ok {
		name = nameV
	}

	if err := validatePreviewExtensionData(name, publicV); err != nil {
		return false, "", err
	}

	return public, name, nil
}

func validatePreviewExtensionData(name, public string) error {
	if name != "" && (public == "true") {
		return errors.New("both name and public = true fields are set, only one is allowed")
	}

	if name == "" && public != "" && public != "true" && public != "false" {
		return errors.New("invalid value for 'public' field, only 'true' or 'false' are allowed")
	}

	return nil
}
