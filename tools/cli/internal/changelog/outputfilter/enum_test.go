package outputfilter

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestSquash(t *testing.T) {
	tests := []struct {
		name            string
		entries         []*Entry
		expectedEntries []*Entry
		wantError       require.ErrorAssertionFunc
	}{
		{
			name: "Test squashing entries",
			entries: []*Entry{
				{
					ID:          "request-property-enum-value-removed",
					Text:        "removed the 'linearizable' enum value from the 'defaultReadConcern' response property",
					Operation:   "PATCH",
					OperationID: "updateClusterAdvancedConfiguration",
					Path:        "/api/atlas/v2/groups/{groupId}/clusters/{clusterName}/processArgs",
				},
				{
					ID:          "request-property-enum-value-removed",
					Text:        "removed the 'majority' enum value from the 'defaultReadConcern' response property",
					Operation:   "PATCH",
					OperationID: "updateClusterAdvancedConfiguration",
					Path:        "/api/atlas/v2/groups/{groupId}/clusters/{clusterName}/processArgs",
				},
				{
					ID:          "request-property-enum-value-removed",
					Text:        "removed the 'snapshot' enum value from the 'defaultReadConcern' response property",
					Operation:   "PATCH",
					OperationID: "updateClusterAdvancedConfiguration",
					Path:        "/api/atlas/v2/groups/{groupId}/clusters/{clusterName}/processArgs",
				},
				{
					ID:          "request-property-enum-value-added",
					Text:        "added the new 'CREATE_STREAM_PROCESSOR' enum value to the 'actions/items/action' request property",
					Operation:   "POST",
					OperationID: "createCustomDatabaseRole",
					Path:        "/api/atlas/v2/groups/{groupId}/customDBRoles/roles",
				},
				{
					ID:          "request-property-enum-value-added",
					Text:        "added the new 'DROP_STREAM_PROCESSOR' enum value to the 'actions/items/action' request property",
					Operation:   "POST",
					OperationID: "createCustomDatabaseRole",
					Path:        "/api/atlas/v2/groups/{groupId}/customDBRoles/roles",
				},
				{
					ID:          "request-property-enum-value-added",
					Text:        "added the new 'GET_STREAM_PROCESSOR' enum value to the 'actions/items/action' request property",
					Operation:   "POST",
					OperationID: "createCustomDatabaseRole",
					Path:        "/api/atlas/v2/groups/{groupId}/customDBRoles/roles",
				},
				{
					ID:          "request-property-enum-value-added",
					Text:        "added the new 'GET_STREAM_PROCESSOR' enum value to the 'actions/items/action' request property",
					Operation:   "GET",
					OperationID: "getCustomDatabaseRole",
					Path:        "/api/atlas/v2/groups/{groupId}/customDBRoles/roles",
				},
				{
					ID:          "response-property-enum-value-removed",
					Text:        "removed the 'linearizable' enum value from the 'defaultReadConcern' response property",
					Operation:   "GET",
					OperationID: "listConnectgetClusterAdvancedConfigurationedOrgConfigs",
					Path:        "/api/atlas/v2/groups/{groupId}/clusters/{clusterName}/processArgs",
				},
				{
					ID:          "response-property-enum-value-removed",
					Text:        "removed the 'majority' enum value from the 'defaultReadConcern' response property",
					Operation:   "GET",
					OperationID: "listConnectgetClusterAdvancedConfigurationedOrgConfigs",
					Path:        "/api/atlas/v2/groups/{groupId}/clusters/{clusterName}/processArgs",
				},
				{
					ID:          "response-property-enum-value-removed",
					Text:        "removed the 'snapshot' enum value from the 'defaultReadConcern' response property",
					Operation:   "GET",
					OperationID: "listConnectgetClusterAdvancedConfigurationedOrgConfigs",
					Path:        "/api/atlas/v2/groups/{groupId}/clusters/{clusterName}/processArgs",
				},
				{
					ID:          "response-property-enum-value-added",
					Text:        "added the new 'GLOBAL_EVENT_ADMIN' enum value to the 'items' response property",
					Operation:   "GET",
					OperationID: "listConnectedOrgConfigs",
					Path:        "/api/atlas/v2/federationSettings/{federationSettingsId}/connectedOrgConfigs",
				},
				{
					ID:          "response-property-enum-value-added",
					Text:        "added the new 'ORG_MEMBER' enum value to the 'items' response property",
					Operation:   "GET",
					OperationID: "listConnectedOrgConfigs",
					Path:        "/api/atlas/v2/federationSettings/{federationSettingsId}/connectedOrgConfigs",
				},
				{
					ID:          "response-property-enum-value-added",
					Text:        "added the new 'ORG_MEMBER' enum value to the 'items' response property",
					Operation:   "POST",
					OperationID: "setConnectedOrgConfigs",
					Path:        "/api/atlas/v2/federationSettings/{federationSettingsId}/connectedOrgConfigs",
				},
			},
			expectedEntries: []*Entry{
				{
					ID:          "request-property-enum-value-removed",
					Text:        "removed the 'linearizable, majority, snapshot' enum values from the 'defaultReadConcern' response property",
					Operation:   "PATCH",
					OperationID: "updateClusterAdvancedConfiguration",
					Path:        "/api/atlas/v2/groups/{groupId}/clusters/{clusterName}/processArgs",
				},
				{
					ID:          "request-property-enum-value-added",
					Text:        "added the new 'GET_STREAM_PROCESSOR' enum value to the 'actions/items/action' request property",
					Operation:   "GET",
					OperationID: "getCustomDatabaseRole",
					Path:        "/api/atlas/v2/groups/{groupId}/customDBRoles/roles",
				},
				{
					ID:          "request-property-enum-value-added",
					Text:        "added the new 'CREATE_STREAM_PROCESSOR, DROP_STREAM_PROCESSOR, GET_STREAM_PROCESSOR' enum values to the 'actions/items/action' request property", //nolint:lll //Test string
					Operation:   "POST",
					OperationID: "createCustomDatabaseRole",
					Path:        "/api/atlas/v2/groups/{groupId}/customDBRoles/roles",
				},
				{
					ID:          "response-property-enum-value-removed",
					Text:        "removed the 'linearizable, majority, snapshot' enum values from the 'defaultReadConcern' response property",
					Operation:   "GET",
					OperationID: "listConnectgetClusterAdvancedConfigurationedOrgConfigs",
					Path:        "/api/atlas/v2/groups/{groupId}/clusters/{clusterName}/processArgs",
				},
				{
					ID:          "response-property-enum-value-added",
					Text:        "added the new 'GLOBAL_EVENT_ADMIN, ORG_MEMBER' enum values to the 'items' response property",
					Operation:   "GET",
					OperationID: "listConnectedOrgConfigs",
					Path:        "/api/atlas/v2/federationSettings/{federationSettingsId}/connectedOrgConfigs",
				},
				{
					ID:          "response-property-enum-value-added",
					Text:        "added the new 'ORG_MEMBER' enum value to the 'items' response property",
					Operation:   "POST",
					OperationID: "setConnectedOrgConfigs",
					Path:        "/api/atlas/v2/federationSettings/{federationSettingsId}/connectedOrgConfigs",
				},
			},
			wantError: require.NoError,
		},
		{
			name: "Test squashing entries with wrong description",
			entries: []*Entry{
				{
					ID: "response-property-enum-value-added",
					// 			# the field is not between apostrophes
					Text:        "added the new GLOBAL_EVENT_ADMIN enum value to the 'items' response propert",
					Operation:   "POST",
					OperationID: "createConnectedOrgConfigs",
					Path:        "/api/atlas/v2/federationSettings/{federationSettingsId}/connectedOrgConfigs",
				},
			},
			expectedEntries: []*Entry{},
			wantError:       require.Error,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := squashEntries(tt.entries)
			tt.wantError(t, err)

			if !assert.ElementsMatch(t, result, tt.expectedEntries) {
				t.Errorf("expected %v, but got %v", tt.expectedEntries, result)
			}
		})
	}
}
