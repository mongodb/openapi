package outputfilter

import (
	"fmt"
	"testing"

	"github.com/mongodb/openapi/tools/cli/internal/breakingchanges"
	"github.com/spf13/afero"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestMarkHiddenEntries(t *testing.T) {
	entries := []*OasDiffEntry{
		{ID: "response-required-property-became-write-only"},
		{ID: "some-other-id"},
	}

	exemptionsFilePath := "test_exemptions.yaml"
	fs := afero.NewMemMapFs()
	err := afero.WriteFile(fs, exemptionsFilePath, []byte(getTestExemptionText()), 0o644)
	require.NoError(t, err)

	updatedEntries, err := MarkHiddenEntries(entries, exemptionsFilePath, fs)
	require.NoError(t, err)
	assert.True(t, updatedEntries[0].HideFromChangelog)
	assert.False(t, updatedEntries[1].HideFromChangelog)
}

func TestHideByIDs(t *testing.T) {
	entries := []*OasDiffEntry{
		{ID: "response-required-property-became-write-only"},
		{ID: "some-other-id"},
	}

	ids := []string{"response-required-property-became-write-only"}

	updatedEntries, err := hideByIDs(entries, ids)
	require.NoError(t, err)
	assert.True(t, updatedEntries[0].HideFromChangelog)
	assert.False(t, updatedEntries[1].HideFromChangelog)
}

func TestHideByExemptions(t *testing.T) {
	entries := []*OasDiffEntry{
		{ID: "some-id", Path: "/some/path", Operation: "GET", Text: "some text"},
	}

	exemptions := []breakingchanges.Exemption{
		{BreakingChangeDescription: "GET /some/path some text [some-id]", HideFromChangelog: "true"},
	}

	updatedEntries, err := hideByExemptions(entries, exemptions)
	require.NoError(t, err)
	assert.True(t, updatedEntries[0].HideFromChangelog)
}

func TestFromEntry(t *testing.T) {
	entry := &OasDiffEntry{
		ID:        "some-id",
		Path:      "/some/path",
		Operation: "GET",
		Text:      "some text",
		Source:    "some source",
	}

	exemption := fromEntry(entry, "true")
	expectedDescription := "GET /some/path some text [some-id]"
	assert.Equal(t, expectedDescription, exemption.BreakingChangeDescription)
	assert.Equal(t, "true", exemption.HideFromChangelog)
}

func TestFromEntry_NoSource(t *testing.T) {
	entry := &OasDiffEntry{
		ID:        "api-schema-removed",
		Path:      "",
		Operation: "",
		Text:      "removed the schema 'USSProviderSettings20240710'",
	}

	exemption := fromEntry(entry, "true")
	expectedDescription := "removed the schema 'USSProviderSettings20240710' [api-schema-removed]"
	assert.Equal(t, expectedDescription, exemption.BreakingChangeDescription)
	assert.Equal(t, "true", exemption.HideFromChangelog)
}

func TestGetExemptionsFromPath(t *testing.T) {
	exemptionsFilePath := "test_exemptions.yaml"
	fs := afero.NewMemMapFs()

	err := afero.WriteFile(fs, exemptionsFilePath, []byte(getTestExemptionText()), 0o644)
	require.NoError(t, err)

	exemptions, err := getExemptionsFromPath(exemptionsFilePath, fs)
	require.NoError(t, err)
	require.NotNil(t, exemptions)
}

func getTestExemptionText() string {
	bcEntry := "POST /api/atlas/v2/groups/{groupId}/apiKeys/{apiUserId} removed the " +
		"success response with the status '200' [response-success-status-removed]"
	exemptionEntry := fmt.Sprintf(`
- "breaking_change_description": %s
  "exempt_until": "2024-08-05"
  "reason": "Spec Correction"
  "hide_from_changelog": "true"
`, bcEntry)
	return exemptionEntry
}
