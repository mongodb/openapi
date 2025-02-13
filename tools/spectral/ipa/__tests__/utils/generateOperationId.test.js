import { describe, expect, it } from '@jest/globals';
import {
  generateOperationIdForCustomMethod,
  generateOperationIdForStandardMethod,
} from '../../rulesets/functions/utils/generateOperationId.js';

const customMethodCases = [
  // Real examples that work well
  {
    path: '/api/atlas/v2/orgs/{orgId}/resourcePolicies:validate',
    expectedOperationId: 'validateOrgResourcePolicies',
  },
  {
    path: '/api/atlas/v2/orgs/{orgId}/invoices/{invoiceId}/lineItems:search',
    expectedOperationId: 'searchOrgInvoiceLineItems',
  },
  {
    path: '/api/atlas/v2/groups/{groupId}:migrate',
    expectedOperationId: 'migrateGroup',
  },
  {
    path: '/api/atlas/v2/groups/{groupId}/serviceAccounts/{clientId}:invite',
    expectedOperationId: 'inviteGroupServiceAccountsClient',
  },
  {
    path: '/api/atlas/v2/groups/{groupId}/streams/{tenantName}/processor/{processorName}:stop',
    expectedOperationId: 'stopGroupStreamsTenantProcessor',
  },
  {
    path: '/api/atlas/v2/groups/{groupId}/flexClusters:tenantUpgrade',
    expectedOperationId: 'tenantGroupFlexClustersUpgrade',
  },
  {
    path: '/api/atlas/v2/orgs/{orgId}/users/{userId}:addRole',
    expectedOperationId: 'addOrgUserRole',
  },
  // Some examples to show some edge cases
  {
    path: '/api/atlas/v2/orgs/{orgId}/billing/costExplorer:getUsage',
    expectedOperationId: 'getOrgBillingCostExplorerUsage', // Double parent case works well here
  },
  // Some examples to show some caveats
  {
    path: '/api/atlas/v2/groups/{groupId}/streams:withSampleConnections',
    method: 'get',
    expectedOperationId: 'withGroupStreamsSampleConnections', // This one has a weird custom method, ideally it would be /streams:createWithSampleConnections
  },
];

const standardMethodCases = [
  // Real examples that work well
  {
    path: '/api/atlas/v2/groups/{groupId}/serviceAccounts',
    method: 'list',
    expectedOperationId: 'listGroupServiceAccounts',
  },
  {
    path: '/api/atlas/v2/groups/{groupId}/serviceAccounts/{clientId}',
    method: 'get',
    expectedOperationId: 'getGroupServiceAccountsClient',
  },
  {
    path: '/api/atlas/v2/groups/{groupId}/pushBasedLogExport',
    method: 'delete',
    expectedOperationId: 'deleteGroupPushBasedLogExport',
  },
  {
    path: '/api/atlas/v2/groups/{groupId}/processes/{processId}/measurements',
    method: 'list',
    expectedOperationId: 'listGroupProcessMeasurements',
  },
  // Some examples to show some caveats
  {
    path: '/api/atlas/v2/groups/{groupId}/serviceAccounts',
    method: 'create',
    expectedOperationId: 'createGroupServiceAccounts', // Ideally singular instead of plural
  },
  {
    path: '/api/atlas/v2/groups/{groupId}/invites/{invitationId}',
    method: 'get',
    expectedOperationId: 'getGroupInvitation',
  },
  {
    path: '/api/atlas/v2/federationSettings/{federationSettingsId}/connectedOrgConfigs/{orgId}/roleMappings/{id}',
    method: 'delete',
    expectedOperationId: 'deleteFederationSettingsConnectedOrgConfigsOrgRoleMappings',
  },
  {
    path: '/api/atlas/v2/groups/{groupId}/clusters/{hostName}/logs/{logName}.gz',
    method: 'get',
    expectedOperationId: 'getGroupClustersHostLog',
  },
  {
    path: '/api/atlas/v2/groups/{groupId}/serverless/{name}',
    method: 'delete',
    expectedOperationId: 'deleteGroupServerless', // Ideally it should be something like /{instanceName} -> deleteGroupServerlessInstance
  },
  {
    path: '/api/atlas/v2/groups/{groupId}/cloudProviderAccess/{cloudProvider}/{roleId}',
    method: 'get',
    expectedOperationId: 'getGroupCloudRole', // Ideally the provider from cloudProvider wouldn't be stripped here
  },
  {
    path: '/api/atlas/v2/orgs',
    method: 'list',
    expectedOperationId: 'listOrgs',
  },
  {
    path: '/api/atlas/v2/orgs/{orgId}/apiKeys/{apiUserId}',
    method: 'get',
    expectedOperationId: 'getOrgApiKeysApiUser', // This one is a bit weird, ideally it would be /apiKeys/{apiKeyId} -> getOrgApiKey
  },
  {
    path: '/api/atlas/v2/groups/{groupId}/privateEndpoint/{cloudProvider}/endpointService/{endpointServiceId}/endpoint/{endpointId}',
    method: 'delete',
    expectedOperationId: 'deleteGroupPrivateEndpointCloudEndpointServiceEndpoint', // This gets complicated, and ideally for this case cloudProvider wouldn't be stripped to only 'cloud'
  },
];

describe('tools/spectral/ipa/rulesets/functions/utils/generateOperationId.js', () => {
  for (const testCase of customMethodCases) {
    it.concurrent(`Custom method ${testCase.path} gets operationId ${testCase.expectedOperationId}`, () => {
      expect(generateOperationIdForCustomMethod(testCase.path)).toBe(testCase.expectedOperationId);
    });
  }
  for (const testCase of standardMethodCases) {
    it.concurrent(
      `Standard method ${testCase.method} ${testCase.path} gets operationId ${testCase.expectedOperationId}`,
      () => {
        expect(generateOperationIdForStandardMethod(testCase.path, testCase.method)).toBe(testCase.expectedOperationId);
      }
    );
  }
});
