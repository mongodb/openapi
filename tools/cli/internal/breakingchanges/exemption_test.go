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
package breakingchanges

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestGenerateExemptionsFile(t *testing.T) {
	exemptionsFolder, err := filepath.Abs("../../test/exemptions")
	require.NoError(t, err)
	t.Run("test_generate_exemptions_expired_entries", func(t *testing.T) {
		exemptionsPath := filepath.Join(exemptionsFolder, "test_exemptions_expired.yaml")
		outputPath := filepath.Join(exemptionsFolder, "exemptions.txt")
		defer os.Remove(outputPath)

		err := GenerateExemptionsFile(exemptionsFolder, exemptionsPath, false)
		require.NoError(t, err)

		data, err := os.ReadFile(outputPath)
		require.NoError(t, err)
		assert.Equal(t, "", string(data))
	})

	t.Run("test_generate_exemptions_expired_entries_ignore_set", func(t *testing.T) {
		exemptionsPath := filepath.Join(exemptionsFolder, "test_exemptions_expired.yaml")
		outputPath := filepath.Join(exemptionsFolder, "exemptions.txt")
		defer os.Remove(outputPath)

		err := GenerateExemptionsFile(exemptionsFolder, exemptionsPath, true)
		require.NoError(t, err)

		data, err := os.ReadFile(outputPath)
		require.NoError(t, err)

		expectedContent := `API PATCH /api/atlas/v1.0/testGroups/{groupId}/clusters/{clusterName}/backup/snapshots/{snapshotId} removed the 'replicaSet' enum value from the 'type' response property for the response status '200' [response-property-enum-value-removed].
API POST /api/atlas/v2/testGroups/{groupId}/clusters/{clusterName}/backup/snapshots removed the 'replicaSet' enum value from the 'type' response property for the response status '200' [response-property-enum-value-removed].
API POST /api/atlas/v1.0/testGroups/{groupId}/clusters/{clusterName}/backup/snapshots removed the 'replicaSet' enum value from the 'type' response property for the response status '200' [response-property-enum-value-removed].
API POST /api/atlas/v1.5/testGroups/{groupId}/clusters/{clusterName}/backup/snapshots removed the 'replicaSet' enum value from the 'type' response property for the response status '200' [response-property-enum-value-removed].
`
		assert.Equal(t, expectedContent, string(data))
	})

	t.Run("test_generate_exemptions_file_v2_duplicates_to_v1", func(t *testing.T) {
		exemptionsPath := filepath.Join(exemptionsFolder, "test_exemptions_v2_duplication.yaml")
		outputPath := filepath.Join(exemptionsFolder, "exemptions.txt")
		defer os.Remove(outputPath)

		err := GenerateExemptionsFile(exemptionsFolder, exemptionsPath, false)
		require.NoError(t, err)

		data, err := os.ReadFile(outputPath)
		require.NoError(t, err)

		expectedContent := `API PATCH /api/atlas/v1.0/testGroups/{groupId}/clusters/{clusterName}/backup/snapshots/{snapshotId} removed the 'replicaSet' enum value from the 'type' response property for the response status '200' [response-property-enum-value-removed].
API POST /api/atlas/v2/testGroups/{groupId}/clusters/{clusterName}/backup/snapshots removed the 'replicaSet' enum value from the 'type' response property for the response status '200' [response-property-enum-value-removed].
API POST /api/atlas/v1.0/testGroups/{groupId}/clusters/{clusterName}/backup/snapshots removed the 'replicaSet' enum value from the 'type' response property for the response status '200' [response-property-enum-value-removed].
API POST /api/atlas/v1.5/testGroups/{groupId}/clusters/{clusterName}/backup/snapshots removed the 'replicaSet' enum value from the 'type' response property for the response status '200' [response-property-enum-value-removed].
API GET /api/atlas/v2/testGroups/{groupId}/clusters/{clusterName}/backup/snapshots/shardedCluster/{snapshotId} removed the 'shardedCluster' enum value from the 'type' response property for the response status '200' [response-property-enum-value-removed].
API GET /api/atlas/v1.0/testGroups/{groupId}/clusters/{clusterName}/backup/snapshots/shardedCluster/{snapshotId} removed the 'shardedCluster' enum value from the 'type' response property for the response status '200' [response-property-enum-value-removed].
API GET /api/atlas/v1.5/testGroups/{groupId}/clusters/{clusterName}/backup/snapshots/shardedCluster/{snapshotId} removed the 'shardedCluster' enum value from the 'type' response property for the response status '200' [response-property-enum-value-removed].
`
		assert.Equal(t, expectedContent, string(data))
	})

	t.Run("test_api_schema_component_exemption", func(t *testing.T) {
		exemptionsPath := filepath.Join(exemptionsFolder, "test_exemptions_schema.yaml")
		outputPath := filepath.Join(exemptionsFolder, "exemptions.txt")
		defer os.Remove(outputPath)

		err := GenerateExemptionsFile(exemptionsFolder, exemptionsPath, false)
		require.NoError(t, err)

		data, err := os.ReadFile(outputPath)
		require.NoError(t, err)

		expectedContent := `in components removed the schema 'SamlIdentityProviderUpdate' [api-schema-removed]
`
		assert.Equal(t, expectedContent, string(data))
	})
}
