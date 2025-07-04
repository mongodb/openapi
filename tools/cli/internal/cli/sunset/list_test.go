// Copyright 2025 MongoDB Inc
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

package sunset

import (
	"encoding/json"
	"github.com/mongodb/openapi/tools/cli/internal/openapi/sunset"
	"reflect"
	"testing"

	"github.com/spf13/afero"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestList_Run(t *testing.T) {
	fs := afero.NewMemMapFs()
	opts := &ListOpts{
		basePath:   "../../../test/data/base_spec.json",
		outputPath: "foas.json",
		fs:         fs,
		format:     "json",
		to:         "2024-09-22",
		from:       "2025-09-22",
	}

	require.NoError(t, opts.Run())
	b, err := afero.ReadFile(fs, opts.outputPath)
	require.NoError(t, err)
	assert.NotEmpty(t, b)
	var results []*sunset.Sunset
	require.NoError(t, json.Unmarshal(b, &results))
	if !reflect.DeepEqual(results, expectedResults) {
		gotPretty, _ := json.MarshalIndent(results, "", "  ")
		wantPretty, _ := json.MarshalIndent(expectedResults, "", "  ")
		t.Errorf("mismatch:\nGot:\n%s\nWant:\n%s", string(gotPretty), string(wantPretty))
	}
}

var expectedResults = []*sunset.Sunset{
	{Operation: "GET", Path: "/api/atlas/v2/example/info", SunsetDate: "2025-06-01", Team: "APIx", Version: "2023-01-01"},
	{Operation: "GET", Path: "/api/atlas/v2/federationSettings/{federationSettingsId}/identityProviders/{identityProviderId}", SunsetDate: "2025-01-01", Team: "IAM", Version: "2023-01-01"},
	{Operation: "PATCH", Path: "/api/atlas/v2/groups/{groupId}/alerts/{alertId}", SunsetDate: "2025-05-30", Team: "CAP", Version: "2023-01-01"},
	{Operation: "GET", Path: "/api/atlas/v2/groups/{groupId}/backup/exportBuckets", SunsetDate: "2025-05-30", Team: "Backup - Atlas", Version: "2023-01-01"},
	{Operation: "POST", Path: "/api/atlas/v2/groups/{groupId}/backup/exportBuckets", SunsetDate: "2025-05-30", Team: "Backup - Atlas", Version: "2023-01-01"},
	{Operation: "GET", Path: "/api/atlas/v2/groups/{groupId}/backupCompliancePolicy", SunsetDate: "2024-10-01", Team: "Backup - Atlas", Version: "2023-01-01"},
	{Operation: "POST", Path: "/api/atlas/v2/groups/{groupId}/clusters", SunsetDate: "2025-06-01", Team: "Atlas Dedicated", Version: "2023-01-01"},
	{Operation: "DELETE", Path: "/api/atlas/v2/groups/{groupId}/clusters/{clusterName}", SunsetDate: "2025-06-01", Team: "Atlas Dedicated", Version: "2023-01-01"},
	{Operation: "GET", Path: "/api/atlas/v2/groups/{groupId}/clusters/{clusterName}", SunsetDate: "2025-06-01", Team: "Atlas Dedicated", Version: "2023-01-01"},
	{Operation: "PATCH", Path: "/api/atlas/v2/groups/{groupId}/clusters/{clusterName}", SunsetDate: "2025-06-01", Team: "Atlas Dedicated", Version: "2023-01-01"},
	{Operation: "POST", Path: "/api/atlas/v2/groups/{groupId}/clusters/{clusterName}/fts/indexes", SunsetDate: "2025-06-01", Team: "Search Web Platform", Version: "2023-01-01"},
	{Operation: "GET", Path: "/api/atlas/v2/groups/{groupId}/clusters/{clusterName}/fts/indexes/{databaseName}/{collectionName}", SunsetDate: "2025-06-01", Team: "Search Web Platform", Version: "2023-01-01"},
	{Operation: "DELETE", Path: "/api/atlas/v2/groups/{groupId}/clusters/{clusterName}/fts/indexes/{indexId}", SunsetDate: "2025-06-01", Team: "Search Web Platform", Version: "2023-01-01"},
	{Operation: "GET", Path: "/api/atlas/v2/groups/{groupId}/clusters/{clusterName}/fts/indexes/{indexId}", SunsetDate: "2025-06-01", Team: "Search Web Platform", Version: "2023-01-01"},
	{Operation: "PATCH", Path: "/api/atlas/v2/groups/{groupId}/clusters/{clusterName}/fts/indexes/{indexId}", SunsetDate: "2025-06-01", Team: "Search Web Platform", Version: "2023-01-01"},
	{Operation: "GET", Path: "/api/atlas/v2/groups/{groupId}/clusters/{clusterName}/globalWrites", SunsetDate: "2025-06-01", Team: "Atlas Dedicated", Version: "2023-01-01"},
	{Operation: "DELETE", Path: "/api/atlas/v2/groups/{groupId}/clusters/{clusterName}/globalWrites/customZoneMapping", SunsetDate: "2025-06-01", Team: "Atlas Dedicated", Version: "2023-01-01"},
	{Operation: "DELETE", Path: "/api/atlas/v2/groups/{groupId}/clusters/{clusterName}/globalWrites/managedNamespaces", SunsetDate: "2025-06-01", Team: "Atlas Dedicated", Version: "2023-01-01"},
	{Operation: "POST", Path: "/api/atlas/v2/groups/{groupId}/clusters/{clusterName}/globalWrites/managedNamespaces", SunsetDate: "2025-06-01", Team: "Atlas Dedicated", Version: "2023-01-01"},
	{Operation: "GET", Path: "/api/atlas/v2/groups/{groupId}/clusters/{clusterName}/processArgs", SunsetDate: "2025-06-01", Team: "Atlas", Version: "2023-01-01"},
	{Operation: "PATCH", Path: "/api/atlas/v2/groups/{groupId}/clusters/{clusterName}/processArgs", SunsetDate: "2025-06-01", Team: "Atlas", Version: "2023-01-01"},
	{Operation: "PATCH", Path: "/api/atlas/v2/groups/{groupId}/clusters/{clusterName}/search/deployment", SunsetDate: "2026-03-01", Team: "Search Web Platform", Version: "2023-01-01"},
	{Operation: "POST", Path: "/api/atlas/v2/groups/{groupId}/clusters/{clusterName}/search/deployment", SunsetDate: "2026-03-01", Team: "Search Web Platform", Version: "2023-01-01"},
	{Operation: "GET", Path: "/api/atlas/v2/groups/{groupId}/clusters/{clusterName}/search/deployment", SunsetDate: "2026-03-01", Team: "Search Web Platform", Version: "2023-01-01"},
	{Operation: "DELETE", Path: "/api/atlas/v2/groups/{groupId}/clusters/{clusterName}/search/deployment", SunsetDate: "2026-03-01", Team: "Search Web Platform", Version: "2023-01-01"},
	{Operation: "PATCH", Path: "/api/atlas/v2/groups/{groupId}/invites", SunsetDate: "2024-10-04", Team: "IAM", Version: "2023-01-01"},
	{Operation: "GET", Path: "/api/atlas/v2/groups/{groupId}/invites", SunsetDate: "2024-10-04", Team: "IAM", Version: "2023-01-01"},
	{Operation: "POST", Path: "/api/atlas/v2/groups/{groupId}/invites", SunsetDate: "2024-10-04", Team: "IAM", Version: "2023-01-01"},
	{Operation: "DELETE", Path: "/api/atlas/v2/groups/{groupId}/invites/{invitationId}", SunsetDate: "2024-10-04", Team: "IAM", Version: "2023-01-01"},
	{Operation: "GET", Path: "/api/atlas/v2/groups/{groupId}/invites/{invitationId}", SunsetDate: "2024-10-04", Team: "IAM", Version: "2023-01-01"},
	{Operation: "PATCH", Path: "/api/atlas/v2/groups/{groupId}/invites/{invitationId}", SunsetDate: "2024-10-04", Team: "IAM", Version: "2023-01-01"},
	{Operation: "POST", Path: "/api/atlas/v2/groups/{groupId}/liveMigrations", SunsetDate: "2025-05-30", Team: "Atlas Migrations", Version: "2023-01-01"},
	{Operation: "POST", Path: "/api/atlas/v2/groups/{groupId}/liveMigrations/validate", SunsetDate: "2025-05-30", Team: "Atlas Migrations", Version: "2023-01-01"},
}
