import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-108-valid-operation-id', [
  {
    name: 'valid methods',
    document: {
      paths: {
        '/groups/{groupId}/clusters/{clusterName}': {
          delete: {
            operationId: 'deleteGroupCluster',
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
        '/api/atlas/v2/groups/{groupId}/apiKeys/{apiUserId}': {
          delete: {
            operationId: 'removeProjectApiKey',
          },
        },
        '/api/atlas/v2/groups/{groupId}': {
          delete: {
            operationId: 'deleteProject',
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-108-valid-operation-id',
        message: "Invalid OperationID. Found 'removeProjectApiKey', expected 'deleteGroupApiKey'. ",
        path: ['paths', '/api/atlas/v2/groups/{groupId}/apiKeys/{apiUserId}', 'delete', 'operationId'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-108-valid-operation-id',
        message: "Invalid OperationID. Found 'deleteProject', expected 'deleteGroup'. ",
        path: ['paths', '/api/atlas/v2/groups/{groupId}', 'delete', 'operationId'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'invalid methods with too long opIDs',
    document: {
      paths: {
        '/api/atlas/v2/groups/{groupId}/dataFederation/{tenantName}/limits/{limitName}': {
          delete: {
            operationId: 'deleteOneDataFederationInstanceQueryLimit',
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-108-valid-operation-id',
        message:
          "Invalid OperationID. Found 'deleteOneDataFederationInstanceQueryLimit', expected 'deleteGroupDataFederationLimit'. ",
        path: [
          'paths',
          '/api/atlas/v2/groups/{groupId}/dataFederation/{tenantName}/limits/{limitName}',
          'delete',
          'operationId',
        ],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'valid methods with valid overrides',
    document: {
      paths: {
        '/api/atlas/v2/federationSettings/{federationSettingsId}/connectedOrgConfigs/{orgId}/roleMappings/{id}': {
          delete: {
            operationId: 'deleteFederationSettingConnectedOrgConfigRoleMapping',
            'x-xgen-operation-id-override': 'deleteRoleMapping',
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
          delete: {
            operationId: 'deleteFederationSettingConnectedOrgConfigRoleMapping',
            'x-xgen-operation-id-override': 'deleteMappingConfigTest',
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-108-valid-operation-id',
        message:
          "The operation ID override must only contain nouns from the operation ID 'deleteFederationSettingConnectedOrgConfigRoleMapping'. ",
        path: [
          'paths',
          '/api/atlas/v2/federationSettings/{federationSettingsId}/connectedOrgConfigs/{orgId}/roleMappings/{id}',
          'delete',
          'x-xgen-operation-id-override',
        ],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-108-valid-operation-id',
        message: "The operation ID override must end with the noun 'Mapping'. ",
        path: [
          'paths',
          '/api/atlas/v2/federationSettings/{federationSettingsId}/connectedOrgConfigs/{orgId}/roleMappings/{id}',
          'delete',
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
        '/api/atlas/v2/groups/{groupId}/serverless': {
          delete: {
            operationId: 'deleteGroupServerlessInstance',
            'x-xgen-method-verb-override': {
              verb: 'deleteInstance',
              customMethod: false,
            },
            'x-xgen-operation-id-override': 'deleteServerlessInstance',
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
          post: {
            operationId: 'deleteRollingIndex',
            'x-xgen-IPA-exception': {
              'xgen-IPA-108-valid-operation-id': 'Reason',
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
        '/api/atlas/v2/groups/{groupId}/clusters/{clusterName}/fts/indexes/{indexId}': {
          delete: {
            operationId: 'deleteGroupClusterFtsIndex',
            'x-xgen-operation-id-override': 'deleteClusterFtsIndex',
          },
        },
      },
    },
    errors: [],
  },
]);
