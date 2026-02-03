import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-109-valid-operation-id', [
  {
    name: 'valid methods',
    document: {
      paths: {
        '/groups/{groupId}/clusters/{clusterName}:pause': {
          post: {
            operationId: 'pauseGroupCluster',
          },
        },
        '/groups/{groupId}/clusters/{clusterName}:addNode': {
          post: {
            operationId: 'addGroupClusterNode',
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid methods with short opIds',
    document: {
      paths: {
        '/api/atlas/v2/groups/{groupId}/clusters:search': {
          post: {
            operationId: 'searchClusters',
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-109-valid-operation-id',
        message: "Invalid OperationID. Found 'searchClusters', expected 'searchGroupClusters'. ",
        path: ['paths', '/api/atlas/v2/groups/{groupId}/clusters:search', 'post', 'operationId'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'invalid methods with too long opIDs',
    document: {
      paths: {
        '/api/atlas/v2/groups/{groupId}:migrate': {
          post: {
            operationId: 'migrateProjectToAnotherOrg',
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-109-valid-operation-id',
        message: "Invalid OperationID. Found 'migrateProjectToAnotherOrg', expected 'migrateGroup'. ",
        path: ['paths', '/api/atlas/v2/groups/{groupId}:migrate', 'post', 'operationId'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'valid methods with valid overrides',
    document: {
      paths: {
        '/api/atlas/v2/federationSettings/{federationSettingsId}/connectedOrgConfigs/{orgId}': {
          delete: {
            operationId: 'removeFederationSettingConnectedOrgConfig',
            'x-xgen-method-verb-override': {
              verb: 'remove',
              customMethod: true,
            },
            'x-xgen-operation-id-override': 'removeConnectedOrgConfig',
          },
        },
        '/api/atlas/v2/groups/{groupId}/clusters/{clusterName}:revokeMongoDBEmployeeAccess': {
          delete: {
            operationId: 'revokeGroupClusterMongoDbEmployeeAccess',
            'x-xgen-operation-id-override': 'revokeEmployeeAccess',
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
        '/api/atlas/v2/federationSettings/{federationSettingsId}/connectedOrgConfigs/{orgId}': {
          delete: {
            operationId: 'removeFederationSettingConnectedOrgConfig',
            'x-xgen-method-verb-override': {
              verb: 'remove',
              customMethod: true,
            },
            'x-xgen-operation-id-override': 'removeOrgConfigTest',
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-109-valid-operation-id',
        message:
          "The operation ID override must only contain nouns from the operation ID 'removeFederationSettingConnectedOrgConfig'. ",
        path: [
          'paths',
          '/api/atlas/v2/federationSettings/{federationSettingsId}/connectedOrgConfigs/{orgId}',
          'delete',
          'x-xgen-operation-id-override',
        ],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-109-valid-operation-id',
        message: "The operation ID override must end with the noun 'Config'. ",
        path: [
          'paths',
          '/api/atlas/v2/federationSettings/{federationSettingsId}/connectedOrgConfigs/{orgId}',
          'delete',
          'x-xgen-operation-id-override',
        ],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'invalid methods with exceptions',
    document: {
      paths: {
        '/api/atlas/v2/orgs/{orgId}/users/{userId}:addRole': {
          post: {
            operationId: 'addOrgRole',
            'x-xgen-IPA-exception': {
              'xgen-IPA-109-valid-operation-id': 'Reason',
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
        '/api/atlas/v2/groups/{groupId}/clusters/{clusterName}/fts/indexes/{indexId}:test': {
          delete: {
            operationId: 'testGroupClusterFtsIndex',
            'x-xgen-operation-id-override': 'testClusterFtsIndex',
          },
        },
      },
    },
    errors: [],
  },
]);
