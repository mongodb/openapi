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
