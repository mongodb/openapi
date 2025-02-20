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
	PrivatePreviewStabilityLevel = "private-preview"
	PublicPreviewSabilityLevel   = "public-preview"
)

var supportedValues = []string{StableStabilityLevel, PublicPreviewSabilityLevel, PrivatePreviewStabilityLevel}

// IsPreviewSabilityLevel checks if the version is a preview version, public or private.
func IsPreviewSabilityLevel(value string) bool {
	return IsPrivatePreviewSabilityLevel(value) || IsPublicPreviewSabilityLevel(value)
}

// IsPrivatePreviewSabilityLevel checks if the version is a private preview version.
func IsPrivatePreviewSabilityLevel(value string) bool {
	return strings.Contains(strings.ToLower(value), PrivatePreviewStabilityLevel)
}

// IsPublicPreviewSabilityLevel checks if the version is a public preview version.
func IsPublicPreviewSabilityLevel(value string) bool {
	return strings.EqualFold(value, PublicPreviewSabilityLevel) || strings.EqualFold(value, PreviewStabilityLevel)
}

// IsStableSabilityLevel checks if the version is a stable version.
func IsStableSabilityLevel(value string) bool {
	return strings.EqualFold(value, StableStabilityLevel)
}

// IsValidStabilityLevel checks if the version is a valid stability level.
func ValidateStabilityLevel(value string) error {
	if IsStableSabilityLevel(value) || IsPreviewSabilityLevel(value) {
		return nil
	}

	return fmt.Errorf("invalid stability level value must be in %q, got %q", supportedValues, value)
}
