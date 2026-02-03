import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-106-valid-operation-id', [
  {
    name: 'valid methods',
    document: {
      paths: {
        '/groups/{groupId}/clusters': {
          post: {
            operationId: 'createGroupCluster',
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
        '/api/atlas/v2/groups/{groupId}/access': {
          post: {
            operationId: 'addUserToProject',
          },
        },
        '/api/atlas/v2/groups/{groupId}/invites': {
          post: {
            operationId: 'createProjectInvitation',
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-106-valid-operation-id',
        message: "Invalid OperationID. Found 'addUserToProject', expected 'createGroupAccess'. ",
        path: ['paths', '/api/atlas/v2/groups/{groupId}/access', 'post', 'operationId'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-106-valid-operation-id',
        message: "Invalid OperationID. Found 'createProjectInvitation', expected 'createGroupInvite'. ",
        path: ['paths', '/api/atlas/v2/groups/{groupId}/invites', 'post', 'operationId'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'invalid methods with too long opIDs',
    document: {
      paths: {
        '/api/atlas/v2/orgs/{orgId}/serviceAccounts/{clientId}/accessList': {
          post: {
            operationId: 'createServiceAccountAccessList',
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-106-valid-operation-id',
        message:
          "Invalid OperationID. Found 'createServiceAccountAccessList', expected 'createOrgServiceAccountAccessList'. ",
        path: ['paths', '/api/atlas/v2/orgs/{orgId}/serviceAccounts/{clientId}/accessList', 'post', 'operationId'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'valid methods with valid overrides',
    document: {
      paths: {
        '/api/atlas/v2/federationSettings/{federationSettingsId}/connectedOrgConfigs/{orgId}/roleMappings': {
          post: {
            operationId: 'createFederationSettingConnectedOrgConfigRoleMapping',
            'x-xgen-operation-id-override': 'createRoleMapping',
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
        '/api/atlas/v2/federationSettings/{federationSettingsId}/connectedOrgConfigs/{orgId}/roleMappings': {
          post: {
            operationId: 'createFederationSettingConnectedOrgConfigRoleMapping',
            'x-xgen-operation-id-override': 'createSettingIDConfigTest',
          },
        },
      },
    },
    errors: [
      // Note: Override length error is now checked by xgen-IPA-106-operation-id-length rule, not this rule
      {
        code: 'xgen-IPA-106-valid-operation-id',
        message:
          "The operation ID override must only contain nouns from the operation ID 'createFederationSettingConnectedOrgConfigRoleMapping'. ",
        path: [
          'paths',
          '/api/atlas/v2/federationSettings/{federationSettingsId}/connectedOrgConfigs/{orgId}/roleMappings',
          'post',
          'x-xgen-operation-id-override',
        ],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-106-valid-operation-id',
        message: "The operation ID override must end with the noun 'Mapping'. ",
        path: [
          'paths',
          '/api/atlas/v2/federationSettings/{federationSettingsId}/connectedOrgConfigs/{orgId}/roleMappings',
          'post',
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
          post: {
            operationId: 'createGroupServerlessInstance',
            'x-xgen-method-verb-override': {
              verb: 'createInstance',
              customMethod: false,
            },
            'x-xgen-operation-id-override': 'createServerlessInstance',
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
            operationId: 'createRollingIndex',
            'x-xgen-IPA-exception': {
              'xgen-IPA-106-valid-operation-id': 'Reason',
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
        '/api/atlas/v2/groups/{groupId}/clusters/{clusterName}/fts/indexes': {
          post: {
            operationId: 'createGroupClusterFtsIndex',
            'x-xgen-operation-id-override': 'createClusterFtsIndex',
          },
        },
      },
    },
    errors: [],
  },
]);
