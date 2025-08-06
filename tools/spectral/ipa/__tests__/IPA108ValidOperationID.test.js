import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

// TODO: add tests for xgen-custom-method extension - CLOUDP-306294

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
    name: 'invalid methods',
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
        message: 'Invalid OperationID. ',
        path: ['paths', '/api/atlas/v2/groups/{groupId}/apiKeys/{apiUserId}', 'delete', 'operationId'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-108-valid-operation-id',
        message: 'Invalid OperationID. ',
        path: ['paths', '/api/atlas/v2/groups/{groupId}', 'delete', 'operationId'],
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
]);
