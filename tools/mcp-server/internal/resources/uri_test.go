package resources

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestAliasFromURI(t *testing.T) {
	tests := []struct {
		name      string
		uri       string
		wantAlias string
		wantErr   bool
	}{
		{
			name:      "valid URI",
			uri:       "openapi://specs/atlas",
			wantAlias: "atlas",
		},
		{
			name:    "wrong scheme",
			uri:     "https://specs/atlas",
			wantErr: true,
		},
		{
			name:    "wrong host",
			uri:     "openapi://other/atlas",
			wantErr: true,
		},
		{
			name:    "arbitrary https URL",
			uri:     "https://goodle.com/q",
			wantErr: true,
		},
		{
			name:    "extra path segments",
			uri:     "openapi://specs/atlas/tags/Clusters",
			wantErr: true,
		},
		{
			name:    "missing alias",
			uri:     "openapi://specs/",
			wantErr: true,
		},
		{
			name:    "empty string",
			uri:     "",
			wantErr: true,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			alias, err := aliasFromURI(tc.uri)
			if tc.wantErr {
				require.Error(t, err)
				return
			}
			require.NoError(t, err)
			assert.Equal(t, tc.wantAlias, alias)
		})
	}
}

func TestAliasAndOperationFromURI(t *testing.T) {
	tests := []struct {
		name            string
		uri             string
		wantAlias       string
		wantOperationID string
		wantVersion     string
		wantErr         bool
	}{
		{
			name:            "valid URI no version",
			uri:             "openapi://specs/atlas/operations/listClusters",
			wantAlias:       "atlas",
			wantOperationID: "listClusters",
			wantVersion:     "",
		},
		{
			name:            "valid URI with version",
			uri:             "openapi://specs/atlas/operations/listClusters?version=2024-01-01",
			wantAlias:       "atlas",
			wantOperationID: "listClusters",
			wantVersion:     "2024-01-01",
		},
		{
			name:            "valid URI version=all",
			uri:             "openapi://specs/atlas/operations/listClusters?version=all",
			wantAlias:       "atlas",
			wantOperationID: "listClusters",
			wantVersion:     "all",
		},
		{
			name:            "percent-encoded operationId",
			uri:             "openapi://specs/atlas/operations/list%20Clusters",
			wantAlias:       "atlas",
			wantOperationID: "list Clusters",
			wantVersion:     "",
		},
		{
			name:    "wrong segment (tags instead of operations)",
			uri:     "openapi://specs/atlas/tags/Clusters",
			wantErr: true,
		},
		{
			name:    "missing operationId",
			uri:     "openapi://specs/atlas/operations/",
			wantErr: true,
		},
		{
			name:    "too few segments",
			uri:     "openapi://specs/atlas",
			wantErr: true,
		},
		{
			name:    "wrong scheme",
			uri:     "https://specs/atlas/operations/listClusters",
			wantErr: true,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			alias, operationID, version, err := aliasAndOperationFromURI(tc.uri)
			if tc.wantErr {
				require.Error(t, err)
				return
			}
			require.NoError(t, err)
			assert.Equal(t, tc.wantAlias, alias)
			assert.Equal(t, tc.wantOperationID, operationID)
			assert.Equal(t, tc.wantVersion, version)
		})
	}
}
