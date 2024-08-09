package outputfilter

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestSquashRequestFieldAdded(t *testing.T) {
	tests := []struct {
		name            string
		entries         []*OasDiffEntry
		expectedEntries []*OasDiffEntry
		wantError       require.ErrorAssertionFunc
	}{
		{
			name: "Test squashing entries",
			entries: []*OasDiffEntry{
				{
					ID:          "new-optional-request-property",
					Text:        "added the new optional request property 'defaultReadConcern'",
					Operation:   "PATCH",
					OperationID: "updateClusterAdvancedConfiguration",
					Path:        "/api/atlas/v2/groups/{groupId}/clusters/{clusterName}/processArgs",
				},
				{
					ID:          "new-optional-request-property",
					Text:        "added the new optional request property 'failIndexKeyTooLong'",
					Operation:   "PATCH",
					OperationID: "updateClusterAdvancedConfiguration",
					Path:        "/api/atlas/v2/groups/{groupId}/clusters/{clusterName}/processArgs",
				},
				{
					ID:          "request-property-became-required",
					Text:        "the request property 'tags/items/key' became required",
					Operation:   "POST",
					OperationID: "createProject",
					Path:        "/api/atlas/v2/groups",
				},
				{
					ID:          "request-property-became-required",
					Text:        "the request property 'tags/items/value' became required",
					Operation:   "POST",
					OperationID: "createProject",
					Path:        "/api/atlas/v2/groups",
				},
				{
					ID:          "response-property-became-required",
					Text:        "the response property 'results/items/tags/items/key' became required",
					Operation:   "GET",
					OperationID: "listProjects",
					Path:        "/api/atlas/v2/groups",
				},
				{
					ID:          "response-property-became-required",
					Text:        "the response property 'results/items/tags/items/value' became required",
					Operation:   "GET",
					OperationID: "listProjects",
					Path:        "/api/atlas/v2/groups",
				},
				{
					ID:          "response-optional-property-removed",
					Text:        "removed the optional property 'results/items/audienceClaim' from the response",
					Operation:   "GET",
					OperationID: "listIdentityProviders",
					Path:        "/api/atlas/v2/federationSettings/{federationSettingsId}/identityProviders",
				},
				{
					ID:          "response-optional-property-removed",
					Text:        "removed the optional property 'results/items/audienceClaim' from the response",
					Operation:   "PUT",
					OperationID: "UpdateIdentityProviders",
					Path:        "/api/atlas/v2/federationSettings/{federationSettingsId}/identityProviders",
				},
				{
					ID:          "response-optional-property-removed",
					Text:        "removed the optional property 'results/items/audience' from the response",
					Operation:   "PUT",
					OperationID: "UpdateIdentityProviders",
					Path:        "/api/atlas/v2/federationSettings/{federationSettingsId}/identityProviders",
				},
				{
					ID:          "response-optional-property-added",
					Text:        "added the optional property 'results/items/payments/items/currency' to the response",
					Operation:   "PUT",
					OperationID: "listInvoices",
					Path:        "/api/atlas/v2/orgs/{orgId}/invoices",
				},
				{
					ID:          "response-optional-property-added",
					Text:        "added the optional property 'results/items/payments/items/unitPrice' to the response",
					Operation:   "PUT",
					OperationID: "listInvoices",
					Path:        "/api/atlas/v2/orgs/{orgId}/invoices",
				},
				{
					ID:          "response-required-property-added",
					Text:        "added the required property 'results/items/oneOf[subschema #10: NDS X509 User Authentication Alert Configuration]/matchers/items/fieldName'", //nolint:lll //Test string
					Operation:   "POST",
					OperationID: "createConnectedOrgConfigs",
					Path:        "/api/atlas/v2/federationSettings/{federationSettingsId}/connectedOrgConfigs",
				},
				{
					ID:          "response-required-property-added",
					Text:        "added the required property 'results/items/oneOf[subschema #10: NDS X509 User Authentication Alert Configuration]/matchers/items/operator'", //nolint:lll //Test string
					Operation:   "POST",
					OperationID: "createConnectedOrgConfigs",
					Path:        "/api/atlas/v2/federationSettings/{federationSettingsId}/connectedOrgConfigs",
				},
				{
					ID:          "response-required-property-added",
					Text:        "added the required property 'results/items/oneOf[subschema #10: NDS X509 User Authentication Alert Configuration]/matchers/items/value'", //nolint:lll //Test string
					Operation:   "POST",
					OperationID: "createConnectedOrgConfigs",
					Path:        "/api/atlas/v2/federationSettings/{federationSettingsId}/connectedOrgConfigs",
				},
				{
					ID:          "new-required-request-property",
					Text:        "added the new required request property 'containerId'",
					Operation:   "POST",
					OperationID: "createConnectedOrgConfigs",
					Path:        "/api/atlas/v2/federationSettings/{federationSettingsId}/connectedOrgConfigs",
				},
				{
					ID:          "new-required-request-property",
					Text:        "added the new required request property 'containerName'",
					Operation:   "POST",
					OperationID: "createConnectedOrgConfigs",
					Path:        "/api/atlas/v2/federationSettings/{federationSettingsId}/connectedOrgConfigs",
				},
				{
					ID:          "new-required-request-property",
					Text:        "added the new required request property 'containerId'",
					Operation:   "PUT",
					OperationID: "setConnectedOrgConfigs",
					Path:        "/api/atlas/v2/federationSettings/{federationSettingsId}/connectedOrgConfigs",
				},
				{
					ID:          "request-property-removed",
					Text:        "removed the request property 'audienceClaim'",
					Operation:   "POST",
					OperationID: "createIdentityProvider",
					Path:        "/api/atlas/v2/federationSettings/{federationSettingsId}/createIdentityProvider",
				},
				{
					ID:          "request-property-removed",
					Text:        "removed the request property 'audience'",
					Operation:   "POST",
					OperationID: "createIdentityProvider",
					Path:        "/api/atlas/v2/federationSettings/{federationSettingsId}/createIdentityProvider",
				},
			},
			expectedEntries: []*OasDiffEntry{
				{
					ID:          "new-optional-request-property",
					Text:        "added the new optional request properties 'defaultReadConcern, failIndexKeyTooLong'",
					Operation:   "PATCH",
					OperationID: "updateClusterAdvancedConfiguration",
					Path:        "/api/atlas/v2/groups/{groupId}/clusters/{clusterName}/processArgs",
				},
				{
					ID:          "request-property-became-required",
					Text:        "the request properties 'tags/items/key, tags/items/value' became required",
					Operation:   "POST",
					OperationID: "createProject",
					Path:        "/api/atlas/v2/groups",
				},
				{
					ID:          "response-property-became-required",
					Text:        "the response properties 'results/items/tags/items/key, results/items/tags/items/value' became required",
					Operation:   "GET",
					OperationID: "listProjects",
					Path:        "/api/atlas/v2/groups",
				},
				{
					ID:          "response-optional-property-removed",
					Text:        "removed the optional properties 'results/items/audience, results/items/audienceClaim' from the response",
					Operation:   "PUT",
					OperationID: "UpdateIdentityProviders",
					Path:        "/api/atlas/v2/federationSettings/{federationSettingsId}/identityProviders",
				},
				{
					ID:          "response-optional-property-removed",
					Text:        "removed the optional property 'results/items/audienceClaim' from the response",
					Operation:   "GET",
					OperationID: "listIdentityProviders",
					Path:        "/api/atlas/v2/federationSettings/{federationSettingsId}/identityProviders",
				},
				{
					ID:          "response-optional-property-added",
					Text:        "added the optional properties 'results/items/payments/items/currency, results/items/payments/items/unitPrice' to the response",
					Operation:   "PUT",
					OperationID: "listInvoices",
					Path:        "/api/atlas/v2/orgs/{orgId}/invoices",
				},
				{
					ID:          "response-required-property-added",
					Text:        "added the required properties 'results/items/oneOf[subschema #10: NDS X509 User Authentication Alert Configuration]/matchers/items/fieldName, results/items/oneOf[subschema #10: NDS X509 User Authentication Alert Configuration]/matchers/items/operator, results/items/oneOf[subschema #10: NDS X509 User Authentication Alert Configuration]/matchers/items/value'", //nolint:lll //Test string
					Operation:   "POST",
					OperationID: "createConnectedOrgConfigs",
					Path:        "/api/atlas/v2/federationSettings/{federationSettingsId}/connectedOrgConfigs",
				},
				{
					ID:          "request-property-removed",
					Text:        "removed the request properties 'audience, audienceClaim'",
					Operation:   "POST",
					OperationID: "createIdentityProvider",
					Path:        "/api/atlas/v2/federationSettings/{federationSettingsId}/createIdentityProvider",
				},
				{
					ID:          "new-required-request-property",
					Text:        "added the new required request properties 'containerId, containerName'",
					Operation:   "POST",
					OperationID: "createConnectedOrgConfigs",
					Path:        "/api/atlas/v2/federationSettings/{federationSettingsId}/connectedOrgConfigs",
				},
				{
					ID:          "new-required-request-property",
					Text:        "added the new required request property 'containerId'",
					Operation:   "PUT",
					OperationID: "setConnectedOrgConfigs",
					Path:        "/api/atlas/v2/federationSettings/{federationSettingsId}/connectedOrgConfigs",
				},
			},
			wantError: require.NoError,
		},
		{
			name: "Test squashing entries with wrong description",
			entries: []*OasDiffEntry{
				{
					ID: "new-required-request-property",
					// 			# the field is not between apostrophes
					Text:        "added the new required request property containerId",
					Operation:   "POST",
					OperationID: "createConnectedOrgConfigs",
					Path:        "/api/atlas/v2/federationSettings/{federationSettingsId}/connectedOrgConfigs",
				},
			},
			expectedEntries: []*OasDiffEntry{},
			wantError:       require.Error,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := squashEntries(tt.entries)
			tt.wantError(t, err)

			if !assert.ElementsMatch(t, result, tt.expectedEntries) {
				t.Errorf("Test %s failed. Expected %+v, got %+v", tt.name, tt.expectedEntries, result)
			}
		})
	}
}
