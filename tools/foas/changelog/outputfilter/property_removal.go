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

// oasdiff v1.35.0 reports deprecated property removals with new check IDs.
// Exemptions and squash handlers key on the legacy IDs, so map them back before
// rendering and let oasdiff build the legacy message from its own template.
type propertyRemovalAlias struct {
	legacyID string
	// dropSunsetArg removes the trailing sunset date that only the
	// before-sunset variant carries.
	dropSunsetArg bool
}

var propertyRemovalAliases = map[string]propertyRemovalAlias{
	"request-property-removed-with-deprecation":           {legacyID: "request-property-removed"},
	"request-property-removed-before-sunset":              {legacyID: "request-property-removed", dropSunsetArg: true},
	"response-required-property-removed-with-deprecation": {legacyID: "response-required-property-removed"},
	"response-required-property-removed-before-sunset":    {legacyID: "response-required-property-removed", dropSunsetArg: true},
}

// normalizePropertyRemovals maps the v1.35.0 property removal checks back to
// their legacy IDs.
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
