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
	"github.com/oasdiff/oasdiff/checker"
)

// oasdiff v1.35.0 reports removal of deprecated request properties and required
// response properties with dedicated check IDs and renders that in the message.
// Atlas treats every property removal as breaking, and existing exemptions and
// squash handlers key on the legacy IDs, so map the new checks back to the
// legacy ones before rendering. oasdiff then produces the legacy message from
// its own template and the changelog output stays as it was before the bump.
type propertyRemovalAlias struct {
	legacyID string
	// before-sunset findings carry the sunset date as a trailing argument that
	// the legacy message does not have. Property sunsets are hidden from the
	// diff by openapi.stripPropertySunsets, so this is only a safety net.
	dropSunsetArg bool
}

var propertyRemovalAliases = map[string]propertyRemovalAlias{
	"request-property-removed-with-deprecation":           {legacyID: "request-property-removed"},
	"request-property-removed-before-sunset":              {legacyID: "request-property-removed", dropSunsetArg: true},
	"response-required-property-removed-with-deprecation": {legacyID: "response-required-property-removed"},
	"response-required-property-removed-before-sunset":    {legacyID: "response-required-property-removed", dropSunsetArg: true},
}

// normalizePropertyRemovals rewrites the new property removal checks to the IDs
// used before oasdiff v1.35.0. The change arguments are kept, except for the
// trailing sunset date of the before-sunset variants, so the rendered message
// is the one the legacy check produced.
func normalizePropertyRemovals(changes checker.Changes) checker.Changes {
	for i, change := range changes {
		apiChange, ok := change.(checker.ApiChange)
		if !ok {
			continue
		}

		alias, ok := propertyRemovalAliases[apiChange.Id]
		if !ok {
			continue
		}

		if alias.dropSunsetArg {
			if len(apiChange.Args) == 0 {
				continue
			}
			apiChange.Args = apiChange.Args[:len(apiChange.Args)-1]
		}

		apiChange.Id = alias.legacyID
		changes[i] = apiChange
	}

	return changes
}
