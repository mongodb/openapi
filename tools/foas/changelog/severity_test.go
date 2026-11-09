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
package changelog

import (
	"testing"

	"github.com/oasdiff/oasdiff/checker"
	"github.com/stretchr/testify/require"
)

func TestDeprecatedPropertyRemovalsAreBreaking(t *testing.T) {
	knownChecks := checker.GetCheckLevels()
	removalCheckIDs := []string{
		"request-property-removed",
		"request-property-removed-with-deprecation",
		"request-property-removed-before-sunset",
		"response-required-property-removed-with-deprecation",
		"response-required-property-removed-before-sunset",
	}

	for _, id := range removalCheckIDs {
		t.Run(id, func(t *testing.T) {
			_, ok := knownChecks[id]
			require.True(t, ok, "oasdiff no longer defines check %q", id)

			require.Equal(t, checker.ERR, breakingChangesAdditionalCheckers[id])
		})
	}
}

// TestInheritedPropertyRemovalLevel pins the checks that are deliberately absent
// from the override map because oasdiff already reports them as errors. Failing
// here means an upstream re-level would silently un-break a property removal.
func TestInheritedPropertyRemovalLevel(t *testing.T) {
	levels := checker.GetCheckLevels()

	for _, id := range []string{"response-required-property-removed"} {
		t.Run(id, func(t *testing.T) {
			require.Equal(t, checker.ERR, levels[id])
			require.NotContains(t, breakingChangesAdditionalCheckers, id)
		})
	}
}
