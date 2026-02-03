import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-104-valid-operation-id', [
  {
    name: 'valid methods',
    document: {
      paths: {
        '/groups/{groupId}/cluster/{clusterName}': {
          get: {
            operationId: 'getGroupCluster',
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid methods with short opIDs',
    document: {
      paths: {
        '/api/atlas/v2/groups/{groupId}/accessList/{entryValue}': {
          get: {
            operationId: 'getProjectIpList',
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-104-valid-operation-id',
        message: "Invalid OperationID. Found 'getProjectIpList', expected 'getGroupAccessList'. ",
        path: ['paths', '/api/atlas/v2/groups/{groupId}/accessList/{entryValue}', 'get', 'operationId'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'invalid methods with long opIDs',
    document: {
      paths: {
        '/api/atlas/v2/groups/{groupId}/alerts/{alertId}/alertConfigs': {
          get: {
            operationId: 'listAlertConfigurationsByAlertId',
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-104-valid-operation-id',
        message:
          "Invalid OperationID. Found 'listAlertConfigurationsByAlertId', expected 'getGroupAlertAlertConfigs'. ",
        path: ['paths', '/api/atlas/v2/groups/{groupId}/alerts/{alertId}/alertConfigs', 'get', 'operationId'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'valid methods with valid overrides',
    document: {
      paths: {
        '/api/atlas/v2': {
          get: {
            'x-xgen-method-verb-override': {
              verb: 'getSystemStatus',
              customMethod: false,
            },
            operationId: 'getSystemStatus',
          },
        },
        '/api/atlas/v2/federationSettings/{federationSettingsId}/connectedOrgConfigs/{orgId}/roleMappings/{id}': {
          get: {
            operationId: 'getFederationSettingConnectedOrgConfigRoleMapping',
            'x-xgen-operation-id-override': 'getRoleMapping',
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'valid methods with invalid overrides',
    document: {
      paths: {
        '/api/atlas/v2/federationSettings/{federationSettingsId}/connectedOrgConfigs/{orgId}/roleMappings/{id}': {
          get: {
            operationId: 'getFederationSettingConnectedOrgConfigRoleMapping',
            'x-xgen-operation-id-override': 'getGroupRoleConfig',
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-104-valid-operation-id',
        message:
          "The operation ID override must only contain nouns from the operation ID 'getFederationSettingConnectedOrgConfigRoleMapping'. ",
        path: [
          'paths',
          '/api/atlas/v2/federationSettings/{federationSettingsId}/connectedOrgConfigs/{orgId}/roleMappings/{id}',
          'get',
          'x-xgen-operation-id-override',
        ],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-104-valid-operation-id',
        message: "The operation ID override must end with the noun 'Mapping'. ",
        path: [
          'paths',
          '/api/atlas/v2/federationSettings/{federationSettingsId}/connectedOrgConfigs/{orgId}/roleMappings/{id}',
          'get',
          'x-xgen-operation-id-override',
        ],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'valid method with verb overrides',
    document: {
      paths: {
        '/api/atlas/v2/groups/{groupId}/streams/{tenantName}': {
          get: {
            operationId: 'getGroupStreamWorkspace',
            'x-xgen-method-verb-override': {
              verb: 'getWorkspace',
              customMethod: false,
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid methods with exceptions',
    document: {
      paths: {
        '/api/atlas/v2/groups/{groupId}/clusters/{clusterName}/index ': {
          get: {
            operationId: 'getRollingIndex',
            'x-xgen-IPA-exception': {
              'xgen-IPA-104-valid-operation-id': 'Reason',
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'valid method that needs ignoreList',
    document: {
      paths: {
        '/api/atlas/v2/groups/{groupId}/clusters/{clusterName}/fts/indexes/{indexId} ': {
          get: {
            operationId: 'getGroupClusterFtsIndex',
            'x-xgen-operation-id-override': 'getClusterFtsIndex',
          },
        },
      },
    },
    errors: [],
  },
]);
