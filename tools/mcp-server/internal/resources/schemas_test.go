package resources

import (
	"encoding/json"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestHandleSchema(t *testing.T) {
	reg := newTestRegistry(t)

	tests := []struct {
		name    string
		uri     string
		want    SchemaDetail
		wantErr bool
	}{
		{
			name: "Cluster - used by operations and schemas",
			uri:  "openapi://specs/test-api/schemas/Cluster",
			want: SchemaDetail{
				Schema: newTestSpec().Components.Schemas["Cluster"],
				UsedBy: SchemaUsage{
					Operations: []string{"createGroupCluster", "listClusterDetails", "listGroupClusters"},
					Schemas:    []string{"ClusterGroup"},
				},
				References: SchemaReferences{Schemas: []string{}},
			},
		},
		{
			name: "FlexCluster - used by operations, no schema references",
			uri:  "openapi://specs/test-api/schemas/FlexCluster",
			want: SchemaDetail{
				Schema: newTestSpec().Components.Schemas["FlexCluster"],
				UsedBy: SchemaUsage{
					Operations: []string{"createGroupCluster", "listGroupFlexClusters"},
					Schemas:    []string{},
				},
				References: SchemaReferences{Schemas: []string{}},
			},
		},
		{
			name: "Error - used only by a non-200 response",
			uri:  "openapi://specs/test-api/schemas/Error",
			want: SchemaDetail{
				Schema: newTestSpec().Components.Schemas["Error"],
				UsedBy: SchemaUsage{
					Operations: []string{"deleteGroupCluster"},
					Schemas:    []string{},
				},
				References: SchemaReferences{Schemas: []string{}},
			},
		},
		{
			name: "ClusterGroup - references Cluster, not used by any operation",
			uri:  "openapi://specs/test-api/schemas/ClusterGroup",
			want: SchemaDetail{
				Schema: newTestSpec().Components.Schemas["ClusterGroup"],
				UsedBy: SchemaUsage{
					Operations: []string{},
					Schemas:    []string{},
				},
				References: SchemaReferences{Schemas: []string{"Cluster"}},
			},
		},
		{
			name:    "schema not found",
			uri:     "openapi://specs/test-api/schemas/Unknown",
			wantErr: true,
		},
		{
			name:    "spec not found",
			uri:     "openapi://specs/unknown-api/schemas/Cluster",
			wantErr: true,
		},
		{
			name:    "invalid URI",
			uri:     "openapi://specs/test-api/operations/Cluster",
			wantErr: true,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			result, err := handleSchema(reg, makeRequest(tc.uri))
			if tc.wantErr {
				require.Error(t, err)
				return
			}
			require.NoError(t, err)
			require.Len(t, result.Contents, 1)

			wantJSON, err := json.Marshal(tc.want)
			require.NoError(t, err)
			assert.JSONEq(t, string(wantJSON), result.Contents[0].Text)
		})
	}
}
