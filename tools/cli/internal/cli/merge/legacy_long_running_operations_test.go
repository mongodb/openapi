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
	"encoding/json"
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// TestLegacyLongRunningOperationIDs_MatchSharedList pins the generated Go map to the shared
// list the IPA-132 validation rules consume. On failure, run go generate ./... in tools/cli.
func TestLegacyLongRunningOperationIDs_MatchSharedList(t *testing.T) {
	data, err := os.ReadFile("../../../../spectral/ipa/rulesets/functions/utils/legacyLongRunningOperations.json")
	require.NoError(t, err)

	var list struct {
		OperationIDs []string `json:"operationIds"`
	}
	require.NoError(t, json.Unmarshal(data, &list))

	assert.Len(t, legacyLongRunningOperationIDs, len(list.OperationIDs),
		"the generated map and the shared list differ in size; run go generate ./... in tools/cli")
	for _, operationID := range list.OperationIDs {
		assert.Contains(t, legacyLongRunningOperationIDs, operationID,
			"missing from the generated map; run go generate ./... in tools/cli")
	}
}
