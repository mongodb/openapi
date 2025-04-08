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

package apiversion

import (
	"fmt"
	"strings"
)

const (
	StableStabilityLevel         = "stable"
	PreviewStabilityLevel        = "preview"
	UpcomingStabilityLevel       = "upcoming"
	PrivatePreviewStabilityLevel = "private-preview"
	PublicPreviewStabilityLevel  = "public-preview"
)

var supportedValues = []string{StableStabilityLevel, PublicPreviewStabilityLevel, PrivatePreviewStabilityLevel}

// IsPreviewStabilityLevel checks if the version is a preview version, public or private.
func IsPreviewStabilityLevel(value string) bool {
	lowerCaseValue := strings.ToLower(value)
	return IsPrivatePreviewStabilityLevel(lowerCaseValue) || IsPublicPreviewStabilityLevel(lowerCaseValue)
}

// IsPrivatePreviewStabilityLevel checks if the version is a private preview version.
func IsPrivatePreviewStabilityLevel(value string) bool {
	return strings.Contains(strings.ToLower(value), PrivatePreviewStabilityLevel)
}

// IsPublicPreviewStabilityLevel checks if the version is a public preview version.
func IsPublicPreviewStabilityLevel(value string) bool {
	lowerCaseValue := strings.ToLower(value)
	return strings.EqualFold(lowerCaseValue, PublicPreviewStabilityLevel) || strings.EqualFold(lowerCaseValue, PreviewStabilityLevel)
}

// IsStableStabilityLevel checks if the version is a stable version.
func IsStableStabilityLevel(value string) bool {
	return strings.EqualFold(strings.ToLower(value), StableStabilityLevel)
}

// IsUpcomingStabilityLevel checks if the version is an "upcoming" version.
func IsUpcomingStabilityLevel(value string) bool {
	return strings.Contains(strings.ToLower(value), UpcomingStabilityLevel)
}

// ValidateStabilityLevel checks if the version is a valid stability level.
func ValidateStabilityLevel(value string) error {
	lowerCaseValue := strings.ToLower(value)
	if IsStableStabilityLevel(lowerCaseValue) || IsPreviewStabilityLevel(lowerCaseValue) {
		return nil
	}

	return fmt.Errorf("invalid stability level value must be in %q, got %q", supportedValues, value)
}
