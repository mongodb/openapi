import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

// TODO: add tests for xgen-custom-method extension - CLOUDP-306294

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
    name: 'invalid methods',
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
        message:
          "Invalid OperationID. Found 'addUserToProject', expected 'createGroupAccess'. https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-106-valid-operation-id",
        path: ['paths', '/api/atlas/v2/groups/{groupId}/access', 'post', 'operationId'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-106-valid-operation-id',
        message:
          "Invalid OperationID. Found 'createProjectInvitation', expected 'createGroupInvite'. https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-106-valid-operation-id",
        path: ['paths', '/api/atlas/v2/groups/{groupId}/invites', 'post', 'operationId'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
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
]);
