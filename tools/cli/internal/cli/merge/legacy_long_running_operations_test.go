// Copyright 2026 MongoDB Inc
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package merge

import (
	"os"
	"regexp"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// TestLegacyLongRunningOperationIDs_MatchSharedList pins the generated Go map to the shared
// JavaScript module the IPA-132 validation rules import. On failure, run go generate ./... in
// tools/cli.
func TestLegacyLongRunningOperationIDs_MatchSharedList(t *testing.T) {
	data, err := os.ReadFile("../../../../spectral/ipa/rulesets/functions/utils/legacyLroOperationIds.js")
	require.NoError(t, err)

	matches := regexp.MustCompile(`'([a-zA-Z0-9]+)',`).FindAllStringSubmatch(string(data), -1)
	require.NotEmpty(t, matches, "no operationIds found in the shared list")

	assert.Len(t, legacyLongRunningOperationIDs, len(matches),
		"the generated map and the shared list differ in size; run go generate ./... in tools/cli")
	for _, match := range matches {
		assert.Contains(t, legacyLongRunningOperationIDs, match[1],
			"missing from the generated map; run go generate ./... in tools/cli")
	}
}
