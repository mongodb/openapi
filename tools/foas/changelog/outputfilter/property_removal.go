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
package outputfilter

import (
	"regexp"
	"strings"
)

// oasdiff v1.35.0 reports removal of deprecated properties with dedicated check IDs.
// Without an x-sunset date those checks are INFO, while Atlas treats every property
// removal as breaking. Existing exemptions and squash handlers also key on the legacy
// IDs and wording, so fold the new checks back into the legacy removals before
// exemptions and squashing are applied.
var propertyRemovalAliases = map[string]string{
	"request-property-removed-with-deprecation":           "request-property-removed",
	"request-property-removed-before-sunset":              "request-property-removed",
	"response-required-property-removed-with-deprecation": "response-required-property-removed",
	"response-required-property-removed-before-sunset":    "response-required-property-removed",
}

var beforeSunsetDateSuffix = regexp.MustCompile(" before the sunset date `[^`]*`")

func normalizePropertyRemovals(entries []*OasDiffEntry) {
	for _, entry := range entries {
		legacyID, ok := propertyRemovalAliases[entry.ID]
		if !ok {
			continue
		}

		entry.ID = legacyID
		entry.Text = strings.Replace(entry.Text, " the deprecated ", " the ", 1)
		entry.Text = beforeSunsetDateSuffix.ReplaceAllString(entry.Text, "")
	}
}
